"use client";

import Link from "next/link";
import styles from "./styles.module.css";
import { ContentPicker } from "./content-picker";
import { useBrowserControlPageState } from "./_components/use-browser-control-page-state";
import { QuickStartSection } from "./_components/quick-start-section";
import { ScheduleSection } from "./_components/schedule-section";
import { DevicesSection } from "./_components/devices-section";
import { LessonsSection } from "./_components/lessons-section";
import { DailyActivitySection } from "./_components/daily-activity-section";

export default function BrowserControlPage() {
  const state = useBrowserControlPageState();
  const {
    authorized,
    busy,
    change,
    childId,
    childName,
    children,
    createChild,
    data,
    dirty,
    load,
    policy,
    setChildId,
    setChildName,
    setStatus,
    status,
    totalMinutes,
  } = state;
return (
    <main className={styles.root}>
      <div className={styles.container}>
        <header className={styles.header}>
          <div>
            <Link href="/" className={styles.back}>
              ← Minhhuong
            </Link>
            <p className={styles.eyebrow}>GIA ĐÌNH · KHÔNG GIAN SỐ AN TOÀN</p>
            <h1>Cùng con xem. Cùng con học.</h1>
            <p>
              Chọn nội dung phù hợp, tạo nhịp học lành mạnh và theo dõi mỗi bước
              tiến nhỏ.
            </p>
          </div>
          <span className={styles.pill}>Thiết lập máy học của con</span>
        </header>
        {authorized === null ? (
          <p>Đang tải tài khoản…</p>
        ) : !authorized ? (
          <section className={styles.card}>
            <h2>Đăng nhập tài khoản phụ huynh</h2>
            <p>
              Mỗi gia đình có một khu vực riêng để chọn bài học và kết nối máy
              của con.
            </p>
            <Link href="/">Về trang đăng nhập</Link>
          </section>
        ) : (
          <>
            <section className={`${styles.card} ${styles.toolbar}`}>
              <label>
                Hồ sơ của con
                <select
                  disabled={busy || dirty}
                  value={childId}
                  onChange={(e) => {
                    setChildId(e.target.value);
                    void load(e.target.value);
                  }}
                >
                  {!children.length && <option value="">Chưa có hồ sơ</option>}
                  {children.map((child) => (
                    <option key={child.id} value={child.id}>
                      {child.displayName}
                    </option>
                  ))}
                </select>
              </label>
              <form onSubmit={createChild}>
                <label>
                  Thêm hồ sơ
                  <input
                    required
                    maxLength={80}
                    value={childName}
                    onChange={(e) => setChildName(e.target.value)}
                    placeholder="Tên gọi của con"
                  />
                </label>
                <button disabled={busy || dirty}>Thêm con</button>
              </form>
            </section>
            <p role="status" aria-live="polite" className={styles.status}>
              {status}
              {dirty ? " · Có thay đổi chưa lưu" : ""}
            </p>
            {data && policy && (
              <>
                <QuickStartSection {...state} />
                <ContentPicker
                  key={childId}
                  childId={childId}
                  selectedItems={policy.items}
                  disabled={busy}
                  onAdd={(items) => {
                    const urls = new Set(policy.items.map((item) => item.url));
                    const additions = items.filter(
                      (item) => !urls.has(item.url),
                    );
                    if (policy.items.length + additions.length > 50) {
                      setStatus(
                        "Danh sách tối đa 50 nội dung. Hãy chọn ít hơn hoặc gỡ nội dung cũ.",
                      );
                      return;
                    }
                    change({
                      ...policy,
                      items: [...policy.items, ...additions],
                    });
                    setStatus(
                      `Đã thêm ${additions.length} video. Kiểm tra thời lượng rồi nhấn Lưu thay đổi.`,
                    );
                  }}
                />
                <div className={styles.stats}>
                  <div>
                    <span>THIẾT BỊ ĐANG GHÉP</span>
                    <strong>
                      {data.devices.filter((d) => !d.revokedAt).length}
                    </strong>
                  </div>
                  <div>
                    <span>NỘI DUNG ĐƯỢC DUYỆT</span>
                    <strong>{policy.items.length}</strong>
                  </div>
                  <div>
                    <span>PHÚT SỬ DỤNG · 30 NGÀY</span>
                    <strong>{totalMinutes}</strong>
                  </div>
                  <div>
                    <span>BÀI TẬP · NHẬT KÝ GẦN NHẤT</span>
                    <strong>
                      {data.events.filter((e) => e.kind === "EXERCISE").length}
                    </strong>
                  </div>
                </div>
                <div className={styles.columns}>
                  <ScheduleSection {...state} />
                  <DevicesSection {...state} />
                </div>
                <LessonsSection {...state} />
                <DailyActivitySection {...state} />
              </>
            )}
          </>
        )}
        <footer className={styles.footer}>
          Minhhuong · Nội dung do gia đình lựa chọn. Học tập theo nhịp của con.
        </footer>
      </div>
    </main>
  );
}
