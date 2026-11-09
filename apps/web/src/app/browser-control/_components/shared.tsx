"use client";

import { type Item, type Question } from "../client";

export const extensionStoreUrl = process.env.NEXT_PUBLIC_EXTENSION_STORE_URL?.trim();

export type Policy = {
  mode: "WATCH" | "LEARN_ONLY" | "EXERCISE_ONLY" | "PAUSED";
  dailyMinutes: number;
  timezone: string;
  windows: { days: number[]; start: string; end: string }[];
  items: Item[];
};

export type QuickPreset = {
  id: string;
  title: string;
  description: string;
  mode: Policy["mode"];
  dailyMinutes: number;
};

export type Device = {
  id: string;
  name: string;
  revokedAt: string | null;
  lastSeenAt: string | null;
};

export type Dashboard = {
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

export const templates: Record<string, { context: string; questions: Question[] }> = {
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

export const blankItem = (): Item => ({
  id: crypto.randomUUID(),
  title: "",
  url: "",
  minutes: 10,
  aiUrl: "",
  ...structuredClone(templates["Màu sắc"]),
});

export const labels: Record<string, string> = {
  WATCH: "Xem nội dung",
  LEARN: "Hoạt động học",
  TIME_UP: "Hết giờ / chuyển học",
  BLOCKED: "Chặn truy cập",
  CLOCK_WARNING: "Kiểm tra đồng hồ",
  EXERCISE: "Hoàn thành bài tập",
};

export const quickPresets: QuickPreset[] = [
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
