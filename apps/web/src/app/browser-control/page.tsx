"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { readStoredSession } from "../session-storage";
import styles from "./styles.module.css";
import { ContentPicker } from "./content-picker";
import { api, type Item, type Question } from "./client";

const extensionStoreUrl = process.env.NEXT_PUBLIC_EXTENSION_STORE_URL?.trim();

type Policy = {
  mode: "WATCH" | "LEARN_ONLY" | "EXERCISE_ONLY" | "PAUSED";
  dailyMinutes: number;
  timezone: string;
  windows: { days: number[]; start: string; end: string }[];
  items: Item[];
};
type QuickPreset = {
  id: string;
  title: string;
  description: string;
  mode: Policy["mode"];
  dailyMinutes: number;
};
type Device = {
  id: string;
  name: string;
  revokedAt: string | null;
  lastSeenAt: string | null;
};
type Dashboard = {
  policy: Policy;
  revision: number;
  devices: Device[];
  usage: { deviceId: string; day: string; itemId: string; seconds: number }[];
  events: {
    id: string;
    deviceId: string;
    kind: string;
    itemId?: string;
    occurredAt: string;
    detail?: { correct: number; total: number; title: string };
  }[];
};
const templates: Record<string, { context: string; questions: Question[] }> = {
  "Màu sắc": {
    context:
      "Ngữ cảnh tự biên soạn cho trẻ 5–9 tuổi, chủ đề màu sắc; không phải phụ đề hay bản tóm tắt video. Mục tiêu: nhận biết red (đỏ), yellow (vàng), blue (xanh dương), green (xanh lá). Ví dụ mới: The leaf is green. The sun in my drawing is yellow. Khi trò chuyện, dùng câu ngắn, một câu hỏi mỗi lượt. Bắt đầu bằng: What color do you like? Khuyến khích con tự nói I like blue. Có thể cùng con tưởng tượng một bức tranh và chọn màu. Không khẳng định một đồ vật trong video có màu gì vì ngữ cảnh này không mô tả video. Không hỏi thông tin riêng tư. Sau vài lượt, mời con làm bài tập nhận biết màu.",
    questions: [
      {
        prompt: "Green là màu gì?",
        options: ["Xanh lá", "Đỏ", "Vàng"],
        answer: 0,
      },
      {
        prompt: "Điền vào câu: The leaf is … (chiếc lá màu xanh lá).",
        options: ["red", "green", "blue"],
        answer: 1,
      },
    ],
  },
  "Động vật": {
    context:
      "Ngữ cảnh tự biên soạn cho trẻ dưới 10 tuổi, chủ đề động vật, độc lập với lời thoại video. Từ vựng: cat (mèo), dog (chó), bird (chim), fish (cá). Kiến thức: cá thường sống trong nước; nhiều loài chim có thể bay; không phải mọi loài chim đều bay. Ví dụ tự viết: A small fish swims. I see a bird. Hỏi từng câu ngắn: Which animal do you like? Gợi ý con trả lời I like cats. Có thể chơi đoán con vật bằng đặc điểm đơn giản. Không tự nhận đã xem video hoặc trích dẫn lời nhân vật. Không hướng dẫn trẻ chạm vào động vật lạ. Khen nỗ lực của con và nhẹ nhàng sửa tối đa một lỗi mỗi lượt.",
    questions: [
      { prompt: "Fish là con gì?", options: ["Chim", "Cá", "Mèo"], answer: 1 },
      {
        prompt: "Con vật nào thường sống trong nước?",
        options: ["Cat", "Dog", "Fish"],
        answer: 2,
      },
    ],
  },
  "Số đếm": {
    context:
      "Ngữ cảnh học do Minhhuong tự viết cho trẻ dưới 10 tuổi. Chủ đề: đếm từ one đến five. Từ mới: one = 1, two = 2, three = 3, four = 4, five = 5. Dùng ví dụ mới như three stars, two apples; đây là tình huống tưởng tượng chứ không phải mô tả video. Cho con đếm các biểu tượng hoặc đồ vật quen thuộc, mỗi lần chỉ một câu hỏi. Bắt đầu: Can you count to three? Nếu con chưa biết, làm mẫu One, two, three rồi mời thử lại. Không chấm điểm khắt khe hay so sánh với trẻ khác. Có thể chơi thêm hoặc bớt một vật trong phạm vi 5. Chỉ hỏi về hoạt động học, không thu thập thông tin cá nhân.",
    questions: [
      {
        prompt: "⭐⭐⭐ — có bao nhiêu ngôi sao?",
        options: ["Two", "Three", "Five"],
        answer: 1,
      },
      {
        prompt: "One + one bằng mấy?",
        options: ["Two", "Four", "Five"],
        answer: 0,
      },
    ],
  },
};
const blankItem = (): Item => ({
  id: crypto.randomUUID(),
  title: "",
  url: "",
  minutes: 10,
  aiUrl: "",
  ...structuredClone(templates["Màu sắc"]),
});
const labels: Record<string, string> = {
  WATCH: "Xem nội dung",
  LEARN: "Hoạt động học",
  TIME_UP: "Hết giờ / chuyển học",
  BLOCKED: "Chặn truy cập",
  CLOCK_WARNING: "Kiểm tra đồng hồ",
  EXERCISE: "Hoàn thành bài tập",
};
const quickPresets: QuickPreset[] = [
  {
    id: "safe",
    title: "Xem an toàn",
    description: "Chỉ mở nội dung đã duyệt, tối đa 30 phút mỗi ngày.",
    mode: "WATCH",
    dailyMinutes: 30,
  },
  {
    id: "learning",
    title: "Chỉ học và làm bài",
    description: "Không xem video, chỉ mở bài học và bài tập.",
    mode: "LEARN_ONLY",
    dailyMinutes: 45,
  },
  {
    id: "pause",
    title: "Tạm dừng",
    description: "Tạm khóa nội dung cho đến khi phụ huynh bật lại.",
    mode: "PAUSED",
    dailyMinutes: 30,
  },
];

export default function BrowserControlPage() {
  const [children, setChildren] = useState<
    { id: string; displayName: string }[]
  >([]);
  const [childId, setChildId] = useState("");
  const [data, setData] = useState<Dashboard | null>(null);
  const [policy, setPolicy] = useState<Policy | null>(null);
  const [draft, setDraft] = useState<Item | null>(null);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [pairing, setPairing] = useState<{
    code: string;
    expiresAt: string;
  } | null>(null);
  const [childName, setChildName] = useState("");
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const loadId = useRef(0);
  const load = useCallback(async (id: string) => {
    const requestId = ++loadId.current;
    setData(null);
    setPolicy(null);
    setPairing(null);
    setDraft(null);
    setDirty(false);
    try {
      const result = await api<Dashboard>(`parent/browser-control/${id}`);
      if (requestId === loadId.current) {
        setData(result);
        setPolicy(result.policy);
      }
    } catch (error) {
      if (requestId === loadId.current) setStatus((error as Error).message);
    }
  }, []);
  useEffect(() => {
    const timer = setTimeout(async () => {
      const session = readStoredSession<{
        accessToken: string;
        user?: { roles: string[] };
      }>();
      const allowed = !!session?.user?.roles.includes("PARENT");
      setAuthorized(allowed);
      if (!allowed) return;
      try {
        const result = await api<{
          children: { id: string; displayName: string }[];
        }>("parent/children");
        setChildren(result.children);
        if (result.children[0]) {
          setChildId(result.children[0].id);
          await load(result.children[0].id);
        }
      } catch (error) {
        setStatus((error as Error).message);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [load]);
  const change = (next: Policy) => {
    setPolicy(next);
    setDirty(true);
  };
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
  async function save() {
    if (!policy) return;
    await api(`parent/browser-control/${childId}`, "PUT", policy);
    setData((current) =>
      current ? { ...current, policy: structuredClone(policy) } : current,
    );
    setDirty(false);
    setStatus(
      "Đã lưu. Máy của con sẽ tự nhận thay đổi trong khoảng 30 giây khi có mạng.",
    );
  }
  async function createChild(event: FormEvent) {
    event.preventDefault();
    await run(async () => {
      const child = await api<{ id: string; displayName: string }>(
        "parent/children",
        "POST",
        { displayName: childName },
      );
      setChildren((current) => [...current, child]);
      setChildName("");
      setChildId(child.id);
      await load(child.id);
    });
  }
  const totalMinutes = Math.ceil(
    (data?.usage.reduce((sum, u) => sum + u.seconds, 0) || 0) / 60,
  );
  const selectedChild = children.find((child) => child.id === childId);
  const activeDevices = data?.devices.filter((device) => !device.revokedAt) ?? [];
  const setupStep = !policy?.items.length ? 1 : !activeDevices.length ? 2 : 3;
  const applyPreset = (preset: QuickPreset) => {
    if (!policy) return;
    change({
      ...policy,
      mode: preset.mode,
      dailyMinutes: preset.dailyMinutes,
      windows: [],
    });
    setStatus("Đã chọn “" + preset.title + "”. Nhấn “Lưu thay đổi” để áp dụng.");
  };
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
                        void run(async () =>
                          setPairing(
                            await api(
                              `parent/browser-control/${childId}/pairing`,
                              "POST",
                            ),
                          ),
                        )
                      }
                    >
                      Tạo mã kích hoạt plugin
                    </button>
                    {pairing && (
                      <div className={styles.pair}>
                        <code>{pairing.code}</code>
                        <p>
                          Dùng một lần · hết hạn{" "}
                          {new Date(pairing.expiresAt).toLocaleTimeString(
                            "vi-VN",
                          )}
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
                </div>
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
