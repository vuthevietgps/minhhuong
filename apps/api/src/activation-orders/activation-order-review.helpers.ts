import {
  buildPackageEntitlementSnapshot,
  type PackageEntitlementSnapshot,
  type SnapshotActivationPackage,
} from '../package-entitlement/package-entitlement-snapshot';
import { assertManualPaidPilotSingleChildAllocation } from './activation-order.helpers';

export function fileIdempotencyMetadata(file: Express.Multer.File) {
  return {
    filename: file.filename,
    originalname: file.originalname,
    mimetype: file.mimetype,
    size: file.size,
  };
}

export function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function assertCurrentPackageSingleChildAllocationForLegacyApproval(input: {
  parsedOrderSnapshot: PackageEntitlementSnapshot | null;
  activationPackage: SnapshotActivationPackage | null;
  packageCode?: string | null;
  packageName?: string | null;
  amountCents: number;
  durationDays: number;
  capturedAt: Date;
}) {
  if (input.parsedOrderSnapshot || !input.activationPackage) {
    return;
  }

  assertManualPaidPilotSingleChildAllocation(
    buildPackageEntitlementSnapshot({
      activationPackage: input.activationPackage,
      fallbackPackageCode: input.packageCode,
      fallbackPackageName: input.packageName,
      soldAmountVnd: Math.round(input.amountCents / 100),
      soldDurationDays: input.durationDays,
      capturedAt: input.capturedAt,
    }),
  );
}
