import { GUARDS_METADATA } from '@nestjs/common/constants';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AiChatController } from './ai-chat.controller';

describe('AiChatController', () => {
  it('requires JWT auth for all ai-chat routes', () => {
    const guards = Reflect.getMetadata(GUARDS_METADATA, AiChatController) ?? [];

    expect(guards).toContain(JwtAuthGuard);
  });
});
