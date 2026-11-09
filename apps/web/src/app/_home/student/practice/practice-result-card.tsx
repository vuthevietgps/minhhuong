"use client";

import { Sparkles } from "lucide-react";
import { practiceDailyPlanRefreshMessage, practiceStarClass } from "./helpers";
import type { StudentPracticePanelState } from "./use-student-practice-panel-state";

/** Graded attempt result. */
export function PracticeResultCard(state: StudentPracticePanelState) {
  const {
    earnedPracticeStars,
    passedPractice,
    planRefreshMessage,
    practiceContext,
    requiredPracticeScore,
    result,
    resultPercent,
  } = state;
  if (!result) return null;
  return (
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
  );
}
