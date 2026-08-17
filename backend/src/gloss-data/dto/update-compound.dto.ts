import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { VideoDataDto } from '../../sign-videos/dto/video-data.dto';

class InlineVideoDto {
  @IsString()
  @IsOptional()
  angle?: string;

  @IsString()
  @IsOptional()
  url?: string;

  @IsNumber()
  @IsOptional()
  priority?: number;
}

class InlineSignVideoDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InlineVideoDto)
  videos: InlineVideoDto[];
}

export class CompoundPartInputDto {
  @IsString()
  @IsOptional()
  id?: string;

  @IsNumber()
  position: number;

  @IsString()
  gloss: string;

  @IsString()
  @IsOptional()
  compExternalId?: string;

  @IsBoolean()
  @IsOptional()
  redundant?: boolean;

  @IsString()
  @IsOptional()
  linkedGlossId?: string | null;

  @ValidateNested()
  @Type(() => VideoDataDto)
  @IsOptional()
  inlinePhonology?: VideoDataDto;

  @ValidateNested()
  @Type(() => InlineSignVideoDto)
  @IsOptional()
  inlineSignVideo?: InlineSignVideoDto | null;
}

export class UpdateCompoundDto {
  @IsBoolean()
  isCompound: boolean;

  @IsString()
  @IsOptional()
  iconicity?: string | null;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CompoundPartInputDto)
  parts: CompoundPartInputDto[];
}
