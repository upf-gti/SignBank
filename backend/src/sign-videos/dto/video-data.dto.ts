import { IsEnum, IsBoolean } from 'class-validator';
import { HandConfiguration, ConfigurationChange, RelationBetweenArticulators, Location, MovementRelatedOrientation, OrientationRelatedToLocation, OrientationChange, ContactType, MovementType, MovementDirection } from '@prisma/client';

export class VideoDataDto {
  @IsEnum(HandConfiguration)
  hands: HandConfiguration;

  @IsEnum(ConfigurationChange)
  configuration: ConfigurationChange;

  @IsEnum(ConfigurationChange)
  configurationChanges: ConfigurationChange[];

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

  @IsEnum(MovementDirection)
  movementDirection: MovementDirection;

  @IsBoolean()
  repeatedMovement: boolean;
} 