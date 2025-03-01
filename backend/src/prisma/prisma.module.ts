import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // This makes the module available everywhere without needing to import it
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
