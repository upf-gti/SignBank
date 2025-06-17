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

  console.log('Empty seed data created successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 