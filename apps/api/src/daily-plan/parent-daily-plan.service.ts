import { BadRequestException, Injectable } from '@nestjs/common';
import {
  DailyLearningPlanContentSourceMode,
  DailyLearningPlanGeneratedBy,
  DailyLearningPlanItemStatus,
  DailyLearningPlanItemType,
  DailyLearningPlanStatus,
} from '@prisma/client';
import type { AuthenticatedUser } from '../auth/auth.types';
import { PrismaService } from '../prisma/prisma.service';
import { SetParentDailyPlanDto } from './dto/set-parent-daily-plan.dto';
import { DailyPlanGenerationService } from './daily-plan-generation.service';
import { DailyPlanSupportService } from './daily-plan-support.service';
import {
  DEFAULT_MIN_WATCH_PERCENT,
  todayInBangkok,
} from './daily-plan.helpers';

/** Parent-composed daily plans and candidates. */
@Injectable()
export class ParentDailyPlanService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly dailyPlanSupportService: DailyPlanSupportService,
    private readonly dailyPlanGenerationService: DailyPlanGenerationService,
  ) {}

  async listParentDailyPlanCandidates(
    user: AuthenticatedUser,
    childProfileId: string,
    query: string,
  ) {
    await this.dailyPlanSupportService.assertPlanAccess(user, childProfileId);
    const normalizedQuery = query.trim();
    const assignment =
      await this.dailyPlanSupportService.findActivePublishedAssignment(
        childProfileId,
      );
    const pathLessons = assignment
      ? assignment.contentPackage.learningPath.items
          .filter(
            (item) =>
              item.lesson.status === 'PUBLISHED' &&
              item.lesson.videos.length > 0 &&
              (!normalizedQuery ||
                item.lesson.title
                  .toLocaleLowerCase('vi')
                  .includes(normalizedQuery.toLocaleLowerCase('vi'))),
          )
          .map((item) => ({
            id: item.lesson.id,
            title: item.lesson.title,
            description: item.lesson.description,
            durationSec:
              item.lesson.durationSec ??
              item.lesson.videos[0]?.durationSec ??
              null,
            courseTitle: assignment.contentPackage.title,
            source: 'ASSIGNED_PATH' as const,
          }))
      : [];
    // When a child has an assigned path, a parent should only choose from that
    // path.  Falling back to the whole catalog after an empty search would make
    // an assignment that the child cannot subsequently open in their feed.
    if (assignment) return pathLessons.slice(0, 30);

    const lessons = await this.prisma.lesson.findMany({
      where: {
        status: 'PUBLISHED',
        ...(normalizedQuery
          ? { title: { contains: normalizedQuery, mode: 'insensitive' } }
          : {}),
        videos: { some: { processingStatus: 'READY' } },
      },
      orderBy: [{ updatedAt: 'desc' }, { title: 'asc' }],
      take: 30,
      select: {
        id: true,
        title: true,
        description: true,
        durationSec: true,
        videos: {
          where: { processingStatus: 'READY' },
          orderBy: { sortOrder: 'asc' },
          take: 1,
          select: { durationSec: true },
        },
        unit: { select: { course: { select: { title: true } } } },
      },
    });
    return lessons.map((lesson) => ({
      id: lesson.id,
      title: lesson.title,
      description: lesson.description,
      durationSec: lesson.durationSec ?? lesson.videos[0]?.durationSec ?? null,
      courseTitle: lesson.unit.course.title,
      source: 'CATALOG' as const,
    }));
  }

  async setParentTodayPlan(
    childProfileId: string,
    dto: SetParentDailyPlanDto,
    user: AuthenticatedUser,
  ) {
    await this.dailyPlanSupportService.assertPlanAccess(user, childProfileId);
    const lessonIds = [...new Set(dto.lessonIds.map((id) => id.trim()))].filter(
      Boolean,
    );
    if (!lessonIds.length)
      throw new BadRequestException('Choose at least one lesson');

    const assignment =
      await this.dailyPlanSupportService.findActivePublishedAssignment(
        childProfileId,
      );
    if (assignment) {
      const assignedLessonIds = new Set(
        assignment.contentPackage.learningPath.items.map(
          (item) => item.lessonId,
        ),
      );
      if (lessonIds.some((lessonId) => !assignedLessonIds.has(lessonId))) {
        throw new BadRequestException(
          "Selected lessons must belong to the child's assigned learning path",
        );
      }
    }

    const lessons = await this.prisma.lesson.findMany({
      where: {
        id: { in: lessonIds },
        status: 'PUBLISHED',
        videos: { some: { processingStatus: 'READY' } },
      },
      select: {
        id: true,
        durationSec: true,
        videos: {
          where: { processingStatus: 'READY' },
          orderBy: { sortOrder: 'asc' },
          take: 1,
          select: { durationSec: true },
        },
      },
    });
    if (lessons.length !== lessonIds.length) {
      throw new BadRequestException(
        'One or more selected lessons are unavailable',
      );
    }

    const planDate = todayInBangkok();
    const existing = await this.prisma.dailyLearningPlan.findUnique({
      where: { childProfileId_planDate: { childProfileId, planDate } },
      include: { items: { select: { status: true } } },
    });
    if (
      existing?.items.some(
        (item) =>
          item.status === DailyLearningPlanItemStatus.STARTED ||
          item.status === DailyLearningPlanItemStatus.COMPLETED,
      )
    ) {
      throw new BadRequestException(
        'The child has already started today’s plan. Keep the current plan to preserve progress.',
      );
    }

    const byId = new Map(lessons.map((lesson) => [lesson.id, lesson]));
    const items = lessonIds.map((lessonId, index) => {
      return {
        sequence: index + 1,
        itemType: DailyLearningPlanItemType.VIDEO,
        lessonId,
        required: true,
        status: DailyLearningPlanItemStatus.READY,
        minWatchPercent: DEFAULT_MIN_WATCH_PERCENT,
        minScore: null,
        learningPathItemId:
          assignment?.contentPackage.learningPath.items.find(
            (item) => item.lessonId === lessonId,
          )?.id ?? null,
      };
    });
    const targetMinutes = lessonIds.reduce((total, lessonId) => {
      const lesson = byId.get(lessonId)!;
      return (
        total +
        Math.max(
          5,
          Math.ceil(
            (lesson.durationSec ?? lesson.videos[0]?.durationSec ?? 600) / 60,
          ),
        )
      );
    }, 0);

    const plan = await this.prisma.$transaction(async (tx) => {
      if (existing) {
        await tx.dailyLearningPlanItem.deleteMany({
          where: { planId: existing.id },
        });
        return tx.dailyLearningPlan.update({
          where: { id: existing.id },
          data: {
            status: DailyLearningPlanStatus.ACTIVE,
            contentSourceMode: assignment
              ? DailyLearningPlanContentSourceMode.ASSIGNED_PATH
              : DailyLearningPlanContentSourceMode.UNASSIGNED_FALLBACK,
            contentPackageId: assignment?.contentPackageId ?? null,
            learningPathId: assignment?.contentPackage.learningPathId ?? null,
            targetMinutes,
            generatedBy: DailyLearningPlanGeneratedBy.PARENT_MANUAL,
            items: { create: items },
          },
          include: this.dailyPlanGenerationService.planInclude(),
        });
      }
      return tx.dailyLearningPlan.create({
        data: {
          childProfileId,
          planDate,
          status: DailyLearningPlanStatus.ACTIVE,
          contentSourceMode: assignment
            ? DailyLearningPlanContentSourceMode.ASSIGNED_PATH
            : DailyLearningPlanContentSourceMode.UNASSIGNED_FALLBACK,
          contentPackageId: assignment?.contentPackageId ?? null,
          learningPathId: assignment?.contentPackage.learningPathId ?? null,
          targetMinutes,
          generatedBy: DailyLearningPlanGeneratedBy.PARENT_MANUAL,
          items: { create: items },
        },
        include: this.dailyPlanGenerationService.planInclude(),
      });
    });
    await this.prisma.auditLog.create({
      data: {
        userId: user.sub,
        action: 'daily_plan.parent_set',
        entityType: 'DailyLearningPlan',
        entityId: plan.id,
        metadata: { childProfileId, lessonIds, planDate },
      },
    });
    return this.dailyPlanSupportService.toResponse(plan, false);
  }
}
