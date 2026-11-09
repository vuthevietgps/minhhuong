import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AuthenticatedUser } from '../auth/auth.types';
import { PrismaService } from '../prisma/prisma.service';

/** Shared content lookups, editor scope checks and audit log. */
@Injectable()
export class AdminContentSupportService {
  constructor(private readonly prisma: PrismaService) {}

  async assertEditableLesson(lessonId: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      select: { id: true, status: true },
    });

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    if (lesson.status !== 'DRAFT') {
      throw new BadRequestException('Only draft lessons can be edited');
    }

    return lesson;
  }

  async audit(
    user: AuthenticatedUser,
    action: string,
    entityType?: string,
    entityId?: string,
    metadata?: Record<string, unknown>,
  ) {
    await this.prisma.auditLog
      .create({
        data: {
          userId: user.sub.startsWith('demo-') ? undefined : user.sub,
          action,
          entityType,
          entityId,
          metadata: metadata as Prisma.InputJsonValue | undefined,
        },
      })
      .catch(() => undefined);
  }
}
