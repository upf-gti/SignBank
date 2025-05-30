export interface VideoIndex {
  id: string;
  // Video data
  url: string;
  
  // Sign Video data
  signVideoTitle: string;
  
  // Video parameters
  hands: 'RIGHT' | 'LEFT' | 'BOTH';
  configuration: string;
  configurationChanges: string;
  relationBetweenArticulators: string;
  location: string;
  movementRelatedOrientation: string;
  locationRelatedOrientation: string;
  orientationChange: string;
  contactType: string;
  movementType: string;
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