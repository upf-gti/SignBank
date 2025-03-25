// This is just an example,
// so you can safely delete all default props below
import type TranslateKeys from '../translateKeys';
export default {
  requestWord: 'Request a word',
  confirmRequests: 'Confirm requests',
  login: 'Login',
  email: 'Email',
  password: 'Password',
  forgotPassword: 'Forgot password?',
  word: 'Word',
  actions: 'Actions',
  logout: 'Logout',
  signLanguageDictionary: 'Sign Language Dictionary',
  enterAWord: 'Enter a word',
  search: 'Search',
  description: 'Description',
  requestedBy: 'Requested by',
  editMode: 'Edit mode',
  
  // Common translations
  common: {
    yes: 'Yes',
    no: 'No',
    loading: 'Loading...',
    goBack: 'Go Back',
    back: 'Back',
    save: 'Save',
    cancel: 'Cancel',
    word: 'Word',
    description: 'Description'
  },
  
  // Word related translations
  word_detail: {
    // Field labels
    field: {
      word: 'Word',
      description: 'Description',
      dialect: 'Dialect',
      videos: 'Videos',
      angle: 'Angle',
      senses: 'Senses',
      dominantHand: 'Dominant Hand',
      facialExpression: 'Facial Expression',
      hasContact: 'Has Contact',
      phonologicalTranscription: 'Phonological Transcription',
      movementType: 'Movement Type',
      nonManualComponents: 'Non-Manual Components',
      descriptions: 'Descriptions',
      descriptionText: 'Description Text',
      examples: 'Examples',
      example: 'Example',
      translations: 'Translations',
      translation: 'Translation',
      language: 'Language'
    },
    
    // Action buttons
    action: {
      addSense: 'Add Sense',
      removeSense: 'Remove Sense',
      addDescription: 'Add Description',
      addExample: 'Add Example',
      addTranslation: 'Add Translation',
      requestEdit: 'Request Edit',
      createNewWord: 'Create New Word'
    },
    
    // Error messages
    error: {
      needOneSense: 'Words must have at least one sense',
      needOneDescription: 'Senses must have at least one description',
      emptyWord: 'Word cannot be empty',
      emptyDescription: 'Description cannot be empty',
      notFound: 'Word not found',
      loadingFailed: 'Error loading word details. Please try again.',
      savingFailed: 'Error saving word. Please try again.'
    },
    
    // Success messages
    success: {
      editSubmitted: 'Edit request submitted successfully',
      created: 'New word created successfully'
    },
    
    // Miscellaneous
    notSpecified: 'Not specified'
  }
} as TranslateKeys;
