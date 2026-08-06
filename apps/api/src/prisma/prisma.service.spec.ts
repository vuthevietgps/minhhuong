import { resolveDatabaseUrl } from './prisma.service';

describe('resolveDatabaseUrl', () => {
  it('requires an explicit database before production bootstrap', () => {
    expect(() => resolveDatabaseUrl({ NODE_ENV: 'production' })).toThrow(
      'DATABASE_URL is required',
    );
  });

  it('preserves the documented local development fallback only outside production', () => {
    expect(resolveDatabaseUrl({ NODE_ENV: 'development' })).toContain(
      'localhost:5432/minhhuong',
    );
    expect(
      resolveDatabaseUrl({
        NODE_ENV: 'production',
        DATABASE_URL: 'postgresql://app:secret@postgres:5432/staging',
      }),
    ).toBe('postgresql://app:secret@postgres:5432/staging');
  });
});
