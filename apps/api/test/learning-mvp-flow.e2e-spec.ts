import {
  ForbiddenException,
  INestApplication,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AccountRole, AuthenticatedUser } from '../src/auth/auth.types';
import { JwtAuthGuard } from '../src/auth/jwt-auth.guard';
import { DailyPlanController } from '../src/daily-plan/daily-plan.controller';
import { DailyPlanService } from '../src/daily-plan/daily-plan.service';
import { LearningController } from '../src/learning/learning.controller';
import { LearningService } from '../src/learning/learning.service';
import { LearningPathController } from '../src/learning-path/learning-path.controller';
import { LearningPathService } from '../src/learning-path/learning-path.service';
import { ParentController } from '../src/parent/parent.controller';
import { ParentService } from '../src/parent/parent.service';

describe('MVP learning flow smoke (e2e)', () => {
  let app: INestApplication<App>;

  const parentService = {
    listChildren: jest.fn(),
    createChild: jest.fn(),
    deleteChild: jest.fn(),
    updateScreenTime: jest.fn(),
    grantExtraDeviceTime: jest.fn(),
    getChildReport: jest.fn(),
    getChildLearningReport: jest.fn(),
  };

  const learningPathService = {
    createLearningPath: jest.fn(),
    listLearningPaths: jest.fn(),
    getLearningPath: jest.fn(),
    updateLearningPath: jest.fn(),
    addLearningPathItem: jest.fn(),
    updateLearningPathItem: jest.fn(),
    deleteLearningPathItem: jest.fn(),
    submitLearningPathForReview: jest.fn(),
    publishLearningPath: jest.fn(),
    archiveLearningPath: jest.fn(),
    listContentPackages: jest.fn(),
    createContentPackage: jest.fn(),
    publishContentPackage: jest.fn(),
    archiveContentPackage: jest.fn(),
    getActiveAssignmentForChild: jest.fn(),
    assignContentPackageToChild: jest.fn(),
  };

  const dailyPlanService = {
    getOrGenerateTodayPlan: jest.fn(),
    startItem: jest.fn(),
    completeItem: jest.fn(),
    skipItem: jest.fn(),
  };

  const learningService = {
    getLearningHome: jest.fn(),
    getVideoFeed: jest.fn(),
    getTodayUsage: jest.fn(),
    recordLessonWatch: jest.fn(),
    setLessonFavorite: jest.fn(),
    getLessonPractice: jest.fn(),
    submitAttempt: jest.fn(),
  };

  const demoChild = {
    id: 'child-demo',
    displayName: 'Demo Con',
  };

  const demoAssignment = {
    id: 'assignment-demo',
    childProfileId: demoChild.id,
    status: 'ACTIVE',
    startedAt: '2026-06-14T00:00:00.000Z',
    contentPackage: {
      id: 'package-demo',
      code: 'MH-DEMO-A1-GREETINGS-PACKAGE',
      title: 'Minh Huong Demo A1 Package',
      status: 'PUBLISHED',
      learningPath: {
        id: 'path-demo',
        code: 'MH-DEMO-A1-GREETINGS',
        title: 'Minh Huong Demo A1 Greetings',
        status: 'PUBLISHED',
      },
    },
  };

  const initialDailyPlan = {
    plan: {
      id: 'plan-demo',
      childProfileId: demoChild.id,
      status: 'ACTIVE',
      contentSourceMode: 'ASSIGNED_PACKAGE',
      contentPackageId: 'package-demo',
      learningPathId: 'path-demo',
    },
    items: [
      {
        id: 'item-video',
        sequence: 1,
        itemType: 'VIDEO',
        status: 'READY',
        lessonId: 'lesson-demo',
        minWatchPercent: 80,
        evidence: {
          type: 'WATCH_REQUIRED',
          passed: false,
          watchPercent: 0,
        },
      },
      {
        id: 'item-practice',
        sequence: 2,
        itemType: 'PRACTICE',
        status: 'LOCKED',
        lessonId: 'lesson-demo',
        activityId: 'activity-demo',
        minScore: 80,
        evidence: {
          type: 'PRACTICE_ATTEMPT_REQUIRED',
          passed: false,
          bestScorePercent: 0,
        },
      },
    ],
  };

  const afterVideoPlan = {
    ...initialDailyPlan,
    items: [
      {
        ...initialDailyPlan.items[0],
        status: 'COMPLETED',
        evidence: {
          type: 'WATCH_REQUIRED',
          passed: true,
          watchPercent: 100,
        },
      },
      {
        ...initialDailyPlan.items[1],
        status: 'READY',
      },
    ],
  };

  const refreshedHome = {
    child: demoChild,
    activeAssignment: demoAssignment,
    persistentDailyPlan: {
      ...afterVideoPlan,
      items: [
        afterVideoPlan.items[0],
        {
          ...afterVideoPlan.items[1],
          status: 'COMPLETED',
          evidence: {
            type: 'PRACTICE_ATTEMPT_REQUIRED',
            passed: true,
            bestScorePercent: 100,
            attempts: 1,
          },
        },
      ],
    },
  };

  const completedDailyPlan = {
    ...initialDailyPlan,
    plan: {
      ...initialDailyPlan.plan,
      status: 'COMPLETED',
    },
    items: refreshedHome.persistentDailyPlan.items,
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [
        ParentController,
        LearningPathController,
        DailyPlanController,
        LearningController,
      ],
      providers: [
        { provide: ParentService, useValue: parentService },
        { provide: LearningPathService, useValue: learningPathService },
        { provide: DailyPlanService, useValue: dailyPlanService },
        { provide: LearningService, useValue: learningService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context: {
          switchToHttp: () => {
            getRequest: () => {
              headers: Record<string, string | string[] | undefined>;
              user?: AuthenticatedUser;
            };
          };
        }) => {
          const httpRequest = context.switchToHttp().getRequest();
          const rawRoles = httpRequest.headers['x-test-roles'];
          const rolesHeader = Array.isArray(rawRoles) ? rawRoles[0] : rawRoles;
          httpRequest.user = {
            sub: String(httpRequest.headers['x-test-user'] ?? 'parent-1'),
            email: 'test@example.local',
            roles: (rolesHeader?.split(',') ?? ['PARENT']) as AccountRole[],
          };
          return true;
        },
      })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  it('supports the parent demo learning flow over HTTP routes', async () => {
    parentService.listChildren.mockResolvedValue([demoChild]);
    learningPathService.getActiveAssignmentForChild.mockResolvedValue(
      demoAssignment,
    );
    dailyPlanService.getOrGenerateTodayPlan.mockResolvedValue(initialDailyPlan);
    learningService.recordLessonWatch.mockResolvedValue({
      progress: {
        childProfileId: demoChild.id,
        lessonId: 'lesson-demo',
        status: 'COMPLETED',
      },
      watchEvidence: {
        minWatchPercent: 80,
        watchPercent: 100,
        passed: true,
      },
    });
    dailyPlanService.completeItem
      .mockResolvedValueOnce(afterVideoPlan)
      .mockResolvedValueOnce(completedDailyPlan);
    learningService.getLessonPractice.mockResolvedValue({
      lessonId: 'lesson-demo',
      activity: {
        id: 'activity-demo',
        title: 'Greeting check',
      },
      questions: [
        {
          id: 'question-demo',
          prompt: 'Which answer is the best polite greeting?',
          answers: [
            {
              id: 'answer-demo',
              text: 'Good morning, nice to meet you.',
            },
          ],
        },
      ],
    });
    learningService.submitAttempt.mockResolvedValue({
      id: 'attempt-demo',
      activityId: 'activity-demo',
      score: 1,
      maxScore: 1,
      scorePercent: 100,
      passed: true,
    });
    learningService.getLearningHome.mockResolvedValue(refreshedHome);
    parentService.getChildLearningReport.mockResolvedValue({
      child: demoChild,
      range: '7d',
      summary: {
        planDays: 1,
        completedItems: 2,
        watchEvidencePassed: 1,
        practiceEvidencePassed: 1,
      },
      days: [
        {
          planId: 'plan-demo',
          items: refreshedHome.persistentDailyPlan.items,
        },
      ],
    });

    await request(app.getHttpServer())
      .get('/parent/children')
      .set('x-test-user', 'parent-1')
      .set('x-test-roles', 'PARENT')
      .expect(200)
      .expect(({ body }) => {
        expect(body).toEqual([demoChild]);
      });

    await request(app.getHttpServer())
      .get(`/parent/children/${demoChild.id}/content-assignment`)
      .set('x-test-user', 'parent-1')
      .set('x-test-roles', 'PARENT')
      .expect(200)
      .expect(({ body }) => {
        expect(body).toMatchObject({
          id: 'assignment-demo',
          contentPackage: {
            code: 'MH-DEMO-A1-GREETINGS-PACKAGE',
            learningPath: { code: 'MH-DEMO-A1-GREETINGS' },
          },
        });
      });

    await request(app.getHttpServer())
      .get(`/learning/daily-plans/today?childProfileId=${demoChild.id}`)
      .set('x-test-user', 'parent-1')
      .set('x-test-roles', 'PARENT')
      .expect(200)
      .expect(({ body }) => {
        expect(body).toMatchObject({
          plan: { id: 'plan-demo', contentSourceMode: 'ASSIGNED_PACKAGE' },
          items: [
            { id: 'item-video', itemType: 'VIDEO', status: 'READY' },
            { id: 'item-practice', itemType: 'PRACTICE', status: 'LOCKED' },
          ],
        });
      });

    await request(app.getHttpServer())
      .post(
        `/learning/lessons/lesson-demo/watch?childProfileId=${demoChild.id}`,
      )
      .set('x-test-user', 'parent-1')
      .set('x-test-roles', 'PARENT')
      .send({
        event: 'COMPLETED',
        lastPositionSec: 600,
        watchedDurationSec: 600,
      })
      .expect(201)
      .expect(({ body }) => {
        expect(body.watchEvidence).toMatchObject({
          minWatchPercent: 80,
          passed: true,
        });
      });

    await request(app.getHttpServer())
      .post('/learning/daily-plans/plan-demo/items/item-video/complete')
      .set('x-test-user', 'parent-1')
      .set('x-test-roles', 'PARENT')
      .expect(201)
      .expect(({ body }) => {
        expect(body.items).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ id: 'item-practice', status: 'READY' }),
          ]),
        );
      });

    await request(app.getHttpServer())
      .get(
        `/learning/lessons/lesson-demo/practice?childProfileId=${demoChild.id}`,
      )
      .set('x-test-user', 'parent-1')
      .set('x-test-roles', 'PARENT')
      .expect(200)
      .expect(({ body }) => {
        expect(body).toMatchObject({
          activity: { id: 'activity-demo' },
          questions: [{ id: 'question-demo' }],
        });
      });

    await request(app.getHttpServer())
      .post(
        `/learning/activities/activity-demo/attempts?childProfileId=${demoChild.id}`,
      )
      .set('x-test-user', 'parent-1')
      .set('x-test-roles', 'PARENT')
      .send({
        responses: [
          {
            questionId: 'question-demo',
            selectedAnswerIds: ['answer-demo'],
          },
        ],
      })
      .expect(201)
      .expect(({ body }) => {
        expect(body).toMatchObject({
          activityId: 'activity-demo',
          scorePercent: 100,
          passed: true,
        });
      });

    await request(app.getHttpServer())
      .get(`/learning/home?childProfileId=${demoChild.id}`)
      .set('x-test-user', 'parent-1')
      .set('x-test-roles', 'PARENT')
      .expect(200)
      .expect(({ body }) => {
        expect(body.persistentDailyPlan.items).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              id: 'item-practice',
              status: 'COMPLETED',
              evidence: expect.objectContaining({
                passed: true,
                bestScorePercent: 100,
              }),
            }),
          ]),
        );
      });

    await request(app.getHttpServer())
      .post('/learning/daily-plans/plan-demo/items/item-practice/complete')
      .set('x-test-user', 'parent-1')
      .set('x-test-roles', 'PARENT')
      .expect(201)
      .expect(({ body }) => {
        expect(body).toMatchObject({
          plan: { id: 'plan-demo', status: 'COMPLETED' },
        });
      });

    await request(app.getHttpServer())
      .get(`/parent/children/${demoChild.id}/learning-report?range=7d`)
      .set('x-test-user', 'parent-1')
      .set('x-test-roles', 'PARENT')
      .expect(200)
      .expect(({ body }) => {
        expect(body.summary).toMatchObject({
          completedItems: 2,
          watchEvidencePassed: 1,
          practiceEvidencePassed: 1,
        });
      });

    expect(parentService.listChildren).toHaveBeenCalledWith(
      expect.objectContaining({ sub: 'parent-1', roles: ['PARENT'] }),
    );
    expect(
      learningPathService.getActiveAssignmentForChild,
    ).toHaveBeenCalledWith(
      demoChild.id,
      expect.objectContaining({ sub: 'parent-1', roles: ['PARENT'] }),
    );
    expect(dailyPlanService.getOrGenerateTodayPlan).toHaveBeenCalledWith(
      expect.objectContaining({ sub: 'parent-1', roles: ['PARENT'] }),
      demoChild.id,
    );
    expect(learningService.recordLessonWatch).toHaveBeenCalledWith(
      'lesson-demo',
      expect.objectContaining({ event: 'COMPLETED' }),
      expect.objectContaining({ sub: 'parent-1', roles: ['PARENT'] }),
      demoChild.id,
      undefined,
    );
    expect(learningService.submitAttempt).toHaveBeenCalledWith(
      'activity-demo',
      expect.objectContaining({
        responses: [
          expect.objectContaining({
            questionId: 'question-demo',
            selectedAnswerIds: ['answer-demo'],
          }),
        ],
      }),
      expect.objectContaining({ sub: 'parent-1', roles: ['PARENT'] }),
      demoChild.id,
    );
    expect(learningService.getLearningHome).toHaveBeenCalledWith(
      expect.objectContaining({ sub: 'parent-1', roles: ['PARENT'] }),
      demoChild.id,
      undefined,
    );
    expect(parentService.getChildLearningReport).toHaveBeenCalledWith(
      expect.objectContaining({ sub: 'parent-1', roles: ['PARENT'] }),
      demoChild.id,
      '7d',
    );
  });

  it('keeps assignment and parent report authorization gates closed', async () => {
    learningService.recordLessonWatch.mockRejectedValue(
      new ForbiddenException(
        'Lesson is outside the assigned learning path for this child',
      ),
    );
    parentService.getChildLearningReport.mockRejectedValue(
      new NotFoundException('Child profile not found'),
    );

    await request(app.getHttpServer())
      .post('/learning/lessons/lesson-outside/watch?childProfileId=child-demo')
      .set('x-test-user', 'parent-1')
      .set('x-test-roles', 'PARENT')
      .send({
        event: 'COMPLETED',
        lastPositionSec: 120,
        watchedDurationSec: 120,
      })
      .expect(403);

    await request(app.getHttpServer())
      .get('/parent/children/child-other/learning-report?range=7d')
      .set('x-test-user', 'parent-1')
      .set('x-test-roles', 'PARENT')
      .expect(404);

    await request(app.getHttpServer())
      .get('/parent/children/child-demo/learning-report?range=7d')
      .set('x-test-user', 'student-1')
      .set('x-test-roles', 'STUDENT')
      .expect(403);

    expect(learningService.recordLessonWatch).toHaveBeenCalledWith(
      'lesson-outside',
      expect.objectContaining({ event: 'COMPLETED' }),
      expect.objectContaining({ sub: 'parent-1', roles: ['PARENT'] }),
      'child-demo',
      undefined,
    );
    expect(parentService.getChildLearningReport).toHaveBeenCalledTimes(1);
    expect(parentService.getChildLearningReport).toHaveBeenCalledWith(
      expect.objectContaining({ sub: 'parent-1', roles: ['PARENT'] }),
      'child-other',
      '7d',
    );
  });
});
