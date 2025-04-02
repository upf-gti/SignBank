import { Hand, Language, LexicalCategory } from "@prisma/client"
import { Type } from 'class-transformer';
import { IsString, IsOptional, IsBoolean, IsArray, ValidateNested, ArrayMinSize, IsNumber, IsNotEmpty } from 'class-validator';

// Define types for embedded documents that match the Prisma schema
export class SenseTranslationDto {
  @IsString()
  @IsNotEmpty()
  text: string;

  @IsString()
  @IsNotEmpty()
  language: Language;
}

export class DescriptionDto {
  @IsString()
  @IsNotEmpty()
  text: string;

  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  examples: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SenseTranslationDto)
  translations: SenseTranslationDto[];
}

export class VideoInfoDto {
  @IsString()
  url: string;

  @IsString()
  angle: string;

  @IsOptional()
  priority?: number;
}

export class SenseDto {
  @IsNumber()
  priority?: number;

  @IsOptional()
  dominantHand?: Hand;

  @IsOptional()
  @IsString()
  facialExpression?: string;

  @IsOptional()
  @IsBoolean()
  hasContact?: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DescriptionDto)
  @ArrayMinSize(1)
  descriptions: DescriptionDto[];

  @IsOptional()
  @IsString()
  morphologicalVariants?: string;

  @IsOptional()
  @IsString()
  movementType?: string;

  @IsOptional()
  @IsString()
  nonManualComponents?: string;

  @IsOptional()
  @IsString()
  phonologicalTranscription?: string;

  @IsOptional()
  @IsString()
  usageEra?: string;

  @IsOptional()
  @IsString()
  usageFrequency?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VideoInfoDto)
  @IsOptional()
  videos?: VideoInfoDto[];
}

export class CreateWordRequestDto {
  @IsString()
  @IsNotEmpty()
  word: string;

  @IsOptional()
  dialectId?: string;

  @IsOptional()
  dominantHand?: Hand;

  @IsOptional()
  @IsString()
  facialExpression?: string;

  @IsOptional()
  @IsBoolean()
  hasContact?: boolean;

  @IsOptional()
  @IsBoolean()
  isNative?: boolean;

  @IsOptional()
  lexicalCategory?: LexicalCategory;

  @IsOptional()
  @IsString()
  register?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SenseDto)
  @ArrayMinSize(1)
  senses: SenseDto[];
}
