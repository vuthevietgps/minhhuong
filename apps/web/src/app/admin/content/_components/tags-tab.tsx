"use client";

import { Pencil, PlusCircle, Trash2 } from "lucide-react";
import { tagKindLabel } from "./shared";
import type { ContentPageState } from "./use-content-page-state";

/** Tab "Thẻ": content tags. */
export function TagsTab(state: ContentPageState) {
  const {
    activeTab,
    allTags,
    archiveTag,
    canEdit,
    isLoading,
    isSaving,
    setEditTagColor,
    setEditTagKind,
    setEditTagName,
    setEditingTag,
    setNewTagKind,
    setNewTagName,
    setShowCreateTagModal,
  } = state;
  if (!(!isLoading && activeTab === "tags")) return null;
  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        {canEdit && (
          <button
            onClick={() => {
              setShowCreateTagModal(true);
              setNewTagName("");
              setNewTagKind("TOPIC");
            }}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            <PlusCircle size={14} /> Thẻ mới
          </button>
        )}
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden divide-y divide-slate-100">
        {allTags.length === 0 && (
          <p className="p-8 text-center text-sm text-slate-400">
            Chưa có thẻ.
          </p>
        )}
        {allTags.map((tag) => (
          <div key={tag.id} className="flex items-center gap-3 px-4 py-3">
            <div
              className="size-3 rounded-full"
              style={{ background: tag.color ?? "#94a3b8" }}
            />
            <span className="flex-1 text-sm font-medium text-slate-900">
              {tag.name}
            </span>
            <span className="text-xs text-slate-400">
              {tagKindLabel[tag.kind] ?? tag.kind}
            </span>
            <span className="text-xs text-slate-400">
              {tag._count.lessons} bài học
            </span>
            <span
              className={`rounded-full px-2 py-0.5 text-xs ${tag.isActive ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}
            >
              {tag.isActive ? "Đang hoạt động" : "Đã lưu trữ"}
            </span>
            {canEdit && tag.isActive && (
              <button
                onClick={() => {
                  setEditingTag(tag);
                  setEditTagName(tag.name);
                  setEditTagKind(tag.kind);
                  setEditTagColor(tag.color ?? "#94a3b8");
                }}
                disabled={isSaving}
                className="rounded p-1 text-slate-400 hover:text-sky-600 hover:bg-sky-50 disabled:opacity-40"
              >
                <Pencil size={13} />
              </button>
            )}
            {canEdit && tag.isActive && (
              <button
                onClick={() => archiveTag(tag.id)}
                disabled={isSaving}
                className="rounded p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 disabled:opacity-40"
              >
                <Trash2 size={13} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
