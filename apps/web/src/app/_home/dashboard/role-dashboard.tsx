"use client";

import {
  Bell,
  Bot,
  ChevronRight,
  Crown,
  Gamepad2,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  Video,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { adminLandingForRoles } from "../../admin/_lib/admin-session";
import { ChannelAdminPanel } from "../channel/admin-panel";
import { ChannelFinancePanel } from "../channel/finance-panel";
import { ChannelReportPanel } from "../channel/report-panel";
import { ContentStudio } from "../content/content-studio";
import { apiBaseUrl } from "../lib/api";
import { roleLabels } from "../lib/format";
import { ParentPortal } from "../parent/parent-portal";
import { ActivationOrdersPanel } from "../sales/activation-orders-panel";
import { MyCustomersPanel } from "../sales/my-customers-panel";
import { SalePersonalReportPanel } from "../sales/sale-report-panel";
import { StudentAppTimeGate } from "../student/app-time-gate";
import { StudentPracticePanel } from "../student/practice-panel";
import { StudentTodayPanel } from "../student/today-panel";
import { VideoImmersionPanel } from "../student/video-immersion-panel";
import type {
  ActiveLearningPlanContext,
  ActivePracticePlanContext,
  ActiveVideoPlanContext,
  DashboardPayload,
  ParentTab,
  PracticeDailyPlanRefresh,
  Session,
} from "../types";
import { AiOrOpsPanel } from "./ai-ops-panel";
import {
  dashboardRouteByRole,
  dashboardTargetByRole,
  dashboardTextVi,
  navByRole,
  parentTabByNavLabel,
  roleHomeCopy,
  roleWorkspaceCards,
} from "./roles";
import { AccessPanel, RoleWorkspaceHub } from "./workspace";

type LearningProfilePayload = {
  childProfile: {
    id: string;
    displayName: string;
    avatarUrl?: string | null;
  } | null;
};

export function RoleDashboard({
  dashboard,
  onLogout,
  session,
}: {
  dashboard: DashboardPayload;
  onLogout: () => void;
  session: Session;
}) {
  const router = useRouter();
  const role = dashboard.role;
  const navItems = navByRole[role];
  const displayName = dashboard.user.displayName ?? dashboard.user.email;
  const canOpenAdminWorkspace =
    role === "ADMIN" ||
    role === "DIRECTOR" ||
    role === "SALE" ||
    role === "OPERATIONS" ||
    role === "AGENCY_OWNER" ||
    role === "AGENCY_MANAGER";
  const adminWorkspaceHref = adminLandingForRoles([role]);
  const primaryWorkspaceHref = roleWorkspaceCards[role]?.[0]?.href;
  const hasAdvancedTools = [
    "CONTENT_EDITOR",
    "ADMIN",
    "DIRECTOR",
    "SALE",
    "AGENCY_OWNER",
    "AGENCY_MANAGER",
    "OPERATIONS",
  ].includes(role);
  const [activeNavLabel, setActiveNavLabel] = useState(navItems[0]?.[0] ?? "");
  const [parentRequestedTab, setParentRequestedTab] =
    useState<ParentTab>("children");
  const [learningProfile, setLearningProfile] =
    useState<LearningProfilePayload["childProfile"]>(null);
  const [dashboardSearch, setDashboardSearch] = useState("");
  const [dashboardNotice, setDashboardNotice] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const workspaceSearchRef = useRef<HTMLInputElement>(null);
  const dashboardNoticeTimerRef = useRef<number | null>(null);
  const [activeStudentLessonId, setActiveStudentLessonId] = useState("");
  const [requestedStudentLessonId, setRequestedStudentLessonId] = useState("");
  const [activeStudentVideoContext, setActiveStudentVideoContext] =
    useState<ActiveVideoPlanContext | null>(null);
  const [activeStudentPracticeContext, setActiveStudentPracticeContext] =
    useState<ActivePracticePlanContext | null>(null);
  const [studentWorkspaceView, setStudentWorkspaceView] = useState<
    "video" | "practice"
  >("video");
  const [studentExtrasOpen, setStudentExtrasOpen] = useState(false);
  const [staffSummaryView, setStaffSummaryView] = useState<
    "guidance" | "account"
  >("guidance");
  const [showAdvancedTools, setShowAdvancedTools] = useState(false);
  const [studentHomeRefreshToken, setStudentHomeRefreshToken] = useState(0);
  const learningChildProfileId = learningProfile?.id ?? "";

  const showDashboardNotice = useCallback((message: string) => {
    setDashboardNotice(message);
    if (dashboardNoticeTimerRef.current !== null) {
      window.clearTimeout(dashboardNoticeTimerRef.current);
    }
    dashboardNoticeTimerRef.current = window.setTimeout(
      () => setDashboardNotice(""),
      3600,
    );
  }, []);

  useEffect(() => {
    let cancelled = false;
    const cancelReset = () => {
      cancelled = true;
    };
    const resetScroll = () => {
      if (!cancelled) {
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      }
    };

    resetScroll();
    const settleTimers = [100, 700, 1500].map((delay) =>
      window.setTimeout(resetScroll, delay),
    );
    window.addEventListener("keydown", cancelReset);
    window.addEventListener("pointerdown", cancelReset);
    window.addEventListener("touchstart", cancelReset, { passive: true });
    window.addEventListener("wheel", cancelReset, { passive: true });

    return () => {
      settleTimers.forEach((timer) => window.clearTimeout(timer));
      window.removeEventListener("keydown", cancelReset);
      window.removeEventListener("pointerdown", cancelReset);
      window.removeEventListener("touchstart", cancelReset);
      window.removeEventListener("wheel", cancelReset);
    };
  }, [role]);

  useEffect(() => {
    return () => {
      if (dashboardNoticeTimerRef.current !== null) {
        window.clearTimeout(dashboardNoticeTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (role !== "STUDENT") {
      return;
    }

    let cancelled = false;
    void (async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/v1/me/learning-profile`, {
          headers: { Authorization: `Bearer ${session.accessToken}` },
        });
        if (!response.ok) {
          throw new Error("Không thể tải hồ sơ học sinh.");
        }
        const payload = (await response.json()) as LearningProfilePayload;
        if (!cancelled) {
          setLearningProfile(payload.childProfile);
          if (!payload.childProfile) {
            showDashboardNotice(
              "Tài khoản chưa có hồ sơ học sinh để mở bài học.",
            );
          }
        }
      } catch (error) {
        if (!cancelled) {
          setLearningProfile(null);
          showDashboardNotice(
            error instanceof Error
              ? error.message
              : "Không thể tải hồ sơ học sinh.",
          );
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [role, session.accessToken, showDashboardNotice]);

  const scrollToDashboardTarget = useCallback(
    (targetId: string, label: string) => {
      const target = document.getElementById(targetId);
      if (!target) {
        showDashboardNotice(`Chưa tìm thấy khu vực ${label}.`);
        return;
      }
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      showDashboardNotice(`Đã mở khu vực ${label}.`);
    },
    [showDashboardNotice],
  );

  const handleDashboardNav = useCallback(
    (label: string) => {
      setActiveNavLabel(label);

      if (
        role === "STUDENT" &&
        (label === "Bài học" || label === "Luyện tập")
      ) {
        const view = label === "Bài học" ? "video" : "practice";
        setStudentWorkspaceView(view);
        window.setTimeout(
          () =>
            scrollToDashboardTarget(
              view === "video"
                ? "student-video-panel"
                : "student-practice-panel",
              label,
            ),
          0,
        );
        return;
      }

      if (role === "STUDENT" && label === "Bạn học") {
        setStudentExtrasOpen(true);
        window.setTimeout(
          () => scrollToDashboardTarget("dashboard-ai-panel", label),
          0,
        );
        return;
      }

      if (role !== "STUDENT" && role !== "PARENT" && label === "Quy trình") {
        setStaffSummaryView("guidance");
        window.setTimeout(
          () => scrollToDashboardTarget("dashboard-ai-panel", label),
          0,
        );
        return;
      }

      if (role !== "STUDENT" && role !== "PARENT" && label === "Tài khoản") {
        setStaffSummaryView("account");
        window.setTimeout(
          () => scrollToDashboardTarget("dashboard-access-panel", label),
          0,
        );
        return;
      }

      const href = dashboardRouteByRole[role]?.[label];
      if (href) {
        router.push(href);
        return;
      }

      if (role === "PARENT") {
        const requestedTab = parentTabByNavLabel[label];
        if (requestedTab) {
          setParentRequestedTab(requestedTab);
          window.setTimeout(
            () => scrollToDashboardTarget("parent-portal-panel", label),
            0,
          );
          return;
        }
      }

      const targetId = dashboardTargetByRole[role]?.[label];
      if (targetId) {
        scrollToDashboardTarget(targetId, label);
        return;
      }

      showDashboardNotice(`Khu vực ${label} chưa được cấp cho tài khoản này.`);
    },
    [role, router, scrollToDashboardTarget, showDashboardNotice],
  );

  const handleWorkspaceSearch = useCallback(() => {
    const query = dashboardSearch.trim().toLocaleLowerCase("vi");
    if (!query) {
      workspaceSearchRef.current?.focus();
      showDashboardNotice("Nhập nội dung bạn muốn tìm.");
      return;
    }

    const targetIds = [
      "student-today-panel",
      "student-video-panel",
      "student-practice-panel",
      "parent-portal-panel",
      "dashboard-workspace-hub",
      "dashboard-primary-workspace",
      "dashboard-priority-actions",
      "dashboard-secondary-panel",
      "dashboard-ai-panel",
      "dashboard-access-panel",
    ];
    const target = targetIds
      .map((id) => document.getElementById(id))
      .find((item) =>
        item?.textContent?.toLocaleLowerCase("vi").includes(query),
      );

    if (!target) {
      showDashboardNotice(`Không tìm thấy “${dashboardSearch.trim()}”.`);
      return;
    }

    target.scrollIntoView({ behavior: "smooth", block: "start" });
    showDashboardNotice(`Đã tìm thấy “${dashboardSearch.trim()}”.`);
  }, [dashboardSearch, showDashboardNotice]);

  const handlePriorityAction = useCallback(
    (action: string) => {
      if (role === "TEACHER") {
        router.push("/teacher/content");
        return;
      }
      if (role === "CONTENT_EDITOR") {
        router.push("/admin/content");
        return;
      }
      if (canOpenAdminWorkspace) {
        router.push(adminWorkspaceHref);
        return;
      }
      scrollToDashboardTarget("dashboard-primary-workspace", action);
    },
    [
      adminWorkspaceHref,
      canOpenAdminWorkspace,
      role,
      router,
      scrollToDashboardTarget,
    ],
  );
  const handleStudentResume = useCallback(
    (
      lessonId: string,
      target: "video" | "practice" = "video",
      context?: ActiveLearningPlanContext,
    ) => {
      setRequestedStudentLessonId(lessonId);
      setActiveStudentLessonId(lessonId);
      setStudentWorkspaceView(target);
      setActiveStudentVideoContext(context?.kind === "VIDEO" ? context : null);
      setActiveStudentPracticeContext(
        context?.kind === "PRACTICE" ? context : null,
      );
      window.setTimeout(() => {
        document
          .getElementById(
            target === "practice"
              ? "student-practice-panel"
              : "student-video-panel",
          )
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 0);
    },
    [],
  );
  const handleStudentPracticeDailyPlanRefresh = useCallback(
    (refresh: PracticeDailyPlanRefresh) => {
      setActiveStudentPracticeContext(refresh.context);
      setStudentHomeRefreshToken((current) => current + 1);
    },
    [],
  );
  return (
    <main className="kid-app-shell min-h-screen text-slate-950">
      {role === "STUDENT" && (
        <StudentAppTimeGate
          accessToken={session.accessToken}
          childProfileId={learningChildProfileId}
        />
      )}
      <div className="mx-auto flex min-h-screen max-w-[1440px] flex-col lg:flex-row">
        <aside className="kid-sidebar border-b border-violet-100 bg-white/90 px-4 py-3 lg:sticky lg:top-0 lg:h-screen lg:w-72 lg:shrink-0 lg:border-b-0 lg:border-r lg:px-5 lg:py-6">
          <div className="flex items-center justify-between lg:block">
            <div className="flex items-center gap-3">
              <div className="kid-logo-mark grid size-11 place-items-center text-white">
                <GraduationCap size={22} />
              </div>
              <div>
                <p className="text-sm font-extrabold">Anh ngữ Minh Hương</p>
                <p className="text-xs text-slate-500">{roleLabels[role]}</p>
              </div>
            </div>
            <button
              aria-label="Tìm trong không gian"
              className="grid size-11 place-items-center rounded-lg border border-slate-200 text-slate-600 lg:hidden"
              onClick={() => workspaceSearchRef.current?.focus()}
              type="button"
            >
              <Search size={18} />
            </button>
          </div>

          <nav
            aria-label="Điều hướng chính"
            className="mt-5 hidden gap-2 lg:flex lg:flex-col"
          >
            {navItems.map(([label, Icon]) => {
              const href = dashboardRouteByRole[role]?.[label];
              const className = `flex h-11 w-full shrink-0 items-center gap-3 whitespace-nowrap rounded-2xl px-3 text-sm font-bold ${
                activeNavLabel === label ? "kid-nav-active" : "kid-nav-link"
              }`;
              return href ? (
                <Link
                  className={className}
                  href={href}
                  key={label}
                  onClick={() => setActiveNavLabel(label)}
                >
                  <Icon size={18} />
                  {label}
                </Link>
              ) : (
                <button
                  className={className}
                  key={label}
                  onClick={() => handleDashboardNav(label)}
                  type="button"
                >
                  <Icon size={18} />
                  {label}
                </button>
              );
            })}
          </nav>

          <div className="mt-6 hidden rounded-lg border border-amber-200 bg-amber-50 p-4 lg:block">
            <div className="flex items-center gap-2 text-sm font-semibold text-amber-950">
              <Crown size={17} />
              {role === "STUDENT"
                ? "Hồ sơ học tập"
                : role === "PARENT"
                  ? "Quyền học cho gia đình"
                  : "Quyền truy cập công việc"}
            </div>
            <p className="mt-2 text-xs leading-5 text-amber-900">
              {role === "STUDENT"
                ? "Tiếp tục bài học và phần luyện tập được cấp cho hồ sơ này."
                : role === "PARENT"
                  ? "Dùng tài khoản này để theo dõi tiến độ của con, kế hoạch học, báo cáo và thanh toán."
                  : "Tài khoản này mở các công cụ đã được cấp cho phạm vi công việc của bạn."}
            </p>
          </div>
        </aside>

        <section className="kid-page flex-1 px-4 py-4 pb-36 sm:px-6 sm:pb-32 lg:px-8 lg:py-6">
          <header
            className="kid-hero flex scroll-mt-4 flex-col gap-5 p-5 sm:p-6 xl:flex-row xl:items-center xl:justify-between"
            id="dashboard-overview"
          >
            <div className="relative z-10">
              <span className="kid-eyebrow">
                <Sparkles size={14} />
                {role === "STUDENT"
                  ? "Hành trình hôm nay"
                  : "Không gian hôm nay"}
              </span>
              <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
                {role === "STUDENT"
                  ? `Góc học tập của ${displayName}`
                  : dashboardTextVi(dashboard.title)}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                {role === "STUDENT"
                  ? roleHomeCopy[role]
                  : `Xin chào ${displayName}. ${roleHomeCopy[role]}`}
              </p>
            </div>
            <div className="relative z-10 flex w-full flex-wrap items-center gap-2 xl:w-auto xl:justify-end">
              <form
                className="flex h-11 w-full min-w-0 basis-full items-center rounded-lg border border-slate-200 bg-white pl-3 text-sm text-slate-500 sm:w-auto sm:basis-auto"
                onSubmit={(event) => {
                  event.preventDefault();
                  handleWorkspaceSearch();
                }}
              >
                <input
                  aria-label="Tìm trong không gian làm việc"
                  className="h-full min-w-0 flex-1 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400 sm:w-48"
                  onChange={(event) => setDashboardSearch(event.target.value)}
                  placeholder="Tìm trong không gian"
                  ref={workspaceSearchRef}
                  type="search"
                  value={dashboardSearch}
                />
                <button
                  aria-label="Tìm kiếm"
                  className="grid size-11 shrink-0 place-items-center rounded-lg text-violet-700 hover:bg-violet-50"
                  type="submit"
                >
                  <Search size={16} />
                </button>
              </form>
              {primaryWorkspaceHref && (
                <Link
                  className="kid-primary-button flex h-11 flex-1 items-center justify-center gap-2 px-4 text-sm sm:flex-none"
                  href={primaryWorkspaceHref}
                >
                  <LayoutDashboard size={18} />
                  Mở không gian làm việc
                </Link>
              )}
              <div className="relative">
                <button
                  aria-expanded={notificationsOpen}
                  aria-label="Thông báo"
                  className="grid size-11 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600"
                  onClick={() => setNotificationsOpen((current) => !current)}
                  type="button"
                >
                  <Bell size={18} />
                </button>
                {notificationsOpen && (
                  <div className="absolute right-0 top-12 z-30 w-64 rounded-2xl border border-violet-100 bg-white p-4 text-sm shadow-xl">
                    <p className="font-extrabold text-slate-800">Thông báo</p>
                    <p className="mt-1 leading-5 text-slate-500">
                      Bạn chưa có thông báo mới.
                    </p>
                  </div>
                )}
              </div>
              {role === "PARENT" && (
                <Link className="flex h-11 items-center gap-2 rounded-lg bg-emerald-700 px-3 text-sm font-bold text-white" href="/browser-control">
                  Thiết lập máy học của con
                </Link>
              )}
              {[
                "TEACHER",
                "CONTENT_EDITOR",
                "ADMIN",
                "SUPPORT",
              ].includes(role) && (
                <Link
                  className="flex h-11 items-center gap-2 rounded-lg bg-violet-700 px-3 text-sm font-bold text-white"
                  href="/ai-contexts"
                >
                  <Bot size={18} />
                  Kho ngữ cảnh AI
                </Link>
              )}
              <button
                className="flex h-11 items-center gap-2 rounded-lg bg-white px-3 text-sm font-bold text-slate-700 ring-1 ring-slate-200"
                onClick={onLogout}
                type="button"
              >
                <LogOut size={18} />
                Đăng xuất
              </button>
            </div>
          </header>

          {role !== "STUDENT" && (
            <div className="mt-5 grid grid-cols-2 gap-3 md:gap-4 xl:grid-cols-4">
              {dashboard.metrics.map((metric) => (
                <section
                  className="kid-stat-card p-4 sm:p-5"
                  key={metric.label}
                >
                  <p className="text-xs text-slate-500">
                    {dashboardTextVi(metric.label)}
                  </p>
                  <p className="mt-2 text-xl font-extrabold sm:text-2xl">
                    {dashboardTextVi(metric.value)}
                  </p>
                  <p className="mt-2 text-xs text-teal-700">
                    {dashboardTextVi(metric.delta)}
                  </p>
                </section>
              ))}
            </div>
          )}

          {role === "STUDENT" && (
            <>
              <StudentTodayPanel
                childDisplayName={learningProfile?.displayName}
                childProfileId={learningChildProfileId}
                onResume={handleStudentResume}
                refreshToken={studentHomeRefreshToken}
                session={session}
              />
              <section className="mt-4 rounded-2xl border border-violet-100 bg-white p-2 shadow-sm">
                <div
                  aria-label="Chọn hoạt động học tập"
                  className="grid grid-cols-2 gap-2"
                  role="tablist"
                >
                  <button
                    aria-controls="student-video-panel"
                    aria-selected={studentWorkspaceView === "video"}
                    className={`kid-learning-tab ${
                      studentWorkspaceView === "video"
                        ? "kid-learning-tab-active"
                        : ""
                    }`}
                    onClick={() => {
                      setStudentWorkspaceView("video");
                      setActiveNavLabel("Bài học");
                    }}
                    role="tab"
                    type="button"
                  >
                    <Video size={18} />
                    Học qua video
                  </button>
                  <button
                    aria-controls="student-practice-panel"
                    aria-selected={studentWorkspaceView === "practice"}
                    className={`kid-learning-tab ${
                      studentWorkspaceView === "practice"
                        ? "kid-learning-tab-active"
                        : ""
                    }`}
                    onClick={() => {
                      setStudentWorkspaceView("practice");
                      setActiveNavLabel("Luyện tập");
                    }}
                    role="tab"
                    type="button"
                  >
                    <Gamepad2 size={18} />
                    Luyện tập
                  </button>
                </div>
              </section>
              <div hidden={studentWorkspaceView !== "video"}>
                <VideoImmersionPanel
                  childProfileId={learningChildProfileId}
                  onLessonChange={setActiveStudentLessonId}
                  planContext={activeStudentVideoContext}
                  requestedLessonId={requestedStudentLessonId}
                  session={session}
                />
              </div>
              <div hidden={studentWorkspaceView !== "practice"}>
                <StudentPracticePanel
                  childProfileId={learningChildProfileId}
                  lessonId={activeStudentLessonId}
                  onDailyPlanRefresh={handleStudentPracticeDailyPlanRefresh}
                  planContext={activeStudentPracticeContext}
                  session={session}
                />
              </div>
            </>
          )}

          {role === "PARENT" && (
            <ParentPortal
              activeTab={parentRequestedTab}
              onLogout={onLogout}
              onTabChange={setParentRequestedTab}
              session={session}
            />
          )}

          {role !== "STUDENT" && role !== "PARENT" && (
            <RoleWorkspaceHub role={role} />
          )}

          {hasAdvancedTools && (
            <section className="mt-4 flex flex-col gap-4 rounded-2xl border border-violet-100 bg-violet-50/70 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-extrabold text-violet-950">
                  Chế độ thao tác nhanh
                </p>
                <p className="mt-1 text-sm leading-6 text-violet-800">
                  Chỉ mở các biểu mẫu và bảng chi tiết khi bạn thực sự cần xử lý
                  ngay trên trang này.
                </p>
              </div>
              <button
                aria-expanded={showAdvancedTools}
                className="min-h-11 shrink-0 rounded-xl border border-violet-200 bg-white px-4 text-sm font-extrabold text-violet-800 shadow-sm"
                onClick={() => setShowAdvancedTools((current) => !current)}
                type="button"
              >
                {showAdvancedTools
                  ? "Ẩn công cụ chi tiết"
                  : "Mở công cụ chi tiết"}
              </button>
            </section>
          )}

          {showAdvancedTools && (
            <div className="mt-4" id="dashboard-advanced-tools">
              {(role === "ADMIN" ||
                role === "CONTENT_EDITOR" ||
                role === "DIRECTOR") && (
                <ContentStudio role={role} session={session} />
              )}

              {(role === "SALE" ||
                role === "AGENCY_OWNER" ||
                role === "AGENCY_MANAGER" ||
                role === "OPERATIONS" ||
                role === "ADMIN" ||
                role === "DIRECTOR") && (
                <ActivationOrdersPanel role={role} session={session} />
              )}

              {role === "SALE" && (
                <>
                  <MyCustomersPanel session={session} />
                  <SalePersonalReportPanel session={session} />
                </>
              )}

              {(role === "SALE" ||
                role === "AGENCY_OWNER" ||
                role === "AGENCY_MANAGER" ||
                role === "OPERATIONS" ||
                role === "ADMIN" ||
                role === "DIRECTOR") && (
                <ChannelFinancePanel role={role} session={session} />
              )}

              {(role === "OPERATIONS" ||
                role === "ADMIN" ||
                role === "DIRECTOR" ||
                role === "AGENCY_OWNER" ||
                role === "AGENCY_MANAGER") && (
                <ChannelReportPanel session={session} />
              )}

              {(role === "ADMIN" ||
                role === "OPERATIONS" ||
                role === "DIRECTOR" ||
                role === "AGENCY_OWNER" ||
                role === "AGENCY_MANAGER") && (
                <ChannelAdminPanel role={role} session={session} />
              )}
            </div>
          )}

          {dashboard.actions.length > 0 && (
            <div className="mt-4">
              <section
                className="scroll-mt-4 rounded-lg border border-slate-200 bg-white p-4 sm:p-5"
                id="dashboard-priority-actions"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Việc cần ưu tiên</h2>
                  <ChevronRight className="text-slate-400" size={18} />
                </div>
                <div className="mt-4 divide-y divide-slate-200">
                  {dashboard.actions.map((action) => (
                    <button
                      className="flex min-h-14 w-full items-center justify-between py-3 text-left"
                      key={action}
                      onClick={() => handlePriorityAction(action)}
                      type="button"
                    >
                      <span>
                        <span className="block text-sm font-medium">
                          {dashboardTextVi(action)}
                        </span>
                      </span>
                      <ChevronRight className="text-slate-400" size={18} />
                    </button>
                  ))}
                </div>
              </section>
            </div>
          )}

          {role !== "STUDENT" && role !== "PARENT" && (
            <div
              aria-label="Thông tin hỗ trợ công việc"
              className="mt-4 grid grid-cols-2 gap-2 rounded-2xl border border-violet-100 bg-white p-2 lg:hidden"
              role="tablist"
            >
              {(
                [
                  ["guidance", "Lưu ý", ShieldCheck],
                  ["account", "Tài khoản", Users],
                ] as const
              ).map(([view, label, Icon]) => (
                <button
                  aria-selected={staffSummaryView === view}
                  className={`kid-summary-tab ${
                    staffSummaryView === view ? "kid-summary-tab-active" : ""
                  }`}
                  key={view}
                  onClick={() => setStaffSummaryView(view)}
                  role="tab"
                  type="button"
                >
                  <Icon aria-hidden="true" size={17} />
                  {label}
                </button>
              ))}
            </div>
          )}

          {role === "STUDENT" && (
            <section className="mt-4 rounded-xl border border-slate-200 bg-white p-3 sm:p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Khám phá thêm
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Lộ trình, trợ lý AI và thông tin tài khoản.
                  </p>
                </div>
                <button
                  aria-expanded={studentExtrasOpen}
                  className="h-9 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  onClick={() => setStudentExtrasOpen((current) => !current)}
                  type="button"
                >
                  {studentExtrasOpen ? "Thu gọn" : "Mở thêm"}
                </button>
              </div>
            </section>
          )}

          <div
            className={`mt-4 grid gap-4 lg:grid-cols-2 ${
              role === "STUDENT" && !studentExtrasOpen ? "hidden" : ""
            }`}
          >
            <div
              className={
                role !== "STUDENT" &&
                role !== "PARENT" &&
                staffSummaryView !== "guidance"
                  ? "hidden lg:block"
                  : ""
              }
            >
              <AiOrOpsPanel
                childProfileId={learningChildProfileId}
                onOpenProtected={() => {
                  if (primaryWorkspaceHref?.startsWith("/")) {
                    router.push(primaryWorkspaceHref);
                    return;
                  }
                  if (canOpenAdminWorkspace) {
                    router.push(adminWorkspaceHref);
                    return;
                  }
                  if (role === "TEACHER") {
                    router.push("/teacher");
                    return;
                  }
                  scrollToDashboardTarget(
                    "dashboard-access-panel",
                    "quyền truy cập",
                  );
                }}
                role={role}
                session={session}
              />
            </div>
            <div
              className={
                role !== "STUDENT" &&
                role !== "PARENT" &&
                staffSummaryView !== "account"
                  ? "hidden lg:block"
                  : ""
              }
            >
              <AccessPanel dashboard={dashboard} />
            </div>
          </div>

          <nav
            aria-label="Điều hướng nhanh"
            className="kid-mobile-nav lg:hidden"
          >
            {navItems.map(([label, Icon]) => {
              const href = dashboardRouteByRole[role]?.[label];
              const className = `kid-mobile-nav-item ${
                activeNavLabel === label ? "kid-mobile-nav-item-active" : ""
              }`;
              return href ? (
                <Link
                  aria-current={activeNavLabel === label ? "page" : undefined}
                  className={className}
                  href={href}
                  key={`mobile-${label}`}
                  onClick={() => setActiveNavLabel(label)}
                >
                  <Icon aria-hidden="true" size={19} />
                  <span>{label}</span>
                </Link>
              ) : (
                <button
                  aria-current={activeNavLabel === label ? "page" : undefined}
                  className={className}
                  key={`mobile-${label}`}
                  onClick={() => handleDashboardNav(label)}
                  type="button"
                >
                  <Icon aria-hidden="true" size={19} />
                  <span>{label}</span>
                </button>
              );
            })}
          </nav>

          {dashboardNotice && (
            <div
              aria-live="polite"
              className="fixed bottom-24 right-4 z-50 max-w-sm rounded-2xl bg-slate-900 px-4 py-3 text-sm font-bold text-white shadow-xl lg:bottom-5 lg:right-5"
              role="status"
            >
              {dashboardNotice}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
