"use client";

import {
  ClipboardList,
  FileVideo,
  Search,
  UploadCloud,
} from "lucide-react";
import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { apiBaseUrl, readApiError, useAuthenticatedUploadUrl } from "../lib/api";
import { formatStatusCodeVi } from "../lib/format";
import type {
  ContentTag,
  ContentTagKind,
  Role,
  Session,
} from "../types";

type AdminVideo = {
  id: string;
  title?: string;
  provider: "INTERNAL" | "YOUTUBE" | "EXTERNAL";
  processingStatus: "PENDING" | "PROCESSING" | "READY" | "FAILED";
  sourceUrl?: string;
  embedUrl?: string;
  thumbnailUrl?: string;
};

type AdminLesson = {
  id: string;
  slug: string;
  title: string;
  description?: string;
  status: "DRAFT" | "IN_REVIEW" | "PUBLISHED" | "ARCHIVED";
  videos: AdminVideo[];
  activities: AdminActivity[];
  tags?: Array<{
    tag: ContentTag;
  }>;
  unit?: {
    title: string;
    course?: {
      title: string;
      level?: {
        code: string;
      };
    };
  };
};

type AdminAnswer = {
  id: string;
  text: string;
  isCorrect?: boolean;
  sortOrder: number;
};

type AdminQuestion = {
  id: string;
  type:
    | "SINGLE_CHOICE"
    | "MULTIPLE_CHOICE"
    | "TEXT_INPUT"
    | "ORDERING"
    | "SPEAKING";
  prompt: string;
  explanation?: string;
  points: number;
  answers: AdminAnswer[];
};

type AdminActivity = {
  id: string;
  title: string;
  description?: string;
  type:
    "QUIZ" | "VOCAB_GAME" | "LISTENING" | "SPEAKING" | "WRITING" | "AI_CHAT";
  questions: AdminQuestion[];
};

type AdminUnit = {
  id: string;
  title: string;
  lessons: AdminLesson[];
};

type AdminCourse = {
  id: string;
  title: string;
  slug: string;
  isPublished: boolean;
  level: {
    code: string;
    title: string;
  };
  units: AdminUnit[];
};

type ContentOverview = {
  courses: number;
  lessons: number;
  videos: number;
  status: {
    drafts: number;
    inReview: number;
    published: number;
  };
};

const tagKindLabels: Record<ContentTagKind, string> = {
  TOPIC: "Chủ đề",
  AUDIENCE: "Đối tượng",
  LEVEL: "Trình độ",
  SKILL: "Kỹ năng",
  FORMAT: "Định dạng",
  INTENT: "Mục tiêu",
  CUSTOM: "Tùy chỉnh",
};

export function ContentStudio({ role, session }: { role: Role; session: Session }) {
  const canManage = role === "ADMIN" || role === "CONTENT_EDITOR";
  const canPublish = role === "ADMIN";
  const [overview, setOverview] = useState<ContentOverview | null>(null);
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [lessons, setLessons] = useState<AdminLesson[]>([]);
  const [tags, setTags] = useState<ContentTag[]>([]);
  const [courseId, setCourseId] = useState("");
  const [unitId, setUnitId] = useState("");
  const [seriesLevelCode, setSeriesLevelCode] = useState("A1");
  const [seriesTitle, setSeriesTitle] = useState("Chuỗi học qua video mới");
  const [seriesDescription, setSeriesDescription] = useState("");
  const [seriesUnitTitle, setSeriesUnitTitle] = useState("Bắt đầu tại đây");
  const [tagName, setTagName] = useState("Thói quen hằng ngày");
  const [tagKind, setTagKind] = useState<ContentTagKind>("TOPIC");
  const [tagColor, setTagColor] = useState("#0f766e");
  const [editingTagId, setEditingTagId] = useState("");
  const [tagLessonId, setTagLessonId] = useState("");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [title, setTitle] = useState("Bài học video mới");
  const [description, setDescription] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [questionLessonId, setQuestionLessonId] = useState("");
  const [activityTitle, setActivityTitle] = useState("Kiểm tra nhanh");
  const [questionPrompt, setQuestionPrompt] = useState("Câu nào lịch sự hơn?");
  const [answerOptions, setAnswerOptions] = useState([
    "Gửi ngay đi.",
    "Bạn có thể gửi khi thuận tiện không?",
    "",
    "",
  ]);
  const [correctAnswerIndex, setCorrectAnswerIndex] = useState(1);
  const [explanation, setExplanation] = useState(
    "Cấu trúc “Could you...” lịch sự hơn trong tiếng Anh công sở.",
  );
  const [message, setMessage] = useState("Đang tải dữ liệu nội dung.");
  const [isSaving, setIsSaving] = useState(false);

  const authHeaders = useMemo(
    () => ({ Authorization: `Bearer ${session.accessToken}` }),
    [session.accessToken],
  );

  const activeCourseId = courseId || courses[0]?.id || "";
  const selectedCourse = courses.find((course) => course.id === activeCourseId);
  const activeUnitId = unitId || selectedCourse?.units[0]?.id || "";
  const selectedUnit =
    selectedCourse?.units.find((unit) => unit.id === activeUnitId) ??
    selectedCourse?.units[0];
  const previewVideo = lessons.flatMap((lesson) => lesson.videos).find(Boolean);
  const previewVideoUrl = useAuthenticatedUploadUrl(
    previewVideo?.sourceUrl,
    session.accessToken,
  );
  const selectedQuestionLesson =
    lessons.find((lesson) => lesson.id === questionLessonId) ??
    lessons.find((lesson) => lesson.status === "DRAFT") ??
    lessons[0];
  const selectedTagLesson =
    lessons.find((lesson) => lesson.id === tagLessonId) ??
    lessons.find((lesson) => lesson.status === "DRAFT") ??
    lessons[0];

  const loadContent = useCallback(async () => {
    try {
      const [overviewResponse, coursesResponse, lessonsResponse, tagsResponse] =
        await Promise.all([
          fetch(`${apiBaseUrl}/v1/admin/content/overview`, {
            headers: authHeaders,
          }),
          fetch(`${apiBaseUrl}/v1/admin/content/courses`, {
            headers: authHeaders,
          }),
          fetch(`${apiBaseUrl}/v1/admin/content/lessons`, {
            headers: authHeaders,
          }),
          fetch(`${apiBaseUrl}/v1/admin/content/tags`, {
            headers: authHeaders,
          }),
        ]);

      if (
        !overviewResponse.ok ||
        !coursesResponse.ok ||
        !lessonsResponse.ok ||
        !tagsResponse.ok
      ) {
        throw new Error("Vai trò này không được truy cập API nội dung.");
      }

      setOverview((await overviewResponse.json()) as ContentOverview);
      setCourses((await coursesResponse.json()) as AdminCourse[]);
      setLessons((await lessonsResponse.json()) as AdminLesson[]);
      setTags((await tagsResponse.json()) as ContentTag[]);
      setMessage(
        canManage
          ? "Sẵn sàng tạo bài học video."
          : "Tổng quan nội dung ở chế độ chỉ xem.",
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Không thể tải dữ liệu nội dung.",
      );
    }
  }, [authHeaders, canManage]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadContent();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadContent]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSelectedTagIds(
        selectedTagLesson?.tags?.map((item) => item.tag.id) ?? [],
      );
    }, 0);

    return () => window.clearTimeout(timer);
  }, [selectedTagLesson?.id, selectedTagLesson?.tags]);

  async function createVideoSeries(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canManage) {
      return;
    }

    setIsSaving(true);
    setMessage("Đang tạo chuỗi video...");

    try {
      const courseResponse = await fetch(
        `${apiBaseUrl}/v1/admin/content/courses`,
        {
          method: "POST",
          headers: {
            ...authHeaders,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            levelCode: seriesLevelCode,
            title: seriesTitle,
            description: seriesDescription,
            isPublished: false,
          }),
        },
      );
      if (!courseResponse.ok) {
        throw new Error(
          await readApiError(courseResponse, "Không thể tạo chuỗi video."),
        );
      }

      const course = (await courseResponse.json()) as AdminCourse;
      const unitResponse = await fetch(`${apiBaseUrl}/v1/admin/content/units`, {
        method: "POST",
        headers: {
          ...authHeaders,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courseId: course.id,
          title: seriesUnitTitle,
          sortOrder: 0,
        }),
      });
      if (!unitResponse.ok) {
        throw new Error(
          await readApiError(
            unitResponse,
            "Đã tạo chuỗi nhưng chưa tạo được chương.",
          ),
        );
      }

      const unit = (await unitResponse.json()) as AdminUnit;
      setCourseId(course.id);
      setUnitId(unit.id);
      setSeriesTitle("Chuỗi học qua video mới");
      setSeriesDescription("");
      setSeriesUnitTitle("Bắt đầu tại đây");
      setMessage("Đã tạo chuỗi video.");
      await loadContent();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Không thể tạo chuỗi video.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function saveContentTag(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canManage) {
      return;
    }

    setIsSaving(true);
    setMessage(editingTagId ? "Đang cập nhật thẻ..." : "Đang tạo thẻ...");

    try {
      const response = await fetch(
        editingTagId
          ? `${apiBaseUrl}/v1/admin/content/tags/${editingTagId}`
          : `${apiBaseUrl}/v1/admin/content/tags`,
        {
          method: editingTagId ? "PATCH" : "POST",
          headers: {
            ...authHeaders,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: tagName,
            kind: tagKind,
            color: tagColor,
            isActive: true,
          }),
        },
      );
      if (!response.ok) {
        throw new Error(await readApiError(response, "Không thể lưu thẻ."));
      }

      setEditingTagId("");
      setTagName(tagKind === "TOPIC" ? "Thói quen hằng ngày" : "Thẻ mới");
      setMessage(
        editingTagId
          ? "Đã cập nhật thẻ."
          : tagKind === "TOPIC"
            ? "Đã tạo chủ đề."
            : "Đã tạo thẻ.",
      );
      await loadContent();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Không thể lưu thẻ.");
    } finally {
      setIsSaving(false);
    }
  }

  async function archiveContentTag(tag: ContentTag) {
    if (!canManage) {
      return;
    }

    setIsSaving(true);
    setMessage("Đang xóa thẻ...");

    try {
      const response = await fetch(
        `${apiBaseUrl}/v1/admin/content/tags/${tag.id}`,
        {
          method: "DELETE",
          headers: {
            ...authHeaders,
          },
        },
      );
      if (!response.ok) {
        throw new Error(await readApiError(response, "Không thể xóa thẻ."));
      }

      setSelectedTagIds((current) =>
        current.filter((tagId) => tagId !== tag.id),
      );
      setMessage("Đã xóa thẻ.");
      await loadContent();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Không thể xóa thẻ.");
    } finally {
      setIsSaving(false);
    }
  }

  function beginEditTag(tag: ContentTag) {
    setEditingTagId(tag.id);
    setTagName(tag.name);
    setTagKind(tag.kind);
    setTagColor(tag.color ?? "#0f766e");
  }

  function cancelEditTag() {
    setEditingTagId("");
    setTagName(tagKind === "TOPIC" ? "Thói quen hằng ngày" : "Thẻ mới");
  }

  function toggleSelectedTag(tagId: string) {
    setSelectedTagIds((current) =>
      current.includes(tagId)
        ? current.filter((item) => item !== tagId)
        : [...current, tagId],
    );
  }

  async function saveLessonTags(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canManage || !selectedTagLesson) {
      return;
    }
    if (selectedTagLesson.status !== "DRAFT") {
      setMessage("Chỉ có thể đổi thẻ khi bài học đang ở trạng thái nháp.");
      return;
    }

    setIsSaving(true);
    setMessage("Đang lưu thẻ bài học...");

    try {
      const response = await fetch(
        `${apiBaseUrl}/v1/admin/content/lessons/${selectedTagLesson.id}/tags`,
        {
          method: "POST",
          headers: {
            ...authHeaders,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ tagIds: selectedTagIds }),
        },
      );
      if (!response.ok) {
        throw new Error(
          await readApiError(response, "Không thể lưu thẻ bài học."),
        );
      }

      setMessage("Đã lưu thẻ bài học.");
      await loadContent();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Không thể lưu thẻ bài học.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function createVideoLesson(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canManage || !selectedUnit) {
      setMessage("Bạn không có quyền hoặc chưa chọn chương.");
      return;
    }
    if (!youtubeUrl && !videoFile) {
      setMessage("Hãy thêm liên kết YouTube hoặc chọn tệp video.");
      return;
    }

    setIsSaving(true);
    setMessage("Đang tạo bài học...");

    try {
      const lessonResponse = await fetch(
        `${apiBaseUrl}/v1/admin/content/lessons`,
        {
          method: "POST",
          headers: {
            ...authHeaders,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            unitId: selectedUnit.id,
            title,
            description,
            type: "VIDEO",
          }),
        },
      );

      if (!lessonResponse.ok) {
        throw new Error("Không thể tạo bài học.");
      }

      const lesson = (await lessonResponse.json()) as AdminLesson;

      if (youtubeUrl) {
        const videoResponse = await fetch(
          `${apiBaseUrl}/v1/admin/content/lessons/${lesson.id}/videos/link`,
          {
            method: "POST",
            headers: {
              ...authHeaders,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              provider: "YOUTUBE",
              title: videoTitle || title,
              url: youtubeUrl,
            }),
          },
        );
        if (!videoResponse.ok) {
          throw new Error(
            "Đã tạo bài học nhưng không thể đính kèm video YouTube.",
          );
        }
      } else if (videoFile) {
        const formData = new FormData();
        formData.append("file", videoFile);
        formData.append("title", videoTitle || title);

        const videoResponse = await fetch(
          `${apiBaseUrl}/v1/admin/content/lessons/${lesson.id}/videos/upload`,
          {
            method: "POST",
            headers: authHeaders,
            body: formData,
          },
        );
        if (!videoResponse.ok) {
          throw new Error("Đã tạo bài học nhưng không thể tải tệp video.");
        }
      }

      setTitle("Bài học video mới");
      setDescription("");
      setVideoTitle("");
      setYoutubeUrl("");
      setVideoFile(null);
      setMessage("Đã lưu bài học nháp kèm video.");
      await loadContent();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Không thể tạo bài học.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function transitionLesson(
    lessonId: string,
    action: "submit-review" | "publish",
  ) {
    setIsSaving(true);
    try {
      const response = await fetch(
        `${apiBaseUrl}/v1/admin/content/lessons/${lessonId}/${action}`,
        {
          method: "POST",
          headers: authHeaders,
        },
      );
      if (!response.ok) {
        throw new Error("Không thể thay đổi trạng thái bài học.");
      }
      setMessage(
        action === "publish"
          ? "Đã xuất bản bài học."
          : "Đã gửi bài học để duyệt.",
      );
      await loadContent();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Không thể cập nhật bài học.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function createPracticeQuestion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canManage || !selectedQuestionLesson) {
      setMessage("Hãy chọn bài học và dùng tài khoản có quyền nội dung.");
      return;
    }
    if (selectedQuestionLesson.status !== "DRAFT") {
      setMessage("Chỉ có thể thêm câu hỏi luyện tập vào bài học nháp.");
      return;
    }

    const answers = answerOptions
      .map((text, index) => ({
        text: text.trim(),
        isCorrect: index === correctAnswerIndex,
        sortOrder: index,
      }))
      .filter((answer) => answer.text.length > 0);

    if (answers.length < 2 || !answers.some((answer) => answer.isCorrect)) {
      setMessage("Câu hỏi cần ít nhất hai lựa chọn và một đáp án đúng.");
      return;
    }

    setIsSaving(true);
    setMessage("Đang tạo hoạt động luyện tập...");

    try {
      const activityResponse = await fetch(
        `${apiBaseUrl}/v1/admin/content/lessons/${selectedQuestionLesson.id}/activities`,
        {
          method: "POST",
          headers: {
            ...authHeaders,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: activityTitle,
            type: "QUIZ",
            description: "Luyện tập sau video",
          }),
        },
      );

      if (!activityResponse.ok) {
        throw new Error("Không thể tạo hoạt động luyện tập.");
      }

      const activity = (await activityResponse.json()) as AdminActivity;
      const questionResponse = await fetch(
        `${apiBaseUrl}/v1/admin/content/activities/${activity.id}/questions`,
        {
          method: "POST",
          headers: {
            ...authHeaders,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: "SINGLE_CHOICE",
            prompt: questionPrompt,
            explanation,
            points: 1,
            answers,
          }),
        },
      );

      if (!questionResponse.ok) {
        throw new Error("Đã tạo hoạt động nhưng không thể lưu câu hỏi.");
      }

      setMessage("Đã tạo câu hỏi luyện tập.");
      setQuestionPrompt("Câu nào lịch sự hơn?");
      setAnswerOptions([
        "Gửi ngay đi.",
        "Bạn có thể gửi khi thuận tiện không?",
        "",
        "",
      ]);
      setCorrectAnswerIndex(1);
      await loadContent();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Không thể tạo câu hỏi.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="mt-4 rounded-lg border border-slate-200 bg-white p-4 sm:p-5">
      <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
            Xưởng nội dung
          </p>
          <h2 className="mt-1 text-xl font-semibold">Quản lý bài học video</h2>
          <p className="mt-1 text-sm text-slate-500">
            Quản trị viên tạo bài học, đính kèm YouTube hoặc video nội bộ rồi
            xuất bản.
          </p>
        </div>
        <div className="grid grid-cols-3 border-y border-slate-200 text-center lg:min-w-80">
          {[
            ["Bản nháp", overview?.status.drafts ?? 0],
            ["Duyệt", overview?.status.inReview ?? 0],
            ["Đã xuất bản", overview?.status.published ?? 0],
          ].map(([label, value], index) => (
            <div
              className={index > 0 ? "border-l border-slate-200 p-3" : "p-3"}
              key={label}
            >
              <p className="text-xs text-slate-500">{label}</p>
              <p className="mt-1 text-lg font-semibold">{value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
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

        <div>
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold">Bài học gần đây</h3>
            <span className="text-xs text-slate-500">
              {overview?.lessons ?? lessons.length} bài học /{" "}
              {overview?.videos ?? 0} video
            </span>
          </div>
          <div className="mt-3 max-h-[360px] divide-y divide-slate-200 overflow-auto border-y border-slate-200">
            {lessons.map((lesson) => (
              <div className="py-3" key={lesson.id}>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-medium">{lesson.title}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {lesson.unit?.course?.level?.code} /{" "}
                      {lesson.unit?.course?.title} / {lesson.unit?.title}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {lesson.videos.length} video -{" "}
                      {formatStatusCodeVi(lesson.status)}
                    </p>
                    {lesson.tags && lesson.tags.length > 0 && (
                      <p className="mt-1 text-xs text-slate-500">
                        {lesson.tags.map((item) => item.tag.name).join(", ")}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {canManage && lesson.status === "DRAFT" && (
                      <button
                        className="h-8 rounded-lg border border-slate-200 px-3 text-xs font-medium"
                        disabled={isSaving}
                        onClick={() =>
                          void transitionLesson(lesson.id, "submit-review")
                        }
                        type="button"
                      >
                        Gửi duyệt
                      </button>
                    )}
                    {canPublish && lesson.status === "IN_REVIEW" && (
                      <button
                        className="h-8 rounded-lg bg-teal-700 px-3 text-xs font-medium text-white"
                        disabled={isSaving}
                        onClick={() =>
                          void transitionLesson(lesson.id, "publish")
                        }
                        type="button"
                      >
                        Xuất bản
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {previewVideo && (
            <div className="mt-4">
              <p className="mb-2 text-sm font-medium">
                Xem trước video trong ứng dụng
              </p>
              {previewVideo.provider === "YOUTUBE" && previewVideo.embedUrl ? (
                <iframe
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="aspect-video w-full rounded-lg border border-slate-200"
                  src={previewVideo.embedUrl}
                  title={previewVideo.title ?? "Xem trước video YouTube"}
                />
              ) : previewVideoUrl ? (
                <video
                  className="aspect-video w-full rounded-lg border border-slate-200 bg-black"
                  controls
                  src={previewVideoUrl}
                />
              ) : null}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
