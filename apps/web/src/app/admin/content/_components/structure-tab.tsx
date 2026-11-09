"use client";

import { ChevronDown, ChevronRight, PlusCircle } from "lucide-react";
import { lessonTypeLabel, statusColors, statusLabel } from "./shared";
import type { ContentPageState } from "./use-content-page-state";

/** Tab "Cấu trúc": courses, units and lessons tree. */
export function StructureTab(state: ContentPageState) {
  const {
    activeTab,
    canEdit,
    courses,
    expandedCourses,
    isLoading,
    setExpandedCourses,
    setNewLessonTitle,
    setNewUnitTitle,
    setShowLessonModal,
    setShowUnitModal,
    toggle,
  } = state;
  if (!(!isLoading && activeTab === "structure")) return null;
  return (
    <div className="space-y-2">
      {courses.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-200 p-10 text-center text-sm text-slate-400">
          Chưa có khóa học.
        </div>
      )}
      {courses.map((course) => (
        <div
          key={course.id}
          className="rounded-2xl border border-slate-200 bg-white overflow-hidden"
        >
          <div
            className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-slate-50"
            onClick={() =>
              toggle(course.id, expandedCourses, setExpandedCourses)
            }
          >
            {expandedCourses.has(course.id) ? (
              <ChevronDown size={16} className="text-slate-400" />
            ) : (
              <ChevronRight size={16} className="text-slate-400" />
            )}
            <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-700">
              {course.level.code}
            </span>
            <span className="text-sm font-semibold text-slate-900 flex-1">
              {course.title}
            </span>
            <span className="text-xs text-slate-400">
              {course.units.length} chương
            </span>
            {canEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowUnitModal(course.id);
                  setNewUnitTitle("");
                }}
                className="flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-600 hover:bg-slate-100"
              >
                <PlusCircle size={12} /> Chương
              </button>
            )}
          </div>
          {expandedCourses.has(course.id) && (
            <div className="border-t border-slate-100 divide-y divide-slate-100">
              {course.units.map((unit) => (
                <div key={unit.id} className="pl-10 pr-4 py-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-slate-700 flex-1">
                      {unit.title}
                    </span>
                    {canEdit && (
                      <button
                        onClick={() => {
                          setShowLessonModal({ unitId: unit.id });
                          setNewLessonTitle("");
                        }}
                        className="flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-600 hover:bg-slate-100"
                      >
                        <PlusCircle size={12} /> Bài học
                      </button>
                    )}
                  </div>
                  {(unit.lessons ?? []).length === 0 && (
                    <p className="text-xs text-slate-400">
                      Chưa có bài học.
                    </p>
                  )}
                  <div className="space-y-1">
                    {(unit.lessons ?? []).map((l) => (
                      <div
                        key={l.id}
                        className="flex items-center gap-2 rounded-lg px-3 py-1.5 bg-slate-50 text-sm"
                      >
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[l.status]}`}
                        >
                          {statusLabel[l.status]}
                        </span>
                        <span className="text-slate-700 flex-1">
                          {l.title}
                        </span>
                        <span className="text-xs text-slate-400">
                          {lessonTypeLabel[l.type] ?? l.type}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {course.units.length === 0 && (
                <p className="px-10 py-3 text-sm text-slate-400">
                  Chưa có chương.
                </p>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
