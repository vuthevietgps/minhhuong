import { getStoredAccessToken } from "../session-storage";

export type Question = { prompt: string; options: string[]; answer: number };
export type Item = {
  id: string;
  title: string;
  url: string;
  minutes: number;
  context: string;
  aiUrl?: string;
  questions: Question[];
};
const apiBase = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"
).replace(/\/$/, "");
export async function api<T>(
  path: string,
  method = "GET",
  body?: unknown,
): Promise<T> {
  const token = getStoredAccessToken();
  if (!token)
    throw new Error("Hãy đăng nhập tài khoản phụ huynh tại trang chủ.");
  const response = await fetch(`${apiBase}/v1/${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const data = await response.json();
  if (!response.ok)
    throw new Error(
      Array.isArray(data.message)
        ? data.message.join(" · ")
        : data.message || "Không thể tải dữ liệu",
    );
  return data;
}
