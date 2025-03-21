import { Dialect, Hand, LexicalCategory, Translation, Video, WordRelation, Sense } from "@prisma/client"

export class CreateWordRequestDto {
  word: string;
  description: string;
  dialectId: number;
  dominantHand: Hand;
  facialExpression: string;
  hasContact: boolean;
  isNative: boolean;
  lexicalCategory: LexicalCategory;
  morphologicalVariants: string;
  movementType: string;
  nonManualComponents: string;
  phonologicalTranscription: string;
  register: string;
  usageEra: string;
  usageFrequency: string;
  senses: Sense[];
  translations: Translation[];
  videos: Video[];
  relatedWords: WordRelation[];
  dialect: Dialect;
}
