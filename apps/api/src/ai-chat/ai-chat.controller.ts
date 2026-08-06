import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import type { AuthenticatedUser } from '../auth/auth.types';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AiChatService } from './ai-chat.service';
import { CreateChatMessageDto } from './dto/create-chat-message.dto';

@Controller('ai-chat')
@UseGuards(JwtAuthGuard)
export class AiChatController {
  constructor(private readonly aiChatService: AiChatService) {}

  @Get('sessions/:sessionId')
  getSession(
    @Param('sessionId') sessionId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.aiChatService.getSession(user, sessionId);
  }

  @Post('messages')
  createMessage(
    @Body() dto: CreateChatMessageDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.aiChatService.createMessage(user, dto);
  }
}
