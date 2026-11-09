import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { apiBaseUrl, readApiError, useAuthenticatedUploadUrl } from "../../lib/api";
import type { ContentTag, ContentTagKind, Role, Session } from "../../types";
import type { AdminActivity, AdminCourse, AdminLesson, AdminUnit, ContentOverview } from "./helpers";

/** State, effects and handlers of ContentStudio, moved verbatim from content-studio.tsx. */
export function useContentStudioState({ role, session }: { role: Role; session: Session }) {
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

  return {
    role,
    session,
    canManage,
    canPublish,
    overview,
    setOverview,
    courses,
    setCourses,
    lessons,
    setLessons,
    tags,
    setTags,
    courseId,
    setCourseId,
    unitId,
    setUnitId,
    seriesLevelCode,
    setSeriesLevelCode,
    seriesTitle,
    setSeriesTitle,
    seriesDescription,
    setSeriesDescription,
    seriesUnitTitle,
    setSeriesUnitTitle,
    tagName,
    setTagName,
    tagKind,
    setTagKind,
    tagColor,
    setTagColor,
    editingTagId,
    setEditingTagId,
    tagLessonId,
    setTagLessonId,
    selectedTagIds,
    setSelectedTagIds,
    title,
    setTitle,
    description,
    setDescription,
    videoTitle,
    setVideoTitle,
    youtubeUrl,
    setYoutubeUrl,
    videoFile,
    setVideoFile,
    questionLessonId,
    setQuestionLessonId,
    activityTitle,
    setActivityTitle,
    questionPrompt,
    setQuestionPrompt,
    answerOptions,
    setAnswerOptions,
    correctAnswerIndex,
    setCorrectAnswerIndex,
    explanation,
    setExplanation,
    message,
    setMessage,
    isSaving,
    setIsSaving,
    authHeaders,
    activeCourseId,
    selectedCourse,
    activeUnitId,
    selectedUnit,
    previewVideo,
    previewVideoUrl,
    selectedQuestionLesson,
    selectedTagLesson,
    loadContent,
    createVideoSeries,
    saveContentTag,
    archiveContentTag,
    beginEditTag,
    cancelEditTag,
    toggleSelectedTag,
    saveLessonTags,
    createVideoLesson,
    transitionLesson,
    createPracticeQuestion,
  };
}

export type ContentStudioState = ReturnType<typeof useContentStudioState>;
