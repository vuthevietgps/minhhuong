"use client";

import {
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Eye,
  FilePen,
  FileVideo,
  Layers,
  Link2,
  Loader2,
  Pencil,
  PlusCircle,
  RefreshCw,
  Send,
  Tag,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import {
  FormEvent,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  adminFetch,
  adminJson,
  formatStatusVi,
  readApiError,
} from "../_lib/admin-client";
import { hasAllowedRole, useStoredAdminSession } from "../_lib/admin-session";

const contentEditorRoles = ["ADMIN", "CONTENT_EDITOR"] as const;
const contentPublishRoles = ["ADMIN"] as const;

type PublishStatus = "DRAFT" | "IN_REVIEW" | "PUBLISHED" | "ARCHIVED";
type Answer = {
  id: string;
  text: string;
  isCorrect: boolean;
  sortOrder: number;
};
type Question = {
  id: string;
  type: string;
  prompt: string;
  explanation?: string | null;
  points: number;
  answers: Answer[];
};
type Activity = {
  id: string;
  title: string;
  type: string;
  sortOrder: number;
  questions: Question[];
};
type TagRef = { id: string; name: string; kind: string; color?: string | null };
type VideoAsset = {
  id: string;
  title?: string | null;
  provider: string;
  processingStatus: string;
};
type Lesson = {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  status: PublishStatus;
  type: string;
  sortOrder: number;
  updatedAt: string;
  videos: VideoAsset[];
  activities: Activity[];
  tags: Array<{ tag: TagRef }>;
  unit: {
    id: string;
    title: string;
    course: { id: string; title: string; level: { code: string } };
  };
};
type Unit = {
  id: string;
  title: string;
  sortOrder: number;
  lessons?: Lesson[];
};
type Course = {
  id: string;
  title: string;
  isPublished: boolean;
  level: { code: string };
  units: Unit[];
};
type ContentOverview = {
  courses: number;
  lessons: number;
  videos: number;
  status: { drafts: number; inReview: number; published: number };
};
type ContentTag = {
  id: string;
  name: string;
  kind: string;
  color?: string | null;
  isActive: boolean;
  _count: { lessons: number };
};
type LearningPathSummary = {
  id: string;
  code: string;
  title: string;
  description?: string | null;
  ageBand?: string | null;
  status: PublishStatus;
  level?: { code: string; title: string } | null;
  _count: { items: number; packages: number };
};
type ContentPackageSummary = {
  id: string;
  code: string;
  title: string;
  description?: string | null;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  learningPath: {
    id: string;
    code: string;
    title: string;
    status: PublishStatus;
  };
  plan?: { id: string; code: string; name: string } | null;
  _count: { assignments: number };
};

const statusColors: Record<PublishStatus, string> = {
  DRAFT: "bg-slate-100 text-slate-600",
  IN_REVIEW: "bg-amber-100 text-amber-700",
  PUBLISHED: "bg-green-100 text-green-700",
  ARCHIVED: "bg-red-100 text-red-600",
};
const statusLabel: Record<PublishStatus, string> = {
  DRAFT: "Bản nháp",
  IN_REVIEW: "Đang chờ duyệt",
  PUBLISHED: "Đã xuất bản",
  ARCHIVED: "Đã lưu trữ",
};

const lessonTypeLabel: Record<string, string> = {
  VIDEO: "Video",
  READING: "Bài đọc",
  LISTENING: "Nghe",
  SPEAKING: "Nói",
  WRITING: "Viết",
  QUIZ: "Bài kiểm tra",
  MIXED: "Kết hợp",
};

const activityTypeLabel: Record<string, string> = {
  QUIZ: "Bài kiểm tra",
  VOCAB_GAME: "Trò chơi từ vựng",
  LISTENING: "Luyện nghe",
  SPEAKING: "Luyện nói",
  WRITING: "Luyện viết",
  AI_CHAT: "Trò chuyện AI",
};

const questionTypeLabel: Record<string, string> = {
  SINGLE_CHOICE: "Một đáp án",
  MULTIPLE_CHOICE: "Nhiều đáp án",
  TEXT_INPUT: "Nhập văn bản",
  ORDERING: "Sắp xếp",
};

const tagKindLabel: Record<string, string> = {
  TOPIC: "Chủ đề",
  AUDIENCE: "Đối tượng",
  LEVEL: "Trình độ",
  SKILL: "Kỹ năng",
  FORMAT: "Định dạng",
  INTENT: "Mục đích",
  CUSTOM: "Tùy chỉnh",
};

const videoProviderLabel: Record<string, string> = {
  YOUTUBE: "YouTube",
  UPLOAD: "Tệp tải lên",
  LOCAL: "Tệp nội bộ",
};
const inputCls =
  "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300";

export default function ContentPage() {
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

  if (!loaded) return null;
  return (
    <div className="px-6 py-6 lg:px-8 lg:py-8 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Quản lý nội dung</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            Quản lý khóa học, bài học, bài luyện và thẻ.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => void load()}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
          >
            <RefreshCw size={14} />
          </button>
          {canEdit && (
            <button
              onClick={() => {
                setShowCourseModal(true);
                setNewCourseTitle("");
              }}
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              <PlusCircle size={14} /> Khóa học mới
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      {overview && (
        <div className="grid grid-cols-3 gap-3 lg:grid-cols-6">
          {[
            {
              label: "Khóa học",
              value: overview.courses,
              icon: Layers,
              color: "text-indigo-500",
            },
            {
              label: "Bài học",
              value: overview.lessons,
              icon: BookOpen,
              color: "text-slate-600",
            },
            {
              label: "Video",
              value: overview.videos,
              icon: FileVideo,
              color: "text-blue-500",
            },
            {
              label: "Bản nháp",
              value: overview.status.drafts,
              icon: FilePen,
              color: "text-slate-500",
            },
            {
              label: "Đang chờ duyệt",
              value: overview.status.inReview,
              icon: Eye,
              color: "text-amber-500",
            },
            {
              label: "Đã xuất bản",
              value: overview.status.published,
              icon: CheckCircle2,
              color: "text-green-600",
            },
          ].map(({ label, value, icon: Icon, color }) => (
            <div
              key={label}
              className="rounded-2xl border border-slate-200 bg-white p-4"
            >
              <div className={`mb-1.5 ${color}`}>
                <Icon size={16} />
              </div>
              <p className="text-xl font-bold text-slate-900">{value}</p>
              <p className="text-xs text-slate-500">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200">
        {(
          [
            "bài học",
            "structure",
            "paths",
            "tags",
            ...(canPublish ? ["review"] : []),
          ] as const
        ).map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t as typeof activeTab)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${activeTab === t ? "border-indigo-600 text-indigo-700" : "border-transparent text-slate-500 hover:text-slate-700"}`}
          >
            {t === "bài học" ? (
              "Tất cả bài học"
            ) : t === "structure" ? (
              "Cấu trúc khóa học"
            ) : t === "paths" ? (
              "Lộ trình học"
            ) : t === "tags" ? (
              "Thẻ và chủ đề"
            ) : (
              <span className="flex items-center gap-1.5">
                Danh sách chờ duyệt
                {overview && overview.status.inReview > 0 && (
                  <span className="rounded-full bg-amber-500 text-white text-xs px-1.5 py-0.5 leading-none">
                    {overview.status.inReview}
                  </span>
                )}
              </span>
            )}
          </button>
        ))}
      </div>

      {message && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {message}
        </div>
      )}
      {isLoading && (
        <div className="flex items-center gap-2 py-10 text-slate-400 text-sm">
          <Loader2 size={16} className="animate-spin" /> Đang tải…
        </div>
      )}

      {/* All Lessons tab */}
      {!isLoading && activeTab === "bài học" && (
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
      )}

      {/* Course Structure tab */}
      {!isLoading && activeTab === "structure" && (
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
      )}

      {/* Review Queue tab (ADMIN only) */}
      {!isLoading && activeTab === "review" && (
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
      )}

      {/* Learning Paths tab */}
      {!isLoading && activeTab === "paths" && (
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
      )}

      {/* Tags tab */}
      {!isLoading && activeTab === "tags" && (
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
      )}

      {/* ── Modals ────────────────────────────────────────────────────────── */}
      {showCourseModal && (
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
      )}

      {showUnitModal && (
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
      )}

      {showLessonModal && (
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
      )}

      {editLesson && (
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
      )}

      {showVideoModal && (
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
      )}

      {uploadLesson && (
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
      )}

      {showActivityModal && (
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
      )}

      {showQuestionModal && (
        <Modal
          title={`Thêm câu hỏi — ${showQuestionModal.title}`}
          onClose={() => setShowQuestionModal(null)}
          wide
        >
          <form
            onSubmit={(e) => createQuestion(e, showQuestionModal.id)}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-3">
              <Field label="Loại câu hỏi">
                <select
                  value={questionType}
                  onChange={(e) => setQuestionType(e.target.value)}
                  className={inputCls}
                >
                  {[
                    "SINGLE_CHOICE",
                    "MULTIPLE_CHOICE",
                    "TEXT_INPUT",
                    "ORDERING",
                  ].map((t) => (
                    <option key={t} value={t}>
                      {questionTypeLabel[t] ?? t}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Điểm">
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={questionPoints}
                  onChange={(e) => setQuestionPoints(e.target.value)}
                  className={inputCls}
                />
              </Field>
            </div>
            <Field label="Nội dung câu hỏi">
              <textarea
                required
                rows={3}
                value={questionPrompt}
                onChange={(e) => setQuestionPrompt(e.target.value)}
                className={inputCls}
                placeholder="Ví dụ: Từ tiếng Anh của 'chào' là gì?"
              />
            </Field>
            <Field label="Giải thích (hiển thị sau khi trả lời)">
              <input
                value={questionExplanation}
                onChange={(e) => setQuestionExplanation(e.target.value)}
                className={inputCls}
              />
            </Field>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-slate-700">
                  Các lựa chọn trả lời
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setAnswers([...answers, { text: "", isCorrect: false }])
                  }
                  className="text-xs text-indigo-600 hover:underline"
                >
                  + Thêm lựa chọn
                </button>
              </div>
              <div className="space-y-2">
                {answers.map((ans, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type={
                        questionType === "MULTIPLE_CHOICE"
                          ? "checkbox"
                          : "radio"
                      }
                      name="correct"
                      checked={ans.isCorrect}
                      onChange={() =>
                        setAnswers(
                          answers.map((a, j) => ({
                            ...a,
                            isCorrect:
                              questionType === "MULTIPLE_CHOICE"
                                ? j === i
                                  ? !a.isCorrect
                                  : a.isCorrect
                                : j === i,
                          })),
                        )
                      }
                      className="accent-indigo-600"
                    />
                    <input
                      value={ans.text}
                      onChange={(e) => {
                        const n = [...answers];
                        n[i] = { ...n[i], text: e.target.value };
                        setAnswers(n);
                      }}
                      className={`${inputCls} flex-1`}
                      placeholder={`Lựa chọn ${i + 1}`}
                    />
                    {answers.length > 2 && (
                      <button
                        type="button"
                        onClick={() =>
                          setAnswers(answers.filter((_, j) => j !== i))
                        }
                        className="text-slate-400 hover:text-red-500"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <p className="mt-1.5 text-xs text-slate-400">
                {questionType === "MULTIPLE_CHOICE"
                  ? "Chọn tất cả đáp án đúng."
                  : "Chọn một đáp án đúng."}
              </p>
            </div>
            <MFoot
              isSaving={isSaving}
              onCancel={() => setShowQuestionModal(null)}
              submitLabel="Thêm câu hỏi"
            />
          </form>
        </Modal>
      )}

      {showTagsModal && (
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
      )}

      {showCreateTagModal && (
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
      )}

      {editingTag && (
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
      )}

      {editingActivity && (
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
      )}

      {editingQuestion && (
        <Modal
          title="Sửa câu hỏi"
          onClose={() => setEditingQuestion(null)}
          wide
        >
          <form onSubmit={updateQuestion} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Loại câu hỏi">
                <select
                  value={editQType}
                  disabled
                  className={`${inputCls} bg-slate-50 text-slate-400`}
                >
                  {[
                    "SINGLE_CHOICE",
                    "MULTIPLE_CHOICE",
                    "TEXT_INPUT",
                    "ORDERING",
                  ].map((t) => (
                    <option key={t} value={t}>
                      {questionTypeLabel[t] ?? t}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Điểm">
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={editQPoints}
                  onChange={(e) => setEditQPoints(e.target.value)}
                  className={inputCls}
                />
              </Field>
            </div>
            <Field label="Nội dung câu hỏi">
              <textarea
                required
                rows={3}
                value={editQPrompt}
                onChange={(e) => setEditQPrompt(e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="Giải thích (hiển thị sau khi trả lời)">
              <input
                value={editQExplanation}
                onChange={(e) => setEditQExplanation(e.target.value)}
                className={inputCls}
              />
            </Field>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-slate-700">
                  Các lựa chọn trả lời
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setEditQAnswers([
                      ...editQAnswers,
                      { text: "", isCorrect: false },
                    ])
                  }
                  className="text-xs text-indigo-600 hover:underline"
                >
                  + Thêm lựa chọn
                </button>
              </div>
              <div className="space-y-2">
                {editQAnswers.map((ans, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type={
                        editQType === "MULTIPLE_CHOICE" ? "checkbox" : "radio"
                      }
                      name="edit-correct"
                      checked={ans.isCorrect}
                      onChange={() =>
                        setEditQAnswers(
                          editQAnswers.map((a, j) => ({
                            ...a,
                            isCorrect:
                              editQType === "MULTIPLE_CHOICE"
                                ? j === i
                                  ? !a.isCorrect
                                  : a.isCorrect
                                : j === i,
                          })),
                        )
                      }
                      className="accent-indigo-600"
                    />
                    <input
                      value={ans.text}
                      onChange={(e) => {
                        const n = [...editQAnswers];
                        n[i] = { ...n[i], text: e.target.value };
                        setEditQAnswers(n);
                      }}
                      className={`${inputCls} flex-1`}
                      placeholder={`Lựa chọn ${i + 1}`}
                    />
                    {editQAnswers.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          setEditQAnswers(
                            editQAnswers.filter((_, j) => j !== i),
                          )
                        }
                        className="text-slate-400 hover:text-red-500"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <p className="mt-1.5 text-xs text-slate-400">
                {editQType === "MULTIPLE_CHOICE"
                  ? "Chọn tất cả đáp án đúng."
                  : "Chọn một đáp án đúng."}
              </p>
            </div>
            <MFoot
              isSaving={isSaving}
              submitLabel="Lưu thay đổi"
              onCancel={() => setEditingQuestion(null)}
            />
          </form>
        </Modal>
      )}

      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium shadow-lg ${toast.ok ? "bg-indigo-700 text-white" : "bg-red-600 text-white"}`}
        >
          {toast.ok ? <CheckCircle2 size={15} /> : <X size={15} />}
          {toast.text}
        </div>
      )}
    </div>
  );
}

function LessonCard({
  lesson,
  canEdit,
  canPublish,
  isSaving,
  expanded,
  onToggleExpand,
  onEditLesson,
  onAttachYouTube,
  onUpload,
  onAddExercise,
  onAddQuestion,
  onEditActivity,
  onEditQuestion,
  onEditTags,
  onSubmitReview,
  onPublish,
  onArchive,
  onDeleteVideo,
  onDeleteActivity,
  onDeleteQuestion,
}: {
  lesson: Lesson;
  canEdit: boolean;
  canPublish: boolean;
  isSaving: boolean;
  expanded: boolean;
  onToggleExpand: () => void;
  onEditLesson: () => void;
  onAttachYouTube: () => void;
  onUpload: () => void;
  onAddExercise: () => void;
  onAddQuestion: (a: Activity) => void;
  onEditActivity: (a: Activity) => void;
  onEditQuestion: (q: Question, activityId: string) => void;
  onEditTags: () => void;
  onSubmitReview: () => void;
  onPublish: () => void;
  onArchive: () => void;
  onDeleteVideo: (id: string) => void;
  onDeleteActivity: (id: string) => void;
  onDeleteQuestion: (aId: string, qId: string) => void;
}) {
  const isDraft = lesson.status === "DRAFT";
  const isInReview = lesson.status === "IN_REVIEW";
  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
      <div className="flex items-start gap-3 p-4">
        <button
          onClick={onToggleExpand}
          className="mt-0.5 flex-shrink-0 text-slate-400"
        >
          {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <span
              className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[lesson.status]}`}
            >
              {statusLabel[lesson.status]}
            </span>
            <span className="text-xs text-slate-400">
              {lesson.unit.course.level.code} › {lesson.unit.course.title} ›{" "}
              {lesson.unit.title}
            </span>
          </div>
          <p className="text-sm font-semibold text-slate-900">{lesson.title}</p>
          <div className="mt-1 flex items-center gap-3 text-xs text-slate-400">
            <span>{lessonTypeLabel[lesson.type] ?? lesson.type}</span>
            <span>{lesson.videos.length} video</span>
            <span>{lesson.activities.length} bài luyện</span>
            {lesson.tags.length > 0 && <span>{lesson.tags.length} thẻ</span>}
          </div>
        </div>
        {canEdit && isDraft && (
          <div className="flex items-center gap-1 flex-shrink-0 flex-wrap justify-end">
            <IBtn onClick={onEditLesson} title="Chỉnh sửa">
              <FilePen size={13} />
            </IBtn>
            <IBtn onClick={onAttachYouTube} title="YouTube">
              <Link2 size={13} />
            </IBtn>
            <IBtn onClick={onUpload} title="Tải lên">
              <Upload size={13} />
            </IBtn>
            <IBtn onClick={onAddExercise} title="Thêm bài luyện">
              <PlusCircle size={13} />
            </IBtn>
            <IBtn onClick={onEditTags} title="Thẻ">
              <Tag size={13} />
            </IBtn>
            <button
              onClick={onSubmitReview}
              disabled={isSaving}
              className="flex items-center gap-1 rounded-lg border border-indigo-200 bg-indigo-50 px-2.5 py-1.5 text-xs text-indigo-700 hover:bg-indigo-100 disabled:opacity-50"
            >
              <Send size={12} /> Gửi
            </button>
            <IBtn onClick={onArchive} title="Lưu trữ" danger>
              <Trash2 size={13} />
            </IBtn>
          </div>
        )}
        {canPublish && isInReview && (
          <button
            onClick={onPublish}
            disabled={isSaving}
            className="flex items-center gap-1 rounded-lg border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-100 disabled:opacity-50"
          >
            <CheckCircle2 size={13} /> Xuất bản
          </button>
        )}
      </div>
      {expanded && (
        <div className="border-t border-slate-100 px-4 py-3 space-y-4 bg-slate-50/60">
          <SectionLabel>Video</SectionLabel>
          {lesson.videos.length === 0 && (
            <p className="text-xs text-slate-400">Chưa có video.</p>
          )}
          {lesson.videos.map((v) => (
            <div
              key={v.id}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 mb-1"
            >
              <FileVideo size={13} className="text-slate-400" />
              <span className="flex-1 text-xs text-slate-700 truncate">
                {v.title ?? videoProviderLabel[v.provider] ?? v.provider}
              </span>
              <span className="text-xs text-slate-400">
                {videoProviderLabel[v.provider] ?? v.provider}
              </span>
              {canEdit && isDraft && (
                <button
                  onClick={() => onDeleteVideo(v.id)}
                  disabled={isSaving}
                  className="text-slate-300 hover:text-red-500 disabled:opacity-40"
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>
          ))}
          <SectionLabel>Bài luyện</SectionLabel>
          {lesson.activities.length === 0 && (
            <p className="text-xs text-slate-400">Chưa có bài luyện.</p>
          )}
          {lesson.activities.map((act) => (
            <div
              key={act.id}
              className="rounded-xl border border-slate-200 bg-white mb-2 overflow-hidden"
            >
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-100">
                <span className="flex-1 text-xs font-semibold text-slate-700">
                  {act.title}
                </span>
                <span className="text-xs text-slate-400">
                  {activityTypeLabel[act.type] ?? act.type}
                </span>
                {canEdit && isDraft && (
                  <>
                    <button
                      onClick={() => onEditActivity(act)}
                      className="rounded p-1 text-slate-400 hover:text-sky-600 hover:bg-sky-50"
                      title="Sửa nội dung"
                    >
                      <Pencil size={11} />
                    </button>
                    <button
                      onClick={() => onAddQuestion(act)}
                      className="rounded px-1.5 py-0.5 text-xs text-indigo-600 hover:bg-indigo-100"
                    >
                      + Câu hỏi
                    </button>
                    <button
                      onClick={() => onDeleteActivity(act.id)}
                      disabled={isSaving}
                      className="text-slate-300 hover:text-red-500 disabled:opacity-40"
                    >
                      <Trash2 size={12} />
                    </button>
                  </>
                )}
              </div>
              {act.questions.length === 0 && (
                <p className="px-3 py-2 text-xs text-slate-400">
                  Chưa có câu hỏi.
                </p>
              )}
              {act.questions.map((q, qi) => (
                <div
                  key={q.id}
                  className="border-t border-slate-100 px-3 py-2 flex items-start gap-2"
                >
                  <span className="text-xs text-slate-400 w-5">{qi + 1}.</span>
                  <div className="flex-1">
                    <p className="text-xs text-slate-800">{q.prompt}</p>
                    <div className="mt-1 flex gap-1.5 flex-wrap">
                      {q.answers.map((a) => (
                        <span
                          key={a.id}
                          className={`text-xs rounded px-1.5 py-0.5 ${a.isCorrect ? "bg-green-100 text-green-700 font-medium" : "bg-slate-100 text-slate-500"}`}
                        >
                          {a.text}
                        </span>
                      ))}
                    </div>
                  </div>
                  <span className="text-xs text-slate-400">
                    {questionTypeLabel[q.type] ?? q.type}
                  </span>
                  {canEdit && isDraft && (
                    <>
                      <button
                        onClick={() => onEditQuestion(q, act.id)}
                        className="rounded p-1 text-slate-400 hover:text-sky-600 hover:bg-sky-50"
                        title="Sửa câu hỏi"
                      >
                        <Pencil size={11} />
                      </button>
                      <button
                        onClick={() => onDeleteQuestion(act.id, q.id)}
                        disabled={isSaving}
                        className="text-slate-300 hover:text-red-500 disabled:opacity-40"
                      >
                        <Trash2 size={12} />
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          ))}
          {lesson.tags.length > 0 && (
            <>
              <SectionLabel>Thẻ</SectionLabel>
              <div className="flex gap-1.5 flex-wrap">
                {lesson.tags.map(({ tag }) => (
                  <span
                    key={tag.id}
                    className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-xs text-slate-600"
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function Modal({
  title,
  onClose,
  children,
  wide,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
      <div
        className={`w-full ${wide ? "max-w-2xl" : "max-w-md"} max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-xl`}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 px-5 py-4 bg-white">
          <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
          >
            <X size={16} />
          </button>
        </div>
        <div className="px-5 py-5">{children}</div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-700 mb-1">
        {label}
      </label>
      {children}
    </div>
  );
}

function MFoot({
  isSaving,
  onCancel,
  submitLabel = "Tạo",
}: {
  isSaving: boolean;
  onCancel: () => void;
  submitLabel?: string;
}) {
  return (
    <div className="flex justify-end gap-2 pt-2">
      <button
        type="button"
        onClick={onCancel}
        className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
      >
        Hủy
      </button>
      <button
        type="submit"
        disabled={isSaving}
        className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {isSaving && <Loader2 size={14} className="animate-spin" />}
        {submitLabel}
      </button>
    </div>
  );
}

function IBtn({
  children,
  onClick,
  title,
  danger,
}: {
  children: ReactNode;
  onClick: () => void;
  title?: string;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`rounded-lg border border-slate-200 p-1.5 transition-colors ${danger ? "text-red-400 hover:text-red-600 hover:bg-red-50 hover:border-red-200" : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"}`}
    >
      {children}
    </button>
  );
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
      {children}
    </p>
  );
}
