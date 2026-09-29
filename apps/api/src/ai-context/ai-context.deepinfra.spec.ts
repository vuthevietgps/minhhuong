import { ConfigService } from '@nestjs/config';
import { ServiceUnavailableException } from '@nestjs/common';
import { AiContextProcessor } from './ai-context.processor';

const evidence = [
  {
    referenceId: 'S1C1',
    sourceId: 'video-1',
    title: 'Luyện nghe',
    sourceUrl: 'https://www.youtube.com/watch?v=abcdefghijk',
    offset: 45,
    text: 'Nghe một đoạn ngắn mỗi ngày rồi nhắc lại các từ vừa nghe.',
  },
];

describe('DeepInfra video integration with the real SDK and mocked HTTP', () => {
  let fetchMock: jest.SpyInstance;
  const processor = (overrides: Record<string, string | undefined> = {}) =>
    new AiContextProcessor(
      new ConfigService({
        AI_PROVIDER: 'disabled',
        AI_CONTEXT_PROVIDER: 'deepinfra',
        DEEPINFRA_API_KEY: 'synthetic-deepinfra-key',
        // This key must never be sent to DeepInfra or used as a paid fallback.
        OPENAI_API_KEY: 'synthetic-openai-key',
        ...overrides,
      }),
    );
  const completion = (
    content: string,
    finishReason = 'stop',
    refusal: string | null = null,
  ) => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          id: 'test-completion',
          choices: [
            {
              finish_reason: finishReason,
              message: { role: 'assistant', content, refusal },
            },
          ],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    );
  };
  const request = () => {
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    return {
      url,
      headers: new Headers(init.headers),
      body: JSON.parse(init.body as string) as Record<string, unknown>,
    };
  };

  beforeEach(() => {
    fetchMock = jest.spyOn(globalThis, 'fetch');
  });
  afterEach(() => jest.restoreAllMocks());

  it('uses the cheap model, Flex, bounded output and the DeepInfra key only', async () => {
    completion('Ý chính: Luyện nghe hằng ngày.');
    await expect(
      processor().structure('Luyện nghe', evidence[0].text),
    ).resolves.toContain('Luyện nghe');
    const sent = request();
    expect(sent.url).toBe(
      'https://api.deepinfra.com/v1/openai/chat/completions',
    );
    expect(sent.headers.get('authorization')).toBe(
      'Bearer synthetic-deepinfra-key',
    );
    expect(sent.body).toMatchObject({
      model: 'google/gemma-4-E4B-it',
      service_tier: 'flex',
      reasoning_effort: 'none',
      fail_fast: true,
      temperature: 0.2,
      max_tokens: 3500,
      stream: false,
    });
    expect(sent.body).not.toHaveProperty('store');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('allows an explicit model and standard tier without opting into priority', async () => {
    completion('Một bản tóm tắt.');
    await processor({
      DEEPINFRA_CONTEXT_MODEL: 'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo',
      DEEPINFRA_SERVICE_TIER: 'standard',
    }).structure('Video', evidence[0].text);
    expect(request().body.model).toBe(
      'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo',
    );
    expect(request().body).not.toHaveProperty('service_tier');
  });

  it('rejects a copied transcript without paid rewrites or fallback requests', async () => {
    const transcript =
      'Mỗi buổi chiều tôi lại đi qua con đường nhỏ dưới những tán cây xanh để tìm cảm hứng cho câu chuyện mới.';
    completion('## Ghi chú\n' + transcript);
    await expect(processor().structure('Video', transcript)).rejects.toThrow(
      'trùng lời nguồn',
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it.each([
    { AI_CONTEXT_PROVIDER: 'disabled' },
    { DEEPINFRA_API_KEY: '' },
    { AI_CONTEXT_PROVIDER: 'unknown' },
    { DEEPINFRA_SERVICE_TIER: 'priority' },
  ])(
    'does not make a paid call for invalid or disabled configuration: %j',
    async (overrides) => {
      await expect(
        processor({ AI_PROVIDER: 'openai', ...overrides }).structure(
          'Video',
          evidence[0].text,
        ),
      ).rejects.toThrow(ServiceUnavailableException);
      expect(fetchMock).not.toHaveBeenCalled();
    },
  );

  it.each([
    ['Partial summary', 'length', null],
    ['', 'stop', null],
    ['Refused', 'stop', 'Refusal'],
  ])(
    'does not save incomplete or refused output: %s',
    async (content, reason, refusal) => {
      completion(content, reason, refusal);
      await expect(
        processor().structure('Video', evidence[0].text),
      ).rejects.toThrow(ServiceUnavailableException);
      expect(fetchMock).toHaveBeenCalledTimes(1);
    },
  );

  it.each([401, 429, 500])(
    'sanitizes HTTP %i errors without retries or a paid provider fallback',
    async (status) => {
      fetchMock.mockResolvedValue(
        new Response(
          JSON.stringify({
            error: {
              message: 'synthetic-deepinfra-key sensitive upstream detail',
            },
          }),
          { status, headers: { 'Content-Type': 'application/json' } },
        ),
      );
      try {
        await processor().structure('Video', evidence[0].text);
        throw new Error('Expected provider failure');
      } catch (error) {
        expect(error).toBeInstanceOf(ServiceUnavailableException);
        expect((error as Error).message).not.toContain('synthetic-');
      }
      expect(fetchMock).toHaveBeenCalledTimes(1);
    },
  );

  it('validates JSON Q&A and keeps original source links and timestamps', async () => {
    const answer = {
      supported: true,
      answer: 'Nghe mỗi ngày rồi nhắc lại [S1C1].',
      citations: [{ referenceId: 'S1C1', excerpt: evidence[0].text }],
    };
    completion('```json\n' + JSON.stringify(answer) + '\n```');
    const result = await processor().answer(
      'Nên luyện nghe thế nào?',
      evidence,
    );
    expect(result.citations[0]).toMatchObject({
      sourceId: evidence[0].sourceId,
      sourceUrl: evidence[0].sourceUrl,
      offset: 45,
    });
    expect(JSON.stringify(request().body.messages)).toContain(
      'Return only one JSON object',
    );
    expect(request().body).not.toHaveProperty('response_format');
  });

  it.each([
    'not JSON',
    JSON.stringify({
      supported: true,
      answer: 'Khẳng định [S1C1].',
      citations: [
        {
          referenceId: 'S1C1',
          excerpt: 'Nội dung không hề xuất hiện trong nguồn.',
        },
      ],
    }),
  ])(
    'rejects invalid Q&A without saving fabricated citations',
    async (output) => {
      completion(output);
      await expect(processor().answer('Câu hỏi?', evidence)).rejects.toThrow(
        ServiceUnavailableException,
      );
    },
  );

  it('creates a cited document through DeepInfra', async () => {
    completion('## Ghi chú\nLuyện nghe hằng ngày [S1].');
    const result = await processor().document('NOTES', 'Ghi chú', '', [
      { ...evidence[0], referenceId: 'S1' },
    ]);
    expect(result).toContain('## Nguồn tham chiếu');
    expect(result).toContain(evidence[0].sourceUrl);
  });
});
