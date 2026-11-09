import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuthenticatedUser } from '../auth/auth.types';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateVideoLinkDto,
  VideoProviderDto,
} from './dto/create-video-link.dto';
import { UploadVideoDto } from './dto/upload-video.dto';
import { AdminContentSupportService } from './admin-content-support.service';
import { normalizeVideoUrl } from './lesson-video.helpers';

/** Lesson video links and uploads. */
@Injectable()
export class LessonVideoService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly adminContentSupportService: AdminContentSupportService,
  ) {}

  async attachVideoLink(
    lessonId: string,
    dto: CreateVideoLinkDto,
    user: AuthenticatedUser,
  ) {
    await this.adminContentSupportService.assertEditableLesson(lessonId);
    const provider = dto.provider ?? VideoProviderDto.YOUTUBE;
    const normalized = normalizeVideoUrl(dto.url, provider);

    const video = await this.prisma.videoAsset.create({
      data: {
        lessonId,
        title: dto.title,
        provider,
        processingStatus: 'READY',
        playbackId: normalized.playbackId,
        sourceUrl: normalized.sourceUrl,
        embedUrl: normalized.embedUrl,
        thumbnailUrl: dto.thumbnailUrl ?? normalized.thumbnailUrl,
        durationSec: dto.durationSec,
        sortOrder: dto.sortOrder ?? 0,
        uploadedById: user.sub,
      },
    });
    await this.adminContentSupportService.audit(
      user,
      'content.video.link',
      'VideoAsset',
      video.id,
      {
        lessonId,
        provider,
        sourceUrl: normalized.sourceUrl,
      },
    );

    return video;
  }

  async attachUploadedVideo(
    lessonId: string,
    file: Express.Multer.File | undefined,
    dto: UploadVideoDto,
    user: AuthenticatedUser,
  ) {
    if (!file) {
      throw new BadRequestException('Video file is required');
    }
    await this.adminContentSupportService.assertEditableLesson(lessonId);

    const video = await this.prisma.videoAsset.create({
      data: {
        lessonId,
        title: dto.title ?? file.originalname,
        provider: 'INTERNAL',
        processingStatus: 'READY',
        playbackId: file.filename,
        sourceUrl: `/uploads/videos/${file.filename}`,
        storageKey: `videos/${file.filename}`,
        mimeType: file.mimetype,
        fileSizeBytes: file.size,
        durationSec: dto.durationSec,
        uploadedById: user.sub,
      },
    });
    await this.adminContentSupportService.audit(
      user,
      'content.video.upload',
      'VideoAsset',
      video.id,
      {
        lessonId,
        originalName: file.originalname,
        size: file.size,
        mimeType: file.mimetype,
      },
    );

    return video;
  }

  async deleteVideo(
    lessonId: string,
    videoId: string,
    user: AuthenticatedUser,
  ) {
    await this.adminContentSupportService.assertEditableLesson(lessonId);
    const video = await this.prisma.videoAsset.findUnique({
      where: { id: videoId },
      select: { id: true, lessonId: true },
    });
    if (!video || video.lessonId !== lessonId)
      throw new NotFoundException('Video not found on this lesson');

    await this.prisma.videoAsset.delete({ where: { id: videoId } });
    await this.adminContentSupportService.audit(
      user,
      'content.video.delete',
      'VideoAsset',
      videoId,
      {
        lessonId,
      },
    );
    return { deleted: true };
  }
}
