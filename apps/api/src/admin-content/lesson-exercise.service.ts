import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AuthenticatedUser } from '../auth/auth.types';
import { PrismaService } from '../prisma/prisma.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { CreateQuestionDto } from './dto/create-question.dto';
import { AdminContentSupportService } from './admin-content-support.service';
import { validateQuestion } from './admin-content.helpers';

/** Lesson activities and questions. */
@Injectable()
export class LessonExerciseService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly adminContentSupportService: AdminContentSupportService,
  ) {}

  async createActivity(
    lessonId: string,
    dto: CreateActivityDto,
    user: AuthenticatedUser,
  ) {
    await this.adminContentSupportService.assertEditableLesson(lessonId);
    const activity = await this.prisma.activity.create({
      data: {
        lessonId,
        title: dto.title.trim(),
        description: dto.description,
        type: dto.type ?? 'QUIZ',
        sortOrder: dto.sortOrder ?? 0,
      },
      include: {
        questions: {
          include: { answers: true },
        },
      },
    });
    await this.adminContentSupportService.audit(
      user,
      'content.activity.create',
      'Activity',
      activity.id,
      {
        lessonId,
        title: activity.title,
        type: activity.type,
      },
    );

    return activity;
  }

  async createQuestion(
    activityId: string,
    dto: CreateQuestionDto,
    user: AuthenticatedUser,
  ) {
    await this.assertEditableActivity(activityId);
    validateQuestion(dto);

    const question = await this.prisma.question.create({
      data: {
        activityId,
        type: dto.type,
        prompt: dto.prompt.trim(),
        explanation: dto.explanation,
        points: dto.points ?? 1,
        metadata: dto.metadata as Prisma.InputJsonValue | undefined,
        answers: {
          create: dto.answers.map((answer, index) => ({
            text: answer.text.trim(),
            isCorrect: answer.isCorrect ?? false,
            sortOrder: answer.sortOrder ?? index,
          })),
        },
      },
      include: {
        answers: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });
    await this.adminContentSupportService.audit(
      user,
      'content.question.create',
      'Question',
      question.id,
      {
        activityId,
        type: question.type,
      },
    );

    return question;
  }

  async updateActivity(
    activityId: string,
    dto: { title?: string; sortOrder?: number },
    user: AuthenticatedUser,
  ) {
    await this.assertEditableActivity(activityId);
    const activity = await this.prisma.activity.update({
      where: { id: activityId },
      data: {
        ...(dto.title !== undefined ? { title: dto.title.trim() } : {}),
        ...(dto.sortOrder !== undefined ? { sortOrder: dto.sortOrder } : {}),
      },
      include: { questions: { include: { answers: true } } },
    });
    await this.adminContentSupportService.audit(
      user,
      'content.activity.update',
      'Activity',
      activity.id,
      {
        title: activity.title,
      },
    );
    return activity;
  }

  async updateQuestion(
    questionId: string,
    dto: {
      prompt?: string;
      explanation?: string | null;
      points?: number;
      answers?: Array<{ text: string; isCorrect: boolean; sortOrder?: number }>;
    },
    user: AuthenticatedUser,
  ) {
    const question = await this.prisma.question.findUnique({
      where: { id: questionId },
      include: {
        activity: { include: { lesson: { select: { status: true } } } },
      },
    });
    if (!question) throw new NotFoundException('Question not found');
    if (question.activity.lesson.status !== 'DRAFT')
      throw new BadRequestException(
        'Only questions in draft lessons can be edited',
      );

    const updated = await this.prisma.$transaction(async (tx) => {
      if (dto.answers !== undefined) {
        await tx.answer.deleteMany({ where: { questionId } });
        await tx.answer.createMany({
          data: dto.answers.map((a, i) => ({
            questionId,
            text: a.text.trim(),
            isCorrect: a.isCorrect,
            sortOrder: a.sortOrder ?? i,
          })),
        });
      }
      return tx.question.update({
        where: { id: questionId },
        data: {
          ...(dto.prompt !== undefined ? { prompt: dto.prompt.trim() } : {}),
          ...(dto.explanation !== undefined
            ? { explanation: dto.explanation }
            : {}),
          ...(dto.points !== undefined ? { points: dto.points } : {}),
        },
        include: { answers: { orderBy: { sortOrder: 'asc' } } },
      });
    });
    await this.adminContentSupportService.audit(
      user,
      'content.question.update',
      'Question',
      questionId,
    );
    return updated;
  }

  async deleteActivity(
    lessonId: string,
    activityId: string,
    user: AuthenticatedUser,
  ) {
    await this.adminContentSupportService.assertEditableLesson(lessonId);
    const activity = await this.prisma.activity.findUnique({
      where: { id: activityId },
      select: { id: true, lessonId: true },
    });
    if (!activity || activity.lessonId !== lessonId)
      throw new NotFoundException('Activity not found on this lesson');

    await this.prisma.activity.delete({ where: { id: activityId } });
    await this.adminContentSupportService.audit(
      user,
      'content.activity.delete',
      'Activity',
      activityId,
      {
        lessonId,
      },
    );
    return { deleted: true };
  }

  async deleteQuestion(
    activityId: string,
    questionId: string,
    user: AuthenticatedUser,
  ) {
    await this.assertEditableActivity(activityId);
    const question = await this.prisma.question.findUnique({
      where: { id: questionId },
      select: { id: true, activityId: true },
    });
    if (!question || question.activityId !== activityId)
      throw new NotFoundException('Question not found on this activity');

    await this.prisma.question.delete({ where: { id: questionId } });
    await this.adminContentSupportService.audit(
      user,
      'content.question.delete',
      'Question',
      questionId,
      {
        activityId,
      },
    );
    return { deleted: true };
  }

  private async assertEditableActivity(activityId: string) {
    const activity = await this.prisma.activity.findUnique({
      where: { id: activityId },
      include: {
        lesson: {
          select: {
            status: true,
          },
        },
      },
    });

    if (!activity) {
      throw new NotFoundException('Activity not found');
    }

    if (activity.lesson.status !== 'DRAFT') {
      throw new BadRequestException(
        'Only draft lesson activities can be edited',
      );
    }

    return activity;
  }
}
