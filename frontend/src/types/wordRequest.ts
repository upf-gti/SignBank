import type { User } from "./user"
import type { Word } from "./word"

export type WordRequests = WordRequest[]

export type ConfirmRequestType = WordRequest & {
  user: User
}
export interface WordRequest {
  requestedWordData: Word
  id: string
  userId: string
  status: string
  createdAt: Date
  updatedAt: Date
  denyReason: any
  dialectId: any
  createdWordId: any
}


export interface Sense {
  priority: number
  dominantHand?: string
  facialExpression?: string
  hasContact?: boolean
  descriptions: Description[]
  morphologicalVariants: any
  movementType: any
  nonManualComponents: any
  phonologicalTranscription: any
  usageEra: any
  usageFrequency: any
  videos: any[]
}

export interface Description {
  text: string
  examples: string[]
  translations: Translation[]
}

export interface Translation {
  text: string
  language: string
}
