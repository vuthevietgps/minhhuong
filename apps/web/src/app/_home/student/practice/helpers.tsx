"use client";

import { apiBaseUrl } from "../../lib/api";
import type { ActivePracticePlanContext, LearningHomePayload, LearningPersistentDailyPlanItem } from "../../types";
import { blockedPlanMessage } from "../learning-plan";

export type PracticeLesson = {
  id: string;
  title: string;
  activities: Array<{
    id: string;
    title: string;
    description?: string;
    type: string;
    questions: Array<{
      id: string;
      type:
        | "SINGLE_CHOICE"
        | "MULTIPLE_CHOICE"
        | "TEXT_INPUT"
        | "ORDERING"
        | "SPEAKING";
      prompt: string;
      points: number;
      metadata?: Record<string, unknown> | null;
      answers: Array<{
        id: string;
        text: string;
      }>;
    }>;
  }>;
};

export type PracticeQuestion =
  PracticeLesson["activities"][number]["questions"][number];

export function findPracticeDailyPlanItem(
  home: LearningHomePayload,
  input: {
    activityId?: string | null;
    itemId?: string;
    lessonId: string;
  },
) {
  const items = home.persistentDailyPlan?.items ?? [];
  const practiceItems = items.filter((item) => item.itemType === "PRACTICE");

  return (
    practiceItems.find((item) => input.itemId && item.id === input.itemId) ??
    practiceItems.find(
      (item) => input.activityId && item.activityId === input.activityId,
    ) ??
    practiceItems.find((item) => item.lessonId === input.lessonId) ??
    null
  );
}

export function practiceDailyPlanContextMessage(
  context: ActivePracticePlanContext | null,
) {
  if (!context) return "";
  if (context.status === "COMPLETED") {
    return "Hệ thống đã xác nhận bài luyện tập hoàn thành trong kế hoạch hôm nay.";
  }
  if (context.passed) {
    return "Đã đủ điểm. Bấm kiểm tra ở Học hôm nay để xác nhận hoàn thành.";
  }
  if (context.blockedReason) {
    return blockedPlanMessage(context.blockedReason);
  }
  return "Sau khi nộp bài, kế hoạch hôm nay sẽ cập nhật kết quả.";
}

export function practiceDailyPlanRefreshMessage(input: {
  context: ActivePracticePlanContext | null;
  item: LearningPersistentDailyPlanItem | null;
  percent: number;
  refreshed: boolean;
  requiredScore: number;
}) {
  if (!input.refreshed) {
    return input.percent >= input.requiredScore
      ? "Bài vừa nộp đã đủ điểm, nhưng kế hoạch hôm nay chưa cập nhật. Hãy thử bấm kiểm tra ở Học hôm nay."
      : "Con cần đạt thêm điểm để hoàn thành bài luyện; kế hoạch hôm nay chưa cập nhật.";
  }
  if (!input.item || !input.context) {
    return "Kế hoạch hôm nay đã cập nhật, nhưng chưa tìm thấy bài luyện tập tương ứng.";
  }
  if (input.context.status === "COMPLETED") {
    return "Bài luyện tập đã hoàn thành; sao hôm nay và tiến độ đã cập nhật.";
  }
  if (input.context.passed) {
    return "Đã đủ điểm. Bấm kiểm tra ở Học hôm nay để xác nhận hoàn thành.";
  }
  if (input.context.blockedReason) {
    return blockedPlanMessage(input.context.blockedReason);
  }
  return input.percent >= input.requiredScore
    ? "Bài vừa nộp đã đạt điểm; kế hoạch hôm nay đã cập nhật. Bấm kiểm tra để xác nhận hoàn thành."
    : "Con cần đạt thêm điểm để hoàn thành bài luyện.";
}

export type PracticeAttemptResult = {
  score: number;
  maxScore: number;
  responses: Array<{
    questionId: string;
    isCorrect: boolean;
    feedback?: string;
  }>;
};

export type PracticeSubmitResponse = {
  questionId: string;
  selectedAnswerIds?: string[];
  textAnswer?: string;
  orderedAnswerIds?: string[];
};

export type PracticeDraft = {
  selectedAnswers: Record<string, string[]>;
  textAnswers: Record<string, string>;
  orderedAnswers: Record<string, string[]>;
};

export function practiceDraftStorageKey(childProfileId: string, lessonId: string) {
  return `minhhuong:practice-draft:v1:${childProfileId || "self"}:${lessonId}`;
}

export function readPracticeDraft(
  childProfileId: string,
  lessonId: string,
): PracticeDraft | null {
  try {
    const stored = window.localStorage.getItem(
      practiceDraftStorageKey(childProfileId, lessonId),
    );
    if (!stored) {
      return null;
    }

    const parsed = JSON.parse(stored) as Partial<PracticeDraft>;
    if (
      !parsed ||
      typeof parsed !== "object" ||
      !parsed.selectedAnswers ||
      !parsed.textAnswers ||
      !parsed.orderedAnswers
    ) {
      return null;
    }

    return {
      selectedAnswers: parsed.selectedAnswers,
      textAnswers: parsed.textAnswers,
      orderedAnswers: parsed.orderedAnswers,
    };
  } catch {
    return null;
  }
}

export function isPracticeQuestionAutoGraded(question: PracticeQuestion) {
  return (
    question.type === "SINGLE_CHOICE" ||
    question.type === "MULTIPLE_CHOICE" ||
    question.type === "TEXT_INPUT" ||
    question.type === "ORDERING"
  );
}

export function requiredPracticeScoreForPlan(
  context: ActivePracticePlanContext | null | undefined,
  lessonId: string | undefined,
  activity: PracticeLesson["activities"][number] | undefined,
) {
  if (
    context &&
    context.lessonId === lessonId &&
    (!activity || !context.activityId || context.activityId === activity.id)
  ) {
    return context.minScore ?? 80;
  }

  return 80;
}

export function practiceResultPercent(
  result: Pick<PracticeAttemptResult, "score" | "maxScore">,
) {
  return result.maxScore > 0
    ? Math.round((result.score / result.maxScore) * 100)
    : 0;
}

export function practiceStarsForPercent(percent: number, requiredPercent: number) {
  if (percent >= Math.max(95, requiredPercent)) return 3;
  if (percent >= requiredPercent) return 2;
  if (percent > 0) return 1;
  return 0;
}

export function practiceStarClass(index: number, earnedStars: number) {
  return `grid size-9 place-items-center rounded-lg ${
    index < earnedStars
      ? "bg-amber-200 text-amber-800"
      : "bg-white/70 text-slate-400"
  }`;
}

export function practiceAnswerClass(checked: boolean) {
  return `flex min-h-12 items-center gap-3 rounded-lg border px-3 text-left text-sm font-medium transition disabled:cursor-default ${
    checked
      ? "border-teal-500 bg-teal-50 text-teal-950"
      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
  }`;
}

export function practiceFeedbackText(
  response: PracticeAttemptResult["responses"][number],
) {
  if (response.isCorrect) return "Đúng. Hệ thống đã ghi nhận câu này.";
  return response.feedback ?? "Chưa đúng. Con xem lại bài rồi làm lại nhé.";
}

export function practiceMediaUrl(question: PracticeQuestion, keys: string[]) {
  const metadata = question.metadata;
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return "";
  }

  for (const key of keys) {
    const value = metadata[key];
    if (typeof value === "string" && value.trim()) {
      return value.startsWith("http") ? value : `${apiBaseUrl}${value}`;
    }
  }

  return "";
}
