"use client";

import type { Role, Session } from "../types";
import { useContentStudioState } from "./studio/use-content-studio-state";
import { ContentStudioEditor } from "./studio/content-studio-editor";
import { RecentLessonsColumn } from "./studio/recent-lessons-column";

export function ContentStudio({ role, session }: { role: Role; session: Session }) {
  const state = useContentStudioState({ role, session });
  const { overview } = state;
return (
    <section className="mt-4 rounded-lg border border-slate-200 bg-white p-4 sm:p-5">
      <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
            Xưởng nội dung
          </p>
          <h2 className="mt-1 text-xl font-semibold">Quản lý bài học video</h2>
          <p className="mt-1 text-sm text-slate-500">
            Quản trị viên tạo bài học, đính kèm YouTube hoặc video nội bộ rồi
            xuất bản.
          </p>
        </div>
        <div className="grid grid-cols-3 border-y border-slate-200 text-center lg:min-w-80">
          {[
            ["Bản nháp", overview?.status.drafts ?? 0],
            ["Duyệt", overview?.status.inReview ?? 0],
            ["Đã xuất bản", overview?.status.published ?? 0],
          ].map(([label, value], index) => (
            <div
              className={index > 0 ? "border-l border-slate-200 p-3" : "p-3"}
              key={label}
            >
              <p className="text-xs text-slate-500">{label}</p>
              <p className="mt-1 text-lg font-semibold">{value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <ContentStudioEditor {...state} />

        <RecentLessonsColumn {...state} />
      </div>
    </section>
  );
}
