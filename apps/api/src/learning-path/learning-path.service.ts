import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { AuthenticatedUser } from '../auth/auth.types';
import { ChildAccessService } from '../learning-access/child-access.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  AddLearningPathItemDto,
  AssignContentPackageDto,
  CreateContentPackageDto,
  CreateLearningPathDto,
  UpdateLearningPathDto,
  UpdateLearningPathItemDto,
} from './dto/learning-path.dto';

type AuditMetadata = Prisma.InputJsonValue | undefined;

@Injectable()
export class LearningPathService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly childAccess: ChildAccessService,
  ) {}

  async listLearningPaths() {
    return this.prisma.learningPath.findMany({
      orderBy: [{ updatedAt: 'desc' }],
      include: {
        level: true,
        _count: {
          select: {
            items: true,
            packages: true,
          },
        },
      },
    });
  }

  async createLearningPath(
    dto: CreateLearningPathDto,
    user: AuthenticatedUser,
  ) {
    try {
      const path = await this.prisma.learningPath.create({
        data: {
          code: dto.code,
          title: dto.title,
          description: dto.description,
          levelId: dto.levelId,
          ageBand: dto.ageBand,
          createdById: user.sub,
          updatedById: user.sub,
        },
      });
      await this.audit(user, 'learning_path.create', 'LearningPath', path.id, {
        code: path.code,
      });
      return path;
    } catch (error) {
      this.rethrowKnownConflict(error, 'Learning path code already exists');
      throw error;
    }
  }

  async getLearningPath(pathId: string) {
    const path = await this.prisma.learningPath.findUnique({
      where: { id: pathId },
      include: this.learningPathDetailInclude(),
    });

    if (!path) {
      throw new NotFoundException('Learning path not found');
    }

    return path;
  }

  async updateLearningPath(
    pathId: string,
    dto: UpdateLearningPathDto,
    user: AuthenticatedUser,
  ) {
    const path = await this.requireLearningPath(pathId);
    this.assertPathEditable(path.status);

    const updated = await this.prisma.learningPath.update({
      where: { id: pathId },
      data: {
        title: dto.title,
        description: dto.description,
        levelId: dto.levelId,
        ageBand: dto.ageBand,
        updatedById: user.sub,
      },
      include: this.learningPathDetailInclude(),
    });
    await this.audit(user, 'learning_path.update', 'LearningPath', pathId);
    return updated;
  }

  async addLearningPathItem(
    pathId: string,
    dto: AddLearningPathItemDto,
    user: AuthenticatedUser,
  ) {
    const path = await this.requireLearningPath(pathId);
    this.assertPathEditable(path.status);
    await this.assertLessonExists(dto.lessonId);
    await this.assertNoDuplicatePathItem(pathId, dto.sequence, dto.lessonId);
    await this.assertValidPrerequisite(pathId, dto.prerequisiteItemId);

    const item = await this.prisma.learningPathItem.create({
      data: {
        learningPathId: pathId,
        lessonId: dto.lessonId,
        sequence: dto.sequence,
        required: dto.required ?? true,
        minScore: dto.minScore,
        minWatchPercent: dto.minWatchPercent,
        prerequisiteItemId: dto.prerequisiteItemId,
        reviewPolicyJson: this.toJsonInput(dto.reviewPolicyJson),
      },
      include: {
        lesson: true,
      },
    });
    await this.touchPath(pathId, user.sub);
    await this.audit(
      user,
      'learning_path_item.create',
      'LearningPathItem',
      item.id,
      {
        learningPathId: pathId,
        lessonId: dto.lessonId,
        sequence: dto.sequence,
      },
    );
    return item;
  }

  async updateLearningPathItem(
    pathId: string,
    itemId: string,
    dto: UpdateLearningPathItemDto,
    user: AuthenticatedUser,
  ) {
    const path = await this.requireLearningPath(pathId);
    this.assertPathEditable(path.status);
    const item = await this.requirePathItem(pathId, itemId);
    await this.assertValidPrerequisite(pathId, dto.prerequisiteItemId, itemId);

    if (dto.sequence !== undefined) {
      await this.assertNoDuplicatePathItem(
        pathId,
        dto.sequence,
        item.lessonId,
        itemId,
      );
    }

    const updated = await this.prisma.learningPathItem.update({
      where: { id: itemId },
      data: {
        sequence: dto.sequence,
        required: dto.required,
        minScore: dto.minScore,
        minWatchPercent: dto.minWatchPercent,
        prerequisiteItemId: dto.prerequisiteItemId,
        reviewPolicyJson: this.toJsonInput(dto.reviewPolicyJson),
      },
      include: {
        lesson: true,
      },
    });
    await this.touchPath(pathId, user.sub);
    await this.audit(
      user,
      'learning_path_item.update',
      'LearningPathItem',
      itemId,
      {
        learningPathId: pathId,
      },
    );
    return updated;
  }

  async deleteLearningPathItem(
    pathId: string,
    itemId: string,
    user: AuthenticatedUser,
  ) {
    const path = await this.requireLearningPath(pathId);
    this.assertPathEditable(path.status);
    await this.requirePathItem(pathId, itemId);

    await this.prisma.learningPathItem.delete({
      where: { id: itemId },
    });
    await this.touchPath(pathId, user.sub);
    await this.audit(
      user,
      'learning_path_item.delete',
      'LearningPathItem',
      itemId,
      {
        learningPathId: pathId,
      },
    );
    return { ok: true };
  }

  async submitLearningPathForReview(pathId: string, user: AuthenticatedUser) {
    const path = await this.getLearningPath(pathId);

    if (path.status !== 'DRAFT') {
      throw new BadRequestException(
        'Only draft learning paths can be submitted',
      );
    }
    if (path.items.length === 0) {
      throw new BadRequestException(
        'Learning path must contain at least one lesson',
      );
    }

    const updated = await this.prisma.learningPath.update({
      where: { id: pathId },
      data: {
        status: 'IN_REVIEW',
        updatedById: user.sub,
      },
      include: this.learningPathDetailInclude(),
    });
    await this.audit(
      user,
      'learning_path.submit_review',
      'LearningPath',
      pathId,
    );
    return updated;
  }

  async publishLearningPath(pathId: string, user: AuthenticatedUser) {
    const path = await this.getLearningPath(pathId);

    if (path.status !== 'IN_REVIEW') {
      throw new BadRequestException(
        'Learning path must be in review before publishing',
      );
    }
    this.assertPublishablePath(path);

    const updated = await this.prisma.learningPath.update({
      where: { id: pathId },
      data: {
        status: 'PUBLISHED',
        publishedAt: new Date(),
        updatedById: user.sub,
      },
      include: this.learningPathDetailInclude(),
    });
    await this.audit(user, 'learning_path.publish', 'LearningPath', pathId, {
      itemCount: path.items.length,
    });
    return updated;
  }

  async archiveLearningPath(pathId: string, user: AuthenticatedUser) {
    await this.requireLearningPath(pathId);
    const updated = await this.prisma.learningPath.update({
      where: { id: pathId },
      data: {
        status: 'ARCHIVED',
        updatedById: user.sub,
      },
      include: this.learningPathDetailInclude(),
    });
    await this.audit(user, 'learning_path.archive', 'LearningPath', pathId);
    return updated;
  }

  async listContentPackages() {
    return this.prisma.contentPackage.findMany({
      orderBy: [{ updatedAt: 'desc' }],
      include: {
        learningPath: {
          select: {
            id: true,
            code: true,
            title: true,
            status: true,
          },
        },
        plan: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        _count: {
          select: {
            assignments: true,
          },
        },
      },
    });
  }

  async createContentPackage(
    dto: CreateContentPackageDto,
    user: AuthenticatedUser,
  ) {
    await this.requireLearningPath(dto.learningPathId);

    try {
      const contentPackage = await this.prisma.contentPackage.create({
        data: {
          code: dto.code,
          title: dto.title,
          description: dto.description,
          learningPathId: dto.learningPathId,
          planId: dto.planId,
          createdById: user.sub,
        },
        include: this.contentPackageDetailInclude(),
      });
      await this.audit(
        user,
        'content_package.create',
        'ContentPackage',
        contentPackage.id,
        { code: contentPackage.code, learningPathId: dto.learningPathId },
      );
      return contentPackage;
    } catch (error) {
      this.rethrowKnownConflict(error, 'Content package code already exists');
      throw error;
    }
  }

  async publishContentPackage(packageId: string, user: AuthenticatedUser) {
    const contentPackage = await this.requireContentPackage(packageId);
    if (contentPackage.status !== 'DRAFT') {
      throw new BadRequestException(
        'Only draft content packages can be published',
      );
    }
    if (contentPackage.learningPath.status !== 'PUBLISHED') {
      throw new BadRequestException(
        'Content package can only publish a published learning path',
      );
    }
    if (contentPackage.learningPath.items.length === 0) {
      throw new BadRequestException(
        'Published content package needs path items',
      );
    }

    const updated = await this.prisma.contentPackage.update({
      where: { id: packageId },
      data: {
        status: 'PUBLISHED',
        publishedAt: new Date(),
      },
      include: this.contentPackageDetailInclude(),
    });
    await this.audit(
      user,
      'content_package.publish',
      'ContentPackage',
      packageId,
    );
    return updated;
  }

  async archiveContentPackage(packageId: string, user: AuthenticatedUser) {
    await this.requireContentPackage(packageId);
    const now = new Date();
    const [updated] = await this.prisma.$transaction([
      this.prisma.contentPackage.update({
        where: { id: packageId },
        data: {
          status: 'ARCHIVED',
        },
        include: this.contentPackageDetailInclude(),
      }),
      this.prisma.childContentAssignment.updateMany({
        where: {
          contentPackageId: packageId,
          status: 'ACTIVE',
        },
        data: {
          status: 'REVOKED',
          endedAt: now,
        },
      }),
    ]);
    await this.audit(
      user,
      'content_package.archive',
      'ContentPackage',
      packageId,
    );
    return updated;
  }

  async assignContentPackageToChild(
    childProfileId: string,
    dto: AssignContentPackageDto,
    user: AuthenticatedUser,
  ) {
    await this.childAccess.assertCanAccessChild(user, childProfileId, {
      allowStaff: true,
    });
    const contentPackage = await this.requireContentPackage(
      dto.contentPackageId,
    );
    if (contentPackage.status !== 'PUBLISHED') {
      throw new BadRequestException(
        'Only published content packages can be assigned',
      );
    }
    if (contentPackage.learningPath.status !== 'PUBLISHED') {
      throw new BadRequestException('Assigned package path must be published');
    }

    const now = new Date();
    const assignment = await this.prisma.$transaction(async (tx) => {
      await tx.childContentAssignment.updateMany({
        where: {
          childProfileId,
          status: 'ACTIVE',
        },
        data: {
          status: 'REVOKED',
          endedAt: now,
        },
      });

      return tx.childContentAssignment.create({
        data: {
          childProfileId,
          contentPackageId: dto.contentPackageId,
          assignedById: user.sub,
          status: 'ACTIVE',
          startedAt: now,
        },
        include: this.assignmentDetailInclude(),
      });
    });
    await this.audit(
      user,
      'child_content_assignment.assign',
      'ChildContentAssignment',
      assignment.id,
      { childProfileId, contentPackageId: dto.contentPackageId },
    );
    return assignment;
  }

  async getActiveAssignmentForChild(
    childProfileId: string,
    user: AuthenticatedUser,
    options?: { allowStaff?: boolean },
  ) {
    await this.childAccess.assertCanAccessChild(user, childProfileId, {
      allowStaff: options?.allowStaff ?? false,
    });

    return this.prisma.childContentAssignment.findFirst({
      where: {
        childProfileId,
        status: 'ACTIVE',
        contentPackage: {
          status: 'PUBLISHED',
          learningPath: {
            status: 'PUBLISHED',
          },
        },
      },
      orderBy: { startedAt: 'desc' },
      include: this.assignmentDetailInclude(),
    });
  }

  async assertLessonAvailableForChild(
    childProfileId: string,
    lessonId: string,
  ) {
    const assignedPath = await this.getActiveAssignedLessonIds(childProfileId);

    if (!assignedPath) {
      return {
        mode: 'UNASSIGNED_FALLBACK' as const,
        reason: 'NO_ACTIVE_CONTENT_ASSIGNMENT',
      };
    }

    if (assignedPath.lessonIds.includes(lessonId)) {
      return assignedPath;
    }

    throw new ForbiddenException(
      'Lesson is outside the assigned learning path for this child',
    );
  }

  async getActiveAssignedLessonIds(
    childProfileId: string,
    options?: { requireReadyVideo?: boolean },
  ) {
    const assignment = await this.prisma.childContentAssignment.findFirst({
      where: {
        childProfileId,
        status: 'ACTIVE',
        contentPackage: {
          status: 'PUBLISHED',
          learningPath: {
            status: 'PUBLISHED',
          },
        },
      },
      orderBy: { startedAt: 'desc' },
      include: {
        contentPackage: {
          include: {
            learningPath: {
              include: {
                items: {
                  orderBy: { sequence: 'asc' },
                  include: {
                    lesson: {
                      select: {
                        id: true,
                        status: true,
                        videos: {
                          where: { processingStatus: 'READY' },
                          select: { id: true },
                          take: 1,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!assignment) {
      return null;
    }

    return {
      mode: 'ASSIGNED_PATH' as const,
      assignmentId: assignment.id,
      packageId: assignment.contentPackageId,
      packageCode: assignment.contentPackage.code,
      contentPackageId: assignment.contentPackageId,
      contentPackageCode: assignment.contentPackage.code,
      contentPackageTitle: assignment.contentPackage.title,
      learningPathId: assignment.contentPackage.learningPathId,
      learningPathCode: assignment.contentPackage.learningPath.code,
      learningPathTitle: assignment.contentPackage.learningPath.title,
      lessonIds: assignment.contentPackage.learningPath.items
        .filter(
          (item) =>
            item.lesson.status === 'PUBLISHED' &&
            (!options?.requireReadyVideo || item.lesson.videos.length > 0),
        )
        .map((item) => item.lessonId),
    };
  }

  private learningPathDetailInclude() {
    return {
      level: true,
      items: {
        orderBy: { sequence: 'asc' },
        include: {
          lesson: {
            select: {
              id: true,
              slug: true,
              title: true,
              status: true,
              type: true,
              durationSec: true,
              videos: {
                where: { processingStatus: 'READY' },
                select: {
                  id: true,
                },
              },
            },
          },
        },
      },
      packages: {
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          code: true,
          title: true,
          status: true,
          publishedAt: true,
        },
      },
    } satisfies Prisma.LearningPathInclude;
  }

  private contentPackageDetailInclude() {
    return {
      learningPath: {
        include: {
          items: {
            orderBy: { sequence: 'asc' },
            include: {
              lesson: {
                select: {
                  id: true,
                  slug: true,
                  title: true,
                  status: true,
                  videos: {
                    where: { processingStatus: 'READY' },
                    select: { id: true },
                  },
                },
              },
            },
          },
        },
      },
      plan: {
        select: {
          id: true,
          code: true,
          name: true,
        },
      },
    } satisfies Prisma.ContentPackageInclude;
  }

  private assignmentDetailInclude() {
    return {
      contentPackage: {
        include: this.contentPackageDetailInclude(),
      },
    } satisfies Prisma.ChildContentAssignmentInclude;
  }

  private assertPublishablePath(
    path: Awaited<ReturnType<LearningPathService['getLearningPath']>>,
  ) {
    if (path.items.length === 0) {
      throw new BadRequestException(
        'Learning path must contain at least one lesson',
      );
    }

    const unpublishedItem = path.items.find(
      (item) => item.lesson.status !== 'PUBLISHED',
    );
    if (unpublishedItem) {
      throw new BadRequestException(
        `Lesson ${unpublishedItem.lessonId} is not published`,
      );
    }

    const videoItemWithoutReadyVideo = path.items.find(
      (item) =>
        ['VIDEO', 'MIXED'].includes(item.lesson.type) &&
        item.lesson.videos.length === 0,
    );
    if (videoItemWithoutReadyVideo) {
      throw new BadRequestException(
        `Lesson ${videoItemWithoutReadyVideo.lessonId} has no ready video`,
      );
    }
  }

  private async requireLearningPath(pathId: string) {
    const path = await this.prisma.learningPath.findUnique({
      where: { id: pathId },
    });
    if (!path) {
      throw new NotFoundException('Learning path not found');
    }
    return path;
  }

  private async requirePathItem(pathId: string, itemId: string) {
    const item = await this.prisma.learningPathItem.findFirst({
      where: {
        id: itemId,
        learningPathId: pathId,
      },
    });
    if (!item) {
      throw new NotFoundException('Learning path item not found');
    }
    return item;
  }

  private async requireContentPackage(packageId: string) {
    const contentPackage = await this.prisma.contentPackage.findUnique({
      where: { id: packageId },
      include: this.contentPackageDetailInclude(),
    });
    if (!contentPackage) {
      throw new NotFoundException('Content package not found');
    }
    return contentPackage;
  }

  private async assertLessonExists(lessonId: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      select: { id: true },
    });
    if (!lesson) {
      throw new BadRequestException('Lesson does not exist');
    }
  }

  private async assertNoDuplicatePathItem(
    pathId: string,
    sequence: number,
    lessonId: string,
    exceptItemId?: string,
  ) {
    const existing = await this.prisma.learningPathItem.findFirst({
      where: {
        learningPathId: pathId,
        ...(exceptItemId ? { id: { not: exceptItemId } } : {}),
        OR: [{ sequence }, { lessonId }],
      },
      select: {
        id: true,
        sequence: true,
        lessonId: true,
      },
    });

    if (!existing) {
      return;
    }

    if (existing.sequence === sequence) {
      throw new BadRequestException(
        'Learning path item sequence already exists',
      );
    }
    throw new BadRequestException('Lesson is already in this learning path');
  }

  private async assertValidPrerequisite(
    pathId: string,
    prerequisiteItemId?: string,
    currentItemId?: string,
  ) {
    if (!prerequisiteItemId) {
      return;
    }
    if (prerequisiteItemId === currentItemId) {
      throw new BadRequestException('Path item cannot depend on itself');
    }

    const prerequisite = await this.prisma.learningPathItem.findFirst({
      where: {
        id: prerequisiteItemId,
        learningPathId: pathId,
      },
      select: { id: true },
    });
    if (!prerequisite) {
      throw new BadRequestException(
        'Prerequisite item must belong to the same learning path',
      );
    }
  }

  private assertPathEditable(status: string) {
    if (status === 'PUBLISHED' || status === 'ARCHIVED') {
      throw new BadRequestException(
        'Published or archived learning paths are locked',
      );
    }
  }

  private async touchPath(pathId: string, userId: string) {
    await this.prisma.learningPath.update({
      where: { id: pathId },
      data: { updatedById: userId },
    });
  }

  private async audit(
    user: AuthenticatedUser,
    action: string,
    entityType?: string,
    entityId?: string,
    metadata?: AuditMetadata,
  ) {
    await this.prisma.auditLog.create({
      data: {
        userId: user.sub,
        action,
        entityType,
        entityId,
        metadata,
      },
    });
  }

  private rethrowKnownConflict(error: unknown, message: string): never | void {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new ConflictException(message);
    }
  }

  private toJsonInput(value?: Record<string, unknown>) {
    return value as Prisma.InputJsonValue | undefined;
  }
}
