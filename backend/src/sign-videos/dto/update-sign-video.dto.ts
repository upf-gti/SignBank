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
  @IsOptional()
  configuration?: HandConfiguration;

  @IsEnum(ConfigurationChange)
  @IsOptional()
  configurationChanges?: ConfigurationChange;

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
  glossDataId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VideoDto)
  videos: VideoDto[];

  @ValidateNested() 
  @Type(() => VideoDataDto)
  videoData: VideoDataDto;
} 