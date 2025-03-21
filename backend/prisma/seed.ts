import { PrismaClient, Role, RequestStatus, Language, LexicalCategory, RelationType, Hand, WordStatus, EditStatus } from '@prisma/client';
import * as argon2 from 'argon2';
const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');
  
  // Clear existing data - MongoDB version
  try {
    // Clean up in reverse order of dependencies
    console.log('Deleting existing data...');
    await prisma.wordEditHistoric.deleteMany({});
    await prisma.wordEdit.deleteMany({});
    await prisma.wordRequest.deleteMany({});
    await prisma.words.deleteMany({});
    await prisma.dialect.deleteMany({});
    await prisma.users.deleteMany({});
    console.log('Deleted existing data');
  } catch (error) {
    console.error('Error cleaning up data:', error);
    // Continue with seeding even if cleanup fails
  }

  // Create users
  const adminPassword = await argon2.hash('admin123');
  const userPassword = await argon2.hash('user123');
  
  console.log('Creating users...');
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
  console.log('Created users');

  // Create dialects
  console.log('Creating dialects...');
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
  console.log('Created dialects');

  // Create word requests
  console.log('Creating word requests...');
  const helloRequest = await prisma.wordRequest.create({
    data: {
      requestedWord: 'HOLA',
      requestedDescription: 'Common greeting sign',
      requestedVideoUrl: 'https://example.com/videos/hello.mp4',
      userId: user1.id,
      status: RequestStatus.PENDING,
      dominantHand: Hand.RIGHT,
      facialExpression: 'Smiling',
      hasContact: false,
      lexicalCategory: LexicalCategory.INTERJECTION,
      dialectId: barcelonaDialect.id,
      requestedSenses: [
        {
          priority: 1,
          dominantHand: Hand.RIGHT,
          descriptions: [
            {
              text: 'A greeting used when meeting someone',
              examples: ['HOLA, COM ESTÀS?'],
              translations: [
                { text: 'Hola', language: Language.CATALAN },
                { text: 'Hello', language: Language.ENGLISH },
                { text: 'Hola', language: Language.SPANISH }
              ]
            }
          ],
          videos: [
            {
              url: 'https://signbank.upf.com/images/video.mp4',
              angle: 'Front',
              priority: 1
            },
            {
              url: 'https://signbank.upf.com/images/video.mp4',
              angle: 'Side',
              priority: 2
            }
          ]
        }
      ]
    },
  });

  const catRequest = await prisma.wordRequest.create({
    data: {
      requestedWord: 'GAT',
      requestedDescription: 'Domestic feline animal',
      requestedVideoUrl: 'https://example.com/videos/cat.mp4',
      userId: user2.id,
      status: RequestStatus.PENDING,
      dominantHand: Hand.BOTH,
      hasContact: true,
      facialExpression: 'Neutral',
      lexicalCategory: LexicalCategory.NOUN,
      dialectId: barcelonaDialect.id,
      requestedSenses: [
        {
          priority: 1,
          dominantHand: Hand.BOTH,
          descriptions: [
            {
              text: 'A small domesticated carnivorous mammal with soft fur',
              examples: ['EL MEU GAT ÉS NEGRE'],
              translations: [
                { text: 'Gat', language: Language.CATALAN },
                { text: 'Cat', language: Language.ENGLISH },
                { text: 'Gato', language: Language.SPANISH }
              ]
            }
          ],
          videos: [
            {
              url: 'https://signbank.upf.com/images/video.mp4',
              angle: 'Front',
              priority: 1
            }
          ]
        },
        {
          priority: 2,
          descriptions: [
            {
              text: 'A person who plays a minor role or is an extra in a performance',
              examples: ['ELL ÉS UN GAT EN AQUESTA OBRA'],
              translations: [
                { text: 'Figurant', language: Language.CATALAN },
                { text: 'Extra', language: Language.ENGLISH },
                { text: 'Extra', language: Language.SPANISH }
              ]
            }
          ]
        }
      ]
    },
  });

  // Create a denied request
  const deniedRequest = await prisma.wordRequest.create({
    data: {
      requestedWord: 'REJECTED',
      requestedDescription: 'This is a test for rejection',
      requestedVideoUrl: 'https://example.com/videos/test.mp4',
      userId: user2.id,
      status: RequestStatus.DENIED,
      denyReason: 'This sign already exists in our database',
      requestedSenses: []
    },
  });
  console.log('Created word requests');

  // Create words
  console.log('Creating words...');
  const helloWord = await prisma.words.create({
    data: {
      word: 'HOLA',
      description: 'Common greeting sign used across various contexts',
      creatorId: user1.id,
      status: WordStatus.PUBLISHED,
      isNative: true,
      register: 'Informal',
      currentVersion: 1,
      isCreatedFromRequest: true,
      acceptedById: admin.id,
      dialectId: barcelonaDialect.id,
      
      senses: [
        {
          priority: 1,
          dominantHand: Hand.RIGHT,
          facialExpression: 'Smiling',
          hasContact: false,
          movementType: 'Waving',
          nonManualComponents: 'Slight head nod',
          morphologicalVariants: 'HOLA, HOLA+',
          phonologicalTranscription: 'H-O-L-A',
          usageFrequency: 'Very common',
          usageEra: 'Contemporary',
          
          descriptions: [
            {
              text: 'A greeting used when meeting someone',
              examples: ['HOLA, COM ESTÀS?'],
              translations: [
                { text: 'Hola', language: Language.CATALAN },
                { text: 'Hello', language: Language.ENGLISH },
                { text: 'Hola', language: Language.SPANISH }
              ]
            }
          ],
          
          videos: [
            {
              url: 'https://signbank.upf.com/images/video.mp4',
              angle: 'Front',
              priority: 1
            },
            {
              url: 'https://signbank.upf.com/images/video.mp4',
              angle: 'Side',
              priority: 2
            }
          ]
        }
      ]
    },
  });

  const catWord = await prisma.words.create({
    data: {
      word: 'GAT',
      description: 'Sign representing a domestic feline animal',
      creatorId: user2.id,
      status: WordStatus.PUBLISHED,
      isNative: true,
      register: 'Standard',
      currentVersion: 1,
      isCreatedFromRequest: true,
      acceptedById: admin.id,
      dialectId: barcelonaDialect.id,
      
      senses: [
        {
          priority: 1,
          dominantHand: Hand.BOTH,
          facialExpression: 'Neutral',
          hasContact: true,
          movementType: 'Mimicking whiskers',
          nonManualComponents: 'None',
          morphologicalVariants: 'GAT, GATET',
          phonologicalTranscription: 'G-A-T',
          usageFrequency: 'Common',
          usageEra: 'Contemporary',
          
          descriptions: [
            {
              text: 'A small domesticated carnivorous mammal with soft fur',
              examples: ['EL MEU GAT ÉS NEGRE'],
              translations: [
                { text: 'Gat', language: Language.CATALAN },
                { text: 'Cat', language: Language.ENGLISH },
                { text: 'Gato', language: Language.SPANISH }
              ]
            }
          ],
          
          videos: [
            {
              url: 'https://signbank.upf.com/images/video.mp4',
              angle: 'Front',
              priority: 1
            }
          ]
        },
        {
          priority: 2,
          descriptions: [
            {
              text: 'A person who plays a minor role or is an extra in a performance',
              examples: ['ELL ÉS UN GAT EN AQUESTA OBRA'],
              translations: [
                { text: 'Figurant', language: Language.CATALAN },
                { text: 'Extra', language: Language.ENGLISH },
                { text: 'Extra', language: Language.SPANISH }
              ]
            }
          ]
        }
      ]
    },
  });

  // Create a word with multiple senses 
  const runWord = await prisma.words.create({
    data: {
      word: 'CÓRRER',
      description: 'Sign with multiple meanings related to movement and operation',
      creatorId: admin.id,
      status: WordStatus.PUBLISHED,
      isNative: true,
      register: 'Standard',
      currentVersion: 1,
      dialectId: barcelonaDialect.id,
      
      senses: [
        {
          priority: 1,
          dominantHand: Hand.BOTH,
          facialExpression: 'Intensity',
          hasContact: false,
          movementType: 'Alternating',
          usageFrequency: 'Common',
          usageEra: 'Contemporary',
          
          descriptions: [
            {
              text: 'To move at a speed faster than walking',
              examples: ['CÓRRER AL PARC'],
              translations: [
                { text: 'Córrer', language: Language.CATALAN },
                { text: 'Run', language: Language.ENGLISH },
                { text: 'Correr', language: Language.SPANISH }
              ]
            }
          ],
          
          videos: [
            {
              url: 'https://signbank.upf.com/images/video.mp4',
              angle: 'Front',
              priority: 1
            }
          ]
        },
        {
          priority: 2,
          descriptions: [
            {
              text: 'To manage or be in charge of an organization or activity',
              examples: ['CÓRRER UNA EMPRESA'],
              translations: [
                { text: 'Gestionar', language: Language.CATALAN },
                { text: 'Manage', language: Language.ENGLISH },
                { text: 'Gestionar', language: Language.SPANISH }
              ]
            }
          ]
        }
      ]
    },
  });

  // Create regional variant
  const catVariant = await prisma.words.create({
    data: {
      word: 'GAT-GIRONA',
      description: 'Girona dialect version of the sign for cat',
      creatorId: user1.id,
      status: WordStatus.PUBLISHED,
      isNative: true,
      register: 'Regional',
      currentVersion: 1,
      dialectId: gironaDialect.id,
      
      senses: [
        {
          priority: 1,
          dominantHand: Hand.BOTH,
          facialExpression: 'Neutral',
          hasContact: true,
          movementType: 'Alternating tap',
          usageFrequency: 'Common',
          usageEra: 'Contemporary',
          
          descriptions: [
            {
              text: 'A small domesticated carnivorous mammal with soft fur (Girona variant)',
              examples: ['EL MEU GAT ÉS NEGRE'],
              translations: [
                { text: 'Gat', language: Language.CATALAN },
                { text: 'Cat', language: Language.ENGLISH },
                { text: 'Gato', language: Language.SPANISH }
              ]
            }
          ]
        }
      ],
      
      // Word relations - add regional variant relationship
      relatedWords: [
        {
          wordId: catWord.id,
          relationType: RelationType.REGIONAL_VARIANT
        }
      ]
    },
  });
  console.log('Created words');

  // Add relation from cat word to variant (both directions)
  console.log('Creating word relations...');
  try {
    await prisma.words.update({
      where: { id: catWord.id },
      data: {
        relatedWords: {
          push: {
            wordId: catVariant.id,
            relationType: RelationType.REGIONAL_VARIANT
          }
        }
      }
    });
    console.log('Created word relations');
  } catch (error) {
    console.error('Error creating word relations:', error);
  }

  // Create word edits
  console.log('Creating word edits...');
  try {
    await prisma.wordEdit.create({
      data: {
        wordId: catWord.id,
        editorId: user1.id,
        comment: 'Improving description and facial expression details',
        status: EditStatus.PENDING,
        proposedChanges: {
          description: 'Updated description for cat sign',
          senses: [
            {
              priority: 1,
              facialExpression: 'Whiskers movement',
              descriptions: [
                {
                  text: 'A small domesticated carnivorous mammal with soft fur and whiskers',
                  examples: ['EL MEU GAT ÉS NEGRE']
                }
              ]
            }
          ]
        }
      },
    });

    await prisma.wordEdit.create({
      data: {
        wordId: helloWord.id, 
        editorId: user2.id,
        comment: 'Adding more details on non-manual components',
        status: EditStatus.APPROVED,
        proposedChanges: {
          senses: [
            {
              priority: 1,
              nonManualComponents: 'Head nod and smile'
            }
          ]
        }
      },
    });
    console.log('Created word edits');
  } catch (error) {
    console.error('Error creating word edits:', error);
  }

  // Create word edit historic record
  console.log('Creating historic records...');
  try {
    await prisma.wordEditHistoric.create({
      data: {
        originalWordId: helloWord.id,
        versionNumber: 1,
        archivedAt: new Date(Date.now() - 86400000), // 1 day ago
        wordData: {
          word: 'HOLA',
          description: 'Common greeting sign used across various contexts',
          creatorId: user1.id,
          dialectId: barcelonaDialect.id,
          status: 'PUBLISHED',
          senses: [
            {
              priority: 1,
              dominantHand: 'RIGHT',
              facialExpression: 'Smiling',
              nonManualComponents: 'Slight head nod' // This got updated
            }
          ]
        }
      }
    });
    console.log('Created historic records');
  } catch (error) {
    console.error('Error creating historic records:', error);
  }

  // Update version numbers
  console.log('Updating version numbers...');
  try {
    await prisma.words.update({
      where: { id: helloWord.id },
      data: { currentVersion: 2 }
    });
    console.log('Updated version numbers');
  } catch (error) {
    console.error('Error updating version numbers:', error);
  }

  // Connect word requests to words - Modified to create new requests
  console.log('Connecting requests to words...');
  try {
    // Delete existing requests which we can't connect
    await prisma.wordRequest.delete({
      where: { id: helloRequest.id }
    });

    await prisma.wordRequest.delete({
      where: { id: catRequest.id }
    });

    // Create new requests with proper connection
    await prisma.wordRequest.create({
      data: {
        requestedWord: 'HOLA',
        requestedDescription: 'Common greeting sign',
        userId: user1.id,
        status: RequestStatus.ACCEPTED,
        dominantHand: Hand.RIGHT,
        facialExpression: 'Smiling',
        hasContact: false,
        lexicalCategory: LexicalCategory.INTERJECTION,
        dialectId: barcelonaDialect.id,
        createdWordId: helloWord.id,
        requestedSenses: [
          {
            priority: 1,
            dominantHand: Hand.RIGHT,
            descriptions: [
              {
                text: 'A greeting used when meeting someone',
                examples: ['HOLA, COM ESTÀS?'],
                translations: [
                  { text: 'Hola', language: Language.CATALAN },
                  { text: 'Hello', language: Language.ENGLISH },
                  { text: 'Hola', language: Language.SPANISH }
                ]
              }
            ]
          }
        ]
      }
    });

    await prisma.wordRequest.create({
      data: {
        requestedWord: 'GAT',
        requestedDescription: 'Domestic feline animal',
        userId: user2.id,
        status: RequestStatus.ACCEPTED,
        dominantHand: Hand.BOTH,
        hasContact: true,
        facialExpression: 'Neutral',
        lexicalCategory: LexicalCategory.NOUN,
        dialectId: barcelonaDialect.id,
        createdWordId: catWord.id,
        requestedSenses: [
          {
            priority: 1,
            dominantHand: Hand.BOTH,
            descriptions: [
              {
                text: 'A small domesticated carnivorous mammal with soft fur',
                examples: ['EL MEU GAT ÉS NEGRE'],
                translations: [
                  { text: 'Gat', language: Language.CATALAN },
                  { text: 'Cat', language: Language.ENGLISH },
                  { text: 'Gato', language: Language.SPANISH }
                ]
              }
            ]
          }
        ]
      }
    });
    console.log('Connected requests to words');
  } catch (error) {
    console.error('Error connecting requests to words:', error);
  }

  console.log('Seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 