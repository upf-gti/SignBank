import { PrismaClient, Role, Language, LexicalCategory, RelationType, Hand, WordStatus } from '@prisma/client';
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
    await prisma.wordEntry.deleteMany({});
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

  // Create words with new schema structure
  console.log('Creating words...');

  await prisma.wordEntry.create({
    data: {
      status: WordStatus.PUBLISHED,
      currentVersion: 1,
      isCreatedFromRequest: false,
      isCreatedFromEdit: false,
      
      // Word data using the Word type
      wordData: {
        word: 'Cafe',
        isNative: true,
        
        senses: [
          {
            priority: 1,
            morphologicalVariants: '-',
            usageFrequency: 'Comú',
            usageEra: 'Contemporani',
            lexicalCategory: LexicalCategory.NOUN,
            
            descriptions: [
              {
                description: 'Arbret del gènere Coffea, de la família de les rubiàcies, conreat als països tropicals, de fulles lluents i flors blanques, els fruits del qual contenen ordinàriament dues llavors planoconvexes amb un solc al llarg de la cara plana.',
                examples: ['Als matins prenem un cafe', 'El meu amic beu cafe cada dia'],
                translations: [
                  { translation: 'Coffe', language: Language.ENGLISH },
                  { translation: 'Café', language: Language.SPANISH }
                ]
              },
              {
                description: 'Cafè moca Cafè: d\'una varietat procedent d\'Aràbia.',
                examples: [],
                translations: []
              },
              {
                description: 'Llavor del cafè: Torrar cafè. Cafè molt. Cafè descafeïnat.',
                examples: [],
                translations: []
              },
              {
                description: 'Cafè torrefacte: Cafè que ha estat barrejat amb sucre en torrar-lo.',
                examples: [],
                translations: []
              },
              {
                description: 'Beguda feta per infusió de les llavors de cafè torrades i moltes. Prendre cafè. Una tassa de cafè. Cafè amb llet.',
                examples: [],
                translations: []
              },
              {
                description: 'cCafè curt: Cafè elaborat amb menys aigua de la que se sol usar per a la mateixa quantitat de cafè molt.',
                examples: [],
                translations: []
              },
              {
                description: 'Cafè exprés: Cafè fet amb una cafetera exprés. Posi\'m dos cafès exprés, si us plau.',
                examples: [],
                translations: []
              },
              {
                description: 'Cafè irlandès: Cafè amb whisky i nata.',
                examples: [],
                translations: []
              },
              {
                description: 'Cafè llarg: Cafè elaborat amb més aigua de la que se sol usar per a la mateixa quantitat de cafè molt.',
                examples: [],
                translations: []
              },
              {
                description: 'Establiment on serveixen cafè i també licors, refrescos, etc. El Cafè de la Rambla. L\'amo del cafè.',
                examples: [],
                translations: []
              },
              {
                description: 'Cafè concert: Cafè on es presenten números de música o de cant en un petit escenari.',
                examples: [],
                translations: []
              },
              {
                description: 'Cafè bord [o cafè de pobre]: Planta de la família de les papilionàcies, de flors grogues i fruit terminat en un bec ganxut, pròpia del Mediterrani meridional, i que, en determinats casos, ha reemplaçat el cafè veritable en èpoques de carestia (Astragalus boeticus).',
                examples: [],
                translations: []
              }
            ],
            
            videos: [
              {
                url: 'https://signbank.upf.com/images/LSC_-_Cafe.mp4',
                angle: 'Frontal',
                priority: 1,
                dominantHand: Hand.RIGHT,
                facialExpression: 'Neutral',
                hasContact: true,
                movementType: 'Moviment del signe Cafè',
                nonManualComponents: 'Pronunciar Cafe',
                phonologicalTranscription: '-'
              }
            ]
          }
        ],
        // Add related words
        relatedWords: []
      }
    },
  });

  await prisma.wordEntry.create({
    data: {
      status: WordStatus.PUBLISHED,
      currentVersion: 1,
      isCreatedFromRequest: false,
      isCreatedFromEdit: false,
      
      // Word data using the Word type
      wordData: {
        word: 'Camell',
        isNative: true,
        
        senses: [
          {
            priority: 1,
            morphologicalVariants: '-',
            usageFrequency: 'Comú',
            usageEra: 'Contemporani',
            lexicalCategory: LexicalCategory.NOUN,
            
            descriptions: [
              {
                description: 'Mamífer artiodàctil del gènere Camelus, de la família dels camèlids, de dimensions grans i cos robust, amb potes llargues i primes i coll llarg, fort i flexible, que té al dors un o dos geps.',
                examples: ['El meu camell és molt gros'],
                translations: [
                  { translation: 'Camel', language: Language.ENGLISH },
                  { translation: 'Camell', language: Language.SPANISH }
                ]
              },
              {
                description: 'Persona que comercia amb droga a la menuda.',
                examples: ['El seu vei es camell'],
                translations: []
              }
            ],
            
            videos: [
              {
                url: 'https://signbank.upf.com/images/LSC_-_Camell.mp4',
                angle: 'Frontal',
                priority: 1,
                dominantHand: Hand.RIGHT,
                facialExpression: 'Neutral',
                hasContact: true,
                movementType: 'Moviment del signe camell',
                nonManualComponents: 'Pronunciar Cafe',
                phonologicalTranscription: '-'
              }
            ]
          }
        ],
        // Add related words
        relatedWords: []
      }
    },
  });
  
  await prisma.wordEntry.create({
    data: {
      status: WordStatus.PUBLISHED,
      currentVersion: 1,
      isCreatedFromRequest: false,
      isCreatedFromEdit: false,
      
      // Word data using the Word type
      wordData: {
        word: 'Cames',
        isNative: true,
        
        senses: [
          {
            priority: 1,
            morphologicalVariants: '-',
            usageFrequency: 'Comú',
            usageEra: 'Contemporani',
            lexicalCategory: LexicalCategory.NOUN,
            
            descriptions: [
              {
                description: 'Extremitat inferior del cos humà, que va des del genoll fins al peu.',
                examples: ['Les meves cames estan cansades', 'Té unes cames molt llargues'],
                translations: [
                  { translation: 'Legs', language: Language.ENGLISH },
                  { translation: 'Piernas', language: Language.SPANISH }
                ]
              }
            ],
            
            videos: [
              {
                url: 'https://signbank.upf.com/images/LSC_-_Cames.mp4',
                angle: 'Frontal',
                priority: 1,
                dominantHand: Hand.RIGHT,
                facialExpression: 'Neutral',
                hasContact: true,
                movementType: 'Moviment del signe cames',
                nonManualComponents: 'Pronunciar Cames',
                phonologicalTranscription: '-'
              }
            ]
          }
        ],
        relatedWords: []
      }
    },
  });

  await prisma.wordEntry.create({
    data: {
      isCreatedFromRequest: false,
      isCreatedFromEdit: false,
      
      // Word data using the Word type
      wordData: {
        word: 'Cami',
        isNative: true,
        
        senses: [
          {
            priority: 1,
            morphologicalVariants: '-',
            usageFrequency: 'Comú',
            usageEra: 'Contemporani',
            lexicalCategory: LexicalCategory.NOUN,
            
            descriptions: [
              {
                description: 'Via que es fa servir per anar d\'un lloc a un altre.',
                examples: ['El cami era molt llarg', 'Van perdre el cami'],
                translations: [
                  { translation: 'Path', language: Language.ENGLISH },
                  { translation: 'Camino', language: Language.SPANISH }
                ]
              }
            ],
            
            videos: [
              {
                url: 'https://signbank.upf.com/images/LSC_-_Cami.mp4',
                angle: 'Frontal',
                priority: 1,
                dominantHand: Hand.RIGHT,
                facialExpression: 'Neutral',
                hasContact: true,
                movementType: 'Moviment del signe cami',
                nonManualComponents: 'Pronunciar Cami',
                phonologicalTranscription: '-'
              }
            ]
          }
        ],
        relatedWords: []
      }
    },
  });

  await prisma.wordEntry.create({
    data: {
      status: WordStatus.PUBLISHED,
      currentVersion: 1,
      isCreatedFromRequest: false,
      isCreatedFromEdit: false,
      
      // Word data using the Word type
      wordData: {
        word: 'Cap',
        isNative: true,
        
        senses: [
          {
            priority: 1,
            morphologicalVariants: '-',
            usageFrequency: 'Comú',
            usageEra: 'Contemporani',
            
            descriptions: [
              {
                description: 'Part superior del cos dels animals vertebrats que conté el cervell, els principals òrgans dels sentits i l\'extrem superior o anterior del tub digestiu.',
                examples: ['Em fa mal el cap', 'Va moure el cap'],
                translations: [
                  { translation: 'Head', language: Language.ENGLISH },
                  { translation: 'Cabeza', language: Language.SPANISH }
                ]
              }
            ],
            
            videos: [
              {
                url: 'https://signbank.upf.com/images/LSC_-_Cap.mp4',
                angle: 'Frontal',
                priority: 1,
                dominantHand: Hand.RIGHT,
                facialExpression: 'Neutral',
                hasContact: true,
                movementType: 'Moviment del signe cap (part del cos)',
                nonManualComponents: 'Pronunciar Cap',
                phonologicalTranscription: '-'
              }
            ]
          },
          {
            priority: 2,
            morphologicalVariants: '-',
            usageFrequency: 'Comú',
            usageEra: 'Contemporani',
            
            descriptions: [
              {
                description: 'Ni un, ningú, res; absència total.',
                examples: ['No hi ha cap persona', 'No en queda cap'],
                translations: [
                  { translation: 'None', language: Language.ENGLISH },
                  { translation: 'Ninguno', language: Language.SPANISH }
                ]
              }
            ],
            
            videos: [
              {
                url: 'https://signbank.upf.com/images/LSC_-_Cap.mp4',
                angle: 'Frontal',
                priority: 1,
                dominantHand: Hand.RIGHT,
                facialExpression: 'Negació',
                hasContact: false,
                movementType: 'Moviment del signe cap (negació)',
                nonManualComponents: 'Pronunciar Cap amb expressió de negació',
                phonologicalTranscription: '-'
              }
            ]
          },
          {
            priority: 3,
            morphologicalVariants: '-',
            usageFrequency: 'Comú',
            usageEra: 'Contemporani',
            
            descriptions: [
              {
                description: 'En direcció a, vers.',
                examples: ['Anem cap a casa', 'Mira cap allà'],
                translations: [
                  { translation: 'Towards', language: Language.ENGLISH },
                  { translation: 'Hacia', language: Language.SPANISH }
                ]
              }
            ],
            
            videos: [
              {
                url: 'https://signbank.upf.com/images/LSC_-_Cap.mp4',
                angle: 'Frontal',
                priority: 1,
                dominantHand: Hand.RIGHT,
                facialExpression: 'Neutral',
                hasContact: true,
                movementType: 'Moviment del signe cap (direcció)',
                nonManualComponents: 'Pronunciar Cap',
                phonologicalTranscription: '-'
              }
            ]
          }
        ],
        relatedWords: []
      }
    },
  });

  await prisma.wordEntry.create({
    data: {
      status: WordStatus.PUBLISHED,
      currentVersion: 1,
      isCreatedFromRequest: false,
      isCreatedFromEdit: false,
      
      // Word data using the Word type
      wordData: {
        word: 'Capa',
        isNative: true,        
        senses: [
          {
            priority: 1,
            morphologicalVariants: '-',
            usageFrequency: 'Comú',
            usageEra: 'Contemporani',
            lexicalCategory: LexicalCategory.NOUN,
            descriptions: [
              {
                description: 'Peça de roba llarga, folgada, oberta de davant, sense mànigues, que es porta tirada a les espatlles cobrint el vestit.',
                examples: ['Porta una capa negra', 'La capa el protegia del fred'],
                translations: [
                  { translation: 'Cape', language: Language.ENGLISH },
                  { translation: 'Capa', language: Language.SPANISH }
                ]
              }
            ],
            
            videos: [
              {
                url: 'https://signbank.upf.com/images/LSC_-_Capa.mp4',
                angle: 'Frontal',
                priority: 1,
                dominantHand: Hand.RIGHT,
                facialExpression: 'Neutral',
                hasContact: true,
                movementType: 'Moviment del signe capa',
                nonManualComponents: 'Pronunciar Capa',
                phonologicalTranscription: '-'
              }
            ]
          }
        ],
        relatedWords: []
      }
    },
  });

  await prisma.wordEntry.create({
    data: {
      status: WordStatus.PUBLISHED,
      currentVersion: 1,
      isCreatedFromRequest: false,
      isCreatedFromEdit: false,
      
      // Word data using the Word type
      wordData: {
        word: 'Car',
        isNative: true,        
        senses: [
          {
            priority: 1,
            morphologicalVariants: '-',
            usageFrequency: 'Comú',
            usageEra: 'Contemporani',
            
            descriptions: [
              {
                description: 'Que té un preu elevat, que costa molt de diners.',
                examples: ['Aquest cotxe és molt car', 'El pis era massa car'],
                translations: [
                  { translation: 'Expensive', language: Language.ENGLISH },
                  { translation: 'Caro', language: Language.SPANISH }
                ]
              }
            ],
            
            videos: [
              {
                url: 'https://signbank.upf.com/images/LSC_-_Car.mp4',
                angle: 'Frontal',
                priority: 1,
                dominantHand: Hand.RIGHT,
                facialExpression: 'Neutral',
                hasContact: true,
                movementType: 'Moviment del signe car',
                nonManualComponents: 'Pronunciar Car',
                phonologicalTranscription: '-'
              }
            ]
          }
        ],
        relatedWords: []
      }
    },
  });

  await prisma.wordEntry.create({
    data: {
      status: WordStatus.PUBLISHED,
      currentVersion: 1,
      isCreatedFromRequest: false,
      isCreatedFromEdit: false,
      
      // Word data using the Word type
      wordData: {
        word: 'Cara',
        isNative: true,
        
        senses: [
          {
            priority: 1,
            morphologicalVariants: '-',
            usageFrequency: 'Comú',
            usageEra: 'Contemporani',
            lexicalCategory: LexicalCategory.NOUN,
            descriptions: [
              {
                description: 'Part anterior del cap, on hi ha els ulls, el nas i la boca.',
                examples: ['Té una cara molt expressiva', 'Es va rentar la cara'],
                translations: [
                  { translation: 'Face', language: Language.ENGLISH },
                  { translation: 'Cara', language: Language.SPANISH }
                ]
              }
            ],
            
            videos: [
              {
                url: 'https://signbank.upf.com/images/LSC_-_Cara_1.mp4',
                angle: 'Frontal',
                priority: 1,
                dominantHand: Hand.RIGHT,
                facialExpression: 'Neutral',
                hasContact: true,
                movementType: 'Moviment del signe cara',
                nonManualComponents: 'Pronunciar Cara',
                phonologicalTranscription: '-'
              },
              {
                url: 'https://signbank.upf.com/images/LSC_-_Cara_2.mp4',
                angle: 'Frontal',
                priority: 2,
                dominantHand: Hand.RIGHT,
                facialExpression: 'Neutral',
                hasContact: true
              }
            ]
          }
        ],
        relatedWords: []
      }
    },
  });

  await prisma.wordEntry.create({
    data: {
      status: WordStatus.PUBLISHED,
      currentVersion: 1,
      isCreatedFromRequest: false,
      isCreatedFromEdit: false,
      
      // Word data using the Word type
      wordData: {
        word: 'Casa',
        isNative: true,
        
        senses: [
          {
            priority: 1,
            morphologicalVariants: '-',
            usageFrequency: 'Comú',
            usageEra: 'Contemporani',
            lexicalCategory: LexicalCategory.NOUN,
            descriptions: [
              {
                description: 'Edifici destinat a l\'habitatge de persones.',
                examples: ['Viu en una casa gran', 'La casa té un jardí'],
                translations: [
                  { translation: 'House', language: Language.ENGLISH },
                  { translation: 'Casa', language: Language.SPANISH }
                ]
              }
            ],
            
            videos: [
              {
                url: 'https://signbank.upf.com/images/LSC_-_Casa.mp4',
                angle: 'Frontal',
                priority: 1,
                dominantHand: Hand.RIGHT,
                facialExpression: 'Neutral',
                hasContact: true,
                movementType: 'Moviment del signe casa',
                nonManualComponents: 'Pronunciar Casa',
                phonologicalTranscription: '-'
              }
            ]
          }
        ],
        relatedWords: []
      }
    },
  });

  await prisma.wordEntry.create({
    data: {
      status: WordStatus.PUBLISHED,
      currentVersion: 1,
      isCreatedFromRequest: false,
      isCreatedFromEdit: false,
      
      // Word data using the Word type
      wordData: {
        word: 'Casat',
        isNative: true,
        
        senses: [
          {
            priority: 1,
            morphologicalVariants: '-',
            usageFrequency: 'Comú',
            usageEra: 'Contemporani',
            lexicalCategory: LexicalCategory.NOUN,
            descriptions: [
              {
                description: 'Estat de tenir un cònjuge o una cònjuge.',
                examples: ['Està casat amb una persona meravellosa', 'El seu estat civil és casat'],
                translations: [
                  { translation: 'Married', language: Language.ENGLISH },
                  { translation: 'Casado', language: Language.SPANISH }
                ]
              }
            ],
            
            videos: [
              {
                url: 'https://signbank.upf.com/images/LSC_-_Casat_casada.mp4',
                angle: 'Frontal',
                priority: 1,
                dominantHand: Hand.RIGHT,
                facialExpression: 'Neutral',
                hasContact: true,
                movementType: 'Moviment del signe casat',
                nonManualComponents: 'Pronunciar Casat',
                phonologicalTranscription: '-'
              }
            ]
          }
        ],
        relatedWords: []
      }
    },
  });

  await prisma.wordEntry.create({
    data: {
      status: WordStatus.PUBLISHED,
      currentVersion: 1,
      isCreatedFromRequest: false,
      isCreatedFromEdit: false,
      
      // Word data using the Word type
      wordData: {
        word: 'Dur',
        isNative: true,
        
        senses: [
          {
            priority: 1,
            morphologicalVariants: '-',
            usageFrequency: 'Comú',
            usageEra: 'Contemporani',
            lexicalCategory: LexicalCategory.ADJECTIVE,
            descriptions: [
              {
                description: 'Que té una consistència ferma o difícil de trencar.',
                examples: ['El material és molt dur', 'El gel és dur'],
                translations: [
                  { translation: 'Hard', language: Language.ENGLISH },
                  { translation: 'Duro', language: Language.SPANISH }
                ]
              }
            ],
            
            videos: [
              {
                url: 'https://signbank.upf.com/images/LSC_-_Dur_dura.mp4',
                angle: 'Frontal',
                priority: 1,
                dominantHand: Hand.RIGHT,
                facialExpression: 'Neutral',
                hasContact: true,
                movementType: 'Moviment del signe dur',
                nonManualComponents: 'Pronunciar Dur',
                phonologicalTranscription: '-'
              }
            ]
          }
        ],
        relatedWords: []
      }
    },
  });

  await prisma.wordEntry.create({
    data: {
      status: WordStatus.PUBLISHED,
      currentVersion: 1,
      isCreatedFromRequest: false,
      isCreatedFromEdit: false,
      
      // Word data using the Word type
      wordData: {
        word: 'Xocolata',
        isNative: true,
        
        senses: [
          {
            priority: 1,
            morphologicalVariants: '-',
            usageFrequency: 'Comú',
            usageEra: 'Contemporani',
            lexicalCategory: LexicalCategory.NOUN,
            descriptions: [
              {
                description: 'Producte alimentari obtingut a partir de la fruita del cacau, que es pot consumir en diverses formes, com a beguda o en forma sòlida.',
                examples: ["M'agrada la xocolata negra", "La xocolata és dolça"],
                translations: [
                  { translation: 'Chocolate', language: Language.ENGLISH },
                  { translation: 'Chocolate', language: Language.SPANISH }
                ]
              }
            ],
            
            videos: [
              {
                url: 'https://signbank.upf.com/images/LSC_-_Xocolata.mp4',
                angle: 'Frontal',
                priority: 1,
                dominantHand: Hand.RIGHT,
                facialExpression: 'Neutral',
                hasContact: true,
                movementType: 'Moviment del signe xocolata',
                nonManualComponents: 'Pronunciar Xocolata',
                phonologicalTranscription: '-'
              }
            ]
          }
        ],
        relatedWords: []
      }
    },
  });
  console.log('Created words with new schema structure');
  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 