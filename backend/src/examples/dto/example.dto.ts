import { IsString, IsOptional } from 'class-validator';

export class CreateExampleDto {
  @IsString()
  example: string;

  @IsString()
  @IsOptional()
  exampleVideoURL?: string;
}

export class UpdateExampleDto {
  @IsString()
  @IsOptional()
  example?: string;

  @IsString()
  @IsOptional()
  exampleVideoURL?: string;
} 