import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AiContextController } from './ai-context.controller';
import { AiContextProcessor } from './ai-context.processor';
import { AiContextService } from './ai-context.service';
import { YoutubeTranscriptService } from './youtube-transcript.service';
import { AiContextWorker } from './ai-context.worker';

@Module({
  imports: [AuthModule],
  controllers: [AiContextController],
  providers: [
    AiContextService,
    AiContextProcessor,
    YoutubeTranscriptService,
    AiContextWorker,
  ],
  exports: [AiContextService, AiContextProcessor, YoutubeTranscriptService],
})
export class AiContextModule {}
