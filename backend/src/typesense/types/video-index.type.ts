import { Hand, HandConfiguration, ConfigurationChange, RelationBetweenArticulators, Location, MovementRelatedOrientation, OrientationRelatedToLocation, OrientationChange, ContactType, MovementType, MovementDirection } from '@prisma/client';

export interface VideoIndex {
  id: string;
  // Video data
  url: string;
  
  // Sign Video data
  signVideoTitle: string;
  
  // Video parameters
  hands: Hand;
  configuration: HandConfiguration | '';
  configurationChanges: ConfigurationChange | '';
  relationBetweenArticulators: RelationBetweenArticulators | '';
  location: Location | '';
  movementRelatedOrientation: MovementRelatedOrientation | '';
  orientationRelatedToLocation: OrientationRelatedToLocation | '';
  orientationChange: OrientationChange | '';
  contactType: ContactType | '';
  movementType: MovementType | '';
  movementDirection: MovementDirection | '';
  vocalization: string;
  nonManualComponent: string;
  inicialization: string;
  
  // Sense data
  senseId: string;
  senseTitle: string;
  lexicalCategory: string;
  
  // Gloss data
  glossId: string;
  gloss: string;
} 