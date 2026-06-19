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

export function toEditableCompoundPart(part: CompoundPart): EditableCompoundPart {
  return {
    ...part,
    partKind: partKindFromCompoundPart(part),
    inlinePhonology: part.inlinePhonology ?? (part.linkedGlossId ? null : createDefaultPhonology()),
    inlineSignVideo: part.inlineSignVideo
      ? {
          ...part.inlineSignVideo,
          videos: part.inlineSignVideo.videos ?? [],
          minimalPairs: part.inlineSignVideo.minimalPairs ?? [],
        }
      : null,
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
    redundant: false,
    isNew: true,
    inlinePhonology: phonology,
    inlineSignVideo: {
      id: '',
      title: '',
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
    },
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
      redundant: part.redundant ?? false,
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
