"use client";

import { Field, MFoot, Modal, inputCls } from "./shared";
import type { ContentPageState } from "./use-content-page-state";

export function NewCourseModal(state: ContentPageState) {
  const {
    createCourse,
    isSaving,
    newCourseLevel,
    newCourseTitle,
    setNewCourseLevel,
    setNewCourseTitle,
    setShowCourseModal,
    showCourseModal,
  } = state;
  if (!showCourseModal) return null;
  return (
    <Modal title="Khóa học mới" onClose={() => setShowCourseModal(false)}>
      <form onSubmit={createCourse} className="space-y-4">
        <Field label="Tiêu đề">
          <input
            required
            value={newCourseTitle}
            onChange={(e) => setNewCourseTitle(e.target.value)}
            className={inputCls}
          />
        </Field>
        <Field label="Trình độ">
          <select
            value={newCourseLevel}
            onChange={(e) => setNewCourseLevel(e.target.value)}
            className={inputCls}
          >
            {["STARTER", "A1", "A2", "B1", "B2", "C1", "C2"].map((l) => (
              <option key={l}>{l}</option>
            ))}
          </select>
        </Field>
        <MFoot
          isSaving={isSaving}
          onCancel={() => setShowCourseModal(false)}
        />
      </form>
    </Modal>
  );
}

export function NewUnitModal(state: ContentPageState) {
  const {
    createUnit,
    isSaving,
    newUnitTitle,
    setNewUnitTitle,
    setShowUnitModal,
    showUnitModal,
  } = state;
  if (!showUnitModal) return null;
  return (
    <Modal title="Chương mới" onClose={() => setShowUnitModal(null)}>
      <form onSubmit={createUnit} className="space-y-4">
        <Field label="Tiêu đề chương">
          <input
            required
            value={newUnitTitle}
            onChange={(e) => setNewUnitTitle(e.target.value)}
            className={inputCls}
            placeholder="ví dụ: Chương 1: Chào hỏi"
          />
        </Field>
        <MFoot
          isSaving={isSaving}
          onCancel={() => setShowUnitModal(null)}
        />
      </form>
    </Modal>
  );
}
