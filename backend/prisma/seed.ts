import { PrismaClient, Role, Language, LexicalCategory, RelationType, Hand, GlossStatus } from '@prisma/client';
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
    prisma.videoDefinition.deleteMany(),
    prisma.dictionaryEntry.deleteMany(),
    prisma.relatedGloss.deleteMany(),
    prisma.sense.deleteMany(),
    prisma.glossRequest.deleteMany(),
    prisma.glossData.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  // Create admin user
  const adminPassword = await argon2.hash('admin123');
  const admin = await prisma.user.upsert({
    where: { email: 'admin@signbank.com' },
    update: {},
    create: {
      email: 'admin@signbank.com',
      username: 'admin',
      password: adminPassword,
      role: Role.ADMIN,
    },
  });

  // Create regular user
  const userPassword = await argon2.hash('user123');
  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      username: 'user',
      password: userPassword,
      role: Role.USER,
    },
  });

  // Create gloss data for each sign
  const glossData = await Promise.all([
    prisma.glossData.create({
      data: {
        gloss: 'HELLO',
        currentVersion: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    }),
    prisma.glossData.create({
      data: {
        gloss: 'THANK_YOU',
        currentVersion: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    }),
    prisma.glossData.create({
      data: {
        gloss: 'GOOD',
        currentVersion: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    }),
  ]);

  // Create multiple senses for different signs
  const senses = await Promise.all([
    prisma.sense.create({
      data: {
        senseTitle: 'Hello',
        priority: 1,
        lexicalCategory: LexicalCategory.INTERJECTION,
        glossDataId: glossData[0].id,
        senseTranslations: {
          create: [
            {
              translation: 'Hola',
              language: Language.SPANISH,
            },
            {
              translation: 'Hola',
              language: Language.CATALAN,
            },
            {
              translation: 'Hello',
              language: Language.ENGLISH,
            },
          ],
        },
        examples: {
          create: [
            {
              example: 'Example of using Hello',
              exampleVideoURL: 'videos/LSC_-_Camell.mp4',
              exampleTranslations: {
                create: [
                  {
                    translation: 'Ejemplo de uso de Hola',
                    language: Language.SPANISH,
                  },
                  {
                    translation: 'Exemple d\'ús de Hola',
                    language: Language.CATALAN,
                  },
                  {
                    translation: 'Example of using Hello',
                    language: Language.ENGLISH,
                  },
                ],
              },
            },
            {
              example: 'Another example with Hello',
              exampleVideoURL: 'videos/LSC_-_Cames.mp4',
              exampleTranslations: {
                create: [
                  {
                    translation: 'Otro ejemplo con Hola',
                    language: Language.SPANISH,
                  },
                  {
                    translation: 'Un altre exemple amb Hola',
                    language: Language.CATALAN,
                  },
                  {
                    translation: 'Another example with Hello',
                    language: Language.ENGLISH,
                  },
                ],
              },
            },
          ],
        },
      },
    }),
    prisma.sense.create({
      data: {
        senseTitle: 'Thank you',
        priority: 1,
        lexicalCategory: LexicalCategory.INTERJECTION,
        glossDataId: glossData[1].id,
        senseTranslations: {
          create: [
            {
              translation: 'Gracias',
              language: Language.SPANISH,
            },
            {
              translation: 'Gràcies',
              language: Language.CATALAN,
            },
            {
              translation: 'Thank you',
              language: Language.ENGLISH,
            },
          ],
        },
        examples: {
          create: [
            {
              example: 'Example of using Thank you',
              exampleVideoURL: 'videos/LSC_-_Camell.mp4',
              exampleTranslations: {
                create: [
                  {
                    translation: 'Ejemplo de uso de Gracias',
                    language: Language.SPANISH,
                  },
                  {
                    translation: 'Exemple d\'ús de Gràcies',
                    language: Language.CATALAN,
                  },
                  {
                    translation: 'Example of using Thank you',
                    language: Language.ENGLISH,
                  },
                ],
              },
            },
            {
              example: 'Another example with Thank you',
              exampleVideoURL: 'videos/LSC_-_Cames.mp4',
              exampleTranslations: {
                create: [
                  {
                    translation: 'Otro ejemplo con Gracias',
                    language: Language.SPANISH,
                  },
                  {
                    translation: 'Un altre exemple amb Gràcies',
                    language: Language.CATALAN,
                  },
                  {
                    translation: 'Another example with Thank you',
                    language: Language.ENGLISH,
                  },
                ],
              },
            },
          ],
        },
      },
    }),
    prisma.sense.create({
      data: {
        senseTitle: 'Good',
        priority: 1,
        lexicalCategory: LexicalCategory.ADJECTIVE,
        glossDataId: glossData[2].id,
        senseTranslations: {
          create: [
            {
              translation: 'Bueno',
              language: Language.SPANISH,
            },
            {
              translation: 'Bo',
              language: Language.CATALAN,
            },
            {
              translation: 'Good',
              language: Language.ENGLISH,
            },
          ],
        },
        examples: {
          create: [
            {
              example: 'Example of using Good',
              exampleVideoURL: 'videos/LSC_-_Camell.mp4',
              exampleTranslations: {
                create: [
                  {
                    translation: 'Ejemplo de uso de Bueno',
                    language: Language.SPANISH,
                  },
                  {
                    translation: 'Exemple d\'ús de Bo',
                    language: Language.CATALAN,
                  },
                  {
                    translation: 'Example of using Good',
                    language: Language.ENGLISH,
                  },
                ],
              },
            },
            {
              example: 'Another example with Good',
              exampleVideoURL: 'videos/LSC_-_Cames.mp4',
              exampleTranslations: {
                create: [
                  {
                    translation: 'Otro ejemplo con Bueno',
                    language: Language.SPANISH,
                  },
                  {
                    translation: 'Un altre exemple amb Bo',
                    language: Language.CATALAN,
                  },
                  {
                    translation: 'Another example with Good',
                    language: Language.ENGLISH,
                  },
                ],
              },
            },
          ],
        },
      },
    }),
    prisma.sense.create({
      data: {
        senseTitle: 'Well',
        priority: 2,
        lexicalCategory: LexicalCategory.ADVERB,
        glossDataId: glossData[2].id,
        senseTranslations: {
          create: [
            {
              translation: 'Bien',
              language: Language.SPANISH,
            },
            {
              translation: 'Bé',
              language: Language.CATALAN,
            },
            {
              translation: 'Well',
              language: Language.ENGLISH,
            },
          ],
        },
        examples: {
          create: [
            {
              example: 'Example of using Well',
              exampleVideoURL: 'videos/LSC_-_Camell.mp4',
              exampleTranslations: {
                create: [
                  {
                    translation: 'Ejemplo de uso de Bien',
                    language: Language.SPANISH,
                  },
                  {
                    translation: 'Exemple d\'ús de Bé',
                    language: Language.CATALAN,
                  },
                  {
                    translation: 'Example of using Well',
                    language: Language.ENGLISH,
                  },
                ],
              },
            },
            {
              example: 'Another example with Well',
              exampleVideoURL: 'videos/LSC_-_Cames.mp4',
              exampleTranslations: {
                create: [
                  {
                    translation: 'Otro ejemplo con Bien',
                    language: Language.SPANISH,
                  },
                  {
                    translation: 'Un altre exemple amb Bé',
                    language: Language.CATALAN,
                  },
                  {
                    translation: 'Another example with Well',
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

  // Create video definitions for each sense
  const videoDefinitions = await Promise.all(
    senses.map((sense) =>
      prisma.videoDefinition.create({
        data: {
          url: `videos/LSC_-_Cafe.mp4`,
        },
      })
    )
  );

  // Create definitions with translations for each sense
  const definitions = await Promise.all(
    senses.map((sense, index) =>
      prisma.definition.create({
        data: {
          title: `${sense.senseTitle} Definition`,
          definition: `Definition for the sign "${sense.senseTitle}"`,
          videoDefinitionId: videoDefinitions[index].id,
          senseId: sense.id,
          definitionTranslations: {
            create: [
              {
                translation: `${sense.senseTitle} in Spanish`,
                language: Language.SPANISH,
              },
              {
                translation: `${sense.senseTitle} in Catalan`,
                language: Language.CATALAN,
              },
              {
                translation: `${sense.senseTitle} in English`,
                language: Language.ENGLISH,
              },
            ],
          },
        },
      })
    )
  );

  // Create sign videos for each sense
  const signVideos = await Promise.all(
    senses.map((sense) =>
      prisma.signVideo.create({
        data: {
          title: `${sense.senseTitle} Sign Video`,
          url: `videos/LSC_-_Cami.mp4`,
          priority: 1,
          sense: {
            connect: {
              id: sense.id
            }
          },
          videoData: {
            create: {
              hands: Hand.RIGHT,
              configuration: "default",
              configurationChanges: "none",
              relationBetweenArticulators: "none",
              location: "neutral space",
              movementRelatedOrientation: "forward",
              locationRelatedOrientation: "neutral",
              orientationChange: "none",
              contactType: "none",
              movementType: "single",
              vocalization: "none",
              nonManualComponent: "none",
              inicialization: "none"
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

  // Create dictionary entries for each gloss data
  await Promise.all(
    glossData.map((data) =>
      prisma.dictionaryEntry.create({
        data: {
          status: GlossStatus.PUBLISHED,
          currentVersion: 1,
          glossDataId: data.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      })
    )
  );

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