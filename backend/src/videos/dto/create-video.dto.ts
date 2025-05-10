import { IsString, IsNumber, IsOptional, IsEnum } from 'class-validator';
import { Hand } from '../../../types/database';

export class CreateVideoDto {
  @IsString()
  url: string;

  @IsString()
  angle: string;

  @IsNumber()
  priority: number;

  @IsOptional()
  @IsEnum(Hand)
  dominantHand?: Hand;

  @IsOptional()
  @IsString()
  facialExpression?: string;

  @IsOptional()
  @IsString()
  hasContact?: boolean;

  @IsOptional()
  @IsString()
  phonologicalTranscription?: string;

  @IsOptional()
  @IsString()
  nonManualComponents?: string;

  @IsOptional()
  @IsString()
  movementType?: string;
} 