"use client";

import { KeyRound } from "lucide-react";
import { buildTemporaryPassword } from "./shared";
import type { ChannelPageState } from "./use-channel-page-state";

export function SuspendUserModal(state: ChannelPageState) {
  const {
    isSaving,
    setSuspendReason,
    setSuspendUser,
    suspendReason,
    suspendUser,
    updateUserStatus,
  } = state;
  if (!suspendUser) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => setSuspendUser(null)}
      />
      <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
        <h2 className="text-lg font-semibold text-slate-950">
          Tạm khóa {suspendUser.profile?.displayName ?? suspendUser.email}?
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Có thể nhập lý do để bộ phận vận hành hiểu vì sao quyền truy cập
          bị tạm dừng.
        </p>
        <textarea
          className="mt-5 min-h-28 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none placeholder:text-slate-400"
          onChange={(event) => setSuspendReason(event.target.value)}
          placeholder="Lý do tạm khóa"
          value={suspendReason}
        />
        <div className="mt-5 flex justify-end gap-3">
          <button
            className="h-10 rounded-xl border border-slate-200 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
            onClick={() => setSuspendUser(null)}
            type="button"
          >
            Hủy
          </button>
          <button
            className="h-10 rounded-xl bg-rose-700 px-4 text-sm font-medium text-white hover:bg-rose-800 disabled:opacity-60"
            disabled={isSaving}
            onClick={() =>
              void updateUserStatus(
                suspendUser.id,
                "SUSPENDED",
                suspendReason.trim() || undefined,
              )
            }
            type="button"
          >
            {isSaving ? "Đang lưu..." : "Xác nhận tạm khóa"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function ResetPasswordModal(state: ChannelPageState) {
  const {
    copyTemporaryPassword,
    isSaving,
    newPassword,
    resetPasswordUser,
    resetUserPassword,
    setNewPassword,
    setResetPasswordUser,
  } = state;
  if (!resetPasswordUser) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => {
          setResetPasswordUser(null);
          setNewPassword("");
        }}
      />
      <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
        <h2 className="text-lg font-semibold text-slate-950">
          Đặt lại mật khẩu cho{" "}
          {resetPasswordUser.profile?.displayName ??
            resetPasswordUser.email}
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Đã tạo mật khẩu tạm dùng một lần. Có thể tạo lại rồi gửi qua kênh
          vận hành an toàn.
        </p>
        <input
          className="mt-5 h-11 w-full rounded-2xl border border-slate-200 px-4 font-mono text-sm outline-none placeholder:text-slate-400"
          onChange={(event) => setNewPassword(event.target.value)}
          placeholder="Mật khẩu tạm"
          type="text"
          value={newPassword}
        />
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            className="h-10 rounded-xl border border-slate-200 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
            onClick={() => setNewPassword(buildTemporaryPassword())}
            type="button"
          >
            Tạo lại
          </button>
          <button
            className="h-10 rounded-xl border border-slate-200 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
            onClick={() => void copyTemporaryPassword()}
            type="button"
          >
            Sao chép mật khẩu
          </button>
        </div>
        <div className="mt-5 flex justify-end gap-3">
          <button
            className="h-10 rounded-xl border border-slate-200 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
            onClick={() => {
              setResetPasswordUser(null);
              setNewPassword("");
            }}
            type="button"
          >
            Hủy
          </button>
          <button
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
            disabled={isSaving}
            onClick={() => void resetUserPassword(resetPasswordUser.id)}
            type="button"
          >
            <KeyRound size={16} />
            {isSaving ? "Đang lưu..." : "Đặt lại mật khẩu"}
          </button>
        </div>
      </div>
    </div>
  );
}
