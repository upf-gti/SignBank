import { PrismaClient, Role, Language, LexicalCategory, RelationType, Hand, GlossStatus } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  // Delete all existing data
  await prisma.$transaction([
    prisma.dictionaryEntry.deleteMany(),
    prisma.relatedGloss.deleteMany(),
    prisma.gloss.deleteMany(),
    prisma.definitionTranslation.deleteMany(),
    prisma.definition.deleteMany(),
    prisma.video.deleteMany(),
    prisma.minimalPair.deleteMany(),
    prisma.signVideo.deleteMany(),
    prisma.videoDefinition.deleteMany(),
    prisma.sense.deleteMany(),
    prisma.glossRequest.deleteMany(),
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

  // Create multiple senses for different signs
  const senses = await Promise.all([
    prisma.sense.create({
      data: {
        senseTitle: 'Hello',
        priority: 1,
        lexicalCategory: LexicalCategory.INTERJECTION,
      },
    }),
    prisma.sense.create({
      data: {
        senseTitle: 'Thank you',
        priority: 1,
        lexicalCategory: LexicalCategory.INTERJECTION,
      },
    }),
    prisma.sense.create({
      data: {
        senseTitle: 'Good',
        priority: 1,
        lexicalCategory: LexicalCategory.ADJECTIVE,
      },
    }),
  ]);

  // Create video definitions for each sense
  const videoDefinitions = await Promise.all(
    senses.map((sense) =>
      prisma.videoDefinition.create({
        data: {
          url: `https://example.com/videos/${sense.senseTitle.toLowerCase()}-definition.mp4`,
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
          translations: {
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
          examples: {
            create: [
              {
                example: `Example of using ${sense.senseTitle}`,
                exampleVideoURL: `https://example.com/videos/${sense.senseTitle.toLowerCase()}-example1.mp4`,
              },
              {
                example: `Another example with ${sense.senseTitle}`,
                exampleVideoURL: `https://example.com/videos/${sense.senseTitle.toLowerCase()}-example2.mp4`,
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
          url: `https://example.com/videos/${sense.senseTitle.toLowerCase()}-sign.mp4`,
          priority: 1,
          videoData: {
            hand: Hand.RIGHT,
            speed: 'normal',
            location: 'neutral space',
            movement: 'single movement',
          },
          senseId: sense.id,
          videos: {
            create: [
              {
                url: `https://example.com/videos/${sense.senseTitle.toLowerCase()}-front.mp4`,
                angle: 'front',
                priority: 1,
              },
              {
                url: `https://example.com/videos/${sense.senseTitle.toLowerCase()}-side.mp4`,
                angle: 'side',
                priority: 2,
              },
              {
                url: `https://example.com/videos/${sense.senseTitle.toLowerCase()}-close.mp4`,
                angle: 'close-up',
                priority: 3,
              },
            ],
          },
        },
      })
    )
  );

  // Create glosses for each sense
  const glosses = await Promise.all(
    senses.map((sense) =>
      prisma.gloss.create({
        data: {
          senseId: sense.id,
          RelatedGloss: {
            create: [
              {
                relatedGlossId: 'related-gloss-1',
                relationType: RelationType.SYNONYM,
              },
              {
                relatedGlossId: 'related-gloss-2',
                relationType: RelationType.REGIONAL_VARIANT,
              },
            ],
          },
        },
      })
    )
  );

  // Create dictionary entries for each gloss
  const dictionaryEntries = await Promise.all(
    glosses.map((gloss) =>
      prisma.dictionaryEntry.create({
        data: {
          status: GlossStatus.PUBLISHED,
          glossId: gloss.id,
          currentVersion: 1,
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