import { Injectable, NotFoundException } from '@nestjs/common';
import type { AuthenticatedUser } from '../auth/auth.types';
import { EntitlementService } from '../entitlement/entitlement.service';
import { LearningPathService } from '../learning-path/learning-path.service';
import { PrismaService } from '../prisma/prisma.service';
import { SubmitActivityAttemptDto } from './dto/submit-activity-attempt.dto';
import { LearningSupportService } from './learning-support.service';
import {
  gradeQuestion,
  toPublicAnswers,
  validateResponsesBelongToActivity,
} from './lesson-practice.helpers';

/** Lesson practice and graded attempts. */
@Injectable()
export class LessonPracticeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly entitlement: EntitlementService,
    private readonly learningPath: LearningPathService,
    private readonly learningSupportService: LearningSupportService,
  ) {}

  async getLessonPractice(
    lessonId: string,
    user: AuthenticatedUser,
    childProfileId: string,
  ) {
    await this.learningSupportService.assertLearningAccess(
      user,
      childProfileId,
      'practice',
    );
    await this.learningSupportService.assertDailyDeviceTimeAvailable(
      user,
      childProfileId,
    );
    const contentSource = await this.learningPath.assertLessonAvailableForChild(
      childProfileId,
      lessonId,
    );
    await this.entitlement.assertTrialLessonAccess(childProfileId, lessonId);

    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      select: {
        id: true,
        title: true,
        status: true,
        activities: {
          orderBy: { sortOrder: 'asc' },
          select: {
            id: true,
            title: true,
            description: true,
            type: true,
            questions: {
              orderBy: { sortOrder: 'asc' },
              select: {
                id: true,
                type: true,
                prompt: true,
                points: true,
                metadata: true,
                answers: {
                  orderBy: { sortOrder: 'asc' },
                  select: {
                    id: true,
                    text: true,
                    sortOrder: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!lesson || lesson.status !== 'PUBLISHED') {
      throw new NotFoundException('Published lesson not found');
    }

    return {
      ...lesson,
      contentSource,
      activities: lesson.activities.map((activity) => ({
        ...activity,
        questions: activity.questions.map((question) => ({
          ...question,
          answers: toPublicAnswers(question),
        })),
      })),
    };
  }

  async submitAttempt(
    activityId: string,
    dto: SubmitActivityAttemptDto,
    user: AuthenticatedUser,
    childProfileId: string,
  ) {
    await this.learningSupportService.assertLearningAccess(
      user,
      childProfileId,
      'practice',
    );
    await this.learningSupportService.assertDailyDeviceTimeAvailable(
      user,
      childProfileId,
    );

    const activity = await this.prisma.activity.findUnique({
      where: { id: activityId },
      include: {
        lesson: true,
        questions: {
          orderBy: { sortOrder: 'asc' },
          include: {
            answers: { orderBy: { sortOrder: 'asc' } },
          },
        },
      },
    });

    if (!activity || activity.lesson.status !== 'PUBLISHED') {
      throw new NotFoundException('Published activity not found');
    }

    const contentSource = await this.learningPath.assertLessonAvailableForChild(
      childProfileId,
      activity.lessonId,
    );
    await this.entitlement.assertTrialLessonAccess(
      childProfileId,
      activity.lessonId,
    );

    validateResponsesBelongToActivity(
      dto.responses,
      activity.questions.map((question) => question.id),
    );

    const responseByQuestionId = new Map(
      dto.responses.map((response) => [response.questionId, response]),
    );
    const gradedResponses = activity.questions.map((question) => {
      const response = responseByQuestionId.get(question.id);
      return gradeQuestion(question, response);
    });
    const maxScore = activity.questions.reduce(
      (sum, question) => sum + question.points,
      0,
    );
    const score = gradedResponses.reduce(
      (sum, response) => sum + response.score,
      0,
    );

    await this.entitlement.consumeTrialInitialAssessment(childProfileId);

    const attempt = await this.prisma.activityAttempt.create({
      data: {
        childProfileId,
        activityId,
        status: 'GRADED',
        score,
        maxScore,
        submittedAt: new Date(),
        responses: {
          create: gradedResponses.map((response) => ({
            questionId: response.questionId,
            selectedAnswerIds: response.selectedAnswerIds,
            textAnswer: response.textAnswer,
            orderedAnswer: response.orderedAnswer,
            isCorrect: response.isCorrect,
            score: response.score,
            feedback: response.feedback,
          })),
        },
      },
      include: {
        responses: {
          include: {
            question: {
              select: {
                prompt: true,
                explanation: true,
              },
            },
          },
        },
      },
    });

    await this.recalculateLessonProgress(childProfileId, activity.lessonId);

    return {
      ...attempt,
      contentSource,
    };
  }

  private async recalculateLessonProgress(
    childProfileId: string,
    lessonId: string,
  ) {
    const activities = await this.prisma.activity.findMany({
      where: { lessonId },
      select: {
        id: true,
        questions: {
          select: {
            points: true,
          },
        },
        attempts: {
          where: {
            childProfileId,
            status: 'GRADED',
          },
          select: {
            score: true,
          },
        },
      },
    });

    const scoredActivities = activities
      .map((activity) => {
        const maxScore = activity.questions.reduce(
          (sum, question) => sum + question.points,
          0,
        );
        const bestScore = activity.attempts.reduce(
          (best, attempt) => Math.max(best, attempt.score),
          0,
        );

        return { maxScore, bestScore: Math.min(bestScore, maxScore) };
      })
      .filter((activity) => activity.maxScore > 0);

    const totalMaxScore = scoredActivities.reduce(
      (sum, activity) => sum + activity.maxScore,
      0,
    );
    const totalBestScore = scoredActivities.reduce(
      (sum, activity) => sum + activity.bestScore,
      0,
    );
    const overallScore =
      totalMaxScore > 0
        ? Math.round((totalBestScore / totalMaxScore) * 100)
        : 0;
    const isCompleted = scoredActivities.length > 0 && overallScore >= 80;
    const now = new Date();

    await this.prisma.lessonProgress.upsert({
      where: {
        childProfileId_lessonId: {
          childProfileId,
          lessonId,
        },
      },
      update: {
        status: isCompleted
          ? 'COMPLETED'
          : totalBestScore > 0
            ? 'IN_PROGRESS'
            : 'NOT_STARTED',
        score: overallScore,
        completedAt: isCompleted ? now : null,
      },
      create: {
        childProfileId,
        lessonId,
        status: isCompleted
          ? 'COMPLETED'
          : totalBestScore > 0
            ? 'IN_PROGRESS'
            : 'NOT_STARTED',
        score: overallScore,
        completedAt: isCompleted ? now : null,
      },
    });
  }
}
