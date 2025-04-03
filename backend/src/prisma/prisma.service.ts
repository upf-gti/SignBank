import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  // Check if admin already exists
  
const adminExists = await prisma.users.findFirst({
  where: {
    OR: [
      { email: process.env.ADMIN_EMAIL },
      { username: 'admin' }
    ]
  },
});

if (!adminExists) {
  // Validate environment variables
  if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
    console.error('ADMIN_EMAIL or ADMIN_PASSWORD environment variables are not set. Using defaults.');
    return
  }
  
  const hashedPassword = await argon2.hash(process.env.ADMIN_PASSWORD);
  await prisma.users.create({
    data: {
      username: 'admin',
      email: process.env.ADMIN_EMAIL,
      password: hashedPassword,
      role: 'ADMIN',
    },
  });
  console.log('Admin user created successfully');
} else {
  console.log('Admin user already exists with this username or email');
}
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
