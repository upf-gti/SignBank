import type { PhonologyData } from 'src/types/models';

export function createDefaultPhonology(): PhonologyData {
  return {
    id: crypto.randomUUID(),
    handedness: 'ONE',
    dominantConfiguration: 'CONF_1',
    configurationChanges: 'EMPTY',
    dominantRelationBetweenArticulators: 'EMPTY',
    location: 'NEUTRAL_SPACE',
    movementRelatedOrientation: 'EMPTY',
    orientationRelatedToLocation: 'EMPTY',
    orientationChange: 'EMPTY',
    contactType: 'EMPTY',
    movementType: 'EMPTY',
    movementDirection: 'EMPTY',
    repeatedMovement: false,
    vocalization: 'none',
    nonManualComponent: 'none',
    inicialization: 'none',
  };
}
