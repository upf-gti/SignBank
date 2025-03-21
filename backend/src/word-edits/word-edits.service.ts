import { Injectable, NotFoundException, ForbiddenException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateWordEditDto } from './dto/create-word-edit.dto';
import { UpdateWordEditDto, EditStatus } from './dto/update-word-edit.dto';
import { TypesenseSyncService } from 'src/typesense/sync';
import { WordStatus } from '@prisma/client';

@Injectable()
export class WordEditsService {
  private readonly logger = new Logger(WordEditsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly typesenseSync: TypesenseSyncService,
  ) {}

  // Create a new word edit (creates a new word record as a copy with changes)
  async createWordEdit(wordId: number, userId: number, editData: any, comment: string) {
    // Check if word exists and is published
    const originalWord = await this.prisma.words.findUnique({
      where: { 
        id: wordId,
        status: WordStatus.PUBLISHED, // Only allow edits on published words
      },
      include: {
        videos: true,
        senses: {
          include: {
            Translation: true,
          },
        },
        translations: true,
        relatedWords: true,
      },
    });

    if (!originalWord) {
      throw new NotFoundException(`Word with ID ${wordId} not found or not in published state.`);
    }

    // Check if there's already a pending edit for this word
    const existingPendingEdits = await this.prisma.words.findFirst({
      where: {
        originalWordId: wordId,
        status: WordStatus.EDIT_REQUEST,
      },
    });

    if (existingPendingEdits) {
      throw new ConflictException(`There is already a pending edit for word with ID ${wordId}.`);
    }

    // Create a new word as a copy with the changes and track its relationship to original
    const { id: originalId, createdAt, updatedAt, ...wordDataWithoutIds } = originalWord;
    
    // Start a transaction to create the new word and its associated records
    return this.prisma.$transaction(async (tx) => {
      // Create the new word with edit changes
      const newWordData = {
        ...wordDataWithoutIds,
        ...editData, // Apply the edit changes
        status: WordStatus.EDIT_REQUEST, // Set status to indicate it's an edit request
        originalWordId: wordId, // Track the original word this edit is for
        editorId: userId, // Track who made this edit
        editComment: comment, // Store edit comment
      };

      // Create the new word
      const newWord = await tx.words.create({
        data: newWordData,
      });

      // Copy videos
      if (originalWord.videos && originalWord.videos.length > 0) {
        const videosData = originalWord.videos.map(video => {
          const { id, createdAt, updatedAt, wordId, ...videoData } = video;
          return {
            ...videoData,
            wordId: newWord.id,
          };
        });

        await tx.video.createMany({
          data: videosData,
        });
      }

      // Copy senses and their translations
      if (originalWord.senses && originalWord.senses.length > 0) {
        for (const sense of originalWord.senses) {
          const { id: senseId, createdAt, updatedAt, wordId, Translation, ...senseData } = sense;
          
          // Create sense
          const newSense = await tx.sense.create({
            data: {
              ...senseData,
              wordId: newWord.id,
            },
          });

          // Create translations for this sense
          if (Translation && Translation.length > 0) {
            const translationsData = Translation.map(translation => {
              const { id, createdAt, updatedAt, senseId, ...translationData } = translation;
              return {
                ...translationData,
                senseId: newSense.id,
              };
            });

            await tx.translation.createMany({
              data: translationsData,
            });
          }
        }
      }

      // Create word edit record to track the edit itself
      await tx.wordEdit.create({
        data: {
          wordId,
          editorId: userId,
          comment,
          status: EditStatus.PENDING,
          newWordVersionId: newWord.id,
        },
      });

      return newWord;
    });
  }

  // Approve a word edit - publish the new version and archive the old one
  async approveEdit(editId: number) {
    // Find the edit
    const edit = await this.prisma.wordEdit.findUnique({
      where: { id: editId },
      include: {
        word: true, // The original word
      },
    });

    if (!edit) {
      throw new NotFoundException(`Edit with ID ${editId} not found.`);
    }

    if (edit.status !== EditStatus.PENDING) {
      throw new ConflictException(`Edit has already been processed.`);
    }

    // Find the new word version
    const newWordVersion = await this.prisma.words.findFirst({
      where: { 
        id: edit.newWordVersionId,
        status: WordStatus.EDIT_REQUEST,
      },
    });

    if (!newWordVersion) {
      throw new NotFoundException(`New word version not found.`);
    }

    // Start a transaction to update statuses
    return this.prisma.$transaction(async (tx) => {
      // Archive the original word
      await tx.words.update({
        where: { id: edit.wordId },
        data: { status: WordStatus.ARCHIVED },
      });

      // Publish the new version
      const updatedWord = await tx.words.update({
        where: { id: newWordVersion.id },
        data: { status: WordStatus.PUBLISHED },
      });

      // Update the edit status
      await tx.wordEdit.update({
        where: { id: editId },
        data: { status: EditStatus.APPROVED },
      });

      // Sync to Typesense
      await this.typesenseSync.syncSingleWord(updatedWord.id);

      return updatedWord;
    });
  }

  // Reject a word edit
  async rejectEdit(editId: number, denyReason: string) {
    // Find the edit
    const edit = await this.prisma.wordEdit.findUnique({
      where: { id: editId },
    });

    if (!edit) {
      throw new NotFoundException(`Edit with ID ${editId} not found.`);
    }

    if (edit.status !== EditStatus.PENDING) {
      throw new ConflictException(`Edit has already been processed.`);
    }

    // Find the new word version
    const newWordVersion = await this.prisma.words.findFirst({
      where: { 
        id: edit.newWordVersionId,
        status: WordStatus.EDIT_REQUEST,
      },
    });

    // Start a transaction to update statuses
    return this.prisma.$transaction(async (tx) => {
      // Change the status of the new word version to REJECTED
      if (newWordVersion) {
        await tx.words.update({
          where: { id: newWordVersion.id },
          data: { status: WordStatus.REJECTED },
        });
      }

      // Update the edit status
      return tx.wordEdit.update({
        where: { id: editId },
        data: { 
          status: EditStatus.REJECTED,
          denyReason,
        },
      });
    });
  }

  // Get all edits for a word
  async getWordEdits(wordId: number) {
    return this.prisma.wordEdit.findMany({
      where: { wordId },
      include: {
        editor: {
          select: {
            id: true,
            username: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // Get all pending edits (for admin)
  async getPendingEdits() {
    return this.prisma.wordEdit.findMany({
      where: { status: EditStatus.PENDING },
      include: {
        word: {
          select: {
            id: true,
            word: true,
          },
        },
        editor: {
          select: {
            id: true,
            username: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // Get edit details by ID
  async getEditById(editId: number) {
    const edit = await this.prisma.wordEdit.findUnique({
      where: { id: editId },
      include: {
        word: true, // Original word
        editor: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    if (!edit) {
      throw new NotFoundException(`Edit with ID ${editId} not found.`);
    }

    // Get the new word version
    const newWordVersion = await this.prisma.words.findFirst({
      where: { 
        id: edit.newWordVersionId,
      },
      include: {
        videos: {
          orderBy: {
            priority: 'asc'
          }
        },
        senses: {
          include: {
            Translation: true
          },
          orderBy: {
            priority: 'asc'
          }
        },
        translations: true,
        dialect: true,
      },
    });

    return {
      edit,
      originalWord: edit.word,
      newWordVersion,
    };
  }
} 