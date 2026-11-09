"use client";

import { Settings, Users } from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { apiBaseUrl, readApiError } from "../lib/api";
import { formatDate, formatStudyMinutes } from "../lib/format";
import type { ParentChild, ParentChildrenPayload, Session } from "../types";

export function ParentChildrenPanel({
  onSwitchToBilling,
  onSwitchToFamily,
  session,
}: {
  onSwitchToBilling: () => void;
  onSwitchToFamily: () => void;
  session: Session;
}) {
  const [children, setChildren] = useState<ParentChild[]>([]);
  const [limits, setLimits] = useState<Record<string, string>>({});
  const [sessionLimits, setSessionLimits] = useState<Record<string, string>>(
    {},
  );
  const [breakLimits, setBreakLimits] = useState<Record<string, string>>({});
  const [enabled, setEnabled] = useState<Record<string, boolean>>({});
  const [message, setMessage] = useState("Đang tải dữ liệu học tập của con.");
  const [savingChildId, setSavingChildId] = useState<string | null>(null);
  const [grantingChildId, setGrantingChildId] = useState<string | null>(null);

  const authHeaders = useMemo(
    () => ({ Authorization: `Bearer ${session.accessToken}` }),
    [session.accessToken],
  );

  const loadChildren = useCallback(async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/v1/parent/children`, {
        headers: authHeaders,
      });
      if (!response.ok) {
        throw new Error(
          await readApiError(response, "Không thể tải danh sách học sinh."),
        );
      }

      const data = (await response.json()) as ParentChildrenPayload;
      setChildren(data.children);
      setLimits(
        Object.fromEntries(
          data.children.map((child) => [
            child.id,
            String(child.screenTime.dailyLimitMinutes),
          ]),
        ),
      );
      setSessionLimits(
        Object.fromEntries(
          data.children.map((child) => [
            child.id,
            String(child.screenTime.sessionLimitMinutes),
          ]),
        ),
      );
      setBreakLimits(
        Object.fromEntries(
          data.children.map((child) => [
            child.id,
            String(child.screenTime.breakMinutes),
          ]),
        ),
      );
      setEnabled(
        Object.fromEntries(
          data.children.map((child) => [child.id, child.screenTime.isEnabled]),
        ),
      );
      setMessage(
        data.children.length > 0
          ? "Xem tiến độ học và cài đặt thiết bị hàng ngày."
          : "no-children",
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Không thể tải danh sách học sinh.",
      );
    }
  }, [authHeaders]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadChildren();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadChildren]);

  async function saveScreenTime(child: ParentChild) {
    const limit = Number(limits[child.id]);
    const sessionLimit = Number(sessionLimits[child.id]);
    const breakLimit = Number(breakLimits[child.id]);

    if (!Number.isInteger(limit) || limit < 10 || limit > 240) {
      setMessage("Số phút/ngày phải từ 10 đến 240 phút.");
      return;
    }
    if (
      !Number.isInteger(sessionLimit) ||
      sessionLimit < 5 ||
      sessionLimit > 120
    ) {
      setMessage("Mỗi phiên sử dụng phải từ 5 đến 120 phút.");
      return;
    }
    if (!Number.isInteger(breakLimit) || breakLimit < 10 || breakLimit > 120) {
      setMessage("Thời gian nghỉ phải từ 10 đến 120 phút.");
      return;
    }

    setSavingChildId(child.id);
    try {
      const response = await fetch(
        `${apiBaseUrl}/v1/parent/children/${child.id}/screen-time`,
        {
          method: "PATCH",
          headers: {
            ...authHeaders,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            isEnabled: enabled[child.id] ?? false,
            dailyLimitMinutes: limit,
            sessionLimitMinutes: sessionLimit,
            breakMinutes: breakLimit,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(
          await readApiError(response, "Không thể lưu giới hạn thời gian học."),
        );
      }

      const screenTime = (await response.json()) as ParentChild["screenTime"];
      setChildren((current) =>
        current.map((item) =>
          item.id === child.id ? { ...item, screenTime } : item,
        ),
      );
      setLimits((current) => ({ ...current, [child.id]: String(limit) }));
      setSessionLimits((current) => ({
        ...current,
        [child.id]: String(screenTime.sessionLimitMinutes),
      }));
      setBreakLimits((current) => ({
        ...current,
        [child.id]: String(screenTime.breakMinutes),
      }));
      setEnabled((current) => ({
        ...current,
        [child.id]: screenTime.isEnabled,
      }));
      setMessage(`Đã lưu giới hạn thời gian học cho ${child.displayName}.`);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Không thể lưu giới hạn thời gian học.",
      );
    } finally {
      setSavingChildId(null);
    }
  }

  async function grantExtraDeviceTime(
    child: ParentChild,
    extraMinutes: number,
  ) {
    setGrantingChildId(child.id);
    try {
      const response = await fetch(
        `${apiBaseUrl}/v1/parent/children/${child.id}/device-time-grants`,
        {
          method: "POST",
          headers: {
            ...authHeaders,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            extraMinutes,
            note: "Cộng thêm từ phụ huynh",
          }),
        },
      );

      if (!response.ok) {
        throw new Error(
          await readApiError(
            response,
            "Không thể cộng thêm thời gian thiết bị.",
          ),
        );
      }

      setMessage(`Đã cộng ${extraMinutes} phút cho ${child.displayName}.`);
      await loadChildren();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Không thể cộng thêm thời gian thiết bị.",
      );
    } finally {
      setGrantingChildId(null);
    }
  }

  return (
    <section className="mt-4 rounded-lg border border-slate-200 bg-white p-4 sm:p-5">
      <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
            Theo dõi học tập
          </p>
          <h2 className="mt-1 text-xl font-semibold">
            Tiến độ và thời gian học
          </h2>
          {message === "no-children" ? (
            <p className="mt-1 text-sm text-slate-500">
              Chưa có hồ sơ con nào.{" "}
              <button
                className="font-medium text-teal-700 hover:underline"
                onClick={onSwitchToFamily}
                type="button"
              >
                Thêm hồ sơ con ngay →
              </button>
            </p>
          ) : (
            <p className="mt-1 text-sm text-slate-500">{message}</p>
          )}
        </div>
        <Users className="text-slate-500" size={22} />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        {children.map((child) => {
          const childLimit =
            limits[child.id] ?? String(child.screenTime.dailyLimitMinutes);
          const childEnabled = enabled[child.id] ?? child.screenTime.isEnabled;
          const childSessionLimit =
            sessionLimits[child.id] ??
            String(child.screenTime.sessionLimitMinutes);
          const childBreakLimit =
            breakLimits[child.id] ?? String(child.screenTime.breakMinutes);
          const completionRate = Math.min(
            100,
            Math.max(0, child.progress.completionRate),
          );

          return (
            <article
              className="rounded-lg border border-slate-200 p-4"
              key={child.id}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-base font-semibold">{child.displayName}</p>
                  {child.subscription && (
                    <p className="mt-1 text-sm text-slate-500">
                      {child.subscription.status === "ACTIVE"
                        ? "Gói đang hoạt động"
                        : child.subscription.status === "TRIALING"
                          ? "Đang dùng thử"
                          : child.subscription.status}
                    </p>
                  )}
                  {!child.subscription && (
                    <button
                      className="mt-1 rounded-md bg-teal-600 px-3 py-1 text-xs font-semibold text-white hover:bg-teal-700"
                      onClick={onSwitchToBilling}
                      type="button"
                    >
                      Mua gói học →
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {[
                  [
                    "Tuần này",
                    formatStudyMinutes(child.progress.weeklyStudyMinutes),
                  ],
                  [
                    "Học hôm nay",
                    formatStudyMinutes(child.deviceUsage.usedMinutes),
                  ],
                  [
                    "Còn lại",
                    child.deviceUsage.remainingMinutes === null
                      ? "Không giới hạn"
                      : formatStudyMinutes(child.deviceUsage.remainingMinutes),
                  ],
                  ["Hoàn thành", String(child.progress.completedLessons)],
                ].map(([label, value]) => (
                  <div className="rounded-lg bg-slate-100 p-3" key={label}>
                    <p className="text-xs text-slate-500">{label}</p>
                    <p className="mt-1 text-sm font-semibold">{value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Tiến độ bài học</span>
                  <span>{completionRate}%</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full bg-teal-600"
                    style={{ width: `${completionRate}%` }}
                  />
                </div>
              </div>

              <div className="mt-4 rounded-lg bg-teal-50 p-3">
                <p className="text-sm font-semibold text-teal-950">
                  {child.insight.title}
                </p>
                <p className="mt-1 text-xs leading-5 text-teal-900">
                  {child.insight.description}
                </p>
                <p className="mt-2 text-xs font-medium text-teal-950">
                  {child.insight.recommendedAction}
                </p>
              </div>

              <div className="mt-4 rounded-lg border border-slate-200 p-3">
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4 xl:items-end">
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <input
                      checked={childEnabled}
                      className="size-4"
                      onChange={(event) =>
                        setEnabled((current) => ({
                          ...current,
                          [child.id]: event.target.checked,
                        }))
                      }
                      type="checkbox"
                    />
                    Bật giới hạn thời gian học
                  </label>
                  <label className="text-sm font-medium text-slate-700">
                    Số phút mỗi phiên
                    <input
                      className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm"
                      max={120}
                      min={5}
                      onChange={(event) =>
                        setSessionLimits((current) => ({
                          ...current,
                          [child.id]: event.target.value,
                        }))
                      }
                      type="number"
                      value={childSessionLimit}
                    />
                  </label>
                  <label className="text-sm font-medium text-slate-700">
                    Nghỉ tối thiểu (phút)
                    <input
                      className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm"
                      max={120}
                      min={10}
                      onChange={(event) =>
                        setBreakLimits((current) => ({
                          ...current,
                          [child.id]: event.target.value,
                        }))
                      }
                      type="number"
                      value={childBreakLimit}
                    />
                  </label>
                  <label className="text-sm font-medium text-slate-700">
                    Số phút học tối đa/ngày
                    <input
                      className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm md:w-32"
                      max={240}
                      min={10}
                      onChange={(event) =>
                        setLimits((current) => ({
                          ...current,
                          [child.id]: event.target.value,
                        }))
                      }
                      type="number"
                      value={childLimit}
                    />
                  </label>
                  <button
                    className="flex h-10 items-center justify-center gap-2 rounded-lg bg-slate-950 px-3 text-sm font-medium text-white disabled:opacity-60"
                    disabled={savingChildId === child.id}
                    onClick={() => void saveScreenTime(child)}
                    type="button"
                  >
                    <Settings size={17} />
                    Lưu
                  </button>
                </div>
                <p className="mt-3 text-xs text-slate-500">
                  {child.screenTime.isEnabled
                    ? `${child.deviceUsage.limitMinutes ?? child.screenTime.dailyLimitMinutes} phút/ngày; mỗi phiên ${child.screenTime.sessionLimitMinutes} phút và nghỉ ít nhất ${child.screenTime.breakMinutes} phút.`
                    : "Giới hạn đang tắt."}
                  {child.deviceUsage.grantedExtraMinutes
                    ? ` Cộng thêm hôm nay: ${child.deviceUsage.grantedExtraMinutes} phút.`
                    : ""}
                  {child.deviceUsage.byDevice.length > 0
                    ? ` Hôm nay: ${child.deviceUsage.byDevice
                        .map(
                          (item) =>
                            `${item.deviceType.toLowerCase()} ${formatStudyMinutes(
                              item.usedMinutes,
                            )}`,
                        )
                        .join(", ")}.`
                    : " Chưa ghi nhận thời gian học hôm nay."}
                  {child.subscription
                    ? ` Gói học đến ngày ${formatDate(child.subscription.currentPeriodEnd)}.`
                    : " Chưa có gói học."}
                </p>
                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Giới hạn này áp dụng cho thời gian học được ghi nhận trong ứng
                  dụng, không khóa toàn bộ điện thoại của con.
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {[10, 15, 30].map((minutes) => (
                    <button
                      className="h-9 rounded-lg border border-teal-200 bg-teal-50 px-3 text-sm font-medium text-teal-900 disabled:opacity-50"
                      disabled={!childEnabled || grantingChildId === child.id}
                      key={minutes}
                      onClick={() => void grantExtraDeviceTime(child, minutes)}
                      type="button"
                    >
                      +{minutes} phút hôm nay
                    </button>
                  ))}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
