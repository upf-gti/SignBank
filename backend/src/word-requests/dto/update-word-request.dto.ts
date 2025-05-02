import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';

// Define enum locally instead of importing from Prisma
export enum RequestStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  DENIED = 'DENIED'
}

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
