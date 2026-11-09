"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { apiBaseUrl, readApiError } from "../lib/api";
import { StudentPracticePanel } from "../student/practice-panel";
import { StudentTodayPanel } from "../student/today-panel";
import { VideoImmersionPanel } from "../student/video-immersion-panel";
import type {
  ActiveLearningPlanContext,
  ActivePracticePlanContext,
  ActiveVideoPlanContext,
  ParentChild,
  ParentChildrenPayload,
  PracticeDailyPlanRefresh,
  Session,
} from "../types";
import { ParentDailyPlanComposer } from "./daily-plan-composer";

export function ParentChildLearningPanel({ session }: { session: Session }) {
  const [children, setChildren] = useState<ParentChild[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [activeLessonId, setActiveLessonId] = useState("");
  const [requestedLessonId, setRequestedLessonId] = useState("");
  const [activeVideoContext, setActiveVideoContext] =
    useState<ActiveVideoPlanContext | null>(null);
  const [activePracticeContext, setActivePracticeContext] =
    useState<ActivePracticePlanContext | null>(null);
  const [homeRefreshToken, setHomeRefreshToken] = useState(0);
  const [childrenLoading, setChildrenLoading] = useState(true);
  const [message, setMessage] = useState("Đang tải hồ sơ học sinh.");

  const authHeaders = useMemo(
    () => ({ Authorization: `Bearer ${session.accessToken}` }),
    [session.accessToken],
  );

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch(`${apiBaseUrl}/v1/parent/children`, {
          headers: authHeaders,
        });
        if (!res.ok) {
          throw new Error(
            await readApiError(res, "Không thể tải danh sách hồ sơ con."),
          );
        }

        const data = (await res.json()) as ParentChildrenPayload;
        setChildren(data.children);
        setSelectedChildId(
          (current) => current ?? data.children[0]?.id ?? null,
        );
        setMessage(
          data.children.length > 0
            ? "Chọn hồ sơ con để bắt đầu buổi học hôm nay."
            : "Chưa có hồ sơ học sinh. Hãy tạo hồ sơ con trước.",
        );
      } catch (error) {
        setMessage(
          error instanceof Error
            ? error.message
            : "Không thể tải danh sách hồ sơ con.",
        );
      } finally {
        setChildrenLoading(false);
      }
    })();
  }, [authHeaders]);

  const selectedChild =
    children.find((child) => child.id === selectedChildId) ?? null;

  const handleResume = useCallback(
    (
      lessonId: string,
      target: "video" | "practice" = "video",
      context?: ActiveLearningPlanContext,
    ) => {
      setRequestedLessonId(lessonId);
      setActiveLessonId(lessonId);
      setActiveVideoContext(context?.kind === "VIDEO" ? context : null);
      setActivePracticeContext(context?.kind === "PRACTICE" ? context : null);
      window.setTimeout(() => {
        document
          .getElementById(
            target === "practice"
              ? "student-practice-panel"
              : "student-video-panel",
          )
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 0);
    },
    [],
  );
  const handlePracticeDailyPlanRefresh = useCallback(
    (refresh: PracticeDailyPlanRefresh) => {
      setActivePracticeContext(refresh.context);
      setHomeRefreshToken((current) => current + 1);
    },
    [],
  );

  return (
    <section className="space-y-4">
      <div className="rounded-lg border border-slate-200 bg-white p-4 sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
              Học cùng con
            </p>
            <h2 className="mt-1 text-xl font-semibold">Kế hoạch học hôm nay</h2>
            <p className="mt-1 text-sm text-slate-500">{message}</p>
          </div>
          <div className="flex max-w-full gap-2 overflow-auto">
            {children.map((child) => (
              <button
                className={`h-9 whitespace-nowrap rounded-lg px-3 text-sm font-medium ring-1 ${
                  selectedChildId === child.id
                    ? "bg-slate-950 text-white ring-slate-950"
                    : "bg-white text-slate-700 ring-slate-200"
                }`}
                key={child.id}
                onClick={() => {
                  setSelectedChildId(child.id);
                  setActiveLessonId("");
                  setRequestedLessonId("");
                  setActiveVideoContext(null);
                  setActivePracticeContext(null);
                  setHomeRefreshToken((current) => current + 1);
                }}
                type="button"
              >
                {child.displayName}
              </button>
            ))}
          </div>
        </div>
      </div>

      {childrenLoading ? (
        <p className="rounded-lg border border-slate-200 bg-white p-5 text-sm text-slate-500">
          Đang tải...
        </p>
      ) : !selectedChild ? (
        <p className="rounded-lg border border-dashed border-slate-300 bg-white p-5 text-sm text-slate-500">
          Chưa có hồ sơ học sinh để mở buổi học.
        </p>
      ) : (
        <>
          <ParentDailyPlanComposer
            child={selectedChild}
            onAssigned={() => setHomeRefreshToken((current) => current + 1)}
            session={session}
          />
          <StudentTodayPanel
            childDisplayName={selectedChild.displayName}
            childProfileId={selectedChild.id}
            onResume={handleResume}
            refreshToken={homeRefreshToken}
            session={session}
          />
          <VideoImmersionPanel
            childProfileId={selectedChild.id}
            onLessonChange={setActiveLessonId}
            planContext={activeVideoContext}
            requestedLessonId={requestedLessonId}
            session={session}
          />
          <StudentPracticePanel
            childProfileId={selectedChild.id}
            lessonId={activeLessonId}
            onDailyPlanRefresh={handlePracticeDailyPlanRefresh}
            planContext={activePracticeContext}
            session={session}
          />
        </>
      )}
    </section>
  );
}
