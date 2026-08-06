import { Module } from '@nestjs/common';
import { LocalDemoOnlyGuard } from '../runtime-safety/local-demo-only.guard';
import { ErpLocalDemoController } from './erp-local-demo.controller';
import { ErpLocalDemoService } from './erp-local-demo.service';

@Module({
  controllers: [ErpLocalDemoController],
  providers: [ErpLocalDemoService, LocalDemoOnlyGuard],
  exports: [ErpLocalDemoService],
})
export class ErpLocalDemoModule {}
