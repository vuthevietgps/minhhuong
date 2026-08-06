import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  ProgressStatusDto,
  UpsertLessonProgressDto,
} from './dto/upsert-lesson-progress.dto';

@Injectable()
export class ProgressService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserProgress(childProfileId: string) {
    return this.prisma.lessonProgress.findMany({
      where: { childProfileId },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        status: true,
        score: true,
        completedAt: true,
        lastPositionSec: true,
        lesson: {
          select: {
            id: true,
            slug: true,
            title: true,
          },
        },
      },
    });
  }

  async upsertLessonProgress(
    childProfileId: string,
    dto: UpsertLessonProgressDto,
  ) {
    if (dto.status === ProgressStatusDto.COMPLETED) {
      throw new BadRequestException(
        'Lesson completion is computed server-side',
      );
    }

    const lesson = await this.prisma.lesson.findUnique({
      where: { id: dto.lessonId },
      select: { id: true, status: true },
    });

    if (!lesson || lesson.status !== 'PUBLISHED') {
      throw new NotFoundException('Published lesson not found');
    }

    return this.prisma.lessonProgress.upsert({
      where: {
        childProfileId_lessonId: {
          childProfileId,
          lessonId: dto.lessonId,
        },
      },
      update: {
        status: dto.status,
        lastPositionSec: dto.lastPositionSec,
      },
      create: {
        childProfileId,
        lessonId: dto.lessonId,
        status: dto.status,
        lastPositionSec: dto.lastPositionSec,
      },
    });
  }

  async getSummary(childProfileId: string) {
    const rows = await this.prisma.lessonProgress.findMany({
      where: { childProfileId },
      select: { status: true, score: true },
    });

    const completed = rows.filter((r) => r.status === 'COMPLETED').length;
    const inProgress = rows.filter((r) => r.status === 'IN_PROGRESS').length;
    const scored = rows.filter((r) => r.score !== null);
    const averageScore =
      scored.length > 0
        ? Math.round(
            scored.reduce((s, r) => s + (r.score ?? 0), 0) / scored.length,
          )
        : null;

    return {
      totalTracked: rows.length,
      completed,
      inProgress,
      notStarted: rows.length - completed - inProgress,
      averageScore,
    };
  }
}
