"use client";

import { formatDate } from "../../lib/format";
import type { ActivationOrdersPanelState } from "./use-activation-orders-panel-state";

/** Free trial lookup and extension for sale/operations staff. */
export function FreeTrialExtensionCard(state: ActivationOrdersPanelState) {
  const {
    canExtendTrial,
    extendTrial,
    isLoading,
    setTrialExtensionDays,
    trialExtensionDays,
    trials,
  } = state;
  if (!canExtendTrial) return null;
  return (
    <div className="mt-4 rounded-xl border border-violet-200 bg-violet-50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-bold text-violet-950">
            Quản lý dùng thử
          </p>
          <p className="mt-1 text-xs text-violet-800">
            Vận hành và giám đốc chỉ có thể gia hạn tối đa 15 ngày tính từ
            lúc bắt đầu trial.
          </p>
        </div>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-violet-800">
          {trials.filter((trial) => trial.status === "TRIALING").length}{" "}
          đang dùng thử
        </span>
      </div>
      <div className="mt-3 grid gap-2">
        {trials.map((trial) => (
          <div
            className="grid gap-2 rounded-lg border border-violet-100 bg-white p-3 lg:grid-cols-[minmax(0,1fr)_auto_auto] lg:items-center"
            key={trial.id}
          >
            <div>
              <p className="text-sm font-semibold text-slate-900">
                {trial.childName} ·{" "}
                {trial.parent.displayName ?? trial.parent.email}
              </p>
              <p className="mt-1 text-xs text-slate-600">
                {trial.status === "TRIALING"
                  ? "Đang dùng thử"
                  : "Đã hết hạn"}{" "}
                · hết hạn {formatDate(trial.endsAt)} · báo cáo{" "}
                {trial.report.available
                  ? "đã mở"
                  : "mở từ ngày " +
                    formatDate(trial.report.availableAt ?? trial.endsAt)}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Đánh giá {trial.usage.initialAssessments}/
                {trial.limits.initialAssessments} · bài học{" "}
                {trial.usage.lessons}/{trial.limits.lessons} · AI{" "}
                {trial.usage.aiResponses}/{trial.limits.aiResponses}
              </p>
            </div>
            <input
              className="h-9 w-24 rounded-lg border border-violet-200 px-2 text-sm"
              disabled={isLoading || !trial.canExtend}
              max="15"
              min="1"
              onChange={(event) =>
                setTrialExtensionDays((current) => ({
                  ...current,
                  [trial.id]: event.target.value,
                }))
              }
              placeholder="Ngày"
              type="number"
              value={trialExtensionDays[trial.id] ?? "1"}
            />
            <button
              className="h-9 rounded-lg bg-violet-700 px-3 text-xs font-semibold text-white disabled:opacity-60"
              disabled={isLoading || !trial.canExtend}
              onClick={() => void extendTrial(trial.id)}
              type="button"
            >
              Gia hạn trial
            </button>
          </div>
        ))}
        {trials.length === 0 && (
          <p className="rounded-lg bg-white p-3 text-sm text-slate-500">
            Chưa có tài khoản dùng thử.
          </p>
        )}
      </div>
    </div>
  );
}
