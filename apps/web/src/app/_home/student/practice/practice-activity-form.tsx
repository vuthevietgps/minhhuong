"use client";

import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, CheckCircle2, RotateCcw } from "lucide-react";
import { isPracticeQuestionAutoGraded, practiceAnswerClass, practiceFeedbackText, practiceMediaUrl } from "./helpers";
import type { StudentPracticePanelState } from "./use-student-practice-panel-state";

/** Questions, answers and submit for the current activity. */
export function PracticeActivityForm(state: StudentPracticePanelState) {
  const {
    activeQuestionIndex,
    activity,
    answerableQuestions,
    answeredCount,
    isQuestionAnswered,
    isSubmitting,
    moveOrderedAnswer,
    orderedAnswerIdsFor,
    resetPracticeRun,
    result,
    selectedAnswers,
    setActiveQuestionIndex,
    setTextAnswers,
    submitDisabled,
    submitPractice,
    textAnswers,
    toggleChoice,
    totalQuestions,
  } = state;
  return <>{activity ? (
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
  )}</>;
}
