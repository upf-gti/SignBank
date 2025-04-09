import { Hand, Language, LexicalCategory, PrismaClient, RelationType } from "@prisma/client"
import { Type } from 'class-transformer';
import { IsString, IsOptional, IsBoolean, IsArray, ValidateNested, ArrayMinSize, IsNumber, IsNotEmpty } from 'class-validator';

// Define types for embedded documents that match the Prisma schema
export class SenseTranslationDto {
  @IsString()
  @IsNotEmpty()
  translation: string;

  @IsString()
  @IsNotEmpty()
  language: Language;
}

export class DescriptionDto {
  @IsString()
  @IsNotEmpty()
  description: string;

  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  examples: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SenseTranslationDto)
  translations: SenseTranslationDto[];
}

export class VideoDto {
  @IsString()
  url: string;

  @IsString()
  angle: string;
  
  @IsNumber()
  @IsOptional()
  priority: number;
  
  @IsOptional()
  dominantHand?: Hand;

  @IsOptional()
  @IsString()
  facialExpression?: string;

  @IsOptional()
  @IsBoolean()
  hasContact?: boolean;
}

export class SenseDto {
  @IsNumber()
  priority: number;

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
  @Type(() => VideoDto)
  @IsOptional()
  videos?: VideoDto[];
  
  @IsOptional()
  lexicalCategory?: LexicalCategory;
}

export class RelatedWordDto {
  @IsString()
  @IsNotEmpty()
  wordId: string;
  
  @IsNotEmpty()
  relationType: RelationType;
}

export class WordDataDto {
  @IsString()
  @IsNotEmpty()
  word: string;
  
  @IsBoolean()
  @IsOptional()
  isNative?: boolean = true;
  
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SenseDto)
  @ArrayMinSize(1)
  senses: SenseDto[];
  
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RelatedWordDto)
  @IsOptional()
  relatedWords?: RelatedWordDto[] = [];
  
  @IsOptional()
  @IsString()
  dialectId?: string;
}

export class CreateWordRequestDto {
  @ValidateNested()
  @Type(() => WordDataDto)
  requestedWordData: WordDataDto;
}
