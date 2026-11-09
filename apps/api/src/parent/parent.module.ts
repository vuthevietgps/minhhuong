import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { LearningAccessModule } from '../learning-access/learning-access.module';
import { PrismaModule } from '../prisma/prisma.module';
import { ParentController } from './parent.controller';
import { ParentService } from './parent.service';
import { ParentChildrenService } from './parent-children.service';
import { ParentScreenTimeService } from './parent-screen-time.service';
import { ParentReportsService } from './parent-reports.service';

@Module({
  imports: [AuthModule, LearningAccessModule, PrismaModule],
  controllers: [ParentController],
  providers: [
    ParentService,
    ParentChildrenService,
    ParentScreenTimeService,
    ParentReportsService,
  ],
})
export class ParentModule {}
