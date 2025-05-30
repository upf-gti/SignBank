import { IsString, IsOptional, IsInt, Min, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';

export class SearchQueryDto {
  @ApiProperty({
    description: 'Search query string',
    required: true,
  })
  @IsString()
  query: string;

  @ApiProperty({
    description: 'Page number for pagination',
    required: false,
    default: 1,
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  @Transform(({ value }) => parseInt(value))
  page?: number = 1;

  @ApiProperty({
    description: 'Number of items per page',
    required: false,
    default: 10,
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  @Transform(({ value }) => parseInt(value))
  limit?: number = 10;

  @ApiProperty({
    description: 'Fields to facet by',
    required: false,
  })
  @IsString()
  @IsOptional()
  facet_by?: string;

  @ApiProperty({
    description: 'Filter expression',
    required: false,
  })
  @IsString()
  @IsOptional()
  filter_by?: string;
} 