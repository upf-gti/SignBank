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
  
  // Create Arma (weapon)
  const armaWord = await prisma.words.create({
    data: {
      word: 'ARMA',
      description: 'Signe que representa una arma o arma de foc',
      creatorId: user1.id,
      status: WordStatus.PUBLISHED,
      isNative: true,
      register: 'Estàndard',
      currentVersion: 1,
      isCreatedFromRequest: false,
      acceptedById: admin.id,
      dialectId: barcelonaDialect.id,
      
      senses: [
        {
          priority: 1,
          dominantHand: Hand.RIGHT,
          facialExpression: 'Seriós',
          hasContact: false,
          movementType: 'Imitant subjectar una pistola',
          nonManualComponents: 'Expressió facial tensa',
          morphologicalVariants: 'ARMA, PISTOLA',
          phonologicalTranscription: 'A-R-M-A',
          usageFrequency: 'Comú',
          usageEra: 'Contemporani',
          
          descriptions: [
            {
              text: 'Un objecte dissenyat o utilitzat per infligir dany o danys físics',
              examples: ['TENIR UNA ARMA', 'ARMA DE FOC'],
              translations: [
                { text: 'Arma', language: Language.CATALAN },
                { text: 'Weapon', language: Language.ENGLISH },
                { text: 'Arma', language: Language.SPANISH }
              ]
            }
          ],
          
          videos: [
            {
              url: 'https://signbank.upf.com/images/video.mp4',
              angle: 'Frontal',
              priority: 1
            }
          ]
        }
      ]
    },
  });

  // Create Arna (moth)
  const arnaWord = await prisma.words.create({
    data: {
      word: 'ARNA',
      description: 'Signe que representa una arna o arna de la roba',
      creatorId: user2.id,
      status: WordStatus.PUBLISHED,
      isNative: true,
      register: 'Estàndard',
      currentVersion: 1,
      isCreatedFromRequest: false,
      acceptedById: admin.id,
      dialectId: barcelonaDialect.id,
      
      senses: [
        {
          priority: 1,
          dominantHand: Hand.BOTH,
          facialExpression: 'Neutral',
          hasContact: false,
          movementType: 'Moviment d\'aletejament amb les mans',
          nonManualComponents: 'Lleugera inclinació del cap',
          morphologicalVariants: 'ARNA, PAPALLONA-NOCTURNA',
          phonologicalTranscription: 'A-R-N-A',
          usageFrequency: 'Poc comú',
          usageEra: 'Contemporani',
          
          descriptions: [
            {
              text: 'Un insecte nocturn similar a una papallona amb ales que aletegen',
              examples: ['HI HA UNA ARNA A L\'ARMARI', 'LES ARNES MENGEN ROBA'],
              translations: [
                { text: 'Arna', language: Language.CATALAN },
                { text: 'Moth', language: Language.ENGLISH },
                { text: 'Polilla', language: Language.SPANISH }
              ]
            }
          ],
          
          videos: [
            {
              url: 'https://signbank.upf.com/images/video.mp4',
              angle: 'Frontal',
              priority: 1
            }
          ]
        }
      ]
    },
  });

  // Create Coll (with multiple senses)
  const collWord = await prisma.words.create({
    data: {
      word: 'COLL',
      description: 'Signe amb múltiples significats relacionats amb el coll d\'una persona o un pas de muntanya',
      creatorId: admin.id,
      status: WordStatus.PUBLISHED,
      isNative: true,
      register: 'Estàndard',
      currentVersion: 1,
      dialectId: barcelonaDialect.id,
      
      senses: [
        {
          priority: 1,
          dominantHand: Hand.RIGHT,
          facialExpression: 'Neutral',
          hasContact: true,
          movementType: 'Moviment de tocar o acariciar el coll',
          nonManualComponents: 'Lleugera inclinació del cap',
          morphologicalVariants: 'COLL',
          phonologicalTranscription: 'C-O-L-L',
          usageFrequency: 'Comú',
          usageEra: 'Contemporani',
          
          descriptions: [
            {
              text: 'La part del cos que connecta el cap amb les espatlles',
              examples: ['TINC MAL DE COLL', 'PORTA UN COLLARET AL COLL'],
              translations: [
                { text: 'Coll', language: Language.CATALAN },
                { text: 'Neck', language: Language.ENGLISH },
                { text: 'Cuello', language: Language.SPANISH }
              ]
            }
          ],
          
          videos: [
            {
              url: 'https://signbank.upf.com/images/video.mp4',
              angle: 'Frontal',
              priority: 1
            }
          ]
        },
        {
          priority: 2,
          dominantHand: Hand.BOTH,
          facialExpression: 'Neutral',
          hasContact: false,
          movementType: 'Dues mans formant forma de muntanya amb depressió',
          usageFrequency: 'Comú',
          usageEra: 'Contemporani',
          
          descriptions: [
            {
              text: 'Un pas o bretxa entre muntanyes o turons',
              examples: ['HEM CREUAT EL COLL DE LA MUNTANYA', 'AQUEST COLL CONNECTA DUES VALLS'],
              translations: [
                { text: 'Coll (de muntanya)', language: Language.CATALAN },
                { text: 'Mountain pass', language: Language.ENGLISH },
                { text: 'Puerto de montaña', language: Language.SPANISH }
              ]
            }
          ],
          videos: [
            {
              url: 'https://signbank.upf.com/images/video.mp4',
              angle: 'Frontal',
              priority: 1
            }
          ]
        },
        {
          priority: 3,
          dominantHand: Hand.RIGHT,
          facialExpression: 'Neutral',
          hasContact: false,
          
          descriptions: [
            {
              text: 'La part estreta d\'una ampolla o altre recipient',
              examples: ['EL COLL DE L\'AMPOLLA', 'TRENCA EL COLL DE L\'AMPOLLA'],
              translations: [
                { text: 'Coll (d\'ampolla)', language: Language.CATALAN },
                { text: 'Bottleneck', language: Language.ENGLISH },
                { text: 'Cuello de botella', language: Language.SPANISH }
              ]
            }
          ]
        }
      ]
    },
  });
  
  console.log('Created words');

  // Word relations - removed since we have new words

  // Create word edits
  console.log('Creating word edits...');
  try {
    await prisma.wordEdit.create({
      data: {
        wordId: armaWord.id,
        editorId: user1.id,
        comment: 'Afegint context addicional sobre diferents tipus d\'armes',
        status: EditStatus.PENDING,
        proposedChanges: {
          description: 'Signe que representa una arma, arma de foc o altre eina de combat',
          senses: [
            {
              priority: 1,
              descriptions: [
                {
                  text: 'Un objecte dissenyat o utilitzat per infligir dany o danys físics, incloent armes de foc, ganivets, etc.',
                  examples: ['TENIR UNA ARMA', 'ARMA DE FOC']
                }
              ]
            }
          ]
        }
      },
    });

    await prisma.wordEdit.create({
      data: {
        wordId: collWord.id, 
        editorId: user2.id,
        comment: 'Afegint descripció més detallada del moviment per al sentit de pas de muntanya',
        status: EditStatus.APPROVED,
        proposedChanges: {
          senses: [
            {
              priority: 2,
              movementType: 'Dues mans formant forma de muntanya amb depressió al mig representant el pas'
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
        originalWordId: collWord.id,
        versionNumber: 1,
        archivedAt: new Date(Date.now() - 86400000), // 1 day ago
        wordData: {
          word: 'COLL',
          description: 'Signe amb múltiples significats relacionats amb el coll o pas de muntanya',
          creatorId: admin.id,
          dialectId: barcelonaDialect.id,
          status: 'PUBLISHED',
          senses: [
            {
              priority: 1,
              dominantHand: 'RIGHT',
              facialExpression: 'Neutral',
              nonManualComponents: 'Cap' // This got updated
            },
            {
              priority: 2,
              dominantHand: 'BOTH',
              descriptions: [
                {
                  text: 'Un pas o bretxa entre muntanyes o turons'
                }
              ]
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
      where: { id: collWord.id },
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
        requestedWord: 'ARMA',
        requestedDescription: 'Signe que representa una arma o arma de foc',
        userId: user1.id,
        status: RequestStatus.ACCEPTED,
        dominantHand: Hand.RIGHT,
        facialExpression: 'Seriós',
        hasContact: false,
        lexicalCategory: LexicalCategory.NOUN,
        dialectId: barcelonaDialect.id,
        createdWordId: armaWord.id,
        requestedSenses: [
          {
            priority: 1,
            dominantHand: Hand.RIGHT,
            descriptions: [
              {
                text: 'Un objecte dissenyat o utilitzat per infligir dany o danys físics',
                examples: ['TENIR UNA ARMA', 'ARMA DE FOC'],
                translations: [
                  { text: 'Arma', language: Language.CATALAN },
                  { text: 'Weapon', language: Language.ENGLISH },
                  { text: 'Arma', language: Language.SPANISH }
                ]
              }
            ]
          }
        ]
      }
    });

    await prisma.wordRequest.create({
      data: {
        requestedWord: 'ARNA',
        requestedDescription: 'Signe que representa una arna o arna de la roba',
        userId: user2.id,
        status: RequestStatus.ACCEPTED,
        dominantHand: Hand.BOTH,
        hasContact: false,
        facialExpression: 'Neutral',
        lexicalCategory: LexicalCategory.NOUN,
        dialectId: barcelonaDialect.id,
        createdWordId: arnaWord.id,
        requestedSenses: [
          {
            priority: 1,
            dominantHand: Hand.BOTH,
            descriptions: [
              {
                text: 'Un insecte nocturn similar a una papallona amb ales que aletegen',
                examples: ['HI HA UNA ARNA A L\'ARMARI'],
                translations: [
                  { text: 'Arna', language: Language.CATALAN },
                  { text: 'Moth', language: Language.ENGLISH },
                  { text: 'Polilla', language: Language.SPANISH }
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