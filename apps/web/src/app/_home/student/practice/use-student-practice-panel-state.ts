import { useCallback, useEffect, useMemo, useState } from "react";
import { apiBaseUrl, readApiError } from "../../lib/api";
import type { ActivePracticePlanContext, LearningPersistentDailyPlanItem, PracticeDailyPlanRefresh, Session } from "../../types";
import { fetchLearningHomePayload, friendlyLearningError, practicePlanContextFromItem } from "../learning-plan";
import { findPracticeDailyPlanItem, isPracticeQuestionAutoGraded, practiceDailyPlanRefreshMessage, practiceDraftStorageKey, practiceResultPercent, practiceStarsForPercent, readPracticeDraft, requiredPracticeScoreForPlan } from "./helpers";
import type { PracticeAttemptResult, PracticeLesson, PracticeQuestion, PracticeSubmitResponse } from "./helpers";

/** State, effects and handlers of StudentPracticePanel, moved verbatim from practice-panel.tsx. */
export function useStudentPracticePanelState({
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

  return {
    childProfileId,
    lessonId,
    onDailyPlanRefresh,
    planContext,
    session,
    practice,
    setPractice,
    activeActivityId,
    setActiveActivityId,
    activeQuestionIndex,
    setActiveQuestionIndex,
    selectedAnswers,
    setSelectedAnswers,
    textAnswers,
    setTextAnswers,
    orderedAnswers,
    setOrderedAnswers,
    result,
    setResult,
    refreshedPracticeContext,
    setRefreshedPracticeContext,
    planRefreshMessage,
    setPlanRefreshMessage,
    message,
    setMessage,
    isSubmitting,
    setIsSubmitting,
    authHeaders,
    loadPractice,
    submitPractice,
    toggleChoice,
    orderedAnswerIdsFor,
    moveOrderedAnswer,
    isQuestionAnswered,
    resetPracticeRun,
    selectPracticeActivity,
    activity,
    candidatePracticeContext,
    practiceContext,
    requiredPracticeScore,
    answerableQuestions,
    answeredCount,
    totalQuestions,
    resultPercent,
    backendEvidencePercent,
    passedPractice,
    earnedPracticeStars,
    submitDisabled,
  };
}

export type StudentPracticePanelState = ReturnType<typeof useStudentPracticePanelState>;
