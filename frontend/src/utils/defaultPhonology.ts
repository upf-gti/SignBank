import type { PhonologyData } from 'src/types/models';
import {
  Handedness,
  HandConfiguration,
  ConfigurationChange,
  RelationBetweenArticulators,
  Location,
  MovementRelatedOrientation,
  OrientationRelatedToLocation,
  OrientationChange,
  ContactType,
  MovementType,
  MovementDirection,
} from 'src/types/enums';

export function createDefaultPhonology(): PhonologyData {
  return {
    id: crypto.randomUUID(),
    handedness: Handedness.ONE,
    dominantConfiguration: HandConfiguration.CONF_1,
    configurationChanges: ConfigurationChange.EMPTY,
    dominantRelationBetweenArticulators: RelationBetweenArticulators.EMPTY,
    location: Location.NEUTRAL_SPACE,
    movementRelatedOrientation: MovementRelatedOrientation.EMPTY,
    orientationRelatedToLocation: OrientationRelatedToLocation.EMPTY,
    orientationChange: OrientationChange.EMPTY,
    contactType: ContactType.EMPTY,
    movementType: MovementType.EMPTY,
    movementDirection: MovementDirection.EMPTY,
    repeatedMovement: false,
    vocalization: 'none',
    nonManualComponent: 'none',
    inicialization: 'none',
  };
}
