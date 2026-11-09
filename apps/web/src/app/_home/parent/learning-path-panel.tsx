"use client";

import { ClipboardList } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { apiBaseUrl, readApiError } from "../lib/api";
import type { ParentChild, ParentChildrenPayload, Session } from "../types";

type ParentContentAssignment = {
  id: string;
  startedAt?: string;
  contentPackage: {
    id: string;
    code: string;
    title: string;
    status: string;
    learningPath: {
      id: string;
      code: string;
      title: string;
      status: string;
      items: Array<{
        id: string;
        sequence: number;
        lesson: {
          id: string;
          title: string;
          status: string;
        };
      }>;
    };
  };
} | null;

function learningPathStatusLabel(status: string) {
  const labels: Record<string, string> = {
    DRAFT: "Đang soạn",
    IN_REVIEW: "Đang kiểm tra",
    PUBLISHED: "Đang hoạt động",
    ARCHIVED: "Đã lưu trữ",
  };
  return labels[status] ?? status;
}

// ---------------------------------------------------------------------------
// ParentBillingPanel — order history and bank transfer info
// ---------------------------------------------------------------------------
export function ParentLearningPathPanel({ session }: { session: Session }) {
  const [children, setChildren] = useState<ParentChild[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [assignment, setAssignment] = useState<ParentContentAssignment>(null);
  const [childrenLoading, setChildrenLoading] = useState(true);
  const [assignmentLoading, setAssignmentLoading] = useState(false);
  const [error, setError] = useState("");

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
        if (!res.ok)
          throw new Error(
            await readApiError(res, "Không thể tải hồ sơ học sinh."),
          );
        const data = (await res.json()) as ParentChildrenPayload;
        setChildren(data.children);
        if (data.children.length > 0) setSelectedChildId(data.children[0].id);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Không thể tải hồ sơ học sinh.",
        );
      } finally {
        setChildrenLoading(false);
      }
    })();
  }, [authHeaders]);

  useEffect(() => {
    if (!selectedChildId) {
      return;
    }

    const timer = window.setTimeout(() => {
      setAssignmentLoading(true);
      setError("");
      void (async () => {
        try {
          const res = await fetch(
            `${apiBaseUrl}/v1/parent/children/${selectedChildId}/content-assignment`,
            {
              headers: authHeaders,
            },
          );
          if (!res.ok)
            throw new Error(
              await readApiError(res, "Không thể tải lộ trình học."),
            );
          const payload = await res.text();
          // Nest returns an empty successful response for a missing assignment.
          // Treat it as no assigned path instead of attempting JSON.parse("").
          setAssignment(
            payload.trim()
              ? (JSON.parse(payload) as ParentContentAssignment)
              : null,
          );
        } catch (err) {
          setError(
            err instanceof Error ? err.message : "Không thể tải lộ trình học.",
          );
          setAssignment(null);
        } finally {
          setAssignmentLoading(false);
        }
      })();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [authHeaders, selectedChildId]);

  if (childrenLoading)
    return <p className="py-6 text-sm text-slate-500">Đang tải...</p>;
  if (children.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-6 text-center">
        <p className="text-sm text-slate-500">Chưa có hồ sơ học sinh nào.</p>
      </div>
    );
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium text-slate-700">
          Chọn học sinh:
        </span>
        {children.map((child) => (
          <button
            className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
              selectedChildId === child.id
                ? "border-teal-500 bg-teal-50 text-teal-700"
                : "border-slate-200 text-slate-600 hover:border-teal-300"
            }`}
            key={child.id}
            onClick={() => setSelectedChildId(child.id)}
            type="button"
          >
            {child.displayName}
          </button>
        ))}
      </div>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}
      {assignmentLoading ? (
        <p className="text-sm text-slate-500">Đang tải lộ trình...</p>
      ) : assignment ? (
        <article className="rounded-lg border border-slate-200 bg-white p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
                {assignment.contentPackage.code}
              </p>
              <h3 className="mt-1 text-lg font-semibold text-slate-900">
                {assignment.contentPackage.title}
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                {assignment.contentPackage.learningPath.code} ·{" "}
                {assignment.contentPackage.learningPath.title}
              </p>
            </div>
            <span className="rounded-full bg-teal-100 px-2.5 py-1 text-xs font-medium text-teal-700">
              {learningPathStatusLabel(
                assignment.contentPackage.learningPath.status,
              )}
            </span>
          </div>

          <div className="mt-5 rounded-lg border border-slate-100">
            <div className="border-b border-slate-100 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Bài trong lộ trình
            </div>
            <ul className="divide-y divide-slate-100">
              {assignment.contentPackage.learningPath.items.length === 0 ? (
                <li className="px-4 py-3 text-sm text-slate-500">
                  Chưa có bài trong lộ trình.
                </li>
              ) : (
                assignment.contentPackage.learningPath.items.map((item) => (
                  <li
                    className="flex items-center gap-3 px-4 py-3 text-sm"
                    key={item.id}
                  >
                    <span className="grid size-7 place-items-center rounded-full bg-slate-100 text-xs font-semibold text-slate-500">
                      {item.sequence}
                    </span>
                    <span className="flex-1 text-slate-800">
                      {item.lesson.title}
                    </span>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                      {learningPathStatusLabel(item.lesson.status)}
                    </span>
                  </li>
                ))
              )}
            </ul>
          </div>
        </article>
      ) : (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
          <ClipboardList className="mx-auto mb-3 text-slate-300" size={40} />
          <p className="text-sm font-medium text-slate-700">
            Chưa được gán lộ trình học chính
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Khi trung tâm gán gói học, lộ trình sẽ hiển thị tại đây.
          </p>
        </div>
      )}
    </section>
  );
}
