"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { adminJson, formatDate } from "../_lib/admin-client";
import { useStoredAdminSession } from "../_lib/admin-session";

type AffiliateLink = {
  id: string;
  name: string;
  linkCode: string;
  referralCode: string | null;
  publicUrl: string;
  campaign: string | null;
  status: "ACTIVE" | "PAUSED" | "EXPIRED" | "REVOKED";
  createdAt: string;
  participant: { code: string; displayName: string };
};

const allowedRoles = ["ADMIN", "DIRECTOR", "OPERATIONS", "SALE", "AGENCY_OWNER", "AGENCY_MANAGER"];

export default function AffiliatePage() {
  const { loaded, roles } = useStoredAdminSession();
  const allowed = roles.some((role) => allowedRoles.includes(role));
  const [links, setLinks] = useState<AffiliateLink[]>([]);
  const [name, setName] = useState("");
  const [campaign, setCampaign] = useState("");
  const [linkCode, setLinkCode] = useState("");
  const [participantCode, setParticipantCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    const data = await adminJson<{ items: AffiliateLink[] }>(
      "/channel-affiliate/links?limit=100",
      undefined,
      "Không thể tải link affiliate.",
    );
    setLinks(data.items);
  }, []);

  useEffect(() => {
    if (!loaded || !allowed) return;
    const timer = window.setTimeout(() => {
      void load().catch((error) => setMessage(String(error)));
    }, 0);
    return () => window.clearTimeout(timer);
  }, [allowed, load, loaded]);

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      await adminJson(
        "/channel-affiliate/links",
        {
          method: "POST",
          body: JSON.stringify({
            name,
            campaign: campaign || undefined,
            linkCode: linkCode || undefined,
            participantCode: participantCode || undefined,
          }),
        },
        "Không thể tạo link affiliate.",
      );
      setName("");
      setCampaign("");
      setLinkCode("");
      await load();
      setMessage("Đã tạo link affiliate. Chia sẻ link này để ghi nhận lượt nhấp và nguồn đơn.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Không thể tạo link affiliate.");
    } finally {
      setBusy(false);
    }
  }

  async function setStatus(id: string, status: "ACTIVE" | "PAUSED" | "REVOKED") {
    setBusy(true);
    try {
      await adminJson(
        `/channel-affiliate/links/${id}`,
        { method: "PATCH", body: JSON.stringify({ status }) },
        "Không thể cập nhật link.",
      );
      await load();
      setMessage("Đã cập nhật trạng thái link.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Không thể cập nhật link.");
    } finally {
      setBusy(false);
    }
  }

  if (!loaded) return <p className="p-8 text-slate-500">Đang kiểm tra quyền truy cập...</p>;
  if (!allowed) return <p className="p-8 text-rose-700">Bạn không có quyền quản lý affiliate.</p>;

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <header className="rounded-3xl border border-slate-200 bg-white p-6">
        <h1 className="text-3xl font-bold">Mã và link affiliate</h1>
        <p className="mt-2 text-sm text-slate-600">Mỗi link có mã riêng để theo dõi nguồn giới thiệu. Mã affiliate không cấp quyền bán và không dùng để kích hoạt plugin.</p>
        {message && <p className="mt-3 text-sm text-teal-800" role="status">{message}</p>}
      </header>
      <form onSubmit={create} className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-6 md:grid-cols-2">
        <label className="text-sm font-medium">Tên link
          <input className="mt-1 w-full rounded-xl border border-slate-300 p-3" value={name} onChange={(event) => setName(event.target.value)} minLength={2} maxLength={160} required />
        </label>
        <label className="text-sm font-medium">Chiến dịch (tùy chọn)
          <input className="mt-1 w-full rounded-xl border border-slate-300 p-3" value={campaign} onChange={(event) => setCampaign(event.target.value)} maxLength={120} />
        </label>
        <label className="text-sm font-medium">Mã link tùy chọn (để trống để tự tạo)
          <input className="mt-1 w-full rounded-xl border border-slate-300 p-3" value={linkCode} onChange={(event) => setLinkCode(event.target.value.toLowerCase())} pattern="af_[a-z0-9-]{3,48}" placeholder="af_chiendich-2026" />
        </label>
        <label className="text-sm font-medium">Mã người bán (quản lý chọn, người bán để trống)
          <input className="mt-1 w-full rounded-xl border border-slate-300 p-3 uppercase" value={participantCode} onChange={(event) => setParticipantCode(event.target.value.toUpperCase())} maxLength={80} />
        </label>
        <button disabled={busy} className="rounded-xl bg-teal-700 px-5 py-3 font-semibold text-white disabled:opacity-50 md:col-span-2">Tạo link affiliate</button>
      </form>
      <div className="space-y-3">
        {links.length === 0 && <p className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-500">Chưa có link affiliate.</p>}
        {links.map((link) => (
          <article key={link.id} className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold">{link.name}</h2>
                <p className="mt-1 text-sm text-slate-600">{link.participant?.displayName || link.referralCode} · {link.campaign || "Không có chiến dịch"} · {formatDate(link.createdAt)}</p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold">{link.status}</span>
            </div>
            <div className="mt-3 break-all text-sm"><a className="text-teal-700 underline" href={link.publicUrl} target="_blank" rel="noreferrer">{link.publicUrl}</a></div>
            <p className="mt-1 text-xs text-slate-500">Mã link: {link.linkCode} · Mã kênh: {link.referralCode || "-"}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" onClick={() => void navigator.clipboard.writeText(link.publicUrl).then(() => setMessage("Đã sao chép link."))} className="rounded-xl border border-slate-300 px-3 py-2 text-sm">Sao chép link</button>
              {link.status === "ACTIVE" ? <button disabled={busy} onClick={() => void setStatus(link.id, "PAUSED")} className="rounded-xl border border-slate-300 px-3 py-2 text-sm">Tạm dừng</button> : link.status === "PAUSED" ? <button disabled={busy} onClick={() => void setStatus(link.id, "ACTIVE")} className="rounded-xl border border-slate-300 px-3 py-2 text-sm">Bật lại</button> : null}
              {link.status !== "REVOKED" && <button disabled={busy} onClick={() => void setStatus(link.id, "REVOKED")} className="rounded-xl border border-rose-300 px-3 py-2 text-sm text-rose-700">Thu hồi</button>}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
