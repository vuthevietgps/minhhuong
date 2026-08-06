"use client";

import {
  BookOpen,
  ChevronRight,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  PenLine,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { readStoredSession } from "../session-storage";

type StoredSession = {
  accessToken: string;
  user: {
    id: string;
    email: string;
    displayName?: string;
    roles: string[];
  };
};

function useTeacherSession() {
  const [session, setSession] = useState<StoredSession | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => {
      setSession(readStoredSession<StoredSession>());
      setLoaded(true);
    }, 0);
    return () => window.clearTimeout(t);
  }, []);

  return { session, loaded, roles: session?.user.roles ?? [] };
}

const navItems = [
  { href: "/teacher", label: "Tổng quan", icon: LayoutDashboard, exact: true },
  { href: "/teacher/content", label: "Bài học của tôi", icon: BookOpen },
] as const;

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { session, loaded } = useTeacherSession();

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <div className="kid-app-shell min-h-screen flex flex-col lg:flex-row">
      {/* Sidebar */}
      <aside className="kid-sidebar flex w-full flex-col border-b border-slate-200 bg-white lg:sticky lg:top-0 lg:h-screen lg:w-72 lg:border-r lg:border-b-0">
        {/* Logo */}
        <div className="border-b border-slate-200 px-4 py-4 lg:px-5 lg:py-5">
          <div className="flex items-center gap-3">
            <div className="kid-logo-mark grid size-11 place-items-center bg-indigo-600 text-white">
              <GraduationCap size={20} />
            </div>
            <div>
              <p className="text-base font-extrabold text-slate-900">
                Minh Hương
              </p>
              <p className="text-xs font-semibold text-violet-500">
                Cổng giáo viên
              </p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-x-auto px-3 py-3 lg:space-y-6 lg:overflow-y-auto lg:px-4 lg:py-5">
          <div>
            <p className="mb-2 hidden px-2 text-[11px] font-extrabold uppercase tracking-wider text-slate-400 lg:block">
              Không gian làm việc
            </p>
            <div className="flex gap-2 lg:block lg:space-y-2">
              {navItems.map(({ href, label, icon: Icon, ...rest }) => (
                <Link
                  key={href}
                  href={href}
                  className={`flex shrink-0 items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-bold ${
                    isActive(
                      href,
                      "exact" in rest
                        ? (rest as { exact?: boolean }).exact
                        : undefined,
                    )
                      ? "kid-nav-active"
                      : "kid-nav-link text-slate-600"
                  }`}
                >
                  <Icon size={17} />
                  {label}
                </Link>
              ))}
            </div>
          </div>

          <div className="hidden lg:block">
            <p className="mb-2 px-2 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
              Truy cập nhanh
            </p>
            <Link
              href="/"
              className="kid-nav-link flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-600"
            >
              <PenLine size={16} />
              Giao diện học sinh
              <ChevronRight size={14} className="ml-auto text-slate-400" />
            </Link>
          </div>
        </nav>

        {/* Footer */}
        <div className="hidden border-t border-slate-200 px-4 py-4 lg:block">
          <div className="mb-3 rounded-2xl border border-violet-100 bg-violet-50 px-3.5 py-3 text-xs font-medium leading-5 text-slate-500">
            {loaded && session
              ? `Đã đăng nhập với tên ${session.user.displayName ?? session.user.email}`
              : "Cổng giáo viên — tạo bài học và gửi duyệt."}
          </div>
          <Link
            href="/"
            className="kid-nav-link flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-500"
          >
            <LogOut size={16} />
            Quay lại ứng dụng
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
