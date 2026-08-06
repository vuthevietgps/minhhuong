import {
  buildLegacyOrderEntitlementSnapshot,
  buildPackageEntitlementSnapshot,
  parsePackageEntitlementSnapshot,
} from './package-entitlement-snapshot';

describe('package entitlement snapshot builder', () => {
  const capturedAt = new Date('2026-06-14T00:00:00.000Z');

  it('builds deterministic snapshots from package entitlement rows', () => {
    const snapshot = buildPackageEntitlementSnapshot({
      activationPackage: {
        id: 'pkg-1',
        code: 'basic-30',
        name: 'Basic 30',
        version: 3,
        amountVnd: 100000,
        durationDays: 30,
        entitlements: [
          {
            entitlementKey: 'TEACHER_GRADING',
            valueJson: { enabled: true },
            status: 'INACTIVE',
          },
          {
            entitlementKey: 'AI_MESSAGES_PER_MONTH',
            valueJson: { limit: 500 },
            status: 'ACTIVE',
          },
          {
            entitlementKey: 'COURSE_ACCESS',
            valueJson: { mode: 'ALL_ACTIVE', courseIds: [] },
            status: 'ACTIVE',
          },
        ],
      },
      capturedAt,
    });

    expect(snapshot).toEqual({
      packageId: 'pkg-1',
      packageCode: 'basic-30',
      packageName: 'Basic 30',
      packageVersion: 3,
      amountVnd: 100000,
      durationDays: 30,
      entitlements: [
        { key: 'AI_MESSAGES_PER_MONTH', value: { limit: 500 } },
        {
          key: 'COURSE_ACCESS',
          value: { courseIds: [], mode: 'ALL_ACTIVE' },
        },
      ],
      capturedAt: '2026-06-14T00:00:00.000Z',
      snapshotSource: 'PACKAGE_ENTITLEMENT',
    });
  });

  it('uses sold amount and duration overrides instead of package defaults', () => {
    const snapshot = buildPackageEntitlementSnapshot({
      activationPackage: {
        id: 'pkg-1',
        code: 'basic-30',
        name: 'Basic 30',
        version: 1,
        amountVnd: 100000,
        durationDays: 30,
        entitlements: [],
      },
      soldAmountVnd: 120000,
      soldDurationDays: 45,
      capturedAt,
    });

    expect(snapshot).toEqual(
      expect.objectContaining({
        amountVnd: 120000,
        durationDays: 45,
        entitlements: [],
        snapshotSource: 'PACKAGE_ENTITLEMENT',
      }),
    );
  });

  it('builds deterministic fallback snapshots for unresolved custom packages', () => {
    const snapshot = buildPackageEntitlementSnapshot({
      fallbackPackageCode: 'custom-sale',
      fallbackPackageName: 'Custom Sale',
      soldAmountVnd: 250000,
      soldDurationDays: 60,
      capturedAt,
      customPackage: true,
    });

    expect(snapshot).toEqual({
      packageCode: 'custom-sale',
      packageName: 'Custom Sale',
      amountVnd: 250000,
      durationDays: 60,
      entitlements: [],
      capturedAt: '2026-06-14T00:00:00.000Z',
      snapshotSource: 'LEGACY_ORDER_FIELDS',
      customPackage: true,
    });
  });

  it('reconstructs legacy order fallback snapshots without current entitlements', () => {
    const snapshot = buildLegacyOrderEntitlementSnapshot({
      activationPackage: {
        id: 'pkg-1',
        code: 'basic-30',
        name: 'Basic 30',
        version: 4,
        amountVnd: 100000,
        durationDays: 30,
        entitlements: [
          {
            entitlementKey: 'AI_MESSAGES_PER_MONTH',
            valueJson: { limit: 999 },
            status: 'ACTIVE',
          },
        ],
      },
      packageCode: 'basic-30',
      packageName: 'Basic 30',
      amountCents: 10000000,
      durationDays: 30,
      capturedAt,
    });

    expect(snapshot).toEqual(
      expect.objectContaining({
        packageId: 'pkg-1',
        packageVersion: 4,
        amountVnd: 100000,
        durationDays: 30,
        entitlements: [],
        snapshotSource: 'LEGACY_ORDER_FIELDS',
      }),
    );
  });

  it('parses valid snapshots and stays null-safe for legacy rows', () => {
    const snapshot = buildPackageEntitlementSnapshot({
      activationPackage: {
        id: 'pkg-1',
        code: 'basic-30',
        name: 'Basic 30',
        amountVnd: 100000,
        durationDays: 30,
        entitlements: [],
      },
      capturedAt,
    });

    expect(parsePackageEntitlementSnapshot(snapshot)).toEqual(snapshot);
    expect(parsePackageEntitlementSnapshot(null)).toBeNull();
    expect(parsePackageEntitlementSnapshot({ amountVnd: 100000 })).toBeNull();
  });
});
