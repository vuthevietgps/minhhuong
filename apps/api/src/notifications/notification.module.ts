import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationService } from './notification.service';
import { RenewalReminderJob } from './renewal-reminder.job';

@Module({
  imports: [PrismaModule],
  providers: [NotificationService, RenewalReminderJob],
  exports: [NotificationService],
})
export class NotificationModule {}
