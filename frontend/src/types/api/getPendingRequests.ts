import type { Word } from "../database"

export type Response = Request[]

export interface Request {
  creatorId: string
  status: string
  createdAt: Date
  updatedAt: Date
  requestedWordData: Word
  creator: Creator
  id: string
}

export interface Creator {
  username: string
  email: string
  role: string
  createdAt: Date
  updatedAt: Date
  id: string
}
