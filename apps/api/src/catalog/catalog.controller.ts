import { Controller, Get, Param } from '@nestjs/common';
import { CatalogService } from './catalog.service';

@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get('levels')
  listLevels() {
    return this.catalogService.listLevels();
  }

  @Get('courses')
  listCourses() {
    return this.catalogService.listCourses();
  }

  @Get('courses/:slug/outline')
  getCourseOutline(@Param('slug') slug: string) {
    return this.catalogService.getCourseOutline(slug);
  }
}
