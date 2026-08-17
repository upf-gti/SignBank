import { IsEnum, IsBoolean, IsOptional, IsString } from 'class-validator';
import {
  Handedness,
  HandConfiguration,
  ConfigurationChange,
  RelationBetweenArticulators,
  Location,
  MovementRelatedOrientation,
  OrientationRelatedToLocation,
  OrientationChange,
  ContactType,
  MovementType,
  MovementDirection,
} from '@prisma/client';

export class VideoDataDto {
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

  @IsBoolean()
  @IsOptional()
  repeatedMovement?: boolean;
}
