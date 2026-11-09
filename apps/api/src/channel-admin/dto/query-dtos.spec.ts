import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ListLessonsQueryDto } from '../../admin-content/dto/list-lessons-query.dto';
import { ListAuditLogsQueryDto } from './audit-log-query.dto';

// Mirrors the global ValidationPipe options in main.ts.
async function validateQuery<T extends object>(
  dto: new () => T,
  query: Record<string, string>,
) {
  const instance = plainToInstance(dto, query);
  const errors = await validate(instance, {
    whitelist: true,
    forbidNonWhitelisted: true,
  });
  return { instance, errors };
}

describe('ListAuditLogsQueryDto', () => {
  it('accepts the filters sent by the admin audit page', async () => {
    const { instance, errors } = await validateQuery(ListAuditLogsQueryDto, {
      limit: '50',
      action: 'USER_SUSPENDED',
      userEmail: 'admin@demo.local',
      entityType: 'User',
      cursor: 'log-1',
    });
    expect(errors).toHaveLength(0);
    expect(instance.limit).toBe(50);
  });

  it.each(['0', '201', 'abc'])('rejects limit=%s', async (limit) => {
    const { errors } = await validateQuery(ListAuditLogsQueryDto, { limit });
    expect(errors.map((error) => error.property)).toEqual(['limit']);
  });

  it('rejects unknown query parameters', async () => {
    const { errors } = await validateQuery(ListAuditLogsQueryDto, {
      role: 'ADMIN',
    });
    expect(errors.map((error) => error.property)).toEqual(['role']);
  });
});

describe('ListLessonsQueryDto', () => {
  it('accepts cursor and numeric take', async () => {
    const { instance, errors } = await validateQuery(ListLessonsQueryDto, {
      cursor: 'lesson-1',
      take: '500',
    });
    expect(errors).toHaveLength(0);
    expect(instance.take).toBe(500);
  });

  it.each(['0', '-5', '1.5', 'many'])('rejects take=%s', async (take) => {
    const { errors } = await validateQuery(ListLessonsQueryDto, { take });
    expect(errors.map((error) => error.property)).toEqual(['take']);
  });
});
