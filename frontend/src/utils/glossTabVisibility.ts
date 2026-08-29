import type { GlossData, PhonologyData, SignVideo } from 'src/types/models';
import { sortedCompoundParts } from 'src/utils/compoundPhonology';
import { isPhonologyValueEmpty } from 'src/utils/phonologyHelpers';

const PHONOLOGY_STRING_FIELDS: (keyof PhonologyData)[] = [
  'handedness',
  'dominantConfiguration',
  'nonDominantConfiguration',
  'dominantRelationBetweenArticulators',
  'nonDominantRelationBetweenArticulators',
  'configurationChanges',
  'location',
  'movementRelatedOrientation',
  'orientationRelatedToLocation',
  'orientationChange',
  'contactType',
  'movementType',
  'movementDirection',
  'vocalization',
  'nonManualComponent',
  'inicialization',
];

function isEmptyPhonologyString(value: string | null | undefined): boolean {
  if (isPhonologyValueEmpty(value)) return true;
  return value === 'EMPTY' || value === 'none';
}

export function hasPhonologyContent(data: PhonologyData | null | undefined): boolean {
  if (!data) return false;

  const hasStringValue = PHONOLOGY_STRING_FIELDS.some(
    (field) => !isEmptyPhonologyString(data[field] as string | null | undefined),
  );

  return hasStringValue || data.repeatedMovement === true;
}

export function getPrimarySignVideo(glossData: GlossData): SignVideo | null {
  const videos = glossData.glossVideos || [];
  if (!videos.length) return null;
  return [...videos].sort((a, b) => a.priority - b.priority)[0] ?? null;
}

export function hasDefinitionsContent(glossData: GlossData): boolean {
  return (glossData.definitions?.length ?? 0) > 0;
}

export function hasExamplesContent(glossData: GlossData): boolean {
  return (glossData.examples?.length ?? 0) > 0;
}

export function hasRelatedContent(glossData: GlossData): boolean {
  return (glossData.relationsAsSource?.length ?? 0) > 0
    || (glossData.minimalPairsAsSource?.length ?? 0) > 0;
}

export function hasCompoundContent(glossData: GlossData): boolean {
  return sortedCompoundParts(glossData).length > 0;
}

export function hasSignPhonologyContent(glossData: GlossData): boolean {
  return (glossData.glossVideos || []).some((video) => hasPhonologyContent(video.videoData));
}

export type GlossContentTab = 'definitions' | 'compound' | 'phonology' | 'examples' | 'related';

export function getVisibleGlossTabs(
  glossData: GlossData,
  options: { editMode: boolean; isCompound: boolean },
): GlossContentTab[] {
  const tabs: GlossContentTab[] = [];

  if (options.editMode || hasDefinitionsContent(glossData)) {
    tabs.push('definitions');
  }

  if (options.isCompound && (options.editMode || hasCompoundContent(glossData))) {
    tabs.push('compound');
  }

  if (options.editMode || hasSignPhonologyContent(glossData)) {
    tabs.push('phonology');
  }

  if (options.editMode || hasExamplesContent(glossData)) {
    tabs.push('examples');
  }

  if (options.editMode || hasRelatedContent(glossData)) {
    tabs.push('related');
  }

  return tabs;
}
