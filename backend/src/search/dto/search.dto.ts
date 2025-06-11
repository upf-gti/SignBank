import { IsString, IsOptional, IsInt, Min, IsArray } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class SearchQueryDto {

  @IsString()
  query: string;


  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  @Transform(({ value }) => parseInt(value))
  page?: number = 1;

  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  @Transform(({ value }) => parseInt(value))
  limit?: number = 10;


  @IsString()
  @IsOptional()
  facet_by?: string;

  @IsString()
  @IsOptional()
  filter_by?: string;
} 