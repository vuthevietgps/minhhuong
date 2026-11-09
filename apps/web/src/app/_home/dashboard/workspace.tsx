"use client";

import { ChevronRight, ShieldCheck, Users } from "lucide-react";
import Link from "next/link";
import { roleLabels } from "../lib/format";
import type { DashboardPayload, Role } from "../types";
import { roleWorkspaceCards } from "./roles";

export function RoleWorkspaceHub({ role }: { role: Role }) {
  const cards = (roleWorkspaceCards[role] ?? []).filter((card) =>
    card.href.startsWith("/"),
  );
  if (cards.length === 0) return null;

  return (
    <section
      className="mt-4 scroll-mt-4 rounded-2xl border border-violet-100 bg-white p-4 sm:p-5"
      id="dashboard-workspace-hub"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-teal-700">
            Lối tắt theo vai trò
          </p>
          <h2 className="mt-1 text-xl font-extrabold text-slate-900">
            Chọn đúng nơi để hoàn thành công việc
          </h2>
        </div>
        <p className="max-w-md text-sm leading-6 text-slate-500">
          Dashboard chỉ giữ thông tin cần quyết định; biểu mẫu chi tiết nằm
          trong workspace chuyên trách.
        </p>
      </div>

      <div className="kid-workspace-grid mt-4 grid gap-3 md:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              aria-label={`${card.label}: ${card.description}`}
              className="kid-workspace-card group flex min-h-48 flex-col rounded-2xl border border-slate-200 bg-white p-4"
              href={card.href}
              key={`${role}-${card.label}`}
            >
              <div className="flex items-start justify-between gap-3">
                <span className="grid size-11 place-items-center rounded-xl bg-violet-50 text-violet-700">
                  <Icon size={20} />
                </span>
                <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-800">
                  {card.meta}
                </span>
              </div>
              <h3 className="mt-5 text-lg font-extrabold text-slate-900">
                {card.label}
              </h3>
              <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">
                {card.description}
              </p>
              <span className="mt-4 flex items-center gap-2 text-sm font-extrabold text-violet-700">
                Mở workspace
                <ChevronRight
                  aria-hidden="true"
                  className="transition-transform group-hover:translate-x-1"
                  size={18}
                />
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export function AccessPanel({ dashboard }: { dashboard: DashboardPayload }) {
  return (
    <section
      className="scroll-mt-4 rounded-lg border border-slate-200 bg-white p-4"
      id="dashboard-access-panel"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Tóm tắt tài khoản</h2>
        <ShieldCheck className="text-slate-500" size={18} />
      </div>
      <div className="mt-4 grid grid-cols-2 border-y border-slate-200">
        {[
          ["Loại tài khoản", roleLabels[dashboard.role]],
          [
            "Trạng thái",
            dashboard.user.status === "ACTIVE"
              ? "Đang hoạt động"
              : (dashboard.user.status ?? "Chưa rõ"),
          ],
          [
            dashboard.role === "STUDENT" || dashboard.role === "PARENT"
              ? "Quyền học tập"
              : "Phạm vi truy cập",
            dashboard.role === "PARENT"
              ? "Góc nhìn gia đình"
              : "Theo vai trò được cấp",
          ],
          ["Email", dashboard.user.email],
        ].map(([label, value], index) => (
          <div
            className={`p-3 ${index % 2 === 1 ? "border-l border-slate-200" : ""} ${
              index < 2 ? "border-b border-slate-200" : ""
            }`}
            key={label}
          >
            <p className="text-xs text-slate-500">{label}</p>
            <p className="mt-1 text-sm font-semibold">{value}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between rounded-lg bg-slate-100 p-3 text-sm">
        <span className="flex items-center gap-2 font-medium">
          <Users size={17} />
          {dashboard.user.roles.map((role) => roleLabels[role]).join(", ")}
        </span>
        <ChevronRight size={17} className="text-slate-500" />
      </div>
    </section>
  );
}
