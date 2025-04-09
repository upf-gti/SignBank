import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { EditStatus } from '@prisma/client';

export class UpdateWordEditDto {
  @IsEnum(EditStatus)
  status: EditStatus;
  
  @IsOptional()
  @IsString()
  denyReason?: string; // If rejected, reason why
  
  @IsOptional()
  @IsBoolean()
  applyChanges?: boolean; // If approved, whether to apply the changes immediately
} 