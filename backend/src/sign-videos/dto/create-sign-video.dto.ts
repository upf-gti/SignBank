import { IsString, IsNotEmpty, IsArray, ValidateNested, IsOptional, IsNumber, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { Handedness, HandConfiguration, ConfigurationChange, RelationBetweenArticulators, Location, MovementRelatedOrientation, OrientationRelatedToLocation, OrientationChange, ContactType, MovementType, MovementDirection } from '@prisma/client';

class VideoDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  angle: string;

  @IsString()
  @IsNotEmpty()
  url: string;

  @IsNumber()
  priority: number;
}

class VideoDataDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsEnum(Handedness)
  handedness: Handedness;

  @IsEnum(HandConfiguration)
  @IsOptional()
  dominantConfiguration?: HandConfiguration;

  @IsEnum(HandConfiguration)
  @IsOptional()
  nonDominantConfiguration?: HandConfiguration;

  @IsEnum(RelationBetweenArticulators)
  @IsOptional()
  dominantRelationBetweenArticulators?: RelationBetweenArticulators;

  @IsEnum(RelationBetweenArticulators)
  @IsOptional()
  nonDominantRelationBetweenArticulators?: RelationBetweenArticulators;

  @IsEnum(ConfigurationChange)
  @IsOptional()
  configurationChanges?: ConfigurationChange;

  @IsEnum(Location)
  @IsOptional()
  location?: Location;

  @IsEnum(MovementRelatedOrientation)
  @IsOptional()
  movementRelatedOrientation?: MovementRelatedOrientation;

  @IsEnum(OrientationRelatedToLocation)
  @IsOptional()
  orientationRelatedToLocation?: OrientationRelatedToLocation;

  @IsEnum(OrientationChange)
  @IsOptional()
  orientationChange?: OrientationChange;

  @IsEnum(ContactType)
  @IsOptional()
  contactType?: ContactType;

  @IsEnum(MovementType)
  @IsOptional()
  movementType?: MovementType;

  @IsEnum(MovementDirection)
  @IsOptional()
  movementDirection?: MovementDirection;

  @IsString()
  @IsOptional()
  vocalization?: string;

  @IsString()
  @IsOptional()
  nonManualComponent?: string;

  @IsString()
  @IsOptional()
  inicialization?: string;
}

export class CreateSignVideoDto {
  @IsString()
  @IsOptional()
  title: string;

  @IsNumber()
  priority: number;

  @IsString()
  videoDataId: string;

  @IsString()
  glossDataId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VideoDto)
  videos: VideoDto[];

  @ValidateNested()
  @Type(() => VideoDataDto)
  videoData: VideoDataDto;

  @IsArray()
  minimalPairs: any[];
} 