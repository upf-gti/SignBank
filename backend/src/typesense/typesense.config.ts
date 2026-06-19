import { CollectionCreateSchema } from 'typesense/lib/Typesense/Collections';

export const VIDEOS_COLLECTION_NAME = 'videos';

export const videosSchema: CollectionCreateSchema = {
  name: VIDEOS_COLLECTION_NAME,
  fields: [
    { name: 'id', type: 'string' },
    { name: 'glossId', type: 'string', facet: true },
    { name: 'gloss', type: 'string', facet: true, sort: true },
    { name: 'url', type: 'string' },
    { name: 'signVideoTitle', type: 'string', facet: true, sort: true },
    { name: 'lexicalCategory', type: 'string', facet: true },
    { name: 'lexicalCategories', type: 'string[]', facet: true, optional: true },
    { name: 'description', type: 'string', facet: true },
    { name: 'handedness', type: 'string', facet: true },
    { name: 'dominantConfiguration', type: 'string', facet: true },
    { name: 'nonDominantConfiguration', type: 'string', facet: true, optional: true },
    { name: 'dominantRelationBetweenArticulators', type: 'string', facet: true, optional: true },
    { name: 'nonDominantRelationBetweenArticulators', type: 'string', facet: true, optional: true },
    { name: 'configurationChanges', type: 'string', facet: true },
    { name: 'location', type: 'string', facet: true },
    { name: 'movementRelatedOrientation', type: 'string', facet: true },
    { name: 'orientationRelatedToLocation', type: 'string', facet: true },
    { name: 'orientationChange', type: 'string', facet: true },
    { name: 'contactType', type: 'string', facet: true },
    { name: 'movementType', type: 'string', facet: true },
    { name: 'movementDirection', type: 'string', facet: true },
    { name: 'vocalization', type: 'string', facet: true },
    { name: 'nonManualComponent', type: 'string', facet: true },
    { name: 'inicialization', type: 'string', facet: true },
    { name: 'repeatedMovement', type: 'bool', facet: true },
  ],
};
