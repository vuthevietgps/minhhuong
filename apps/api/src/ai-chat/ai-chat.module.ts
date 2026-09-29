import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { EntitlementModule } from '../entitlement/entitlement.module';
import { LearningAccessModule } from '../learning-access/learning-access.module';
import { AiChatController } from './ai-chat.controller';
import { AiChatService } from './ai-chat.service';
import { AiTutorProvider } from './ai-tutor.provider';
import { AiContextModule } from '../ai-context/ai-context.module';

@Module({
  imports: [
    AuthModule,
    LearningAccessModule,
    EntitlementModule,
    AiContextModule,
  ],
  controllers: [AiChatController],
  providers: [AiChatService, AiTutorProvider],
})
export class AiChatModule {}
