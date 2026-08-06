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
import { LearningController } from '../src/learning/learning.controller';
import { LearningService } from '../src/learning/learning.service';
import { LearningPathController } from '../src/learning-path/learning-path.controller';
import { LearningPathService } from '../src/learning-path/learning-path.service';

describe('Learning path runtime gates (e2e)', () => {
  let app: INestApplication<App>;

  const learningPathService = {
    createLearningPath: jest.fn(),
    getActiveAssignmentForChild: jest.fn(),
  };

  const learningService = {
    recordLessonWatch: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [LearningPathController, LearningController],
      providers: [
        { provide: LearningPathService, useValue: learningPathService },
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
          const request = context.switchToHttp().getRequest();
          const rawRoles = request.headers['x-test-roles'];
          const rolesHeader = Array.isArray(rawRoles) ? rawRoles[0] : rawRoles;
          request.user = {
            sub: String(request.headers['x-test-user'] ?? 'parent-1'),
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

  it('routes admin learning path creation through the HTTP layer', async () => {
    learningPathService.createLearningPath.mockResolvedValue({
      id: 'path-1',
      code: 'A1-STARTER',
      title: 'A1 Starter',
      createdById: 'admin-1',
    });

    await request(app.getHttpServer())
      .post('/admin/learning-paths')
      .set('x-test-user', 'admin-1')
      .set('x-test-roles', 'ADMIN')
      .send({ code: 'A1-STARTER', title: 'A1 Starter' })
      .expect(201)
      .expect(({ body }) => {
        expect(body).toMatchObject({
          id: 'path-1',
          createdById: 'admin-1',
        });
      });

    expect(learningPathService.createLearningPath).toHaveBeenCalledWith(
      expect.objectContaining({ code: 'A1-STARTER' }),
      expect.objectContaining({ sub: 'admin-1', roles: ['ADMIN'] }),
    );
  });

  it('does not reveal another child assignment to a parent over HTTP', async () => {
    learningPathService.getActiveAssignmentForChild.mockRejectedValue(
      new NotFoundException('Child profile not found'),
    );

    await request(app.getHttpServer())
      .get('/parent/children/child-other/content-assignment')
      .set('x-test-user', 'parent-1')
      .set('x-test-roles', 'PARENT')
      .expect(404);

    expect(
      learningPathService.getActiveAssignmentForChild,
    ).toHaveBeenCalledWith(
      'child-other',
      expect.objectContaining({
        sub: 'parent-1',
        roles: ['PARENT'],
      }),
    );
  });

  it('returns 403 when a runtime watch request targets a lesson outside the assigned path', async () => {
    learningService.recordLessonWatch.mockRejectedValue(
      new ForbiddenException(
        'Lesson is outside the assigned learning path for this child',
      ),
    );

    await request(app.getHttpServer())
      .post('/learning/lessons/lesson-outside/watch?childProfileId=child-1')
      .set('x-test-user', 'parent-1')
      .set('x-test-roles', 'PARENT')
      .send({ lastPositionSec: 12 })
      .expect(403);

    expect(learningService.recordLessonWatch).toHaveBeenCalledWith(
      'lesson-outside',
      expect.any(Object),
      expect.objectContaining({ sub: 'parent-1', roles: ['PARENT'] }),
      'child-1',
      undefined,
    );
  });
});
