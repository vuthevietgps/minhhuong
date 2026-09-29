"use client";

import {
  AlertTriangle,
  ArrowLeft,
  Bot,
  CheckCircle2,
  ExternalLink,
  FileText,
  Link2,
  RefreshCw,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { readStoredSession } from "../session-storage";
import {
  VideoKnowledgeWorkspace,
  SourceTools,
} from "./video-knowledge-workspace";

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ??
  "http://localhost:4000";

const accountRoles = [
  "STUDENT",
  "PARENT",
  "TEACHER",
  "CONTENT_EDITOR",
  "ADMIN",
  "DIRECTOR",
  "SUPPORT",
  "SALE",
  "AGENCY_OWNER",
  "AGENCY_MANAGER",
  "OPERATIONS",
] as const;

const roleLabels: Record<(typeof accountRoles)[number], string> = {
  STUDENT: "Học sinh",
  PARENT: "Phụ huynh",
  TEACHER: "Giáo viên",
  CONTENT_EDITOR: "Biên tập nội dung",
  ADMIN: "Quản trị",
  DIRECTOR: "Điều hành",
  SUPPORT: "Chăm sóc khách hàng",
  SALE: "Kinh doanh",
  AGENCY_OWNER: "Chủ đại lý",
  AGENCY_MANAGER: "Quản lý đại lý",
  OPERATIONS: "Vận hành",
};

const rightsTypes = [
  { value: "OWNED", label: "Nội dung thuộc sở hữu của tôi/đơn vị" },
  { value: "WRITTEN_PERMISSION", label: "Có văn bản cho phép sử dụng" },
  { value: "CC_BY", label: "Có giấy phép Creative Commons CC BY" },
  { value: "PUBLIC_DOMAIN", label: "Nội dung thuộc phạm vi công cộng" },
] as const;

type RightsType = (typeof rightsTypes)[number]["value"];

type StoredSession = {
  accessToken: string;
  user: { email: string; roles: string[]; displayName?: string };
};

export type ContextSource = {
  id: string;
  kind: "YOUTUBE" | "MANUAL_SCRIPT";
  title: string;
  language: string;
  sourceUrl: string | null;
  targetRoles: string[];
  processingStatus: "PROCESSING" | "READY" | "FAILED";
  errorMessage: string | null;
  contextCharacters: number;
  structuredContent: string | null;
  rightsBasis: string;
  rightsReviewRequired: boolean;
  createdBy: string;
  createdAt: string;
};

async function apiError(response: Response) {
  try {
    const payload = (await response.json()) as { message?: string | string[] };
    return Array.isArray(payload.message)
      ? payload.message.join("; ")
      : payload.message || "Yêu cầu không thành công.";
  } catch {
    return "Yêu cầu không thành công.";
  }
}

export default function AiContextsPage() {
  const [session, setSession] = useState<StoredSession | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [sources, setSources] = useState<ContextSource[]>([]);
  const [mode, setMode] = useState<"youtube" | "manual" | "batch">("youtube");
  const [language, setLanguage] = useState("vi");
  const [batchResults, setBatchResults] = useState<
    Array<{
      index: number;
      ok: boolean;
      reused?: boolean;
      source?: ContextSource;
      url?: string;
      error?: string;
    }>
  >([]);
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [script, setScript] = useState("");
  const [targetRoles, setTargetRoles] = useState<string[]>(["STUDENT"]);
  const [rightsType, setRightsType] = useState<RightsType>("OWNED");
  const [rightsBasis, setRightsBasis] = useState("");
  const [rightsConfirmed, setRightsConfirmed] = useState(false);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSession(readStoredSession<StoredSession>());
      setLoaded(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const authorized = useMemo(
    () =>
      session?.user.roles.some((role) =>
        ["PARENT", "TEACHER", "CONTENT_EDITOR", "ADMIN", "SUPPORT"].includes(
          role,
        ),
      ) ?? false,
    [session],
  );

  const loadSources = useCallback(async () => {
    if (!session?.accessToken || !authorized) return;
    try {
      const response = await fetch(`${apiBaseUrl}/v1/ai-contexts`, {
        headers: { Authorization: `Bearer ${session.accessToken}` },
      });
      if (!response.ok) throw new Error(await apiError(response));
      const payload = (await response.json()) as { sources: ContextSource[] };
      setSources(payload.sources);
    } catch (error) {
      setStatus(
        error instanceof Error ? error.message : "Không thể tải kho ngữ cảnh.",
      );
    }
  }, [authorized, session]);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadSources(), 0);
    return () => window.clearTimeout(timer);
  }, [loadSources]);

  useEffect(() => {
    if (!sources.some((source) => source.processingStatus === "PROCESSING"))
      return;
    const timer = window.setInterval(() => void loadSources(), 5000);
    return () => window.clearInterval(timer);
  }, [sources, loadSources]);

  function toggleRole(role: string) {
    setTargetRoles((current) =>
      current.includes(role)
        ? current.filter((item) => item !== role)
        : [...current, role],
    );
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!session || targetRoles.length === 0 || !rightsConfirmed) {
      setStatus("Chọn đối tượng và xác nhận quyền sử dụng nội dung.");
      return;
    }
    if (mode !== "manual" && !url.trim()) {
      setStatus("Nhập đường link YouTube làm nguồn tham chiếu.");
      return;
    }
    const urls = url
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
    if (mode === "batch" && urls.length > 30) {
      setStatus("Mỗi lô tối đa 30 link video.");
      return;
    }
    setBusy(true);
    setStatus(
      "Đang kiểm tra dữ liệu đã lưu và đưa nội dung mới vào hàng đợi...",
    );
    try {
      const response = await fetch(
        `${apiBaseUrl}/v1/ai-contexts/${mode === "batch" ? "youtube/batch" : mode}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(
            mode === "batch"
              ? {
                  videos: urls.map((item) => ({
                    url: item,
                    language,
                    targetRoles,
                    rightsConfirmed,
                    rightsType,
                    rightsBasis,
                  })),
                }
              : mode === "youtube"
                ? {
                    url,
                    title: title.trim() || undefined,
                    script: script.trim() || undefined,
                    language,
                    targetRoles,
                    rightsConfirmed,
                    rightsType,
                    rightsBasis,
                  }
                : {
                    title,
                    script,
                    language,
                    targetRoles,
                    rightsConfirmed,
                    rightsType,
                    rightsBasis,
                  },
          ),
        },
      );
      if (!response.ok) throw new Error(await apiError(response));
      const payload = (await response.json()) as {
        reused?: boolean;
        results?: typeof batchResults;
        accepted?: number;
        failed?: number;
      };
      setBatchResults(payload.results ?? []);
      setStatus(
        mode === "batch"
          ? `Đã nhận ${payload.accepted} video; ${payload.failed} link lỗi. Theo dõi tiến độ trong danh sách bên dưới.`
          : payload.reused
            ? "Đã tìm thấy hồ sơ của video này. Hệ thống tái sử dụng dữ liệu đã lưu; xem trạng thái bên cạnh video."
            : "Đã lưu hồ sơ và đưa vào hàng đợi. Bạn có thể rời trang; kết quả được tự động lưu khi hoàn tất.",
      );
      setUrl("");
      setTitle("");
      setScript("");
      setRightsBasis("");
      setRightsConfirmed(false);
      await loadSources();
    } catch (error) {
      setStatus(
        error instanceof Error ? error.message : "Không thể lưu ngữ cảnh.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function removeSource(source: ContextSource) {
    if (!session) return;
    const confirmed = window.confirm(
      `Gỡ “${source.title}” khỏi kho và ngừng dùng làm ngữ cảnh AI?`,
    );
    if (!confirmed) return;
    setStatus("Đang gỡ nguồn học liệu...");
    try {
      const response = await fetch(
        `${apiBaseUrl}/v1/ai-contexts/${source.id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${session.accessToken}` },
        },
      );
      if (!response.ok) throw new Error(await apiError(response));
      setStatus("Đã gỡ nguồn khỏi kho và ngừng sử dụng trong AI.");
      await loadSources();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Không thể gỡ nguồn.");
    }
  }

  if (!loaded)
    return <main className="min-h-screen bg-slate-50 p-8">Đang tải...</main>;
  if (!session) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-50 p-6 text-center">
        <div>
          <p className="font-semibold">Vui lòng đăng nhập trước.</p>
          <Link className="mt-3 inline-block text-violet-700" href="/">
            Về trang đăng nhập
          </Link>
        </div>
      </main>
    );
  }
  if (!authorized) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-50 p-6">
        Tài khoản này không có quyền quản lý kho ngữ cảnh AI.
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-950 sm:px-7">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col gap-4 rounded-3xl bg-slate-950 p-6 text-white sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="flex items-center gap-2 text-sm font-bold text-violet-300">
              <Bot size={18} /> Kho dùng chung toàn hệ thống
            </p>
            <h1 className="mt-2 text-2xl font-black">Học từ video cùng AI</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
              AI tổng hợp kiến thức chung, nguyên lý và cách vận dụng bằng
              lời diễn đạt độc lập, kèm nguồn video. Lưu bản ngữ cảnh theo link
              để dùng lại khi học và hỏi đáp.
            </p>
          </div>
          <Link
            className="flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-4 font-bold text-slate-900"
            href="/"
          >
            <ArrowLeft size={18} /> Về bảng điều khiển
          </Link>
        </header>

        <section className="mt-5 rounded-2xl border border-amber-300 bg-amber-50 p-5 text-amber-950">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 shrink-0" size={21} />
            <div>
              <h2 className="font-black">Nguyên tắc sử dụng học liệu</h2>
              <p className="mt-1 text-sm leading-6">
                Nhập video bạn được phép sử dụng và xác nhận thông tin bên dưới.
                Hệ thống lấy transcript từ phụ đề có sẵn. Nếu video không có phụ
                đề hoặc không truy cập được, bạn có thể bổ sung bản chép lời thủ
                công.
              </p>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-xs font-bold">
                <a
                  className="inline-flex items-center gap-1 underline"
                  href="https://www.youtube.com/t/terms"
                  rel="noreferrer"
                  target="_blank"
                >
                  Điều khoản YouTube <ExternalLink size={13} />
                </a>
                <a
                  className="inline-flex items-center gap-1 underline"
                  href="https://support.google.com/youtube/answer/2797468"
                  rel="noreferrer"
                  target="_blank"
                >
                  Các loại giấy phép <ExternalLink size={13} />
                </a>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-5 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="grid grid-cols-3 gap-2 rounded-xl bg-slate-100 p-1">
              <button
                className={`rounded-lg px-3 py-2 text-sm font-bold ${mode === "batch" ? "bg-white shadow" : ""}`}
                onClick={() => {
                  setMode("batch");
                  setUrl("");
                }}
                type="button"
              >
                Nhiều video
              </button>
              <button
                className={`rounded-lg px-3 py-2 text-sm font-bold ${mode === "youtube" ? "bg-white shadow" : ""}`}
                onClick={() => {
                  setMode("youtube");
                  setUrl("");
                }}
                type="button"
              >
                <Link2 className="mr-2 inline" size={16} />
                YouTube
              </button>
              <button
                className={`rounded-lg px-3 py-2 text-sm font-bold ${mode === "manual" ? "bg-white shadow" : ""}`}
                onClick={() => setMode("manual")}
                type="button"
              >
                <FileText className="mr-2 inline" size={16} />
                Nhập script
              </button>
            </div>

            <form
              className="mt-5 space-y-4"
              onSubmit={(event) => void submit(event)}
            >
              {mode !== "manual" ? (
                <>
                  <p className="rounded-xl border border-sky-200 bg-sky-50 p-3 text-xs leading-5 text-sky-950">
                    Để trống transcript để tự lấy phụ đề. Link đã có dữ liệu sẽ
                    dùng lại kết quả lưu trong kho.
                  </p>
                  <label className="block text-sm font-bold">
                    {mode === "batch"
                      ? "Danh sách link YouTube (mỗi dòng một link, tối đa 30)"
                      : "Link YouTube nguồn"}
                    {mode === "batch" ? (
                      <textarea
                        className="mt-2 min-h-48 w-full rounded-xl border border-slate-300 p-3 font-normal"
                        value={url}
                        onChange={(event) => setUrl(event.target.value)}
                        required
                        placeholder="https://www.youtube.com/watch?v=..."
                      />
                    ) : (
                      <input
                        className="mt-2 h-11 w-full rounded-xl border border-slate-300 px-3 font-normal"
                        onChange={(event) => setUrl(event.target.value)}
                        placeholder="https://www.youtube.com/watch?v=..."
                        required
                        type="url"
                        value={url}
                      />
                    )}
                  </label>
                </>
              ) : null}

              {mode !== "batch" && (
                <>
                  <label className="block text-sm font-bold">
                    Tên nội dung
                    <input
                      className="mt-2 h-11 w-full rounded-xl border border-slate-300 px-3 font-normal"
                      onChange={(event) => setTitle(event.target.value)}
                      required={mode === "manual"}
                      maxLength={200}
                      value={title}
                    />
                  </label>
                  <label className="block text-sm font-bold">
                    Bản chép lời được phép sử dụng
                    <textarea
                      className="mt-2 min-h-52 w-full rounded-xl border border-slate-300 p-3 font-normal"
                      onChange={(event) => setScript(event.target.value)}
                      placeholder="Dán nội dung do bạn sở hữu hoặc đã được cấp quyền sử dụng..."
                      required={mode === "manual"}
                      minLength={20}
                      maxLength={100000}
                      value={script}
                    />
                  </label>
                </>
              )}

              <label className="block text-sm font-bold">
                Ngôn ngữ phụ đề ưu tiên
                <select
                  value={language}
                  onChange={(event) => setLanguage(event.target.value)}
                  className="mt-2 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 font-normal"
                >
                  <option value="vi">Tiếng Việt</option>
                  <option value="en">Tiếng Anh</option>
                </select>
                <span className="mt-1 block text-xs font-normal text-slate-500">
                  Nếu không có, hệ thống dùng ngôn ngữ phụ đề gốc. Bản tóm tắt
                  viết bằng tiếng Việt.
                </span>
              </label>

              <fieldset>
                <legend className="text-sm font-bold">
                  Dùng cho loại tài khoản
                </legend>
                <div className="mt-2 flex flex-wrap gap-2">
                  {accountRoles.map((role) => (
                    <button
                      aria-pressed={targetRoles.includes(role)}
                      className={`rounded-full px-3 py-2 text-xs font-bold ring-1 ${targetRoles.includes(role) ? "bg-violet-700 text-white ring-violet-700" : "bg-white text-slate-700 ring-slate-300"}`}
                      key={role}
                      onClick={() => toggleRole(role)}
                      type="button"
                    >
                      {roleLabels[role]}
                    </button>
                  ))}
                </div>
              </fieldset>

              <label className="block text-sm font-bold">
                Loại quyền sử dụng
                <select
                  className="mt-2 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 font-normal"
                  onChange={(event) =>
                    setRightsType(event.target.value as RightsType)
                  }
                  value={rightsType}
                >
                  {rightsTypes.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm font-bold">
                Bằng chứng hoặc thông tin ghi công
                <input
                  className="mt-2 h-11 w-full rounded-xl border border-slate-300 px-3 font-normal"
                  maxLength={240}
                  minLength={10}
                  onChange={(event) => setRightsBasis(event.target.value)}
                  placeholder={
                    rightsType === "OWNED"
                      ? "Tên chủ sở hữu/kênh và mối quan hệ với tài khoản"
                      : rightsType === "WRITTEN_PERMISSION"
                        ? "Chủ sở hữu, ngày cấp phép và nơi lưu văn bản"
                        : rightsType === "CC_BY"
                          ? "Tác giả, tên tác phẩm và đường dẫn giấy phép CC BY"
                          : "Căn cứ xác định nội dung thuộc phạm vi công cộng"
                  }
                  required
                  value={rightsBasis}
                />
              </label>
              <label className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm leading-6 text-emerald-950">
                <input
                  checked={rightsConfirmed}
                  className="mt-1 size-4"
                  onChange={(event) => setRightsConfirmed(event.target.checked)}
                  type="checkbox"
                />
                <span>
                  Tôi xác nhận căn cứ trên là chính xác và cho phép hệ thống sao
                  chép, cấu trúc, lưu trữ và dùng nội dung này làm ngữ cảnh AI.
                  Tôi hiểu rằng video/phụ đề công khai hoặc mục đích giáo dục tự
                  nó không tạo ra quyền sử dụng.
                </span>
              </label>
              <button
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-violet-700 font-black text-white disabled:opacity-50"
                disabled={busy}
                type="submit"
              >
                {busy ? (
                  <RefreshCw className="animate-spin" size={18} />
                ) : (
                  <CheckCircle2 size={18} />
                )}
                {busy ? "Đang xử lý..." : "Lưu vào kho dùng chung"}
              </button>
              {status && (
                <p
                  aria-live="polite"
                  className="rounded-xl bg-slate-100 p-3 text-sm leading-6"
                >
                  {status}
                </p>
              )}
            </form>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black">Nguồn đã xử lý</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Link trùng dùng lại dữ liệu. Mỗi video giữ nguồn tham chiếu
                  riêng.
                </p>
              </div>
              <button
                aria-label="Tải lại"
                className="grid size-10 place-items-center rounded-xl border border-slate-200"
                onClick={() => void loadSources()}
                type="button"
              >
                <RefreshCw size={17} />
              </button>
            </div>
            <div className="mt-4 space-y-3">
              {batchResults.length > 0 && (
                <div
                  className="rounded-xl bg-slate-50 p-3 text-xs"
                  aria-live="polite"
                >
                  <p className="mb-2 font-bold">Tiến độ lô vừa nhập</p>
                  {batchResults.map((result) => {
                    const latest =
                      sources.find(
                        (source) => source.id === result.source?.id,
                      ) ?? result.source;
                    return (
                      <p key={result.index} className="py-1">
                        {result.index + 1}. {latest?.title ?? result.url}:{" "}
                        {result.ok
                          ? `${result.reused ? "Đã có trong kho · " : ""}${latest?.processingStatus === "READY" ? "Hoàn tất" : latest?.processingStatus === "FAILED" ? "Lỗi — mở video để thử lại" : "Đang xử lý"}`
                          : result.error}
                      </p>
                    );
                  })}
                </div>
              )}
              {sources.length === 0 && (
                <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                  Chưa có nguồn ngữ cảnh.
                </p>
              )}
              {sources.map((source) => (
                <details
                  className="rounded-xl border border-slate-200 p-4"
                  key={source.id}
                >
                  <summary className="cursor-pointer list-none">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-bold">{source.title}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          {source.kind === "YOUTUBE"
                            ? "YouTube"
                            : "Script thủ công"}{" "}
                          ·{" "}
                          {source.contextCharacters.toLocaleString("vi-VN")}{" "}
                          ký tự ngữ cảnh · {source.createdBy}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-bold ${source.rightsReviewRequired ? "bg-amber-100 text-amber-900" : source.processingStatus === "READY" ? "bg-emerald-100 text-emerald-800" : source.processingStatus === "FAILED" ? "bg-rose-100 text-rose-800" : "bg-amber-100 text-amber-800"}`}
                      >
                        {source.rightsReviewRequired
                          ? "Tạm ngưng"
                          : source.processingStatus === "READY"
                            ? "Sẵn sàng"
                            : source.processingStatus === "FAILED"
                              ? "Lỗi"
                              : "Đang xử lý"}
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {source.targetRoles.map((role) => (
                        <span
                          className="rounded-full bg-violet-50 px-2 py-1 text-[11px] font-bold text-violet-700"
                          key={role}
                        >
                          {roleLabels[role as keyof typeof roleLabels] ?? role}
                        </span>
                      ))}
                    </div>
                  </summary>
                  <div className="mt-4 border-t border-slate-100 pt-4 text-sm leading-6">
                    {source.rightsReviewRequired && (
                      <p className="mb-3 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-950">
                        <AlertTriangle className="mt-0.5 shrink-0" size={15} />
                        Nguồn cũ chưa qua quy trình quyền mới nên không được đưa
                        vào ngữ cảnh AI. Hãy gỡ nguồn và nhập lại cùng bằng
                        chứng hợp lệ.
                      </p>
                    )}
                    {!source.structuredContent && (
                      <p className="text-slate-600">Chưa có bản ngữ cảnh đã tổng hợp.</p>
                    )}
                    {source.structuredContent && (
                      <>
                        <p className="mt-4 font-bold">
                          Ngữ cảnh nội dung đã lưu
                        </p>
                        <pre className="mt-1 max-h-72 overflow-auto whitespace-pre-wrap rounded-xl bg-slate-50 p-3 font-sans text-xs text-slate-700">
                          {source.structuredContent}
                        </pre>
                      </>
                    )}
                    <p className="mt-3 flex gap-2 text-xs text-emerald-800">
                      <ShieldCheck size={15} />
                      {source.rightsBasis}
                    </p>
                    {source.sourceUrl && (
                      <a
                        className="mt-3 inline-block text-violet-700 hover:underline"
                        href={source.sourceUrl}
                        rel="noreferrer"
                        target="_blank"
                      >
                        Mở nguồn YouTube
                      </a>
                    )}
                    {source.errorMessage && (
                      <p className="mt-3 text-rose-700">
                        {source.errorMessage}
                      </p>
                    )}
                    <div className="mt-4 border-t border-slate-100 pt-3">
                      <SourceTools
                        source={source}
                        apiBaseUrl={apiBaseUrl}
                        token={session.accessToken}
                        onChange={loadSources}
                      />
                      <button
                        className="inline-flex h-9 items-center gap-2 rounded-lg border border-rose-200 px-3 text-xs font-bold text-rose-700 hover:bg-rose-50"
                        onClick={() => void removeSource(source)}
                        type="button"
                      >
                        <Trash2 size={14} /> Gỡ nguồn khỏi hệ thống
                      </button>
                    </div>
                  </div>
                </details>
              ))}
            </div>
          </section>
        </div>
        <VideoKnowledgeWorkspace
          sources={sources}
          apiBaseUrl={apiBaseUrl}
          token={session.accessToken}
        />
      </div>
    </main>
  );
}
