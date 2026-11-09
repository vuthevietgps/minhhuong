"use client";

import {
  CheckCircle2,
  GraduationCap,
  LogIn,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { FormEvent } from "react";
import { ForgotPasswordLink } from "./forgot-password-link";
import { SelfServiceSignupPanel } from "./self-service-signup-panel";

export function LoginScreen({
  email,
  isLoading,
  password,
  status,
  onEmailChange,
  onLogin,
  onPasswordChange,
}: {
  email: string;
  isLoading: boolean;
  password: string;
  status: string;
  onEmailChange: (value: string) => void;
  onLogin: (event: FormEvent<HTMLFormElement>) => void;
  onPasswordChange: (value: string) => void;
}) {
  return (
    <main className="kid-app-shell min-h-screen text-slate-950">
      <div className="mx-auto grid min-h-screen max-w-[1200px] gap-6 px-4 py-6 lg:grid-cols-[0.92fr_1.08fr] lg:px-8">
        <section className="kid-hero flex flex-col justify-between p-6 sm:p-8">
          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="kid-logo-mark grid size-12 place-items-center text-white">
                <GraduationCap size={23} />
              </div>
              <div>
                <p className="text-sm font-extrabold">Anh ngữ Minh Hương</p>
                <p className="text-xs text-slate-500">
                  Ứng dụng hỗ trợ học tập cho gia đình
                </p>
              </div>
            </div>

            <div className="mt-8">
              <span className="kid-eyebrow">
                <Sparkles size={14} /> Đặc biệt hỗ trợ học ngoại ngữ
              </span>
              <h1 className="mt-3 text-4xl font-extrabold leading-tight tracking-tight">
                Hỗ trợ trẻ học ngoại ngữ vui hơn mỗi ngày
              </h1>
              <p className="mt-4 max-w-md text-sm leading-6 text-slate-600">
                Anh ngữ Minh Hương là ứng dụng hỗ trợ học tập, tập trung đặc
                biệt vào ngoại ngữ và tiếng Anh cho trẻ. Video, bài luyện và
                trợ lý AI giúp trẻ khám phá, ôn tập và tiến bộ qua từng hoạt
                động nhỏ.
              </p>
              <p className="mt-4 flex max-w-md items-start gap-2 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-3 text-xs leading-5 text-emerald-950">
                <ShieldCheck className="mt-0.5 shrink-0" size={16} />
                Học liệu bên ngoài chỉ được dùng khi có căn cứ quyền phù hợp;
                link hoặc phụ đề công khai không mặc nhiên cho phép sao chép và
                tái sử dụng.
              </p>
            </div>

            <form className="mt-8 space-y-4" onSubmit={onLogin}>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">
                  Email
                </span>
                <input
                  className="mt-1 h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 text-sm outline-none focus:border-violet-500"
                  onChange={(event) => onEmailChange(event.target.value)}
                  type="email"
                  value={email}
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">
                  Mật khẩu
                </span>
                <input
                  className="mt-1 h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 text-sm outline-none focus:border-violet-500"
                  onChange={(event) => onPasswordChange(event.target.value)}
                  type="password"
                  value={password}
                />
              </label>
              <button
                className="kid-primary-button flex h-12 w-full items-center justify-center gap-2 px-4 text-sm disabled:opacity-60"
                disabled={isLoading}
                type="submit"
              >
                <LogIn size={18} />
                {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
              </button>
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">{status}</p>
                <ForgotPasswordLink />
              </div>
            </form>
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/80 bg-white/85 p-6 shadow-xl shadow-violet-100/50 backdrop-blur sm:p-8">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">
                Đăng ký học cùng Minh Hương
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Tạo tài khoản để bắt đầu trải nghiệm. Sau khi đăng nhập, hệ
                thống chỉ hiển thị không gian và dữ liệu được cấp quyền cho tài
                khoản của bạn.
              </p>
            </div>
            <ShieldCheck className="text-slate-500" size={22} />
          </div>

          <SelfServiceSignupPanel />

          <Link className="mt-4 inline-flex text-sm font-semibold text-teal-700 underline" href="/agency-register">
            Muốn bán hàng với tư cách đại lý? Gửi hồ sơ đăng ký
          </Link>

          <div className="mt-6 rounded-3xl bg-gradient-to-br from-sky-50 via-violet-50 to-amber-50 p-5">
            <p className="text-sm font-medium">Quyền riêng tư theo tài khoản</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {[
                "Đăng nhập an toàn",
                "Không gian làm việc theo quyền được cấp",
                "Dữ liệu học tập và hồ sơ được bảo vệ",
                "Quyền truy cập theo gói học",
              ].map((item) => (
                <div
                  className="flex items-center gap-2 text-sm text-slate-600"
                  key={item}
                >
                  <CheckCircle2 className="text-teal-600" size={17} />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
