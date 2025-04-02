export interface WordSearchResponse {
    found: number
    page: number
    hits: Hit[]
  }
  
  export interface Hit {
    word: Word
    highlights: Highlight[]
    textMatch: number
  }
  
  export interface Word {
    id: string
    word: string
    description: string
    videoUrls: string[]
    lexicalCategory?: string
  }
  
  export interface Highlight {
    field: string
    matched_tokens: any[]
    snippet?: string
    value?: string
    indices?: number[]
    snippets?: string[]
    values?: string[]
  }
  