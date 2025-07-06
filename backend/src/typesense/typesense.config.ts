import { CollectionCreateSchema } from 'typesense/lib/Typesense/Collections';

export const VIDEOS_COLLECTION_NAME = 'videos';

export const videosSchema: CollectionCreateSchema = {
  name: VIDEOS_COLLECTION_NAME,
  fields: [
    { name: 'id', type: 'string' },
    { name: 'url', type: 'string' },
    { name: 'signVideoTitle', type: 'string', facet: true, sort: true },
    { name: 'hands', type: 'string', facet: true },
    { name: 'configuration', type: 'string', facet: true },
    { name: 'configurationChanges', type: 'string', facet: true },
    { name: 'relationBetweenArticulators', type: 'string', facet: true },
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
    { name: 'gloss', type: 'string', facet: true, sort: true },
    { name: 'repeatedMovement', type: 'bool' }
  ]
}; 