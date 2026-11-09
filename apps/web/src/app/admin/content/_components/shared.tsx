"use client";

import { CheckCircle2, ChevronDown, ChevronRight, FilePen, FileVideo, Link2, Loader2, Pencil, PlusCircle, Send, Tag, Trash2, Upload, X } from "lucide-react";
import { ReactNode } from "react";

export const contentEditorRoles = ["ADMIN", "CONTENT_EDITOR"] as const;

export const contentPublishRoles = ["ADMIN"] as const;

export type PublishStatus = "DRAFT" | "IN_REVIEW" | "PUBLISHED" | "ARCHIVED";

export type Answer = {
  id: string;
  text: string;
  isCorrect: boolean;
  sortOrder: number;
};

export type Question = {
  id: string;
  type: string;
  prompt: string;
  explanation?: string | null;
  points: number;
  answers: Answer[];
};

export type Activity = {
  id: string;
  title: string;
  type: string;
  sortOrder: number;
  questions: Question[];
};

export type TagRef = { id: string; name: string; kind: string; color?: string | null };

export type VideoAsset = {
  id: string;
  title?: string | null;
  provider: string;
  processingStatus: string;
};

export type Lesson = {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  status: PublishStatus;
  type: string;
  sortOrder: number;
  updatedAt: string;
  videos: VideoAsset[];
  activities: Activity[];
  tags: Array<{ tag: TagRef }>;
  unit: {
    id: string;
    title: string;
    course: { id: string; title: string; level: { code: string } };
  };
};

export type Unit = {
  id: string;
  title: string;
  sortOrder: number;
  lessons?: Lesson[];
};

export type Course = {
  id: string;
  title: string;
  isPublished: boolean;
  level: { code: string };
  units: Unit[];
};

export type ContentOverview = {
  courses: number;
  lessons: number;
  videos: number;
  status: { drafts: number; inReview: number; published: number };
};

export type ContentTag = {
  id: string;
  name: string;
  kind: string;
  color?: string | null;
  isActive: boolean;
  _count: { lessons: number };
};

export type LearningPathSummary = {
  id: string;
  code: string;
  title: string;
  description?: string | null;
  ageBand?: string | null;
  status: PublishStatus;
  level?: { code: string; title: string } | null;
  _count: { items: number; packages: number };
};

export type ContentPackageSummary = {
  id: string;
  code: string;
  title: string;
  description?: string | null;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  learningPath: {
    id: string;
    code: string;
    title: string;
    status: PublishStatus;
  };
  plan?: { id: string; code: string; name: string } | null;
  _count: { assignments: number };
};

export const statusColors: Record<PublishStatus, string> = {
  DRAFT: "bg-slate-100 text-slate-600",
  IN_REVIEW: "bg-amber-100 text-amber-700",
  PUBLISHED: "bg-green-100 text-green-700",
  ARCHIVED: "bg-red-100 text-red-600",
};

export const statusLabel: Record<PublishStatus, string> = {
  DRAFT: "Bản nháp",
  IN_REVIEW: "Đang chờ duyệt",
  PUBLISHED: "Đã xuất bản",
  ARCHIVED: "Đã lưu trữ",
};

export const lessonTypeLabel: Record<string, string> = {
  VIDEO: "Video",
  READING: "Bài đọc",
  LISTENING: "Nghe",
  SPEAKING: "Nói",
  WRITING: "Viết",
  QUIZ: "Bài kiểm tra",
  MIXED: "Kết hợp",
};

export const activityTypeLabel: Record<string, string> = {
  QUIZ: "Bài kiểm tra",
  VOCAB_GAME: "Trò chơi từ vựng",
  LISTENING: "Luyện nghe",
  SPEAKING: "Luyện nói",
  WRITING: "Luyện viết",
  AI_CHAT: "Trò chuyện AI",
};

export const questionTypeLabel: Record<string, string> = {
  SINGLE_CHOICE: "Một đáp án",
  MULTIPLE_CHOICE: "Nhiều đáp án",
  TEXT_INPUT: "Nhập văn bản",
  ORDERING: "Sắp xếp",
};

export const tagKindLabel: Record<string, string> = {
  TOPIC: "Chủ đề",
  AUDIENCE: "Đối tượng",
  LEVEL: "Trình độ",
  SKILL: "Kỹ năng",
  FORMAT: "Định dạng",
  INTENT: "Mục đích",
  CUSTOM: "Tùy chỉnh",
};

export const videoProviderLabel: Record<string, string> = {
  YOUTUBE: "YouTube",
  UPLOAD: "Tệp tải lên",
  LOCAL: "Tệp nội bộ",
};

export const inputCls =
  "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300";

export function LessonCard({
  lesson,
  canEdit,
  canPublish,
  isSaving,
  expanded,
  onToggleExpand,
  onEditLesson,
  onAttachYouTube,
  onUpload,
  onAddExercise,
  onAddQuestion,
  onEditActivity,
  onEditQuestion,
  onEditTags,
  onSubmitReview,
  onPublish,
  onArchive,
  onDeleteVideo,
  onDeleteActivity,
  onDeleteQuestion,
}: {
  lesson: Lesson;
  canEdit: boolean;
  canPublish: boolean;
  isSaving: boolean;
  expanded: boolean;
  onToggleExpand: () => void;
  onEditLesson: () => void;
  onAttachYouTube: () => void;
  onUpload: () => void;
  onAddExercise: () => void;
  onAddQuestion: (a: Activity) => void;
  onEditActivity: (a: Activity) => void;
  onEditQuestion: (q: Question, activityId: string) => void;
  onEditTags: () => void;
  onSubmitReview: () => void;
  onPublish: () => void;
  onArchive: () => void;
  onDeleteVideo: (id: string) => void;
  onDeleteActivity: (id: string) => void;
  onDeleteQuestion: (aId: string, qId: string) => void;
}) {
  const isDraft = lesson.status === "DRAFT";
  const isInReview = lesson.status === "IN_REVIEW";
  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
      <div className="flex items-start gap-3 p-4">
        <button
          onClick={onToggleExpand}
          className="mt-0.5 flex-shrink-0 text-slate-400"
        >
          {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <span
              className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[lesson.status]}`}
            >
              {statusLabel[lesson.status]}
            </span>
            <span className="text-xs text-slate-400">
              {lesson.unit.course.level.code} › {lesson.unit.course.title} ›{" "}
              {lesson.unit.title}
            </span>
          </div>
          <p className="text-sm font-semibold text-slate-900">{lesson.title}</p>
          <div className="mt-1 flex items-center gap-3 text-xs text-slate-400">
            <span>{lessonTypeLabel[lesson.type] ?? lesson.type}</span>
            <span>{lesson.videos.length} video</span>
            <span>{lesson.activities.length} bài luyện</span>
            {lesson.tags.length > 0 && <span>{lesson.tags.length} thẻ</span>}
          </div>
        </div>
        {canEdit && isDraft && (
          <div className="flex items-center gap-1 flex-shrink-0 flex-wrap justify-end">
            <IBtn onClick={onEditLesson} title="Chỉnh sửa">
              <FilePen size={13} />
            </IBtn>
            <IBtn onClick={onAttachYouTube} title="YouTube">
              <Link2 size={13} />
            </IBtn>
            <IBtn onClick={onUpload} title="Tải lên">
              <Upload size={13} />
            </IBtn>
            <IBtn onClick={onAddExercise} title="Thêm bài luyện">
              <PlusCircle size={13} />
            </IBtn>
            <IBtn onClick={onEditTags} title="Thẻ">
              <Tag size={13} />
            </IBtn>
            <button
              onClick={onSubmitReview}
              disabled={isSaving}
              className="flex items-center gap-1 rounded-lg border border-indigo-200 bg-indigo-50 px-2.5 py-1.5 text-xs text-indigo-700 hover:bg-indigo-100 disabled:opacity-50"
            >
              <Send size={12} /> Gửi
            </button>
            <IBtn onClick={onArchive} title="Lưu trữ" danger>
              <Trash2 size={13} />
            </IBtn>
          </div>
        )}
        {canPublish && isInReview && (
          <button
            onClick={onPublish}
            disabled={isSaving}
            className="flex items-center gap-1 rounded-lg border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-100 disabled:opacity-50"
          >
            <CheckCircle2 size={13} /> Xuất bản
          </button>
        )}
      </div>
      {expanded && (
        <div className="border-t border-slate-100 px-4 py-3 space-y-4 bg-slate-50/60">
          <SectionLabel>Video</SectionLabel>
          {lesson.videos.length === 0 && (
            <p className="text-xs text-slate-400">Chưa có video.</p>
          )}
          {lesson.videos.map((v) => (
            <div
              key={v.id}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 mb-1"
            >
              <FileVideo size={13} className="text-slate-400" />
              <span className="flex-1 text-xs text-slate-700 truncate">
                {v.title ?? videoProviderLabel[v.provider] ?? v.provider}
              </span>
              <span className="text-xs text-slate-400">
                {videoProviderLabel[v.provider] ?? v.provider}
              </span>
              {canEdit && isDraft && (
                <button
                  onClick={() => onDeleteVideo(v.id)}
                  disabled={isSaving}
                  className="text-slate-300 hover:text-red-500 disabled:opacity-40"
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>
          ))}
          <SectionLabel>Bài luyện</SectionLabel>
          {lesson.activities.length === 0 && (
            <p className="text-xs text-slate-400">Chưa có bài luyện.</p>
          )}
          {lesson.activities.map((act) => (
            <div
              key={act.id}
              className="rounded-xl border border-slate-200 bg-white mb-2 overflow-hidden"
            >
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-100">
                <span className="flex-1 text-xs font-semibold text-slate-700">
                  {act.title}
                </span>
                <span className="text-xs text-slate-400">
                  {activityTypeLabel[act.type] ?? act.type}
                </span>
                {canEdit && isDraft && (
                  <>
                    <button
                      onClick={() => onEditActivity(act)}
                      className="rounded p-1 text-slate-400 hover:text-sky-600 hover:bg-sky-50"
                      title="Sửa nội dung"
                    >
                      <Pencil size={11} />
                    </button>
                    <button
                      onClick={() => onAddQuestion(act)}
                      className="rounded px-1.5 py-0.5 text-xs text-indigo-600 hover:bg-indigo-100"
                    >
                      + Câu hỏi
                    </button>
                    <button
                      onClick={() => onDeleteActivity(act.id)}
                      disabled={isSaving}
                      className="text-slate-300 hover:text-red-500 disabled:opacity-40"
                    >
                      <Trash2 size={12} />
                    </button>
                  </>
                )}
              </div>
              {act.questions.length === 0 && (
                <p className="px-3 py-2 text-xs text-slate-400">
                  Chưa có câu hỏi.
                </p>
              )}
              {act.questions.map((q, qi) => (
                <div
                  key={q.id}
                  className="border-t border-slate-100 px-3 py-2 flex items-start gap-2"
                >
                  <span className="text-xs text-slate-400 w-5">{qi + 1}.</span>
                  <div className="flex-1">
                    <p className="text-xs text-slate-800">{q.prompt}</p>
                    <div className="mt-1 flex gap-1.5 flex-wrap">
                      {q.answers.map((a) => (
                        <span
                          key={a.id}
                          className={`text-xs rounded px-1.5 py-0.5 ${a.isCorrect ? "bg-green-100 text-green-700 font-medium" : "bg-slate-100 text-slate-500"}`}
                        >
                          {a.text}
                        </span>
                      ))}
                    </div>
                  </div>
                  <span className="text-xs text-slate-400">
                    {questionTypeLabel[q.type] ?? q.type}
                  </span>
                  {canEdit && isDraft && (
                    <>
                      <button
                        onClick={() => onEditQuestion(q, act.id)}
                        className="rounded p-1 text-slate-400 hover:text-sky-600 hover:bg-sky-50"
                        title="Sửa câu hỏi"
                      >
                        <Pencil size={11} />
                      </button>
                      <button
                        onClick={() => onDeleteQuestion(act.id, q.id)}
                        disabled={isSaving}
                        className="text-slate-300 hover:text-red-500 disabled:opacity-40"
                      >
                        <Trash2 size={12} />
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          ))}
          {lesson.tags.length > 0 && (
            <>
              <SectionLabel>Thẻ</SectionLabel>
              <div className="flex gap-1.5 flex-wrap">
                {lesson.tags.map(({ tag }) => (
                  <span
                    key={tag.id}
                    className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-xs text-slate-600"
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export function Modal({
  title,
  onClose,
  children,
  wide,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
      <div
        className={`w-full ${wide ? "max-w-2xl" : "max-w-md"} max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-xl`}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 px-5 py-4 bg-white">
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

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-700 mb-1">
        {label}
      </label>
      {children}
    </div>
  );
}

export function MFoot({
  isSaving,
  onCancel,
  submitLabel = "Tạo",
}: {
  isSaving: boolean;
  onCancel: () => void;
  submitLabel?: string;
}) {
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
        className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {isSaving && <Loader2 size={14} className="animate-spin" />}
        {submitLabel}
      </button>
    </div>
  );
}

export function IBtn({
  children,
  onClick,
  title,
  danger,
}: {
  children: ReactNode;
  onClick: () => void;
  title?: string;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`rounded-lg border border-slate-200 p-1.5 transition-colors ${danger ? "text-red-400 hover:text-red-600 hover:bg-red-50 hover:border-red-200" : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"}`}
    >
      {children}
    </button>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
      {children}
    </p>
  );
}
