import { IsString, IsOptional, ValidateNested, IsEnum, IsNotEmpty, ArrayNotEmpty, IsInt, Min } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { Language, LexicalCategory, Hand } from '@prisma/client';

export class VideoDataDto {
  @IsString()
  hands: Hand;

  @IsString()
  configuration: string;

  @IsString()
  configurationChanges: string;

  @IsString()
  relationBetweenArticulators: string;

  @IsString()
  location: string;

  @IsString()
  movementRelatedOrientation: string;

  @IsString()
  locationRelatedOrientation: string;

  @IsString()
  orientationChange: string;

  @IsString()
  contactType: string;

  @IsString()
  movementType: string;

  @IsString()
  vocalization: string;

  @IsString()
  nonManualComponent: string;

  @IsString()
  inicialization: string;
}

export class VideoDto {
  @IsString()
  url: string;

  @IsString()
  angle: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  priority?: number;
}

export class SignVideoDto {
  @IsString()
  title: string;

  @IsString()
  url: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  priority?: number;

  @ValidateNested()
  @Type(() => VideoDataDto)
  videoData: VideoDataDto;

  @ValidateNested({ each: true })
  @Type(() => VideoDto)
  videos: VideoDto[];
}

export class ExampleTranslationDto {
  @IsString()
  translation: string;

  @IsString()
  @Transform(({ value }) => value?.toUpperCase())
  language: Language;
}

export class ExampleDto {
  @IsString()
  example: string;

  @IsString()
  exampleVideoURL: string;

  @ValidateNested({ each: true })
  @Type(() => ExampleTranslationDto)
  exampleTranslations: ExampleTranslationDto[];
}

export class SenseTranslationDto {
  @IsString()
  translation: string;

  @IsString()
  @Transform(({ value }) => value?.toUpperCase())
  language: Language;
}

export class DefinitionTranslationDto {
  @IsString()
  translation: string;

  @IsString()
  @Transform(({ value }) => value?.toUpperCase())
  language: Language;
}

export class VideoDefinitionDto {
  @IsString()
  url: string;
}

export class DefinitionDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsNotEmpty()
  @IsString()
  definition: string;

  @ValidateNested({ each: true })
  @Type(() => DefinitionTranslationDto)
  definitionTranslations: DefinitionTranslationDto[];

  @ValidateNested({ each: true })
  @Type(() => VideoDefinitionDto)
  videoDefinition: VideoDefinitionDto;
}

export class SenseDto {
  @IsString()
  @IsOptional()
  senseTitle?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  priority?: number;

  @IsEnum(LexicalCategory)
  @Transform(({ value }) => value?.toUpperCase())
  lexicalCategory?: LexicalCategory;

  @ValidateNested({ each: true })
  @Type(() => SenseTranslationDto)
  senseTranslations: SenseTranslationDto[];

  @ValidateNested({ each: true })
  @Type(() => ExampleDto)
  examples: ExampleDto[];

  @ValidateNested({ each: true })
  @Type(() => SignVideoDto)
  signVideos: SignVideoDto[];

  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => DefinitionDto)
  definitions: DefinitionDto[];
}

export class CreateGlossRequestDto {
  
  @IsString()
  @IsNotEmpty()
  gloss: string;

  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => SenseDto)
  senses: SenseDto[];
} 