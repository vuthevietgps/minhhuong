import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { AdminContentController } from './admin-content.controller';
import { AdminContentService } from './admin-content.service';

@Module({
  imports: [AuthModule, PrismaModule],
  controllers: [AdminContentController],
  providers: [AdminContentService],
})
export class AdminContentModule {}
