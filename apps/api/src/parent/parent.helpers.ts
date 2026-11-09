export function toScreenTime(
  setting: {
    isEnabled: boolean;
    dailyLimitMinutes: number;
    sessionLimitMinutes: number;
    breakMinutes: number;
    updatedAt: Date;
  } | null,
) {
  return {
    isEnabled: setting?.isEnabled ?? false,
    dailyLimitMinutes: setting?.dailyLimitMinutes ?? 45,
    sessionLimitMinutes: setting?.sessionLimitMinutes ?? 30,
    breakMinutes: setting?.breakMinutes ?? 10,
    updatedAt: setting?.updatedAt ?? null,
  };
}

export function todayInBangkok() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Bangkok',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}
