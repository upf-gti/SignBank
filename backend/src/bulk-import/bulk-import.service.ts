import { Injectable, Logger } from '@nestjs/common';
import {
  GlossStatus,
  Language,
  LexicalCategory,
  Prisma,
  RelationType,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { TypesenseService } from '../typesense/typesense.service';
import { mapFitxa, extractFitxas } from './fitxa-mapper';
import type {
  BulkImportResult,
  ImportIssue,
  MappedCompoundPart,
  MappedFitxa,
  MappedPhonology,
} from './fitxa.types';
import { videoDataFromCodes } from '../phonology-values/phonology-video-data';

type UploadedJsonFile = {
  originalname: string;
  buffer: Buffer;
};

type GlossIndexEntry = {
  id: string;
  gloss: string;
  isStub: boolean;
};

@Injectable()
export class BulkImportService {
  private readonly logger = new Logger(BulkImportService.name);

  constructor(
    private prisma: PrismaService,
    private typesense: TypesenseService,
  ) {}

  async importFiles(
    files: UploadedJsonFile[],
    overwriteAll: boolean,
    overwriteGlosses: string[] = [],
  ): Promise<BulkImportResult> {
    const result: BulkImportResult = {
      created: 0,
      updated: 0,
      stubsCreated: 0,
      skipped: 0,
      relationsCreated: 0,
      errors: [],
      duplicates: [],
    };

    const overwriteKeys = new Set(overwriteGlosses.map((gloss) => this.glossKey(gloss)));
    const mapped = this.parseFiles(files, result.errors);
    const index = await this.loadGlossIndex();

    for (const fitxa of mapped) {
      if (overwriteKeys.size > 0 && !overwriteAll && !overwriteKeys.has(this.glossKey(fitxa.gloss))) {
        continue;
      }

      try {
        await this.importMappedFitxa(fitxa, overwriteAll, overwriteKeys, index, result);
      } catch (error) {
        this.logger.error(`Failed to import ${fitxa.gloss}`, error);
        result.errors.push({
          gloss: fitxa.gloss,
          fileName: fitxa.fileName,
          field: 'import',
          value: fitxa.gloss,
          message: error instanceof Error ? error.message : 'Unexpected import error',
        });
      }
    }

    const errorGlosses = new Set(
      result.errors.map((issue) => this.glossKey(issue.gloss)).filter(Boolean),
    );
    result.duplicates = result.duplicates.filter(
      (duplicate) => !errorGlosses.has(this.glossKey(duplicate.gloss)),
    );

    try {
      await this.typesense.syncAllVideos();
    } catch (error) {
      result.errors.push({
        gloss: '',
        fileName: '',
        field: 'search',
        value: '',
        message: error instanceof Error ? error.message : 'Typesense sync failed after import',
      });
    }

    return result;
  }

  private parseFiles(files: UploadedJsonFile[], errors: ImportIssue[]): MappedFitxa[] {
    const mapped: MappedFitxa[] = [];

    for (const file of files) {
      let parsed: unknown;
      try {
        parsed = JSON.parse(file.buffer.toString('utf8'));
      } catch {
        errors.push({
          gloss: '',
          fileName: file.originalname,
          field: 'file',
          value: file.originalname,
          message: 'Invalid JSON file',
        });
        continue;
      }

      const items = extractFitxas(parsed);
      if (!items.length) {
        errors.push({
          gloss: '',
          fileName: file.originalname,
          field: 'file',
          value: file.originalname,
          message: 'No fitxa entries found in JSON file',
        });
        continue;
      }

      for (const [index, item] of items.entries()) {
        const fileName =
          items.length > 1
            ? `${file.originalname}[${item.gloss_id || item.id || index}]`
            : file.originalname;
        const result = mapFitxa(item, fileName);
        if ('error' in result) {
          errors.push(result.error);
          continue;
        }
        mapped.push(result);
      }
    }

    return mapped;
  }

  private async loadGlossIndex(): Promise<Map<string, GlossIndexEntry>> {
    const glosses = await this.prisma.glossData.findMany({
      select: {
        id: true,
        gloss: true,
        definitions: { select: { id: true }, take: 1 },
        glossVideos: { select: { id: true }, take: 1 },
      },
    });

    const index = new Map<string, GlossIndexEntry>();
    for (const gloss of glosses) {
      index.set(this.glossKey(gloss.gloss), {
        id: gloss.id,
        gloss: gloss.gloss,
        isStub: gloss.definitions.length === 0 && gloss.glossVideos.length === 0,
      });
    }
    return index;
  }

  private async importMappedFitxa(
    fitxa: MappedFitxa,
    overwriteAll: boolean,
    overwriteKeys: Set<string>,
    index: Map<string, GlossIndexEntry>,
    result: BulkImportResult,
  ) {
    if (fitxa.issues.length > 0) {
      result.errors.push(...fitxa.issues);
      result.skipped += 1;
      return;
    }

    for (const linkedName of fitxa.linkedGlossNames) {
      const created = await this.ensureGloss(linkedName, index);
      if (created) {
        result.stubsCreated += 1;
      }
    }

    const key = this.glossKey(fitxa.gloss);
    const existing = index.get(key);
    const shouldOverwrite = overwriteAll || overwriteKeys.has(key);

    if (existing && !existing.isStub && !shouldOverwrite) {
      result.duplicates.push({
        gloss: fitxa.gloss,
        fileName: fitxa.fileName,
        existingGlossId: existing.id,
        reason: 'Gloss already exists and overwrite is disabled',
      });
      result.skipped += 1;
      return;
    }

    let glossId: string;
    if (!existing) {
      glossId = await this.createGloss(fitxa);
      index.set(key, { id: glossId, gloss: fitxa.gloss, isStub: false });
      result.created += 1;
    } else {
      await this.replaceGlossContent(existing.id, fitxa);
      existing.isStub = false;
      result.updated += 1;
      glossId = existing.id;
    }

    await this.ensureLinks(glossId, fitxa, index, result);
    await this.syncCompoundParts(glossId, fitxa, index, result);
  }

  private async ensureGloss(
    name: string,
    index: Map<string, GlossIndexEntry>,
  ): Promise<boolean> {
    const key = this.glossKey(name);
    if (index.has(key)) {
      return false;
    }

    const created = await this.prisma.glossData.create({
      data: {
        gloss: name,
        dictionaryEntry: {
          create: { status: GlossStatus.PUBLISHED },
        },
      },
    });

    index.set(key, { id: created.id, gloss: name, isStub: true });
    return true;
  }

  private async createGloss(fitxa: MappedFitxa): Promise<string> {
    const nested = this.glossNestedCreate(fitxa);
    const created = await this.prisma.glossData.create({
      data: {
        gloss: fitxa.gloss,
        externalId: fitxa.externalId,
        isCompound: fitxa.isCompound,
        iconicity: fitxa.iconicity,
        editComment: fitxa.notes,
        dictionaryEntry: {
          create: { status: GlossStatus.PUBLISHED },
        },
        glossTranslations: nested.glossTranslations,
        definitions: nested.definitions,
        glossVideos: nested.glossVideos,
      },
    });
    return created.id;
  }

  private async replaceGlossContent(glossDataId: string, fitxa: MappedFitxa) {
    await this.prisma.$transaction(async (tx) => {
      await this.clearGlossContent(tx, glossDataId);
      const nested = this.glossNestedCreate(fitxa);
      await tx.glossData.update({
        where: { id: glossDataId },
        data: {
          gloss: fitxa.gloss,
          externalId: fitxa.externalId,
          isCompound: fitxa.isCompound,
          iconicity: fitxa.iconicity,
          editComment: fitxa.notes,
          glossTranslations: nested.glossTranslations,
          definitions: nested.definitions,
          glossVideos: nested.glossVideos,
        },
      });

      const entry = await tx.dictionaryEntry.findUnique({
        where: { glossDataId },
      });
      if (!entry) {
        await tx.dictionaryEntry.create({
          data: { glossDataId, status: GlossStatus.PUBLISHED },
        });
      } else if (entry.status !== GlossStatus.PUBLISHED) {
        await tx.dictionaryEntry.update({
          where: { id: entry.id },
          data: { status: GlossStatus.PUBLISHED },
        });
      }
    });
  }

  private async clearGlossContent(tx: Prisma.TransactionClient, glossDataId: string) {
    const signVideos = await tx.signVideo.findMany({
      where: { glossDataId },
      select: { id: true, videoDataId: true },
    });

    if (signVideos.length > 0) {
      await tx.video.deleteMany({
        where: { signVideoId: { in: signVideos.map((video) => video.id) } },
      });
      await tx.signVideo.deleteMany({ where: { glossDataId } });
      await tx.videoData.deleteMany({
        where: { id: { in: signVideos.map((video) => video.videoDataId) } },
      });
    }

    await tx.definition.deleteMany({ where: { glossDataId } });
    await tx.example.deleteMany({ where: { glossDataId } });
    await tx.glossTranslation.deleteMany({ where: { glossDataId } });
    await tx.relatedGloss.deleteMany({ where: { sourceGlossId: glossDataId } });
    await tx.minimalPair.deleteMany({ where: { sourceGlossId: glossDataId } });
    await this.clearCompoundParts(tx, glossDataId);
  }

  private glossNestedCreate(fitxa: MappedFitxa) {
    return {
      glossTranslations: {
        create: fitxa.translations.map((translation) => ({
          translation: translation.translation,
          language: translation.language as Language,
        })),
      },
      definitions: {
        create: fitxa.definitions.map((definition, index) => ({
          title: definition.title,
          definition: definition.definition,
          lexicalCategory: definition.lexicalCategory as LexicalCategory,
          priority: index + 1,
          definitionTranslations: {
            create: [{ translation: definition.definition, language: Language.CATALAN }],
          },
        })),
      },
      glossVideos: fitxa.phonology
        ? {
            create: [this.signVideoCreate(fitxa.gloss, fitxa.phonology, fitxa.videoUrl)],
          }
        : undefined,
    };
  }

  private signVideoCreate(gloss: string, phonology: MappedPhonology, videoUrl: string | null) {
    return {
      title: gloss,
      priority: 0,
      videoData: {
        create: this.videoDataCreate(phonology),
      },
      videos: videoUrl
        ? {
            create: [{ url: videoUrl, angle: 'front', priority: 0 }],
          }
        : undefined,
    };
  }

  private videoDataCreate(phonology: MappedPhonology) {
    return videoDataFromCodes(phonology);
  }

  private async ensureLinks(
    sourceId: string,
    fitxa: MappedFitxa,
    index: Map<string, GlossIndexEntry>,
    result: BulkImportResult,
  ) {
    for (const relation of fitxa.relations) {
      const created = await this.ensureGloss(relation.targetGloss, index);
      if (created) {
        result.stubsCreated += 1;
      }

      const target = index.get(this.glossKey(relation.targetGloss));
      if (!target || target.id === sourceId) continue;

      try {
        await this.prisma.relatedGloss.upsert({
          where: {
            sourceGlossId_targetGlossId: {
              sourceGlossId: sourceId,
              targetGlossId: target.id,
            },
          },
          update: { relationType: relation.type as RelationType },
          create: {
            sourceGlossId: sourceId,
            targetGlossId: target.id,
            relationType: relation.type as RelationType,
          },
        });
        result.relationsCreated += 1;
      } catch (error) {
        result.errors.push({
          gloss: fitxa.gloss,
          fileName: fitxa.fileName,
          field: 'related_signs',
          value: relation.targetGloss,
          message: error instanceof Error ? error.message : 'Failed to create relation',
        });
      }
    }

    for (const pair of fitxa.minimalPairs) {
      const created = await this.ensureGloss(pair.targetGloss, index);
      if (created) {
        result.stubsCreated += 1;
      }

      const target = index.get(this.glossKey(pair.targetGloss));
      if (!target || target.id === sourceId) continue;

      try {
        await this.prisma.minimalPair.upsert({
          where: {
            sourceGlossId_targetGlossId: {
              sourceGlossId: sourceId,
              targetGlossId: target.id,
            },
          },
          update: { distinction: pair.distinction },
          create: {
            sourceGlossId: sourceId,
            targetGlossId: target.id,
            distinction: pair.distinction,
          },
        });
      } catch (error) {
        result.errors.push({
          gloss: fitxa.gloss,
          fileName: fitxa.fileName,
          field: 'minimal_pairs',
          value: pair.targetGloss,
          message: error instanceof Error ? error.message : 'Failed to create minimal pair',
        });
      }
    }
  }

  private async clearCompoundParts(tx: Prisma.TransactionClient, glossDataId: string) {
    const parts = await tx.compoundPart.findMany({
      where: { glossDataId },
      select: { id: true, inlinePhonologyId: true, inlineSignVideoId: true },
    });
    if (!parts.length) return;

    const signVideoIds = parts
      .map((part) => part.inlineSignVideoId)
      .filter((id): id is string => Boolean(id));
    if (signVideoIds.length) {
      await tx.video.deleteMany({ where: { signVideoId: { in: signVideoIds } } });
      await tx.signVideo.deleteMany({ where: { id: { in: signVideoIds } } });
    }

    await tx.compoundPart.deleteMany({ where: { glossDataId } });

    const phonologyIds = parts
      .map((part) => part.inlinePhonologyId)
      .filter((id): id is string => Boolean(id));
    if (phonologyIds.length) {
      await tx.videoData.deleteMany({ where: { id: { in: phonologyIds } } });
    }
  }

  private async syncCompoundParts(
    glossDataId: string,
    fitxa: MappedFitxa,
    index: Map<string, GlossIndexEntry>,
    result: BulkImportResult,
  ) {
    await this.prisma.glossData.update({
      where: { id: glossDataId },
      data: { isCompound: fitxa.isCompound },
    });

    if (!fitxa.isCompound || !fitxa.compoundParts.length) {
      await this.clearCompoundParts(this.prisma, glossDataId);
      return;
    }

    await this.clearCompoundParts(this.prisma, glossDataId);

    for (const part of fitxa.compoundParts) {
      try {
        await this.createCompoundPart(glossDataId, part, index);
      } catch (error) {
        result.errors.push({
          gloss: fitxa.gloss,
          fileName: fitxa.fileName,
          field: 'compound',
          value: part.gloss,
          message: error instanceof Error ? error.message : 'Failed to create compound part',
        });
      }
    }
  }

  private async createCompoundPart(
    glossDataId: string,
    part: MappedCompoundPart,
    index: Map<string, GlossIndexEntry>,
  ) {
    const linkedGlossId = part.linked
      ? index.get(this.glossKey(part.gloss))?.id ?? null
      : null;

    let inlinePhonologyId: string | undefined;
    if (!linkedGlossId && part.phonology) {
      const phonology = await this.prisma.videoData.create({
        data: this.videoDataCreate(part.phonology),
      });
      inlinePhonologyId = phonology.id;
    }

    await this.prisma.compoundPart.create({
      data: {
        glossDataId,
        position: part.position,
        gloss: part.gloss,
        compExternalId: part.compExternalId,
        redundant: part.redundant,
        linkedGlossId,
        inlinePhonologyId,
      },
    });
  }

  private glossKey(name: string): string {
    return name.trim().normalize('NFC').toUpperCase();
  }
}
