import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

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
  const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
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
