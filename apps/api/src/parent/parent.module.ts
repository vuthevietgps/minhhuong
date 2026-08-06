import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { LearningAccessModule } from '../learning-access/learning-access.module';
import { PrismaModule } from '../prisma/prisma.module';
import { ParentController } from './parent.controller';
import { ParentService } from './parent.service';

@Module({
  imports: [AuthModule, LearningAccessModule, PrismaModule],
  controllers: [ParentController],
  providers: [ParentService],
})
export class ParentModule {}
