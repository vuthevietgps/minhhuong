"use client";

import { FormEvent, useMemo, useState } from "react";
import { apiBaseUrl, readApiError } from "../lib/api";
import type { Session } from "../types";

// ---------------------------------------------------------------------------
// ParentProfilePanel — update display name, change password
// ---------------------------------------------------------------------------
export function ParentProfilePanel({
  onLogout,
  session,
}: {
  onLogout: () => void;
  session: Session;
}) {
  const [displayName, setDisplayName] = useState(
    session.user.displayName ?? "",
  );
  const [profileStatus, setProfileStatus] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwStatus, setPwStatus] = useState("");
  const [pwLoading, setPwLoading] = useState(false);

  const authHeaders = useMemo(
    () => ({
      Authorization: `Bearer ${session.accessToken}`,
      "Content-Type": "application/json",
    }),
    [session.accessToken],
  );

  async function handleProfileSave(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setProfileLoading(true);
    setProfileStatus("");
    try {
      const res = await fetch(`${apiBaseUrl}/v1/me/profile`, {
        method: "PATCH",
        headers: authHeaders,
        body: JSON.stringify({ displayName }),
      });
      if (!res.ok)
        throw new Error(await readApiError(res, "Không thể cập nhật hồ sơ."));
      setProfileStatus("Đã lưu thay đổi.");
    } catch (err) {
      setProfileStatus(err instanceof Error ? err.message : "Lỗi lưu hồ sơ.");
    } finally {
      setProfileLoading(false);
    }
  }

  async function handleChangePassword(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPwStatus("Mật khẩu mới không khớp.");
      return;
    }
    setPwLoading(true);
    setPwStatus("");
    try {
      const res = await fetch(`${apiBaseUrl}/v1/me/change-password`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (!res.ok)
        throw new Error(await readApiError(res, "Không thể đổi mật khẩu."));
      setPwStatus("Đổi mật khẩu thành công! Đang đăng xuất...");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      window.setTimeout(() => {
        onLogout();
      }, 1500);
    } catch (err) {
      setPwStatus(err instanceof Error ? err.message : "Lỗi đổi mật khẩu.");
    } finally {
      setPwLoading(false);
    }
  }

  return (
    <section className="space-y-5">
      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <h3 className="text-sm font-semibold">Thông tin cá nhân</h3>
        <form
          className="mt-4 space-y-3"
          onSubmit={(e) => void handleProfileSave(e)}
        >
          <label className="block">
            <span className="text-xs font-medium text-slate-700">
              Tên hiển thị
            </span>
            <input
              className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm"
              onChange={(e) => setDisplayName(e.target.value)}
              type="text"
              value={displayName}
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-slate-700">Email</span>
            <input
              className="mt-1 h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-500"
              disabled
              type="email"
              value={session.user.email}
            />
          </label>
          <button
            className="h-10 rounded-lg bg-teal-700 px-4 text-sm font-medium text-white disabled:opacity-60"
            disabled={profileLoading}
            type="submit"
          >
            {profileLoading ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
          {profileStatus && (
            <p className="text-sm text-teal-700">{profileStatus}</p>
          )}
        </form>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <h3 className="text-sm font-semibold">Đổi mật khẩu</h3>
        <form
          className="mt-4 space-y-3"
          onSubmit={(e) => void handleChangePassword(e)}
        >
          <label className="block">
            <span className="text-xs font-medium text-slate-700">
              Mật khẩu hiện tại
            </span>
            <input
              autoComplete="current-password"
              className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm"
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              type="password"
              value={currentPassword}
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-slate-700">
              Mật khẩu mới
            </span>
            <input
              autoComplete="new-password"
              className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm"
              onChange={(e) => setNewPassword(e.target.value)}
              required
              type="password"
              value={newPassword}
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-slate-700">
              Xác nhận mật khẩu mới
            </span>
            <input
              autoComplete="new-password"
              className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm"
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              type="password"
              value={confirmPassword}
            />
          </label>
          <button
            className="h-10 rounded-lg bg-teal-700 px-4 text-sm font-medium text-white disabled:opacity-60"
            disabled={pwLoading}
            type="submit"
          >
            {pwLoading ? "Đang đổi..." : "Đổi mật khẩu"}
          </button>
          {pwStatus && (
            <p
              className={`text-sm ${pwStatus.includes("thành công") ? "text-teal-700" : "text-red-600"}`}
            >
              {pwStatus}
            </p>
          )}
        </form>
      </div>
    </section>
  );
}
