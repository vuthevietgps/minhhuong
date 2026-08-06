import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { EntitlementModule } from '../entitlement/entitlement.module';
import { LearningAccessModule } from '../learning-access/learning-access.module';
import { AiChatController } from './ai-chat.controller';
import { AiChatService } from './ai-chat.service';

@Module({
  imports: [AuthModule, LearningAccessModule, EntitlementModule],
  controllers: [AiChatController],
  providers: [AiChatService],
})
export class AiChatModule {}
