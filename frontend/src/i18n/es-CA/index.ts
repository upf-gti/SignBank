import type TranslateKeys from '../translateKeys';

export default {
  requestWord: 'Sol·licitar paraula',
  confirmRequests: 'Confirmar sol·licituds',
  login: 'Iniciar sessió',
  logout: 'Tancar sessió',
  email: 'Email',
  password: 'Contrasenya',
  forgotPassword: 'Has oblidat la teva contrasenya?',
  word: 'Paraula',
  description: 'Descripció',
  requestedBy: 'Sol·licitat per',
  actions: 'Accions',
  signLanguageDictionary: 'Diccionari SignBank de la Llengua de Signes Catalana',
  enterAWord: 'Introdueix una paraula',
  search: 'Cercar',
  editMode: 'Mode d\'edició',
  
  // Common translations
  common: {
    yes: 'Sí',
    no: 'No',
    loading: 'Carregant...',
    goBack: 'Tornar Enrere',
    back: 'Enrere',
    save: 'Desar',
    cancel: 'Cancel·lar',
    word: 'Paraula',
    description: 'Descripció'
  },
  
  // Word related translations
  word_detail: {
    // Field labels
    field: {
      word: 'Paraula',
      description: 'Descripció',
      dialect: 'Dialecte',
      videos: 'Vídeos',
      angle: 'Angle',
      senses: 'Accepcións',
      dominantHand: 'Mà dominant',
      facialExpression: 'Expressió facial',
      hasContact: 'Té contacte',
      phonologicalTranscription: 'Transcripció fonològica',
      movementType: 'Tipus de moviment',
      nonManualComponents: 'Components no manuals',
      descriptions: 'Descripcions',
      descriptionText: 'Text de la descripció',
      examples: 'Exemples',
      example: 'Exemple',
      translations: 'Traduccions',
      translation: 'Traducció',
      language: 'Idioma'
    },
    
    // Action buttons
    action: {
      addSense: 'Afegir accepció',
      removeSense: 'Eliminar accepció',
      addDescription: 'Afegir descripció',
      addExample: 'Afegir exemple',
      addTranslation: 'Afegir traducció',
      requestEdit: 'Sol·licitar edició',
      createNewWord: 'Crear nova paraula'
    },
    
    // Error messages
    error: {
      needOneSense: 'Les paraules han de tenir almenys un accepció',
      needOneDescription: 'Els accepcións han de tenir almenys una descripció',
      emptyWord: 'La paraula no pot estar buida',
      emptyDescription: 'La descripció no pot estar buida',
      notFound: 'Paraula no trobada',
      loadingFailed: 'Error en carregar els detalls de la paraula. Si us plau, intenta-ho de nou.',
      savingFailed: 'Error en desar la paraula. Si us plau, intenta-ho de nou.'
    },
    
    // Success messages
    success: {
      editSubmitted: 'Sol·licitud d\'edició enviada amb èxit',
      created: 'Nova paraula creada amb èxit'
    },
    
    // Miscellaneous
    notSpecified: 'No especificat'
  }
} as TranslateKeys; 