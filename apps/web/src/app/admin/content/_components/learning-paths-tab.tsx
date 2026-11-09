"use client";

import { PlusCircle, Send } from "lucide-react";
import { formatStatusVi } from "../../_lib/admin-client";
import { SectionLabel, inputCls, statusColors, statusLabel } from "./shared";
import type { ContentPageState } from "./use-content-page-state";

/** Tab "Lộ trình": learning paths, content packages and assignments. */
export function LearningPathsTab(state: ContentPageState) {
  const {
    activeTab,
    addLearningPathItem,
    archivePackage,
    archivePath,
    assignPackage,
    assignmentChildProfileId,
    assignmentPackageId,
    canEdit,
    canPublish,
    contentPackages,
    createContentPackage,
    createLearningPath,
    isLoading,
    isSaving,
    learningPaths,
    lessons,
    packageCode,
    packageDescription,
    packagePathId,
    packageTitle,
    pathAgeBand,
    pathCode,
    pathDescription,
    pathItemLessonId,
    pathItemPathId,
    pathItemSequence,
    pathLevelId,
    pathTitle,
    publishPackage,
    publishPath,
    setAssignmentChildProfileId,
    setAssignmentPackageId,
    setPackageCode,
    setPackageDescription,
    setPackagePathId,
    setPackageTitle,
    setPathAgeBand,
    setPathCode,
    setPathDescription,
    setPathItemLessonId,
    setPathItemPathId,
    setPathItemSequence,
    setPathLevelId,
    setPathTitle,
    submitPathReview,
  } = state;
  if (!(!isLoading && activeTab === "paths")) return null;
  return (
    <div className="space-y-4">
      <div className="grid gap-4 xl:grid-cols-3">
        {canEdit && (
          <form
            onSubmit={createLearningPath}
            className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3"
          >
            <SectionLabel>Lộ trình mới</SectionLabel>
            <div className="grid grid-cols-2 gap-2">
              <input
                required
                value={pathCode}
                onChange={(e) => setPathCode(e.target.value)}
                className={inputCls}
                placeholder="Mã"
              />
              <input
                value={pathAgeBand}
                onChange={(e) => setPathAgeBand(e.target.value)}
                className={inputCls}
                placeholder="Nhóm tuổi"
              />
            </div>
            <input
              required
              value={pathTitle}
              onChange={(e) => setPathTitle(e.target.value)}
              className={inputCls}
              placeholder="Tiêu đề"
            />
            <input
              value={pathLevelId}
              onChange={(e) => setPathLevelId(e.target.value)}
              className={inputCls}
              placeholder="Mã trình độ"
            />
            <textarea
              rows={2}
              value={pathDescription}
              onChange={(e) => setPathDescription(e.target.value)}
              className={inputCls}
              placeholder="Mô tả"
            />
            <button
              disabled={isSaving}
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              <PlusCircle size={14} /> Tạo lộ trình
            </button>
          </form>
        )}

        {canEdit && (
          <form
            onSubmit={addLearningPathItem}
            className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3"
          >
            <SectionLabel>Thêm bài học</SectionLabel>
            <select
              required
              value={pathItemPathId}
              onChange={(e) => setPathItemPathId(e.target.value)}
              className={inputCls}
            >
              <option value="">Chọn lộ trình</option>
              {learningPaths.map((path) => (
                <option key={path.id} value={path.id}>
                  {path.code} — {path.title}
                </option>
              ))}
            </select>
            <select
              required
              value={pathItemLessonId}
              onChange={(e) => setPathItemLessonId(e.target.value)}
              className={inputCls}
            >
              <option value="">Chọn bài học</option>
              {lessons.map((lesson) => (
                <option key={lesson.id} value={lesson.id}>
                  {lesson.title} / {formatStatusVi(lesson.status)}
                </option>
              ))}
            </select>
            <input
              required
              min={1}
              type="number"
              value={pathItemSequence}
              onChange={(e) => setPathItemSequence(e.target.value)}
              className={inputCls}
              placeholder="Thứ tự"
            />
            <button
              disabled={isSaving || !pathItemPathId || !pathItemLessonId}
              className="flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-700 disabled:opacity-50"
            >
              <PlusCircle size={14} /> Thêm mục
            </button>
          </form>
        )}

        {canEdit && (
          <form
            onSubmit={createContentPackage}
            className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3"
          >
            <SectionLabel>Gói mới</SectionLabel>
            <div className="grid grid-cols-2 gap-2">
              <input
                required
                value={packageCode}
                onChange={(e) => setPackageCode(e.target.value)}
                className={inputCls}
                placeholder="Mã"
              />
              <input
                required
                value={packageTitle}
                onChange={(e) => setPackageTitle(e.target.value)}
                className={inputCls}
                placeholder="Tiêu đề"
              />
            </div>
            <select
              required
              value={packagePathId}
              onChange={(e) => setPackagePathId(e.target.value)}
              className={inputCls}
            >
              <option value="">Chọn lộ trình</option>
              {learningPaths.map((path) => (
                <option key={path.id} value={path.id}>
                  {path.code} — {path.title} / {formatStatusVi(path.status)}
                </option>
              ))}
            </select>
            <textarea
              rows={2}
              value={packageDescription}
              onChange={(e) => setPackageDescription(e.target.value)}
              className={inputCls}
              placeholder="Mô tả"
            />
            <button
              disabled={isSaving || !packagePathId}
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              <PlusCircle size={14} /> Tạo gói
            </button>
          </form>
        )}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.3fr_1fr]">
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
          <div className="border-b border-slate-100 px-4 py-3">
            <p className="text-sm font-semibold text-slate-900">
              Lộ trình học
            </p>
          </div>
          <div className="divide-y divide-slate-100">
            {learningPaths.length === 0 && (
              <p className="px-4 py-8 text-center text-sm text-slate-400">
                Chưa có lộ trình học.
              </p>
            )}
            {learningPaths.map((path) => (
              <div key={path.id} className="px-4 py-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[path.status]}`}
                      >
                        {statusLabel[path.status]}
                      </span>
                      <span className="text-xs text-slate-400">
                        {path.code}
                      </span>
                    </div>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {path.title}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {path.level?.code ?? "Chưa có trình độ"} /{" "}
                      {path.ageBand || "Chưa có nhóm tuổi"} /{" "}
                      {path._count.items} mục / {path._count.packages} gói
                    </p>
                  </div>
                  <div className="flex flex-wrap justify-end gap-1.5">
                    {canEdit && path.status === "DRAFT" && (
                      <button
                        onClick={() => submitPathReview(path.id)}
                        className="rounded-lg border border-indigo-200 bg-indigo-50 px-2.5 py-1.5 text-xs font-medium text-indigo-700"
                      >
                        Gửi
                      </button>
                    )}
                    {canPublish && path.status === "IN_REVIEW" && (
                      <button
                        onClick={() => publishPath(path.id)}
                        className="rounded-lg border border-green-200 bg-green-50 px-2.5 py-1.5 text-xs font-medium text-green-700"
                      >
                        Xuất bản
                      </button>
                    )}
                    {canEdit && path.status !== "ARCHIVED" && (
                      <button
                        onClick={() => archivePath(path.id)}
                        className="rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-600"
                      >
                        Lưu trữ
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
            <div className="border-b border-slate-100 px-4 py-3">
              <p className="text-sm font-semibold text-slate-900">
                Gói nội dung
              </p>
            </div>
            <div className="divide-y divide-slate-100">
              {contentPackages.length === 0 && (
                <p className="px-4 py-8 text-center text-sm text-slate-400">
                  Chưa có gói nội dung.
                </p>
              )}
              {contentPackages.map((pkg) => (
                <div key={pkg.id} className="px-4 py-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${pkg.status === "PUBLISHED" ? "bg-green-100 text-green-700" : pkg.status === "ARCHIVED" ? "bg-red-100 text-red-600" : "bg-slate-100 text-slate-600"}`}
                        >
                          {formatStatusVi(pkg.status)}
                        </span>
                        <span className="text-xs text-slate-400">
                          {pkg.code}
                        </span>
                      </div>
                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        {pkg.title}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {pkg.learningPath.code} / {pkg._count.assignments}{" "}
                        lượt phân công
                      </p>
                    </div>
                    <div className="flex flex-wrap justify-end gap-1.5">
                      {canPublish && pkg.status === "DRAFT" && (
                        <button
                          onClick={() => publishPackage(pkg.id)}
                          className="rounded-lg border border-green-200 bg-green-50 px-2.5 py-1.5 text-xs font-medium text-green-700"
                        >
                          Xuất bản
                        </button>
                      )}
                      {canEdit && pkg.status !== "ARCHIVED" && (
                        <button
                          onClick={() => archivePackage(pkg.id)}
                          className="rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-600"
                        >
                          Lưu trữ
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {canPublish && (
            <form
              onSubmit={assignPackage}
              className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3"
            >
              <SectionLabel>Gán gói</SectionLabel>
              <input
                required
                value={assignmentChildProfileId}
                onChange={(e) =>
                  setAssignmentChildProfileId(e.target.value)
                }
                className={inputCls}
                placeholder="Mã hồ sơ học sinh"
              />
              <select
                required
                value={assignmentPackageId}
                onChange={(e) => setAssignmentPackageId(e.target.value)}
                className={inputCls}
              >
                <option value="">Chọn gói đã xuất bản</option>
                {contentPackages
                  .filter((pkg) => pkg.status === "PUBLISHED")
                  .map((pkg) => (
                    <option key={pkg.id} value={pkg.id}>
                      {pkg.code} — {pkg.title}
                    </option>
                  ))}
              </select>
              <button
                disabled={isSaving || !assignmentPackageId}
                className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                <Send size={14} /> Gán
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
