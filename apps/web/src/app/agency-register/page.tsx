"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import {
  publicApiBaseUrl,
  readApiError,
} from "../admin/_lib/admin-client";

export default function AgencyRegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agencyName, setAgencyName] = useState("");
  const [requestedCode, setRequestedCode] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch(`${publicApiBaseUrl}/v1/agency-applications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          agencyName,
          requestedCode: requestedCode.trim().toUpperCase(),
          contactPhone: contactPhone || undefined,
          notes: notes || undefined,
        }),
      });
      if (!response.ok) {
        throw new Error(await readApiError(response, "Không thể gửi đăng ký."));
      }
      setSubmitted(true);
      setPassword("");
      setMessage("Đã nhận hồ sơ. Admin sẽ xét duyệt trước khi mã đại lý và quyền bán có hiệu lực.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Không thể gửi đăng ký.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12 text-slate-900">
      <div className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9">
        <Link href="/" className="text-sm font-semibold text-teal-700">← Về trang chủ</Link>
        <h1 className="mt-5 text-3xl font-bold">Đăng ký làm đại lý</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Đề xuất mã đại lý và gửi hồ sơ. Mã chỉ dùng để quản lý kênh bán sau khi admin duyệt.
          Link affiliate được tạo riêng trong cổng kênh; mã kết nối plugin do phụ huynh tạo.
        </p>
        {submitted ? (
          <div className="mt-6 rounded-2xl bg-teal-50 p-5 text-sm leading-6 text-teal-900" role="status">
            {message}
          </div>
        ) : (
          <form onSubmit={submit} className="mt-7 space-y-4">
            <label className="block text-sm font-medium">Tên đại lý
              <input className="mt-1 w-full rounded-xl border border-slate-300 p-3" value={agencyName} onChange={(event) => setAgencyName(event.target.value)} minLength={2} maxLength={160} required />
            </label>
            <label className="block text-sm font-medium">Mã đại lý đề xuất
              <input className="mt-1 w-full rounded-xl border border-slate-300 p-3 uppercase" value={requestedCode} onChange={(event) => setRequestedCode(event.target.value.replace(/[^a-zA-Z0-9-]/g, "").slice(0, 32))} minLength={3} maxLength={32} placeholder="VD: DAILY-HANOI" required />
            </label>
            <label className="block text-sm font-medium">Email đăng nhập
              <input className="mt-1 w-full rounded-xl border border-slate-300 p-3" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
            </label>
            <label className="block text-sm font-medium">Mật khẩu sau khi được duyệt
              <input className="mt-1 w-full rounded-xl border border-slate-300 p-3" type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={8} maxLength={128} autoComplete="new-password" required />
            </label>
            <label className="block text-sm font-medium">Số điện thoại liên hệ
              <input className="mt-1 w-full rounded-xl border border-slate-300 p-3" value={contactPhone} onChange={(event) => setContactPhone(event.target.value)} maxLength={20} />
            </label>
            <label className="block text-sm font-medium">Thông tin thêm
              <textarea className="mt-1 w-full rounded-xl border border-slate-300 p-3" value={notes} onChange={(event) => setNotes(event.target.value)} maxLength={1000} rows={3} />
            </label>
            {message && <p className="text-sm text-rose-700" role="alert">{message}</p>}
            <button disabled={busy} className="w-full rounded-xl bg-teal-700 px-5 py-3 font-semibold text-white disabled:opacity-60">
              {busy ? "Đang gửi..." : "Gửi hồ sơ đăng ký"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
