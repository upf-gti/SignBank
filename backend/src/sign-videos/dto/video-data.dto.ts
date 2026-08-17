import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class VideoDataDto {
  @IsString()
  handedness: string;

  @IsString()
  @IsOptional()
  dominantConfiguration?: string;

  @IsString()
  @IsOptional()
  nonDominantConfiguration?: string;

  @IsString()
  @IsOptional()
  dominantRelationBetweenArticulators?: string;

  @IsString()
  @IsOptional()
  nonDominantRelationBetweenArticulators?: string;

  @IsString()
  @IsOptional()
  configurationChanges?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  movementRelatedOrientation?: string;

  @IsString()
  @IsOptional()
  orientationRelatedToLocation?: string;

  @IsString()
  @IsOptional()
  orientationChange?: string;

  @IsString()
  @IsOptional()
  contactType?: string;

  @IsString()
  @IsOptional()
  movementType?: string;

  @IsString()
  @IsOptional()
  movementDirection?: string;

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
