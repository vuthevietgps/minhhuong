"use client";

import {
  Bot,
  CheckCircle2,
  ChevronRight,
  CirclePlay,
  Crown,
  FileVideo,
  Flame,
  Gamepad2,
  LockKeyhole,
  Play,
  RotateCcw,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { apiBaseUrl } from "../lib/api";
import { formatVideoDuration } from "../lib/format";
import type {
  ActiveLearningPlanContext,
  ActiveVideoPlanContext,
  LearningDailyPlanItemStatus,
  LearningHomePayload,
  LearningPersistentDailyPlan,
  LearningPersistentDailyPlanItem,
  Session,
} from "../types";
import { blockedPlanMessage, fetchLearningHomePayload, practicePlanContextFromItem } from "./learning-plan";

export function StudentTodayPanel({
  childDisplayName,
  childProfileId,
  onResume,
  refreshToken = 0,
  session,
}: {
  childDisplayName?: string;
  childProfileId: string;
  onResume: (
    lessonId: string,
    target?: "video" | "practice",
    context?: ActiveLearningPlanContext,
  ) => void;
  refreshToken?: number;
  session: Session;
}) {
  const [home, setHome] = useState<LearningHomePayload | null>(null);
  const [message, setMessage] = useState("Đang tải kế hoạch hôm nay.");
  const [actionStatus, setActionStatus] = useState("");
  const [busyItemId, setBusyItemId] = useState<string | null>(null);
  const [planDetailsOpen, setPlanDetailsOpen] = useState(false);

  const authHeaders = useMemo(
    () => ({ Authorization: `Bearer ${session.accessToken}` }),
    [session.accessToken],
  );

  const loadHome = useCallback(async () => {
    try {
      if (!childProfileId) {
        setHome(null);
        setMessage(
          "Chưa chọn hồ sơ học sinh. Phụ huynh cần chọn đúng hồ sơ con trước khi vào luồng học.",
        );
        return;
      }

      const data = await fetchLearningHomePayload(childProfileId, authHeaders);
      setHome(data);
      setMessage(childHomeMessage(data));
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Không thể tải kế hoạch học.",
      );
    }
  }, [authHeaders, childProfileId]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadHome();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadHome, refreshToken]);

  const usage = home?.deviceUsage;
  const persistentPlan = home?.persistentDailyPlan;
  const usesPersistentPlan = Boolean(persistentPlan?.plan);
  const legacyItems = useMemo<LearningPersistentDailyPlanItem[]>(
    () =>
      (home?.dailyPlan ?? []).map((item, index) => ({
        id: item.id,
        planId: "legacy",
        sequence: index + 1,
        itemType: item.type,
        lessonId: item.lessonId,
        activityId: null,
        required: true,
        status: item.status,
        lesson: item.lessonId
          ? {
              id: item.lessonId,
              title: item.title,
              description: item.description,
            }
          : null,
      })),
    [home?.dailyPlan],
  );
  const planItems = usesPersistentPlan
    ? (persistentPlan?.items ?? [])
    : legacyItems;
  const nextItem =
    planItems.find((item) => item.status === "STARTED") ??
    planItems.find((item) => item.status === "READY");
  const allDone =
    planItems.length > 0 &&
    planItems.every((item) => ["COMPLETED", "SKIPPED"].includes(item.status));
  const noAssignment =
    persistentPlan?.contentSource.mode === "UNASSIGNED_FALLBACK" &&
    !persistentPlan.plan;
  const suggestedLesson =
    !noAssignment && planItems.length === 0 && !usage?.limitReached
      ? (home?.continueLesson ?? null)
      : null;
  const hasPrimaryAction = Boolean(nextItem || suggestedLesson);
  const primaryLessonTitle = nextItem
    ? planItemTitle(nextItem)
    : suggestedLesson?.title;
  const suggestedLessonDetail =
    suggestedLesson?.progress.status === "IN_PROGRESS"
      ? `Đã học ${suggestedLesson.progress.progressPercent}% · tiếp tục ngay`
      : suggestedLesson?.progress.status === "COMPLETED"
        ? "Đã hoàn thành · xem lại khi con muốn"
        : "Sẵn sàng bắt đầu";
  const todayTitle = childDisplayName
    ? `Hôm nay ${childDisplayName} học gì?`
    : "Hôm nay con học gì?";
  const headline = !childProfileId
    ? "Chưa chọn hồ sơ học sinh"
    : noAssignment
      ? "Chưa có lộ trình được giao"
      : allDone
        ? "Hôm nay con học xong rồi"
        : primaryLessonTitle
          ? `Bài tiếp theo: ${primaryLessonTitle}`
          : suggestedLesson
            ? "Chọn bài tiếp theo"
            : "Chưa có kế hoạch hôm nay";
  const progressLabel = nextItem
    ? planItemDescription(nextItem)
    : suggestedLesson
      ? `${suggestedLesson.courseTitle} · ${suggestedLesson.unitTitle}`
      : "";

  async function postPlanItemAction(
    item: LearningPersistentDailyPlanItem,
    action: "start" | "complete" | "skip",
  ) {
    if (!usesPersistentPlan || item.planId === "legacy") {
      return null;
    }

    setBusyItemId(item.id);
    setActionStatus("");
    try {
      const response = await fetch(
        `${apiBaseUrl}/v1/learning/daily-plans/${item.planId}/items/${item.id}/${action}`,
        {
          method: "POST",
          headers: authHeaders,
        },
      );
      if (!response.ok) {
        throw new Error(await readPlanActionError(response));
      }

      return (await response.json()) as LearningPersistentDailyPlan;
    } finally {
      setBusyItemId(null);
    }
  }

  async function startPlanItem(item: LearningPersistentDailyPlanItem) {
    if (item.status === "LOCKED") {
      setActionStatus(blockedPlanMessage(item.blockedReason));
      return;
    }

    const target = item.itemType === "PRACTICE" ? "practice" : "video";
    if (item.status === "READY") {
      try {
        await postPlanItemAction(item, "start");
        await loadHome();
      } catch (error) {
        setActionStatus(
          error instanceof Error
            ? error.message
            : "Không thể bắt đầu việc học.",
        );
        return;
      }
    }

    if (item.lessonId) {
      onResume(
        item.lessonId,
        target,
        item.itemType === "VIDEO"
          ? videoPlanContextFromItem(item)
          : item.itemType === "PRACTICE"
            ? practicePlanContextFromItem(item)
            : undefined,
      );
      setActionStatus(
        item.itemType === "PRACTICE"
          ? "Đã mở phần làm bài cho việc học này."
          : "Đã mở video cho việc học này.",
      );
      return;
    }

    setActionStatus("Việc học này chưa có nội dung để mở.");
  }

  async function completePlanItem(item: LearningPersistentDailyPlanItem) {
    try {
      const updatedPlan = await postPlanItemAction(item, "complete");
      await loadHome();
      const updatedItem = updatedPlan?.items.find(
        (planItem) => planItem.id === item.id,
      );
      const planFinished =
        updatedPlan?.plan?.status === "COMPLETED" ||
        updatedPlan?.items.every((planItem) =>
          ["COMPLETED", "SKIPPED"].includes(planItem.status),
        ) === true;

      if (planFinished) {
        setActionStatus(
          "Giỏi quá, hệ thống đã xác nhận xong kế hoạch hôm nay.",
        );
        return;
      }

      setActionStatus(
        updatedItem?.status === "COMPLETED"
          ? "Tốt lắm, việc học này đã hoàn thành."
          : "Đã kiểm tra và cập nhật tiến độ học.",
      );
    } catch (error) {
      setActionStatus(
        error instanceof Error
          ? error.message
          : blockedPlanMessage(item.blockedReason),
      );
    }
  }

  async function skipPlanItem(item: LearningPersistentDailyPlanItem) {
    try {
      await postPlanItemAction(item, "skip");
      await loadHome();
      setActionStatus("Đã bỏ qua việc học không bắt buộc.");
    } catch (error) {
      setActionStatus(
        error instanceof Error
          ? error.message
          : "Không thể bỏ qua việc học này.",
      );
    }
  }

  function resumeSuggestedLesson() {
    if (!suggestedLesson) return;

    onResume(suggestedLesson.id, "video");
    setActionStatus(`Đã mở ${suggestedLesson.title}.`);
  }

  return (
    <section
      className="mt-4 scroll-mt-4 rounded-lg border border-slate-200 bg-white p-4 sm:p-5"
      id="student-today-panel"
    >
      <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <div>
          <div className="flex items-center gap-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
              Học hôm nay
            </p>
            {home && home.streak > 0 && (
              <span className="flex items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-700">
                <Flame size={12} />
                {home.streak} ngày
              </span>
            )}
          </div>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">{todayTitle}</p>
              <h2 className="mt-1 text-xl font-semibold">{headline}</h2>
              <p className="mt-1 text-sm text-slate-500">
                {progressLabel || message}
              </p>
            </div>
            <button
              className="flex h-10 items-center justify-center gap-2 rounded-lg bg-slate-950 px-3 text-sm font-medium text-white disabled:opacity-50"
              disabled={!hasPrimaryAction || usage?.limitReached}
              onClick={() => {
                if (nextItem) {
                  void startPlanItem(nextItem);
                  return;
                }
                resumeSuggestedLesson();
              }}
              type="button"
            >
              <CirclePlay size={18} />
              Học bài tiếp theo
            </button>
          </div>

          {suggestedLesson && (
            <div className="mt-4 flex w-full items-center gap-3 overflow-hidden rounded-xl border border-violet-200 bg-violet-50/60 p-3 text-left">
              <span
                aria-hidden="true"
                className="relative grid aspect-video w-28 shrink-0 place-items-center overflow-hidden rounded-lg bg-slate-900 bg-cover bg-center text-white"
                style={
                  suggestedLesson.video?.thumbnailUrl
                    ? {
                        backgroundImage: `linear-gradient(135deg, rgba(36, 49, 77, 0.12), rgba(36, 49, 77, 0.55)), url(${suggestedLesson.video.thumbnailUrl})`,
                      }
                    : undefined
                }
              >
                <span className="grid size-9 place-items-center rounded-full bg-white/90 text-violet-700 shadow-sm">
                  <Play fill="currentColor" size={16} />
                </span>
                {formatVideoDuration(
                  suggestedLesson.durationSec ??
                    suggestedLesson.video?.durationSec,
                ) && (
                  <span className="absolute bottom-1 right-1 rounded bg-slate-950/80 px-1.5 py-0.5 text-[10px] font-bold text-white">
                    {formatVideoDuration(
                      suggestedLesson.durationSec ??
                        suggestedLesson.video?.durationSec,
                    )}
                  </span>
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-bold uppercase tracking-wide text-violet-700">
                  Bài gợi ý cho con
                </span>
                <span className="mt-1 block truncate text-base font-semibold text-slate-900">
                  {suggestedLesson.title}
                </span>
                <span className="mt-1 block text-xs text-slate-600">
                  {suggestedLessonDetail}
                </span>
              </span>
              <ChevronRight
                aria-hidden="true"
                className="shrink-0 text-violet-700"
                size={20}
              />
            </div>
          )}

          <p className="mt-3 text-sm text-slate-500">{message}</p>
          {actionStatus && (
            <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
              {actionStatus}
            </p>
          )}
        </div>

        <div className="border-t border-slate-200 pt-4 xl:border-l xl:border-t-0 xl:pl-4 xl:pt-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Lộ trình hôm nay
              </p>
              <h3 className="mt-1 text-base font-semibold">
                {allDone
                  ? "Đã hoàn thành"
                  : (primaryLessonTitle ?? "Chưa có bài cần làm")}
              </h3>
            </div>
            <button
              aria-expanded={planDetailsOpen}
              className="h-9 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              onClick={() => setPlanDetailsOpen((current) => !current)}
              type="button"
            >
              {planDetailsOpen ? "Ẩn chi tiết" : "Xem kế hoạch"}
            </button>
          </div>
          {planDetailsOpen && (
            <div className="mt-3 space-y-3">
              {planItems.map((item) => (
                <div
                  className={`rounded-lg border p-3 ${
                    item.status === "LOCKED"
                      ? "border-slate-200 bg-slate-50"
                      : item.status === "COMPLETED"
                        ? "border-teal-200 bg-teal-50"
                        : item.status === "STARTED"
                          ? "border-amber-200 bg-amber-50"
                          : "border-slate-200 bg-white"
                  }`}
                  key={item.id}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-700">
                        {item.itemType === "PRACTICE" ? (
                          <Gamepad2 size={17} />
                        ) : item.itemType === "REST" ? (
                          <LockKeyhole size={17} />
                        ) : item.itemType === "REVIEW" ? (
                          <RotateCcw size={17} />
                        ) : item.itemType === "AI_CONVERSATION" ? (
                          <Bot size={17} />
                        ) : item.itemType === "REWARD" ? (
                          <Crown size={17} />
                        ) : (
                          <FileVideo size={17} />
                        )}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-medium">
                          {planItemTitle(item)}
                        </span>
                        <span className="mt-1 block text-xs text-slate-500">
                          {planItemDescription(item)}
                        </span>
                        {planItemEvidenceText(item) && (
                          <span className="mt-2 block text-xs text-slate-600">
                            {planItemEvidenceText(item)}
                          </span>
                        )}
                        {item.blockedReason && (
                          <span className="mt-2 block rounded-md bg-amber-100 px-2 py-1 text-xs text-amber-900">
                            {blockedPlanMessage(item.blockedReason)}
                          </span>
                        )}
                      </span>
                    </div>
                    <span className={planStatusClass(item.status)}>
                      {planStatusLabel(item.status)}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      className="flex h-9 items-center gap-2 rounded-lg bg-slate-950 px-3 text-xs font-medium text-white disabled:opacity-50"
                      disabled={
                        item.status === "LOCKED" ||
                        item.status === "COMPLETED" ||
                        item.status === "SKIPPED" ||
                        busyItemId === item.id ||
                        !item.lessonId ||
                        item.itemType === "AI_CONVERSATION" ||
                        item.itemType === "REWARD"
                      }
                      onClick={() => void startPlanItem(item)}
                      type="button"
                    >
                      <Play size={15} />
                      {item.status === "STARTED"
                        ? "Học tiếp"
                        : primaryPlanActionLabel(item)}
                    </button>
                    <button
                      className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-medium text-slate-700 disabled:opacity-50"
                      disabled={
                        !usesPersistentPlan ||
                        item.status === "LOCKED" ||
                        item.status === "COMPLETED" ||
                        item.status === "SKIPPED" ||
                        busyItemId === item.id
                      }
                      onClick={() => void completePlanItem(item)}
                      type="button"
                    >
                      <CheckCircle2 size={15} />
                      {completePlanActionLabel(item)}
                    </button>
                    {!item.required && (
                      <button
                        className="h-9 rounded-lg border border-slate-200 px-3 text-xs font-medium text-slate-600 disabled:opacity-50"
                        disabled={
                          !usesPersistentPlan ||
                          item.status === "COMPLETED" ||
                          item.status === "SKIPPED" ||
                          busyItemId === item.id
                        }
                        onClick={() => void skipPlanItem(item)}
                        type="button"
                      >
                        Bỏ qua
                      </button>
                    )}
                    {(item.itemType === "AI_CONVERSATION" ||
                      item.itemType === "REWARD") && (
                      <span className="flex h-9 items-center rounded-lg bg-slate-100 px-3 text-xs font-medium text-slate-500">
                        Sắp mở
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {home && planItems.length === 0 && (
                <p className="rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-500">
                  {noAssignment
                    ? "Hồ sơ này chưa có gói học hoặc lộ trình đang hoạt động."
                    : "Hôm nay chưa có việc học nào cần làm."}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function childHomeMessage(home: LearningHomePayload) {
  const plan = home.persistentDailyPlan;
  if (home.deviceUsage.limitReached) {
    return "Hôm nay con đã hết thời gian học trong ứng dụng. Hãy hỏi bố/mẹ để học thêm.";
  }
  if (plan?.contentSource.mode === "UNASSIGNED_FALLBACK" && !plan.plan) {
    return "Hồ sơ này chưa được giao gói học/lộ trình học đang hoạt động.";
  }
  if (plan?.plan?.status === "COMPLETED" && home.continueLesson) {
    return `Kế hoạch hôm nay đã xong. Con có thể xem lại ${home.continueLesson.title}.`;
  }
  if (plan?.plan?.status === "COMPLETED") {
    return "Con đã hoàn thành kế hoạch hôm nay.";
  }
  if (plan?.items.length) {
    return "Bắt đầu từ việc học đầu tiên đang sẵn sàng.";
  }
  return "Chưa có kế hoạch học hôm nay.";
}

async function readPlanActionError(response: Response) {
  try {
    const payload = (await response.json()) as { message?: unknown };
    const rawMessage = payload.message;
    if (typeof rawMessage === "string") {
      return blockedPlanMessage(rawMessage);
    }
    if (rawMessage && typeof rawMessage === "object") {
      const detail = rawMessage as { code?: string; message?: string };
      return blockedPlanMessage(detail.code ?? detail.message);
    }
  } catch {
    // Fall through to the status-based fallback below.
  }
  return response.status === 403
    ? "Chưa đủ điều kiện hoàn thành."
    : "Không thể cập nhật việc học.";
}

function planItemTitle(item: LearningPersistentDailyPlanItem) {
  if (item.itemType === "PRACTICE") {
    return item.activity?.title ?? item.lesson?.title ?? "Làm bài luyện tập";
  }
  if (item.itemType === "VIDEO") {
    return item.lesson?.title ?? "Xem video";
  }
  if (item.itemType === "AI_CONVERSATION") {
    return "Nói chuyện với AI";
  }
  if (item.itemType === "REWARD") {
    return "Nhận phần thưởng";
  }
  if (item.itemType === "REVIEW") {
    return item.lesson?.title ?? "Ôn lại bài cũ";
  }
  return item.lesson?.title ?? "Việc học";
}

function planItemDescription(item: LearningPersistentDailyPlanItem) {
  const required = item.required ? "Bắt buộc" : "Không bắt buộc";
  if (item.itemType === "VIDEO") {
    return `${required} - Xem video`;
  }
  if (item.itemType === "PRACTICE") {
    return `${required} - Làm bài sau video`;
  }
  if (item.itemType === "AI_CONVERSATION") {
    return "Sắp mở - nói chuyện với AI theo bài học";
  }
  if (item.itemType === "REWARD") {
    return "Sắp mở - phần thưởng sau khi học";
  }
  return required;
}

function planItemEvidenceText(item: LearningPersistentDailyPlanItem) {
  const evidence = item.evidenceSummary;
  if (!evidence) return "";
  if (item.itemType === "VIDEO") {
    return `Video đã ghi nhận ${evidence.watchPercent ?? 0}%, mốc hoàn thành ${
      evidence.minWatchPercent ?? item.minWatchPercent ?? 80
    }%.`;
  }
  if (item.itemType === "PRACTICE") {
    const minScore = evidence.minScore ?? item.minScore;
    const statusText =
      evidence.passed === true
        ? "đã đủ điểm"
        : evidence.passed === false
          ? "chưa đủ điểm"
          : "đang chờ kiểm tra";
    return `Bài luyện đạt ${evidence.percent ?? 0}%${
      minScore !== null && minScore !== undefined ? `, mốc ${minScore}%` : ""
    } - ${statusText}.`;
  }
  return "";
}

function videoPlanContextFromItem(
  item: LearningPersistentDailyPlanItem,
): ActiveVideoPlanContext | undefined {
  if (!item.lessonId) return undefined;

  return {
    kind: "VIDEO",
    lessonId: item.lessonId,
    itemId: item.id,
    planId: item.planId,
    watchPercent: item.evidenceSummary?.watchPercent,
    minWatchPercent:
      item.evidenceSummary?.minWatchPercent ?? item.minWatchPercent ?? 80,
    passed: item.evidenceSummary?.passed,
    blockedReason: item.blockedReason,
  };
}

function primaryPlanActionLabel(item: LearningPersistentDailyPlanItem) {
  if (item.itemType === "PRACTICE") return "Làm bài";
  if (item.itemType === "VIDEO") return "Xem video";
  if (item.itemType === "REVIEW") return "Ôn lại";
  return "Mở";
}

function completePlanActionLabel(item: LearningPersistentDailyPlanItem) {
  if (item.itemType === "PRACTICE") {
    return item.evidenceSummary?.passed
      ? "Kiểm tra hoàn thành"
      : "Kiểm tra điểm";
  }
  if (item.itemType === "VIDEO") {
    return "Kiểm tra hoàn thành";
  }
  return "Kiểm tra hoàn thành";
}

function planStatusLabel(status: LearningDailyPlanItemStatus) {
  const labels: Record<LearningDailyPlanItemStatus, string> = {
    READY: "Sẵn sàng",
    STARTED: "Đang học",
    COMPLETED: "Đã xong",
    SKIPPED: "Đã bỏ qua",
    LOCKED: "Đang khóa",
  };
  return labels[status];
}

function planStatusClass(status: LearningDailyPlanItemStatus) {
  const classes: Record<LearningDailyPlanItemStatus, string> = {
    READY:
      "shrink-0 rounded-full bg-sky-100 px-2 py-0.5 text-xs font-semibold text-sky-700",
    STARTED:
      "shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800",
    COMPLETED:
      "shrink-0 rounded-full bg-teal-100 px-2 py-0.5 text-xs font-semibold text-teal-700",
    SKIPPED:
      "shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600",
    LOCKED:
      "shrink-0 rounded-full bg-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-600",
  };
  return classes[status];
}
