"use client";

import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Eye,
  FilePen,
  Layers,
  Loader2,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getStoredAccessToken } from "../session-storage";
import { localizeTeacherMessage } from "./_lib/teacher-client";

const apiBase = `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"}/v1`;

type TeacherOverview = {
  allCourses: number;
  myLessons: number;
  myStatus: { drafts: number; inReview: number };
};

async function teacherGet<T>(path: string): Promise<T> {
  const token = getStoredAccessToken();
  const res = await fetch(`${apiBase}${path}`, {
    headers: { Authorization: `Bearer ${token ?? ""}` },
  });
  if (!res.ok) {
    const payload = (await res.json().catch(() => ({}))) as {
      message?: string;
    };
    throw new Error(
      localizeTeacherMessage(payload.message ?? "Yêu cầu thất bại."),
    );
  }
  return res.json() as Promise<T>;
}

export default function TeacherHomePage() {
  const [overview, setOverview] = useState<TeacherOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    void (async () => {
      try {
        const data = await teacherGet<TeacherOverview>(
          "/teacher/content/overview",
        );
        setOverview(data);
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="kid-page space-y-6 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
      <section className="kid-hero p-6 sm:p-8">
        <div className="relative z-10 max-w-2xl">
          <span className="kid-eyebrow">
            <Sparkles size={14} /> Không gian truyền cảm hứng
          </span>
          <h1 className="mt-4 text-3xl font-extrabold leading-tight text-slate-900 sm:text-4xl">
            Mỗi bài học là một hành trình nhỏ đầy niềm vui
          </h1>
          <p className="mt-3 max-w-xl text-sm font-medium leading-6 text-slate-500 sm:text-base">
            Theo dõi nội dung, chuẩn bị hoạt động sinh động và giúp các bé tiến
            bộ từng ngày theo cách thật gần gũi.
          </p>
          <Link
            href="/teacher/content"
            className="kid-primary-button mt-6 inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm"
          >
            Soạn bài học mới
            <ArrowRight size={17} />
          </Link>
        </div>
        <div className="absolute right-10 top-1/2 hidden -translate-y-1/2 items-center gap-3 xl:flex">
          <div className="grid size-20 -rotate-6 place-items-center rounded-3xl bg-white/85 text-violet-500 shadow-xl shadow-violet-100">
            <BookOpen size={34} />
          </div>
          <div className="grid size-16 rotate-6 place-items-center rounded-3xl bg-amber-100 text-amber-600 shadow-lg shadow-amber-100">
            <Sparkles size={26} />
          </div>
        </div>
      </section>

      {loading && (
        <div className="flex items-center gap-2 py-8 text-slate-400 text-sm">
          <Loader2 size={16} className="animate-spin" />
          Đang tải…
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {overview && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            {
              label: "Khóa học trên hệ thống",
              value: overview.allCourses,
              icon: Layers,
              color: "bg-violet-100 text-violet-600",
              tint: "rgba(101, 88, 245, 0.12)",
            },
            {
              label: "Bài học của tôi",
              value: overview.myLessons,
              icon: BookOpen,
              color: "bg-sky-100 text-sky-600",
              tint: "rgba(104, 185, 255, 0.15)",
            },
            {
              label: "Bản nháp",
              value: overview.myStatus.drafts,
              icon: FilePen,
              color: "bg-amber-100 text-amber-600",
              tint: "rgba(255, 189, 102, 0.17)",
            },
            {
              label: "Đang chờ duyệt",
              value: overview.myStatus.inReview,
              icon: Eye,
              color: "bg-emerald-100 text-emerald-600",
              tint: "rgba(40, 184, 168, 0.14)",
            },
          ].map(({ label, value, icon: Icon, color, tint }) => (
            <div
              key={label}
              className="kid-stat-card rounded-2xl p-5 sm:p-6"
              style={{ "--stat-tint": tint } as React.CSSProperties}
            >
              <div
                className={`mb-4 grid size-11 place-items-center rounded-2xl ${color}`}
              >
                <Icon size={20} />
              </div>
              <p className="relative z-10 text-3xl font-extrabold text-slate-900">
                {value}
              </p>
              <p className="relative z-10 mt-1 text-xs font-bold leading-5 text-slate-500">
                {label}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Quick links */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <Link
          href="/teacher/content"
          className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 hover:-translate-y-1 hover:border-violet-300 hover:shadow-xl"
        >
          <div className="grid size-12 place-items-center rounded-2xl bg-violet-100 text-violet-600 transition group-hover:rotate-3 group-hover:scale-105">
            <BookOpen size={20} />
          </div>
          <div>
            <p className="text-base font-extrabold text-slate-900">
              Bài học của tôi
            </p>
            <p className="mt-1 text-xs font-medium leading-5 text-slate-500">
              Tạo, chỉnh sửa và gửi bài học để quản trị viên duyệt.
            </p>
          </div>
          <CheckCircle2 size={20} className="ml-auto text-emerald-400" />
        </Link>
      </div>
    </div>
  );
}
