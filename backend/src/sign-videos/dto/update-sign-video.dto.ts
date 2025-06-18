import { IsString, IsNotEmpty, IsArray, ValidateNested, IsOptional, IsNumber, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { Hand, HandConfiguration, ConfigurationChange, RelationBetweenArticulators, Location, MovementRelatedOrientation, OrientationRelatedToLocation, OrientationChange, ContactType, MovementType, MovementDirection } from '@prisma/client';

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

  @IsEnum(MovementDirection)
  movementDirection: MovementDirection;

  @IsString()
  @IsOptional()
  vocalization: string;

  @IsString()
  @IsOptional()
  nonManualComponent: string;

  @IsString()
  @IsOptional()
  inicialization: string;
}

export class UpdateSignVideoDto {
  @IsString()
  @IsOptional()
  id?: string;

  @IsString()
  title: string;

  @IsNumber()
  priority: number;

  @IsString()
  videoDataId: string;

  @IsString()
  senseId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VideoDto)
  videos: VideoDto[];

  @ValidateNested() 
  @Type(() => VideoDataDto)
  videoData: VideoDataDto;
} 