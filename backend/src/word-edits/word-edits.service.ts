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

} 