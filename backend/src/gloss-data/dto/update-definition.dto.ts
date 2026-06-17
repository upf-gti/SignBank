import { IsString, IsNotEmpty, IsOptional, IsEnum, IsNumber } from 'class-validator';
import { Language, LexicalCategory } from '@prisma/client';

export class UpdateDefinitionDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsNotEmpty()
  definition: string;

  @IsString()
  @IsOptional()
  videoDefinitionId?: string;

  @IsEnum(LexicalCategory)
  @IsOptional()
  lexicalCategory?: LexicalCategory;

  @IsNumber()
  @IsOptional()
  priority?: number;
}

export class UpdateDefinitionTranslationDto {
  @IsString()
  @IsNotEmpty()
  translation: string;

  @IsEnum(Language)
  language: Language;
} 