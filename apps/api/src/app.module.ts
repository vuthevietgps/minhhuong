import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AiChatModule } from './ai-chat/ai-chat.module';
import { AiContextModule } from './ai-context/ai-context.module';
import { ActivationOrdersModule } from './activation-orders/activation-orders.module';
import { AdminContentModule } from './admin-content/admin-content.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { BillingModule } from './billing/billing.module';
import { CatalogModule } from './catalog/catalog.module';
import { ChannelAffiliateModule } from './channel-affiliate/channel-affiliate.module';
import { ChannelAdminModule } from './channel-admin/channel-admin.module';
import { ChannelFinanceModule } from './channel-finance/channel-finance.module';
import { DailyPlanModule } from './daily-plan/daily-plan.module';
import { ErpLocalDemoModule } from './erp-local-demo/erp-local-demo.module';
import { HealthModule } from './health/health.module';
import { LearningModule } from './learning/learning.module';
import { LearningLocalDemoModule } from './learning-local-demo/learning-local-demo.module';
import { LearningPathModule } from './learning-path/learning-path.module';
import { MeModule } from './me/me.module';
import { NotificationModule } from './notifications/notification.module';
import { ParentModule } from './parent/parent.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProgressModule } from './progress/progress.module';
import { TeacherContentModule } from './teacher-content/teacher-content.module';
import { UploadStorageModule } from './upload-storage/upload-storage.module';
import { ScreenTimeModule } from './screen-time/screen-time.module';
import { BrowserControlModule } from './browser-control/browser-control.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['../../.env', '.env'],
    }),
    ScheduleModule.forRoot(),
    PrismaModule,
    BrowserControlModule,
    ScreenTimeModule,
    HealthModule,
    AuthModule,
    ActivationOrdersModule,
    AdminContentModule,
    MeModule,
    NotificationModule,
    ParentModule,
    DailyPlanModule,
    LearningPathModule,
    LearningModule,
    LearningLocalDemoModule,
    CatalogModule,
    ProgressModule,
    BillingModule,
    ErpLocalDemoModule,
    ChannelAffiliateModule,
    ChannelAdminModule,
    ChannelFinanceModule,
    AiChatModule,
    AiContextModule,
    TeacherContentModule,
    UploadStorageModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
