"use client";

import styles from "../styles.module.css";
import type { Policy } from "./shared";
import type { BrowserControlPageState } from "./use-browser-control-page-state";

/** 01 - daily schedule: allowed time windows and limits. */
export function ScheduleSection(state: BrowserControlPageState) {
  const {
    busy,
    change,
    data,
    dirty,
    policy,
    run,
    save,
    setDirty,
    setPolicy,
  } = state;
  // Rendered only when data and policy are loaded (see page.tsx).
  if (!data || !policy) return null;
  return (
    <section className={styles.card}>
      <p className={styles.eyebrow}>01 · NHỊP SINH HOẠT</p>
      <h2>Thời gian của con</h2>
      <div className={styles.fields}>
        <label>
          Cách dùng
          <select
            value={policy.mode}
            onChange={(e) =>
              change({
                ...policy,
                mode: e.target.value as Policy["mode"],
              })
            }
          >
            <option value="WATCH">Xem nội dung rồi học</option>
            <option value="LEARN_ONLY">Chỉ học và làm bài</option>
            <option value="EXERCISE_ONLY">Chỉ bài tập</option>
            <option value="PAUSED">Tạm dừng</option>
          </select>
        </label>
        <label>
          Thời gian mỗi ngày
          <input
            type="number"
            min={1}
            max={240}
            value={policy.dailyMinutes}
            onChange={(e) =>
              change({
                ...policy,
                dailyMinutes: Number(e.target.value),
              })
            }
          />
        </label>
        <label>
          Múi giờ
          <input
            value={policy.timezone}
            onChange={(e) =>
              change({ ...policy, timezone: e.target.value })
            }
          />
        </label>
      </div>
      <p className={styles.hint}>
        Khi hết giờ, nội dung sẽ dừng lại. Cấu hình mới sẽ được
        gửi tới máy của con khi máy có mạng.
      </p>
      {policy.windows.map((window, index) => (
        <div className={styles.window} key={index}>
          <div className={styles.days}>
            {["CN", "T2", "T3", "T4", "T5", "T6", "T7"].map(
              (day, n) => (
                <label key={day}>
                  <input
                    type="checkbox"
                    checked={window.days.includes(n)}
                    onChange={(e) =>
                      change({
                        ...policy,
                        windows: policy.windows.map((w, i) =>
                          i === index
                            ? {
                                ...w,
                                days: e.target.checked
                                  ? [...w.days, n]
                                  : w.days.filter((d) => d !== n),
                              }
                            : w,
                        ),
                      })
                    }
                  />
                  {day}
                </label>
              ),
            )}
          </div>
          <div className={styles.inline}>
            <input
              aria-label="Giờ bắt đầu"
              type="time"
              value={window.start}
              onChange={(e) =>
                change({
                  ...policy,
                  windows: policy.windows.map((w, i) =>
                    i === index
                      ? { ...w, start: e.target.value }
                      : w,
                  ),
                })
              }
            />
            <span>đến</span>
            <input
              aria-label="Giờ kết thúc"
              type="time"
              value={window.end}
              onChange={(e) =>
                change({
                  ...policy,
                  windows: policy.windows.map((w, i) =>
                    i === index
                      ? { ...w, end: e.target.value }
                      : w,
                  ),
                })
              }
            />
            <button
              className={styles.secondary}
              onClick={() =>
                change({
                  ...policy,
                  windows: policy.windows.filter(
                    (_, i) => i !== index,
                  ),
                })
              }
            >
              Bỏ
            </button>
          </div>
        </div>
      ))}
      <button
        disabled={policy.windows.length >= 14}
        className={styles.secondary}
        onClick={() =>
          change({
            ...policy,
            windows: [
              ...policy.windows,
              {
                days: [1, 2, 3, 4, 5, 6, 0],
                start: "17:00",
                end: "18:00",
              },
            ],
          })
        }
      >
        + Thêm khung giờ xem
      </button>
      <p className={styles.hint}>
        {policy.windows.length
          ? "Khung giờ theo múi giờ đã chọn; mỗi khung nằm trong cùng một ngày."
          : "Chưa đặt lịch: cho phép xem trong ngày đến khi hết hạn mức."}
      </p>
      <button
        disabled={busy || !dirty}
        onClick={() => void run(save)}
      >
        Lưu thay đổi
      </button>
      {dirty && (
        <button
          className={styles.secondary}
          disabled={busy}
          onClick={() => {
            setPolicy(data.policy);
            setDirty(false);
          }}
        >
          Bỏ thay đổi
        </button>
      )}
    </section>
  );
}
