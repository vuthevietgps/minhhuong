import { ConfigService } from '@nestjs/config';
import { ServiceUnavailableException } from '@nestjs/common';
import {
  AiContextProcessor,
  ContextEvidence,
  splitContextText,
} from './ai-context.processor';

const create = jest.fn();
jest.mock('openai', () => ({
  __esModule: true,
  default: Object.assign(
    jest.fn().mockImplementation(() => ({ responses: { create } })),
    { APIError: class extends Error {} },
  ),
}));

describe('video context AI processing', () => {
  const config = {
    get: (key: string) =>
      ({ AI_PROVIDER: 'openai', OPENAI_API_KEY: 'test-only' })[key],
  } as ConfigService;
  const evidence: ContextEvidence[] = [
    {
      referenceId: 'S1C1',
      sourceId: 'video-1',
      title: 'Speaking practice',
      sourceUrl: 'https://www.youtube.com/watch?v=abcdefghijk',
      offset: 90,
      text: 'Practise speaking slowly every day, then review your pronunciation.',
    },
  ];
  beforeEach(() => create.mockReset());

  it('generates child activities with validated question answers', async () => {
    const activity = {
      context: 'Ngữ cảnh độc lập về màu sắc cho trẻ nhỏ.',
      questions: [{ prompt: 'Green?', options: ['Xanh lá', 'Đỏ'], answer: 0 }],
    };
    create.mockResolvedValue({
      status: 'completed',
      output_text: JSON.stringify(activity),
    });
    await expect(
      new AiContextProcessor(config).childActivity(
        'Colors',
        'General facts about colors',
      ),
    ).resolves.toEqual(activity);
  });
  it.each([
    { unavailable: true },
    {
      context: 'An independently written learning note for children.',
      questions: [{ prompt: 'Color?', options: ['Red', 'Green'], answer: 2 }],
    },
    {
      context: 'An independently written learning note for children.',
      questions: [{ prompt: 'Color?', options: ['Red', 'red'], answer: 0 }],
    },
    {
      context: 'An independently written learning note for children.',
      questions: [{ prompt: 'Color?', options: [' ', 'Green'], answer: 0 }],
    },
  ])('rejects unsuitable or invalid child activities', async (value) => {
    create.mockResolvedValue({
      status: 'completed',
      output_text: JSON.stringify(value),
    });
    await expect(
      new AiContextProcessor(config).childActivity('Colors', 'General facts'),
    ).rejects.toThrow(ServiceUnavailableException);
  });

  it('preserves every character, including the end of a long transcript', () => {
    const transcript = 'learning '.repeat(7000) + 'IMPORTANT FINAL CONCLUSION';
    const chunks = splitContextText(transcript, 12000);
    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks.join('')).toBe(transcript);
    expect(chunks.every((chunk) => chunk.length <= 12000)).toBe(true);
  });

  it('summarizes each segment before combining all results', async () => {
    create.mockResolvedValue({
      status: 'completed',
      output_text: 'Ý chính: learning. Kết luận: review.',
    });
    const transcript =
      'A learning example. '.repeat(800) + 'Final unique example.';
    await new AiContextProcessor(config).structure('Video', transcript);
    const count = splitContextText(transcript, 12000).length;
    expect(create).toHaveBeenCalledTimes(count + 1);
    expect(
      JSON.parse(create.mock.calls[count - 1][0].input).transcript,
    ).toContain('Final unique example.');
    expect(
      JSON.parse(create.mock.calls[count][0].input).summaries,
    ).toHaveLength(count);
    expect(create.mock.calls[0][0].store).toBe(false);
  });

  it('does not mark a local extract as an AI summary when AI is disabled', async () => {
    const disabled = { get: () => 'disabled' } as unknown as ConfigService;
    await expect(
      new AiContextProcessor(disabled).structure(
        'Video',
        'A complete transcript for testing.',
      ),
    ).rejects.toThrow(ServiceUnavailableException);
    expect(create).not.toHaveBeenCalled();
  });

  const originalPassage =
    'Khi còn nhỏ tôi thường ngồi bên cửa sổ ngắm những chiếc lá bay trong gió và tưởng tượng về một vùng đất xa xôi.';

  it('rejects copied speech despite changes to case, punctuation and Unicode', async () => {
    create.mockResolvedValue({
      status: 'completed',
      output_text:
        '## Kiến thức nền tảng\n' +
        originalPassage.toUpperCase().normalize('NFD').replace(/ /g, ' —\n'),
    });
    await expect(
      new AiContextProcessor(config).structure('Video', originalPassage),
    ).rejects.toThrow('trùng lời nguồn');
    expect(create).toHaveBeenCalledTimes(1);
  });

  it('allows independently worded knowledge containing short shared terms', async () => {
    const context =
      '## Nguyên lý\nLuyện tập ngắt quãng giúp củng cố trí nhớ; hãy phân bố thời gian ôn tập qua nhiều buổi.';
    create.mockResolvedValue({ status: 'completed', output_text: context });
    await expect(
      new AiContextProcessor(config).structure(
        'Cách học',
        'Về luyện tập ngắt quãng, điều tôi muốn nhấn mạnh là trí nhớ được cải thiện khi bạn ôn lại kiến thức ở các thời điểm khác nhau.',
      ),
    ).resolves.toBe(context);
  });

  it('checks the final merge against the original transcript as well as segment drafts', async () => {
    const transcript = 'Additional topic. '.repeat(800) + originalPassage;
    const count = splitContextText(transcript, 12000).length;
    for (let index = 0; index < count; index++) {
      create.mockResolvedValueOnce({
        status: 'completed',
        output_text: '## Giới hạn\nChưa có kiến thức chung đủ rõ để tổng hợp.',
      });
    }
    create.mockResolvedValueOnce({
      status: 'completed',
      output_text: originalPassage,
    });
    await expect(
      new AiContextProcessor(config).structure('Video', transcript),
    ).rejects.toThrow('trùng lời nguồn');
    expect(create).toHaveBeenCalledTimes(count + 1);
  });

  it('stops immediately when a segment draft copies source material', async () => {
    const transcript = originalPassage + ' Additional topic.'.repeat(800);
    create.mockResolvedValue({
      status: 'completed',
      output_text: originalPassage,
    });
    await expect(
      new AiContextProcessor(config).structure('Video', transcript),
    ).rejects.toThrow('trùng lời nguồn');
    expect(create).toHaveBeenCalledTimes(1);
  });

  it('rejects truncated AI output instead of saving it as complete', async () => {
    create.mockResolvedValue({
      status: 'incomplete',
      output_text: 'Partial answer',
    });
    await expect(
      new AiContextProcessor(config).structure(
        'Video',
        'A complete transcript for testing.',
      ),
    ).rejects.toThrow(ServiceUnavailableException);
  });

  it('returns only verified citations with the original source and timestamp', async () => {
    create.mockResolvedValue({
      status: 'completed',
      output_text: JSON.stringify({
        supported: true,
        answer: 'Luyện nói mỗi ngày [S1C1].',
        citations: [
          {
            referenceId: 'S1C1',
            excerpt: 'Practise speaking slowly every day',
          },
        ],
      }),
    });
    const reply = await new AiContextProcessor(config).answer(
      'How should I practise?',
      evidence,
    );
    expect(reply.citations[0]).toMatchObject({
      sourceId: 'video-1',
      offset: 90,
      sourceUrl: evidence[0].sourceUrl,
    });
  });

  it.each([
    { referenceId: 'S9C1', excerpt: 'Practise speaking slowly every day' },
    {
      referenceId: 'S1C1',
      excerpt: 'An invented quotation not present in the evidence',
    },
  ])('rejects fabricated reference or quotation: %j', async (citation) => {
    create.mockResolvedValue({
      status: 'completed',
      output_text: JSON.stringify({
        supported: true,
        answer: 'Claim [S1C1]',
        citations: [citation],
      }),
    });
    await expect(
      new AiContextProcessor(config).answer('Question?', evidence),
    ).rejects.toThrow(ServiceUnavailableException);
  });

  it('returns an explicit insufficient-evidence answer without fabricated sources', async () => {
    create.mockResolvedValue({
      status: 'completed',
      output_text: JSON.stringify({
        supported: false,
        answer: 'Not found',
        citations: [],
      }),
    });
    expect(
      await new AiContextProcessor(config).answer('Unknown topic?', evidence),
    ).toMatchObject({ supported: false, citations: [] });
  });

  it('rejects a generated document with invented source IDs', async () => {
    create.mockResolvedValue({
      status: 'completed',
      output_text: 'A claim [S9]',
    });
    await expect(
      new AiContextProcessor(config).document('REPORT', 'Report', '', [
        { ...evidence[0], referenceId: 'S1' },
      ]),
    ).rejects.toThrow(ServiceUnavailableException);
  });
});
