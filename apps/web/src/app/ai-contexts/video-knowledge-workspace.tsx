"use client";

import { useCallback, useEffect, useState } from "react";
import { Download, FileText, MessageCircle, RefreshCw } from "lucide-react";
import type { ContextSource } from "./page";

const field =
  "mt-2 w-full rounded-xl border border-slate-300 bg-white p-3 text-sm font-normal";
const button =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-violet-700 px-4 py-3 text-sm font-bold text-white disabled:opacity-50";
const formats = {
  REPORT: "Báo cáo theo chủ đề",
  NOTES: "Ghi chú học tập",
  OUTLINE: "Dàn ý",
  ARTICLE: "Bài tổng hợp",
  ACTION_ITEMS: "Danh sách việc cần làm",
};
type Format = keyof typeof formats;
type Props = { apiBaseUrl: string; token: string };
type SourceRef = { id: string; title: string; sourceUrl: string | null };
type Document = {
  id: string;
  title: string;
  kind: Format;
  topic: string;
  processingStatus: string;
  content: string | null;
  errorMessage: string | null;
  sourceRefs: SourceRef[];
};
type Answer = {
  question: string;
  answer: string;
  supported: boolean;
  citations: Array<{
    referenceId: string;
    sourceId: string;
    title: string;
    sourceUrl: string | null;
    excerpt: string;
    offset?: number;
    sourceType?: "TRANSCRIPT" | "SUMMARY";
  }>;
};

async function request<T>(
  props: Props,
  path: string,
  body?: unknown,
): Promise<T> {
  const response = await fetch(`${props.apiBaseUrl}/v1/ai-contexts${path}`, {
    method: body === undefined ? "GET" : "POST",
    headers: {
      Authorization: `Bearer ${props.token}`,
      ...(body === undefined ? {} : { "Content-Type": "application/json" }),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const payload = await response.json();
  if (!response.ok)
    throw new Error(
      Array.isArray(payload.message)
        ? payload.message.join("; ")
        : (payload.message ?? "Không thể xử lý yêu cầu."),
    );
  return payload as T;
}

function download(title: string, content: string, extension = "md") {
  const blob = new Blob([content], {
    type:
      extension === "json"
        ? "application/json;charset=utf-8"
        : "text/plain;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${title.replace(/[^\p{L}\p{N} _-]/gu, "").slice(0, 100) || "hoc-lieu"}.${extension}`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function SourceTools({
  source,
  onChange,
  ...props
}: Props & { source: ContextSource; onChange: () => Promise<void> }) {
  const [busy, setBusy] = useState(false);
  const [script, setScript] = useState("");
  const [status, setStatus] = useState("");
  async function exportSource(format: "md" | "json") {
    setBusy(true);
    setStatus("");
    try {
      const data = await request<{
        title: string;
        sourceUrl: string | null;
        structuredContent: string | null;
      }>(props, `/${source.id}/export`);
      download(
        data.title,
        format === "json"
          ? JSON.stringify(data, null, 2)
          : `# ${data.title}\n\n${data.sourceUrl ?? ""}\n\n${data.structuredContent ?? "Chưa có bản ngữ cảnh."}`,
        format,
      );
    } catch (error) {
      setStatus(
        error instanceof Error ? error.message : "Không thể xuất kết quả.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function retry() {
    setBusy(true);
    setStatus("");
    try {
      await request(props, `/${source.id}/retry`, {
        script: script.trim() || undefined,
      });
      setStatus("Đã đưa vào hàng đợi. Hệ thống sẽ tổng hợp script vừa nhập hoặc lấy lại phụ đề video.");
      setScript("");
      await onChange();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Không thể thử lại.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="mb-4 space-y-3">
      <div className="flex flex-wrap gap-2">
        <button
          className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold"
          disabled={busy || source.processingStatus !== "READY"}
          onClick={() => void exportSource("md")}
        >
          <Download size={13} className="mr-1 inline" /> Tải ngữ cảnh .md
        </button>
        <button
          className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold"
          disabled={busy}
          onClick={() => void exportSource("json")}
        >
          Xuất JSON
        </button>
      </div>
      {source.processingStatus === "FAILED" && !source.rightsReviewRequired && (
        <div className="rounded-xl bg-amber-50 p-3">
          <label className="text-xs font-bold">
            {source.kind === "MANUAL_SCRIPT"
              ? "Nhập lại script để thử tổng hợp ngữ cảnh"
              : "Bổ sung script nếu không lấy được phụ đề (không bắt buộc)"}
            <textarea
              className={field}
              value={script}
              onChange={(event) => setScript(event.target.value)}
              maxLength={100000}
              rows={3}
            />
          </label>
          <button
            className={`${button} mt-2`}
            disabled={
              busy || Boolean(script.trim() && script.trim().length < 20) ||
              (source.kind === "MANUAL_SCRIPT" && !script.trim())
            }
            onClick={() => void retry()}
          >
            <RefreshCw size={14} /> Thử xử lý lại
          </button>
        </div>
      )}
      {status && (
        <p role="status" className="text-xs">
          {status}
        </p>
      )}
    </div>
  );
}

export function VideoKnowledgeWorkspace({
  sources,
  apiBaseUrl,
  token,
}: Props & { sources: ContextSource[] }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [kind, setKind] = useState<Format>("REPORT");
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("");
  const [question, setQuestion] = useState("");
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const ready = sources.filter(
    (source) =>
      source.processingStatus === "READY" && !source.rightsReviewRequired,
  );
  const activeIds = selected.filter((id) =>
    ready.some((source) => source.id === id),
  );
  const loadDocuments = useCallback(async () => {
    try {
      const data = await request<{ documents: Document[] }>(
        { apiBaseUrl, token },
        "/documents",
      );
      setDocuments(data.documents);
    } catch (error) {
      setStatus(
        error instanceof Error ? error.message : "Không tải được tài liệu.",
      );
    }
  }, [apiBaseUrl, token]);
  useEffect(() => {
    const timer = window.setTimeout(() => void loadDocuments(), 0);
    return () => window.clearTimeout(timer);
  }, [loadDocuments]);
  useEffect(() => {
    if (!documents.some((item) => item.processingStatus === "PROCESSING"))
      return;
    const timer = window.setInterval(() => void loadDocuments(), 5000);
    return () => window.clearInterval(timer);
  }, [documents, loadDocuments]);

  async function createDocument() {
    if (!activeIds.length) {
      setStatus("Hãy chọn ít nhất một video đã xử lý.");
      return;
    }
    setBusy(true);
    setStatus("");
    try {
      const result = await request<{ reused: boolean; document: Document }>(
        { apiBaseUrl, token },
        "/documents",
        {
          sourceIds: activeIds,
          kind,
          title: title.trim() || formats[kind],
          topic,
        },
      );
      setStatus(
        result.reused
          ? "Đã có tài liệu cho lựa chọn này; đang dùng lại bản lưu."
          : "Đã nhận yêu cầu. Tài liệu sẽ tự lưu vào kho và liên kết với các video nguồn.",
      );
      await loadDocuments();
    } catch (error) {
      setStatus(
        error instanceof Error ? error.message : "Không thể tạo tài liệu.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function ask() {
    if (!activeIds.length || question.trim().length < 3) return;
    setBusy(true);
    setStatus("");
    const asked = question.trim();
    try {
      const result = await request<Omit<Answer, "question">>({ apiBaseUrl, token }, "/ask", {
        sourceIds: activeIds,
        question: asked,
      });
      setAnswers((current) => [...current, { ...result, question: asked }]);
      setQuestion("");
    } catch (error) {
      setStatus(
        error instanceof Error ? error.message : "Chưa trả lời được câu hỏi.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function retryDocument(id: string) {
    setBusy(true);
    try {
      await request({ apiBaseUrl, token }, `/documents/${id}/retry`, {});
      await loadDocuments();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Không thể thử lại.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <FileText className="mt-1 text-violet-700" size={22} />
        <div>
          <h2 className="text-xl font-black">Tổng hợp & hỏi đáp với video</h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            Chọn tối đa 10 nguồn đã xử lý. Báo cáo và tài liệu được lưu tự động,
            liên kết với từng video để tái sử dụng.
          </p>
        </div>
      </div>
      <fieldset className="mt-5 rounded-xl bg-slate-50 p-4">
        <legend className="px-1 text-sm font-bold">
          Video dùng làm nguồn · {activeIds.length}/10
        </legend>
        {!ready.length && (
          <p className="text-sm text-slate-500">
            Chưa có video sẵn sàng. Nhập video ở phía trên để bắt đầu.
          </p>
        )}
        <div className="grid max-h-64 gap-2 overflow-auto sm:grid-cols-2">
          {ready.map((source) => (
            <label
              key={source.id}
              className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-3 text-sm"
            >
              <input
                type="checkbox"
                className="mt-1"
                checked={activeIds.includes(source.id)}
                disabled={
                  !activeIds.includes(source.id) && activeIds.length >= 10
                }
                onChange={(event) => {
                  setSelected(
                    event.target.checked
                      ? [...activeIds, source.id]
                      : activeIds.filter((id) => id !== source.id),
                  );
                }}
              />
              <span>
                {source.title}
                <span className="mt-1 block text-xs text-slate-500">
                  {source.sourceUrl ?? "Transcript thủ công"}
                </span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <div className="mt-5 grid gap-6 lg:grid-cols-2">
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            void createDocument();
          }}
        >
          <h3 className="font-black">Tạo tài liệu từ nguồn đã chọn</h3>
          <label className="block text-sm font-bold">
            Loại tài liệu
            <select
              className={field}
              value={kind}
              onChange={(event) => setKind(event.target.value as Format)}
            >
              {Object.entries(formats).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-bold">
            Tên tài liệu
            <input
              className={field}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={200}
              minLength={2}
              placeholder={formats[kind]}
            />
          </label>
          <label className="block text-sm font-bold">
            Chủ đề cần tập trung
            <textarea
              className={field}
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
              maxLength={1000}
              rows={3}
              placeholder="Ví dụ: Cách luyện nghe và kế hoạch thực hành mỗi ngày"
            />
          </label>
          <button
            className={button}
            disabled={busy || !activeIds.length}
            type="submit"
          >
            <FileText size={16} /> Tạo & lưu tài liệu
          </button>
        </form>
        <div>
          <h3 className="font-black">Hỏi đáp có dẫn nguồn</h3>
          <p className="mt-2 text-sm text-slate-500">
            Câu trả lời dựa trên bản ngữ cảnh đã lưu, kèm trích đoạn ngữ cảnh và link video nguồn.
          </p>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void ask();
            }}
            className="mt-3 space-y-3"
          >
            <label className="block text-sm font-bold">
              Câu hỏi
              <textarea
                className={field}
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                minLength={3}
                maxLength={2000}
                required
                rows={4}
                placeholder="Các video này giải thích phương pháp học như thế nào?"
              />
            </label>
            <button
              className={button}
              disabled={busy || !activeIds.length || question.trim().length < 3}
              type="submit"
            >
              <MessageCircle size={16} /> {busy ? "Đang xử lý..." : "Hỏi AI"}
            </button>
          </form>
        </div>
      </div>
      {status && (
        <p
          role="status"
          className="mt-4 rounded-xl bg-violet-50 p-3 text-sm leading-6 text-violet-950"
        >
          {status}
        </p>
      )}
      <div className="mt-5 space-y-4">
        {answers.map((answer, index) => (
          <article
            key={index}
            className="rounded-xl border border-sky-200 bg-sky-50 p-4"
          >
            <h3 className="font-bold">{answer.question}</h3>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-7">
              {answer.answer}
            </p>
            {answer.citations.map((citation, citationIndex) => (
              <blockquote
                key={`${citation.referenceId}-${citationIndex}`}
                className="mt-3 border-l-2 border-sky-400 pl-3 text-xs leading-6"
              >
                <p className="font-bold">
                  [{citation.referenceId}] {citation.title} · Ngữ cảnh đã tổng hợp
                </p>
                <p>“{citation.excerpt}”</p>
                {citation.sourceUrl && (
                  <a
                    className="font-bold text-violet-700 underline"
                    target="_blank"
                    rel="noreferrer"
                    href={`${citation.sourceUrl}${citation.offset === undefined ? "" : `&t=${Math.floor(citation.offset)}s`}`}
                  >
                    {citation.offset === undefined
                      ? "Mở video nguồn"
                      : `Xem từ ${Math.floor(citation.offset / 60)}:${String(Math.floor(citation.offset % 60)).padStart(2, "0")}`}
                  </a>
                )}
              </blockquote>
            ))}
            <button
              className="mt-3 text-xs font-bold text-violet-700"
              onClick={() =>
                download(
                  "hoi-dap-video",
                  `# ${answer.question}\n\n${answer.answer}\n\n${answer.citations.map((citation) => `[${citation.referenceId}] ${citation.title}\n${citation.excerpt}\n${citation.sourceUrl ?? ""}`).join("\n\n")}`,
                )
              }
            >
              Tải câu trả lời .md
            </button>
          </article>
        ))}
      </div>
      <div className="mt-8 border-t border-slate-200 pt-5">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black">Tài liệu đã lưu</h3>
          <button
            aria-label="Tải lại tài liệu"
            className="rounded-xl border border-slate-200 p-2"
            onClick={() => void loadDocuments()}
          >
            <RefreshCw size={16} />
          </button>
        </div>
        <p className="mt-1 text-xs text-slate-500">
          Có thể mở lại và tải xuống mà không gọi AI lần nữa.
        </p>
        {!documents.length && (
          <p className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
            Chưa có tài liệu. Chọn nguồn và tạo bản đầu tiên.
          </p>
        )}
        <div className="mt-4 space-y-3">
          {documents.map((item) => (
            <details
              className="rounded-xl border border-slate-200 p-4"
              key={item.id}
            >
              <summary className="cursor-pointer font-bold">
                {item.title}{" "}
                <span
                  className={`ml-2 text-xs ${item.processingStatus === "READY" ? "text-emerald-700" : item.processingStatus === "FAILED" ? "text-rose-700" : "text-amber-700"}`}
                >
                  {item.processingStatus === "READY"
                    ? "Đã lưu"
                    : item.processingStatus === "FAILED"
                      ? "Lỗi xử lý"
                      : "Đang tạo..."}
                </span>
              </summary>
              <p className="mt-3 text-xs text-slate-500">
                {formats[item.kind]}
                {item.topic ? ` · ${item.topic}` : ""}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {item.sourceRefs.map((source) =>
                  source.sourceUrl ? (
                    <a
                      key={source.id}
                      href={source.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full bg-violet-50 px-3 py-1 text-xs text-violet-700"
                    >
                      {source.title}
                    </a>
                  ) : (
                    <span key={source.id} className="text-xs">
                      {source.title}
                    </span>
                  ),
                )}
              </div>
              {item.content && (
                <>
                  <pre className="mt-4 max-h-[32rem] overflow-auto whitespace-pre-wrap rounded-xl bg-slate-50 p-4 font-sans text-sm leading-7">
                    {item.content}
                  </pre>
                  <div className="mt-3 flex gap-3">
                    <button
                      className={button}
                      onClick={() => download(item.title, item.content!)}
                    >
                      <Download size={15} /> Tải Markdown
                    </button>
                    <button
                      className="text-sm font-bold text-violet-700"
                      onClick={() =>
                        download(
                          item.title,
                          JSON.stringify(item, null, 2),
                          "json",
                        )
                      }
                    >
                      Xuất JSON
                    </button>
                  </div>
                </>
              )}
              {item.errorMessage && (
                <p className="mt-3 text-sm text-rose-700">
                  {item.errorMessage}
                </p>
              )}
              {item.processingStatus === "FAILED" && (
                <button
                  className={`${button} mt-3`}
                  disabled={busy}
                  onClick={() => void retryDocument(item.id)}
                >
                  Thử tạo lại
                </button>
              )}
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
