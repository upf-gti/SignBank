import { PrismaClient, Role, RequestStatus, Language, LexicalCategory, RelationType, Hand, WordStatus, EditStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');
  
  // Clear existing data
  await prisma.translation.deleteMany();
  await prisma.sense.deleteMany();
  await prisma.video.deleteMany();
  await prisma.wordRelation.deleteMany();
  await prisma.wordEdit.deleteMany();
  await prisma.words.deleteMany();
  await prisma.wordRequest.deleteMany();
  await prisma.dialect.deleteMany();
  await prisma.users.deleteMany();

  // Create users
  const adminPassword = await bcrypt.hash('admin123', 10);
  const userPassword = await bcrypt.hash('user123', 10);
  
  const admin = await prisma.users.create({
    data: {
      username: 'admin',
      email: 'admin@signbank.com',
      password: adminPassword,
      role: Role.ADMIN,
    },
  });

  const user1 = await prisma.users.create({
    data: {
      username: 'maria',
      email: 'maria@example.com',
      password: userPassword,
      role: Role.USER,
    },
  });

  const user2 = await prisma.users.create({
    data: {
      username: 'jordi',
      email: 'jordi@example.com',
      password: userPassword,
      role: Role.USER,
    },
  });

  // Create dialects
  const barcelonaDialect = await prisma.dialect.create({
    data: {
      name: 'Barcelona',
      region: 'Catalonia',
      mapCoordinates: '41.3851,2.1734',
      description: 'The dialect of Catalan Sign Language used in Barcelona area',
    },
  });

  const gironaDialect = await prisma.dialect.create({
    data: {
      name: 'Girona',
      region: 'Catalonia',
      mapCoordinates: '41.9794,2.8214',
      description: 'The dialect of Catalan Sign Language used in Girona area',
    },
  });

  // Create accepted word requests
  const helloRequest = await prisma.wordRequest.create({
    data: {
      word: 'HOLA',
      description: 'Common greeting sign',
      videoUrl: 'https://example.com/videos/hello.mp4',
      userId: user1.id,
      status: RequestStatus.ACCEPTED,
    },
  });

  const catRequest = await prisma.wordRequest.create({
    data: {
      word: 'GAT',
      description: 'Domestic feline animal',
      videoUrl: 'https://example.com/videos/cat.mp4',
      userId: user2.id,
      status: RequestStatus.ACCEPTED,
    },
  });

  // Create a pending request
  const coffeeRequest = await prisma.wordRequest.create({
    data: {
      word: 'CAFÉ',
      description: 'A popular hot beverage',
      videoUrl: 'https://example.com/videos/coffee.mp4',
      userId: user1.id,
      status: RequestStatus.PENDING,
    },
  });

  // Create a denied request
  const deniedRequest = await prisma.wordRequest.create({
    data: {
      word: 'REJECTED',
      description: 'This is a test for rejection',
      videoUrl: 'https://example.com/videos/test.mp4',
      userId: user2.id,
      status: RequestStatus.DENIED,
      denyReason: 'This sign already exists in our database',
    },
  });

  // Create words from accepted requests
  const helloWord = await prisma.words.create({
    data: {
      word: 'HOLA',
      description: 'Common greeting sign used across various contexts',
      creatorId: user1.id,
      requestId: helloRequest.id,
      status: WordStatus.PUBLISHED,
      dialectId: barcelonaDialect.id,
      isNative: true,
      movementType: 'Waving',
      hasContact: false,
      facialExpression: 'Smiling',
      nonManualComponents: 'Slight head nod',
      dominantHand: Hand.RIGHT,
      morphologicalVariants: 'HOLA, HOLA+',
      phonologicalTranscription: 'H-O-L-A',
      lexicalCategory: LexicalCategory.INTERJECTION,
      register: 'Informal',
      usageFrequency: 'Very common',
      usageEra: 'Contemporary',
    },
  });

  const catWord = await prisma.words.create({
    data: {
      word: 'GAT',
      description: 'Sign representing a domestic feline animal',
      creatorId: user2.id,
      requestId: catRequest.id,
      status: WordStatus.PUBLISHED,
      dialectId: barcelonaDialect.id,
      isNative: true,
      movementType: 'Mimicking whiskers',
      hasContact: true,
      facialExpression: 'Neutral',
      nonManualComponents: 'None',
      dominantHand: Hand.BOTH,
      morphologicalVariants: 'GAT, GATET',
      phonologicalTranscription: 'G-A-T',
      lexicalCategory: LexicalCategory.NOUN,
      register: 'Standard',
      usageFrequency: 'Common',
      usageEra: 'Contemporary',
    },
  });

  // Create a word with multiple senses 
  const runWord = await prisma.words.create({
    data: {
      word: 'CÓRRER',
      description: 'Sign with multiple meanings related to movement and operation',
      creatorId: admin.id,
      status: WordStatus.PUBLISHED,
      dialectId: barcelonaDialect.id,
      isNative: true,
      movementType: 'Alternating',
      hasContact: false,
      facialExpression: 'Intensity',
      dominantHand: Hand.BOTH,
      lexicalCategory: LexicalCategory.VERB,
      register: 'Standard',
      usageFrequency: 'Common',
      usageEra: 'Contemporary',
    },
  });

  // Create regional variant
  const catVariant = await prisma.words.create({
    data: {
      word: 'GAT-GIRONA',
      description: 'Girona dialect version of the sign for cat',
      creatorId: user1.id,
      status: WordStatus.PUBLISHED,
      dialectId: gironaDialect.id,
      isNative: true,
      movementType: 'Alternating tap',
      hasContact: true,
      facialExpression: 'Neutral',
      lexicalCategory: LexicalCategory.NOUN,
      register: 'Regional',
      usageFrequency: 'Common',
      usageEra: 'Contemporary',
    },
  });

  // Create word relation (between Barcelona and Girona cat signs)
  await prisma.wordRelation.create({
    data: {
      sourceWordId: catWord.id,
      targetWordId: catVariant.id,
      relationType: RelationType.REGIONAL_VARIANT,
    },
  });

  // Add videos for words
  await prisma.video.create({
    data: {
      url: 'https://example.com/videos/hello_front.mp4',
      angle: 'Front',
      wordId: helloWord.id,
    },
  });

  await prisma.video.create({
    data: {
      url: 'https://example.com/videos/hello_side.mp4',
      angle: 'Side',
      wordId: helloWord.id,
    },
  });

  await prisma.video.create({
    data: {
      url: 'https://example.com/videos/cat_front.mp4',
      angle: 'Front',
      wordId: catWord.id,
    },
  });

  await prisma.video.create({
    data: {
      url: 'https://example.com/videos/run_front.mp4',
      angle: 'Front',
      wordId: runWord.id,
    },
  });

  // Add senses with translations
  const helloSense = await prisma.sense.create({
    data: {
      definition: 'A greeting used when meeting someone',
      example: 'HOLA, COM ESTÀS?',
      wordId: helloWord.id,
    },
  });

  const catSense = await prisma.sense.create({
    data: {
      definition: 'A small domesticated carnivorous mammal with soft fur',
      example: 'EL MEU GAT ÉS NEGRE',
      wordId: catWord.id,
    },
  });

  const catFigurantSense = await prisma.sense.create({
    data: {
      definition: 'A person who plays a minor role or is an extra in a performance',
      example: 'ELL ÉS UN GAT EN AQUESTA OBRA',
      wordId: catWord.id,
    },
  });

  // Run - physical activity sense
  const runActivitySense = await prisma.sense.create({
    data: {
      definition: 'To move at a speed faster than walking',
      example: 'CÓRRER AL PARC',
      wordId: runWord.id,
    },
  });

  // Run - manage sense
  const runManageSense = await prisma.sense.create({
    data: {
      definition: 'To manage or be in charge of an organization or activity',
      example: 'CÓRRER UNA EMPRESA',
      wordId: runWord.id,
    },
  });

  // Add translations linked to senses
  // Hello translations
  await prisma.translation.create({
    data: {
      text: 'Hola',
      language: Language.CATALAN,
      senseId: helloSense.id,
    },
  });

  await prisma.translation.create({
    data: {
      text: 'Hello',
      language: Language.ENGLISH,
      senseId: helloSense.id,
    },
  });

  await prisma.translation.create({
    data: {
      text: 'Hola',
      language: Language.SPANISH,
      senseId: helloSense.id,
    },
  });

  // Cat - animal translations
  await prisma.translation.create({
    data: {
        
      text: 'Gat',
      language: Language.CATALAN,
      senseId: catSense.id,
    },
  });

  await prisma.translation.create({
    data: {
      text: 'Cat',
      language: Language.ENGLISH,
      senseId: catSense.id,
    },
  });

  await prisma.translation.create({
    data: {
      text: 'Gato',
      language: Language.SPANISH,
      senseId: catSense.id,
    },
  });

  // Cat - figurant translations (different translations for the secondary sense)
  await prisma.translation.create({
    data: {
      text: 'Figurant',
      language: Language.CATALAN,
      senseId: catFigurantSense.id,
    },
  });

  await prisma.translation.create({
    data: {
      text: 'Extra',
      language: Language.ENGLISH,
      senseId: catFigurantSense.id,
    },
  });

  await prisma.translation.create({
    data: {
      text: 'Extra',
      language: Language.SPANISH,
      senseId: catFigurantSense.id,
    },
  });

  // Run - physical translations
  await prisma.translation.create({
    data: {
      text: 'Córrer',
      language: Language.CATALAN,
      senseId: runActivitySense.id,
    },
  });

  await prisma.translation.create({
    data: {
      text: 'Run',
      language: Language.ENGLISH,
      senseId: runActivitySense.id,
    },
  });

  await prisma.translation.create({
    data: {
      text: 'Correr',
      language: Language.SPANISH,
      senseId: runActivitySense.id,
    },
  });

  // Run - manage translations (different translations for different sense)
  await prisma.translation.create({
    data: {
      text: 'Gestionar',
      language: Language.CATALAN,
      senseId: runManageSense.id,
    },
  });

  await prisma.translation.create({
    data: {
      text: 'Manage',
      language: Language.ENGLISH,
      senseId: runManageSense.id,
    },
  });

  await prisma.translation.create({
    data: {
      text: 'Gestionar',
      language: Language.SPANISH,
      senseId: runManageSense.id,
    },
  });

  // Create a word edit
  await prisma.wordEdit.create({
    data: {
      wordId: catWord.id,
      editorId: user1.id,
      editData: {
        description: 'Updated description for cat sign',
        facialExpression: 'Whiskers movement',
      },
      comment: 'Improving description and facial expression details',
      status: EditStatus.PENDING,
    },
  });

  await prisma.wordEdit.create({
    data: {
      wordId: helloWord.id, 
      editorId: user2.id,
      editData: {
        nonManualComponents: 'Head nod and smile',
      },
      comment: 'Adding more details on non-manual components',
      status: EditStatus.APPROVED,
    },
  });

  console.log('Seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 