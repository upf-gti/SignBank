import { Type } from 'class-transformer';
import { IsString, IsOptional, IsBoolean, IsArray, ValidateNested, ArrayMinSize, IsNumber, IsNotEmpty, IsEnum } from 'class-validator';

// Define enums locally instead of importing from Prisma
export enum Hand {
  RIGHT = 'RIGHT',
  LEFT = 'LEFT',
  BOTH = 'BOTH'
}

export enum Language {
  CATALAN = 'CATALAN',
  SPANISH = 'SPANISH',
  ENGLISH = 'ENGLISH',
  OTHER = 'OTHER'
}

export enum LexicalCategory {
  NOUN = 'NOUN',
  VERB = 'VERB',
  ADJECTIVE = 'ADJECTIVE',
  ADVERB = 'ADVERB',
  PRONOUN = 'PRONOUN',
  DETERMINER = 'DETERMINER',
  PREPOSITION = 'PREPOSITION',
  CONJUNCTION = 'CONJUNCTION',
  INTERJECTION = 'INTERJECTION',
  OTHER = 'OTHER'
}

export enum RelationType {
  SYNONYM = 'SYNONYM',
  REGIONAL_VARIANT = 'REGIONAL_VARIANT',
  ASSOCIATED_CONCEPT = 'ASSOCIATED_CONCEPT',
  ANTONYM = 'ANTONYM',
  HYPERNYM = 'HYPERNYM',
  HYPONYM = 'HYPONYM'
}

// Define types for embedded documents that match the Prisma schema
export class SenseTranslationDto {
  @IsString()
  @IsNotEmpty()
  translation: string;

  @IsEnum(Language)
  @IsNotEmpty()
  language: Language;
}

export class DefinitionDto {
  @IsString()
  @IsNotEmpty()
  definition: string;

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
  @IsEnum(Hand)
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
  @Type(() => DefinitionDto)
  @ArrayMinSize(1)
  definitions: DefinitionDto[];

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
  @IsEnum(LexicalCategory)
  lexicalCategory?: LexicalCategory;
}

export class RelatedWordDto {
  @IsString()
  @IsNotEmpty()
  wordId: string;
  
  @IsEnum(RelationType)
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
