import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateWordEditDto } from './dto/create-word-edit.dto';
import { UpdateWordEditDto, EditStatus } from './dto/update-word-edit.dto';
import { TypesenseSyncService } from 'src/typesense/sync';

@Injectable()
export class WordEditsService {
  private readonly logger = new Logger(WordEditsService.name);

  constructor(
    private prisma: PrismaService,
    private typesenseSync: TypesenseSyncService
  ) {}

  async create(userId: number, dto: CreateWordEditDto) {
    // Check if the word exists and user has permission to edit it
    const word = await this.prisma.words.findUnique({
      where: { id: dto.wordId },
      select: { id: true, creatorId: true, status: true }
    });

    if (!word) {
      throw new NotFoundException(`Word with ID ${dto.wordId} not found.`);
    }

    // Create the edit
    try {
      return await this.prisma.wordEdit.create({
        data: {
          wordId: dto.wordId,
          editorId: userId,
          editData: dto.editData,
          comment: dto.comment,
          status: 'PENDING',
        },
        include: {
          editor: {
            select: {
              id: true,
              username: true,
            },
          },
          word: {
            select: {
              id: true,
              word: true,
            },
          },
        },
      });
    } catch (error) {
      this.logger.error(`Error creating word edit: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findAll(status?: EditStatus) {
    const where = status ? { status } : {};
    
    return this.prisma.wordEdit.findMany({
      where,
      include: {
        editor: {
          select: {
            id: true,
            username: true,
          },
        },
        word: {
          select: {
            id: true,
            word: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findUserEdits(userId: number) {
    return this.prisma.wordEdit.findMany({
      where: {
        editorId: userId,
      },
      include: {
        word: {
          select: {
            id: true,
            word: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: number) {
    const edit = await this.prisma.wordEdit.findUnique({
      where: { id },
      include: {
        editor: {
          select: {
            id: true,
            username: true,
          },
        },
        word: {
          select: {
            id: true,
            word: true,
            description: true,
          },
        },
      },
    });

    if (!edit) {
      throw new NotFoundException(`Edit with ID ${id} not found.`);
    }

    return edit;
  }

  async updateStatus(id: number, dto: UpdateWordEditDto) {
    const edit = await this.prisma.wordEdit.findUnique({
      where: { id },
      include: {
        word: true,
      },
    });

    if (!edit) {
      throw new NotFoundException(`Edit with ID ${id} not found.`);
    }

    // Update the edit status
    const updatedEdit = await this.prisma.wordEdit.update({
      where: { id },
      data: {
        status: dto.status,
        denyReason: dto.denyReason,
      },
    });

    // If approved and applyChanges is true, apply the changes to the word
    if (dto.status === EditStatus.APPROVED && dto.applyChanges) {
      try {
        // Apply the changes from editData to the word
        const editData = edit.editData as Record<string, any>;
        
        // Ensure editData is valid
        if (!editData || typeof editData !== 'object') {
          throw new Error('Invalid edit data format');
        }
        
        // Update the word with the edited fields
        const updatedWord = await this.prisma.words.update({
          where: { id: edit.wordId },
          data: editData,
        });
        
        // Sync the updated word to Typesense
        await this.typesenseSync.syncSingleWord(updatedWord.id);
        
        this.logger.log(`Applied edit ${id} to word ${edit.wordId}`);
        return { ...updatedEdit, wordUpdated: true };
      } catch (error) {
        this.logger.error(`Error applying edit ${id}: ${error.message}`, error.stack);
        // Return the edit status update but indicate the word update failed
        return { ...updatedEdit, wordUpdated: false, error: error.message };
      }
    }

    return updatedEdit;
  }
} 