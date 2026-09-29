import { BadRequestException } from '@nestjs/common';
import { YoutubeTranscriptService } from './youtube-transcript.service';
import { fetchTranscript } from 'youtube-transcript-plus';
jest.mock('youtube-transcript-plus', () => ({ fetchTranscript: jest.fn() }));

describe('YoutubeTranscriptService', () => {
  const service = new YoutubeTranscriptService();
  beforeEach(() => jest.mocked(fetchTranscript).mockReset());

  it.each([
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'https://youtu.be/dQw4w9WgXcQ',
    'https://youtube.com/shorts/dQw4w9WgXcQ',
  ])('normalizes supported YouTube URLs without tracking parameters', (url) => {
    expect(service.canonicalize(url)).toEqual({
      videoId: 'dQw4w9WgXcQ',
      canonicalUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      canonicalKey: 'youtube:dQw4w9WgXcQ',
    });
  });

  it('rejects non-YouTube URLs', () => {
    expect(() =>
      service.canonicalize('https://example.com/watch?v=dQw4w9WgXcQ'),
    ).toThrow(BadRequestException);
  });

  it('extracts text, language and timestamps', async () => {
    jest.mocked(fetchTranscript).mockResolvedValue({
      videoDetails: { title: 'Learning' },
      segments: [
        {
          text: 'This is a complete learning transcript.',
          offset: 12,
          duration: 3,
          lang: 'en',
        },
      ],
    } as never);
    const result = await service.extract('https://youtu.be/abcdefghijk', 'en');
    expect(result.transcript).toBe('This is a complete learning transcript.');
    expect(result.segments[0].offset).toBe(12);
    expect(result.language).toBe('en');
    expect(fetchTranscript).toHaveBeenCalledWith(
      'abcdefghijk',
      expect.objectContaining({ lang: 'en', retries: 0 }),
    );
  });

  it('uses the original language only when the preferred one is absent', async () => {
    const missingLanguage = new Error('missing language');
    missingLanguage.name = 'YoutubeTranscriptNotAvailableLanguageError';
    jest
      .mocked(fetchTranscript)
      .mockRejectedValueOnce(missingLanguage)
      .mockResolvedValueOnce({
        videoDetails: { title: 'Learning' },
        segments: [
          {
            text: 'This is the original language transcript.',
            offset: 0,
            duration: 3,
            lang: 'en',
          },
        ],
      } as never);
    expect(
      (await service.extract('https://youtu.be/abcdefghijk', 'vi')).language,
    ).toBe('en');
    expect(fetchTranscript).toHaveBeenCalledTimes(2);
  });

  it('does not retry access restrictions as another language', async () => {
    jest.mocked(fetchTranscript).mockRejectedValue(new Error('unavailable'));
    await expect(
      service.extract('https://youtu.be/abcdefghijk', 'vi'),
    ).rejects.toThrow('Không lấy được phụ đề');
    expect(fetchTranscript).toHaveBeenCalledTimes(1);
  });

  it('rejects an empty transcript and keeps oversize transcripts from being silently truncated', async () => {
    jest.mocked(fetchTranscript).mockResolvedValue({
      videoDetails: { title: 'Empty' },
      segments: [],
    } as never);
    await expect(
      service.extract('https://youtu.be/abcdefghijk'),
    ).rejects.toThrow('không có phụ đề đủ');
    jest.mocked(fetchTranscript).mockResolvedValue({
      videoDetails: { title: 'Long' },
      segments: [{ text: 'a'.repeat(100001), offset: 0, duration: 1 }],
    } as never);
    await expect(
      service.extract('https://youtu.be/abcdefghijk'),
    ).rejects.toThrow('vượt giới hạn');
  });

  it.each([
    'ftp://youtube.com/watch?v=abcdefghijk',
    'https://user:secret@youtube.com/watch?v=abcdefghijk',
  ])('rejects an unsafe URL form %s', (url) => {
    expect(() => service.canonicalize(url)).toThrow(BadRequestException);
  });
});
