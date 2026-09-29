"use client";

import { useCallback, useEffect, useState } from "react";
import { adminJson, formatDate } from "../_lib/admin-client";
import { useStoredAdminSession } from "../_lib/admin-session";

type Application = {
  id: string;
  email: string;
  agencyName: string;
  requestedCode: string;
  contactPhone: string | null;
  notes: string | null;
  status: "PENDING_REVIEW" | "APPROVED" | "REJECTED";
  reviewNotes: string | null;
  agencyId: string | null;
  createdAt: string;
};

export default function AgencyApplicationsPage() {
  const { loaded, roles } = useStoredAdminSession();
  const allowed = roles.includes("ADMIN") || roles.includes("OPERATIONS");
  const [items, setItems] = useState<Application[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    const rows = await adminJson<Application[]>(
      "/channel-admin/agency-applications",
      undefined,
      "Không thể tải hồ sơ đại lý.",
    );
    setItems(rows);
  }, []);

  useEffect(() => {
    if (!loaded || !allowed) return;
    const timer = window.setTimeout(() => {
      void load().catch((error) => setMessage(String(error)));
    }, 0);
    return () => window.clearTimeout(timer);
  }, [allowed, load, loaded]);

  async function review(id: string, decision: "approve" | "reject") {
    setBusyId(id);
    setMessage("");
    try {
      await adminJson(
        `/channel-admin/agency-applications/${id}/${decision}`,
        {
          method: "POST",
          ...(decision === "reject"
            ? { body: JSON.stringify({ reviewNotes: notes[id] || undefined }) }
            : {}),
        },
        "Không thể xét duyệt hồ sơ.",
      );
      await load();
      setMessage(decision === "approve" ? "Đã duyệt và cấp quyền bán cho đại lý." : "Đã từ chối hồ sơ.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Không thể xét duyệt hồ sơ.");
    } finally {
      setBusyId(null);
    }
  }

  if (!loaded) return <p className="p-8 text-slate-500">Đang kiểm tra quyền truy cập...</p>;
  if (!allowed) return <p className="p-8 text-rose-700">Bạn không có quyền duyệt đại lý.</p>;

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <header className="rounded-3xl border border-slate-200 bg-white p-6">
        <h1 className="text-3xl font-bold text-slate-950">Duyệt đăng ký đại lý</h1>
        <p className="mt-2 text-sm text-slate-600">Chỉ khi duyệt mới tạo tài khoản đại lý, mã kênh và quyền bán. Mã này không kết nối plugin của phụ huynh.</p>
        <p className="mt-2 text-sm text-amber-800">Hãy xác minh email và thông tin liên hệ của người đăng ký trước khi duyệt.</p>
        {message && <p className="mt-3 text-sm text-teal-800" role="status">{message}</p>}
      </header>
      <div className="space-y-4">
        {items.length === 0 && <p className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-500">Chưa có hồ sơ.</p>}
        {items.map((item) => (
          <article key={item.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">{item.agencyName}</h2>
                <p className="mt-1 text-sm text-slate-600">{item.email} · {item.contactPhone || "Không có số điện thoại"}</p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold">{item.status}</span>
            </div>
            <p className="mt-3 text-sm">Mã đề xuất: <code className="font-semibold">{item.requestedCode}</code> · Gửi ngày {formatDate(item.createdAt)}</p>
            {item.notes && <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">{item.notes}</p>}
            {item.reviewNotes && <p className="mt-2 text-sm text-slate-600">Ghi chú duyệt: {item.reviewNotes}</p>}
            {item.status === "PENDING_REVIEW" && (
              <div className="mt-4 flex flex-wrap items-end gap-2">
                <label className="min-w-56 flex-1 text-sm">Lý do từ chối (nếu có)
                  <input className="mt-1 w-full rounded-xl border border-slate-300 p-2" value={notes[item.id] || ""} onChange={(event) => setNotes((current) => ({ ...current, [item.id]: event.target.value }))} maxLength={1000} />
                </label>
                <button disabled={busyId !== null} onClick={() => void review(item.id, "approve")} className="rounded-xl bg-teal-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Duyệt & cấp mã</button>
                <button disabled={busyId !== null} onClick={() => void review(item.id, "reject")} className="rounded-xl border border-rose-300 px-4 py-2 text-sm font-semibold text-rose-700 disabled:opacity-50">Từ chối</button>
              </div>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
