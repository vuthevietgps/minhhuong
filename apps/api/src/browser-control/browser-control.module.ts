import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { AiTutorProvider } from '../ai-chat/ai-tutor.provider';
import {
  BrowserDeviceController,
  BrowserParentController,
} from './browser-control.controller';
import { BrowserControlService } from './browser-control.service';
import { AiContextModule } from '../ai-context/ai-context.module';
import { BrowserContentController } from './browser-content.controller';
import { BrowserContentService } from './browser-content.service';

@Module({
  imports: [AuthModule, PrismaModule, AiContextModule],
  controllers: [
    BrowserParentController,
    BrowserDeviceController,
    BrowserContentController,
  ],
  providers: [BrowserControlService, AiTutorProvider, BrowserContentService],
})
export class BrowserControlModule {}
