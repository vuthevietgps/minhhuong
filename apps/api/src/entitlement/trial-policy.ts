export const FREE_TRIAL_PROVIDER_REF = 'free_trial_3_day_v1';
export const FREE_TRIAL_DEFAULT_DAYS = 3;
export const FREE_TRIAL_MAX_TOTAL_DAYS = 15;
export const FREE_TRIAL_MAX_LESSONS = 2;
export const FREE_TRIAL_MAX_AI_RESPONSES = 5;
export const FREE_TRIAL_MAX_INITIAL_ASSESSMENTS = 1;
export const FREE_TRIAL_REPORT_DELAY_DAYS = 2;

export function addTrialDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}
