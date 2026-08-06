import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AccountRole, AuthenticatedUser } from '../src/auth/auth.types';
import { JwtAuthGuard } from '../src/auth/jwt-auth.guard';
import { DailyPlanController } from '../src/daily-plan/daily-plan.controller';
import { DailyPlanService } from '../src/daily-plan/daily-plan.service';

describe('Daily plan runtime routes (e2e)', () => {
  let app: INestApplication<App>;

  const dailyPlanService = {
    getOrGenerateTodayPlan: jest.fn(),
    startItem: jest.fn(),
    completeItem: jest.fn(),
    skipItem: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [DailyPlanController],
      providers: [{ provide: DailyPlanService, useValue: dailyPlanService }],
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

  it('returns today plan over the learning runtime route', async () => {
    dailyPlanService.getOrGenerateTodayPlan.mockResolvedValue({
      plan: { id: 'plan-1' },
      items: [],
    });

    await request(app.getHttpServer())
      .get('/learning/daily-plans/today?childProfileId=child-1')
      .set('x-test-user', 'parent-1')
      .set('x-test-roles', 'PARENT')
      .expect(200)
      .expect(({ body }) => {
        expect(body).toMatchObject({ plan: { id: 'plan-1' } });
      });

    expect(dailyPlanService.getOrGenerateTodayPlan).toHaveBeenCalledWith(
      expect.objectContaining({ sub: 'parent-1', roles: ['PARENT'] }),
      'child-1',
    );
  });

  it('routes item start actions through the daily plan service', async () => {
    dailyPlanService.startItem.mockResolvedValue({
      plan: { id: 'plan-1' },
      items: [{ id: 'item-1', status: 'STARTED' }],
    });

    await request(app.getHttpServer())
      .post('/learning/daily-plans/plan-1/items/item-1/start')
      .set('x-test-user', 'parent-1')
      .set('x-test-roles', 'PARENT')
      .expect(201)
      .expect(({ body }) => {
        expect(body).toMatchObject({
          plan: { id: 'plan-1' },
          items: [{ id: 'item-1', status: 'STARTED' }],
        });
      });

    expect(dailyPlanService.startItem).toHaveBeenCalledWith(
      'plan-1',
      'item-1',
      expect.objectContaining({ sub: 'parent-1' }),
    );
  });

  it('allows parent-scoped daily plan reads only for parent users', async () => {
    dailyPlanService.getOrGenerateTodayPlan.mockResolvedValue({
      plan: { id: 'plan-1' },
      items: [],
    });

    await request(app.getHttpServer())
      .get('/parent/children/child-1/daily-plans/today')
      .set('x-test-user', 'student-1')
      .set('x-test-roles', 'STUDENT')
      .expect(403);

    expect(dailyPlanService.getOrGenerateTodayPlan).not.toHaveBeenCalled();

    await request(app.getHttpServer())
      .get('/parent/children/child-1/daily-plans/today')
      .set('x-test-user', 'parent-1')
      .set('x-test-roles', 'PARENT')
      .expect(200);

    expect(dailyPlanService.getOrGenerateTodayPlan).toHaveBeenCalledWith(
      expect.objectContaining({ sub: 'parent-1', roles: ['PARENT'] }),
      'child-1',
    );
  });
});
