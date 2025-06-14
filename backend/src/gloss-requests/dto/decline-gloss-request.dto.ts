import { IsNotEmpty, IsString } from 'class-validator';

export class DeclineGlossRequestDto {
  @IsNotEmpty()
  @IsString()
  denyReason: string;
} 