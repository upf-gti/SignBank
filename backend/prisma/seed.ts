import { PrismaClient, Role, Language, LexicalCategory, Hand, GlossStatus, ConfigurationChange, RelationBetweenArticulators, Location, MovementType, MovementRelatedOrientation, OrientationChange, ContactType, OrientationRelatedToLocation, HandConfiguration, RelationType } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  // Delete all existing data
  await prisma.$transaction([
    prisma.exampleTranslation.deleteMany(),
    prisma.senseTranslation.deleteMany(),
    prisma.example.deleteMany(),
    prisma.definitionTranslation.deleteMany(),
    prisma.definition.deleteMany(),
    prisma.video.deleteMany(),
    prisma.minimalPair.deleteMany(),
    prisma.signVideo.deleteMany(),
    prisma.dictionaryEntry.deleteMany(),
    prisma.relatedGloss.deleteMany(),
    prisma.sense.deleteMany(),
    prisma.glossRequest.deleteMany(),
    prisma.glossData.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  // Create 10 admin users
  const adminUsers = [];
  for (let i = 1; i <= 10; i++) {
    const password = await argon2.hash(`admin${i}123`);
    const admin = await prisma.user.create({
      data: {
        email: `admin${i}@signbank.com`,
        username: `admin${i}`,
        password: password,
        role: Role.ADMIN,
        name: `Admin`,
        lastName: `${i}`,
      },
    });
    adminUsers.push(admin);
  }

  console.log('Created admin users:');
  adminUsers.forEach(admin => {
    console.log(`Username: ${admin.username} | Email: ${admin.email} | Password: admin${admin.username.slice(5)}123`);
  });

  // Create COLL gloss data
  const collGlossData = await prisma.glossData.create({
    data: {
      gloss: 'COLL',
      currentVersion: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  // Create senses for COLL
  const collSenses = await Promise.all([
    // First sense: Human neck
    prisma.sense.create({
      data: {
        senseTitle: 'Coll (part del cos)',
        priority: 1,
        lexicalCategory: LexicalCategory.NOUN,
        glossDataId: collGlossData.id,
        senseTranslations: {
          create: [
            {
              translation: 'Coll (part del cos)',
              language: Language.CATALAN,
            },
            {
              translation: 'Cuello (parte del cuerpo)',
              language: Language.SPANISH,
            },
            {
              translation: 'Neck (body part)',
              language: Language.ENGLISH,
            },
          ],
        },
        examples: {
          create: [
            {
              example: 'Em fa mal el coll',
              exampleVideoURL: 'videos/LSC_-_Cap.mp4',
              exampleTranslations: {
                create: [
                  {
                    translation: 'Me duele el cuello',
                    language: Language.SPANISH,
                  },
                  {
                    translation: 'Em fa mal el coll',
                    language: Language.CATALAN,
                  },
                  {
                    translation: 'My neck hurts',
                    language: Language.ENGLISH,
                  },
                ],
              },
            },
          ],
        },
      },
    }),
    // Second sense: Bottle neck
    prisma.sense.create({
      data: {
        senseTitle: 'Coll (d\'ampolla)',
        priority: 2,
        lexicalCategory: LexicalCategory.NOUN,
        glossDataId: collGlossData.id,
        senseTranslations: {
          create: [
            {
              translation: 'Coll (d\'ampolla)',
              language: Language.CATALAN,
            },
            {
              translation: 'Cuello (de botella)',
              language: Language.SPANISH,
            },
            {
              translation: 'Neck (of a bottle)',
              language: Language.ENGLISH,
            },
          ],
        },
        examples: {
          create: [
            {
              example: 'S\'ha trencat el coll de l\'ampolla',
              exampleVideoURL: 'videos/LSC_-_Cames.mp4',
              exampleTranslations: {
                create: [
                  {
                    translation: 'Se ha roto el cuello de la botella',
                    language: Language.SPANISH,
                  },
                  {
                    translation: 'S\'ha trencat el coll de l\'ampolla',
                    language: Language.CATALAN,
                  },
                  {
                    translation: 'The bottle neck broke',
                    language: Language.ENGLISH,
                  },
                ],
              },
            },
          ],
        },
      },
    }),
    // Third sense: Mountain pass
    prisma.sense.create({
      data: {
        senseTitle: 'Coll (de muntanya)',
        priority: 3,
        lexicalCategory: LexicalCategory.NOUN,
        glossDataId: collGlossData.id,
        senseTranslations: {
          create: [
            {
              translation: 'Coll (de muntanya)',
              language: Language.CATALAN,
            },
            {
              translation: 'Puerto (de montaña)',
              language: Language.SPANISH,
            },
            {
              translation: 'Mountain pass',
              language: Language.ENGLISH,
            },
          ],
        },
        examples: {
          create: [
            {
              example: 'Hem arribat al coll de la muntanya',
              exampleVideoURL: 'videos/LSC_-_Cap.mp4',
              exampleTranslations: {
                create: [
                  {
                    translation: 'Hemos llegado al puerto de la montaña',
                    language: Language.SPANISH,
                  },
                  {
                    translation: 'Hem arribat al coll de la muntanya',
                    language: Language.CATALAN,
                  },
                  {
                    translation: 'We\'ve reached the mountain pass',
                    language: Language.ENGLISH,
                  },
                ],
              },
            },
          ],
        },
      },
    }),
  ]);

  // Create definitions for each sense
  await Promise.all(
    collSenses.map((sense) =>
      prisma.definition.create({
        data: {
          title: sense.senseTitle === 'Human neck' 
            ? 'Coll (part del cos)'
            : sense.senseTitle === 'Bottle neck'
            ? 'Coll (d\'ampolla)'
            : 'Coll (de muntanya)',
          definition: sense.senseTitle === 'Human neck' 
            ? 'Part del cos queuneix el cap amb el tronc'
            : sense.senseTitle === 'Bottle neck'
            ? 'Part estreta i allargada d\'una ampolla o recipient similar'
            : 'Depressió en una carena muntanyosa que permet el pas entre dues valls',
          videoDefinitionUrl: sense.senseTitle === 'Human neck' 
            ? 'videos/LSC_-_Cap.mp4'
            : sense.senseTitle === 'Bottle neck'
            ? 'videos/LSC_-_Cames.mp4'
            : 'videos/LSC_-_Camell.mp4',
          senseId: sense.id,
          definitionTranslations: {
            create: [
              {
                translation: sense.senseTitle === 'Human neck' 
                  ? 'Part del cos queuneix el cap amb el tronc'
                  : sense.senseTitle === 'Bottle neck'
                  ? 'Part estret i allargada d\'una ampolla o recipient similar'
                  : 'Depressió en una carena muntanyosa que permet el pas entre dues valls',
                language: Language.CATALAN,
              },
              {
                translation: sense.senseTitle === 'Human neck'
                  ? 'Parte del cuerpo que une la cabeza con el tronco'
                  : sense.senseTitle === 'Bottle neck'
                  ? 'Parte estrecha y alargada de una botella o recipiente similar'
                  : 'Depresión en una cadena montañosa que permite el paso entre dos valles',
                language: Language.SPANISH,
              },
              {
                translation: sense.senseTitle === 'Human neck'
                  ? 'Part of the body that connects the head to the torso'
                  : sense.senseTitle === 'Bottle neck'
                  ? 'Narrow and elongated part of a bottle or similar container'
                  : 'Depression in a mountain range that allows passage between two valleys',
                language: Language.ENGLISH,
              },
            ],
          },
        },
      })
    )
  );

  // Create sign videos for each sense
  await Promise.all(
    collSenses.map((sense) =>
      prisma.signVideo.create({
        data: {
          title: `COLL - ${sense.senseTitle}`,
          priority: 1,
          sense: {
            connect: {
              id: sense.id
            }
          },
          videoData: {
            create: {
              hands: sense.senseTitle === 'Human neck' ? Hand.RIGHT : Hand.BOTH,
              configuration: HandConfiguration.CONF_1,
              configurationChanges: ConfigurationChange.BENDING,
              relationBetweenArticulators: RelationBetweenArticulators.ABOVE,
              location: sense.senseTitle === 'Human neck' ? Location.NECK : Location.NEUTRAL_SPACE,
              movementRelatedOrientation: MovementRelatedOrientation.FRONT,
              orientationRelatedToLocation: OrientationRelatedToLocation.AO_FINGERS_CONTRA,
              orientationChange: OrientationChange.EXTENSION,
              contactType: ContactType.CONTINUOUS,
              movementType: MovementType.STRAIGHT,
              vocalization: "none",
              nonManualComponent: "none",
              inicialization: "none",
            }
          },
          videos: {
            create: [
              {
                url: `videos/LSC_-_Cap.mp4`,
                angle: 'front',
                priority: 1,
              },
              {
                url: `videos/LSC_-_Capa.mp4`,
                angle: 'side',
                priority: 2,
              },
              {
                url: `videos/LSC_-_Car.mp4`,
                angle: 'close-up',
                priority: 3,
              },
            ],
          },
        },
      })
    )
  );

  // Create dictionary entry for COLL
  await prisma.dictionaryEntry.create({
    data: {
      status: GlossStatus.PUBLISHED,
      currentVersion: 1,
      glossDataId: collGlossData.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  // Create CONTENT gloss data
  const contentGlossData = await prisma.glossData.create({
    data: {
      gloss: 'CONTENT',
      currentVersion: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  // Create FELIÇ gloss data
  const felicGlossData = await prisma.glossData.create({
    data: {
      gloss: 'FELIÇ',
      currentVersion: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  // Create sense for CONTENT
  const contentSense = await prisma.sense.create({
    data: {
      senseTitle: '',
      priority: 1,
      lexicalCategory: LexicalCategory.ADJECTIVE,
      glossDataId: contentGlossData.id,
      senseTranslations: {
        create: [
          {
            translation: 'Content',
            language: Language.CATALAN,
          },
          {
            translation: 'Contento',
            language: Language.SPANISH,
          },
          {
            translation: 'Happy',
            language: Language.ENGLISH,
          },
        ],
      },
      examples: {
        create: [
          {
            example: 'Estic molt content amb els resultats',
            exampleVideoURL: 'videos/LSC_-_Cap.mp4',
            exampleTranslations: {
              create: [
                {
                  translation: 'Estoy muy contento con los resultados',
                  language: Language.SPANISH,
                },
                {
                  translation: 'Estic molt content amb els resultats',
                  language: Language.CATALAN,
                },
                {
                  translation: 'I am very happy with the results',
                  language: Language.ENGLISH,
                },
              ],
            },
          },
        ],
      },
    },
  });

  // Create sense for FELIÇ
  const felicSense = await prisma.sense.create({
    data: {
      senseTitle: '',
      priority: 1,
      lexicalCategory: LexicalCategory.ADJECTIVE,
      glossDataId: felicGlossData.id,
      senseTranslations: {
        create: [
          {
            translation: 'Feliç',
            language: Language.CATALAN,
          },
          {
            translation: 'Feliz',
            language: Language.SPANISH,
          },
          {
            translation: 'Happy',
            language: Language.ENGLISH,
          },
        ],
      },
      examples: {
        create: [
          {
            example: 'Avui em sento molt feliç',
            exampleVideoURL: 'videos/LSC_-_Cames.mp4',
            exampleTranslations: {
              create: [
                {
                  translation: 'Hoy me siento muy feliz',
                  language: Language.SPANISH,
                },
                {
                  translation: 'Avui em sento molt feliç',
                  language: Language.CATALAN,
                },
                {
                  translation: 'Today I feel very happy',
                  language: Language.ENGLISH,
                },
              ],
            },
          },
        ],
      },
    },
  });

  // Create definitions for CONTENT
  await prisma.definition.create({
    data: {
      title: '',
      definition: 'Estat d\'ànim de qui se sent satisfet',
      videoDefinitionUrl: 'videos/LSC_-_Camell.mp4',
      senseId: contentSense.id,
      definitionTranslations: {
        create: [
          {
            translation: 'Estat d\'ànim de qui se sent satisfet',
            language: Language.CATALAN,
          },
          {
            translation: 'Estado de ánimo de quien se siente satisfecho',
            language: Language.SPANISH,
          },
          {
            translation: 'State of mind of someone who feels satisfied',
            language: Language.ENGLISH,
          },
        ],
      },
    },
  });

  // Create definitions for FELIÇ
  await prisma.definition.create({
    data: {
      title: '',
      definition: 'Que experimenta un estat de satisfacció i benestar',
      videoDefinitionUrl: 'videos/LSC_-_Car.mp4',
      senseId: felicSense.id,
      definitionTranslations: {
        create: [
          {
            translation: 'Que experimenta un estat de satisfacció i benestar',
            language: Language.CATALAN,
          },
          {
            translation: 'Que experimenta un estado de satisfacción y bienestar',
            language: Language.SPANISH,
          },
          {
            translation: 'Experiencing a state of satisfaction and well-being',
            language: Language.ENGLISH,
          },
        ],
      },
    },
  });

  // Create sign videos with different phonological parameters for CONTENT
  await prisma.signVideo.create({
    data: {
      title: '',
      priority: 1,
      sense: {
        connect: {
          id: contentSense.id
        }
      },
      videoData: {
        create: {
          hands: Hand.BOTH,
          configuration: HandConfiguration.CONF_8,
          configurationChanges: ConfigurationChange.OPENING_AND_SPREADING,
          relationBetweenArticulators: RelationBetweenArticulators.CROSS,
          location: Location.CHEST,
          movementRelatedOrientation: MovementRelatedOrientation.FRONT,
          orientationRelatedToLocation: OrientationRelatedToLocation.AO_FINGERS_CONTRA,
          orientationChange: OrientationChange.FLEXION,
          contactType: ContactType.BRUSH,
          movementType: MovementType.SPIRAL,
          vocalization: "none",
          nonManualComponent: "smile",
          inicialization: "none",
        }
      },
      videos: {
        create: [
          {
            url: 'videos/LSC_-_Camell.mp4',
            angle: 'front',
            priority: 1,
          },
          {
            url: 'videos/LSC_-_Cap.mp4',
            angle: 'side',
            priority: 2,
          },
        ],
      },
    },
  });

  // Create sign videos with different phonological parameters for FELIÇ
  await prisma.signVideo.create({
    data: {
      title: '',
      priority: 1,
      sense: {
        connect: {
          id: felicSense.id
        }
      },
      videoData: {
        create: {
          hands: Hand.RIGHT,
          configuration: HandConfiguration.CONF_15,
          configurationChanges: ConfigurationChange.CLOSING_AND_WIGGLING,
          relationBetweenArticulators: RelationBetweenArticulators.FRONT,
          location: Location.CHEEK,
          movementRelatedOrientation: MovementRelatedOrientation.FRONT,
          orientationRelatedToLocation: OrientationRelatedToLocation.AO_FINGERS_CONTRA,
          orientationChange: OrientationChange.EXTENSION_AND_PRONATION,
          contactType: ContactType.DOUBLE,
          movementType: MovementType.CIRCLE,
          vocalization: "none",
          nonManualComponent: "smile with cheek puff",
          inicialization: "none",
        }
      },
      videos: {
        create: [
          {
            url: 'videos/LSC_-_Cames.mp4',
            angle: 'front',
            priority: 1,
          },
          {
            url: 'videos/LSC_-_Car.mp4',
            angle: 'side',
            priority: 2,
          },
        ],
      },
    },
  });

  // Create dictionary entries for both signs
  await prisma.dictionaryEntry.create({
    data: {
      status: GlossStatus.PUBLISHED,
      currentVersion: 1,
      glossDataId: contentGlossData.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  await prisma.dictionaryEntry.create({
    data: {
      status: GlossStatus.PUBLISHED,
      currentVersion: 1,
      glossDataId: felicGlossData.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  // Create synonym relation between CONTENT and FELIÇ
  await prisma.relatedGloss.create({
    data: {
      relationType: RelationType.SYNONYM,
      sourceGlossId: contentGlossData.id,
      targetGlossId: felicGlossData.id,
    },
  });

  // Create PETIT gloss data
  const petitGlossData = await prisma.glossData.create({
    data: {
      gloss: 'PETIT',
      currentVersion: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  // Create GRAN gloss data
  const granGlossData = await prisma.glossData.create({
    data: {
      gloss: 'GRAN',
      currentVersion: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  // Create BANC gloss data
  const bancGlossData = await prisma.glossData.create({
    data: {
      gloss: 'BANC',
      currentVersion: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  // Create SOTA gloss data
  const sotaGlossData = await prisma.glossData.create({
    data: {
      gloss: 'SOTA',
      currentVersion: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  // Create SOBRE gloss data
  const sobreGlossData = await prisma.glossData.create({
    data: {
      gloss: 'SOBRE',
      currentVersion: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  // Create senses for PETIT
  const petitSense = await prisma.sense.create({
    data: {
      senseTitle: '',
      priority: 1,
      lexicalCategory: LexicalCategory.ADJECTIVE,
      glossDataId: petitGlossData.id,
      senseTranslations: {
        create: [
          {
            translation: 'Petit',
            language: Language.CATALAN,
          },
          {
            translation: 'Pequeño',
            language: Language.SPANISH,
          },
          {
            translation: 'Small',
            language: Language.ENGLISH,
          },
        ],
      },
      examples: {
        create: [
          {
            example: 'El gos és molt petit',
            exampleVideoURL: 'videos/LSC_-_Cap.mp4',
            exampleTranslations: {
              create: [
                {
                  translation: 'El perro es muy pequeño',
                  language: Language.SPANISH,
                },
                {
                  translation: 'El gos és molt petit',
                  language: Language.CATALAN,
                },
                {
                  translation: 'The dog is very small',
                  language: Language.ENGLISH,
                },
              ],
            },
          },
        ],
      },
    },
  });

  // Create senses for GRAN
  const granSense = await prisma.sense.create({
    data: {
      senseTitle: '',
      priority: 1,
      lexicalCategory: LexicalCategory.ADJECTIVE,
      glossDataId: granGlossData.id,
      senseTranslations: {
        create: [
          {
            translation: 'Gran',
            language: Language.CATALAN,
          },
          {
            translation: 'Grande',
            language: Language.SPANISH,
          },
          {
            translation: 'Big',
            language: Language.ENGLISH,
          },
        ],
      },
      examples: {
        create: [
          {
            example: 'La casa és molt gran',
            exampleVideoURL: 'videos/LSC_-_Cames.mp4',
            exampleTranslations: {
              create: [
                {
                  translation: 'La casa es muy grande',
                  language: Language.SPANISH,
                },
                {
                  translation: 'La casa és molt gran',
                  language: Language.CATALAN,
                },
                {
                  translation: 'The house is very big',
                  language: Language.ENGLISH,
                },
              ],
            },
          },
        ],
      },
    },
  });

  // Create senses for BANC (two senses: bank and bench)
  const bancSense1 = await prisma.sense.create({
    data: {
      senseTitle: 'Banc (entitat financera)',
      priority: 1,
      lexicalCategory: LexicalCategory.NOUN,
      glossDataId: bancGlossData.id,
      senseTranslations: {
        create: [
          {
            translation: 'Banc (institució financera)',
            language: Language.CATALAN,
          },
          {
            translation: 'Banco (institución financiera)',
            language: Language.SPANISH,
          },
          {
            translation: 'Bank (financial institution)',
            language: Language.ENGLISH,
          },
        ],
      },
      examples: {
        create: [
          {
            example: 'He d\'anar al banc',
            exampleVideoURL: 'videos/LSC_-_Car.mp4',
            exampleTranslations: {
              create: [
                {
                  translation: 'Tengo que ir al banco',
                  language: Language.SPANISH,
                },
                {
                  translation: 'He d\'anar al banc',
                  language: Language.CATALAN,
                },
                {
                  translation: 'I have to go to the bank',
                  language: Language.ENGLISH,
                },
              ],
            },
          },
        ],
      },
    },
  });

  const bancSense2 = await prisma.sense.create({
    data: {
      senseTitle: 'Banc (seient)',
      priority: 2,
      lexicalCategory: LexicalCategory.NOUN,
      glossDataId: bancGlossData.id,
      senseTranslations: {
        create: [
          {
            translation: 'Banc (seient)',
            language: Language.CATALAN,
          },
          {
            translation: 'Banco (asiento)',
            language: Language.SPANISH,
          },
          {
            translation: 'Bench (seat)',
            language: Language.ENGLISH,
          },
        ],
      },
      examples: {
        create: [
          {
            example: 'Seu al banc del parc',
            exampleVideoURL: 'videos/LSC_-_Camell.mp4',
            exampleTranslations: {
              create: [
                {
                  translation: 'Siéntate en el banco del parque',
                  language: Language.SPANISH,
                },
                {
                  translation: 'Seu al banc del parc',
                  language: Language.CATALAN,
                },
                {
                  translation: 'Sit on the park bench',
                  language: Language.ENGLISH,
                },
              ],
            },
          },
        ],
      },
    },
  });

  // Create senses for SOTA
  const sotaSense = await prisma.sense.create({
    data: {
      senseTitle: '',
      priority: 1,
      lexicalCategory: LexicalCategory.PARTICLE,
      glossDataId: sotaGlossData.id,
      senseTranslations: {
        create: [
          {
            translation: 'Sota',
            language: Language.CATALAN,
          },
          {
            translation: 'Debajo',
            language: Language.SPANISH,
          },
          {
            translation: 'Under',
            language: Language.ENGLISH,
          },
        ],
      },
      examples: {
        create: [
          {
            example: 'El gat és sota la taula',
            exampleVideoURL: 'videos/LSC_-_Cap.mp4',
            exampleTranslations: {
              create: [
                {
                  translation: 'El gato está debajo de la mesa',
                  language: Language.SPANISH,
                },
                {
                  translation: 'El gat és sota la taula',
                  language: Language.CATALAN,
                },
                {
                  translation: 'The cat is under the table',
                  language: Language.ENGLISH,
                },
              ],
            },
          },
        ],
      },
    },
  });

  // Create senses for SOBRE
  const sobreSense = await prisma.sense.create({
    data: {
      senseTitle: '',
      priority: 1,
      lexicalCategory: LexicalCategory.ADVERB,
      glossDataId: sobreGlossData.id,
      senseTranslations: {
        create: [
          {
            translation: 'Sobre',
            language: Language.CATALAN,
          },
          {
            translation: 'Encima',
            language: Language.SPANISH,
          },
          {
            translation: 'Over',
            language: Language.ENGLISH,
          },
        ],
      },
      examples: {
        create: [
          {
            example: 'El llibre és sobre la taula',
            exampleVideoURL: 'videos/LSC_-_Cames.mp4',
            exampleTranslations: {
              create: [
                {
                  translation: 'El libro está encima de la mesa',
                  language: Language.SPANISH,
                },
                {
                  translation: 'El llibre és sobre la taula',
                  language: Language.CATALAN,
                },
                {
                  translation: 'The book is on the table',
                  language: Language.ENGLISH,
                },
              ],
            },
          },
        ],
      },
    },
  });

  // Create second sense for SOBRE (envelope)
  const sobreSense2 = await prisma.sense.create({
    data: {
      senseTitle: '',
      priority: 2,
      lexicalCategory: LexicalCategory.NOUN,
      glossDataId: sobreGlossData.id,
      senseTranslations: {
        create: [
          {
            translation: 'Sobre (per a cartes)',
            language: Language.CATALAN,
          },
          {
            translation: 'Sobre (para cartas)',
            language: Language.SPANISH,
          },
          {
            translation: 'Envelope',
            language: Language.ENGLISH,
          },
        ],
      },
      examples: {
        create: [
          {
            example: 'Posa la carta dins el sobre',
            exampleVideoURL: 'videos/LSC_-_Car.mp4',
            exampleTranslations: {
              create: [
                {
                  translation: 'Pon la carta dentro del sobre',
                  language: Language.SPANISH,
                },
                {
                  translation: 'Posa la carta dins el sobre',
                  language: Language.CATALAN,
                },
                {
                  translation: 'Put the letter in the envelope',
                  language: Language.ENGLISH,
                },
              ],
            },
          },
        ],
      },
    },
  });

  // Create definitions and videos for each sense
  await Promise.all([
    // PETIT definition
    prisma.definition.create({
      data: {
        title: '',
        definition: 'De dimensions o grandària reduïdes',
        videoDefinitionUrl: 'videos/LSC_-_Cap.mp4',
        senseId: petitSense.id,
        definitionTranslations: {
          create: [
            {
              translation: 'De dimensions o grandària reduïdes',
              language: Language.CATALAN,
            },
            {
              translation: 'De dimensiones o tamaño reducidos',
              language: Language.SPANISH,
            },
            {
              translation: 'Of reduced dimensions or size',
              language: Language.ENGLISH,
            },
          ],
        },
      },
    }),
    // GRAN definition
    prisma.definition.create({
      data: {
        title: '',
        definition: 'De dimensions o grandària considerables',
        videoDefinitionUrl: 'videos/LSC_-_Cames.mp4',
        senseId: granSense.id,
        definitionTranslations: {
          create: [
            {
              translation: 'De dimensions o grandària considerables',
              language: Language.CATALAN,
            },
            {
              translation: 'De dimensiones o tamaño considerables',
              language: Language.SPANISH,
            },
            {
              translation: 'Of considerable dimensions or size',
              language: Language.ENGLISH,
            },
          ],
        },
      },
    }),
    // BANC definitions (both senses)
    prisma.definition.create({
      data: {
        title: '',
        definition: 'Entitat financera que administra i presta diners',
        videoDefinitionUrl: 'videos/LSC_-_Car.mp4',
        senseId: bancSense1.id,
        definitionTranslations: {
          create: [
            {
              translation: 'Entitat financera que administra i presta diners',
              language: Language.CATALAN,
            },
            {
              translation: 'Entidad financiera que administra y presta dinero',
              language: Language.SPANISH,
            },
            {
              translation: 'Financial institution that manages and lends money',
              language: Language.ENGLISH,
            },
          ],
        },
      },
    }),
    prisma.definition.create({
      data: {
        title: '',
        definition: 'Seient llarg amb respatller o sense',
        videoDefinitionUrl: 'videos/LSC_-_Camell.mp4',
        senseId: bancSense2.id,
        definitionTranslations: {
          create: [
            {
              translation: 'Seient llarg amb respatller o sense',
              language: Language.CATALAN,
            },
            {
              translation: 'Asiento largo con o sin respaldo',
              language: Language.SPANISH,
            },
            {
              translation: 'Long seat with or without a backrest',
              language: Language.ENGLISH,
            },
          ],
        },
      },
    }),
    // SOTA definition
    prisma.definition.create({
      data: {
        title: '',
        definition: 'En una posició inferior respecte a alguna cosa',
        videoDefinitionUrl: 'videos/LSC_-_Cap.mp4',
        senseId: sotaSense.id,
        definitionTranslations: {
          create: [
            {
              translation: 'En una posició inferior respecte a alguna cosa',
              language: Language.CATALAN,
            },
            {
              translation: 'En una posición inferior respecto a algo',
              language: Language.SPANISH,
            },
            {
              translation: 'In a position below something',
              language: Language.ENGLISH,
            },
          ],
        },
      },
    }),
    // SOBRE definition
    prisma.definition.create({
      data: {
        title: '',
        definition: 'En una posició superior respecte a alguna cosa',
        videoDefinitionUrl: 'videos/LSC_-_Cames.mp4',
        senseId: sobreSense.id,
        definitionTranslations: {
          create: [
            {
              translation: 'En una posició superior respecte a alguna cosa',
              language: Language.CATALAN,
            },
            {
              translation: 'En una posición superior respecto a algo',
              language: Language.SPANISH,
            },
            {
              translation: 'In a position above something',
              language: Language.ENGLISH,
            },
          ],
        },
      },
    }),
    // SOBRE (envelope) definition
    prisma.definition.create({
      data: {
        title: '',
        definition: 'Coberta de paper dins la qual es posa una carta o un document per enviar-lo',
        videoDefinitionUrl: 'videos/LSC_-_Car.mp4',
        senseId: sobreSense2.id,
        definitionTranslations: {
          create: [
            {
              translation: 'Coberta de paper dins la qual es posa una carta o un document per enviar-lo',
              language: Language.CATALAN,
            },
            {
              translation: 'Cubierta de papel dentro de la cual se pone una carta o documento para enviarlo',
              language: Language.SPANISH,
            },
            {
              translation: 'Paper covering in which a letter or document is placed for sending',
              language: Language.ENGLISH,
            },
          ],
        },
      },
    }),
  ]);

  // Create sign videos for each sense with different phonological parameters
  await Promise.all([
    // PETIT sign video
    prisma.signVideo.create({
      data: {
        title: '',
        priority: 1,
        sense: {
          connect: {
            id: petitSense.id
          }
        },
        videoData: {
          create: {
            hands: Hand.BOTH,
            configuration: HandConfiguration.CONF_23,
            configurationChanges: ConfigurationChange.CLOSING_AND_RUBBING,
            relationBetweenArticulators: RelationBetweenArticulators.INSIDE,
            location: Location.NEUTRAL_SPACE,
            movementRelatedOrientation: MovementRelatedOrientation.FRONT,
            orientationRelatedToLocation: OrientationRelatedToLocation.AO_FINGERS_CONTRA,
            orientationChange: OrientationChange.PRONATION,
            contactType: ContactType.CONTINUOUS_TO_FINAL,
            movementType: MovementType.MOTIVATED_SHAPE,
            vocalization: "none",
            nonManualComponent: "cheeks in",
            inicialization: "none",
          }
        },
        videos: {
          create: [
            {
              url: 'videos/LSC_-_Cap.mp4',
              angle: 'front',
              priority: 1,
            },
            {
              url: 'videos/LSC_-_Cames.mp4',
              angle: 'side',
              priority: 2,
            },
          ],
        },
      },
    }),
    // GRAN sign video
    prisma.signVideo.create({
      data: {
        title: '',
        priority: 1,
        sense: {
          connect: {
            id: granSense.id
          }
        },
        videoData: {
          create: {
            hands: Hand.BOTH,
            configuration: HandConfiguration.CONF_31,
            configurationChanges: ConfigurationChange.OPENING_AND_RUBBING,
            relationBetweenArticulators: RelationBetweenArticulators.ABOVE_BELOW,
            location: Location.NEUTRAL_SPACE,
            movementRelatedOrientation: MovementRelatedOrientation.FRONT,
            orientationRelatedToLocation: OrientationRelatedToLocation.AO_FINGERS_CONTRA,
            orientationChange: OrientationChange.SUPINATION,
            contactType: ContactType.INITIAL,
            movementType: MovementType.ZIGZAG,
            vocalization: "none",
            nonManualComponent: "cheeks out",
            inicialization: "none",
          }
        },
        videos: {
          create: [
            {
              url: 'videos/LSC_-_Camell.mp4',
              angle: 'front',
              priority: 1,
            },
            {
              url: 'videos/LSC_-_Car.mp4',
              angle: 'side',
              priority: 2,
            },
          ],
        },
      },
    }),
    // BANC sign videos (both senses)
    prisma.signVideo.create({
      data: {
        title: '',
        priority: 1,
        sense: {
          connect: {
            id: bancSense1.id
          }
        },
        videoData: {
          create: {
            hands: Hand.RIGHT,
            configuration: HandConfiguration.CONF_12,
            configurationChanges: ConfigurationChange.UNBENDING,
            relationBetweenArticulators: RelationBetweenArticulators.FRONT,
            location: Location.WEAK_HAND_PALM,
            movementRelatedOrientation: MovementRelatedOrientation.FRONT,
            orientationRelatedToLocation: OrientationRelatedToLocation.AO_FINGERS_CONTRA,
            orientationChange: OrientationChange.RADIAL_AND_ULNAR_FLEXION,
            contactType: ContactType.CONTINUOUS,
            movementType: MovementType.CROSS,
            vocalization: "none",
            nonManualComponent: "none",
            inicialization: "none",
          }
        },
        videos: {
          create: [
            {
              url: 'videos/LSC_-_Cap.mp4',
              angle: 'front',
              priority: 1,
            },
            {
              url: 'videos/LSC_-_Car.mp4',
              angle: 'side',
              priority: 2,
            },
          ],
        },
      },
    }),
    prisma.signVideo.create({
      data: {
        title: '',
        priority: 1,
        sense: {
          connect: {
            id: bancSense2.id
          }
        },
        videoData: {
          create: {
            hands: Hand.BOTH,
            configuration: HandConfiguration.CONF_18,
            configurationChanges: ConfigurationChange.CURVING,
            relationBetweenArticulators: RelationBetweenArticulators.NEXT_TO,
            location: Location.HORIZONTAL_PLANE,
            movementRelatedOrientation: MovementRelatedOrientation.FRONT,
            orientationRelatedToLocation: OrientationRelatedToLocation.AO_FINGERS_CONTRA,
            orientationChange: OrientationChange.ROTATION,
            contactType: ContactType.CONTINUOUS,
            movementType: MovementType.STRAIGHT_TO_CIRCLE,
            vocalization: "none",
            nonManualComponent: "none",
            inicialization: "none",
          }
        },
        videos: {
          create: [
            {
              url: 'videos/LSC_-_Cames.mp4',
              angle: 'front',
              priority: 1,
            },
            {
              url: 'videos/LSC_-_Camell.mp4',
              angle: 'side',
              priority: 2,
            },
          ],
        },
      },
    }),
    // SOTA sign video
    prisma.signVideo.create({
      data: {
        title: '',
        priority: 1,
        sense: {
          connect: {
            id: sotaSense.id
          }
        },
        videoData: {
          create: {
            hands: Hand.RIGHT,
            configuration: HandConfiguration.CONF_25,
            configurationChanges: ConfigurationChange.OPENING_AND_WIGGLING,
            relationBetweenArticulators: RelationBetweenArticulators.BELOW,
            location: Location.WEAK_HAND_PALM,
            movementRelatedOrientation: MovementRelatedOrientation.FRONT,
            orientationRelatedToLocation: OrientationRelatedToLocation.AO_FINGERS_CONTRA,
            orientationChange: OrientationChange.ULNAR_FLEXION,
            contactType: ContactType.NONE_TO_INITIAL,
            movementType: MovementType.ARC,
            vocalization: "none",
            nonManualComponent: "none",
            inicialization: "none",
          }
        },
        videos: {
          create: [
            {
              url: 'videos/LSC_-_Cap.mp4',
              angle: 'front',
              priority: 1,
            },
            {
              url: 'videos/LSC_-_Car.mp4',
              angle: 'side',
              priority: 2,
            },
          ],
        },
      },
    }),
    // SOBRE sign video
    prisma.signVideo.create({
      data: {
        title: '',
        priority: 1,
        sense: {
          connect: {
            id: sobreSense.id
          }
        },
        videoData: {
          create: {
            hands: Hand.RIGHT,
            configuration: HandConfiguration.CONF_35,
            configurationChanges: ConfigurationChange.OPENING_TO_CLOSING,
            relationBetweenArticulators: RelationBetweenArticulators.ABOVE,
            location: Location.WEAK_HAND_PALM,
            movementRelatedOrientation: MovementRelatedOrientation.FRONT,
            orientationRelatedToLocation: OrientationRelatedToLocation.AO_FINGERS_CONTRA,
            orientationChange: OrientationChange.PRONATION_TO_FLEXION,
            contactType: ContactType.FINAL_TO_CONTINUOUS,
            movementType: MovementType.STRAIGHT,
            vocalization: "none",
            nonManualComponent: "none",
            inicialization: "none",
          }
        },
        videos: {
          create: [
            {
              url: 'videos/LSC_-_Cames.mp4',
              angle: 'front',
              priority: 1,
            },
            {
              url: 'videos/LSC_-_Camell.mp4',
              angle: 'side',
              priority: 2,
            },
          ],
        },
      },
    }),
    // SOBRE (envelope) sign video
    prisma.signVideo.create({
      data: {
        title: '',
        priority: 2,
        sense: {
          connect: {
            id: sobreSense2.id
          }
        },
        videoData: {
          create: {
            hands: Hand.BOTH,
            configuration: HandConfiguration.CONF_42,
            configurationChanges: ConfigurationChange.CLOSING_TO_OPENING,
            relationBetweenArticulators: RelationBetweenArticulators.FRONT_BACK,
            location: Location.NEUTRAL_SPACE,
            movementRelatedOrientation: MovementRelatedOrientation.FRONT,
            orientationRelatedToLocation: OrientationRelatedToLocation.AO_FINGERS_CONTRA,
            orientationChange: OrientationChange.SUPINATION_TO_PRONATION,
            contactType: ContactType.CONTINUOUS_TO_NONE,
            movementType: MovementType.MOTIVATED_SHAPE,
            vocalization: "none",
            nonManualComponent: "none",
            inicialization: "none",
          }
        },
        videos: {
          create: [
            {
              url: 'videos/LSC_-_Car.mp4',
              angle: 'front',
              priority: 1,
            },
            {
              url: 'videos/LSC_-_Cap.mp4',
              angle: 'side',
              priority: 2,
            },
          ],
        },
      },
    }),
  ]);

  // Create dictionary entries for all new signs
  await Promise.all([
    prisma.dictionaryEntry.create({
      data: {
        status: GlossStatus.PUBLISHED,
        currentVersion: 1,
        glossDataId: petitGlossData.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    }),
    prisma.dictionaryEntry.create({
      data: {
        status: GlossStatus.PUBLISHED,
        currentVersion: 1,
        glossDataId: granGlossData.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    }),
    prisma.dictionaryEntry.create({
      data: {
        status: GlossStatus.PUBLISHED,
        currentVersion: 1,
        glossDataId: bancGlossData.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    }),
    prisma.dictionaryEntry.create({
      data: {
        status: GlossStatus.PUBLISHED,
        currentVersion: 1,
        glossDataId: sotaGlossData.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    }),
    prisma.dictionaryEntry.create({
      data: {
        status: GlossStatus.PUBLISHED,
        currentVersion: 1,
        glossDataId: sobreGlossData.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    }),
  ]);

  // Create relationships between signs
  await Promise.all([
    // Antonym relation between PETIT and GRAN
    prisma.relatedGloss.create({
      data: {
        relationType: RelationType.ANTONYM,
        sourceGlossId: petitGlossData.id,
        targetGlossId: granGlossData.id,
      },
    }),
    // Minimal pair relation between SOTA and SOBRE
    prisma.minimalPair.create({
      data: {
        distinction: "Location (above vs below)",
        sourceGlossId: sotaGlossData.id,
        targetGlossId: sobreGlossData.id,
      },
    }),
  ]);

  console.log('Seed data created successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 