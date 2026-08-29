import { VideoData } from '@prisma/client';

const MAX_COMPOUND_DEPTH = 3;

export type GlossVideoForSearch = {
  priority: number;
  videos: { url: string; priority: number }[];
  videoData: VideoData;
};

export type CompoundPartForSearch = {
  position: number;
  gloss: string;
  inlinePhonology: VideoData | null;
  inlineSignVideo?: GlossVideoForSearch | null;
  linkedGloss: CompoundGlossForSearch | null;
};

export type CompoundGlossForSearch = {
  isCompound: boolean;
  glossVideos: GlossVideoForSearch[];
  compoundParts?: CompoundPartForSearch[];
};

function primarySignVideoPhonology(gloss: CompoundGlossForSearch): VideoData | null {
  const videos = [...(gloss.glossVideos ?? [])].sort((a, b) => a.priority - b.priority);
  return videos[0]?.videoData ?? null;
}

function primarySignVideoUrl(gloss: CompoundGlossForSearch): string {
  const videos = [...(gloss.glossVideos ?? [])].sort((a, b) => a.priority - b.priority);
  const signVideo = videos[0];
  if (!signVideo) return '';
  const file = [...signVideo.videos].sort((a, b) => a.priority - b.priority)[0];
  return file?.url ?? '';
}

function inlinePartVideoUrl(part: CompoundPartForSearch): string {
  if (!part.inlineSignVideo) return '';
  const file = [...part.inlineSignVideo.videos].sort((a, b) => a.priority - b.priority)[0];
  return file?.url ?? '';
}

function resolvePartPhonology(
  part: CompoundPartForSearch,
  depth: number,
): VideoData | null {
  if (part.inlinePhonology) {
    return part.inlinePhonology;
  }
  const linked = part.linkedGloss;
  if (!linked) {
    return null;
  }
  if (linked.isCompound && (linked.compoundParts?.length ?? 0) > 0) {
    if (depth >= MAX_COMPOUND_DEPTH) {
      return null;
    }
    return resolveCompoundSearchPhonology(linked, depth + 1);
  }
  return primarySignVideoPhonology(linked);
}

/** Phonology for search facets — own sign video first, then component phonology. */
export function resolveCompoundSearchPhonology(
  gloss: CompoundGlossForSearch,
  depth = 0,
): VideoData | null {
  if (depth === 0) {
    const own = primarySignVideoPhonology(gloss);
    if (own) {
      return own;
    }
  }

  const parts = [...(gloss.compoundParts ?? [])].sort((a, b) => a.position - b.position);
  for (const part of parts) {
    const phonology = resolvePartPhonology(part, depth);
    if (phonology) {
      return phonology;
    }
  }
  return null;
}

/** Video URL for search thumbnails — own sign video first, then component videos. */
export function resolveCompoundSearchVideoUrl(gloss: CompoundGlossForSearch): string {
  const own = primarySignVideoUrl(gloss);
  if (own) {
    return own;
  }

  const parts = [...(gloss.compoundParts ?? [])].sort((a, b) => a.position - b.position);
  for (const part of parts) {
    const inlineUrl = inlinePartVideoUrl(part);
    if (inlineUrl) return inlineUrl;

    if (part.linkedGloss) {
      const url = primarySignVideoUrl(part.linkedGloss);
      if (url) return url;
      if (part.linkedGloss.isCompound) {
        const nested = resolveCompoundSearchVideoUrl(part.linkedGloss);
        if (nested) return nested;
      }
    }
  }
  return '';
}
