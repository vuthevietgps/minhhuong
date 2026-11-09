import { ForbiddenException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { AuthenticatedUser } from '../auth/auth.types';

export const payoutInvoiceUrl = (file: Express.Multer.File) =>
  `/uploads/invoices/${file.filename}`;

export const manualRefundRequestOpenedAction = 'MANUAL_REFUND_REQUEST_OPENED';

export const manualRefundRequestApprovedAction =
  'MANUAL_REFUND_REQUEST_APPROVED';

export const manualRefundRequestRejectedAction =
  'MANUAL_REFUND_REQUEST_REJECTED';

export const manualRefundReviewActions = [
  manualRefundRequestOpenedAction,
  manualRefundRequestApprovedAction,
  manualRefundRequestRejectedAction,
] as const;

export type ChannelFinanceScope = {
  orderWhere: Prisma.ActivationOrderWhereInput;
  earningWhere: Prisma.CommissionEarningWhereInput;
  ledgerWhere: Prisma.CommissionLedgerEntryWhereInput;
  payoutWhere: Prisma.PayoutRequestWhereInput;
  participantWhere: Prisma.ChannelParticipantWhereInput;
};

export function summarizeEntries(
  entries: Array<{
    type: 'CREDIT' | 'DEBIT' | 'HOLD' | 'RELEASE';
    amountCents: number;
    currency: string;
  }>,
) {
  const balanceCents = entries.reduce((sum, entry) => {
    return entry.type === 'CREDIT' || entry.type === 'RELEASE'
      ? sum + entry.amountCents
      : sum - entry.amountCents;
  }, 0);
  const heldCents = entries
    .filter((entry) => entry.type === 'HOLD')
    .reduce((sum, entry) => sum + entry.amountCents, 0);
  const releasedCents = entries
    .filter((entry) => entry.type === 'RELEASE')
    .reduce((sum, entry) => sum + entry.amountCents, 0);

  return {
    availableCents: balanceCents,
    heldCents: Math.max(heldCents - releasedCents, 0),
    currency: entries[0]?.currency ?? 'VND',
  };
}

export function canManageFinance(user: AuthenticatedUser) {
  return user.roles.some((role) => ['ADMIN', 'OPERATIONS'].includes(role));
}

export function isAgencyChannelManager(user: AuthenticatedUser) {
  return user.roles.some((role) =>
    ['DIRECTOR', 'AGENCY_OWNER', 'AGENCY_MANAGER'].includes(role),
  );
}

export function assertCanManage(user: AuthenticatedUser) {
  if (!canManageFinance(user)) {
    throw new ForbiddenException('Insufficient finance permission');
  }
}

export function dbUserId(user: AuthenticatedUser) {
  return user.sub.startsWith('demo-') ? undefined : user.sub;
}

export function fileIdempotencyMetadata(file: Express.Multer.File) {
  return {
    filename: file.filename,
    originalname: file.originalname,
    mimetype: file.mimetype,
    size: file.size,
  };
}
