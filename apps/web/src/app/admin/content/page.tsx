"use client";

import { BookOpen, CheckCircle2, Eye, FilePen, FileVideo, Layers, Loader2, PlusCircle, RefreshCw, X } from "lucide-react";
import { useContentPageState } from "./_components/use-content-page-state";
import { LessonsTab, ReviewTab } from "./_components/lesson-tabs";
import { StructureTab } from "./_components/structure-tab";
import { LearningPathsTab } from "./_components/learning-paths-tab";
import { TagsTab } from "./_components/tags-tab";
import { NewCourseModal, NewUnitModal } from "./_components/course-modals";
import { AddVideoModal, EditLessonModal, NewLessonModal, UploadVideoModal } from "./_components/lesson-modals";
import { EditActivityModal, NewActivityModal } from "./_components/exercise-modals";
import { EditQuestionModal, NewQuestionModal } from "./_components/question-modals";
import { EditTagModal, LessonTagsModal, NewTagModal } from "./_components/tag-modals";

export default function ContentPage() {
  const state = useContentPageState();
  const {
    activeTab,
    canEdit,
    canPublish,
    isLoading,
    load,
    loaded,
    message,
    overview,
    setActiveTab,
    setNewCourseTitle,
    setShowCourseModal,
    toast,
  } = state;
  if (!loaded) return null;
return (
    <div className="px-6 py-6 lg:px-8 lg:py-8 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Quản lý nội dung</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            Quản lý khóa học, bài học, bài luyện và thẻ.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => void load()}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
          >
            <RefreshCw size={14} />
          </button>
          {canEdit && (
            <button
              onClick={() => {
                setShowCourseModal(true);
                setNewCourseTitle("");
              }}
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              <PlusCircle size={14} /> Khóa học mới
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      {overview && (
        <div className="grid grid-cols-3 gap-3 lg:grid-cols-6">
          {[
            {
              label: "Khóa học",
              value: overview.courses,
              icon: Layers,
              color: "text-indigo-500",
            },
            {
              label: "Bài học",
              value: overview.lessons,
              icon: BookOpen,
              color: "text-slate-600",
            },
            {
              label: "Video",
              value: overview.videos,
              icon: FileVideo,
              color: "text-blue-500",
            },
            {
              label: "Bản nháp",
              value: overview.status.drafts,
              icon: FilePen,
              color: "text-slate-500",
            },
            {
              label: "Đang chờ duyệt",
              value: overview.status.inReview,
              icon: Eye,
              color: "text-amber-500",
            },
            {
              label: "Đã xuất bản",
              value: overview.status.published,
              icon: CheckCircle2,
              color: "text-green-600",
            },
          ].map(({ label, value, icon: Icon, color }) => (
            <div
              key={label}
              className="rounded-2xl border border-slate-200 bg-white p-4"
            >
              <div className={`mb-1.5 ${color}`}>
                <Icon size={16} />
              </div>
              <p className="text-xl font-bold text-slate-900">{value}</p>
              <p className="text-xs text-slate-500">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200">
        {(
          [
            "bài học",
            "structure",
            "paths",
            "tags",
            ...(canPublish ? ["review"] : []),
          ] as const
        ).map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t as typeof activeTab)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${activeTab === t ? "border-indigo-600 text-indigo-700" : "border-transparent text-slate-500 hover:text-slate-700"}`}
          >
            {t === "bài học" ? (
              "Tất cả bài học"
            ) : t === "structure" ? (
              "Cấu trúc khóa học"
            ) : t === "paths" ? (
              "Lộ trình học"
            ) : t === "tags" ? (
              "Thẻ và chủ đề"
            ) : (
              <span className="flex items-center gap-1.5">
                Danh sách chờ duyệt
                {overview && overview.status.inReview > 0 && (
                  <span className="rounded-full bg-amber-500 text-white text-xs px-1.5 py-0.5 leading-none">
                    {overview.status.inReview}
                  </span>
                )}
              </span>
            )}
          </button>
        ))}
      </div>

      {message && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {message}
        </div>
      )}
      {isLoading && (
        <div className="flex items-center gap-2 py-10 text-slate-400 text-sm">
          <Loader2 size={16} className="animate-spin" /> Đang tải…
        </div>
      )}

      {/* All Lessons tab */}
      <LessonsTab {...state} />

      {/* Course Structure tab */}
      <StructureTab {...state} />

      {/* Review Queue tab (ADMIN only) */}
      <ReviewTab {...state} />

      {/* Learning Paths tab */}
      <LearningPathsTab {...state} />

      {/* Tags tab */}
      <TagsTab {...state} />

      {/* ── Modals ────────────────────────────────────────────────────────── */}
      <NewCourseModal {...state} />

      <NewUnitModal {...state} />

      <NewLessonModal {...state} />

      <EditLessonModal {...state} />

      <AddVideoModal {...state} />

      <UploadVideoModal {...state} />

      <NewActivityModal {...state} />

      <NewQuestionModal {...state} />

      <LessonTagsModal {...state} />

      <NewTagModal {...state} />

      <EditTagModal {...state} />

      <EditActivityModal {...state} />

      <EditQuestionModal {...state} />

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
