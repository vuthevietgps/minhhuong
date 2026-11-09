"use client";

import { KeyRound, Search } from "lucide-react";
import { formatDate, formatMoney, formatRoleVi, formatStatusVi } from "../../_lib/admin-client";
import { latestChildSubscription } from "./shared";
import type { ChannelPageState } from "./use-channel-page-state";

/** Channel users with filters and actions. */
export function UsersSection(state: ChannelPageState) {
  const {
    canManageGlobal,
    canManageScopedMembers,
    isLoading,
    isLoadingMore,
    isSaving,
    loadUsers,
    nextCursor,
    onSearchSubmit,
    openResetPasswordModal,
    role,
    searchInput,
    setRole,
    setSearchInput,
    setStatus,
    setSuspendUser,
    status,
    updateUserStatus,
    users,
  } = state;
  return (
    <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900">Người dùng</p>
          <p className="mt-1 text-sm text-slate-500">
            Tìm kiếm theo vai trò, xem thành viên kênh và quản lý quyền truy
            cập hoặc đặt lại mật khẩu.
          </p>
        </div>
        <form className="flex flex-wrap gap-2" onSubmit={onSearchSubmit}>
          <div className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-500">
            <Search size={16} />
            <input
              className="w-44 bg-transparent outline-none placeholder:text-slate-400"
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Tìm email, tên hoặc mã"
              value={searchInput}
            />
          </div>
          <select
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm"
            onChange={(event) => setRole(event.target.value)}
            value={role}
          >
            <option value="ALL">Tất cả vai trò</option>
            <option value="SALE">Nhân viên kinh doanh</option>
            <option value="AGENCY_OWNER">Chủ đại lý</option>
            <option value="AGENCY_MANAGER">Quản lý đại lý</option>
            <option value="ADMIN">Quản trị viên</option>
            <option value="OPERATIONS">Vận hành</option>
            <option value="DIRECTOR">Giám đốc</option>
          </select>
          <select
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm"
            onChange={(event) =>
              setStatus(
                event.target.value as
                  "ALL" | "ACTIVE" | "SUSPENDED" | "DELETED",
              )
            }
            value={status}
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="ACTIVE">Đang hoạt động</option>
            <option value="SUSPENDED">Tạm khóa</option>
            <option value="DELETED">Đã xóa</option>
          </select>
          <button
            className="h-10 rounded-xl bg-slate-950 px-4 text-sm font-medium text-white"
            type="submit"
          >
            Áp dụng
          </button>
        </form>
      </div>

      <div className="mt-4 space-y-3">
        {users.map((user) => {
          const latestSubscription = latestChildSubscription(user);
          const canManageThisUser =
            canManageGlobal ||
            (canManageScopedMembers &&
              user.agencyMemberships.some((item) => item.role === "SALE"));

          return (
            <article
              className="rounded-2xl border border-slate-200 p-4"
              key={user.id}
            >
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-950">
                    {user.profile?.displayName ?? user.email}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">{user.email}</p>
                  <p className="mt-2 text-sm text-slate-500">
                    Vai trò:{" "}
                    {user.roles
                      .map((item) => formatRoleVi(item.role.name))
                      .join(", ")}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Thành viên đại lý:{" "}
                    {user.agencyMemberships
                      .map(
                        (item) =>
                          `${item.agency.code} (${formatRoleVi(item.role)}${item.referralCode ? ` • ${item.referralCode}` : ""}${item.rateBps ? ` • ${(item.rateBps / 100).toFixed(1)}%` : ""})`,
                      )
                      .join(", ") || "Không có"}
                  </p>
                  {user.channelParticipant && (
                    <p className="mt-1 text-sm text-slate-500">
                      Thành viên kênh {user.channelParticipant.code} • tỷ lệ{" "}
                      {(
                        (user.channelParticipant.commissionRateBps ?? 0) / 100
                      ).toFixed(1)}
                      % • lương{" "}
                      {formatMoney(
                        user.channelParticipant.baseSalaryCents ?? 0,
                        "VND",
                      )}
                    </p>
                  )}
                  {latestSubscription && (
                    <p className="mt-1 text-sm text-slate-500">
                      Gói học gần nhất{" "}
                      {formatStatusVi(latestSubscription.status)} • kết thúc{" "}
                      {formatDate(latestSubscription.currentPeriodEnd)}
                    </p>
                  )}
                  <p className="mt-2 text-xs text-slate-400">
                    Ngày tạo {formatDate(user.createdAt)}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${user.status === "ACTIVE" ? "bg-teal-50 text-teal-700" : user.status === "SUSPENDED" ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-600"}`}
                  >
                    {formatStatusVi(user.status)}
                  </span>
                  {canManageThisUser && user.status !== "DELETED" && (
                    <>
                      <button
                        className="h-9 rounded-xl border border-slate-200 px-3 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                        disabled={isSaving || user.status === "ACTIVE"}
                        onClick={() =>
                          void updateUserStatus(user.id, "ACTIVE")
                        }
                        type="button"
                      >
                        Kích hoạt
                      </button>
                      <button
                        className="h-9 rounded-xl border border-rose-200 px-3 text-xs font-medium text-rose-700 hover:bg-rose-50 disabled:opacity-60"
                        disabled={isSaving || user.status === "SUSPENDED"}
                        onClick={() => setSuspendUser(user)}
                        type="button"
                      >
                        Tạm khóa
                      </button>
                      <button
                        className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 px-3 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                        disabled={isSaving}
                        onClick={() => openResetPasswordModal(user)}
                        type="button"
                      >
                        <KeyRound size={14} />
                        Đặt lại mật khẩu
                      </button>
                    </>
                  )}
                </div>
              </div>
            </article>
          );
        })}
        {!isLoading && users.length === 0 && (
          <div className="rounded-2xl bg-slate-50 px-4 py-6 text-sm text-slate-500">
            Không có người dùng phù hợp với bộ lọc.
          </div>
        )}
      </div>

      {nextCursor && (
        <div className="mt-4">
          <button
            className="h-10 rounded-xl border border-slate-200 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            disabled={isLoadingMore}
            onClick={() => void loadUsers(nextCursor, true)}
            type="button"
          >
            {isLoadingMore ? "Đang tải..." : "Xem thêm"}
          </button>
        </div>
      )}
    </section>
  );
}
