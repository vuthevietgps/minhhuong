import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { fetchTranscript } from 'youtube-transcript-plus';
import { MAX_TRANSCRIPT_CHARACTERS } from './ai-context.constants';

@Injectable()
export class YoutubeTranscriptService {
  async extract(input: string, language?: string) {
    const { videoId } = this.canonicalize(input);
    const options = {
      videoDetails: true as const,
      signal: AbortSignal.timeout(45000),
      retries: 0,
    };
    try {
      const result = (await fetchTranscript(videoId, {
        ...options,
        lang: language,
      }).catch((error: unknown) => {
        if (
          error instanceof Error &&
          error.name === 'YoutubeTranscriptNotAvailableLanguageError' &&
          language
        )
          return fetchTranscript(videoId, options);
        throw error;
      })) as {
        videoDetails: { title: string };
        segments: Array<{
          text: string;
          offset: number;
          duration: number;
          lang?: string;
        }>;
      };
      const segments = result.segments
        .map((segment) => ({
          text: segment.text.replace(/\s+/g, ' ').trim(),
          offset: Math.max(0, segment.offset),
          duration: Math.max(0, segment.duration),
        }))
        .filter(
          (segment) =>
            segment.text &&
            Number.isFinite(segment.offset) &&
            Number.isFinite(segment.duration),
        );
      const transcript = segments.map((segment) => segment.text).join('\n');
      if (transcript.length < 20)
        throw new BadRequestException(
          'Video không có phụ đề đủ nội dung. Hãy bổ sung transcript thủ công.',
        );
      if (transcript.length > MAX_TRANSCRIPT_CHARACTERS)
        throw new BadRequestException(
          'Transcript vượt giới hạn 100.000 ký tự. Hãy chia nội dung thành các phần nhỏ hơn.',
        );
      return {
        transcript,
        segments,
        title: result.videoDetails.title.slice(0, 200),
        language: result.segments[0]?.lang || language || 'und',
      };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new ServiceUnavailableException(
        'Không lấy được phụ đề YouTube (video không có phụ đề, không truy cập được hoặc bị giới hạn). Bạn có thể thử lại hoặc bổ sung transcript thủ công.',
      );
    }
  }

  canonicalize(input: string) {
    let url: URL;
    try {
      url = new URL(input);
    } catch {
      throw new BadRequestException('Đường link YouTube không hợp lệ');
    }

    if (
      !['https:', 'http:'].includes(url.protocol) ||
      url.username ||
      url.password
    )
      throw new BadRequestException('Đường link YouTube không hợp lệ');
    const host = url.hostname.replace(/^www\./, '').toLowerCase();
    let videoId = '';
    if (host === 'youtu.be')
      videoId = url.pathname.split('/').filter(Boolean)[0] ?? '';
    if (host === 'youtube.com' || host.endsWith('.youtube.com')) {
      if (url.pathname === '/watch') videoId = url.searchParams.get('v') ?? '';
      if (/^\/(shorts|embed)\//.test(url.pathname)) {
        videoId = url.pathname.split('/').filter(Boolean)[1] ?? '';
      }
    }
    if (!/^[A-Za-z0-9_-]{11}$/.test(videoId)) {
      throw new BadRequestException('Không tìm thấy mã video YouTube hợp lệ');
    }
    return {
      videoId,
      canonicalUrl: `https://www.youtube.com/watch?v=${videoId}`,
      canonicalKey: `youtube:${videoId}`,
    };
  }
}
