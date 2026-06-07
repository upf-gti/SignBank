import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { Role } from '@prisma/client';
import * as argon2 from 'argon2';

@Injectable()
export class AppService implements OnApplicationBootstrap {
  private readonly logger = new Logger(AppService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onApplicationBootstrap() {
    await this.ensureAdminExists();
  }

  private async ensureAdminExists() {
    const adminCount = await this.prisma.user.count({ where: { role: Role.ADMIN } });
    if (adminCount > 0) return;

    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;

    if (!email || !password) {
      this.logger.warn('No admin users found and ADMIN_EMAIL/ADMIN_PASSWORD are not set. Skipping admin creation.');
      return;
    }

    const hashedPassword = await argon2.hash(password);
    await this.prisma.user.create({
      data: {
        email,
        username: 'admin',
        name: 'Admin',
        lastName: 'SignBank',
        password: hashedPassword,
        role: Role.ADMIN,
      },
    });

    this.logger.log(`Admin user created: ${email}`);
  }

  getHello(): string {
    return 'Hello World!';
  }
}
