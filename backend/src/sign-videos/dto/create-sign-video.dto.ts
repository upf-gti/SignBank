import { IsString, IsNotEmpty, IsArray, ValidateNested, IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

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

  @IsString()
  hands: string;

  @IsString()
  @IsOptional()
  configuration: string;

  @IsString()
  @IsOptional()
  configurationChanges: string;

  @IsString()
  @IsOptional()
  relationBetweenArticulators: string;

  @IsString()
  @IsOptional()
  location: string;

  @IsString()
  @IsOptional()
  movementRelatedOrientation: string;

  @IsString()
  @IsOptional()
  locationRelatedOrientation: string;

  @IsString()
  @IsOptional()
  orientationChange: string;

  @IsString()
  @IsOptional()
  contactType: string;

  @IsString()
  @IsOptional()
  movementType: string;

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

export class CreateSignVideoDto {
  @IsString()
  @IsOptional()
  title: string;

  @IsString()
  url: string;

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

  @IsArray()
  minimalPairs: any[];
} 