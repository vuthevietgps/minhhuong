import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { adminFetch, adminJson, readApiError } from "../../_lib/admin-client";
import { hasAllowedRole, useStoredAdminSession } from "../../_lib/admin-session";
import { contentEditorRoles, contentPublishRoles } from "./shared";
import type { Activity, ContentOverview, ContentPackageSummary, ContentTag, Course, LearningPathSummary, Lesson, PublishStatus, Question } from "./shared";

/** State, effects and handlers of ContentPage, moved verbatim from page.tsx. */
export function useContentPageState() {
  const { loaded, roles } = useStoredAdminSession();
  const canEdit = hasAllowedRole(roles, contentEditorRoles);
  const canPublish = hasAllowedRole(roles, contentPublishRoles);
  const [overview, setOverview] = useState<ContentOverview | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [allTags, setAllTags] = useState<ContentTag[]>([]);
  const [learningPaths, setLearningPaths] = useState<LearningPathSummary[]>([]);
  const [contentPackages, setContentPackages] = useState<
    ContentPackageSummary[]
  >([]);
  const [activeTab, setActiveTab] = useState<
    "bài học" | "structure" | "paths" | "tags" | "review"
  >("bài học");
  const [filterStatus, setFilterStatus] = useState<"ALL" | PublishStatus>(
    "ALL",
  );
  const [expandedCourses, setExpandedCourses] = useState<Set<string>>(
    new Set(),
  );
  const [expandedLessons, setExpandedLessons] = useState<Set<string>>(
    new Set(),
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [toast, setToast] = useState<{ text: string; ok: boolean } | null>(
    null,
  );
  // Modals
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showUnitModal, setShowUnitModal] = useState<string | null>(null);
  const [showLessonModal, setShowLessonModal] = useState<{
    unitId: string;
  } | null>(null);
  const [editLesson, setEditLesson] = useState<Lesson | null>(null);
  const [showVideoModal, setShowVideoModal] = useState<Lesson | null>(null);
  const [uploadLesson, setUploadLesson] = useState<Lesson | null>(null);
  const [showActivityModal, setShowActivityModal] = useState<Lesson | null>(
    null,
  );
  const [showQuestionModal, setShowQuestionModal] = useState<Activity | null>(
    null,
  );
  const [showTagsModal, setShowTagsModal] = useState<Lesson | null>(null);
  const [showCreateTagModal, setShowCreateTagModal] = useState(false);
  // Form fields
  const [newCourseTitle, setNewCourseTitle] = useState("");
  const [newCourseLevel, setNewCourseLevel] = useState("A1");
  const [newUnitTitle, setNewUnitTitle] = useState("");
  const [newLessonTitle, setNewLessonTitle] = useState("");
  const [newLessonType, setNewLessonType] = useState("VIDEO");
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editType, setEditType] = useState("VIDEO");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [youtubeTitle, setYoutubeTitle] = useState("");
  const [activityTitle, setActivityTitle] = useState("");
  const [activityType, setActivityType] = useState("QUIZ");
  const [questionType, setQuestionType] = useState("SINGLE_CHOICE");
  const [questionPrompt, setQuestionPrompt] = useState("");
  const [questionExplanation, setQuestionExplanation] = useState("");
  const [questionPoints, setQuestionPoints] = useState("1");
  const [answers, setAnswers] = useState([
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
  ]);
  const [selectedTagIds, setSelectedTagIds] = useState<Set<string>>(new Set());
  const [newTagName, setNewTagName] = useState("");
  const [newTagKind, setNewTagKind] = useState("TOPIC");
  const [editingTag, setEditingTag] = useState<ContentTag | null>(null);
  const [editTagName, setEditTagName] = useState("");
  const [editTagKind, setEditTagKind] = useState("TOPIC");
  const fileRef = useRef<HTMLInputElement>(null);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [editActivityTitle, setEditActivityTitle] = useState("");
  const [editingQuestion, setEditingQuestion] = useState<{
    question: Question;
    activityId: string;
  } | null>(null);
  const [editQPrompt, setEditQPrompt] = useState("");
  const [editQExplanation, setEditQExplanation] = useState("");
  const [editQPoints, setEditQPoints] = useState("1");
  const [editQType, setEditQType] = useState("SINGLE_CHOICE");
  const [editQAnswers, setEditQAnswers] = useState<
    Array<{ text: string; isCorrect: boolean }>
  >([]);
  const [hasMoreLessons, setHasMoreLessons] = useState(false);
  const [lessonsCursor, setLessonsCursor] = useState<string | undefined>(
    undefined,
  );
  const [newTagColor, setNewTagColor] = useState("#94a3b8");
  const [editTagColor, setEditTagColor] = useState("#94a3b8");
  const [pathCode, setPathCode] = useState("");
  const [pathTitle, setPathTitle] = useState("");
  const [pathLevelId, setPathLevelId] = useState("");
  const [pathAgeBand, setPathAgeBand] = useState("");
  const [pathDescription, setPathDescription] = useState("");
  const [pathItemPathId, setPathItemPathId] = useState("");
  const [pathItemLessonId, setPathItemLessonId] = useState("");
  const [pathItemSequence, setPathItemSequence] = useState("1");
  const [packageCode, setPackageCode] = useState("");
  const [packageTitle, setPackageTitle] = useState("");
  const [packagePathId, setPackagePathId] = useState("");
  const [packageDescription, setPackageDescription] = useState("");
  const [assignmentChildProfileId, setAssignmentChildProfileId] = useState("");
  const [assignmentPackageId, setAssignmentPackageId] = useState("");
  const showToast = useCallback((text: string, ok = true) => {
    setToast({ text, ok });
    window.setTimeout(() => setToast(null), 3500);
  }, []);
  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const [ov, crs, ls, tags] = await Promise.all([
        adminJson<ContentOverview>("/admin/content/overview"),
        adminJson<Course[]>("/admin/content/courses"),
        adminJson<Lesson[]>("/admin/content/lessons?take=50"),
        adminJson<ContentTag[]>("/admin/content/tags"),
      ]);
      setOverview(ov);
      setCourses(crs);
      setLessons(ls);
      setLessonsCursor(ls.length === 50 ? ls[ls.length - 1]?.id : undefined);
      setHasMoreLessons(ls.length === 50);
      setAllTags(tags);
      setMessage("");
      const [paths, packages] = await Promise.all([
        adminJson<LearningPathSummary[]>("/admin/learning-paths"),
        adminJson<ContentPackageSummary[]>("/admin/content-packages"),
      ]);
      setLearningPaths(paths);
      setContentPackages(packages);
      setPathItemPathId((current) => current || paths[0]?.id || "");
      setPackagePathId(
        (current) =>
          current ||
          paths.find((path) => path.status === "PUBLISHED")?.id ||
          paths[0]?.id ||
          "",
      );
      setAssignmentPackageId(
        (current) =>
          current ||
          packages.find((pkg) => pkg.status === "PUBLISHED")?.id ||
          packages[0]?.id ||
          "",
      );
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, []);
  useEffect(() => {
    if (!loaded) {
      return;
    }

    const timer = window.setTimeout(() => {
      void load();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loaded, load]);
  useEffect(() => {
    const hasProcessing = lessons.some((l) =>
      l.videos.some((v) => v.processingStatus === "PROCESSING"),
    );
    if (!hasProcessing) return;
    const timer = window.setInterval(() => void load(), 5000);
    return () => window.clearInterval(timer);
  }, [lessons, load]);
  const act = async (fn: () => Promise<unknown>, successMsg: string) => {
    setIsSaving(true);
    try {
      await fn();
      showToast(successMsg);
      void load();
    } catch (err) {
      showToast((err as Error).message, false);
    } finally {
      setIsSaving(false);
    }
  };
  const createCourse = (e: FormEvent) => {
    e.preventDefault();
    void act(
      () =>
        adminJson("/admin/content/courses", {
          method: "POST",
          body: JSON.stringify({
            title: newCourseTitle,
            levelCode: newCourseLevel,
          }),
        }),
      "Đã tạo khóa học.",
    );
    setShowCourseModal(false);
    setNewCourseTitle("");
  };
  const createUnit = (e: FormEvent) => {
    e.preventDefault();
    void act(
      () =>
        adminJson("/admin/content/units", {
          method: "POST",
          body: JSON.stringify({
            courseId: showUnitModal,
            title: newUnitTitle,
          }),
        }),
      "Đã tạo chương.",
    );
    setShowUnitModal(null);
    setNewUnitTitle("");
  };
  const createLesson = (e: FormEvent) => {
    e.preventDefault();
    void act(
      () =>
        adminJson("/admin/content/lessons", {
          method: "POST",
          body: JSON.stringify({
            unitId: showLessonModal?.unitId,
            title: newLessonTitle,
            type: newLessonType,
          }),
        }),
      "Đã tạo bài học ở trạng thái nháp.",
    );
    setShowLessonModal(null);
    setNewLessonTitle("");
  };
  const updateLesson = (e: FormEvent) => {
    e.preventDefault();
    void act(
      () =>
        adminJson(`/admin/content/lessons/${editLesson?.id}`, {
          method: "PATCH",
          body: JSON.stringify({
            title: editTitle,
            description: editDescription,
            type: editType,
          }),
        }),
      "Đã cập nhật bài học.",
    );
    setEditLesson(null);
  };
  const archiveLesson = (lessonId: string) =>
    void act(
      () =>
        adminJson(`/admin/content/lessons/${lessonId}/archive`, {
          method: "POST",
        }),
      "Đã lưu trữ bài học.",
    );
  const deleteVideo = (lessonId: string, videoId: string) =>
    void act(
      () =>
        adminJson(`/admin/content/lessons/${lessonId}/videos/${videoId}`, {
          method: "DELETE",
        }),
      "Đã xóa video.",
    );
  const deleteActivity = (lessonId: string, activityId: string) =>
    void act(
      () =>
        adminJson(
          `/admin/content/lessons/${lessonId}/activities/${activityId}`,
          { method: "DELETE" },
        ),
      "Đã xóa bài luyện.",
    );
  const deleteQuestion = (activityId: string, questionId: string) =>
    void act(
      () =>
        adminJson(
          `/admin/content/activities/${activityId}/questions/${questionId}`,
          { method: "DELETE" },
        ),
      "Đã xóa câu hỏi.",
    );
  const submitReview = (lessonId: string) =>
    void act(
      () =>
        adminJson(`/admin/content/lessons/${lessonId}/submit-review`, {
          method: "POST",
        }),
      "Đã gửi duyệt.",
    );
  const publishLesson = (lessonId: string) =>
    void act(
      () =>
        adminJson(`/admin/content/lessons/${lessonId}/publish`, {
          method: "POST",
        }),
      "Đã xuất bản bài học!",
    );
  const saveLessonTags = (lessonId: string) =>
    void act(
      () =>
        adminJson(`/admin/content/lessons/${lessonId}/tags`, {
          method: "POST",
          body: JSON.stringify({ tagIds: [...selectedTagIds] }),
        }),
      "Đã cập nhật thẻ.",
    ).then(() => setShowTagsModal(null));
  const createTag = (e: FormEvent) => {
    e.preventDefault();
    void act(
      () =>
        adminJson("/admin/content/tags", {
          method: "POST",
          body: JSON.stringify({
            name: newTagName,
            kind: newTagKind,
            color: newTagColor,
          }),
        }),
      "Đã tạo thẻ.",
    );
    setShowCreateTagModal(false);
    setNewTagName("");
    setNewTagColor("#94a3b8");
  };
  const updateTag = (e: FormEvent) => {
    e.preventDefault();
    if (!editingTag) return;
    void act(
      () =>
        adminJson(`/admin/content/tags/${editingTag.id}`, {
          method: "PATCH",
          body: JSON.stringify({
            name: editTagName,
            kind: editTagKind,
            color: editTagColor,
          }),
        }),
      "Đã cập nhật thẻ.",
    );
    setEditingTag(null);
  };
  const archiveTag = (tagId: string) =>
    void act(
      () => adminJson(`/admin/content/tags/${tagId}`, { method: "DELETE" }),
      "Đã lưu trữ thẻ.",
    );
  const createLearningPath = (e: FormEvent) => {
    e.preventDefault();
    const payload = {
      code: pathCode,
      title: pathTitle,
      levelId: pathLevelId || undefined,
      ageBand: pathAgeBand || undefined,
      description: pathDescription || undefined,
    };
    void act(
      () =>
        adminJson("/admin/learning-paths", {
          method: "POST",
          body: JSON.stringify(payload),
        }),
      "Đã tạo lộ trình học.",
    );
    setPathCode("");
    setPathTitle("");
    setPathLevelId("");
    setPathAgeBand("");
    setPathDescription("");
  };
  const addLearningPathItem = (e: FormEvent) => {
    e.preventDefault();
    void act(
      () =>
        adminJson(`/admin/learning-paths/${pathItemPathId}/items`, {
          method: "POST",
          body: JSON.stringify({
            lessonId: pathItemLessonId,
            sequence: parseInt(pathItemSequence, 10) || 1,
          }),
        }),
      "Đã thêm bài học vào lộ trình.",
    );
    setPathItemLessonId("");
    setPathItemSequence("1");
  };
  const submitPathReview = (pathId: string) =>
    void act(
      () =>
        adminJson(`/admin/learning-paths/${pathId}/submit-review`, {
          method: "POST",
        }),
      "Đã gửi lộ trình để duyệt.",
    );
  const publishPath = (pathId: string) =>
    void act(
      () =>
        adminJson(`/admin/learning-paths/${pathId}/publish`, {
          method: "POST",
        }),
      "Đã xuất bản lộ trình.",
    );
  const archivePath = (pathId: string) =>
    void act(
      () =>
        adminJson(`/admin/learning-paths/${pathId}/archive`, {
          method: "POST",
        }),
      "Đã lưu trữ lộ trình.",
    );
  const createContentPackage = (e: FormEvent) => {
    e.preventDefault();
    void act(
      () =>
        adminJson("/admin/content-packages", {
          method: "POST",
          body: JSON.stringify({
            code: packageCode,
            title: packageTitle,
            learningPathId: packagePathId,
            description: packageDescription || undefined,
          }),
        }),
      "Đã tạo gói nội dung.",
    );
    setPackageCode("");
    setPackageTitle("");
    setPackageDescription("");
  };
  const publishPackage = (packageId: string) =>
    void act(
      () =>
        adminJson(`/admin/content-packages/${packageId}/publish`, {
          method: "POST",
        }),
      "Đã xuất bản gói.",
    );
  const archivePackage = (packageId: string) =>
    void act(
      () =>
        adminJson(`/admin/content-packages/${packageId}/archive`, {
          method: "POST",
        }),
      "Đã lưu trữ gói.",
    );
  const assignPackage = (e: FormEvent) => {
    e.preventDefault();
    void act(
      () =>
        adminJson(
          `/admin/children/${assignmentChildProfileId}/content-assignments`,
          {
            method: "POST",
            body: JSON.stringify({ contentPackageId: assignmentPackageId }),
          },
        ),
      "Đã gán gói.",
    );
  };
  const attachYouTube = (e: FormEvent, lessonId: string) => {
    e.preventDefault();
    void act(
      () =>
        adminJson(`/admin/content/lessons/${lessonId}/videos/link`, {
          method: "POST",
          body: JSON.stringify({
            url: youtubeUrl,
            title: youtubeTitle || "Video",
            provider: "YOUTUBE",
          }),
        }),
      "Đã đính kèm video YouTube.",
    );
    setShowVideoModal(null);
  };
  const uploadVideo = async (lessonId: string, file: File) => {
    setIsSaving(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("title", file.name);
      const res = await adminFetch(
        `/admin/content/lessons/${lessonId}/videos/upload`,
        { method: "POST", body: fd },
      );
      if (!res.ok)
        throw new Error(await readApiError(res, "Tải lên thất bại."));
      setUploadLesson(null);
      showToast("Đã tải video.");
      void load();
    } catch (err) {
      showToast((err as Error).message, false);
    } finally {
      setIsSaving(false);
    }
  };
  const createActivity = (e: FormEvent, lessonId: string) => {
    e.preventDefault();
    void act(
      () =>
        adminJson(`/admin/content/lessons/${lessonId}/activities`, {
          method: "POST",
          body: JSON.stringify({ title: activityTitle, type: activityType }),
        }),
      "Đã tạo bài luyện.",
    );
    setShowActivityModal(null);
    setActivityTitle("");
  };
  const createQuestion = (e: FormEvent, activityId: string) => {
    e.preventDefault();
    const payload = {
      type: questionType,
      prompt: questionPrompt,
      explanation: questionExplanation || undefined,
      points: parseInt(questionPoints, 10) || 1,
      answers: answers
        .filter((a) => a.text.trim())
        .map((a) => ({ text: a.text, isCorrect: a.isCorrect })),
    };
    void act(
      () =>
        adminJson(`/admin/content/activities/${activityId}/questions`, {
          method: "POST",
          body: JSON.stringify(payload),
        }),
      "Đã thêm câu hỏi.",
    );
    setShowQuestionModal(null);
    setQuestionPrompt("");
    setQuestionExplanation("");
    setAnswers([
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
    ]);
  };
  const loadMore = async () => {
    if (!lessonsCursor) return;
    try {
      const more = await adminJson<Lesson[]>(
        `/admin/content/lessons?take=50&cursor=${lessonsCursor}`,
      );
      setLessons((prev) => [...prev, ...more]);
      setLessonsCursor(
        more.length === 50 ? more[more.length - 1]?.id : undefined,
      );
      setHasMoreLessons(more.length === 50);
    } catch (err) {
      showToast((err as Error).message, false);
    }
  };
  const updateActivity = (e: FormEvent) => {
    e.preventDefault();
    if (!editingActivity) return;
    void act(
      () =>
        adminJson(`/admin/content/activities/${editingActivity.id}`, {
          method: "PATCH",
          body: JSON.stringify({ title: editActivityTitle }),
        }),
      "Đã cập nhật bài luyện.",
    );
    setEditingActivity(null);
  };
  const updateQuestion = (e: FormEvent) => {
    e.preventDefault();
    if (!editingQuestion) return;
    const payload = {
      prompt: editQPrompt,
      explanation: editQExplanation || null,
      points: parseInt(editQPoints, 10) || 1,
      answers: editQAnswers
        .filter((a) => a.text.trim())
        .map((a, i) => ({
          text: a.text,
          isCorrect: a.isCorrect,
          sortOrder: i,
        })),
    };
    void act(
      () =>
        adminJson(`/admin/content/questions/${editingQuestion.question.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        }),
      "Đã cập nhật câu hỏi.",
    );
    setEditingQuestion(null);
  };
  const displayedLessons =
    filterStatus === "ALL"
      ? lessons
      : lessons.filter((l) => l.status === filterStatus);
  const toggle = (
    id: string,
    set: Set<string>,
    setter: (s: Set<string>) => void,
  ) => {
    const next = new Set(set);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setter(next);
  };

  return {
    loaded,
    roles,
    canEdit,
    canPublish,
    overview,
    setOverview,
    courses,
    setCourses,
    lessons,
    setLessons,
    allTags,
    setAllTags,
    learningPaths,
    setLearningPaths,
    contentPackages,
    setContentPackages,
    activeTab,
    setActiveTab,
    filterStatus,
    setFilterStatus,
    expandedCourses,
    setExpandedCourses,
    expandedLessons,
    setExpandedLessons,
    isLoading,
    setIsLoading,
    isSaving,
    setIsSaving,
    message,
    setMessage,
    toast,
    setToast,
    showCourseModal,
    setShowCourseModal,
    showUnitModal,
    setShowUnitModal,
    showLessonModal,
    setShowLessonModal,
    editLesson,
    setEditLesson,
    showVideoModal,
    setShowVideoModal,
    uploadLesson,
    setUploadLesson,
    showActivityModal,
    setShowActivityModal,
    showQuestionModal,
    setShowQuestionModal,
    showTagsModal,
    setShowTagsModal,
    showCreateTagModal,
    setShowCreateTagModal,
    newCourseTitle,
    setNewCourseTitle,
    newCourseLevel,
    setNewCourseLevel,
    newUnitTitle,
    setNewUnitTitle,
    newLessonTitle,
    setNewLessonTitle,
    newLessonType,
    setNewLessonType,
    editTitle,
    setEditTitle,
    editDescription,
    setEditDescription,
    editType,
    setEditType,
    youtubeUrl,
    setYoutubeUrl,
    youtubeTitle,
    setYoutubeTitle,
    activityTitle,
    setActivityTitle,
    activityType,
    setActivityType,
    questionType,
    setQuestionType,
    questionPrompt,
    setQuestionPrompt,
    questionExplanation,
    setQuestionExplanation,
    questionPoints,
    setQuestionPoints,
    answers,
    setAnswers,
    selectedTagIds,
    setSelectedTagIds,
    newTagName,
    setNewTagName,
    newTagKind,
    setNewTagKind,
    editingTag,
    setEditingTag,
    editTagName,
    setEditTagName,
    editTagKind,
    setEditTagKind,
    fileRef,
    editingActivity,
    setEditingActivity,
    editActivityTitle,
    setEditActivityTitle,
    editingQuestion,
    setEditingQuestion,
    editQPrompt,
    setEditQPrompt,
    editQExplanation,
    setEditQExplanation,
    editQPoints,
    setEditQPoints,
    editQType,
    setEditQType,
    editQAnswers,
    setEditQAnswers,
    hasMoreLessons,
    setHasMoreLessons,
    lessonsCursor,
    setLessonsCursor,
    newTagColor,
    setNewTagColor,
    editTagColor,
    setEditTagColor,
    pathCode,
    setPathCode,
    pathTitle,
    setPathTitle,
    pathLevelId,
    setPathLevelId,
    pathAgeBand,
    setPathAgeBand,
    pathDescription,
    setPathDescription,
    pathItemPathId,
    setPathItemPathId,
    pathItemLessonId,
    setPathItemLessonId,
    pathItemSequence,
    setPathItemSequence,
    packageCode,
    setPackageCode,
    packageTitle,
    setPackageTitle,
    packagePathId,
    setPackagePathId,
    packageDescription,
    setPackageDescription,
    assignmentChildProfileId,
    setAssignmentChildProfileId,
    assignmentPackageId,
    setAssignmentPackageId,
    showToast,
    load,
    act,
    createCourse,
    createUnit,
    createLesson,
    updateLesson,
    archiveLesson,
    deleteVideo,
    deleteActivity,
    deleteQuestion,
    submitReview,
    publishLesson,
    saveLessonTags,
    createTag,
    updateTag,
    archiveTag,
    createLearningPath,
    addLearningPathItem,
    submitPathReview,
    publishPath,
    archivePath,
    createContentPackage,
    publishPackage,
    archivePackage,
    assignPackage,
    attachYouTube,
    uploadVideo,
    createActivity,
    createQuestion,
    loadMore,
    updateActivity,
    updateQuestion,
    displayedLessons,
    toggle,
  };
}

export type ContentPageState = ReturnType<typeof useContentPageState>;
