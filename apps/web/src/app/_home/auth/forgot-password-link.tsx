"use client";

import { FormEvent, useEffect, useState } from "react";
import { apiBaseUrl } from "../lib/api";

// ---------------------------------------------------------------------------
// ForgotPasswordLink — inline modal for forgot password flow
// ---------------------------------------------------------------------------
export function ForgotPasswordLink() {
  const [open, setOpen] = useState(false);
  const [fpEmail, setFpEmail] = useState("");
  const [fpStatus, setFpStatus] = useState("");
  const [fpLoading, setFpLoading] = useState(false);

  function closeModal() {
    setOpen(false);
    setFpStatus("");
  }

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") closeModal();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFpLoading(true);
    setFpStatus("");
    try {
      const res = await fetch(`${apiBaseUrl}/v1/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: fpEmail }),
      });
      const data = (await res.json()) as { message?: string };
      setFpStatus(data.message ?? "Email đã được gửi nếu tài khoản tồn tại.");
    } catch {
      setFpStatus("Không thể gửi email. Vui lòng thử lại.");
    } finally {
      setFpLoading(false);
    }
  }

  return (
    <>
      <button
        className="text-sm text-teal-700 hover:underline"
        onClick={() => setOpen(true)}
        type="button"
      >
        Quên mật khẩu?
      </button>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={closeModal}
        >
          <div
            className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-semibold">Đặt lại mật khẩu</h3>
            <p className="mt-1 text-sm text-slate-500">
              Nhập email đăng ký để nhận link đặt lại mật khẩu.
            </p>
            <form
              className="mt-4 space-y-3"
              onSubmit={(e) => void handleSubmit(e)}
            >
              <label className="block">
                <span className="text-sm font-medium text-slate-700">
                  Email
                </span>
                <input
                  className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm"
                  onChange={(e) => setFpEmail(e.target.value)}
                  required
                  type="email"
                  value={fpEmail}
                />
              </label>
              <button
                className="h-10 w-full rounded-lg bg-teal-700 text-sm font-medium text-white disabled:opacity-60"
                disabled={fpLoading}
                type="submit"
              >
                {fpLoading ? "Đang gửi..." : "Gửi link đặt lại"}
              </button>
              {fpStatus && <p className="text-sm text-teal-700">{fpStatus}</p>}
            </form>
            <button
              className="mt-3 text-sm text-slate-500 hover:underline"
              onClick={closeModal}
              type="button"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </>
  );
}
