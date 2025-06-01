import { IsNotEmpty } from 'class-validator';
import { GlossData } from '@prisma/client';

export class AcceptGlossRequestDto {
  @IsNotEmpty()
  glossData: GlossData;
} 