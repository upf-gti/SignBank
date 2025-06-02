import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { Language } from '@prisma/client';

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
}

export class UpdateDefinitionTranslationDto {
  @IsString()
  @IsNotEmpty()
  translation: string;

  @IsEnum(Language)
  language: Language;
} 