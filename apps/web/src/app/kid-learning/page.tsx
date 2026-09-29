"use client";

import { FormEvent, useEffect, useState } from "react";
import styles from "./styles.module.css";

type Lesson = {
  title: string;
  context: string;
  aiEnabled: boolean;
  questions: { prompt: string; options: string[] }[];
  messages: { role: string; content: string }[];
};
function bridge<T>(action: string, body?: unknown): Promise<T> {
  return new Promise((resolve, reject) => {
    const id = crypto.randomUUID();
    const listener = (event: MessageEvent) => {
      if (
        event.source !== window ||
        event.origin !== location.origin ||
        event.data?.channel !== "minhhuong-learning-response" ||
        event.data.id !== id
      )
        return;
      cleanup();
      if (event.data.ok) resolve(event.data.data);
      else reject(new Error(event.data.error));
    };
    const timeout = setTimeout(() => {
      cleanup();
      reject(
        new Error(
          "Chưa kết nối được. Con hãy nhờ bố mẹ kiểm tra máy học và mạng nhé.",
        ),
      );
    }, 30000);
    function cleanup() {
      clearTimeout(timeout);
      window.removeEventListener("message", listener);
    }
    window.addEventListener("message", listener);
    window.postMessage(
      { channel: "minhhuong-learning-request", id, action, body },
      location.origin,
    );
  });
}
export default function KidLearningPage() {
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [status, setStatus] = useState("Đang mở góc học của con…");
  const [answers, setAnswers] = useState<number[]>([]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{
    correct: number;
    total: number;
  } | null>(null);
  const [attemptId, setAttemptId] = useState("");
  async function load() {
    setBusy(true);
    setStatus("Đang kết nối…");
    try {
      const data = await bridge<Lesson>("lesson");
      setLesson(data);
      setAnswers(data.questions.map(() => -1));
      setStatus("");
      setAttemptId(crypto.randomUUID());
    } catch (error) {
      setStatus((error as Error).message);
    } finally {
      setBusy(false);
    }
  }
  useEffect(() => {
    const timer = setTimeout(() => void load(), 100);
    return () => clearTimeout(timer);
  }, []);
  async function chat(event: FormEvent) {
    event.preventDefault();
    if (!lesson) return;
    setBusy(true);
    setStatus("");
    try {
      const reply = await bridge<{ text: string }>("chat", { message });
      setLesson({
        ...lesson,
        messages: [
          ...lesson.messages,
          { role: "USER", content: message },
          { role: "ASSISTANT", content: reply.text },
        ],
      });
      setMessage("");
    } catch (error) {
      setStatus((error as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function submit() {
    setBusy(true);
    setStatus("");
    try {
      const score = await bridge<{ correct: number; total: number }>(
        "attempt",
        { answers, eventId: attemptId },
      );
      setResult(score);
      setStatus("Đã gửi kết quả về cho bố mẹ rồi!");
    } catch (error) {
      setStatus((error as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className={styles.root}>
      <div className={styles.container}>
        <header>
          <span className={styles.badge}>MINHHUONG · HỌC MÀ CHƠI</span>
          <div className={styles.star} aria-hidden="true">
            ✦
          </div>
          <h1>Đến giờ khám phá rồi!</h1>
          <p>Mình cùng nhớ lại điều đã học và thử một câu hỏi nhỏ nhé.</p>
        </header>
        <p role="status" aria-live="polite" className={styles.status}>
          {status}
        </p>
        {!lesson && (
          <button disabled={busy} onClick={() => void load()}>
            Kết nối lại
          </button>
        )}
        {lesson && (
          <>
            <h2>{lesson.title}</h2>
            <div className={styles.columns}>
              <section className={styles.card}>
                <span className={styles.badge}>01 · THỬ TÀI CỦA CON</span>
                <h2>Chọn câu trả lời nhé</h2>
                {lesson.questions.map((question, index) => (
                  <fieldset key={index} disabled={busy || !!result}>
                    <legend>
                      {index + 1}. {question.prompt}
                    </legend>
                    {question.options.map((option, n) => (
                      <label
                        className={`${styles.option} ${answers[index] === n ? styles.selected : ""}`}
                        key={n}
                      >
                        <input
                          type="radio"
                          name={`question-${index}`}
                          checked={answers[index] === n}
                          onChange={() =>
                            setAnswers((current) =>
                              current.map((a, i) => (i === index ? n : a)),
                            )
                          }
                        />
                        {option}
                      </label>
                    ))}
                  </fieldset>
                ))}
                {result ? (
                  <div className={styles.result}>
                    <strong>
                      {result.correct === result.total
                        ? "Tuyệt lắm! ✦"
                        : "Con đã rất cố gắng! ✦"}
                    </strong>
                    <p>
                      Con trả lời đúng {result.correct}/{result.total} câu.
                    </p>
                    <button
                      onClick={() => {
                        setResult(null);
                        setAnswers(lesson.questions.map(() => -1));
                        setAttemptId(crypto.randomUUID());
                      }}
                    >
                      Thử lại nào
                    </button>
                  </div>
                ) : (
                  <button
                    disabled={busy || answers.some((a) => a < 0)}
                    onClick={() => void submit()}
                  >
                    {busy ? "Đang gửi…" : "Xem kết quả ✦"}
                  </button>
                )}
              </section>
              <section className={styles.card}>
                <span className={styles.badge}>02 · CÙNG ÔN LẠI</span>
                <h2>Bạn học thông minh</h2>
                {lesson.aiEnabled ? (
                  <>
                    <p>
                      Làm xong câu hỏi rồi mình cùng trò chuyện về bài vừa học
                      nhé. Bạn học có thể nhầm; nếu chưa rõ, con hãy hỏi bố mẹ.
                    </p>
                    {!result && lesson.questions.length > 0 ? (
                      <p className={styles.bubble}>
                        Con hãy hoàn thành câu hỏi bên trái trước nhé.
                      </p>
                    ) : (
                    <>
                    <div className={styles.messages} aria-live="polite">
                      {!lesson.messages.length && (
                        <p className={styles.bubble}>
                          Hello! Con thử chào bạn hoặc hỏi một từ mới nhé.
                        </p>
                      )}
                      {lesson.messages.map((m, i) => (
                        <div
                          className={`${styles.bubble} ${m.role === "USER" ? styles.mine : ""}`}
                          key={i}
                        >
                          <strong>
                            {m.role === "USER" ? "Con" : "Bạn học"}
                          </strong>
                          <p>{m.content}</p>
                        </div>
                      ))}
                    </div>
                    <form onSubmit={chat}>
                      <label htmlFor="message">Con muốn nói gì?</label>
                      <textarea
                        id="message"
                        required
                        maxLength={1000}
                        rows={3}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                      />
                      <button disabled={busy || !message.trim()}>
                        {busy ? "Đang đợi bạn…" : "Gửi lời nhắn →"}
                      </button>
                    </form>
                    </>
                    )}
                  </>
                ) : (
                  <p>
                    Hôm nay mình làm bài tập nhé. Bạn học chưa được bật hoặc
                    chưa kết nối được.
                  </p>
                )}
              </section>
            </div>
          </>
        )}
        <footer>
          Học một chút, nghỉ mắt một chút. Con có thể kể cho bố mẹ điều vừa khám
          phá.
        </footer>
      </div>
    </main>
  );
}
