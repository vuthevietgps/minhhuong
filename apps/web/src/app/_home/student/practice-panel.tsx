"use client";

import { Sparkles } from "lucide-react";
import type { ActivePracticePlanContext, PracticeDailyPlanRefresh, Session } from "../types";
import { blockedPlanMessage } from "./learning-plan";
import { practiceDailyPlanContextMessage } from "./practice/helpers";
import { useStudentPracticePanelState } from "./practice/use-student-practice-panel-state";
import { PracticeResultCard } from "./practice/practice-result-card";
import { PracticeActivityForm } from "./practice/practice-activity-form";

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
  const state = useStudentPracticePanelState({ childProfileId, lessonId, onDailyPlanRefresh, planContext, session });
  const {
    activity,
    answerableQuestions,
    answeredCount,
    backendEvidencePercent,
    earnedPracticeStars,
    message,
    practice,
    practiceContext,
    requiredPracticeScore,
    result,
    resultPercent,
    selectPracticeActivity,
    totalQuestions,
  } = state;
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

      <PracticeResultCard {...state} />

      <PracticeActivityForm {...state} />
    </section>
  );
}
