"use client";

import { useCallback, useEffect, useState } from "react";
import { clearStoredSession, readStoredSession, storeSession } from "./session-storage";
import { LoginScreen } from "./_home/auth/login-screen";
import { RoleDashboard } from "./_home/dashboard/role-dashboard";
import { apiBaseUrl, readApiError } from "./_home/lib/api";
import type { DashboardPayload, Session } from "./_home/types";

export default function Home() {
  const [session, setSession] = useState<Session | null>(null);
  const [dashboard, setDashboard] = useState<DashboardPayload | null>(null);
  const [dashboardError, setDashboardError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("Đăng nhập để tiếp tục.");
  const [isLoading, setIsLoading] = useState(false);
  const [isRestoringSession, setIsRestoringSession] = useState(true);

  const loadDashboard = useCallback(async (authSession: Session) => {
    setDashboardError("");
    try {
      const response = await fetch(`${apiBaseUrl}/v1/me/dashboard`, {
        headers: { Authorization: `Bearer ${authSession.accessToken}` },
      });
      if (!response.ok) {
        throw new Error(await readApiError(response, "Không thể tải bảng tổng quan."));
      }
      setDashboard((await response.json()) as DashboardPayload);
    } catch (error) {
      setDashboard(null);
      setDashboardError(error instanceof Error ? error.message : "Không thể tải bảng tổng quan.");
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const storedSession = readStoredSession<Session>();
      if (!storedSession) {
        setIsRestoringSession(false);
        return;
      }

      setSession(storedSession);
      setEmail(storedSession.user.email);
      setStatus("Đang khôi phục phiên...");

      void loadDashboard(storedSession).finally(() => {
        setIsRestoringSession(false);
      });
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadDashboard]);

  async function login(nextEmail = email, nextPassword = password) {
    setIsLoading(true);
    setStatus("Đang đăng nhập...");

    try {
      const response = await fetch(`${apiBaseUrl}/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: nextEmail, password: nextPassword }),
      });

      if (!response.ok) {
        throw new Error(
          await readApiError(
            response,
            "Thông tin đăng nhập không đúng hoặc hệ thống chưa sẵn sàng.",
          ),
        );
      }

      const data = (await response.json()) as Session;
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      setSession(data);
      storeSession(data);
      setEmail(nextEmail);
      setPassword(nextPassword);
      setStatus("Đăng nhập thành công.");
      await loadDashboard(data);
    } catch (error) {
      setStatus(
        error instanceof Error ? error.message : "Không thể đăng nhập.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  function logout() {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    setSession(null);
    setDashboard(null);
    setDashboardError("");
    clearStoredSession();
    setStatus("Đã đăng xuất.");
  }

  if (isRestoringSession) {
    return (
      <main className="min-h-screen bg-[#f4f6f8] px-4 py-10 text-slate-950 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Đang khôi phục phiên trước...
          </p>
        </div>
      </main>
    );
  }

  if (!session) {
    return (
      <LoginScreen
        email={email}
        isLoading={isLoading}
        password={password}
        status={status}
        onEmailChange={setEmail}
        onPasswordChange={setPassword}
        onLogin={(event) => {
          event.preventDefault();
          void login();
        }}
      />
    );
  }

  if (!dashboard) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-50 p-6 text-slate-900">
        <div className="w-full max-w-lg rounded-2xl border border-amber-200 bg-white p-7 shadow-sm">
          <h1 className="text-xl font-bold">Chưa tải được bảng tổng quan</h1>
          <p className="mt-2 text-sm text-slate-600">{dashboardError || "Đang tải dữ liệu tài khoản..."}</p>
          <div className="mt-5 flex gap-3">
            <button className="rounded-xl bg-teal-700 px-4 py-2 font-semibold text-white" onClick={() => void loadDashboard(session)} type="button">Thử lại</button>
            <button className="rounded-xl border border-slate-300 px-4 py-2" onClick={logout} type="button">Đăng xuất</button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <RoleDashboard dashboard={dashboard} onLogout={logout} session={session} />
  );
}
