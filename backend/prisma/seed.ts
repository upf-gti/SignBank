import { PrismaClient, Role, Language, LexicalCategory, Handedness, GlossStatus, ConfigurationChange, RelationBetweenArticulators, Location, MovementType, MovementRelatedOrientation, OrientationChange, ContactType, OrientationRelatedToLocation, HandConfiguration, RelationType, MovementDirection } from '@prisma/client';
import * as argon2 from 'argon2';
import { seedCompoundBessonsExample } from './seed/compound-bessons-1d';

const prisma = new PrismaClient();

async function main() {
  await prisma.$transaction([
    prisma.exampleTranslation.deleteMany(),
    prisma.glossTranslation.deleteMany(),
    prisma.example.deleteMany(),
    prisma.definitionTranslation.deleteMany(),
    prisma.definition.deleteMany(),
    prisma.video.deleteMany(),
    prisma.minimalPair.deleteMany(),
    prisma.compoundPart.deleteMany(),
    prisma.signVideo.deleteMany(),
    prisma.dictionaryEntry.deleteMany(),
    prisma.relatedGloss.deleteMany(),
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

  // Create COLL gloss data (3 homonym definitions, no gloss-level translations)
  const collGlossData = await prisma.glossData.create({
    data: {
      gloss: 'COLL',
      currentVersion: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      definitions: {
        create: [
          {
            title: 'Coll (part del cos)',
            definition: 'Part del cos queuneix el cap amb el tronc',
            lexicalCategory: LexicalCategory.NOUN,
            priority: 1,
            videoDefinitionUrl: 'videos/LSC_-_Cap.mp4',
            definitionTranslations: {
              create: [
                { translation: 'Part del cos queuneix el cap amb el tronc', language: Language.CATALAN },
                { translation: 'Parte del cuerpo que une la cabeza con el tronco', language: Language.SPANISH },
                { translation: 'Part of the body that connects the head to the torso', language: Language.ENGLISH },
              ],
            },
          },
          {
            title: 'Coll (d\'ampolla)',
            definition: 'Part estreta i allargada d\'una ampolla o recipient similar',
            lexicalCategory: LexicalCategory.NOUN,
            priority: 2,
            videoDefinitionUrl: 'videos/LSC_-_Cames.mp4',
            definitionTranslations: {
              create: [
                { translation: 'Part estret i allargada d\'una ampolla o recipient similar', language: Language.CATALAN },
                { translation: 'Parte estrecha y alargada de una botella o recipiente similar', language: Language.SPANISH },
                { translation: 'Narrow and elongated part of a bottle or similar container', language: Language.ENGLISH },
              ],
            },
          },
          {
            title: 'Coll (de muntanya)',
            definition: 'Depressió en una carena muntanyosa que permet el pas entre dues valls',
            lexicalCategory: LexicalCategory.NOUN,
            priority: 3,
            videoDefinitionUrl: 'videos/LSC_-_Camell.mp4',
            definitionTranslations: {
              create: [
                { translation: 'Depressió en una carena muntanyosa que permet el pas entre dues valls', language: Language.CATALAN },
                { translation: 'Depresión en una cadena montañosa que permite el paso entre dos valles', language: Language.SPANISH },
                { translation: 'Depression in a mountain range that allows passage between two valleys', language: Language.ENGLISH },
              ],
            },
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
                { translation: 'Me duele el cuello', language: Language.SPANISH },
                { translation: 'Em fa mal el coll', language: Language.CATALAN },
                { translation: 'My neck hurts', language: Language.ENGLISH },
              ],
            },
          },
          {
            example: 'S\'ha trencat el coll de l\'ampolla',
            exampleVideoURL: 'videos/LSC_-_Cames.mp4',
            exampleTranslations: {
              create: [
                { translation: 'Se ha roto el cuello de la botella', language: Language.SPANISH },
                { translation: 'S\'ha trencat el coll de l\'ampolla', language: Language.CATALAN },
                { translation: 'The bottle neck broke', language: Language.ENGLISH },
              ],
            },
          },
          {
            example: 'Hem arribat al coll de la muntanya',
            exampleVideoURL: 'videos/LSC_-_Cap.mp4',
            exampleTranslations: {
              create: [
                { translation: 'Hemos llegado al puerto de la montaña', language: Language.SPANISH },
                { translation: 'Hem arribat al coll de la muntanya', language: Language.CATALAN },
                { translation: 'We\'ve reached the mountain pass', language: Language.ENGLISH },
              ],
            },
          },
        ],
      },
    },
  });

  // Create sign videos for COLL (one per homonym meaning)
  const collSenseTitles = ['Coll (part del cos)', 'Coll (d\'ampolla)', 'Coll (de muntanya)'];
  await Promise.all(
    collSenseTitles.map((senseTitle) =>
      prisma.signVideo.create({
        data: {
          title: `COLL - ${senseTitle}`,
          priority: 1,
          glossData: { connect: { id: collGlossData.id } },
          videoData: {
            create: {
              handedness: senseTitle === 'Coll (part del cos)' ? Handedness.ONE : Handedness.TWO_S,
              dominantConfiguration: HandConfiguration.CONF_1,
              configurationChanges: ConfigurationChange.BENDING,
              dominantRelationBetweenArticulators: RelationBetweenArticulators.ABOVE,
              location: senseTitle === 'Coll (part del cos)' ? Location.NECK : Location.NEUTRAL_SPACE,
              movementRelatedOrientation: MovementRelatedOrientation.FRONT,
              orientationRelatedToLocation: OrientationRelatedToLocation.AO_FINGERS_CONTRA,
              orientationChange: OrientationChange.EXTENSION,
              contactType: ContactType.CONTINUOUS,
              movementType: MovementType.STRAIGHT,
              movementDirection: MovementDirection.BACKWARDS,
              vocalization: 'none',
              nonManualComponent: 'none',
              inicialization: 'none',
              repeatedMovement: false,
            },
          },
          videos: {
            create: [
              { url: 'videos/LSC_-_Cap.mp4', angle: 'front', priority: 1 },
              { url: 'videos/LSC_-_Capa.mp4', angle: 'side', priority: 2 },
              { url: 'videos/LSC_-_Car.mp4', angle: 'close-up', priority: 3 },
            ],
          },
        },
      })
    )
  );

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
      glossTranslations: {
        create: [
          { translation: 'Content', language: Language.CATALAN },
          { translation: 'Contento', language: Language.SPANISH },
          { translation: 'Happy', language: Language.ENGLISH },
        ],
      },
      definitions: {
        create: [
          {
            title: '',
            definition: 'Estat d\'ànim de qui se sent satisfet',
            lexicalCategory: LexicalCategory.ADJECTIVE,
            priority: 1,
            videoDefinitionUrl: 'videos/LSC_-_Camell.mp4',
            definitionTranslations: {
              create: [
                { translation: 'Estat d\'ànim de qui se sent satisfet', language: Language.CATALAN },
                { translation: 'Estado de ánimo de quien se siente satisfecho', language: Language.SPANISH },
                { translation: 'State of mind of someone who feels satisfied', language: Language.ENGLISH },
              ],
            },
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
                { translation: 'Estoy muy contento con los resultados', language: Language.SPANISH },
                { translation: 'Estic molt content amb els resultats', language: Language.CATALAN },
                { translation: 'I am very happy with the results', language: Language.ENGLISH },
              ],
            },
          },
        ],
      },
    },
  });

  // Create FELIÇ gloss data
  const felicGlossData = await prisma.glossData.create({
    data: {
      gloss: 'FELIÇ',
      currentVersion: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      glossTranslations: {
        create: [
          { translation: 'Feliç', language: Language.CATALAN },
          { translation: 'Feliz', language: Language.SPANISH },
          { translation: 'Happy', language: Language.ENGLISH },
        ],
      },
      definitions: {
        create: [
          {
            title: '',
            definition: 'Que experimenta un estat de satisfacció i benestar',
            lexicalCategory: LexicalCategory.ADJECTIVE,
            priority: 1,
            videoDefinitionUrl: 'videos/LSC_-_Car.mp4',
            definitionTranslations: {
              create: [
                { translation: 'Que experimenta un estat de satisfacció i benestar', language: Language.CATALAN },
                { translation: 'Que experimenta un estado de satisfacción y bienestar', language: Language.SPANISH },
                { translation: 'Experiencing a state of satisfaction and well-being', language: Language.ENGLISH },
              ],
            },
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
                { translation: 'Hoy me siento muy feliz', language: Language.SPANISH },
                { translation: 'Avui em sento molt feliç', language: Language.CATALAN },
                { translation: 'Today I feel very happy', language: Language.ENGLISH },
              ],
            },
          },
        ],
      },
    },
  });

  await prisma.signVideo.create({
    data: {
      title: '',
      priority: 1,
      glossData: { connect: { id: contentGlossData.id } },
      videoData: {
        create: {
          handedness: Handedness.TWO_S,
          dominantConfiguration: HandConfiguration.CONF_8,
          configurationChanges: ConfigurationChange.OPENING_AND_SPREADING,
          dominantRelationBetweenArticulators: RelationBetweenArticulators.CROSS,
          location: Location.CHEST,
          movementRelatedOrientation: MovementRelatedOrientation.FRONT,
          orientationRelatedToLocation: OrientationRelatedToLocation.AO_FINGERS_CONTRA,
          orientationChange: OrientationChange.FLEXION,
          contactType: ContactType.BRUSH,
          movementType: MovementType.SPIRAL,
          movementDirection: MovementDirection.BACKWARDS,
          vocalization: 'none',
          nonManualComponent: 'smile',
          inicialization: 'none',
          repeatedMovement: false,
        },
      },
      videos: {
        create: [
          { url: 'videos/LSC_-_Camell.mp4', angle: 'front', priority: 1 },
          { url: 'videos/LSC_-_Cap.mp4', angle: 'side', priority: 2 },
        ],
      },
    },
  });

  await prisma.signVideo.create({
    data: {
      title: '',
      priority: 1,
      glossData: { connect: { id: felicGlossData.id } },
      videoData: {
        create: {
          handedness: Handedness.ONE,
          dominantConfiguration: HandConfiguration.CONF_15,
          configurationChanges: ConfigurationChange.CLOSING_AND_WIGGLING,
          dominantRelationBetweenArticulators: RelationBetweenArticulators.FRONT,
          location: Location.CHEEK,
          movementRelatedOrientation: MovementRelatedOrientation.FRONT,
          orientationRelatedToLocation: OrientationRelatedToLocation.AO_FINGERS_CONTRA,
          orientationChange: OrientationChange.EXTENSION_AND_PRONATION,
          contactType: ContactType.DOUBLE,
          movementType: MovementType.CIRCLE,
          movementDirection: MovementDirection.BACKWARDS,
          vocalization: 'none',
          nonManualComponent: 'smile with cheek puff',
          inicialization: 'none',
          repeatedMovement: false,
        },
      },
      videos: {
        create: [
          { url: 'videos/LSC_-_Cames.mp4', angle: 'front', priority: 1 },
          { url: 'videos/LSC_-_Car.mp4', angle: 'side', priority: 2 },
        ],
      },
    },
  });

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
      glossTranslations: {
        create: [
          { translation: 'Petit', language: Language.CATALAN },
          { translation: 'Pequeño', language: Language.SPANISH },
          { translation: 'Small', language: Language.ENGLISH },
        ],
      },
      definitions: {
        create: [
          {
            title: '',
            definition: 'De dimensions o grandària reduïdes',
            lexicalCategory: LexicalCategory.ADJECTIVE,
            priority: 1,
            videoDefinitionUrl: 'videos/LSC_-_Cap.mp4',
            definitionTranslations: {
              create: [
                { translation: 'De dimensions o grandària reduïdes', language: Language.CATALAN },
                { translation: 'De dimensiones o tamaño reducidos', language: Language.SPANISH },
                { translation: 'Of reduced dimensions or size', language: Language.ENGLISH },
              ],
            },
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
                { translation: 'El perro es muy pequeño', language: Language.SPANISH },
                { translation: 'El gos és molt petit', language: Language.CATALAN },
                { translation: 'The dog is very small', language: Language.ENGLISH },
              ],
            },
          },
        ],
      },
    },
  });

  // Create GRAN gloss data
  const granGlossData = await prisma.glossData.create({
    data: {
      gloss: 'GRAN',
      currentVersion: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      glossTranslations: {
        create: [
          { translation: 'Gran', language: Language.CATALAN },
          { translation: 'Grande', language: Language.SPANISH },
          { translation: 'Big', language: Language.ENGLISH },
        ],
      },
      definitions: {
        create: [
          {
            title: '',
            definition: 'De dimensions o grandària considerables',
            lexicalCategory: LexicalCategory.ADJECTIVE,
            priority: 1,
            videoDefinitionUrl: 'videos/LSC_-_Cames.mp4',
            definitionTranslations: {
              create: [
                { translation: 'De dimensions o grandària considerables', language: Language.CATALAN },
                { translation: 'De dimensiones o tamaño considerables', language: Language.SPANISH },
                { translation: 'Of considerable dimensions or size', language: Language.ENGLISH },
              ],
            },
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
                { translation: 'La casa es muy grande', language: Language.SPANISH },
                { translation: 'La casa és molt gran', language: Language.CATALAN },
                { translation: 'The house is very big', language: Language.ENGLISH },
              ],
            },
          },
        ],
      },
    },
  });

  // Create BANC gloss data (2 homonym definitions, no gloss-level translations)
  const bancGlossData = await prisma.glossData.create({
    data: {
      gloss: 'BANC',
      currentVersion: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      definitions: {
        create: [
          {
            title: 'Banc (entitat financera)',
            definition: 'Entitat financera que administra i presta diners',
            lexicalCategory: LexicalCategory.NOUN,
            priority: 1,
            videoDefinitionUrl: 'videos/LSC_-_Car.mp4',
            definitionTranslations: {
              create: [
                { translation: 'Entitat financera que administra i presta diners', language: Language.CATALAN },
                { translation: 'Entidad financiera que administra y presta dinero', language: Language.SPANISH },
                { translation: 'Financial institution that manages and lends money', language: Language.ENGLISH },
              ],
            },
          },
          {
            title: 'Banc (seient)',
            definition: 'Seient llarg amb respatller o sense',
            lexicalCategory: LexicalCategory.NOUN,
            priority: 2,
            videoDefinitionUrl: 'videos/LSC_-_Camell.mp4',
            definitionTranslations: {
              create: [
                { translation: 'Seient llarg amb respatller o sense', language: Language.CATALAN },
                { translation: 'Asiento largo con o sin respaldo', language: Language.SPANISH },
                { translation: 'Long seat with or without a backrest', language: Language.ENGLISH },
              ],
            },
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
                { translation: 'Tengo que ir al banco', language: Language.SPANISH },
                { translation: 'He d\'anar al banc', language: Language.CATALAN },
                { translation: 'I have to go to the bank', language: Language.ENGLISH },
              ],
            },
          },
          {
            example: 'Seu al banc del parc',
            exampleVideoURL: 'videos/LSC_-_Camell.mp4',
            exampleTranslations: {
              create: [
                { translation: 'Siéntate en el banco del parque', language: Language.SPANISH },
                { translation: 'Seu al banc del parc', language: Language.CATALAN },
                { translation: 'Sit on the park bench', language: Language.ENGLISH },
              ],
            },
          },
        ],
      },
    },
  });

  // Create SOTA gloss data
  const sotaGlossData = await prisma.glossData.create({
    data: {
      gloss: 'SOTA',
      currentVersion: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      glossTranslations: {
        create: [
          { translation: 'Sota', language: Language.CATALAN },
          { translation: 'Debajo', language: Language.SPANISH },
          { translation: 'Under', language: Language.ENGLISH },
        ],
      },
      definitions: {
        create: [
          {
            title: '',
            definition: 'En una posició inferior respecte a alguna cosa',
            lexicalCategory: LexicalCategory.PARTICLE,
            priority: 1,
            videoDefinitionUrl: 'videos/LSC_-_Cap.mp4',
            definitionTranslations: {
              create: [
                { translation: 'En una posició inferior respecte a alguna cosa', language: Language.CATALAN },
                { translation: 'En una posición inferior respecto a algo', language: Language.SPANISH },
                { translation: 'In a position below something', language: Language.ENGLISH },
              ],
            },
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
                { translation: 'El gato está debajo de la mesa', language: Language.SPANISH },
                { translation: 'El gat és sota la taula', language: Language.CATALAN },
                { translation: 'The cat is under the table', language: Language.ENGLISH },
              ],
            },
          },
        ],
      },
    },
  });

  // Create SOBRE gloss data (2 homonym definitions, no gloss-level translations)
  const sobreGlossData = await prisma.glossData.create({
    data: {
      gloss: 'SOBRE',
      currentVersion: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      definitions: {
        create: [
          {
            title: '',
            definition: 'En una posició superior respecte a alguna cosa',
            lexicalCategory: LexicalCategory.ADVERB,
            priority: 1,
            videoDefinitionUrl: 'videos/LSC_-_Cames.mp4',
            definitionTranslations: {
              create: [
                { translation: 'En una posició superior respecte a alguna cosa', language: Language.CATALAN },
                { translation: 'En una posición superior respecto a algo', language: Language.SPANISH },
                { translation: 'In a position above something', language: Language.ENGLISH },
              ],
            },
          },
          {
            title: 'Sobre (per a cartes)',
            definition: 'Coberta de paper dins la qual es posa una carta o un document per enviar-lo',
            lexicalCategory: LexicalCategory.NOUN,
            priority: 2,
            videoDefinitionUrl: 'videos/LSC_-_Car.mp4',
            definitionTranslations: {
              create: [
                { translation: 'Coberta de paper dins la qual es posa una carta o un document per enviar-lo', language: Language.CATALAN },
                { translation: 'Cubierta de papel dentro de la cual se pone una carta o documento para enviarlo', language: Language.SPANISH },
                { translation: 'Paper covering in which a letter or document is placed for sending', language: Language.ENGLISH },
              ],
            },
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
                { translation: 'El libro está encima de la mesa', language: Language.SPANISH },
                { translation: 'El llibre és sobre la taula', language: Language.CATALAN },
                { translation: 'The book is on the table', language: Language.ENGLISH },
              ],
            },
          },
          {
            example: 'Posa la carta dins el sobre',
            exampleVideoURL: 'videos/LSC_-_Car.mp4',
            exampleTranslations: {
              create: [
                { translation: 'Pon la carta dentro del sobre', language: Language.SPANISH },
                { translation: 'Posa la carta dins el sobre', language: Language.CATALAN },
                { translation: 'Put the letter in the envelope', language: Language.ENGLISH },
              ],
            },
          },
        ],
      },
    },
  });

  // Create sign videos for PETIT, GRAN, BANC, SOTA, SOBRE
  await Promise.all([
    prisma.signVideo.create({
      data: {
        title: '',
        priority: 1,
        glossData: { connect: { id: petitGlossData.id } },
        videoData: {
          create: {
            handedness: Handedness.TWO_S,
            dominantConfiguration: HandConfiguration.CONF_23,
            configurationChanges: ConfigurationChange.CLOSING_AND_RUBBING,
            dominantRelationBetweenArticulators: RelationBetweenArticulators.INSIDE,
            location: Location.NEUTRAL_SPACE,
            movementRelatedOrientation: MovementRelatedOrientation.FRONT,
            orientationRelatedToLocation: OrientationRelatedToLocation.AO_FINGERS_CONTRA,
            orientationChange: OrientationChange.PRONATION,
            contactType: ContactType.CONTINUOUS_TO_FINAL,
            movementType: MovementType.MOTIVATED_SHAPE,
            movementDirection: MovementDirection.BACKWARDS,
            vocalization: 'none',
            nonManualComponent: 'cheeks in',
            inicialization: 'none',
          },
        },
        videos: {
          create: [
            { url: 'videos/LSC_-_Cap.mp4', angle: 'front', priority: 1 },
            { url: 'videos/LSC_-_Cames.mp4', angle: 'side', priority: 2 },
          ],
        },
      },
    }),
    prisma.signVideo.create({
      data: {
        title: '',
        priority: 1,
        glossData: { connect: { id: granGlossData.id } },
        videoData: {
          create: {
            handedness: Handedness.TWO_S,
            dominantConfiguration: HandConfiguration.CONF_31,
            configurationChanges: ConfigurationChange.OPENING_AND_RUBBING,
            dominantRelationBetweenArticulators: RelationBetweenArticulators.ABOVE_BELOW,
            location: Location.NEUTRAL_SPACE,
            movementRelatedOrientation: MovementRelatedOrientation.FRONT,
            orientationRelatedToLocation: OrientationRelatedToLocation.AO_FINGERS_CONTRA,
            orientationChange: OrientationChange.SUPINATION,
            contactType: ContactType.INITIAL,
            movementType: MovementType.ZIGZAG,
            movementDirection: MovementDirection.BACKWARDS,
            vocalization: 'none',
            nonManualComponent: 'cheeks out',
            inicialization: 'none',
          },
        },
        videos: {
          create: [
            { url: 'videos/LSC_-_Camell.mp4', angle: 'front', priority: 1 },
            { url: 'videos/LSC_-_Car.mp4', angle: 'side', priority: 2 },
          ],
        },
      },
    }),
    prisma.signVideo.create({
      data: {
        title: '',
        priority: 1,
        glossData: { connect: { id: bancGlossData.id } },
        videoData: {
          create: {
            handedness: Handedness.ONE,
            dominantConfiguration: HandConfiguration.CONF_12,
            configurationChanges: ConfigurationChange.UNBENDING,
            dominantRelationBetweenArticulators: RelationBetweenArticulators.FRONT,
            location: Location.WEAK_HAND_PALM,
            movementRelatedOrientation: MovementRelatedOrientation.FRONT,
            orientationRelatedToLocation: OrientationRelatedToLocation.AO_FINGERS_CONTRA,
            orientationChange: OrientationChange.RADIAL_AND_ULNAR_FLEXION,
            contactType: ContactType.CONTINUOUS,
            movementType: MovementType.CROSS,
            movementDirection: MovementDirection.BACKWARDS,
            vocalization: 'none',
            nonManualComponent: 'none',
            inicialization: 'none',
          },
        },
        videos: {
          create: [
            { url: 'videos/LSC_-_Cap.mp4', angle: 'front', priority: 1 },
            { url: 'videos/LSC_-_Car.mp4', angle: 'side', priority: 2 },
          ],
        },
      },
    }),
    prisma.signVideo.create({
      data: {
        title: '',
        priority: 2,
        glossData: { connect: { id: bancGlossData.id } },
        videoData: {
          create: {
            handedness: Handedness.TWO_S,
            dominantConfiguration: HandConfiguration.CONF_18,
            configurationChanges: ConfigurationChange.CURVING,
            dominantRelationBetweenArticulators: RelationBetweenArticulators.NEXT_TO,
            location: Location.HORIZONTAL_PLANE,
            movementRelatedOrientation: MovementRelatedOrientation.FRONT,
            orientationRelatedToLocation: OrientationRelatedToLocation.AO_FINGERS_CONTRA,
            orientationChange: OrientationChange.ROTATION,
            contactType: ContactType.CONTINUOUS,
            movementType: MovementType.STRAIGHT_TO_CIRCLE,
            movementDirection: MovementDirection.BACKWARDS,
            vocalization: 'none',
            nonManualComponent: 'none',
            inicialization: 'none',
          },
        },
        videos: {
          create: [
            { url: 'videos/LSC_-_Cames.mp4', angle: 'front', priority: 1 },
            { url: 'videos/LSC_-_Camell.mp4', angle: 'side', priority: 2 },
          ],
        },
      },
    }),
    prisma.signVideo.create({
      data: {
        title: '',
        priority: 1,
        glossData: { connect: { id: sotaGlossData.id } },
        videoData: {
          create: {
            handedness: Handedness.ONE,
            dominantConfiguration: HandConfiguration.CONF_25,
            configurationChanges: ConfigurationChange.OPENING_AND_WIGGLING,
            dominantRelationBetweenArticulators: RelationBetweenArticulators.BELOW,
            location: Location.WEAK_HAND_PALM,
            movementRelatedOrientation: MovementRelatedOrientation.FRONT,
            orientationRelatedToLocation: OrientationRelatedToLocation.AO_FINGERS_CONTRA,
            orientationChange: OrientationChange.ULNAR_FLEXION,
            contactType: ContactType.NONE_TO_INITIAL,
            movementType: MovementType.ARC,
            movementDirection: MovementDirection.BACKWARDS,
            vocalization: 'none',
            nonManualComponent: 'none',
            inicialization: 'none',
          },
        },
        videos: {
          create: [
            { url: 'videos/LSC_-_Cap.mp4', angle: 'front', priority: 1 },
            { url: 'videos/LSC_-_Car.mp4', angle: 'side', priority: 2 },
          ],
        },
      },
    }),
    prisma.signVideo.create({
      data: {
        title: '',
        priority: 1,
        glossData: { connect: { id: sobreGlossData.id } },
        videoData: {
          create: {
            handedness: Handedness.ONE,
            dominantConfiguration: HandConfiguration.CONF_35,
            configurationChanges: ConfigurationChange.OPENING_TO_CLOSING,
            dominantRelationBetweenArticulators: RelationBetweenArticulators.ABOVE,
            location: Location.WEAK_HAND_PALM,
            movementRelatedOrientation: MovementRelatedOrientation.FRONT,
            orientationRelatedToLocation: OrientationRelatedToLocation.AO_FINGERS_CONTRA,
            orientationChange: OrientationChange.PRONATION_TO_FLEXION,
            contactType: ContactType.FINAL_TO_CONTINUOUS,
            movementType: MovementType.STRAIGHT,
            movementDirection: MovementDirection.BACKWARDS,
            vocalization: 'none',
            nonManualComponent: 'none',
            inicialization: 'none',
          },
        },
        videos: {
          create: [
            { url: 'videos/LSC_-_Cames.mp4', angle: 'front', priority: 1 },
            { url: 'videos/LSC_-_Camell.mp4', angle: 'side', priority: 2 },
          ],
        },
      },
    }),
    prisma.signVideo.create({
      data: {
        title: '',
        priority: 3,
        glossData: { connect: { id: sobreGlossData.id } },
        videoData: {
          create: {
            handedness: Handedness.TWO_S,
            dominantConfiguration: HandConfiguration.CONF_42,
            configurationChanges: ConfigurationChange.CLOSING_TO_OPENING,
            dominantRelationBetweenArticulators: RelationBetweenArticulators.FRONT_BACK,
            location: Location.NEUTRAL_SPACE,
            movementRelatedOrientation: MovementRelatedOrientation.FRONT,
            orientationRelatedToLocation: OrientationRelatedToLocation.AO_FINGERS_CONTRA,
            orientationChange: OrientationChange.SUPINATION_TO_PRONATION,
            contactType: ContactType.CONTINUOUS_TO_NONE,
            movementType: MovementType.MOTIVATED_SHAPE,
            movementDirection: MovementDirection.BACKWARDS,
            vocalization: 'none',
            nonManualComponent: 'none',
            inicialization: 'none',
          },
        },
        videos: {
          create: [
            { url: 'videos/LSC_-_Car.mp4', angle: 'front', priority: 1 },
            { url: 'videos/LSC_-_Cap.mp4', angle: 'side', priority: 2 },
          ],
        },
      },
    }),
  ]);

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

  await Promise.all([
    prisma.relatedGloss.create({
      data: {
        relationType: RelationType.ANTONYM,
        sourceGlossId: petitGlossData.id,
        targetGlossId: granGlossData.id,
      },
    }),
    prisma.minimalPair.create({
      data: {
        distinction: 'Location (above vs below)',
        sourceGlossId: sotaGlossData.id,
        targetGlossId: sobreGlossData.id,
      },
    }),
  ]);

  await seedCompoundBessonsExample(prisma);

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
