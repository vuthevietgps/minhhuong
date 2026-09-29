import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { AiContextService } from './ai-context.service';

@Injectable()
export class AiContextWorker {
  private readonly logger = new Logger(AiContextWorker.name);
  constructor(private readonly contexts: AiContextService) {}

  @Cron('*/5 * * * * *', { waitForCompletion: true })
  async process() {
    // The durable queue lives in PostgreSQL. Leases prevent two API replicas
    // from processing the same record and allow recovery after a restart.
    try {
      const results = await Promise.all([
        this.contexts.processPendingSources(2),
        this.contexts.processPendingDocuments(1),
      ]);
      if (results.flat().some((result) => result.status === 'rejected'))
        this.logger.warn(
          'A video knowledge job could not persist its status; the lease will recover it.',
        );
    } catch {
      this.logger.warn(
        'Video knowledge queue is unavailable; retrying on the next tick.',
      );
    }
  }
}
