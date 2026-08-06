import { Controller, Get, UseGuards } from '@nestjs/common';
import { LocalDemoOnlyGuard } from '../runtime-safety/local-demo-only.guard';
import { ErpLocalDemoService } from './erp-local-demo.service';

@Controller('erp-local-demo')
@UseGuards(LocalDemoOnlyGuard)
export class ErpLocalDemoController {
  constructor(private readonly erpLocalDemoService: ErpLocalDemoService) {}

  @Get('lead-order-profit-report')
  getLeadOrderProfitReport() {
    return this.erpLocalDemoService.buildLeadOrderProfitReport();
  }

  @Get('inventory-imei-stock-report')
  getInventoryImeiStockReport() {
    return this.erpLocalDemoService.buildInventoryImeiStockReport();
  }
}
