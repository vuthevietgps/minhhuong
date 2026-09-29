import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import type { AuthenticatedUser } from '../auth/auth.types';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { AiContextService } from './ai-context.service';
import { CreateManualContextDto } from './dto/create-manual-context.dto';
import { CreateYoutubeContextsDto } from './dto/create-youtube-contexts.dto';
import {
  AskContextsDto,
  BatchYoutubeContextsDto,
  CreateContextDocumentDto,
  RetryContextDto,
} from './dto/video-workspace.dto';

@Controller('ai-contexts')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('PARENT', 'TEACHER', 'CONTENT_EDITOR', 'ADMIN', 'SUPPORT')
export class AiContextController {
  constructor(private readonly contexts: AiContextService) {}

  @Get()
  list(@Query('targetRole') targetRole?: string) {
    return this.contexts.list(targetRole);
  }

  @Post('youtube')
  createYoutube(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateYoutubeContextsDto,
  ) {
    return this.contexts.createYoutube(user, dto);
  }

  @Post('youtube/batch')
  createBatch(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: BatchYoutubeContextsDto,
  ) {
    return this.contexts.createYoutubeBatch(user, dto);
  }

  @Get('documents')
  documents() {
    return this.contexts.listDocuments();
  }

  @Post('documents')
  createDocument(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateContextDocumentDto,
  ) {
    return this.contexts.createDocument(user, dto);
  }

  @Post('documents/:id/retry')
  retryDocument(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    return this.contexts.retryDocument(user, id);
  }

  @Post('ask')
  ask(@Body() dto: AskContextsDto) {
    return this.contexts.ask(dto);
  }

  @Get(':id/export')
  export(@Param('id') id: string) {
    return this.contexts.exportSource(id);
  }

  @Post(':id/retry')
  retry(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: RetryContextDto,
  ) {
    return this.contexts.retry(user, id, dto);
  }

  @Post('manual')
  createManual(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateManualContextDto,
  ) {
    return this.contexts.createManual(user, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.contexts.remove(user, id);
  }
}
