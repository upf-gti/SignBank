import { Type } from 'class-transformer';
import { IsString, IsNumber, IsArray, IsObject, IsOptional, Min, Max, IsEnum } from 'class-validator';
import { WordStatus, Hand, LexicalCategory } from '@prisma/client';

export class SearchQueryDto {
  @IsString()
  q: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;

  @IsOptional()
  @IsString()
  dialect?: string;

  @IsOptional()
  @IsEnum(LexicalCategory)
  lexicalCategory?: LexicalCategory;

  @IsOptional()
  @Type(() => Boolean)
  isNative?: boolean;

  // Video attributes can be used to filter, but they are now nested in the sense.videos array
  @IsOptional()
  @Type(() => Boolean)
  videoHasContact?: boolean;

  @IsOptional()
  @IsEnum(Hand)
  videoDominantHand?: Hand;
  
  @IsOptional()
  @IsString()
  videoFacialExpression?: string;
}

export class AdvancedSearchDto {
  @IsString()
  query: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;

  @IsOptional()
  @IsArray()
  queryBy?: string[];

  @IsOptional()
  @IsObject()
  filterBy?: Record<string, any>;

  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsArray()
  facetBy?: string[];
} 