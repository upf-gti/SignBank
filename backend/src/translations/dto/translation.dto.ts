import { IsString, IsEnum } from 'class-validator';
import { Language } from '@prisma/client';

export class CreateTranslationDto {
  @IsString()
  translation: string;

  @IsEnum(Language)
  language: Language;
}

export class UpdateTranslationDto {
  @IsString()
  translation: string;

  @IsEnum(Language)
  language: Language;
} 