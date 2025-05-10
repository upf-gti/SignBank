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
  definition: 'Definició',
  definitions: 'Definicions',
  definitionText: 'Text de la definició',
  requestedBy: 'Sol·licitat per',
  actions: 'Accions',
  signLanguageDictionary: 'Diccionari SignBank de la Llengua de Signes Catalana',
  enterAWord: 'Introdueix una paraula',
  search: 'Cercar',
  editMode: 'Mode d\'edició',
  status: 'Estat',
  denyReason: 'Motiu de denegació',
  newRequest: 'Nova sol·licitud',
  APPROVED: 'Aprovat',
  PENDING: 'Pendent',
  REJECTED: 'Rebutjat',
  ACCEPTED: 'Acceptat',
  DENIED: 'Denegat',
  myRequests: 'Les meves sol·licituds',
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
    definition: 'Definició',
    reject: 'Rebutjar',
    approve: 'Aprovar',
    errorSavingWordRequest: 'Error en desar la sol·licitud de paraula',
    errorRejectingWordRequest: 'Error en rebutjar la sol·licitud de paraula',
    errorRedirectingToConfirmRequest: 'Error en redirigir a la sol·licitud de paraula',
    wordRequestApproved: 'Sol·licitud de paraula aprovada',
    wordRequestRejected: 'Sol·licitud de paraula rebutjada'
  },
  
  // Word related translations
  word_detail: {
    // Field labels
    field: {
      signInfo: 'Informació del Signe',
      definitions: 'Definicions',
      word: 'Paraula',
      definition: 'Definició',
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
      definitions: 'Definicions',
      definitionText: 'Text de la definició',
      examples: 'Exemples',
      example: 'Exemple',
      translations: 'Traduccions',
      translation: 'Traducció',
      language: 'Idioma',
      rightHand: 'Mà dreta',
      leftHand: 'Mà esquerra',
      bothHands: 'Dues mans'
    },
    
    // Action buttons
    action: {
      addSense: 'Afegir accepció',
      removeSense: 'Eliminar accepció',
      addDefinition: 'Afegir definició',
      addExample: 'Afegir exemple',
      addTranslation: 'Afegir traducció',
      requestEdit: 'Sol·licitar edició',
      createNewWord: 'Crear nova paraula',
      removeDefinition: 'Eliminar definició'
    },
    
    // Error messages
    error: {
      needOneSense: 'Les paraules han de tenir almenys un accepció',
      needOneDefinition: 'Els accepcións han de tenir almenys una definició',
      emptyWord: 'La paraula no pot estar buida',
      emptyDefinition: 'La definició no pot estar buida',
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
    notSpecified: 'No especificat',
    noVideos: 'No hi ha vídeos disponibles'
  },
  language: {
    catalan: 'Català',
    spanish: 'Castellà',
    english: 'Anglès',
    other: 'Altres',
    CATALAN: 'Català',
    SPANISH: 'Castellà',
    ENGLISH: 'Anglès',
    OTHER: 'Altres'
  }
} as TranslateKeys; 