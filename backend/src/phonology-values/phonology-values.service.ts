import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PhonologyDimension, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ensurePhonologyCatalog } from './phonology-catalog.seed';
import { CreatePhonologyValueDto } from './dto/create-phonology-value.dto';
import { UpdatePhonologyValueDto } from './dto/update-phonology-value.dto';
import { QueryPhonologyValuesDto } from './dto/query-phonology-values.dto';
import {
  FIELD_TO_DIMENSION,
  normalizePhonologyCode,
  PHONOLOGY_CODE_PATTERN,
  VIDEO_DATA_ID_FIELDS_BY_DIMENSION,
  VideoDataPhonologyInput,
} from './phonology-fields';
import { GLOSS_SEARCH_SYNC_EVENT } from '../typesense/types/gloss-index.type';

@Injectable()
export class PhonologyValuesService implements OnModuleInit {
  private readonly logger = new Logger(PhonologyValuesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async onModuleInit() {
    const created = await ensurePhonologyCatalog(this.prisma);
    if (created > 0) {
      this.logger.log(`Seeded ${created} phonology catalog values`);
    }
  }

  async findAll(query: QueryPhonologyValuesDto) {
    const values = await this.prisma.phonologyValue.findMany({
      where: {
        ...(query.dimension ? { dimension: query.dimension } : {}),
        ...(query.includeInactive ? {} : { active: true }),
      },
      orderBy: [{ dimension: 'asc' }, { sortOrder: 'asc' }, { code: 'asc' }],
    });

    if (!query.withUsage) return values;

    const usage = await this.usageByDimensionAndCode();
    return values.map((value) => ({
      ...value,
      usageCount: usage.get(`${value.dimension}:${value.code}`) ?? 0,
    }));
  }

  async create(dto: CreatePhonologyValueDto) {
    const code = this.requireValidCode(dto.code);
    await this.assertCodeAvailable(dto.dimension, code);
    const labelCa = dto.labelCa.trim();
    if (!labelCa) {
      throw new BadRequestException('Catalan label is required');
    }
    try {
      return await this.prisma.phonologyValue.create({
        data: {
          dimension: dto.dimension,
          code,
          labelCa,
          labelEn: dto.labelEn?.trim() || null,
          labelEs: dto.labelEs?.trim() || null,
          descriptionCa: dto.descriptionCa?.trim() || null,
          descriptionEn: dto.descriptionEn?.trim() || null,
          descriptionEs: dto.descriptionEs?.trim() || null,
          aliases: this.normalizeAliases(dto.aliases),
          sortOrder: dto.sortOrder ?? (await this.nextSortOrder(dto.dimension)),
          active: dto.active ?? true,
        },
      });
    } catch (error) {
      this.rethrowUnique(error);
    }
  }

  async update(id: string, dto: UpdatePhonologyValueDto) {
    const existing = await this.prisma.phonologyValue.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Phonology value ${id} not found`);
    }

    const data: Prisma.PhonologyValueUpdateInput = {};
    if (dto.labelCa !== undefined) {
      const labelCa = dto.labelCa.trim();
      if (!labelCa) {
        throw new BadRequestException('Catalan label is required');
      }
      data.labelCa = labelCa;
    }
    if (dto.labelEn !== undefined) data.labelEn = dto.labelEn.trim() || null;
    if (dto.labelEs !== undefined) data.labelEs = dto.labelEs.trim() || null;
    if (dto.descriptionCa !== undefined) data.descriptionCa = dto.descriptionCa.trim() || null;
    if (dto.descriptionEn !== undefined) data.descriptionEn = dto.descriptionEn.trim() || null;
    if (dto.descriptionEs !== undefined) data.descriptionEs = dto.descriptionEs.trim() || null;
    if (dto.aliases !== undefined) data.aliases = this.normalizeAliases(dto.aliases);
    if (dto.sortOrder !== undefined) data.sortOrder = dto.sortOrder;
    if (dto.active !== undefined) data.active = dto.active;

    if (dto.code !== undefined) {
      const code = this.requireValidCode(dto.code);
      if (code !== existing.code) {
        await this.assertCodeAvailable(existing.dimension, code, existing.id);
        data.code = code;
      }
    }

    try {
      return await this.prisma.phonologyValue.update({ where: { id }, data });
    } catch (error) {
      this.rethrowUnique(error);
    }
  }

  async remove(id: string, confirmCode?: string) {
    const existing = await this.prisma.phonologyValue.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Phonology value ${id} not found`);
    }

    const usageCount = await this.countUsage(existing.dimension, existing.code);
    if (usageCount > 0) {
      const expected = existing.code;
      const provided = confirmCode ? normalizePhonologyCode(confirmCode) : '';
      if (provided !== expected) {
        throw new BadRequestException(
          `This value is used by ${usageCount} phonology record(s). Confirm deletion by sending confirmCode=${expected}`,
        );
      }
    }

    const glossDataIds = await this.prisma.$transaction(async (tx) => {
      const affectedIds = usageCount > 0 ? await this.findAffectedGlossIds(tx, existing) : [];
      if (usageCount > 0) {
        await this.clearUsages(tx, existing);
      }
      await tx.phonologyValue.delete({ where: { id } });
      return affectedIds;
    });

    for (const glossDataId of glossDataIds) {
      this.eventEmitter.emit(GLOSS_SEARCH_SYNC_EVENT, { glossDataId });
    }

    return { id, deleted: true, clearedUsage: usageCount };
  }

  async assertVideoDataCodes(videoData: VideoDataPhonologyInput) {
    const required: Array<[keyof VideoDataPhonologyInput, string]> = [];
    for (const [field, dimension] of Object.entries(FIELD_TO_DIMENSION) as Array<
      [keyof VideoDataPhonologyInput, PhonologyDimension]
    >) {
      const value = videoData[field];
      if (value == null || value === '') continue;
      required.push([field, value]);
      void dimension;
    }
    if (required.length === 0) return;

    const codesByDimension = new Map<PhonologyDimension, Set<string>>();
    for (const [field, code] of required) {
      const dimension = FIELD_TO_DIMENSION[field];
      if (!codesByDimension.has(dimension)) codesByDimension.set(dimension, new Set());
      codesByDimension.get(dimension)!.add(code);
    }

    const found = await this.prisma.phonologyValue.findMany({
      where: {
        OR: [...codesByDimension.entries()].map(([dimension, codes]) => ({
          dimension,
          code: { in: [...codes] },
        })),
      },
      select: { dimension: true, code: true, active: true },
    });
    const foundSet = new Set(found.map((row) => `${row.dimension}:${row.code}`));

    for (const [field, code] of required) {
      const dimension = FIELD_TO_DIMENSION[field];
      if (!foundSet.has(`${dimension}:${code}`)) {
        throw new BadRequestException(`Unknown ${field} value: ${code}`);
      }
    }
  }

  async countUsage(dimension: PhonologyDimension, code: string): Promise<number> {
    const value = await this.prisma.phonologyValue.findUnique({
      where: { dimension_code: { dimension, code } },
      select: { id: true },
    });
    if (!value) return 0;

    const fields = VIDEO_DATA_ID_FIELDS_BY_DIMENSION[dimension];
    const counts = await Promise.all(
      fields.map((field) =>
        this.prisma.videoData.count({
          where: { [field]: value.id },
        }),
      ),
    );
    return counts.reduce((sum, count) => sum + count, 0);
  }

  private async usageByDimensionAndCode(): Promise<Map<string, number>> {
    const usage = new Map<string, number>();
    const values = await this.prisma.phonologyValue.findMany({
      select: { id: true, dimension: true, code: true },
    });
    const byId = new Map(values.map((value) => [value.id, value]));

    await Promise.all(
      (Object.entries(VIDEO_DATA_ID_FIELDS_BY_DIMENSION) as Array<
        [PhonologyDimension, string[]]
      >).map(async ([, fields]) => {
        for (const field of fields) {
          const groups = await this.prisma.videoData.groupBy({
            by: [field as Prisma.VideoDataScalarFieldEnum],
            _count: { _all: true },
          });
          for (const group of groups) {
            const id = group[field as keyof typeof group] as string | null;
            if (!id) continue;
            const value = byId.get(id);
            if (!value) continue;
            const key = `${value.dimension}:${value.code}`;
            usage.set(key, (usage.get(key) ?? 0) + group._count._all);
          }
        }
      }),
    );

    return usage;
  }

  private async assertCodeAvailable(
    dimension: PhonologyDimension,
    code: string,
    excludeId?: string,
  ) {
    const existing = await this.prisma.phonologyValue.findUnique({
      where: { dimension_code: { dimension, code } },
      select: { id: true },
    });
    if (existing && existing.id !== excludeId) {
      throw new ConflictException(`A value with code ${code} already exists in this dimension`);
    }
  }

  private async clearUsages(
    tx: Prisma.TransactionClient,
    value: { id: string; dimension: PhonologyDimension },
  ) {
    const fields = VIDEO_DATA_ID_FIELDS_BY_DIMENSION[value.dimension];
    for (const field of fields) {
      await tx.videoData.updateMany({
        where: { [field]: value.id },
        data: { [field]: null },
      });
    }
  }

  private async findAffectedGlossIds(
    tx: Prisma.TransactionClient,
    value: { id: string; dimension: PhonologyDimension },
  ): Promise<string[]> {
    const fields = VIDEO_DATA_ID_FIELDS_BY_DIMENSION[value.dimension];
    const or = fields.map((field) => ({ [field]: value.id }));
    const [signVideos, compoundParts] = await Promise.all([
      tx.signVideo.findMany({
        where: { videoData: { OR: or } },
        select: { glossDataId: true },
      }),
      tx.compoundPart.findMany({
        where: { inlinePhonology: { OR: or } },
        select: { glossDataId: true },
      }),
    ]);
    return [
      ...new Set(
        [...signVideos, ...compoundParts]
          .map((row) => row.glossDataId)
          .filter((id): id is string => Boolean(id)),
      ),
    ];
  }

  private async nextSortOrder(dimension: PhonologyDimension): Promise<number> {
    const last = await this.prisma.phonologyValue.findFirst({
      where: { dimension },
      orderBy: { sortOrder: 'desc' },
      select: { sortOrder: true },
    });
    return (last?.sortOrder ?? -1) + 1;
  }

  private requireValidCode(code: string): string {
    const normalized = normalizePhonologyCode(code);
    if (!PHONOLOGY_CODE_PATTERN.test(normalized)) {
      throw new BadRequestException(
        'Code must start with a letter or digit and contain only A-Z, 0-9 and underscore',
      );
    }
    return normalized;
  }

  private normalizeAliases(aliases?: string[]): string[] {
    if (!aliases) return [];
    return [...new Set(aliases.map((alias) => alias.trim()).filter(Boolean))];
  }

  private rethrowUnique(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new ConflictException('A value with this code already exists in this dimension');
    }
    throw error;
  }
}
