"use client";

import styles from "../styles.module.css";
import { quickPresets } from "./shared";
import type { BrowserControlPageState } from "./use-browser-control-page-state";

/** Quick setup presets for the child's browser rules. */
export function QuickStartSection(state: BrowserControlPageState) {
  const {
    applyPreset,
    busy,
    policy,
    selectedChild,
    setupStep,
  } = state;
  // Rendered only when data and policy are loaded (see page.tsx).
  if (!policy) return null;
  return (
    <section className={`${styles.card} ${styles.quickStart}`}>
      <div className={styles.sectionHead}>
        <div>
          <p className={styles.eyebrow}>THIẾT LẬP NHANH</p>
          <h2>
            Bắt đầu cho {selectedChild?.displayName || "con"}
          </h2>
          <p>
            Chọn một cách dùng sẵn có. Bạn có thể đổi lại bất cứ
            lúc nào, không cần hiểu các cài đặt kỹ thuật.
          </p>
        </div>
        <span className={styles.progressBadge}>Bước {setupStep}/3</span>
      </div>
      <div className={styles.setupSteps}>
        <div className={setupStep >= 1 ? styles.done : ""}>
          <strong>1</strong>
            <span>Chọn bài học</span>
        </div>
        <div className={setupStep >= 2 ? styles.done : ""}>
          <strong>2</strong>
            <span>Kết nối máy của con</span>
        </div>
        <div className={setupStep >= 3 ? styles.done : ""}>
          <strong>3</strong>
            <span>Hoàn tất</span>
        </div>
      </div>
      <div className={styles.presetGrid}>
        {quickPresets.map((preset) => (
          <button
            type="button"
            key={preset.id}
            className={`${styles.preset} ${
              policy.mode === preset.mode &&
              policy.dailyMinutes === preset.dailyMinutes
                ? styles.presetActive
                : ""
            }`}
            disabled={busy}
            onClick={() => applyPreset(preset)}
          >
            <strong>{preset.title}</strong>
            <span>{preset.description}</span>
          </button>
        ))}
      </div>
      <p className={styles.hint}>
        Bạn vẫn có thể chọn video bên dưới. Cài đặt nâng cao chỉ
        cần dùng khi gia đình có lịch xem riêng.
      </p>
    </section>
  );
}
