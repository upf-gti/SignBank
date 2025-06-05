import { Language } from '@prisma/client'
import { IsString, IsOptional, IsEnum } from 'class-validator';

export class CreateDefinitionDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  definition: string;
}

export class UpdateDefinitionDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  definition?: string;
}

export class UpdateDefinitionTranslationDto {
  @IsString()
  translation: string;

  @IsEnum(Language)
  language: Language;
} 