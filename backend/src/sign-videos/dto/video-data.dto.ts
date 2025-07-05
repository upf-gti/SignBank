import { IsEnum, IsBoolean, IsOptional } from 'class-validator';
import { HandConfiguration, ConfigurationChange, RelationBetweenArticulators, Location, MovementRelatedOrientation, OrientationRelatedToLocation, OrientationChange, ContactType, MovementType, MovementDirection } from '@prisma/client';

export class VideoDataDto {
  @IsEnum(HandConfiguration)
  hands: HandConfiguration;

  @IsEnum(ConfigurationChange)
  @IsOptional()
  configuration?: ConfigurationChange;

  @IsEnum(ConfigurationChange)
  @IsOptional()
  configurationChanges?: ConfigurationChange[];

  @IsEnum(RelationBetweenArticulators)
  @IsOptional()
  relationBetweenArticulators?: RelationBetweenArticulators;

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

  @IsBoolean()
  @IsOptional()
  repeatedMovement?: boolean;
} 