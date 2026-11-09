"use client";

import styles from "../styles.module.css";
import { blankItem, templates } from "./shared";
import type { BrowserControlPageState } from "./use-browser-control-page-state";

/** 03 - lesson list and the lesson editor form. */
export function LessonsSection(state: BrowserControlPageState) {
  const {
    change,
    draft,
    policy,
    setDraft,
    setStatus,
  } = state;
  // Rendered only when data and policy are loaded (see page.tsx).
  if (!policy) return null;
  return (
    <section className={styles.card}>
      <div className={styles.sectionHead}>
        <div>
      <p className={styles.eyebrow}>03 · BÀI HỌC CỦA CON</p>
          <h2>Video và bài tập sau khi xem</h2>
        </div>
        <button
          disabled={policy.items.length >= 50}
          onClick={() => setDraft(blankItem())}
        >
          + Thêm nội dung
        </button>
      </div>
      <p>
        Con chỉ mở được video bạn đã chọn. Mỗi video có thời gian xem
        riêng và một hoạt động học ngắn sau khi xem.
      </p>
      {!policy.items.length && (
        <div className={styles.empty}>
          Bắt đầu bằng một video con yêu thích, rồi thêm một hoạt
          động học ngắn.
        </div>
      )}
      <div className={styles.itemGrid}>
        {policy.items.map((item) => (
          <article className={styles.item} key={item.id}>
            <span className={styles.pill}>
              {item.minutes} phút / ngày
            </span>
            <h3>{item.title}</h3>
            <p className={styles.url}>{item.url}</p>
            <p>
              {item.aiUrl
                ? "Mở công cụ trò chuyện đã chọn"
                : "Mở bạn học và bài tập Minh Hương"}{" "}
              · {item.questions.length} câu hỏi
            </p>
            <button
              className={styles.secondary}
              onClick={() => setDraft(structuredClone(item))}
            >
              Chỉnh sửa
            </button>
            <button
              className={styles.secondary}
              onClick={() =>
                change({
                  ...policy,
                  items: policy.items.filter(
                    (i) => i.id !== item.id,
                  ),
                })
              }
            >
              Gỡ
            </button>
          </article>
        ))}
      </div>
      {draft && (
        <form
          className={styles.editor}
          onSubmit={(event) => {
            event.preventDefault();
            change({
              ...policy,
              items: policy.items.some((i) => i.id === draft.id)
                ? policy.items.map((i) =>
                    i.id === draft.id ? draft : i,
                  )
                : [...policy.items, draft],
            });
            setDraft(null);
            setStatus(
              "Đã thêm cho con. Nhấn Lưu thay đổi để gửi đến máy của con.",
            );
          }}
        >
          <h3>
            {policy.items.some((i) => i.id === draft.id)
              ? "Chỉnh video và câu hỏi"
              : "Thêm video thủ công"}
          </h3>
          <div className={styles.fields}>
            <label>
              Tên hiển thị
              <input
                required
                maxLength={120}
                value={draft.title}
                onChange={(e) =>
                  setDraft({ ...draft, title: e.target.value })
                }
              />
            </label>
            <label>
              Đường dẫn video
              <input
                required
                type="url"
                maxLength={500}
                placeholder="https://www.youtube.com/watch?v=…"
                value={draft.url}
                onChange={(e) =>
                  setDraft({ ...draft, url: e.target.value })
                }
              />
            </label>
            <label>
              Phút xem tối đa / ngày
              <input
                type="number"
                min={1}
                max={120}
                required
                value={draft.minutes}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    minutes: Number(e.target.value),
                  })
                }
              />
            </label>
          </div>
          <details className={styles.advanced}>
            <summary>Lựa chọn nâng cao</summary>
            <label>
              Đường dẫn đến công cụ trò chuyện khác (không bắt buộc)
              <input
                type="url"
                maxLength={500}
                placeholder="Để trống để dùng bạn học Minh Hương"
                value={draft.aiUrl || ""}
                onChange={(e) =>
                  setDraft({ ...draft, aiUrl: e.target.value })
                }
              />
            </label>
            <p className={styles.hint}>
              Công cụ bên ngoài không gửi kết quả về Minh Hương.
            </p>
            <div className={styles.inline}>
              <span>Chọn chủ đề mẫu:</span>
              {Object.keys(templates).map((topic) => (
                <button
                  type="button"
                  className={styles.secondary}
                  key={topic}
                  onClick={() =>
                    setDraft({
                      ...draft,
                      ...structuredClone(templates[topic]),
                    })
                  }
                >
                  {topic}
                </button>
              ))}
            </div>
            <label>
              Nội dung giúp bạn học hiểu chủ đề
              <textarea
                required
                minLength={20}
                maxLength={8000}
                rows={7}
                value={draft.context}
                onChange={(e) =>
                  setDraft({ ...draft, context: e.target.value })
                }
              />
            </label>
          </details>
          <h3>Bài tập nhận biết</h3>
          {draft.questions.map((question, index) => (
            <fieldset key={index}>
              <legend>Câu {index + 1}</legend>
              <label>
                Câu hỏi
                <input
                  required
                  maxLength={300}
                  value={question.prompt}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      questions: draft.questions.map((q, i) =>
                        i === index
                          ? { ...q, prompt: e.target.value }
                          : q,
                      ),
                    })
                  }
                />
              </label>
              <div className={styles.fields}>
                {question.options.map((option, n) => (
                  <label key={n}>
                    Lựa chọn {n + 1}
                    <input
                      required
                      maxLength={120}
                      value={option}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          questions: draft.questions.map((q, i) =>
                            i === index
                              ? {
                                  ...q,
                                  options: q.options.map((o, oi) =>
                                    oi === n ? e.target.value : o,
                                  ),
                                }
                              : q,
                          ),
                        })
                      }
                    />
                  </label>
                ))}
              </div>
              <label>
                Đáp án đúng
                <select
                  value={question.answer}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      questions: draft.questions.map((q, i) =>
                        i === index
                          ? { ...q, answer: Number(e.target.value) }
                          : q,
                      ),
                    })
                  }
                >
                  {question.options.map((_, n) => (
                    <option key={n} value={n}>
                      Lựa chọn {n + 1}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                className={styles.secondary}
                disabled={draft.questions.length <= 1}
                onClick={() =>
                  setDraft({
                    ...draft,
                    questions: draft.questions.filter(
                      (_, i) => i !== index,
                    ),
                  })
                }
              >
                Bỏ câu hỏi
              </button>
            </fieldset>
          ))}
          <button
            type="button"
            disabled={draft.questions.length >= 10}
            className={styles.secondary}
            onClick={() =>
              setDraft({
                ...draft,
                questions: [
                  ...draft.questions,
                  { prompt: "", options: ["", "", ""], answer: 0 },
                ],
              })
            }
          >
            + Thêm câu hỏi
          </button>
          <div>
            <button type="submit">Thêm vào danh sách của con</button>
            <button
              type="button"
              className={styles.secondary}
              onClick={() => setDraft(null)}
            >
              Đóng
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
