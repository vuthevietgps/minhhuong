import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { TeacherContentController } from './teacher-content.controller';
import { TeacherContentService } from './teacher-content.service';

@Module({
  imports: [AuthModule, PrismaModule],
  controllers: [TeacherContentController],
  providers: [TeacherContentService],
})
export class TeacherContentModule {}
