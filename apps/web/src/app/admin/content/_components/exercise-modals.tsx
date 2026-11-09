"use client";

import { Field, MFoot, Modal, activityTypeLabel, inputCls } from "./shared";
import type { ContentPageState } from "./use-content-page-state";

export function NewActivityModal(state: ContentPageState) {
  const {
    activityTitle,
    activityType,
    createActivity,
    isSaving,
    setActivityTitle,
    setActivityType,
    setShowActivityModal,
    showActivityModal,
  } = state;
  if (!showActivityModal) return null;
  return (
    <Modal
      title={`Thêm khối bài luyện — ${showActivityModal.title}`}
      onClose={() => setShowActivityModal(null)}
    >
      <form
        onSubmit={(e) => createActivity(e, showActivityModal.id)}
        className="space-y-4"
      >
        <Field label="Tiêu đề khối">
          <input
            required
            value={activityTitle}
            onChange={(e) => setActivityTitle(e.target.value)}
            className={inputCls}
            placeholder="ví dụ: Kiểm tra từ vựng"
          />
        </Field>
        <Field label="Loại bài luyện">
          <select
            value={activityType}
            onChange={(e) => setActivityType(e.target.value)}
            className={inputCls}
          >
            {[
              "QUIZ",
              "VOCAB_GAME",
              "LISTENING",
              "SPEAKING",
              "WRITING",
              "AI_CHAT",
            ].map((t) => (
              <option key={t} value={t}>
                {activityTypeLabel[t] ?? t}
              </option>
            ))}
          </select>
        </Field>
        <MFoot
          isSaving={isSaving}
          onCancel={() => setShowActivityModal(null)}
          submitLabel="Tạo khối"
        />
      </form>
    </Modal>
  );
}

export function EditActivityModal(state: ContentPageState) {
  const {
    editActivityTitle,
    editingActivity,
    isSaving,
    setEditActivityTitle,
    setEditingActivity,
    updateActivity,
  } = state;
  if (!editingActivity) return null;
  return (
    <Modal
      title={`Chỉnh sửa khối — ${editingActivity.title}`}
      onClose={() => setEditingActivity(null)}
    >
      <form onSubmit={updateActivity} className="space-y-4">
        <Field label="Tiêu đề khối">
          <input
            required
            value={editActivityTitle}
            onChange={(e) => setEditActivityTitle(e.target.value)}
            className={inputCls}
          />
        </Field>
        <MFoot
          isSaving={isSaving}
          submitLabel="Lưu"
          onCancel={() => setEditingActivity(null)}
        />
      </form>
    </Modal>
  );
}
