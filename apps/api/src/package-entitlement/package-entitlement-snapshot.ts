import { Prisma } from '@prisma/client';

export const PACKAGE_ENTITLEMENT_KEYS = [
  'COURSE_ACCESS',
  'AI_MESSAGES_PER_MONTH',
  'CHILD_COUNT',
  'DAILY_STUDY_MINUTES',
  'TEACHER_GRADING',
  'OFFLINE_ACCESS',
] as const;

export type PackageEntitlementKey = (typeof PACKAGE_ENTITLEMENT_KEYS)[number];

export type PackageEntitlementDefinition = {
  entitlementKey: string;
  valueJson: Prisma.JsonValue;
  status?: string | null;
};

export type SnapshotActivationPackage = {
  id?: string | null;
  code?: string | null;
  name?: string | null;
  version?: number | null;
  amountVnd?: number | null;
  durationDays?: number | null;
  entitlements?: PackageEntitlementDefinition[] | null;
};

export type PackageEntitlementSnapshot = {
  packageId?: string;
  packageCode: string | null;
  packageName: string | null;
  packageVersion?: number;
  amountVnd: number;
  durationDays: number;
  entitlements: Array<{
    key: string;
    value: Prisma.JsonValue;
  }>;
  capturedAt: string;
  snapshotSource: 'PACKAGE_ENTITLEMENT' | 'LEGACY_ORDER_FIELDS';
  customPackage?: true;
};

export type BuildPackageEntitlementSnapshotInput = {
  activationPackage?: SnapshotActivationPackage | null;
  fallbackPackageCode?: string | null;
  fallbackPackageName?: string | null;
  soldAmountVnd?: number | null;
  soldDurationDays?: number | null;
  capturedAt?: Date;
  forceLegacySource?: boolean;
  customPackage?: boolean;
};

export function buildPackageEntitlementSnapshot(
  input: BuildPackageEntitlementSnapshotInput,
): PackageEntitlementSnapshot {
  const pkg = input.activationPackage ?? null;
  const usesPackageEntitlements = Boolean(pkg && !input.forceLegacySource);
  const packageCode = pkg?.code ?? input.fallbackPackageCode ?? null;
  const packageName = pkg?.name ?? input.fallbackPackageName ?? null;
  const amountVnd = input.soldAmountVnd ?? pkg?.amountVnd ?? 0;
  const durationDays = input.soldDurationDays ?? pkg?.durationDays ?? 0;

  const snapshot: PackageEntitlementSnapshot = {
    packageCode,
    packageName,
    amountVnd,
    durationDays,
    entitlements: usesPackageEntitlements
      ? normalizeEntitlements(pkg?.entitlements ?? [])
      : [],
    capturedAt: (input.capturedAt ?? new Date()).toISOString(),
    snapshotSource: usesPackageEntitlements
      ? 'PACKAGE_ENTITLEMENT'
      : 'LEGACY_ORDER_FIELDS',
  };

  if (pkg?.id) {
    snapshot.packageId = pkg.id;
  }
  if (pkg?.version) {
    snapshot.packageVersion = pkg.version;
  } else if (pkg) {
    snapshot.packageVersion = 1;
  }
  if (input.customPackage || !pkg) {
    snapshot.customPackage = true;
  }

  return snapshot;
}

export function buildLegacyOrderEntitlementSnapshot(input: {
  activationPackage?: SnapshotActivationPackage | null;
  packageCode?: string | null;
  packageName?: string | null;
  amountCents: number;
  durationDays: number;
  capturedAt?: Date;
}) {
  return buildPackageEntitlementSnapshot({
    activationPackage: input.activationPackage,
    fallbackPackageCode: input.packageCode,
    fallbackPackageName: input.packageName,
    soldAmountVnd: centsToVnd(input.amountCents),
    soldDurationDays: input.durationDays,
    capturedAt: input.capturedAt,
    forceLegacySource: true,
    customPackage: !input.activationPackage,
  });
}

export function parsePackageEntitlementSnapshot(
  value: Prisma.JsonValue | null | undefined,
): PackageEntitlementSnapshot | null {
  if (!isRecord(value)) {
    return null;
  }
  if (
    typeof value.amountVnd !== 'number' ||
    typeof value.durationDays !== 'number' ||
    !Array.isArray(value.entitlements) ||
    typeof value.capturedAt !== 'string' ||
    (value.snapshotSource !== 'PACKAGE_ENTITLEMENT' &&
      value.snapshotSource !== 'LEGACY_ORDER_FIELDS')
  ) {
    return null;
  }

  return value as PackageEntitlementSnapshot;
}

export function toPrismaJson(
  snapshot: PackageEntitlementSnapshot,
): Prisma.InputJsonValue {
  return snapshot;
}

function normalizeEntitlements(entitlements: PackageEntitlementDefinition[]) {
  return entitlements
    .filter((item) => !item.status || item.status === 'ACTIVE')
    .map((item) => ({
      key: item.entitlementKey,
      value: normalizeJsonValue(item.valueJson),
    }))
    .sort((left, right) => {
      const keyCompare = left.key.localeCompare(right.key);
      if (keyCompare !== 0) {
        return keyCompare;
      }
      return JSON.stringify(left.value).localeCompare(
        JSON.stringify(right.value),
      );
    });
}

function normalizeJsonValue(value: Prisma.JsonValue): Prisma.JsonValue {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeJsonValue(item));
  }
  if (!isRecord(value)) {
    return value;
  }

  return Object.fromEntries(
    Object.keys(value)
      .sort()
      .map((key) => [key, normalizeJsonValue(value[key])]),
  );
}

function isRecord(value: unknown): value is Record<string, Prisma.JsonValue> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function centsToVnd(amountCents: number) {
  return Math.round(amountCents / 100);
}
