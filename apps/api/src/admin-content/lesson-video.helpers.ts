import { BadRequestException } from '@nestjs/common';
import { createHash } from 'node:crypto';
import { VideoProviderDto } from './dto/create-video-link.dto';

export function normalizeVideoUrl(url: string, provider: VideoProviderDto) {
  if (provider === VideoProviderDto.YOUTUBE) {
    const videoId = extractYouTubeVideoId(url);
    if (!videoId) {
      throw new BadRequestException('Invalid YouTube URL');
    }

    return {
      playbackId: videoId,
      sourceUrl: url,
      embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}`,
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
    };
  }

  return {
    playbackId: createHash('sha1').update(url).digest('hex'),
    sourceUrl: url,
    embedUrl: url,
    thumbnailUrl: undefined,
  };
}

export function extractYouTubeVideoId(url: string): string | null {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.replace(/^www\./, '');

    if (hostname === 'youtu.be') {
      return parsed.pathname.split('/').filter(Boolean)[0] ?? null;
    }

    if (hostname.endsWith('youtube.com')) {
      if (parsed.pathname === '/watch') {
        return parsed.searchParams.get('v');
      }

      const parts = parsed.pathname.split('/').filter(Boolean);
      if (['embed', 'shorts', 'live'].includes(parts[0] ?? '')) {
        return parts[1] ?? null;
      }
    }

    return null;
  } catch {
    return null;
  }
}
