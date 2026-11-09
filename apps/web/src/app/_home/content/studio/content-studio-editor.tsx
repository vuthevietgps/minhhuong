"use client";

import { ClipboardList, FileVideo, Search, UploadCloud } from "lucide-react";
import { formatStatusCodeVi } from "../../lib/format";
import type { ContentTagKind } from "../../types";
import { tagKindLabels } from "./helpers";
import type { ContentStudioState } from "./use-content-studio-state";

/** Course, lesson, video and exercise editor forms. */
export function ContentStudioEditor(state: ContentStudioState) {
  const {
    activeCourseId,
    activeUnitId,
    activityTitle,
    answerOptions,
    archiveContentTag,
    beginEditTag,
    canManage,
    cancelEditTag,
    correctAnswerIndex,
    courses,
    createPracticeQuestion,
    createVideoLesson,
    createVideoSeries,
    description,
    editingTagId,
    explanation,
    isSaving,
    lessons,
    message,
    questionPrompt,
    saveContentTag,
    saveLessonTags,
    selectedCourse,
    selectedQuestionLesson,
    selectedTagIds,
    selectedTagLesson,
    seriesDescription,
    seriesLevelCode,
    seriesTitle,
    seriesUnitTitle,
    setActivityTitle,
    setAnswerOptions,
    setCorrectAnswerIndex,
    setCourseId,
    setDescription,
    setExplanation,
    setQuestionLessonId,
    setQuestionPrompt,
    setSelectedTagIds,
    setSeriesDescription,
    setSeriesLevelCode,
    setSeriesTitle,
    setSeriesUnitTitle,
    setTagColor,
    setTagKind,
    setTagLessonId,
    setTagName,
    setTitle,
    setUnitId,
    setVideoFile,
    setVideoTitle,
    setYoutubeUrl,
    tagColor,
    tagKind,
    tagName,
    tags,
    title,
    toggleSelectedTag,
    videoTitle,
    youtubeUrl,
  } = state;
  return (
    <div>
      {canManage ? (
        <>
          <form
            className="space-y-3 border-b border-slate-200 pb-4"
            onSubmit={createVideoSeries}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold">
                  Chuỗi bài học video
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Khóa học và chương đầu tiên cho chuỗi video theo thứ tự.
                </p>
              </div>
              <FileVideo className="text-slate-500" size={20} />
            </div>
            <div className="grid gap-3 sm:grid-cols-[90px_1fr]">
              <input
                className="h-10 rounded-lg border border-slate-300 px-3 text-sm"
                onChange={(event) => setSeriesLevelCode(event.target.value)}
                placeholder="A1"
                value={seriesLevelCode}
              />
              <input
                className="h-10 rounded-lg border border-slate-300 px-3 text-sm"
                onChange={(event) => setSeriesTitle(event.target.value)}
                placeholder="Tên chuỗi bài học"
                value={seriesTitle}
              />
            </div>
            <input
              className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm"
              onChange={(event) => setSeriesUnitTitle(event.target.value)}
              placeholder="Chương đầu tiên"
              value={seriesUnitTitle}
            />
            <textarea
              className="min-h-16 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              onChange={(event) => setSeriesDescription(event.target.value)}
              placeholder="Ghi chú"
              value={seriesDescription}
            />
            <button
              className="h-10 rounded-lg bg-slate-950 px-4 text-sm font-medium text-white disabled:opacity-60"
              disabled={isSaving}
              type="submit"
            >
              Tạo chuỗi bài học
            </button>
          </form>

          <div className="mt-4 border-b border-slate-200 pb-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold">Quản lý thẻ</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Chủ đề là thẻ dùng cho tìm kiếm, trò chơi và ngữ cảnh AI.
                </p>
              </div>
              <Search className="text-slate-500" size={20} />
            </div>

            <form
              className="mt-3 grid gap-3 sm:grid-cols-[1fr_130px_110px_auto]"
              onSubmit={saveContentTag}
            >
              <input
                className="h-10 rounded-lg border border-slate-300 px-3 text-sm"
                onChange={(event) => setTagName(event.target.value)}
                placeholder="Thẻ hoặc chủ đề"
                value={tagName}
              />
              <select
                className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm"
                onChange={(event) =>
                  setTagKind(event.target.value as ContentTagKind)
                }
                value={tagKind}
              >
                {(Object.keys(tagKindLabels) as ContentTagKind[]).map(
                  (kind) => (
                    <option key={kind} value={kind}>
                      {tagKindLabels[kind]}
                    </option>
                  ),
                )}
              </select>
              <input
                className="h-10 rounded-lg border border-slate-300 px-3 text-sm"
                onChange={(event) => setTagColor(event.target.value)}
                type="color"
                value={tagColor}
              />
              <button
                className="h-10 rounded-lg bg-slate-950 px-4 text-sm font-medium text-white disabled:opacity-60"
                disabled={isSaving}
                type="submit"
              >
                {editingTagId ? "Lưu" : "Thêm"}
              </button>
            </form>
            {editingTagId && (
              <button
                className="mt-2 h-8 rounded-lg border border-slate-200 px-3 text-xs font-medium"
                onClick={cancelEditTag}
                type="button"
              >
                Hủy chỉnh sửa
              </button>
            )}

            <div className="mt-3 max-h-36 divide-y divide-slate-200 overflow-auto border-y border-slate-200">
              {tags.map((tag) => (
                <div
                  className="flex items-center justify-between gap-3 py-2"
                  key={tag.id}
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {tagKindLabels[tag.kind]} / {tag.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {tag._count?.lessons ?? 0} bài học /{" "}
                      {tag.isActive ? "Đang hoạt động" : "Bị ẩn"}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      className="h-8 rounded-lg border border-slate-200 px-3 text-xs font-medium"
                      onClick={() => beginEditTag(tag)}
                      type="button"
                    >
                      Chỉnh sửa
                    </button>
                    <button
                      className="h-8 rounded-lg border border-rose-200 px-3 text-xs font-medium text-rose-700 disabled:opacity-60"
                      disabled={isSaving || !tag.isActive}
                      onClick={() => void archiveContentTag(tag)}
                      type="button"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <form className="mt-4 space-y-3" onSubmit={saveLessonTags}>
              <select
                className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm"
                onChange={(event) => {
                  const lesson = lessons.find(
                    (item) => item.id === event.target.value,
                  );
                  setTagLessonId(event.target.value);
                  setSelectedTagIds(
                    lesson?.tags?.map((item) => item.tag.id) ?? [],
                  );
                }}
                value={selectedTagLesson?.id ?? ""}
              >
                {lessons.map((lesson) => (
                  <option key={lesson.id} value={lesson.id}>
                    {lesson.title} - {formatStatusCodeVi(lesson.status)}
                  </option>
                ))}
              </select>
              <div className="flex max-h-32 flex-wrap gap-2 overflow-auto">
                {tags
                  .filter((tag) => tag.isActive)
                  .map((tag) => (
                    <button
                      className={`min-h-8 rounded-lg px-3 text-xs font-medium ring-1 ${
                        selectedTagIds.includes(tag.id)
                          ? "bg-teal-700 text-white ring-teal-700"
                          : "bg-white text-slate-700 ring-slate-200"
                      }`}
                      key={tag.id}
                      onClick={() => toggleSelectedTag(tag.id)}
                      type="button"
                    >
                      {tag.kind === "TOPIC"
                        ? "Chủ đề"
                        : tagKindLabels[tag.kind]}{" "}
                      / {tag.name}
                    </button>
                  ))}
              </div>
              <button
                className="h-10 rounded-lg bg-teal-700 px-4 text-sm font-medium text-white disabled:opacity-60"
                disabled={isSaving || !selectedTagLesson}
                type="submit"
              >
                Lưu thẻ bài học
              </button>
            </form>
          </div>

          <form className="mt-4 space-y-3" onSubmit={createVideoLesson}>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">
                  Khóa học
                </span>
                <select
                  className="mt-1 h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm"
                  onChange={(event) => {
                    const nextCourseId = event.target.value;
                    const nextCourse = courses.find(
                      (course) => course.id === nextCourseId,
                    );
                    setCourseId(nextCourseId);
                    setUnitId(nextCourse?.units[0]?.id ?? "");
                  }}
                  value={activeCourseId}
                >
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.level.code} - {course.title}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">
                  Chương / buổi học
                </span>
                <select
                  className="mt-1 h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm"
                  onChange={(event) => setUnitId(event.target.value)}
                  value={activeUnitId}
                >
                  {(selectedCourse?.units ?? []).map((unit) => (
                    <option key={unit.id} value={unit.id}>
                      {unit.title}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                Tên bài học
              </span>
              <input
                className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm"
                onChange={(event) => setTitle(event.target.value)}
                value={title}
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                Ghi chú bài học
              </span>
              <textarea
                className="mt-1 min-h-20 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                onChange={(event) => setDescription(event.target.value)}
                value={description}
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                Tên video
              </span>
              <input
                className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm"
                onChange={(event) => setVideoTitle(event.target.value)}
                placeholder="Không bắt buộc"
                value={videoTitle}
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                Liên kết YouTube
              </span>
              <input
                className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm"
                onChange={(event) => setYoutubeUrl(event.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                value={youtubeUrl}
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                Hoặc tải tệp video
              </span>
              <input
                accept="video/mp4,video/quicktime,video/webm,video/x-matroska"
                className="mt-1 block w-full text-sm text-slate-600"
                onChange={(event) =>
                  setVideoFile(event.target.files?.[0] ?? null)
                }
                type="file"
              />
            </label>

            <button
              className="flex h-10 items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-medium text-white disabled:opacity-60"
              disabled={isSaving}
              type="submit"
            >
              <UploadCloud size={18} />
              {isSaving ? "Đang lưu..." : "Tạo bài học"}
            </button>
            <p className="text-sm text-slate-500">{message}</p>
          </form>
        </>
      ) : (
        <div className="rounded-lg bg-slate-100 p-4 text-sm text-slate-600">
          Giám đốc chỉ được xem tại đây để theo dõi quy trình nội dung,
          trạng thái xuất bản và kho video.
        </div>
      )}

      {canManage && (
        <form
          className="mt-5 border-t border-slate-200 pt-4"
          onSubmit={createPracticeQuestion}
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold">Tạo câu hỏi nhanh</h3>
              <p className="mt-1 text-sm text-slate-500">
                Tạo câu hỏi trắc nghiệm một đáp án cho bài học.
              </p>
            </div>
            <ClipboardList className="text-slate-500" size={20} />
          </div>

          <label className="mt-3 block">
            <span className="text-sm font-medium text-slate-700">
              Bài học
            </span>
            <select
              className="mt-1 h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm"
              onChange={(event) => setQuestionLessonId(event.target.value)}
              value={selectedQuestionLesson?.id ?? ""}
            >
              {lessons.map((lesson) => (
                <option key={lesson.id} value={lesson.id}>
                  {lesson.title} - {formatStatusCodeVi(lesson.status)}
                </option>
              ))}
            </select>
          </label>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                Hoạt động
              </span>
              <input
                className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm"
                onChange={(event) => setActivityTitle(event.target.value)}
                value={activityTitle}
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                Đáp án đúng
              </span>
              <select
                className="mt-1 h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm"
                onChange={(event) =>
                  setCorrectAnswerIndex(Number(event.target.value))
                }
                value={correctAnswerIndex}
              >
                {answerOptions.map((_answer, index) => (
                  <option key={index} value={index}>
                    Lựa chọn {index + 1}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="mt-3 block">
            <span className="text-sm font-medium text-slate-700">
              Câu hỏi
            </span>
            <textarea
              className="mt-1 min-h-20 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              onChange={(event) => setQuestionPrompt(event.target.value)}
              value={questionPrompt}
            />
          </label>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {answerOptions.map((answer, index) => (
              <label className="block" key={index}>
                <span className="text-sm font-medium text-slate-700">
                  Lựa chọn {index + 1}
                </span>
                <input
                  className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm"
                  onChange={(event) => {
                    const next = [...answerOptions];
                    next[index] = event.target.value;
                    setAnswerOptions(next);
                  }}
                  value={answer}
                />
              </label>
            ))}
          </div>

          <label className="mt-3 block">
            <span className="text-sm font-medium text-slate-700">
              Giải thích
            </span>
            <textarea
              className="mt-1 min-h-16 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              onChange={(event) => setExplanation(event.target.value)}
              value={explanation}
            />
          </label>

          <button
            className="mt-3 flex h-10 items-center justify-center gap-2 rounded-lg bg-teal-700 px-4 text-sm font-medium text-white disabled:opacity-60"
            disabled={isSaving}
            type="submit"
          >
            <ClipboardList size={18} />
            Tạo câu hỏi
          </button>
        </form>
      )}
    </div>
  );
}
