import {
  BadRequestException,
  Controller,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  Body,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { JwtGuard } from '../auth/guard/jwt.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { Roles } from '../auth/decorator/roles.decorator';
import { Role } from '@prisma/client';
import { BulkImportService } from './bulk-import.service';

@Controller('bulk-import')
@UseGuards(JwtGuard, RolesGuard)
@Roles(Role.ADMIN)
export class BulkImportController {
  constructor(private readonly bulkImportService: BulkImportService) {}

  @Post()
  @UseInterceptors(
    FilesInterceptor('files', 2000, {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async importFitxas(
    @UploadedFiles() files: Express.Multer.File[],
    @Body('overwriteAll') overwriteAll?: string,
    @Body('overwriteGlosses') overwriteGlosses?: string | string[],
  ) {
    if (!files?.length) {
      throw new BadRequestException('At least one JSON file is required');
    }

    const jsonFiles = files.filter((file) =>
      file.originalname.toLowerCase().endsWith('.json'),
    );
    if (!jsonFiles.length) {
      throw new BadRequestException('Upload JSON files only');
    }

    return this.bulkImportService.importFiles(
      jsonFiles,
      overwriteAll === 'true',
      this.parseOverwriteGlosses(overwriteGlosses),
    );
  }

  private parseOverwriteGlosses(value?: string | string[]): string[] {
    if (!value) return [];
    const items = Array.isArray(value) ? value : [value];
    return items.flatMap((item) => {
      try {
        const parsed = JSON.parse(item);
        return Array.isArray(parsed) ? parsed.map(String) : [String(parsed)];
      } catch {
        return item.split(',').map((part) => part.trim()).filter(Boolean);
      }
    });
  }
}
