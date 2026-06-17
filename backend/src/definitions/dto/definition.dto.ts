import { Language, LexicalCategory } from '@prisma/client'
import { IsString, IsNotEmpty, IsOptional, IsEnum, IsNumber } from 'class-validator';

export class CreateDefinitionDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsNotEmpty()
  definition: string;

  @IsString()
  @IsOptional()
  videoDefinitionUrl?: string;

  @IsEnum(LexicalCategory)
  @IsOptional()
  lexicalCategory?: LexicalCategory;

  @IsNumber()
  @IsOptional()
  priority?: number;
}

export class UpdateDefinitionDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  definition?: string;

  @IsString()
  @IsOptional()
  videoDefinitionUrl?: string;

  @IsEnum(LexicalCategory)
  @IsOptional()
  lexicalCategory?: LexicalCategory;

  @IsNumber()
  @IsOptional()
  priority?: number;
}

export class CreateDefinitionTranslationDto {
  @IsString()
  @IsNotEmpty()
  translation: string;

  @IsEnum(Language)
  language: Language;
}

export class UpdateDefinitionTranslationDto {
  @IsString()
  @IsNotEmpty()
  translation: string;

  @IsEnum(Language)
  language: Language;
} 