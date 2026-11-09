import { apiBaseUrl, readApiError } from "../lib/api";
import type { ActivePracticePlanContext, LearningHomePayload, LearningPersistentDailyPlanItem } from "../types";

export function friendlyLearningError(message: string) {
  const normalized = message.toLowerCase();
  if (normalized.includes("free trial is limited")) {
    return "Dùng thử đã đạt giới hạn 2 bài học, 1 bài đánh giá hoặc 5 lượt AI. Hãy chọn gói để tiếp tục.";
  }
  if (
    normalized.includes("subscription") ||
    normalized.includes("entitlement")
  ) {
    return "Hồ sơ này chưa có gói học hợp lệ hoặc quyền học đã hết hạn.";
  }
  if (normalized.includes("childprofileid")) {
    return "Cần chọn hồ sơ học sinh trước khi học.";
  }
  if (normalized.includes("limit")) {
    return "Hôm nay con đã hết thời gian học. Hãy hỏi bố/mẹ để học thêm.";
  }
  if (
    normalized.includes("not found") ||
    normalized.includes("access denied")
  ) {
    return "Không tìm thấy hồ sơ học sinh thuộc quyền tài khoản này.";
  }
  return message;
}

export async function fetchLearningHomePayload(
  childProfileId: string,
  authHeaders: HeadersInit,
) {
  const params = childProfileId
    ? `?childProfileId=${encodeURIComponent(childProfileId)}`
    : "";
  const response = await fetch(`${apiBaseUrl}/v1/learning/home${params}`, {
    headers: authHeaders,
  });
  if (!response.ok) {
    throw new Error(
      friendlyLearningError(
        await readApiError(response, "Không thể tải kế hoạch học."),
      ),
    );
  }

  return (await response.json()) as LearningHomePayload;
}

export function blockedPlanMessage(reason?: string | null) {
  const normalized = reason ?? "";
  if (normalized === "WATCH_EVIDENCE_INSUFFICIENT") {
    return "Con cần xem thêm video trước khi hoàn thành.";
  }
  if (
    normalized === "PRACTICE_SCORE_INSUFFICIENT" ||
    normalized === "PRACTICE_SCORE_BELOW_MIN" ||
    normalized.toLowerCase().includes("score")
  ) {
    return "Con cần làm bài đạt điểm cao hơn.";
  }
  if (
    normalized === "NO_BACKEND_ATTEMPT" ||
    normalized === "PRACTICE_ATTEMPT_REQUIRED" ||
    normalized.toLowerCase().includes("attempt")
  ) {
    return "Con cần nộp bài trước.";
  }
  if (normalized.toLowerCase().includes("watch")) {
    return "Con cần xem thêm video trước khi hoàn thành.";
  }
  return "Chưa đủ điều kiện hoàn thành.";
}

export function practicePlanContextFromItem(
  item: LearningPersistentDailyPlanItem,
): ActivePracticePlanContext | undefined {
  if (!item.lessonId) return undefined;

  return {
    kind: "PRACTICE",
    lessonId: item.lessonId,
    activityId: item.activityId,
    itemId: item.id,
    planId: item.planId,
    status: item.status,
    percent: item.evidenceSummary?.percent,
    minScore: item.evidenceSummary?.minScore ?? item.minScore ?? 80,
    score: item.evidenceSummary?.score,
    maxScore: item.evidenceSummary?.maxScore,
    passed: item.evidenceSummary?.passed,
    blockedReason: item.blockedReason,
    attemptId: item.evidenceSummary?.attemptId,
  };
}
