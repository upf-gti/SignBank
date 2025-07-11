import translate from './translate'

export interface LexicalCategory {
  label: string
  value: string
}

export const LEXICAL_CATEGORIES: LexicalCategory[] = [
  { label: translate('adjective'), value: 'ADJECTIVE' },
  { label: translate('interjection'), value: 'INTERJECTION' },
  { label: translate('noun'), value: 'NOUN' },
  { label: translate('nounOrVerb'), value: 'NOUN_OR_VERB' },
  { label: translate('nounOrAdjective'), value: 'NOUN_OR_ADJECTIVE' },
  { label: translate('nounAdjectiveOrVerb'), value: 'NOUN_ADJECTIVE_OR_VERB' },
  { label: translate('verbOrAdjective'), value: 'VERB_OR_ADJECTIVE' },
  { label: translate('particle'), value: 'PARTICLE' },
  { label: translate('verb'), value: 'VERB' },
  { label: translate('adverb'), value: 'ADVERB' },
  { label: translate('pronoun'), value: 'PRONOUN' },
  { label: translate('nounAdjectiveOrAdverb'), value: 'NOUN_ADJECTIVE_OR_ADVERB' },
  { label: translate('particleNounOrVerb'), value: 'PARTICLE_NOUN_OR_VERB' },
  { label: translate('nounOrAdverb'), value: 'NOUN_OR_ADVERB' },
  { label: translate('verbAdjectiveOrAdverb'), value: 'VERB_ADJECTIVE_OR_ADVERB' },
  { label: translate('verbOrInterjection'), value: 'VERB_OR_INTERJECTION' },
  { label: translate('adjectiveOrAdverb'), value: 'ADJECTIVE_OR_ADVERB' },
  { label: translate('verbAdjectiveOrParticle'), value: 'VERB_ADJECTIVE_OR_PARTICLE' },
  { label: translate('particleOrAdjective'), value: 'PARTICLE_OR_ADJECTIVE' },
  { label: translate('nounAdjectiveOrParticle'), value: 'NOUN_ADJECTIVE_OR_PARTICLE' },
  { label: translate('verbOrAdverb'), value: 'VERB_OR_ADVERB' },
  { label: translate('particleOrAdverb'), value: 'PARTICLE_OR_ADVERB' },
  { label: translate('nounVerbOrAdverb'), value: 'NOUN_VERB_OR_ADVERB' },
  { label: translate('nounOrInterjection'), value: 'NOUN_OR_INTERJECTION' },
  { label: translate('adverbOrInterjection'), value: 'ADVERB_OR_INTERJECTION' },
  { label: translate('verbOrParticle'), value: 'VERB_OR_PARTICLE' },
  { label: translate('nounOrPreposition'), value: 'NOUN_OR_PREPOSITION' }
] 