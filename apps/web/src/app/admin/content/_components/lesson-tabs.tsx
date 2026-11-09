"use client";

import { LessonCard, statusLabel } from "./shared";
import type { ContentPageState } from "./use-content-page-state";

/** Tab "Bài học": lesson list with filters. */
export function LessonsTab(state: ContentPageState) {
  const {
    activeTab,
    archiveLesson,
    canEdit,
    canPublish,
    deleteActivity,
    deleteQuestion,
    deleteVideo,
    displayedLessons,
    expandedLessons,
    filterStatus,
    hasMoreLessons,
    isLoading,
    isSaving,
    loadMore,
    publishLesson,
    setActivityTitle,
    setActivityType,
    setAnswers,
    setEditActivityTitle,
    setEditDescription,
    setEditLesson,
    setEditQAnswers,
    setEditQExplanation,
    setEditQPoints,
    setEditQPrompt,
    setEditQType,
    setEditTitle,
    setEditType,
    setEditingActivity,
    setEditingQuestion,
    setExpandedLessons,
    setFilterStatus,
    setQuestionExplanation,
    setQuestionPoints,
    setQuestionPrompt,
    setQuestionType,
    setSelectedTagIds,
    setShowActivityModal,
    setShowQuestionModal,
    setShowTagsModal,
    setShowVideoModal,
    setUploadLesson,
    setYoutubeTitle,
    setYoutubeUrl,
    submitReview,
    toggle,
  } = state;
  if (!(!isLoading && activeTab === "bài học")) return null;
  return (
    <div className="space-y-3">
      <div className="flex gap-2 flex-wrap">
        {(
          ["ALL", "DRAFT", "IN_REVIEW", "PUBLISHED", "ARCHIVED"] as const
        ).map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${filterStatus === s ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
          >
            {s === "ALL" ? "Tất cả" : statusLabel[s]}
          </button>
        ))}
      </div>
      {displayedLessons.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-200 p-10 text-center text-sm text-slate-400">
          Chưa có bài học. Hãy dùng tab Cấu trúc khóa học để tạo mới.
        </div>
      )}
      {displayedLessons.map((lesson) => (
        <LessonCard
          key={lesson.id}
          lesson={lesson}
          canEdit={canEdit}
          canPublish={canPublish}
          isSaving={isSaving}
          expanded={expandedLessons.has(lesson.id)}
          onToggleExpand={() =>
            toggle(lesson.id, expandedLessons, setExpandedLessons)
          }
          onEditLesson={() => {
            setEditLesson(lesson);
            setEditTitle(lesson.title);
            setEditDescription(lesson.description ?? "");
            setEditType(lesson.type);
          }}
          onAttachYouTube={() => {
            setShowVideoModal(lesson);
            setYoutubeUrl("");
            setYoutubeTitle("");
          }}
          onUpload={() => setUploadLesson(lesson)}
          onAddExercise={() => {
            setShowActivityModal(lesson);
            setActivityTitle("");
            setActivityType("QUIZ");
          }}
          onAddQuestion={(a) => {
            setShowQuestionModal(a);
            setQuestionPrompt("");
            setQuestionExplanation("");
            setQuestionType("SINGLE_CHOICE");
            setQuestionPoints("1");
            setAnswers([
              { text: "", isCorrect: false },
              { text: "", isCorrect: false },
            ]);
          }}
          onEditActivity={(a) => {
            setEditingActivity(a);
            setEditActivityTitle(a.title);
          }}
          onEditQuestion={(q, aid) => {
            setEditingQuestion({ question: q, activityId: aid });
            setEditQPrompt(q.prompt);
            setEditQExplanation(q.explanation ?? "");
            setEditQPoints(String(q.points));
            setEditQType(q.type);
            setEditQAnswers(
              q.answers.map((a) => ({
                text: a.text,
                isCorrect: a.isCorrect,
              })),
            );
          }}
          onEditTags={() => {
            setShowTagsModal(lesson);
            setSelectedTagIds(new Set(lesson.tags.map((t) => t.tag.id)));
          }}
          onSubmitReview={() => submitReview(lesson.id)}
          onPublish={() => publishLesson(lesson.id)}
          onArchive={() => archiveLesson(lesson.id)}
          onDeleteVideo={(vid) => deleteVideo(lesson.id, vid)}
          onDeleteActivity={(aid) => deleteActivity(lesson.id, aid)}
          onDeleteQuestion={(aid, qid) => deleteQuestion(aid, qid)}
        />
      ))}
      {hasMoreLessons && (
        <div className="flex justify-center pt-2">
          <button
            onClick={() => void loadMore()}
            className="rounded-lg border border-slate-200 bg-white px-5 py-2 text-sm text-slate-600 hover:bg-slate-50"
          >
            Xem thêm
          </button>
        </div>
      )}
    </div>
  );
}

/** Tab "Duyệt": lessons waiting for review. */
export function ReviewTab(state: ContentPageState) {
  const {
    activeTab,
    archiveLesson,
    canEdit,
    canPublish,
    deleteActivity,
    deleteQuestion,
    deleteVideo,
    expandedLessons,
    hasMoreLessons,
    isLoading,
    isSaving,
    lessons,
    loadMore,
    publishLesson,
    setActivityTitle,
    setActivityType,
    setAnswers,
    setEditActivityTitle,
    setEditDescription,
    setEditLesson,
    setEditQAnswers,
    setEditQExplanation,
    setEditQPoints,
    setEditQPrompt,
    setEditQType,
    setEditTitle,
    setEditType,
    setEditingActivity,
    setEditingQuestion,
    setExpandedLessons,
    setQuestionExplanation,
    setQuestionPoints,
    setQuestionPrompt,
    setQuestionType,
    setSelectedTagIds,
    setShowActivityModal,
    setShowQuestionModal,
    setShowTagsModal,
    setShowVideoModal,
    setUploadLesson,
    setYoutubeTitle,
    setYoutubeUrl,
    submitReview,
    toggle,
  } = state;
  if (!(!isLoading && activeTab === "review")) return null;
  return (
    <div className="space-y-3">
      {lessons.filter((l) => l.status === "IN_REVIEW").length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-200 p-10 text-center text-sm text-slate-400">
          Không có bài học đang chờ duyệt.
        </div>
      )}
      {lessons
        .filter((l) => l.status === "IN_REVIEW")
        .map((lesson) => (
          <LessonCard
            key={lesson.id}
            lesson={lesson}
            canEdit={canEdit}
            canPublish={canPublish}
            isSaving={isSaving}
            expanded={expandedLessons.has(lesson.id)}
            onToggleExpand={() =>
              toggle(lesson.id, expandedLessons, setExpandedLessons)
            }
            onEditLesson={() => {
              setEditLesson(lesson);
              setEditTitle(lesson.title);
              setEditDescription(lesson.description ?? "");
              setEditType(lesson.type);
            }}
            onAttachYouTube={() => {
              setShowVideoModal(lesson);
              setYoutubeUrl("");
              setYoutubeTitle("");
            }}
            onUpload={() => setUploadLesson(lesson)}
            onAddExercise={() => {
              setShowActivityModal(lesson);
              setActivityTitle("");
              setActivityType("QUIZ");
            }}
            onAddQuestion={(a) => {
              setShowQuestionModal(a);
              setQuestionPrompt("");
              setQuestionExplanation("");
              setQuestionType("SINGLE_CHOICE");
              setQuestionPoints("1");
              setAnswers([
                { text: "", isCorrect: false },
                { text: "", isCorrect: false },
              ]);
            }}
            onEditActivity={(a) => {
              setEditingActivity(a);
              setEditActivityTitle(a.title);
            }}
            onEditQuestion={(q, aid) => {
              setEditingQuestion({ question: q, activityId: aid });
              setEditQPrompt(q.prompt);
              setEditQExplanation(q.explanation ?? "");
              setEditQPoints(String(q.points));
              setEditQType(q.type);
              setEditQAnswers(
                q.answers.map((a) => ({
                  text: a.text,
                  isCorrect: a.isCorrect,
                })),
              );
            }}
            onEditTags={() => {
              setShowTagsModal(lesson);
              setSelectedTagIds(new Set(lesson.tags.map((t) => t.tag.id)));
            }}
            onSubmitReview={() => submitReview(lesson.id)}
            onPublish={() => publishLesson(lesson.id)}
            onArchive={() => archiveLesson(lesson.id)}
            onDeleteVideo={(vid) => deleteVideo(lesson.id, vid)}
            onDeleteActivity={(aid) => deleteActivity(lesson.id, aid)}
            onDeleteQuestion={(aid, qid) => deleteQuestion(aid, qid)}
          />
        ))}
      {hasMoreLessons && (
        <div className="flex justify-center pt-2">
          <button
            onClick={() => void loadMore()}
            className="rounded-lg border border-slate-200 bg-white px-5 py-2 text-sm text-slate-600 hover:bg-slate-50"
          >
            Xem thêm
          </button>
        </div>
      )}
    </div>
  );
}
