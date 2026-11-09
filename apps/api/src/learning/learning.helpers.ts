import { LearningDeviceType } from '@prisma/client';
import type { AuthenticatedUser } from '../auth/auth.types';

export function tracksDeviceUsage(
  user: AuthenticatedUser,
  childProfileId: string,
) {
  return !user.sub.startsWith('demo-') && childProfileId.length > 0;
}

export function todayInBangkok() {
  return dateInBangkok(0);
}

export function dateInBangkok(offsetDays: number) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);

  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Bangkok',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

export function detectDeviceType(userAgent?: string): LearningDeviceType {
  const normalized = userAgent?.toLowerCase() ?? '';

  if (/ipad|tablet|kindle|silk/.test(normalized)) {
    return LearningDeviceType.TABLET;
  }

  if (/mobile|iphone|android/.test(normalized)) {
    return LearningDeviceType.PHONE;
  }

  if (/windows|macintosh|linux|cros/.test(normalized)) {
    return LearningDeviceType.COMPUTER;
  }

  return LearningDeviceType.UNKNOWN;
}
