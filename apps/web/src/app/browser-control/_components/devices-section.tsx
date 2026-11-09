"use client";

import styles from "../styles.module.css";
import { api } from "../client";
import { extensionStoreUrl } from "./shared";
import type { BrowserControlPageState } from "./use-browser-control-page-state";

/** 02 - pairing code and the child's connected devices. */
export function DevicesSection(state: BrowserControlPageState) {
  const {
    busy,
    childId,
    data,
    pairing,
    pairingSecondsLeft,
    run,
    setData,
    setNow,
    setPairing,
    setStatus,
  } = state;
  // Rendered only when data and policy are loaded (see page.tsx).
  if (!data) return null;
  return (
    <section className={styles.card}>
      <p className={styles.eyebrow}>02 · KẾT NỐI MÁY CỦA CON</p>
      <h2>Kết nối máy của con</h2>
      <p>
        Làm lần lượt ba bước dưới đây. Bạn chỉ cần làm một lần cho
        mỗi máy.
      </p>
      <ol className={styles.installSteps}>
        <li>
          <strong>Mở Chrome trên máy của con.</strong>
        </li>
        <li>
          <strong>Cài tiện ích Minh Hương.</strong>{" "}
          {extensionStoreUrl ? (
            <a
              className={styles.inlineLink}
              href={extensionStoreUrl}
              rel="noreferrer"
              target="_blank"
            >
              Cài vào Chrome →
            </a>
          ) : (
            <span> Bản thử nghiệm cần người hỗ trợ cài giúp.</span>
          )}
        </li>
        <li>
          <strong>Mở plugin trên máy của con và nhập mã kích hoạt quản lý trình duyệt bên dưới.</strong>
        </li>
      </ol>
      <details className={styles.advanced}>
        <summary>Dành cho người hỗ trợ cài bản thử nghiệm</summary>
        <p className={styles.hint}>
          Giải nén gói cài, mở chrome://extensions, bật Chế độ dành
          cho nhà phát triển rồi chọn Tải tiện ích đã giải nén. Phụ
          huynh thông thường không cần tự làm bước này.
        </p>
      </details>
      <button
        disabled={busy}
        onClick={() =>
          void run(async () => {
            const created = await api<{
              code: string;
              expiresAt: string;
            }>(`parent/browser-control/${childId}/pairing`, "POST");
            setNow(Date.now());
            setPairing({
              ...created,
              knownDeviceIds: data.devices.map((d) => d.id),
            });
          })
        }
      >
        {pairing ? "Tạo mã mới" : "Tạo mã kích hoạt plugin"}
      </button>
      {pairing && pairingSecondsLeft === 0 && (
        <p className={styles.hint}>
          Mã đã hết hạn. Bấm “Tạo mã mới” để lấy mã khác.
        </p>
      )}
      {pairing && pairingSecondsLeft > 0 && (
        <div className={styles.pair}>
          <code>{pairing.code.match(/.{1,4}/g)?.join(" ")}</code>
          <p>
            Dùng một lần · còn{" "}
            {Math.floor(pairingSecondsLeft / 60)}:
            {String(pairingSecondsLeft % 60).padStart(2, "0")} ·
            gõ trên máy của con, không cần gõ dấu cách.
          </p>
          <p className={styles.hint}>
            Đang chờ máy của con kết nối… Trang sẽ tự cập nhật.
          </p>
          <button
            className={styles.secondary}
            onClick={() =>
              void navigator.clipboard
                .writeText(pairing.code)
                .then(
                  () => setStatus("Đã sao chép mã kích hoạt plugin"),
                  () =>
                    setStatus(
                      "Hãy chọn và sao chép mã kích hoạt ở trên",
                    ),
                )
            }
          >
            Sao chép mã kích hoạt
          </button>
        </div>
      )}
      {!data.devices.length && (
        <p className={styles.empty}>Chưa kết nối máy nào.</p>
      )}
      {data.devices.map((device) => (
        <div className={styles.device} key={device.id}>
          <div>
            <strong>{device.name}</strong>
            <small>
              {device.revokedAt
                ? "Đã thu hồi"
                : device.lastSeenAt
                  ? `Lần cuối: ${new Date(device.lastSeenAt).toLocaleString("vi-VN")}`
                  : "Chưa đồng bộ"}
            </small>
          </div>
          {!device.revokedAt && (
            <button
              className={styles.secondary}
              disabled={busy}
              onClick={() =>
                void run(async () => {
                  await api(
                    `parent/browser-control/${childId}/devices/${device.id}`,
                    "DELETE",
                  );
                  setData({
                    ...data,
                    devices: data.devices.map((d) =>
                      d.id === device.id
                        ? {
                            ...d,
                            revokedAt: new Date().toISOString(),
                          }
                        : d,
                    ),
                  });
                  setStatus(
                    "Đã ngắt kết nối. Máy của con sẽ dừng truy cập ở lần kiểm tra tiếp theo.",
                  );
                })
              }
            >
              Ngắt kết nối
            </button>
          )}
        </div>
      ))}
      <p className={styles.hint}>
        Khi mất mạng, máy vẫn dùng thiết lập gần nhất. Các thay đổi
        mới sẽ có hiệu lực khi máy kết nối mạng trở lại.
      </p>
    </section>
  );
}
