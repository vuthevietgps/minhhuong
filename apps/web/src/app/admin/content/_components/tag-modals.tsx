"use client";

import { Loader2 } from "lucide-react";
import { Field, MFoot, Modal, inputCls, tagKindLabel } from "./shared";
import type { ContentPageState } from "./use-content-page-state";

export function LessonTagsModal(state: ContentPageState) {
  const {
    allTags,
    isSaving,
    saveLessonTags,
    selectedTagIds,
    setSelectedTagIds,
    setShowTagsModal,
    showTagsModal,
  } = state;
  if (!showTagsModal) return null;
  return (
    <Modal
      title={`Thẻ — ${showTagsModal.title}`}
      onClose={() => setShowTagsModal(null)}
    >
      <div className="space-y-4">
        <div className="max-h-56 overflow-y-auto space-y-1 rounded-lg border border-slate-200 p-3">
          {allTags
            .filter((t) => t.isActive)
            .map((tag) => (
              <label
                key={tag.id}
                className="flex items-center gap-2.5 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedTagIds.has(tag.id)}
                  className="accent-indigo-600"
                  onChange={() => {
                    const next = new Set(selectedTagIds);
                    if (next.has(tag.id)) {
                      next.delete(tag.id);
                    } else {
                      next.add(tag.id);
                    }
                    setSelectedTagIds(next);
                  }}
                />
                <span className="text-sm text-slate-700">{tag.name}</span>
                <span className="text-xs text-slate-400">
                  {tagKindLabel[tag.kind] ?? tag.kind}
                </span>
              </label>
            ))}
          {allTags.filter((t) => t.isActive).length === 0 && (
            <p className="text-sm text-slate-400">
              Không có thẻ đang hoạt động.
            </p>
          )}
        </div>
        <div className="flex justify-end gap-2">
          <button
            onClick={() => setShowTagsModal(null)}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
          >
            Hủy
          </button>
          <button
            onClick={() => saveLessonTags(showTagsModal.id)}
            disabled={isSaving}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {isSaving && <Loader2 size={14} className="animate-spin" />} Lưu
            thẻ
          </button>
        </div>
      </div>
    </Modal>
  );
}

export function NewTagModal(state: ContentPageState) {
  const {
    createTag,
    isSaving,
    newTagColor,
    newTagKind,
    newTagName,
    setNewTagColor,
    setNewTagKind,
    setNewTagName,
    setShowCreateTagModal,
    showCreateTagModal,
  } = state;
  if (!showCreateTagModal) return null;
  return (
    <Modal title="Thẻ mới" onClose={() => setShowCreateTagModal(false)}>
      <form onSubmit={createTag} className="space-y-4">
        <Field label="Tên">
          <input
            required
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            className={inputCls}
          />
        </Field>
        <Field label="Loại thẻ">
          <select
            value={newTagKind}
            onChange={(e) => setNewTagKind(e.target.value)}
            className={inputCls}
          >
            {[
              "TOPIC",
              "AUDIENCE",
              "LEVEL",
              "SKILL",
              "FORMAT",
              "INTENT",
              "CUSTOM",
            ].map((k) => (
              <option key={k} value={k}>
                {tagKindLabel[k] ?? k}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Màu sắc">
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={newTagColor}
              onChange={(e) => setNewTagColor(e.target.value)}
              className="h-8 w-10 cursor-pointer rounded border border-slate-200 p-0.5"
            />
            <span className="text-xs text-slate-500">{newTagColor}</span>
          </div>
        </Field>
        <MFoot
          isSaving={isSaving}
          onCancel={() => setShowCreateTagModal(false)}
        />
      </form>
    </Modal>
  );
}

export function EditTagModal(state: ContentPageState) {
  const {
    editTagColor,
    editTagKind,
    editTagName,
    editingTag,
    isSaving,
    setEditTagColor,
    setEditTagKind,
    setEditTagName,
    setEditingTag,
    updateTag,
  } = state;
  if (!editingTag) return null;
  return (
    <Modal
      title={`Chỉnh sửa thẻ — ${editingTag.name}`}
      onClose={() => setEditingTag(null)}
    >
      <form onSubmit={updateTag} className="space-y-4">
        <Field label="Tên">
          <input
            required
            value={editTagName}
            onChange={(e) => setEditTagName(e.target.value)}
            className={inputCls}
          />
        </Field>
        <Field label="Loại thẻ">
          <select
            value={editTagKind}
            onChange={(e) => setEditTagKind(e.target.value)}
            className={inputCls}
          >
            {[
              "TOPIC",
              "AUDIENCE",
              "LEVEL",
              "SKILL",
              "FORMAT",
              "INTENT",
              "CUSTOM",
            ].map((k) => (
              <option key={k} value={k}>
                {tagKindLabel[k] ?? k}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Màu sắc">
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={editTagColor}
              onChange={(e) => setEditTagColor(e.target.value)}
              className="h-8 w-10 cursor-pointer rounded border border-slate-200 p-0.5"
            />
            <span className="text-xs text-slate-500">{editTagColor}</span>
          </div>
        </Field>
        <MFoot
          isSaving={isSaving}
          submitLabel="Lưu"
          onCancel={() => setEditingTag(null)}
        />
      </form>
    </Modal>
  );
}
