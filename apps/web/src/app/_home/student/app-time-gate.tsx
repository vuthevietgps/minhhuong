"use client";

import { LockKeyhole } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { apiBaseUrl } from "../lib/api";

type AppSessionStatus = {
  isEnabled: boolean;
  allowed: boolean;
  sessionId: string | null;
  sessionLimitMinutes: number | null;
  dailyLimitMinutes: number | null;
  breakMinutes: number | null;
  activeSeconds: number;
  remainingSessionSeconds: number | null;
  warning: "FIVE_MINUTES" | "THREE_MINUTES" | null;
  breakUntil: string | null;
  breakRemainingSeconds: number;
};

export function StudentAppTimeGate({
  accessToken,
  childProfileId,
}: {
  accessToken: string;
  childProfileId: string;
}) {
  const [status, setStatus] = useState<AppSessionStatus | null>(null);
  const sessionIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!childProfileId) return;
    const storageKey = "mhe_screen_time_device";
    const existing = window.localStorage.getItem(storageKey);
    const deviceKey =
      existing ||
      (window.crypto?.randomUUID?.() ??
        `browser-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    window.localStorage.setItem(storageKey, deviceKey);

    let cancelled = false;
    const beat = async () => {
      try {
        const response = await fetch(
          `${apiBaseUrl}/v1/learning/usage/heartbeat?childProfileId=${encodeURIComponent(childProfileId)}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              deviceKey,
              ...(sessionIdRef.current
                ? { sessionId: sessionIdRef.current }
                : {}),
            }),
          },
        );
        if (!response.ok || cancelled) return;
        const next = (await response.json()) as AppSessionStatus;
        sessionIdRef.current = next.sessionId;
        setStatus(next);
      } catch {
        // Other protected API endpoints still enforce an active break.
      }
    };

    void beat();
    const heartbeatTimer = window.setInterval(() => void beat(), 15_000);
    return () => {
      cancelled = true;
      window.clearInterval(heartbeatTimer);
    };
  }, [accessToken, childProfileId]);

  useEffect(() => {
    if (!status?.isEnabled) return;
    const timer = window.setInterval(() => {
      setStatus((current) => {
        if (!current) return current;
        if (!current.allowed) {
          return {
            ...current,
            breakRemainingSeconds: Math.max(
              0,
              current.breakRemainingSeconds - 1,
            ),
          };
        }
        const remaining =
          current.remainingSessionSeconds === null
            ? null
            : Math.max(0, current.remainingSessionSeconds - 1);
        return {
          ...current,
          remainingSessionSeconds: remaining,
          warning:
            remaining !== null && remaining > 0 && remaining <= 180
              ? "THREE_MINUTES"
              : remaining !== null && remaining > 0 && remaining <= 300
                ? "FIVE_MINUTES"
                : null,
        };
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [status?.isEnabled]);

  if (!status?.isEnabled) return null;

  if (!status.allowed) {
    const minutes = Math.floor(status.breakRemainingSeconds / 60);
    const seconds = status.breakRemainingSeconds % 60;
    return createPortal(
      <div className="fixed inset-0 z-[120] grid place-items-center bg-slate-950/95 p-5 text-center text-white">
        <div className="max-w-lg rounded-3xl border border-white/15 bg-white/10 p-7 shadow-2xl backdrop-blur">
          <div className="mx-auto grid size-16 place-items-center rounded-full bg-amber-300 text-slate-950">
            <LockKeyhole size={30} />
          </div>
          <h2 className="mt-5 text-2xl font-extrabold">Đến giờ nghỉ rồi</h2>
          <p className="mt-3 leading-7 text-slate-200">
            Con đã hoàn thành phiên học {status.sessionLimitMinutes} phút. Hãy
            rời màn hình, vận động và cho mắt nghỉ ngơi.
          </p>
          <p className="mt-5 text-4xl font-black tabular-nums text-amber-300">
            {minutes}:{String(seconds).padStart(2, "0")}
          </p>
          <p className="mt-2 text-sm text-slate-300">
            Ứng dụng sẽ tự mở lại sau thời gian nghỉ do phụ huynh cài đặt.
          </p>
        </div>
      </div>,
      document.body,
    );
  }

  if (status.warning && status.remainingSessionSeconds !== null) {
    const minutes = Math.ceil(status.remainingSessionSeconds / 60);
    return createPortal(
      <div
        aria-live="assertive"
        className="fixed left-1/2 top-4 z-[110] w-[min(92vw,520px)] -translate-x-1/2 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-center font-bold text-amber-950 shadow-xl"
        role="alert"
      >
        Còn {minutes} phút trước khi ứng dụng chuyển sang giờ nghỉ.
      </div>,
      document.body,
    );
  }
  return null;
}
