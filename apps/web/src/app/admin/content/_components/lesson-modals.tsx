"use client";

import { Loader2, Upload } from "lucide-react";
import { Field, MFoot, Modal, inputCls, lessonTypeLabel } from "./shared";
import type { ContentPageState } from "./use-content-page-state";

export function NewLessonModal(state: ContentPageState) {
  const {
    createLesson,
    isSaving,
    newLessonTitle,
    newLessonType,
    setNewLessonTitle,
    setNewLessonType,
    setShowLessonModal,
    showLessonModal,
  } = state;
  if (!showLessonModal) return null;
  return (
    <Modal title="Bài học mới" onClose={() => setShowLessonModal(null)}>
      <form onSubmit={createLesson} className="space-y-4">
        <Field label="Tiêu đề">
          <input
            required
            value={newLessonTitle}
            onChange={(e) => setNewLessonTitle(e.target.value)}
            className={inputCls}
          />
        </Field>
        <Field label="Loại bài học">
          <select
            value={newLessonType}
            onChange={(e) => setNewLessonType(e.target.value)}
            className={inputCls}
          >
            {["VIDEO", "QUIZ", "READING", "SPEAKING", "MIXED"].map((t) => (
              <option key={t} value={t}>
                {lessonTypeLabel[t] ?? t}
              </option>
            ))}
          </select>
        </Field>
        <MFoot
          isSaving={isSaving}
          onCancel={() => setShowLessonModal(null)}
        />
      </form>
    </Modal>
  );
}

export function EditLessonModal(state: ContentPageState) {
  const {
    editDescription,
    editLesson,
    editTitle,
    editType,
    isSaving,
    setEditDescription,
    setEditLesson,
    setEditTitle,
    setEditType,
    updateLesson,
  } = state;
  if (!editLesson) return null;
  return (
    <Modal
      title={`Chỉnh sửa — ${editLesson.title}`}
      onClose={() => setEditLesson(null)}
    >
      <form onSubmit={updateLesson} className="space-y-4">
        <Field label="Tiêu đề">
          <input
            required
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className={inputCls}
          />
        </Field>
        <Field label="Loại bài học">
          <select
            value={editType}
            onChange={(e) => setEditType(e.target.value)}
            className={inputCls}
          >
            {["VIDEO", "QUIZ", "READING", "SPEAKING", "MIXED"].map((t) => (
              <option key={t} value={t}>
                {lessonTypeLabel[t] ?? t}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Mô tả">
          <textarea
            rows={3}
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            className={inputCls}
          />
        </Field>
        <MFoot
          isSaving={isSaving}
          onCancel={() => setEditLesson(null)}
          submitLabel="Lưu thay đổi"
        />
      </form>
    </Modal>
  );
}

export function AddVideoModal(state: ContentPageState) {
  const {
    attachYouTube,
    isSaving,
    setShowVideoModal,
    setYoutubeTitle,
    setYoutubeUrl,
    showVideoModal,
    youtubeTitle,
    youtubeUrl,
  } = state;
  if (!showVideoModal) return null;
  return (
    <Modal
      title={`Thêm video — ${showVideoModal.title}`}
      onClose={() => setShowVideoModal(null)}
    >
      <form
        onSubmit={(e) => attachYouTube(e, showVideoModal.id)}
        className="space-y-4"
      >
        <Field label="Đường dẫn YouTube">
          <input
            required
            type="url"
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            className={inputCls}
            placeholder="https://www.youtube.com/watch?v=..."
          />
        </Field>
        <Field label="Tiêu đề video">
          <input
            value={youtubeTitle}
            onChange={(e) => setYoutubeTitle(e.target.value)}
            className={inputCls}
          />
        </Field>
        <MFoot
          isSaving={isSaving}
          onCancel={() => setShowVideoModal(null)}
          submitLabel="Đính kèm"
        />
      </form>
    </Modal>
  );
}

export function UploadVideoModal(state: ContentPageState) {
  const {
    fileRef,
    isSaving,
    setUploadLesson,
    uploadLesson,
    uploadVideo,
  } = state;
  if (!uploadLesson) return null;
  return (
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
          accept="video/mp4,video/quicktime,video/webm"
          className="block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-600 file:px-3 file:py-2 file:text-sm file:text-white"
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
              const f = fileRef.current?.files?.[0];
              if (f) void uploadVideo(uploadLesson.id, f);
            }}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {isSaving ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Upload size={14} />
            )}{" "}
            Tải lên
          </button>
        </div>
      </div>
    </Modal>
  );
}
