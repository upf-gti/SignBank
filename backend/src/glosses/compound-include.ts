/** Nested compound parts for gloss detail (max ~2 levels per domain rules). */
import { videoDataPhonologyInclude } from '../phonology-values/phonology-video-data';

const glossVideosInclude = {
  orderBy: { priority: 'asc' as const },
  include: {
    videoData: { include: videoDataPhonologyInclude },
    videos: { orderBy: { priority: 'asc' as const } },
  },
};

const inlineSignVideoInclude = {
  include: {
    videos: { orderBy: { priority: 'asc' as const } },
    videoData: { include: videoDataPhonologyInclude },
  },
};

/** Linked gloss at the innermost compound level (e.g. GERMÀ inside BESSONS-1d). */
const nestedLinkedGlossInclude = {
  include: {
    glossVideos: glossVideosInclude,
  },
};

export const compoundPartsInclude = {
  orderBy: { position: 'asc' as const },
  include: {
    linkedGloss: {
      include: {
        glossVideos: glossVideosInclude,
        compoundParts: {
          orderBy: { position: 'asc' as const },
          include: {
            linkedGloss: nestedLinkedGlossInclude,
            inlinePhonology: { include: videoDataPhonologyInclude },
            inlineSignVideo: inlineSignVideoInclude,
          },
        },
      },
    },
    inlinePhonology: { include: videoDataPhonologyInclude },
    inlineSignVideo: inlineSignVideoInclude,
  },
};
