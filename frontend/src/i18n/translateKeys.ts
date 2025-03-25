interface TranslateKeys {
 requestWord: string;
 confirmRequests: string;
 login: string;
 email: string;
 password: string;
 forgotPassword: string;
 requestedBy: string;
 actions: string;
 logout: string;
 signLanguageDictionary: string;
 enterAWord: string;
 search: string;
 editMode: string;
 
 // Common translations
 common: {
   yes: string;
   no: string;
   loading: string;
   goBack: string;
   back: string;
   save: string;
   cancel: string;
   word: string;
   description: string;
 };
 
 // Word related translations
 word_detail: {
   // Field labels
   field: {
     word: string;
     description: string;
     dialect: string;
     videos: string;
     angle: string;
     senses: string;
     dominantHand: string;
     facialExpression: string;
     hasContact: string;
     phonologicalTranscription: string;
     movementType: string;
     nonManualComponents: string;
     descriptions: string;
     descriptionText: string;
     examples: string;
     example: string;
     translations: string;
     translation: string;
     language: string;
   };
   
   // Action buttons
   action: {
     addSense: string;
     removeSense: string;
     addDescription: string;
     addExample: string;
     addTranslation: string;
     requestEdit: string;
     createNewWord: string;
   };
   
   // Error messages
   error: {
     needOneSense: string;
     needOneDescription: string;
     emptyWord: string;
     emptyDescription: string;
     notFound: string;
     loadingFailed: string;
     savingFailed: string;
   };
   
   // Success messages
   success: {
     editSubmitted: string;
     created: string;
   };
   
   // Miscellaneous
   notSpecified: string;
 };
}

export default TranslateKeys;