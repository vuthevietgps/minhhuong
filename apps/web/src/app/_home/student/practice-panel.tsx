"use client";

import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  CheckCircle2,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { apiBaseUrl, readApiError } from "../lib/api";
import type {
  ActivePracticePlanContext,
  LearningHomePayload,
  LearningPersistentDailyPlanItem,
  PracticeDailyPlanRefresh,
  Session,
} from "../types";
import {
  blockedPlanMessage,
  fetchLearningHomePayload,
  friendlyLearningError,
  practicePlanContextFromItem,
} from "./learning-plan";

type PracticeLesson = {
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

type PracticeQuestion =
  PracticeLesson["activities"][number]["questions"][number];

function findPracticeDailyPlanItem(
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

function practiceDailyPlanContextMessage(
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

function practiceDailyPlanRefreshMessage(input: {
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

type PracticeAttemptResult = {
  score: number;
  maxScore: number;
  responses: Array<{
    questionId: string;
    isCorrect: boolean;
    feedback?: string;
  }>;
};

type PracticeSubmitResponse = {
  questionId: string;
  selectedAnswerIds?: string[];
  textAnswer?: string;
  orderedAnswerIds?: string[];
};

type PracticeDraft = {
  selectedAnswers: Record<string, string[]>;
  textAnswers: Record<string, string>;
  orderedAnswers: Record<string, string[]>;
};

function practiceDraftStorageKey(childProfileId: string, lessonId: string) {
  return `minhhuong:practice-draft:v1:${childProfileId || "self"}:${lessonId}`;
}

function readPracticeDraft(
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

export function StudentPracticePanel({
  childProfileId,
  lessonId,
  onDailyPlanRefresh,
  planContext,
  session,
}: {
  childProfileId: string;
  lessonId?: string;
  onDailyPlanRefresh?: (refresh: PracticeDailyPlanRefresh) => void;
  planContext?: ActivePracticePlanContext | null;
  session: Session;
}) {
  const [practice, setPractice] = useState<PracticeLesson | null>(null);
  const [activeActivityId, setActiveActivityId] = useState("");
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<string, string[]>
  >({});
  const [textAnswers, setTextAnswers] = useState<Record<string, string>>({});
  const [orderedAnswers, setOrderedAnswers] = useState<
    Record<string, string[]>
  >({});
  const [result, setResult] = useState<PracticeAttemptResult | null>(null);
  const [refreshedPracticeContext, setRefreshedPracticeContext] =
    useState<ActivePracticePlanContext | null>(null);
  const [planRefreshMessage, setPlanRefreshMessage] = useState("");
  const [message, setMessage] = useState("Đang tải phần luyện tập.");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const authHeaders = useMemo(
    () => ({ Authorization: `Bearer ${session.accessToken}` }),
    [session.accessToken],
  );

  const loadPractice = useCallback(async () => {
    try {
      if (!lessonId) {
        setPractice(null);
        setMessage("Chọn một bài video để mở phần luyện tập.");
        return;
      }

      const cpParam = childProfileId
        ? `?childProfileId=${encodeURIComponent(childProfileId)}`
        : "";
      const practiceResponse = await fetch(
        `${apiBaseUrl}/v1/learning/lessons/${lessonId}/practice${cpParam}`,
        { headers: authHeaders },
      );
      if (!practiceResponse.ok) {
        throw new Error(
          friendlyLearningError(
            await readApiError(
              practiceResponse,
              "Không thể tải phần luyện tập.",
            ),
          ),
        );
      }

      const data = (await practiceResponse.json()) as PracticeLesson;
      const draft = readPracticeDraft(childProfileId, lessonId);
      setPractice(data);
      setActiveActivityId(data.activities[0]?.id ?? "");
      setActiveQuestionIndex(0);
      setSelectedAnswers(draft?.selectedAnswers ?? {});
      setTextAnswers(draft?.textAnswers ?? {});
      setOrderedAnswers(draft?.orderedAnswers ?? {});
      setResult(null);
      setRefreshedPracticeContext(null);
      setPlanRefreshMessage("");
      setMessage(
        data.activities.length > 0
          ? draft
            ? "Đã khôi phục bài làm nháp trên thiết bị này. Hoàn thành rồi nộp bài để được chấm điểm."
            : "Trả lời từng câu rồi nộp để hệ thống chấm điểm."
          : "Bài video này chưa có phần luyện tập.",
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Không thể tải phần luyện tập.",
      );
    }
  }, [authHeaders, childProfileId, lessonId]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadPractice();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadPractice]);

  useEffect(() => {
    if (!lessonId || !practice || practice.id !== lessonId || result) {
      return;
    }

    const hasDraft =
      Object.keys(selectedAnswers).length > 0 ||
      Object.keys(textAnswers).length > 0 ||
      Object.keys(orderedAnswers).length > 0;
    const storageKey = practiceDraftStorageKey(childProfileId, lessonId);

    try {
      if (!hasDraft) {
        window.localStorage.removeItem(storageKey);
        return;
      }

      window.localStorage.setItem(
        storageKey,
        JSON.stringify({ selectedAnswers, textAnswers, orderedAnswers }),
      );
    } catch {
      // Storage may be unavailable in a private browser session.
    }
  }, [
    childProfileId,
    lessonId,
    orderedAnswers,
    practice,
    result,
    selectedAnswers,
    textAnswers,
  ]);

  async function submitPractice() {
    const activity =
      practice?.activities.find((item) => item.id === activeActivityId) ??
      practice?.activities[0];
    if (!activity) {
      return;
    }

    const responses = activity.questions.flatMap<PracticeSubmitResponse>(
      (question) => {
        if (!isPracticeQuestionAutoGraded(question)) {
          return [];
        }

        if (question.type === "TEXT_INPUT") {
          return [
            {
              questionId: question.id,
              textAnswer: textAnswers[question.id] ?? "",
            },
          ];
        }

        if (question.type === "ORDERING") {
          return [
            {
              questionId: question.id,
              orderedAnswerIds: orderedAnswerIdsFor(question),
            },
          ];
        }

        return [
          {
            questionId: question.id,
            selectedAnswerIds: selectedAnswers[question.id] ?? [],
          },
        ];
      },
    );

    if (responses.length === 0) {
      setMessage("Phần này chưa có câu hỏi có thể tự chấm.");
      return;
    }

    const unansweredCount = activity.questions.filter(
      (question) =>
        isPracticeQuestionAutoGraded(question) && !isQuestionAnswered(question),
    ).length;
    if (unansweredCount > 0) {
      setMessage("Con còn câu chưa trả lời. Hãy hoàn thành rồi nộp bài.");
      return;
    }

    setIsSubmitting(true);
    setMessage("Đang nộp bài để hệ thống chấm điểm.");

    try {
      const cpParam = childProfileId
        ? `?childProfileId=${encodeURIComponent(childProfileId)}`
        : "";
      const response = await fetch(
        `${apiBaseUrl}/v1/learning/activities/${activity.id}/attempts${cpParam}`,
        {
          method: "POST",
          headers: {
            ...authHeaders,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            responses,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(
          friendlyLearningError(
            await readApiError(response, "Không thể nộp bài luyện tập."),
          ),
        );
      }

      const data = (await response.json()) as PracticeAttemptResult;
      const percent = practiceResultPercent(data);
      const requiredScore = requiredPracticeScoreForPlan(
        planContext,
        lessonId,
        activity,
      );
      let refreshedItem: LearningPersistentDailyPlanItem | null = null;
      let refreshedContext: ActivePracticePlanContext | null = null;
      let dailyPlanRefreshed = false;
      try {
        if (childProfileId && lessonId) {
          const refreshedHome = await fetchLearningHomePayload(
            childProfileId,
            authHeaders,
          );
          refreshedItem = findPracticeDailyPlanItem(refreshedHome, {
            activityId: activity.id,
            itemId: planContext?.itemId,
            lessonId,
          });
          refreshedContext = refreshedItem
            ? (practicePlanContextFromItem(refreshedItem) ?? null)
            : null;
          setRefreshedPracticeContext(refreshedContext);
          setPlanRefreshMessage(
            practiceDailyPlanRefreshMessage({
              context: refreshedContext,
              item: refreshedItem,
              percent,
              requiredScore,
              refreshed: true,
            }),
          );
          onDailyPlanRefresh?.({
            context: refreshedContext,
            home: refreshedHome,
            item: refreshedItem,
          });
          dailyPlanRefreshed = true;
        } else {
          setPlanRefreshMessage(
            "Đã nộp bài, nhưng chưa có hồ sơ con để cập nhật kế hoạch hôm nay.",
          );
        }
      } catch (refreshError) {
        setPlanRefreshMessage(
          refreshError instanceof Error
            ? `Đã nộp bài, nhưng chưa cập nhật được kế hoạch hôm nay: ${refreshError.message}`
            : "Đã nộp bài, nhưng chưa cập nhật được kế hoạch hôm nay.",
        );
      }
      setResult(data);
      const refreshSuffix = dailyPlanRefreshed
        ? " Kế hoạch hôm nay đã được cập nhật."
        : " Kế hoạch hôm nay chưa cập nhật được; " +
          "kết quả bài làm vẫn đã được chấm.";
      setMessage(
        percent >= requiredScore
          ? `Hệ thống đã chấm ${percent}%, đạt mốc ${requiredScore}%.${refreshSuffix}`
          : `Hệ thống đã chấm ${percent}%, cần ${requiredScore}% để hoàn thành ` +
              `việc học.${refreshSuffix}`,
      );
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Không thể nộp bài luyện tập.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function toggleChoice(
    questionId: string,
    answerId: string,
    multiple: boolean,
  ) {
    setSelectedAnswers((current) => {
      if (!multiple) {
        return { ...current, [questionId]: [answerId] };
      }

      const currentAnswers = current[questionId] ?? [];
      const nextAnswers = currentAnswers.includes(answerId)
        ? currentAnswers.filter((item) => item !== answerId)
        : [...currentAnswers, answerId];

      return { ...current, [questionId]: nextAnswers };
    });
  }

  function orderedAnswerIdsFor(question: PracticeQuestion) {
    const current = orderedAnswers[question.id];
    return current?.length
      ? current
      : question.answers.map((answer) => answer.id);
  }

  function moveOrderedAnswer(
    question: PracticeQuestion,
    index: number,
    delta: number,
  ) {
    const current = orderedAnswerIdsFor(question);
    const nextIndex = index + delta;
    if (nextIndex < 0 || nextIndex >= current.length) {
      return;
    }

    const next = [...current];
    [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
    setOrderedAnswers((state) => ({ ...state, [question.id]: next }));
  }

  function isQuestionAnswered(question: PracticeQuestion) {
    if (!isPracticeQuestionAutoGraded(question)) {
      return false;
    }

    if (question.type === "TEXT_INPUT") {
      return Boolean(textAnswers[question.id]?.trim());
    }

    if (question.type === "ORDERING") {
      return orderedAnswerIdsFor(question).length === question.answers.length;
    }

    return (selectedAnswers[question.id] ?? []).length > 0;
  }

  function resetPracticeRun() {
    setActiveQuestionIndex(0);
    setSelectedAnswers({});
    setTextAnswers({});
    setOrderedAnswers({});
    setResult(null);
    setPlanRefreshMessage("");
    setMessage("Làm lại từ đầu rồi nộp để hệ thống chấm điểm mới.");

    if (lessonId) {
      try {
        window.localStorage.removeItem(
          practiceDraftStorageKey(childProfileId, lessonId),
        );
      } catch {
        // Storage may be unavailable in a private browser session.
      }
    }
  }

  function selectPracticeActivity(activityId: string) {
    const activity = practice?.activities.find(
      (item) => item.id === activityId,
    );
    if (!activity || activity.id === activeActivityId) {
      return;
    }

    setActiveActivityId(activity.id);
    setActiveQuestionIndex(0);
    setResult(null);
    setRefreshedPracticeContext(null);
    setPlanRefreshMessage("");
    setMessage(
      `Đang làm phần ${activity.title}. Bài làm nháp vẫn được giữ lại.`,
    );
  }

  const activity =
    practice?.activities.find((item) => item.id === activeActivityId) ??
    practice?.activities[0];
  const candidatePracticeContext = refreshedPracticeContext ?? planContext;
  const practiceContext =
    candidatePracticeContext &&
    candidatePracticeContext.lessonId === lessonId &&
    (!activity ||
      !candidatePracticeContext.activityId ||
      candidatePracticeContext.activityId === activity.id)
      ? candidatePracticeContext
      : null;
  const requiredPracticeScore = requiredPracticeScoreForPlan(
    practiceContext,
    lessonId,
    activity,
  );
  const answerableQuestions =
    activity?.questions.filter(isPracticeQuestionAutoGraded) ?? [];
  const answeredCount =
    activity?.questions.filter(isQuestionAnswered).length ?? 0;
  const totalQuestions = activity?.questions.length ?? 0;
  const resultPercent = result ? practiceResultPercent(result) : null;
  const backendEvidencePercent = practiceContext?.percent ?? null;
  const passedPractice =
    practiceContext?.passed === true ||
    (resultPercent !== null && resultPercent >= requiredPracticeScore);
  const earnedPracticeStars =
    resultPercent !== null
      ? practiceStarsForPercent(resultPercent, requiredPracticeScore)
      : practiceContext?.passed
        ? 2
        : 0;
  const submitDisabled =
    isSubmitting ||
    Boolean(result) ||
    !activity ||
    answerableQuestions.length === 0 ||
    answeredCount < answerableQuestions.length;

  return (
    <section
      className="mt-4 rounded-lg border border-slate-200 bg-white p-4 sm:p-5"
      id="student-practice-panel"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
            Luyện tập
          </p>
          <h2 className="mt-1 text-xl font-semibold">
            {activity?.title ?? "Phần luyện tập đang chuẩn bị"}
          </h2>
          <p className="mt-1 text-sm text-slate-500">{message}</p>
          {practice && activity && !result && (
            <p className="mt-2 text-xs font-medium text-teal-700">
              Bài làm nháp được tự động lưu trên thiết bị này; chỉ tính điểm sau
              khi nộp bài.
            </p>
          )}
        </div>
        <div className="grid min-w-full grid-cols-3 gap-2 sm:min-w-[300px]">
          {[
            [
              "Câu",
              `${answeredCount}/${answerableQuestions.length || totalQuestions || 0}`,
            ],
            ["Cần đạt", `${requiredPracticeScore}%`],
            ["Sao", `${earnedPracticeStars}/3`],
          ].map(([label, value]) => (
            <div
              className="rounded-lg bg-slate-100 p-3 text-center"
              key={label}
            >
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                {label}
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-950">
                {value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {practice && practice.activities.length > 1 && (
        <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Chọn phần luyện tập
          </p>
          <div
            aria-label="Chọn phần luyện tập"
            className="mt-2 flex max-w-full gap-2 overflow-auto"
            role="tablist"
          >
            {practice.activities.map((item, index) => {
              const selected = item.id === activity?.id;
              return (
                <button
                  aria-controls="practice-question-card"
                  aria-selected={selected}
                  className={`h-9 whitespace-nowrap rounded-lg px-3 text-sm font-medium ${
                    selected
                      ? "bg-slate-950 text-white"
                      : "bg-white text-slate-700 ring-1 ring-slate-200"
                  }`}
                  key={item.id}
                  onClick={() => selectPracticeActivity(item.id)}
                  role="tab"
                  type="button"
                >
                  Phần {index + 1}: {item.title}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {practiceContext && (
        <div className="mt-4 rounded-lg border border-sky-200 bg-sky-50 p-3 text-sm text-sky-950">
          <div className="flex items-start gap-2">
            <Sparkles className="mt-0.5 shrink-0 text-sky-700" size={16} />
            <div>
              <p className="font-semibold">
                Kế hoạch hôm nay đang theo dõi bài này.
              </p>
              <p className="mt-1">
                {backendEvidencePercent !== null
                  ? `Kết quả đã cập nhật: ${backendEvidencePercent}%, mốc cần đạt ${requiredPracticeScore}%.`
                  : resultPercent !== null
                    ? `Bài vừa nộp đạt ${resultPercent}%, đang chờ kế hoạch hôm nay cập nhật.`
                    : `Chưa có bài đã nộp; cần đạt ${requiredPracticeScore}% để hoàn thành.`}
              </p>
              <p className="mt-1 text-sky-800">
                {practiceDailyPlanContextMessage(practiceContext)}
              </p>
              {practiceContext.blockedReason && (
                <p className="mt-1 text-sky-800">
                  {blockedPlanMessage(practiceContext.blockedReason)}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {result && (
        <div
          className={`mt-4 rounded-lg border p-4 ${
            passedPractice
              ? "border-teal-200 bg-teal-50 text-teal-950"
              : "border-amber-200 bg-amber-50 text-amber-950"
          }`}
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold">
                {passedPractice
                  ? "Giỏi quá, đã đạt mốc!"
                  : "Sắp đạt rồi, làm lại nhé."}
              </p>
              <p className="mt-1 text-sm">
                Điểm hệ thống chấm: {result.score}/{result.maxScore} (
                {resultPercent}%), mốc cần đạt {requiredPracticeScore}%.
              </p>
            </div>
            <div
              aria-label={`Đạt ${earnedPracticeStars} trên 3 sao`}
              className="flex gap-1"
            >
              {[0, 1, 2].map((index) => (
                <span
                  className={practiceStarClass(index, earnedPracticeStars)}
                  key={index}
                >
                  <Sparkles size={15} />
                </span>
              ))}
            </div>
          </div>
          <p className="mt-2 text-sm">
            {planRefreshMessage ||
              practiceDailyPlanRefreshMessage({
                context: practiceContext,
                item: null,
                percent: resultPercent ?? 0,
                requiredScore: requiredPracticeScore,
                refreshed: false,
              })}
          </p>
        </div>
      )}

      {activity ? (
        <div className="mt-5 space-y-4">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Tiến độ trả lời</span>
              <span>
                {answerableQuestions.length > 0
                  ? `${Math.round((answeredCount / answerableQuestions.length) * 100)}%`
                  : "0%"}
              </span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-slate-100">
              <div
                className="h-2 rounded-full bg-teal-600"
                style={{
                  width:
                    answerableQuestions.length > 0
                      ? `${Math.round((answeredCount / answerableQuestions.length) * 100)}%`
                      : "0%",
                }}
              />
            </div>
          </div>

          {activity.questions
            .slice(activeQuestionIndex, activeQuestionIndex + 1)
            .map((question) => {
              const questionIndex = activeQuestionIndex;
              const response = result?.responses.find(
                (item) => item.questionId === question.id,
              );
              const answered = isQuestionAnswered(question);
              const imageUrl = practiceMediaUrl(question, [
                "imageUrl",
                "promptImageUrl",
                "image",
                "promptImage",
              ]);
              const audioUrl = practiceMediaUrl(question, [
                "audioUrl",
                "promptAudioUrl",
                "audio",
                "promptAudio",
              ]);
              const unsupported = !isPracticeQuestionAutoGraded(question);

              return (
                <div
                  className={`rounded-lg border p-4 ${
                    response
                      ? response.isCorrect
                        ? "border-teal-200 bg-teal-50"
                        : "border-amber-200 bg-amber-50"
                      : answered
                        ? "border-sky-200 bg-sky-50"
                        : "border-slate-200 bg-white"
                  }`}
                  id="practice-question-card"
                  key={question.id}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                      Câu {questionIndex + 1}/{totalQuestions}
                    </span>
                    <span className="text-xs font-medium text-slate-500">
                      {question.points} điểm
                    </span>
                  </div>
                  <p className="mt-3 text-base font-semibold leading-6 text-slate-950">
                    {question.prompt}
                  </p>

                  {(imageUrl || audioUrl) && (
                    <div className="mt-3 grid gap-3 md:grid-cols-[1fr_auto]">
                      {imageUrl && (
                        <div
                          aria-label="Hình minh họa câu hỏi"
                          className="min-h-40 rounded-lg border border-slate-200 bg-slate-100 bg-contain bg-center bg-no-repeat"
                          style={{ backgroundImage: `url(${imageUrl})` }}
                        />
                      )}
                      {audioUrl && (
                        <audio
                          className="w-full min-w-64"
                          controls
                          preload="none"
                          src={audioUrl}
                        />
                      )}
                    </div>
                  )}

                  {unsupported ? (
                    <p className="mt-3 rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-600">
                      Dạng câu hỏi này chưa hỗ trợ tự chấm trong MVP luyện tập.
                    </p>
                  ) : question.type === "TEXT_INPUT" ? (
                    <textarea
                      className="mt-3 min-h-24 w-full resize-y rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-500"
                      disabled={Boolean(result)}
                      onChange={(event) =>
                        setTextAnswers((current) => ({
                          ...current,
                          [question.id]: event.target.value,
                        }))
                      }
                      placeholder="Gõ câu trả lời của con"
                      value={textAnswers[question.id] ?? ""}
                    />
                  ) : question.type === "ORDERING" ? (
                    <div className="mt-3 space-y-2">
                      {orderedAnswerIdsFor(question).map(
                        (answerId, answerIndex) => {
                          const answer = question.answers.find(
                            (item) => item.id === answerId,
                          );
                          if (!answer) {
                            return null;
                          }

                          return (
                            <div
                              className="flex min-h-12 items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 text-sm"
                              key={answer.id}
                            >
                              <span>{answer.text}</span>
                              <span className="flex gap-1">
                                <button
                                  aria-label="Đưa đáp án lên"
                                  className="grid size-8 place-items-center rounded-lg border border-slate-200 disabled:opacity-40"
                                  disabled={
                                    Boolean(result) || answerIndex === 0
                                  }
                                  onClick={() =>
                                    moveOrderedAnswer(question, answerIndex, -1)
                                  }
                                  type="button"
                                >
                                  <ArrowUp size={16} />
                                </button>
                                <button
                                  aria-label="Đưa đáp án xuống"
                                  className="grid size-8 place-items-center rounded-lg border border-slate-200 disabled:opacity-40"
                                  disabled={
                                    Boolean(result) ||
                                    answerIndex === question.answers.length - 1
                                  }
                                  onClick={() =>
                                    moveOrderedAnswer(question, answerIndex, 1)
                                  }
                                  type="button"
                                >
                                  <ArrowDown size={16} />
                                </button>
                              </span>
                            </div>
                          );
                        },
                      )}
                    </div>
                  ) : (
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      {question.answers.map((answer) => {
                        const isMultiple = question.type === "MULTIPLE_CHOICE";
                        const checked = (
                          selectedAnswers[question.id] ?? []
                        ).includes(answer.id);

                        return (
                          <button
                            aria-pressed={checked}
                            className={practiceAnswerClass(checked)}
                            disabled={Boolean(result)}
                            key={answer.id}
                            onClick={() =>
                              toggleChoice(question.id, answer.id, isMultiple)
                            }
                            type="button"
                          >
                            <span className="grid size-6 shrink-0 place-items-center rounded-full border border-current text-xs font-semibold">
                              {checked ? "✓" : ""}
                            </span>
                            {answer.text}
                          </button>
                        );
                      })}
                    </div>
                  )}
                  {response && (
                    <p
                      className={`mt-3 rounded-lg px-3 py-2 text-sm ${
                        response.isCorrect ? "text-teal-700" : "text-rose-700"
                      }`}
                    >
                      {practiceFeedbackText(response)}
                    </p>
                  )}
                </div>
              );
            })}

          <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              aria-label="Câu trước"
              className="flex h-9 items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 disabled:opacity-40"
              disabled={activeQuestionIndex === 0}
              onClick={() =>
                setActiveQuestionIndex((index) => Math.max(0, index - 1))
              }
              type="button"
            >
              <ArrowLeft size={16} />
              Câu trước
            </button>
            <div
              aria-label="Điều hướng câu hỏi"
              className="flex max-w-full gap-1 overflow-auto"
              role="tablist"
            >
              {activity.questions.map((question, index) => {
                const isActive = index === activeQuestionIndex;
                const isAnswered = isQuestionAnswered(question);
                return (
                  <button
                    aria-label={`Câu ${index + 1}${isAnswered ? ", đã trả lời" : ""}`}
                    aria-selected={isActive}
                    className={`grid size-9 shrink-0 place-items-center rounded-lg text-sm font-bold ${
                      isActive
                        ? "bg-slate-950 text-white"
                        : isAnswered
                          ? "bg-teal-100 text-teal-800"
                          : "bg-white text-slate-600 ring-1 ring-slate-200"
                    }`}
                    key={question.id}
                    onClick={() => setActiveQuestionIndex(index)}
                    role="tab"
                    type="button"
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
            <button
              aria-label="Câu tiếp theo"
              className="flex h-9 items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 disabled:opacity-40"
              disabled={activeQuestionIndex >= totalQuestions - 1}
              onClick={() =>
                setActiveQuestionIndex((index) =>
                  Math.min(Math.max(totalQuestions - 1, 0), index + 1),
                )
              }
              type="button"
            >
              Câu tiếp
              <ArrowRight size={16} />
            </button>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-slate-500">
              {result
                ? "Kết quả hiển thị sau khi hệ thống chấm bài."
                : submitDisabled
                  ? "Trả lời đủ câu hỏi tự chấm để nộp bài."
                  : "Sẵn sàng nộp bài để hệ thống chấm."}
            </div>
            <div className="flex flex-wrap gap-2">
              {result && (
                <button
                  className="flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 text-sm font-medium text-slate-700"
                  onClick={resetPracticeRun}
                  type="button"
                >
                  <RotateCcw size={17} />
                  Làm lại
                </button>
              )}
              <button
                className="flex h-10 items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-medium text-white disabled:opacity-60"
                disabled={submitDisabled}
                onClick={() => void submitPractice()}
                type="button"
              >
                <CheckCircle2 size={18} />
                {isSubmitting ? "Đang nộp" : result ? "Đã nộp" : "Nộp bài"}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <p className="mt-4 rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-500">
          Chọn bài học từ Học hôm nay hoặc Video để mở phần luyện tập.
        </p>
      )}
    </section>
  );
}

function isPracticeQuestionAutoGraded(question: PracticeQuestion) {
  return (
    question.type === "SINGLE_CHOICE" ||
    question.type === "MULTIPLE_CHOICE" ||
    question.type === "TEXT_INPUT" ||
    question.type === "ORDERING"
  );
}

function requiredPracticeScoreForPlan(
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

function practiceResultPercent(
  result: Pick<PracticeAttemptResult, "score" | "maxScore">,
) {
  return result.maxScore > 0
    ? Math.round((result.score / result.maxScore) * 100)
    : 0;
}

function practiceStarsForPercent(percent: number, requiredPercent: number) {
  if (percent >= Math.max(95, requiredPercent)) return 3;
  if (percent >= requiredPercent) return 2;
  if (percent > 0) return 1;
  return 0;
}

function practiceStarClass(index: number, earnedStars: number) {
  return `grid size-9 place-items-center rounded-lg ${
    index < earnedStars
      ? "bg-amber-200 text-amber-800"
      : "bg-white/70 text-slate-400"
  }`;
}

function practiceAnswerClass(checked: boolean) {
  return `flex min-h-12 items-center gap-3 rounded-lg border px-3 text-left text-sm font-medium transition disabled:cursor-default ${
    checked
      ? "border-teal-500 bg-teal-50 text-teal-950"
      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
  }`;
}

function practiceFeedbackText(
  response: PracticeAttemptResult["responses"][number],
) {
  if (response.isCorrect) return "Đúng. Hệ thống đã ghi nhận câu này.";
  return response.feedback ?? "Chưa đúng. Con xem lại bài rồi làm lại nhé.";
}

function practiceMediaUrl(question: PracticeQuestion, keys: string[]) {
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
