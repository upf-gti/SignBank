import { IsString, IsNotEmpty, IsArray, ValidateNested, IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { VideoDataDto } from './video-data.dto';

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

class SignVideoPhonologyDto extends VideoDataDto {
  @IsString()
  @IsNotEmpty()
  id: string;
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
  @Type(() => SignVideoPhonologyDto)
  videoData: SignVideoPhonologyDto;
}
