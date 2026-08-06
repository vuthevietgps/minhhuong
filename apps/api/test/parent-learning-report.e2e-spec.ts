import { INestApplication, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AccountRole, AuthenticatedUser } from '../src/auth/auth.types';
import { JwtAuthGuard } from '../src/auth/jwt-auth.guard';
import { ParentController } from '../src/parent/parent.controller';
import { ParentService } from '../src/parent/parent.service';

describe('Parent learning report route (e2e)', () => {
  let app: INestApplication<App>;

  const parentService = {
    getChildLearningReport: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [ParentController],
      providers: [{ provide: ParentService, useValue: parentService }],
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

  it('lets a parent read the 7-day learning evidence report for an owned child', async () => {
    parentService.getChildLearningReport.mockResolvedValue({
      child: { id: 'child-1', displayName: 'Child One' },
      range: '7d',
      summary: { planDays: 1 },
      days: [],
    });

    await request(app.getHttpServer())
      .get('/parent/children/child-1/learning-report?range=7d')
      .set('x-test-user', 'parent-1')
      .set('x-test-roles', 'PARENT')
      .expect(200)
      .expect(({ body }) => {
        expect(body).toMatchObject({
          child: { id: 'child-1' },
          range: '7d',
        });
      });

    expect(parentService.getChildLearningReport).toHaveBeenCalledWith(
      expect.objectContaining({ sub: 'parent-1', roles: ['PARENT'] }),
      'child-1',
      '7d',
    );
  });

  it('does not reveal another parent child report over HTTP', async () => {
    parentService.getChildLearningReport.mockRejectedValue(
      new NotFoundException('Child profile not found'),
    );

    await request(app.getHttpServer())
      .get('/parent/children/child-other/learning-report?range=30d')
      .set('x-test-user', 'parent-1')
      .set('x-test-roles', 'PARENT')
      .expect(404);

    expect(parentService.getChildLearningReport).toHaveBeenCalledWith(
      expect.objectContaining({ sub: 'parent-1', roles: ['PARENT'] }),
      'child-other',
      '30d',
    );
  });

  it('blocks non-parent users from the parent learning report route', async () => {
    await request(app.getHttpServer())
      .get('/parent/children/child-1/learning-report?range=7d')
      .set('x-test-user', 'student-1')
      .set('x-test-roles', 'STUDENT')
      .expect(403);

    expect(parentService.getChildLearningReport).not.toHaveBeenCalled();
  });
});
