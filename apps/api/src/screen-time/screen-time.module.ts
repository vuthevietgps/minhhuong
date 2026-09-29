import { Global, Module } from '@nestjs/common';
import { ScreenTimeService } from './screen-time.service';

@Global()
@Module({
  providers: [ScreenTimeService],
  exports: [ScreenTimeService],
})
export class ScreenTimeModule {}
