import { IsString, IsEnum } from 'class-validator';
import { Language } from '@prisma/client';

export class CreateExampleTranslationDto {
  @IsString()
  translation: string;

  @IsEnum(Language)
  language: Language;
}

export class UpdateExampleTranslationDto {
  @IsString()
  translation: string;

  @IsEnum(Language)
  language: Language;
} 