"use client";

import { RefreshCw, Users } from "lucide-react";
import { useChannelPageState } from "./_components/use-channel-page-state";
import { ChannelSetupSection } from "./_components/channel-setup-section";
import { AgenciesSection, CommissionPoliciesSection } from "./_components/channel-sections";
import { UsersSection } from "./_components/users-section";
import { ResetPasswordModal, SuspendUserModal } from "./_components/user-modals";
import { EditAgencyModal, EditMemberModal, EditPolicyModal } from "./_components/edit-modals";

export default function ChannelPage() {
  const state = useChannelPageState();
  const {
    canViewChannel,
    isLoading,
    loaded,
    message,
    refreshChannel,
    summary,
    totalUsers,
    users,
  } = state;
  if (!loaded) {
    return (
      <div className="px-6 py-6 lg:px-8 lg:py-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-sm text-slate-500 shadow-sm">
          Đang kiểm tra quyền truy cập kênh...
        </div>
      </div>
    );
  }
  if (!canViewChannel) {
    return (
      <div className="px-6 py-6 lg:px-8 lg:py-8">
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-8 shadow-sm">
          <h1 className="text-xl font-semibold text-amber-950">
            Vai trò này không được mở không gian quản lý kênh.
          </h1>
          <p className="mt-3 text-sm leading-6 text-amber-900">
            Hãy dùng cổng khác phù hợp với quyền quản lý kênh của bạn.
          </p>
        </div>
      </div>
    );
  }
return (
    <div className="px-6 py-6 lg:px-8 lg:py-8">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-teal-700">
              <Users size={18} />
              Không gian quản lý kênh
            </div>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
              Đại lý, tài khoản kênh và kiểm soát quyền vận hành
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-500">{message}</p>
          </div>
          <button
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            disabled={isLoading}
            onClick={() => void refreshChannel()}
            type="button"
          >
            <RefreshCw size={16} />
            Làm mới
          </button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            [
              "Đại lý",
              summary ? String(summary.agencies) : "-",
              summary ? `${summary.activeAgencies} đang hoạt động` : "-",
            ],
            [
              "Nhân viên kinh doanh",
              summary ? String(summary.saleUsers) : "-",
              summary
                ? `${summary.activeMembers} thành viên đang hoạt động`
                : "-",
            ],
            [
              "Chính sách",
              summary ? String(summary.policies) : "-",
              summary ? `${summary.learners} học viên trong phạm vi kênh` : "-",
            ],
            [
              "Người dùng đã tải",
              String(users.length),
              `${totalUsers} người dùng khớp bộ lọc hiện tại`,
            ],
          ].map(([label, value, note]) => (
            <article
              className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
              key={label}
            >
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                {label}
              </p>
              <p className="mt-3 text-2xl font-semibold text-slate-950">
                {value}
              </p>
              <p className="mt-2 text-sm text-slate-500">{note}</p>
            </article>
          ))}
        </div>
      </section>

      <div className="mt-6 grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-4">
          <ChannelSetupSection {...state} />

          <CommissionPoliciesSection {...state} />
        </div>

        <AgenciesSection {...state} />
      </div>

      <UsersSection {...state} />

      <SuspendUserModal {...state} />

      <ResetPasswordModal {...state} />

      <EditAgencyModal {...state} />

      <EditPolicyModal {...state} />

      <EditMemberModal {...state} />
    </div>
  );
}
