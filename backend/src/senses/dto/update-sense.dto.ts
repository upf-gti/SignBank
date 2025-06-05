import { LexicalCategory } from '@prisma/client'
import { IsString, IsOptional, IsNumber, IsEnum } from 'class-validator';

export class UpdateSenseDto {
  @IsString()
  @IsOptional()
  senseTitle?: string;

  @IsEnum(LexicalCategory)
  @IsOptional()
  lexicalCategory?: LexicalCategory;

  @IsNumber()
  @IsOptional()
  priority?: number;
}

export class ReorderSenseDto {
  @IsString()
  senseId: string;

  @IsNumber()
  newPriority: number;
} 