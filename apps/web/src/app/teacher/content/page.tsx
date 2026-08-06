"use client";

import {
  CheckCircle2,
  Eye,
  FilePen,
  Link2,
  Loader2,
  PlusCircle,
  RefreshCw,
  Send,
  Sparkles,
  Upload,
  X,
} from "lucide-react";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { getStoredAccessToken } from "../../session-storage";
import { localizeTeacherMessage } from "../_lib/teacher-client";

const apiBase = `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"}/v1`;

// ── API helpers ───────────────────────────────────────────────────────────────

function authHeaders() {
  return { Authorization: `Bearer ${getStoredAccessToken() ?? ""}` };
}

async function teacherJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${apiBase}${path}`, {
    ...init,
    headers: {
      ...(init?.body instanceof FormData
        ? {}
        : { "Content-Type": "application/json" }),
      ...authHeaders(),
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const payload = (await res.json().catch(() => ({}))) as {
      message?: string | string[];
    };
    const msg = Array.isArray(payload.message)
      ? payload.message.join(" ")
      : (payload.message ?? "Yêu cầu thất bại.");
    throw new Error(localizeTeacherMessage(msg));
  }
  return res.json() as Promise<T>;
}

async function teacherFetch(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  return fetch(`${apiBase}${path}`, {
    ...init,
    headers: {
      ...authHeaders(),
      ...(init?.headers ?? {}),
    },
  });
}

// ── Types ─────────────────────────────────────────────────────────────────────

type PublishStatus = "DRAFT" | "IN_REVIEW" | "PUBLISHED" | "ARCHIVED";

type MyLesson = {
  id: string;
  title: string;
  status: PublishStatus;
  type: string;
  sortOrder: number;
  updatedAt: string;
  videos: Array<{ id: string; title?: string | null; provider: string }>;
  activities: Array<{ id: string; title: string }>;
  unit: {
    id: string;
    title: string;
    course: { id: string; title: string; level: { code: string } };
  };
};

type CourseTree = {
  id: string;
  title: string;
  level: { code: string };
  units: Array<{ id: string; title: string; sortOrder: number }>;
};

const statusColors: Record<PublishStatus, string> = {
  DRAFT: "bg-slate-100 text-slate-600",
  IN_REVIEW: "bg-amber-100 text-amber-700",
  PUBLISHED: "bg-green-100 text-green-700",
  ARCHIVED: "bg-red-100 text-red-600",
};

const statusLabel: Record<PublishStatus, string> = {
  DRAFT: "Bản nháp",
  IN_REVIEW: "Đang chờ duyệt",
  PUBLISHED: "Đã xuất bản",
  ARCHIVED: "Đã lưu trữ",
};

const lessonTypeLabel: Record<string, string> = {
  VIDEO: "Video",
  QUIZ: "Bài kiểm tra",
  READING: "Bài đọc",
  SPEAKING: "Luyện nói",
  MIXED: "Kết hợp",
};

// ── Page ──────────────────────────────────────────────────────────────────────

export default function TeacherContentPage() {
  const [lessons, setLessons] = useState<MyLesson[]>([]);
  const [courses, setCourses] = useState<CourseTree[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [filterStatus, setFilterStatus] = useState<"ALL" | PublishStatus>(
    "ALL",
  );
  const [toast, setToast] = useState<{ text: string; ok: boolean } | null>(
    null,
  );

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState<MyLesson | null>(null);
  const [uploadLesson, setUploadLesson] = useState<MyLesson | null>(null);
  const [editLesson, setEditLesson] = useState<MyLesson | null>(null);

  // Create lesson form
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [selectedUnitId, setSelectedUnitId] = useState("");
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonType, setLessonType] = useState("VIDEO");

  // Edit lesson form
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");

  // Video form
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [youtubeTitle, setYoutubeTitle] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const showToast = useCallback((text: string, ok = true) => {
    setToast({ text, ok });
    window.setTimeout(() => setToast(null), 3500);
  }, []);

  const load = useCallback(async () => {
    setIsLoading(true);
    setMessage("");
    try {
      const [ls, crs] = await Promise.all([
        teacherJson<MyLesson[]>("/teacher/content/lessons"),
        teacherJson<CourseTree[]>("/teacher/content/courses"),
      ]);
      setLessons(ls);
      setCourses(crs);
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [load]);

  // ── Actions ────────────────────────────────────────────────────────────────

  const createLesson = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await teacherJson("/teacher/content/lessons", {
        method: "POST",
        body: JSON.stringify({
          unitId: selectedUnitId,
          title: lessonTitle,
          type: lessonType,
        }),
      });
      setShowCreateModal(false);
      setLessonTitle("");
      showToast("Đã tạo bài học ở trạng thái bản nháp.");
      void load();
    } catch (err) {
      showToast((err as Error).message, false);
    } finally {
      setIsSaving(false);
    }
  };

  const updateLesson = async (e: FormEvent) => {
    e.preventDefault();
    if (!editLesson) return;
    setIsSaving(true);
    try {
      await teacherJson(`/teacher/content/lessons/${editLesson.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          title: editTitle,
          description: editDescription,
        }),
      });
      setEditLesson(null);
      showToast("Đã cập nhật bài học.");
      void load();
    } catch (err) {
      showToast((err as Error).message, false);
    } finally {
      setIsSaving(false);
    }
  };

  const attachYouTube = async (e: FormEvent, lessonId: string) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await teacherJson(`/teacher/content/lessons/${lessonId}/videos/link`, {
        method: "POST",
        body: JSON.stringify({
          url: youtubeUrl,
          title: youtubeTitle || "Video",
          provider: "YOUTUBE",
        }),
      });
      setShowVideoModal(null);
      setYoutubeUrl("");
      setYoutubeTitle("");
      showToast("Đã đính kèm video YouTube.");
      void load();
    } catch (err) {
      showToast((err as Error).message, false);
    } finally {
      setIsSaving(false);
    }
  };

  const uploadVideo = async (lessonId: string, file: File) => {
    setIsSaving(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("title", file.name);
      const res = await teacherFetch(
        `/teacher/content/lessons/${lessonId}/videos/upload`,
        {
          method: "POST",
          body: fd,
        },
      );
      if (!res.ok) {
        const p = (await res.json().catch(() => ({}))) as { message?: string };
        throw new Error(
          localizeTeacherMessage(p.message ?? "Tải tệp lên không thành công."),
        );
      }
      showToast("Đã tải video lên.");
      setUploadLesson(null);
      void load();
    } catch (err) {
      showToast((err as Error).message, false);
    } finally {
      setIsSaving(false);
    }
  };

  const submitReview = async (lessonId: string) => {
    setIsSaving(true);
    try {
      await teacherJson(`/teacher/content/lessons/${lessonId}/submit-review`, {
        method: "POST",
      });
      showToast("Đã gửi để quản trị viên xét duyệt.");
      void load();
    } catch (err) {
      showToast((err as Error).message, false);
    } finally {
      setIsSaving(false);
    }
  };

  // ── Helpers ───────────────────────────────────────────────────────────────

  const selectedCourseUnits =
    courses.find((c) => c.id === selectedCourseId)?.units ?? [];

  const displayedLessons =
    filterStatus === "ALL"
      ? lessons
      : lessons.filter((l) => l.status === filterStatus);

  return (
    <div className="kid-page space-y-5 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
      {/* Header */}
      <div className="kid-hero flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-7">
        <div className="relative z-10">
          <span className="kid-eyebrow">
            <Sparkles size={14} /> Xưởng sáng tạo
          </span>
          <h1 className="mt-3 text-3xl font-extrabold text-slate-900">
            Bài học của tôi
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
            Biến mỗi bài giảng thành một chuyến phiêu lưu sinh động dành cho các
            bé.
          </p>
        </div>
        <div className="relative z-10 flex items-center gap-2">
          <button
            aria-label="Làm mới danh sách"
            title="Làm mới danh sách"
            onClick={() => void load()}
            className="kid-icon-button"
          >
            <RefreshCw size={17} />
          </button>
          <button
            onClick={() => {
              setShowCreateModal(true);
              setLessonTitle("");
              setSelectedCourseId("");
              setSelectedUnitId("");
            }}
            className="kid-primary-button inline-flex items-center gap-2 whitespace-nowrap px-4 py-2.5 text-sm"
          >
            <PlusCircle size={17} />
            Bài học mới
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 rounded-2xl border border-white/70 bg-white/70 p-2 shadow-sm backdrop-blur">
        {(["ALL", "DRAFT", "IN_REVIEW", "PUBLISHED"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`rounded-full px-4 py-2 text-xs font-bold transition-colors ${
              filterStatus === s
                ? "kid-nav-active"
                : "text-slate-600 hover:bg-violet-50 hover:text-violet-700"
            }`}
          >
            {s === "ALL" ? "Tất cả" : statusLabel[s]}
          </button>
        ))}
      </div>

      {/* Error */}
      {message && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {message}
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center gap-2 py-10 text-slate-400 text-sm">
          <Loader2 size={16} className="animate-spin" /> Đang tải…
        </div>
      )}

      {/* Lesson cards */}
      {!isLoading && displayedLessons.length === 0 && (
        <div className="kid-empty-state p-10 text-center">
          <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-gradient-to-br from-violet-100 to-sky-100 text-violet-600 shadow-sm">
            <Sparkles size={27} />
          </div>
          <p className="mt-4 font-extrabold text-slate-800">
            Sẵn sàng tạo một điều thật vui?
          </p>
          <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-slate-500">
            Chưa có bài học nào. Nhấn &quot;Bài học mới&quot; để tạo hành trình
            đầu tiên cho các bé.
          </p>
        </div>
      )}

      <div className="space-y-2">
        {displayedLessons.map((lesson) => (
          <div
            key={lesson.id}
            className="flex items-start gap-4 rounded-3xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[lesson.status]}`}
                >
                  {statusLabel[lesson.status]}
                </span>
                <span className="text-xs text-slate-400">
                  {lesson.unit.course.level.code} › {lesson.unit.course.title} ›{" "}
                  {lesson.unit.title}
                </span>
              </div>
              <p className="text-sm font-semibold text-slate-900">
                {lesson.title}
              </p>
              <div className="mt-1 flex items-center gap-3 text-xs text-slate-400">
                <span>{lessonTypeLabel[lesson.type] ?? lesson.type}</span>
                <span>{lesson.videos.length} video</span>
                <span>{lesson.activities.length} bài luyện tập</span>
              </div>
            </div>

            {/* Actions — only on DRAFT */}
            {lesson.status === "DRAFT" && (
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => {
                    setEditLesson(lesson);
                    setEditTitle(lesson.title);
                    setEditDescription("");
                  }}
                  className="flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs text-slate-600 hover:bg-slate-50"
                  title="Chỉnh sửa chi tiết"
                >
                  <FilePen size={12} />
                  Chỉnh sửa
                </button>
                <button
                  onClick={() => {
                    setShowVideoModal(lesson);
                    setYoutubeUrl("");
                    setYoutubeTitle("");
                  }}
                  className="flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs text-slate-600 hover:bg-slate-50"
                  title="Đính kèm YouTube"
                >
                  <Link2 size={12} />
                  YouTube
                </button>
                <button
                  onClick={() => setUploadLesson(lesson)}
                  className="flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs text-slate-600 hover:bg-slate-50"
                >
                  <Upload size={12} />
                  Tải lên
                </button>
                <button
                  onClick={() => void submitReview(lesson.id)}
                  disabled={isSaving}
                  className="flex items-center gap-1 rounded-lg border border-indigo-200 bg-indigo-50 px-2.5 py-1.5 text-xs text-indigo-700 hover:bg-indigo-100 disabled:opacity-50"
                >
                  <Send size={12} />
                  Gửi
                </button>
              </div>
            )}

            {lesson.status === "IN_REVIEW" && (
              <div className="flex items-center gap-1.5 flex-shrink-0 text-xs text-amber-600">
                <Eye size={13} />
                Đang chờ quản trị viên xét duyệt
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── Modals ──────────────────────────────────────────────────────────── */}

      {/* Create Lesson */}
      {showCreateModal && (
        <Modal title="Bài học mới" onClose={() => setShowCreateModal(false)}>
          <form onSubmit={(e) => void createLesson(e)} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Khóa học
              </label>
              <select
                required
                value={selectedCourseId}
                onChange={(e) => {
                  setSelectedCourseId(e.target.value);
                  setSelectedUnitId("");
                }}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              >
                <option value="">— chọn khóa học —</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    [{c.level.code}] {c.title}
                  </option>
                ))}
              </select>
            </div>
            {selectedCourseId && (
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Chương
                </label>
                <select
                  required
                  value={selectedUnitId}
                  onChange={(e) => setSelectedUnitId(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                >
                  <option value="">— chọn chương —</option>
                  {selectedCourseUnits.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.title}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Tiêu đề bài học
              </label>
              <input
                required
                value={lessonTitle}
                onChange={(e) => setLessonTitle(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                placeholder="ví dụ: Xin chào & Tạm biệt"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Loại
              </label>
              <select
                value={lessonType}
                onChange={(e) => setLessonType(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              >
                {["VIDEO", "QUIZ", "READING", "SPEAKING", "MIXED"].map((t) => (
                  <option key={t} value={t}>
                    {lessonTypeLabel[t] ?? t}
                  </option>
                ))}
              </select>
            </div>
            <ModalFooter
              isSaving={isSaving}
              onCancel={() => setShowCreateModal(false)}
              color="indigo"
            />
          </form>
        </Modal>
      )}

      {/* Edit Lesson */}
      {editLesson && (
        <Modal
          title={`Chỉnh sửa — ${editLesson.title}`}
          onClose={() => setEditLesson(null)}
        >
          <form onSubmit={(e) => void updateLesson(e)} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Tiêu đề
              </label>
              <input
                required
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Mô tả (không bắt buộc)
              </label>
              <textarea
                rows={3}
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
            <ModalFooter
              isSaving={isSaving}
              onCancel={() => setEditLesson(null)}
              submitLabel="Lưu thay đổi"
              color="indigo"
            />
          </form>
        </Modal>
      )}

      {/* Attach YouTube */}
      {showVideoModal && (
        <Modal
          title={`Thêm video — ${showVideoModal.title}`}
          onClose={() => setShowVideoModal(null)}
        >
          <form
            onSubmit={(e) => void attachYouTube(e, showVideoModal.id)}
            className="space-y-4"
          >
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Đường dẫn YouTube
              </label>
              <input
                required
                type="url"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                placeholder="https://www.youtube.com/watch?v=..."
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Tiêu đề video
              </label>
              <input
                value={youtubeTitle}
                onChange={(e) => setYoutubeTitle(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                placeholder="Video chính của bài học"
              />
            </div>
            <ModalFooter
              isSaving={isSaving}
              onCancel={() => setShowVideoModal(null)}
              submitLabel="Đính kèm"
              color="indigo"
            />
          </form>
        </Modal>
      )}

      {/* Upload Video */}
      {uploadLesson && (
        <Modal
          title={`Tải video lên — ${uploadLesson.title}`}
          onClose={() => setUploadLesson(null)}
        >
          <div className="space-y-4">
            <p className="text-sm text-slate-500">
              Chọn tệp MP4, MOV hoặc WebM (tối đa 1 GB).
            </p>
            <input
              ref={fileRef}
              type="file"
              accept="video/mp4,video/quicktime,video/webm,video/x-matroska"
              className="block w-full text-sm text-slate-700 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-600 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-indigo-700"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setUploadLesson(null)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
              >
                Hủy
              </button>
              <button
                disabled={isSaving}
                onClick={() => {
                  const file = fileRef.current?.files?.[0];
                  if (file) void uploadVideo(uploadLesson.id, file);
                }}
                className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {isSaving ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Upload size={14} />
                )}
                Tải lên
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium shadow-lg ${toast.ok ? "bg-indigo-700 text-white" : "bg-red-600 text-white"}`}
        >
          {toast.ok ? <CheckCircle2 size={15} /> : <X size={15} />}
          {toast.text}
        </div>
      )}
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
      <div className="kid-modal-card w-full max-w-md bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
          >
            <X size={16} />
          </button>
        </div>
        <div className="px-5 py-5">{children}</div>
      </div>
    </div>
  );
}

function ModalFooter({
  isSaving,
  onCancel,
  submitLabel = "Tạo",
  color = "slate",
}: {
  isSaving: boolean;
  onCancel: () => void;
  submitLabel?: string;
  color?: "slate" | "indigo";
}) {
  const bg =
    color === "indigo"
      ? "bg-indigo-600 hover:bg-indigo-700"
      : "bg-slate-950 hover:bg-slate-800";
  return (
    <div className="flex justify-end gap-2 pt-2">
      <button
        type="button"
        onClick={onCancel}
        className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
      >
        Hủy
      </button>
      <button
        type="submit"
        disabled={isSaving}
        className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-50 ${bg}`}
      >
        {isSaving && <Loader2 size={14} className="animate-spin" />}
        {submitLabel}
      </button>
    </div>
  );
}
