export type LearningReportRange = '7d' | '30d';

export const defaultMinWatchPercent = 80;

export function groupByDate<T>(
  items: T[],
  getDate: (item: T) => Date,
): Map<string, T[]> {
  const byDate = new Map<string, T[]>();
  for (const item of items) {
    const key = dateKeyInBangkok(getDate(item));
    const group = byDate.get(key) ?? [];
    group.push(item);
    byDate.set(key, group);
  }
  return byDate;
}

export function groupByKey<T>(items: T[], getKey: (item: T) => string | null) {
  const byKey = new Map<string, T[]>();
  for (const item of items) {
    const key = getKey(item);
    if (!key) {
      continue;
    }
    const group = byKey.get(key) ?? [];
    group.push(item);
    byKey.set(key, group);
  }
  return byKey;
}

export function dateKeysBetween(fromDate: string, toDate: string) {
  const dates: string[] = [];
  let current = fromDate;
  while (current <= toDate) {
    dates.push(current);
    current = addDaysToDateKey(current, 1);
  }
  return dates;
}

export function addDaysToDateKey(dateKey: string, days: number) {
  const date = new Date(`${dateKey}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function bangkokDateStart(dateKey: string) {
  return new Date(`${dateKey}T00:00:00.000+07:00`);
}

export function bangkokDateEnd(dateKey: string) {
  const nextDay = addDaysToDateKey(dateKey, 1);
  return new Date(bangkokDateStart(nextDay).getTime() - 1);
}

export function dateKeyInBangkok(date: Date) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Bangkok',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

export function secondsToMinutes(seconds: number) {
  return Math.round(Math.max(0, seconds) / 60);
}

export function averageOrNull(values: number[]) {
  if (values.length === 0) {
    return null;
  }
  return Math.round(
    values.reduce((sum, value) => sum + value, 0) / values.length,
  );
}

export function maxOrNull(values: number[]) {
  if (values.length === 0) {
    return null;
  }
  return Math.max(...values);
}

export function calculateAttemptPercent(score: number, maxScore: number) {
  return maxScore > 0 ? Math.round((score / maxScore) * 100) : score;
}

export function parentBlockedMessage(reason: string) {
  const messages: Record<string, string> = {
    WATCH_EVIDENCE_INSUFFICIENT: 'Con chưa xem đủ video để tính hoàn thành.',
    PRACTICE_ATTEMPT_REQUIRED:
      'Con chưa làm bài luyện tập để có điểm hoàn thành.',
    PRACTICE_SCORE_BELOW_MIN:
      'Con đã làm bài nhưng điểm chưa đạt mức hoàn thành.',
    NO_PLAN: 'Chưa có kế hoạch học cho ngày này.',
    NO_ASSIGNMENT: 'Con chưa được gán lộ trình học chính.',
  };

  return messages[reason] ?? reason;
}

export function emptyDayState(reason: 'NO_PLAN' | 'NO_ASSIGNMENT') {
  return {
    code: reason,
    message: parentBlockedMessage(reason),
  };
}

export function weekKey(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toISOString().slice(0, 10);
}
