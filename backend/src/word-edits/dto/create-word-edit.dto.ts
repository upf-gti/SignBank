import { Type } from 'class-transformer';
import { IsString, IsOptional, ValidateNested } from 'class-validator';
import { WordDataDto } from '../../word-requests/dto/create-word-request.dto';

export class CreateWordEditDto {
  @IsString()
  wordId: string;
  
  @IsOptional()
  @IsString()
  comment?: string;
  
  @IsOptional()
  @ValidateNested()
  @Type(() => WordDataDto)
  proposedWordData?: WordDataDto;
} 