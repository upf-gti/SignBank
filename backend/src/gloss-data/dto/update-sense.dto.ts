import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';
import { LexicalCategory } from '@prisma/client';

export class UpdateSenseDto {
  @IsString()
  @IsNotEmpty()
  senseTitle: string;

  @IsString()
  @IsNotEmpty()
  lexicalCategory: LexicalCategory;

  @IsNumber()
  @IsOptional()
  priority?: number;
}

export class ReorderSenseDto {
  @IsString()
  @IsNotEmpty()
  senseId: string;

  @IsNotEmpty()
  newPriority: number;
} 