"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { api, type Item } from "./client";
import styles from "./styles.module.css";

type Combo = {
  id: string;
  title: string;
  description?: string;
  videos: { title: string; url: string; sourceId: string | null }[];
};
type Job = {
  id: string;
  title: string;
  url: string;
  minutes: number;
  status: string;
  error?: string;
  result: Item | null;
};
const statusLabels: Record<string, string> = {
  WAITING_CONTEXT: "Đang chuẩn bị bài học",
  PROCESSING: "Đang tạo câu hỏi cho con",
  READY: "Sẵn sàng",
  FAILED: "Chưa chuẩn bị được",
};

export function ContentPicker({
  childId,
  selectedItems,
  disabled,
  onAdd,
}: {
  childId: string;
  selectedItems: Item[];
  disabled: boolean;
  onAdd: (items: Item[]) => void;
}) {
  const [combos, setCombos] = useState<Combo[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [minutes, setMinutes] = useState(10);
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [script, setScript] = useState("");
  const [rightsType, setRightsType] = useState("OWNED");
  const [rightsBasis, setRightsBasis] = useState("");
  const [rightsConfirmed, setRightsConfirmed] = useState(false);
  const [retryScripts, setRetryScripts] = useState<Record<string, string>>({});
  const base = `parent/browser-control/${childId}/content`;
  const refresh = useCallback(async () => {
    const result = await api<{ jobs: Job[] }>(`${base}/imports`);
    setJobs(result.jobs);
  }, [base]);
  useEffect(() => {
    let alive = true;
    const timer = setTimeout(() => {
      void Promise.all([
        api<{ combos: Combo[] }>(`${base}/combos`),
        api<{ jobs: Job[] }>(`${base}/imports`),
      ])
        .then(([library, imports]) => {
          if (alive) {
            setCombos(library.combos);
            setJobs(imports.jobs);
          }
        })
        .catch((error) => {
          if (alive) setStatus(error.message);
        });
    }, 0);
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [base]);
  const pending = jobs.some((job) =>
    ["WAITING_CONTEXT", "PROCESSING"].includes(job.status),
  );
  useEffect(() => {
    if (!pending) return;
    let alive = true;
    let running = false;
    const timer = setInterval(() => {
      if (running) return;
      running = true;
      void api<{ jobs: Job[] }>(`${base}/imports`)
        .then((result) => {
          if (alive) setJobs(result.jobs);
        })
        .catch((error) => {
          if (alive) setStatus(error.message);
        })
        .finally(() => {
          running = false;
        });
    }, 5000);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, [base, pending]);
  async function run(action: () => Promise<void>) {
    setBusy(true);
    setStatus("");
    try {
      await action();
    } catch (error) {
      setStatus((error as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function importLink(event: FormEvent) {
    event.preventDefault();
    await run(async () => {
      const result = await api<{ reused: boolean }>(`${base}/imports`, "POST", {
        url,
        ...(title.trim() ? { title: title.trim() } : {}),
        minutes,
        ...(script.trim() ? { script: script.trim() } : {}),
        language: "vi",
        targetRoles: ["STUDENT"],
        rightsType,
        rightsBasis,
        rightsConfirmed,
      });
      setStatus(
        result.reused
          ? "Video này đã có trong hệ thống. Minh Hương đang dùng lại bài học đã chuẩn bị."
          : "Đã nhận video. Minh Hương đang chuẩn bị câu hỏi cho con; bạn có thể đóng trang và quay lại sau.",
      );
      setUrl("");
      setTitle("");
      setScript("");
      await refresh();
    });
  }
  const selected = new Set(selectedItems.map((item) => item.url));
  const ready = jobs.filter(
    (job) => job.status === "READY" && job.result && !selected.has(job.url),
  );
  return (
    <section className={styles.card}>
      <p className={styles.eyebrow}>BƯỚC 1 · CHỌN BÀI CHO CON</p>
      <h2>Chọn bộ bài học hoặc thêm video</h2>
      <p>
        Hãy chọn một bộ có sẵn. Bạn chỉ cần thêm video riêng khi thật sự cần.
      </p>
      <label>
        Mỗi video được xem bao lâu trong ngày?
        <input
          aria-label="Phút xem cho link mới"
          type="number"
          min={1}
          max={120}
          value={minutes}
          onChange={(event) => setMinutes(Number(event.target.value))}
        />
      </label>
      <h3>Bộ bài học có sẵn</h3>
      {!combos.length && (
        <p className={styles.empty}>
          Chưa có bộ bài học sẵn sàng. Vui lòng quay lại sau hoặc thêm một video
          riêng ở phần bên dưới.
        </p>
      )}
      <div className={styles.itemGrid}>
        {combos.map((combo) => {
          const available = combo.videos.filter(
            (video) => video.sourceId,
          ).length;
          return (
            <article key={combo.id} className={styles.item}>
              <span className={styles.pill}>
                {available}/{combo.videos.length} video sẵn sàng
              </span>
              <h3>{combo.title}</h3>
              {combo.description && <p>{combo.description}</p>}
              <details>
                <summary>Xem video trong bộ này</summary>
                <ul>
                  {combo.videos.map((video) => (
                    <li key={video.url}>
                      {video.title}{" "}
                      {video.sourceId
                          ? "· Sẵn sàng"
                          : "· Đang chuẩn bị"}
                    </li>
                  ))}
                </ul>
              </details>
              <button
                disabled={
                  disabled ||
                  busy ||
                  !available ||
                  !Number.isInteger(minutes) ||
                  minutes < 1 ||
                  minutes > 120
                }
                onClick={() =>
                  void run(async () => {
                    const result = await api<{
                      queued: number;
                      skipped: number;
                      jobs: Job[];
                    }>(`${base}/combos/${combo.id}`, "POST", { minutes });
                    setJobs(result.jobs);
                    setStatus(
                       `Đã chọn ${result.queued} video.${result.skipped ? ` ${result.skipped} video chưa sẵn sàng nên chưa được thêm.` : ""} Minh Hương đang chuẩn bị bài cho con.`,
                    );
                  })
                }
              >
                Chọn bộ bài này
              </button>
            </article>
          );
        })}
      </div>
      <details className={styles.editor}>
        <summary>
          <strong>+ Thêm video YouTube riêng</strong>
        </summary>
        <form onSubmit={importLink}>
          <div className={styles.fields}>
            <label>
              Đường dẫn video YouTube
              <input
                type="url"
                required
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                placeholder="https://www.youtube.com/watch?v=…"
              />
            </label>
            <label>
              Tên gọi (tùy chọn)
              <input
                maxLength={120}
                minLength={2}
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Có thể để trống"
              />
            </label>
          </div>
          <p className={styles.hint}>
            Dán đường dẫn video, không cần tải video về máy. Minh Hương sẽ tự
            chuẩn bị câu hỏi phù hợp cho con.
          </p>
          <details>
            <summary>Thông tin bản quyền và lời thoại video</summary>
            <label>
              Căn cứ sử dụng nguồn
              <select
                value={rightsType}
                onChange={(event) => setRightsType(event.target.value)}
              >
                <option value="OWNED">Video của tôi / đơn vị tôi</option>
                <option value="WRITTEN_PERMISSION">
                  Được chủ sở hữu cho phép
                </option>
                <option value="CC_BY">Creative Commons CC BY</option>
                <option value="PUBLIC_DOMAIN">Thuộc phạm vi công cộng</option>
              </select>
            </label>
            <label>
              Thông tin nguồn / căn cứ sử dụng
              <input
                required
                minLength={10}
                maxLength={240}
                value={rightsBasis}
                onChange={(event) => setRightsBasis(event.target.value)}
                placeholder="Chủ sở hữu, thông tin cấp phép hoặc nguồn tham chiếu"
              />
            </label>
            <label>
              Lời thoại video (không bắt buộc)
              <textarea
                rows={4}
                minLength={20}
                maxLength={100000}
                value={script}
                onChange={(event) => setScript(event.target.value)}
              />
            </label>
          </details>
          <label className={styles.inline}>
            <input
              type="checkbox"
              required
              checked={rightsConfirmed}
              onChange={(event) => setRightsConfirmed(event.target.checked)}
            />
            Tôi xác nhận có quyền dùng nguồn để tạo nội dung học.
          </label>
          <p className={styles.hint}>
            Điền thông tin nguồn ở mục trên theo quy trình nhập video hiện có
            của Minhhuong.
          </p>
          <button
            disabled={
              disabled ||
              busy ||
              !rightsConfirmed ||
              rightsBasis.trim().length < 10 ||
              !Number.isInteger(minutes) ||
              minutes < 1 ||
              minutes > 120
            }
          >
            Thêm video
          </button>
        </form>
      </details>
      <div className={styles.sectionHead}>
        <h3>Video đang chuẩn bị</h3>
        <button
          className={styles.secondary}
          disabled={busy}
          onClick={() => void run(refresh)}
        >
          Kiểm tra lại
        </button>
      </div>
      <p role="status" aria-live="polite" className={styles.status}>
        {status}
      </p>
      {ready.length > 0 && (
        <button
          disabled={disabled || busy}
          onClick={() => onAdd(ready.map((job) => job.result!))}
        >
          Thêm {ready.length} video vào danh sách của con
        </button>
      )}
      {!jobs.length && (
        <p className={styles.hint}>
          Chọn một bộ bài hoặc thêm video để bắt đầu. Bạn không cần tự viết câu
          hỏi.
        </p>
      )}
      <div className={styles.itemGrid}>
        {jobs.map((job) => (
          <article className={styles.item} key={job.id}>
            <span className={styles.pill}>
              {selected.has(job.url)
                ? "Đã thêm cho con"
                : statusLabels[job.status] || job.status}
            </span>
            <h3>{job.title}</h3>
            <p className={styles.url}>{job.url}</p>
            {job.error && <p role="alert">{job.error}</p>}
            {job.status === "READY" && job.result && (
              <>
                <details>
                  <summary>Xem nội dung học và câu hỏi</summary>
                  <p style={{ whiteSpace: "pre-wrap" }}>{job.result.context}</p>
                  <ol>
                    {job.result.questions.map((question, index) => (
                      <li key={index}>
                        {question.prompt} — {question.options[question.answer]}
                      </li>
                    ))}
                  </ol>
                </details>
                <button
                  disabled={disabled || busy || selected.has(job.url)}
                  onClick={() => onAdd([job.result!])}
                >
                  Thêm cho con
                </button>
              </>
            )}
            {job.status === "FAILED" && (
              <>
                <label>
                  Lời thoại video để thử lại (không bắt buộc)
                  <textarea
                    rows={3}
                    maxLength={100000}
                    value={retryScripts[job.id] || ""}
                    onChange={(event) =>
                      setRetryScripts((current) => ({
                        ...current,
                        [job.id]: event.target.value,
                      }))
                    }
                  />
                </label>
                <button
                  disabled={disabled || busy}
                  onClick={() =>
                    void run(async () => {
                      await api(`${base}/imports/${job.id}/retry`, "POST", {
                        ...(retryScripts[job.id]?.trim()
                          ? { script: retryScripts[job.id].trim() }
                          : {}),
                      });
                      await refresh();
                      setStatus("Đã gửi yêu cầu xử lý lại.");
                    })
                  }
                >
                  Thử lại
                </button>
              </>
            )}
            <button
              disabled={busy}
              className={styles.secondary}
              onClick={() =>
                void run(async () => {
                  await api(`${base}/imports/${job.id}`, "DELETE");
                  await refresh();
                })
              }
            >
              Xóa khỏi danh sách
            </button>
          </article>
        ))}
      </div>
      <p className={styles.hint}>
        Video đang chuẩn bị chưa được gửi đến máy của con. Khi video sẵn sàng,
        hãy thêm vào danh sách rồi nhấn Lưu thay đổi.
      </p>
    </section>
  );
}
