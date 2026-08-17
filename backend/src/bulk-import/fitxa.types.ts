export interface FitxaPhonology {
  nombre_mans?: string | null;
  configuracio?: string | null;
  configuracio_ma_dominant?: string | null;
  configuracio_ma_no_dominant?: string | null;
  canvi_configuracio?: string | null;
  relacio_articuladors?: string | null;
  relacio_articuladors_ma_dominant?: string | null;
  relacio_articuladors_ma_no_dominant?: string | null;
  localitzacio?: string | null;
  orientacio_moviment?: string | null;
  orientacio_localitzacio?: string | null;
  canvi_orientacio?: string | null;
  tipus_contacte?: string | null;
  forma_moviment?: string | null;
  direccio_moviment?: string | null;
  moviment_repetit?: string | null;
  vocalitzacio?: string | null;
  component_no_manual?: string | null;
}

export interface FitxaMinimalPair {
  sign?: string | null;
  description?: string | null;
}

export interface FitxaJson {
  id?: string;
  name?: string;
  tr_en?: string;
  tr_es?: string;
  tr_ca?: string;
  definitions?: string[];
  definition?: string;
  lexical_category?: string;
  phonology?: FitxaPhonology;
  minimal_pairs?: FitxaMinimalPair[];
  related_signs?: Record<string, string[]>;
  notes?: string | null;
  video_url?: string | null;
  is_compound?: boolean;
  compound_signs?: string[];
  morfologia_sequencial?: {
    compost_1?: string | null;
    compost_2?: string | null;
    compost_3?: string | null;
  };
}

export interface ImportIssue {
  gloss: string;
  fileName: string;
  field: string;
  value: string;
  message: string;
}

export interface ImportDuplicate {
  gloss: string;
  fileName: string;
  existingGlossId: string;
  reason: string;
}

export interface BulkImportResult {
  created: number;
  updated: number;
  stubsCreated: number;
  skipped: number;
  relationsCreated: number;
  errors: ImportIssue[];
  duplicates: ImportDuplicate[];
}

export interface MappedDefinition {
  title: string | null;
  definition: string;
  lexicalCategory: string;
}

export interface MappedRelation {
  type: string;
  targetGloss: string;
}

export interface MappedMinimalPair {
  targetGloss: string;
  distinction: string;
}

export interface MappedPhonology {
  hands: string;
  configuration: string;
  configurationChanges: string;
  relationBetweenArticulators: string;
  location: string;
  movementRelatedOrientation: string;
  orientationRelatedToLocation: string;
  orientationChange: string;
  contactType: string;
  movementType: string;
  movementDirection: string;
  vocalization: string;
  nonManualComponent: string;
  inicialization: string;
  repeatedMovement: boolean;
}

export interface MappedFitxa {
  fileName: string;
  gloss: string;
  notes: string | null;
  translations: Array<{ language: 'CATALAN' | 'SPANISH' | 'ENGLISH'; translation: string }>;
  definitions: MappedDefinition[];
  phonology: MappedPhonology | null;
  videoUrl: string | null;
  relations: MappedRelation[];
  minimalPairs: MappedMinimalPair[];
  linkedGlossNames: string[];
  issues: ImportIssue[];
}
