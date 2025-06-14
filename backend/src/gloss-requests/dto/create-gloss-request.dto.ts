import { IsString, IsOptional, ValidateNested, IsEnum, IsNotEmpty, ArrayNotEmpty, IsInt, Min, IsArray } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { Language, LexicalCategory, Hand, RelationType, HandConfiguration, ConfigurationChange, RelationBetweenArticulators, Location, MovementRelatedOrientation, OrientationRelatedToLocation, OrientationChange, ContactType, MovementType } from '@prisma/client';

export class VideoDataDto {
  @IsEnum(Hand)
  hands: Hand;

  @IsEnum(HandConfiguration)
  configuration: HandConfiguration;

  @IsEnum(ConfigurationChange)
  configurationChanges: ConfigurationChange;

  @IsEnum(RelationBetweenArticulators)
  relationBetweenArticulators: RelationBetweenArticulators;

  @IsEnum(Location)
  location: Location;

  @IsEnum(MovementRelatedOrientation)
  movementRelatedOrientation: MovementRelatedOrientation;

  @IsEnum(OrientationRelatedToLocation)
  orientationRelatedToLocation: OrientationRelatedToLocation;

  @IsEnum(OrientationChange)
  orientationChange: OrientationChange;

  @IsEnum(ContactType)
  contactType: ContactType;

  @IsEnum(MovementType)
  movementType: MovementType;

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

export class MinimalPairDto {
  @IsString()
  @IsNotEmpty()
  targetGlossId: string;

  @IsString()
  @IsNotEmpty()
  distinction: string;
}

export class RelatedGlossDto {
  @IsString()
  @IsNotEmpty()
  targetGlossId: string;

  @IsEnum(RelationType)
  @IsNotEmpty()
  relationType: RelationType;
}

export class CreateGlossRequestDto {
  @IsString()
  @IsNotEmpty()
  gloss: string;

  // Commented out for initial gloss request creation
  // These fields will be added in subsequent steps
  // @ArrayNotEmpty()
  // @ValidateNested({ each: true })
  // @Type(() => SenseDto)
  // senses: SenseDto[];

  // @ValidateNested({ each: true })
  // @Type(() => MinimalPairDto)
  // @IsOptional()
  // minimalPairsAsSource?: MinimalPairDto[];

  // @ValidateNested({ each: true })
  // @Type(() => RelatedGlossDto)
  // @IsOptional()
  // relationsAsSource?: RelatedGlossDto[];
} 