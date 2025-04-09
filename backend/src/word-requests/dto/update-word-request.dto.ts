import { RequestStatus } from '@prisma/client';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateWordRequestDto {
  @IsEnum(RequestStatus)
  status: RequestStatus;
  
  @IsOptional()
  @IsString()
  denyReason?: string;
  
  // Optional data for creating word when accepting a request
  @IsOptional()
  @IsBoolean()
  createWord?: boolean; // Flag to indicate if word should be created
}
