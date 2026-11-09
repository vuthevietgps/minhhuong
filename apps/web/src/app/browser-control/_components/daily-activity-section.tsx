"use client";

import styles from "../styles.module.css";
import { labels } from "./shared";
import type { BrowserControlPageState } from "./use-browser-control-page-state";

/** 04 - daily activity table. */
export function DailyActivitySection(state: BrowserControlPageState) {
  const {
    busy,
    childId,
    data,
    dirty,
    load,
    policy,
    run,
  } = state;
  // Rendered only when data and policy are loaded (see page.tsx).
  if (!data || !policy) return null;
  return (
    <section className={styles.card}>
      <div className={styles.sectionHead}>
        <div>
          <p className={styles.eyebrow}>04 · ĐỒNG HÀNH MỖI NGÀY</p>
          <h2>Nhật ký & kết quả</h2>
        </div>
        <button
          className={styles.secondary}
          disabled={busy || dirty}
          onClick={() => void run(() => load(childId))}
        >
          Làm mới báo cáo
        </button>
      </div>
      <p className={styles.hint}>
        Tối đa 200 sự kiện gần nhất trong 30 ngày. Số phút là thời
        gian truy cập được cấp, có thể làm tròn lên tối đa 5 giây
        mỗi lần đổi tab / mở lại. Không ghi địa chỉ trang bị chặn.
      </p>
      <div className={styles.table}>
        <table>
          <thead>
            <tr>
              <th>Thời gian</th>
              <th>Thiết bị</th>
              <th>Hoạt động</th>
              <th>Nội dung / kết quả</th>
            </tr>
          </thead>
          <tbody>
            {data.events.map((event) => (
              <tr key={event.id}>
                <td>
                  {new Date(event.occurredAt).toLocaleString(
                    "vi-VN",
                  )}
                </td>
                <td>
                  {data.devices.find((d) => d.id === event.deviceId)
                    ?.name || "Thiết bị"}
                </td>
                <td>{labels[event.kind] || event.kind}</td>
                <td>
                  {event.detail?.title ||
                    policy.items.find((i) => i.id === event.itemId)
                      ?.title ||
                    "—"}
                  {event.kind === "EXERCISE" && event.detail && (
                    <strong>
                      {" "}
                      · {event.detail.correct}/{event.detail.total}{" "}
                      câu đúng
                    </strong>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!data.events.length && (
          <p className={styles.empty}>
            Nhật ký sẽ xuất hiện khi thiết bị đồng bộ hoạt động.
          </p>
        )}
      </div>
    </section>
  );
}
