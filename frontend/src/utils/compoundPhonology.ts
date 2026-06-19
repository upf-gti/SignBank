import type { CompoundPart, GlossData, PhonologyData, SignVideo } from 'src/types/models';

export interface CompoundPhonologyColumn {
  key: string;
  label: string;
  phonology: PhonologyData;
  depth: number;
}

export interface CompoundPartVideoEntry {
  position: number;
  label: string;
  signVideo: SignVideo | null;
  isInlineMorpheme: boolean;
}

const MAX_COMPOUND_DEPTH = 3;

function primarySignVideo(gloss: GlossData): SignVideo | null {
  const videos = gloss.glossVideos ?? [];
  if (!videos.length) return null;
  const sorted = [...videos].sort((a, b) => a.priority - b.priority);
  return sorted[0] ?? null;
}

function primaryPhonology(gloss: GlossData): PhonologyData | null {
  return primarySignVideo(gloss)?.videoData ?? null;
}

/** One video per direct compound part — linked glosses use their own sign video (no deeper expansion). */
function resolvePartVideoEntry(part: CompoundPart): CompoundPartVideoEntry {
  if (!part.linkedGlossId) {
    return {
      position: part.position,
      label: part.gloss,
      signVideo: part.inlineSignVideo ?? null,
      isInlineMorpheme: true,
    };
  }

  const linked = part.linkedGloss;
  return {
    position: part.position,
    label: part.gloss,
    signVideo: linked ? primarySignVideo(linked) : null,
    isInlineMorpheme: false,
  };
}

export function primaryCompoundSignVideo(gloss: GlossData): SignVideo | null {
  return primarySignVideo(gloss);
}

/** One video slot per direct compound part (next level only). */
export function resolveCompoundPartVideos(gloss: GlossData): CompoundPartVideoEntry[] {
  return sortedCompoundParts(gloss).map(resolvePartVideoEntry);
}

function resolvePartPhonologyColumns(
  part: CompoundPart,
  depth: number,
  warnings: string[],
): CompoundPhonologyColumn[] {
  if (part.inlinePhonology) {
    return [{
      key: `p${part.position}-inline-${part.gloss}`,
      label: part.gloss,
      phonology: part.inlinePhonology,
      depth,
    }];
  }

  const linked = part.linkedGloss;
  if (!linked) {
    return [];
  }

  if (linked.isCompound && (linked.compoundParts?.length ?? 0) > 0) {
    if (depth >= MAX_COMPOUND_DEPTH) {
      warnings.push(`${part.gloss}: nested compound depth limit (${MAX_COMPOUND_DEPTH})`);
      return [];
    }
    return flattenCompoundPhonologyColumns(linked, depth + 1, warnings);
  }

  const phonology = primaryPhonology(linked);
  if (!phonology) {
    return [];
  }

  return [{
    key: `p${part.position}-linked-${linked.id ?? part.gloss}`,
    label: part.gloss,
    phonology,
    depth,
  }];
}

/** Leaf morpheme columns — nested linked compounds are flattened (e.g. BESSONS-TRES → GERMÀ, SEGON, TERCER). */
export function flattenCompoundPhonologyColumns(
  gloss: GlossData,
  depth = 0,
  warnings: string[] = [],
): CompoundPhonologyColumn[] {
  if (!gloss.isCompound || !(gloss.compoundParts?.length)) {
    return [];
  }

  return sortedCompoundParts(gloss).flatMap((part) =>
    resolvePartPhonologyColumns(part, depth, warnings),
  );
}

export function buildCompoundChainLabel(gloss: GlossData): string {
  const parts = [...(gloss.compoundParts ?? [])].sort((a, b) => a.position - b.position);
  const morphemes = parts.map((p) => p.gloss).join(' + ');
  return morphemes ? `${morphemes} → ${gloss.gloss}` : gloss.gloss;
}

export function sortedCompoundParts(gloss: GlossData): CompoundPart[] {
  return [...(gloss.compoundParts ?? [])].sort((a, b) => a.position - b.position);
}

export function isCompoundGloss(gloss: GlossData): boolean {
  return Boolean(gloss.isCompound && (gloss.compoundParts?.length ?? 0) > 0);
}
