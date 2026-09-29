import { ServiceUnavailableException } from '@nestjs/common';
import { AiTutorProvider } from './ai-tutor.provider';

describe('AiTutorProvider', () => {
  const originalProvider = process.env.AI_PROVIDER;
  const originalMockEnabled = process.env.AI_CHAT_MOCK_ENABLED;
  const originalApiKey = process.env.OPENAI_API_KEY;

  afterEach(() => {
    restoreEnvironment('AI_PROVIDER', originalProvider);
    restoreEnvironment('AI_CHAT_MOCK_ENABLED', originalMockEnabled);
    restoreEnvironment('OPENAI_API_KEY', originalApiKey);
  });

  it('identifies explicitly enabled local mock mode', async () => {
    const provider = createProvider({
      AI_PROVIDER: 'mock',
      AI_CHAT_MOCK_ENABLED: 'true',
    });

    await expect(
      provider.reply({ message: 'Hello!', history: [] }),
    ).resolves.toEqual(
      expect.objectContaining({
        provider: 'mock',
        mode: 'MOCK_DEV_ONLY',
        moderation: 'NOT_RUN',
      }),
    );
  });

  it('recognises configured live OpenAI mode without calling the API', () => {
    const provider = createProvider({
      AI_PROVIDER: 'openai',
      OPENAI_API_KEY: 'test-key',
    });

    expect(provider.getStatus()).toEqual({
      provider: 'openai',
      model: 'gpt-5-mini',
      mode: 'LIVE',
    });
  });

  it('fails closed when neither live AI nor mock mode is configured', () => {
    const provider = createProvider({ AI_PROVIDER: 'disabled' });

    expect(() => provider.getStatus()).toThrow(ServiceUnavailableException);
  });

  function createProvider(environment: Record<string, string>) {
    Object.assign(process.env, environment);
    if (!('AI_CHAT_MOCK_ENABLED' in environment)) {
      delete process.env.AI_CHAT_MOCK_ENABLED;
    }
    if (!('OPENAI_API_KEY' in environment)) {
      delete process.env.OPENAI_API_KEY;
    }
    return new AiTutorProvider({
      get: <T>(key: string) => process.env[key] as T | undefined,
    } as any);
  }

  function restoreEnvironment(key: string, value: string | undefined) {
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
});
