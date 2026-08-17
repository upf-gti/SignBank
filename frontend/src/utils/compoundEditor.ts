import type { CompoundPart, GlossData, PhonologyData, SignVideo } from 'src/types/models';
import { createDefaultPhonology } from './defaultPhonology';

export type CompoundPartKind = 'linked' | 'inline';

export interface EditableCompoundPart extends CompoundPart {
  partKind: CompoundPartKind;
  isNew?: boolean;
}

export function partKindFromCompoundPart(part: CompoundPart): CompoundPartKind {
  return part.linkedGlossId ? 'linked' : 'inline';
}

function clonePhonology(phonology: PhonologyData): PhonologyData {
  return { ...phonology };
}

function resolveInlinePhonology(part: CompoundPart): PhonologyData {
  const source = part.inlinePhonology ?? part.inlineSignVideo?.videoData;
  if (source) {
    return clonePhonology(source);
  }
  return createDefaultPhonology();
}

function buildInlineSignVideo(
  gloss: string,
  phonology: PhonologyData,
  existing?: SignVideo | null,
): SignVideo {
  if (existing) {
    return {
      ...existing,
      videos: existing.videos ?? [],
      minimalPairs: existing.minimalPairs ?? [],
      videoData: phonology,
      videoDataId: phonology.id || existing.videoDataId || '',
    };
  }

  return {
    id: '',
    title: gloss,
    priority: 1,
    videoDataId: phonology.id || '',
    videos: [{
      id: crypto.randomUUID(),
      angle: 'front',
      url: '',
      priority: 1,
    }],
    minimalPairs: [],
    videoData: phonology,
  };
}

export function toEditableCompoundPart(part: CompoundPart): EditableCompoundPart {
  const partKind = partKindFromCompoundPart(part);
  const inlinePhonology = partKind === 'inline' ? resolveInlinePhonology(part) : null;
  const inlineSignVideo = partKind === 'inline' && inlinePhonology
    ? buildInlineSignVideo(part.gloss, inlinePhonology, part.inlineSignVideo)
    : part.inlineSignVideo
      ? {
          ...part.inlineSignVideo,
          videos: part.inlineSignVideo.videos ?? [],
          minimalPairs: part.inlineSignVideo.minimalPairs ?? [],
        }
      : null;

  return {
    ...part,
    partKind,
    inlinePhonology,
    inlineSignVideo,
  };
}

export function editablePartsFromGloss(gloss: GlossData): EditableCompoundPart[] {
  return [...(gloss.compoundParts ?? [])]
    .sort((a, b) => a.position - b.position)
    .map(toEditableCompoundPart);
}

export function createEmptyEditablePart(position: number): EditableCompoundPart {
  const phonology = createDefaultPhonology();
  return {
    position,
    gloss: '',
    partKind: 'inline',
    isNew: true,
    inlinePhonology: phonology,
    inlineSignVideo: buildInlineSignVideo('', phonology),
  };
}

export function initializeInlineMorpheme(
  gloss: string,
  existing?: SignVideo | null,
): Pick<EditableCompoundPart, 'inlinePhonology' | 'inlineSignVideo'> {
  const phonology = existing?.videoData
    ? clonePhonology(existing.videoData)
    : createDefaultPhonology();

  return {
    inlinePhonology: phonology,
    inlineSignVideo: buildInlineSignVideo(gloss, phonology, existing ?? undefined),
  };
}

function stripPhonologyForApi(phonology: PhonologyData) {
  const { id, ...rest } = phonology;
  void id;
  return rest;
}

function stripInlineSignVideoForApi(signVideo: SignVideo | null | undefined) {
  if (!signVideo) return null;
  const videos = (signVideo.videos ?? []).filter((video) => video.url?.trim());
  if (!videos.length) return null;
  return {
    videos: videos.map((video, index) => ({
      angle: video.angle || 'front',
      url: video.url,
      priority: video.priority ?? index + 1,
    })),
  };
}

export function buildCompoundUpdatePayload(
  gloss: GlossData,
  parts: EditableCompoundPart[],
) {
  return {
    isCompound: Boolean(gloss.isCompound),
    iconicity: gloss.iconicity ?? null,
    parts: parts.map((part, index) => ({
      id: part.id || undefined,
      position: index + 1,
      gloss: part.gloss.trim(),
      compExternalId: part.compExternalId ?? null,
      linkedGlossId: part.partKind === 'linked' ? part.linkedGlossId ?? null : null,
      inlinePhonology:
        part.partKind === 'inline' && part.inlinePhonology
          ? stripPhonologyForApi(part.inlinePhonology)
          : undefined,
      inlineSignVideo:
        part.partKind === 'inline'
          ? stripInlineSignVideoForApi(part.inlineSignVideo)
          : null,
    })),
  };
}
