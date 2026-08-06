"use client";

import {
  CheckCircle2,
  Eye,
  KeyRound,
  Loader2,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  UserX,
  X,
} from "lucide-react";
import { FormEvent, useCallback, useEffect, useState } from "react";
import {
  adminFetch,
  adminJson,
  formatDate,
  formatMoney,
  formatRoleVi,
  formatStatusVi,
  readApiError,
} from "../_lib/admin-client";
import { hasAllowedRole, useStoredAdminSession } from "../_lib/admin-session";

// ── Types ─────────────────────────────────────────────────────────────────────

type UserStatus = "ACTIVE" | "SUSPENDED" | "DELETED";

type PlatformUser = {
  id: string;
  email: string;
  status: UserStatus;
  createdAt: string;
  profile?: { displayName?: string } | null;
  roles: Array<{ role: { name: string } }>;
  childProfiles: Array<{
    subscriptions: Array<{ status: string; currentPeriodEnd?: string }>;
  }>;
};

type UserDetail = {
  id: string;
  email: string;
  status: string;
  createdAt: string;
  profile?: { displayName?: string } | null;
  roles: Array<{ role: { name: string } }>;
  childProfiles: Array<{
    id: string;
    displayName?: string;
    subscriptions: Array<{
      status: string;
      currentPeriodEnd?: string;
      plan?: { name: string };
    }>;
  }>;
  activationOrders: Array<{
    id: string;
    status: string;
    packageName?: string;
    amountCents: number;
    currency: string;
    activatedAt?: string;
    expiresAt?: string;
    createdAt: string;
    reviewNotes?: string;
    revokeReason?: string;
    createdBy?: { email: string };
  }>;
};

type UserPage = {
  items: PlatformUser[];
  total: number;
  nextCursor?: string | null;
};

const adminUserViewRoles = [
  "ADMIN",
  "OPERATIONS",
  "DIRECTOR",
  "SUPPORT",
] as const;
const adminUserRoles = ["ADMIN", "OPERATIONS", "DIRECTOR"] as const;

const statusColors: Record<UserStatus, string> = {
  ACTIVE: "bg-green-100 text-green-700",
  SUSPENDED: "bg-amber-100 text-amber-700",
  DELETED: "bg-red-100 text-red-600",
};

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function UsersPage() {
  const { loaded, roles } = useStoredAdminSession();
  const canView = hasAllowedRole(roles, adminUserViewRoles);
  const canManage = hasAllowedRole(roles, adminUserRoles);

  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [total, setTotal] = useState(0);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | UserStatus>("ALL");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  // Suspend modal
  const [suspendUser, setSuspendUser] = useState<PlatformUser | null>(null);
  const [suspendReason, setSuspendReason] = useState("");

  // Activate modal
  const [activateUser, setActivateUser] = useState<PlatformUser | null>(null);

  // Reset password modal
  const [resetUser, setResetUser] = useState<PlatformUser | null>(null);
  const [newPassword, setNewPassword] = useState("");

  // Role assignment modal (ADMIN only)
  const [rolesUser, setRolesUser] = useState<PlatformUser | null>(null);
  const [isTogglingRole, setIsTogglingRole] = useState("");

  // User detail panel
  const [detailUser, setDetailUser] = useState<UserDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");

  const openDetail = async (userId: string) => {
    setDetailUser(null);
    setDetailError("");
    setDetailLoading(true);
    try {
      const data = await adminJson<UserDetail>(
        `/channel-admin/users/${userId}/detail`,
      );
      setDetailUser(data);
    } catch (err) {
      setDetailError(
        (err as Error).message ?? "Không thể tải thông tin người dùng.",
      );
    } finally {
      setDetailLoading(false);
    }
  };

  const [toast, setToast] = useState<{ text: string; ok: boolean } | null>(
    null,
  );

  const showToast = useCallback((text: string, ok = true) => {
    setToast({ text, ok });
    window.setTimeout(() => setToast(null), 3500);
  }, []);

  const buildQuery = useCallback(
    (cursor?: string | null) => {
      const params = new URLSearchParams({ limit: "30" });
      if (search) params.set("search", search);
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      if (roleFilter !== "ALL") params.set("role", roleFilter);
      if (cursor) params.set("cursor", cursor);
      return params.toString();
    },
    [search, statusFilter, roleFilter],
  );

  const load = useCallback(async () => {
    setIsLoading(true);
    setMessage("");
    try {
      const data = await adminJson<UserPage>(
        `/channel-admin/users?${buildQuery()}`,
      );
      setUsers(data.items);
      setTotal(data.total);
      setNextCursor(data.nextCursor ?? null);
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, [buildQuery]);

  const loadMore = useCallback(async () => {
    if (!nextCursor) return;
    setIsLoadingMore(true);
    try {
      const data = await adminJson<UserPage>(
        `/channel-admin/users?${buildQuery(nextCursor)}`,
      );
      setUsers((prev) => [...prev, ...data.items]);
      setNextCursor(data.nextCursor ?? null);
    } finally {
      setIsLoadingMore(false);
    }
  }, [nextCursor, buildQuery]);

  useEffect(() => {
    if (!loaded || !canView) {
      return;
    }

    const timer = window.setTimeout(() => {
      void load();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loaded, canView, load]);

  // ── Actions ────────────────────────────────────────────────────────────────

  const handleSuspend = async (e: FormEvent) => {
    e.preventDefault();
    if (!suspendUser) return;
    setIsSaving(true);
    try {
      await adminJson(`/channel-admin/users/${suspendUser.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: "SUSPENDED", reason: suspendReason }),
      });
      showToast("Đã tạm khóa người dùng.");
      setSuspendUser(null);
      setSuspendReason("");
      void load();
    } catch (err) {
      showToast((err as Error).message, false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleActivate = async () => {
    if (!activateUser) return;
    setIsSaving(true);
    try {
      await adminJson(`/channel-admin/users/${activateUser.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: "ACTIVE" }),
      });
      showToast("Đã kích hoạt lại người dùng.");
      setActivateUser(null);
      void load();
    } catch (err) {
      showToast((err as Error).message, false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetPassword = async (e: FormEvent) => {
    e.preventDefault();
    if (!resetUser) return;
    setIsSaving(true);
    try {
      const res = await adminFetch(
        `/channel-admin/users/${resetUser.id}/reset-password`,
        {
          method: "POST",
          body: JSON.stringify({ newPassword }),
        },
      );
      if (!res.ok)
        throw new Error(await readApiError(res, "Đặt lại không thành công."));
      showToast(`Đã đặt lại mật khẩu cho ${resetUser.email}.`);
      setResetUser(null);
      setNewPassword("");
    } catch (err) {
      showToast((err as Error).message, false);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleRole = async (
    userId: string,
    role: string,
    currentRoles: string[],
  ) => {
    const action = currentRoles.includes(role) ? "remove" : "add";
    setIsTogglingRole(role);
    try {
      await adminJson(`/channel-admin/users/${userId}/roles`, {
        method: "POST",
        body: JSON.stringify({ role, action }),
      });
      showToast(
        `Vai trò ${formatRoleVi(role)} đã được ${action === "add" ? "thêm" : "gỡ"}.`,
      );
      void load();
      // Update modal user to reflect change
      setRolesUser((prev) => {
        if (!prev || prev.id !== userId) return prev;
        if (action === "add") {
          return { ...prev, roles: [...prev.roles, { role: { name: role } }] };
        }
        return {
          ...prev,
          roles: prev.roles.filter((r) => r.role.name !== role),
        };
      });
    } catch (err) {
      showToast((err as Error).message, false);
    } finally {
      setIsTogglingRole("");
    }
  };

  // ── Guards ────────────────────────────────────────────────────────────────

  if (!loaded) {
    return (
      <div className="px-6 py-8 text-sm text-slate-400">
        Đang kiểm tra quyền truy cập...
      </div>
    );
  }

  if (!canView) {
    return (
      <div className="px-6 py-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-500">
          Bạn không có quyền xem người dùng.
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-6 lg:px-8 lg:py-8 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Quản lý người dùng
          </h1>
          <p className="mt-0.5 text-sm text-slate-500">
            Tìm kiếm, tạm khóa, kích hoạt lại và đặt lại mật khẩu người dùng.
          </p>
        </div>
        <button
          onClick={() => void load()}
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
        >
          <RefreshCw size={14} />
          Làm mới
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSearch(searchInput);
          }}
          className="flex items-center gap-2"
        >
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Tìm email hoặc tên..."
              className="w-64 rounded-lg border border-slate-200 pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700"
          >
            Tìm kiếm
          </button>
        </form>

        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as typeof statusFilter)
          }
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300"
        >
          <option value="ALL">Tất cả trạng thái</option>
          <option value="ACTIVE">Đang hoạt động</option>
          <option value="SUSPENDED">Đã tạm khóa</option>
          <option value="DELETED">Đã xóa</option>
        </select>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300"
        >
          <option value="ALL">Tất cả vai trò</option>
          <option value="STUDENT">Học sinh</option>
          <option value="PARENT">Phụ huynh</option>
          <option value="TEACHER">Giáo viên</option>
          <option value="CONTENT_EDITOR">Biên tập nội dung</option>
          <option value="ADMIN">Quản trị viên</option>
          <option value="SUPPORT">Hỗ trợ</option>
        </select>
      </div>

      {/* Stats */}
      {total > 0 && (
        <p className="text-xs text-slate-400">
          {total.toLocaleString("vi-VN")} người dùng được tìm thấy
        </p>
      )}

      {/* Error */}
      {message && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {message}
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center gap-2 py-8 text-slate-400 text-sm">
          <Loader2 size={16} className="animate-spin" />
          Đang tải người dùng…
        </div>
      )}

      {/* User table */}
      {!isLoading && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {users.length === 0 ? (
            <div className="p-10 text-center text-sm text-slate-400">
              Không tìm thấy người dùng.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b border-slate-100 bg-slate-50">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500">
                    Người dùng
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">
                    Vai trò
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">
                    Trạng thái
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">
                    Gói học
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">
                    Ngày tham gia
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((user) => {
                  const activeSub = user.childProfiles
                    .flatMap((cp) => cp.subscriptions)
                    .find((s) => ["ACTIVE", "TRIALING"].includes(s.status));
                  const userRoles = user.roles
                    .map((r) => formatRoleVi(r.role.name))
                    .join(", ");
                  return (
                    <tr key={user.id} className="hover:bg-slate-50/50">
                      <td className="px-5 py-3">
                        <p className="font-medium text-slate-900">
                          {user.profile?.displayName ?? (
                            <span className="text-slate-400 italic">—</span>
                          )}
                        </p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-slate-500">
                          {userRoles || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[user.status]}`}
                        >
                          {formatStatusVi(user.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {activeSub ? (
                          <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                            {formatStatusVi(activeSub.status)}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => void openDetail(user.id)}
                            className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-100"
                            title="Xem chi tiết"
                          >
                            <Eye size={13} />
                          </button>
                          {canManage && (
                            <button
                              onClick={() => {
                                setResetUser(user);
                                setNewPassword("");
                              }}
                              className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-100"
                              title="Đặt lại mật khẩu"
                            >
                              <KeyRound size={13} />
                            </button>
                          )}
                          {canManage && roles.includes("ADMIN") && (
                            <button
                              onClick={() => setRolesUser(user)}
                              className="rounded-lg border border-indigo-200 bg-indigo-50 p-1.5 text-indigo-600 hover:bg-indigo-100"
                              title="Quản lý vai trò"
                            >
                              <Shield size={13} />
                            </button>
                          )}
                          {canManage && user.status === "ACTIVE" && (
                            <button
                              onClick={() => {
                                setSuspendUser(user);
                                setSuspendReason("");
                              }}
                              className="rounded-lg border border-amber-200 bg-amber-50 p-1.5 text-amber-600 hover:bg-amber-100"
                              title="Tạm khóa người dùng"
                            >
                              <UserX size={13} />
                            </button>
                          )}
                          {canManage && user.status === "SUSPENDED" && (
                            <button
                              onClick={() => setActivateUser(user)}
                              className="rounded-lg border border-green-200 bg-green-50 p-1.5 text-green-600 hover:bg-green-100"
                              title="Kích hoạt lại người dùng"
                            >
                              <ShieldCheck size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {nextCursor && (
            <div className="flex justify-center border-t border-slate-100 px-5 py-4">
              <button
                onClick={() => void loadMore()}
                disabled={isLoadingMore}
                className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                {isLoadingMore ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : null}
                Xem thêm
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Modals ──────────────────────────────────────────────────────────── */}

      {/* Suspend */}
      {suspendUser && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <ShieldAlert size={16} className="text-amber-500" />
                Tạm khóa người dùng
              </h2>
              <button
                onClick={() => setSuspendUser(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X size={16} />
              </button>
            </div>
            <form
              onSubmit={(e) => void handleSuspend(e)}
              className="px-5 py-5 space-y-4"
            >
              <p className="text-sm text-slate-600">
                Việc tạm khóa <strong>{suspendUser.email}</strong> sẽ chặn quyền
                truy cập ngay lập tức.
              </p>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Lý do (nội bộ)
                </label>
                <textarea
                  required
                  rows={3}
                  value={suspendReason}
                  onChange={(e) => setSuspendReason(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
                  placeholder="Vi phạm điều khoản, tài khoản trùng lặp, v.v."
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSuspendUser(null)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-1.5 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50"
                >
                  {isSaving && <Loader2 size={14} className="animate-spin" />}
                  Tạm khóa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reactivate */}
      {activateUser && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <ShieldCheck size={16} className="text-green-500" />
                Kích hoạt lại người dùng
              </h2>
              <button
                onClick={() => setActivateUser(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X size={16} />
              </button>
            </div>
            <div className="px-5 py-5 space-y-4">
              <p className="text-sm text-slate-600">
                Kích hoạt lại <strong>{activateUser.email}</strong>? Người dùng
                sẽ lấy lại toàn bộ quyền truy cập ngay lập tức.
              </p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setActivateUser(null)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  onClick={() => void handleActivate()}
                  disabled={isSaving}
                  className="flex items-center gap-1.5 rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800 disabled:opacity-50"
                >
                  {isSaving && <Loader2 size={14} className="animate-spin" />}
                  Kích hoạt lại
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password */}
      {resetUser && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <KeyRound size={16} className="text-slate-500" />
                Đặt lại mật khẩu
              </h2>
              <button
                onClick={() => setResetUser(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X size={16} />
              </button>
            </div>
            <form
              onSubmit={(e) => void handleResetPassword(e)}
              className="px-5 py-5 space-y-4"
            >
              <p className="text-sm text-slate-600">
                Đặt mật khẩu tạm cho <strong>{resetUser.email}</strong>. Yêu cầu
                người dùng đổi mật khẩu sau khi đăng nhập.
              </p>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Mật khẩu mới
                </label>
                <input
                  required
                  minLength={8}
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-slate-300"
                  placeholder="Tối thiểu 8 ký tự"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setResetUser(null)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-1.5 rounded-lg bg-slate-950 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
                >
                  {isSaving && <Loader2 size={14} className="animate-spin" />}
                  Đặt lại mật khẩu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Role Assignment Modal */}
      {rolesUser && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <Shield size={16} className="text-indigo-500" />
                Vai trò hệ thống
              </h2>
              <button
                onClick={() => setRolesUser(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X size={16} />
              </button>
            </div>
            <div className="px-5 py-5 space-y-3">
              <p className="text-sm text-slate-500">
                Gán hoặc gỡ vai trò hệ thống cho{" "}
                <strong>{rolesUser.email}</strong>.
              </p>
              <div className="space-y-2">
                {(
                  [
                    "TEACHER",
                    "CONTENT_EDITOR",
                    "SUPPORT",
                    "OPERATIONS",
                    "DIRECTOR",
                  ] as const
                ).map((role) => {
                  const currentRoles = rolesUser.roles.map((r) => r.role.name);
                  const hasRole = currentRoles.includes(role);
                  const isLoading = isTogglingRole === role;
                  return (
                    <div
                      key={role}
                      className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-2.5"
                    >
                      <div>
                        <p className="text-sm font-medium text-slate-800">
                          {role.replace("_", " ")}
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          void toggleRole(rolesUser.id, role, currentRoles)
                        }
                        disabled={!!isTogglingRole}
                        className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50 ${
                          hasRole
                            ? "bg-indigo-100 text-indigo-700 hover:bg-red-100 hover:text-red-700"
                            : "border border-slate-200 text-slate-600 hover:bg-indigo-50 hover:text-indigo-700"
                        }`}
                      >
                        {isLoading ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : hasRole ? (
                          <CheckCircle2 size={12} />
                        ) : null}
                        {hasRole ? "Đã gán" : "Gán"}
                      </button>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setRolesUser(null)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
                >
                  Hoàn tất
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Detail Panel */}
      {(detailLoading || detailUser || detailError) && (
        <div className="fixed inset-0 z-40 flex justify-end bg-black/40">
          <div className="h-full w-full max-w-xl overflow-y-auto bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <Eye size={16} className="text-slate-500" />
                Chi tiết người dùng
              </h2>
              <button
                onClick={() => {
                  setDetailUser(null);
                  setDetailError("");
                }}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X size={16} />
              </button>
            </div>

            {detailLoading && (
              <div className="flex items-center justify-center py-16">
                <Loader2 size={20} className="animate-spin text-slate-400" />
              </div>
            )}

            {detailError && (
              <div className="m-5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                {detailError}
              </div>
            )}

            {detailUser && (
              <div className="space-y-5 p-5">
                {/* Identity */}
                <div className="rounded-2xl border border-slate-200 p-4 space-y-1">
                  <p className="text-base font-semibold text-slate-900">
                    {detailUser.profile?.displayName ?? detailUser.email}
                  </p>
                  <p className="text-sm text-slate-500">{detailUser.email}</p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[detailUser.status as UserStatus] ?? "bg-slate-100 text-slate-600"}`}
                    >
                      {formatStatusVi(detailUser.status)}
                    </span>
                    {detailUser.roles.map((r) => (
                      <span
                        key={r.role.name}
                        className="inline-flex rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700"
                      >
                        {formatRoleVi(r.role.name)}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-slate-400 pt-1">
                    Ngày tham gia {formatDate(detailUser.createdAt)}
                  </p>
                </div>

                {/* Child profiles / Subscriptions */}
                {detailUser.childProfiles.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Hồ sơ học sinh và gói học
                    </p>
                    <div className="space-y-2">
                      {detailUser.childProfiles.map((cp) => {
                        const sub = cp.subscriptions[0];
                        return (
                          <div
                            key={cp.id}
                            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                          >
                            <p className="text-sm font-medium text-slate-800">
                              {cp.displayName ?? "(chưa đặt tên)"}
                            </p>
                            {sub ? (
                              <p className="mt-1 text-xs text-slate-500">
                                <span
                                  className={`mr-1.5 inline-flex rounded-full px-1.5 py-0.5 text-xs font-medium ${sub.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}
                                >
                                  {formatStatusVi(sub.status)}
                                </span>
                                {sub.plan?.name ?? ""}
                                {sub.currentPeriodEnd &&
                                  ` · expires ${formatDate(sub.currentPeriodEnd)}`}
                              </p>
                            ) : (
                              <p className="mt-1 text-xs text-slate-400">
                                Không có gói đang hoạt động
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Activation Orders */}
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Đơn kích hoạt (10 đơn gần nhất)
                  </p>
                  {detailUser.activationOrders.length === 0 ? (
                    <p className="text-sm text-slate-400">Chưa có đơn hàng.</p>
                  ) : (
                    <div className="space-y-2">
                      {detailUser.activationOrders.map((order) => (
                        <div
                          key={order.id}
                          className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-slate-800">
                              {order.packageName ?? "Gói đang chờ duyệt"}
                            </span>
                            <span
                              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                order.status === "APPROVED"
                                  ? "bg-teal-50 text-teal-700"
                                  : order.status === "PENDING_REVIEW"
                                    ? "bg-sky-50 text-sky-700"
                                    : order.status === "REJECTED"
                                      ? "bg-rose-50 text-rose-700"
                                      : order.status === "REVOKED"
                                        ? "bg-purple-50 text-purple-700"
                                        : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {formatStatusVi(order.status)}
                            </span>
                          </div>
                          <p className="mt-0.5 text-xs text-slate-500">
                            {formatMoney(order.amountCents, order.currency)} ·{" "}
                            {formatDate(order.createdAt)}
                          </p>
                          {order.expiresAt && (
                            <p className="text-xs text-slate-400">
                              Hết hạn {formatDate(order.expiresAt)}
                            </p>
                          )}
                          {(order.reviewNotes || order.revokeReason) && (
                            <p className="mt-1 text-xs text-rose-600">
                              {order.reviewNotes ?? order.revokeReason}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium shadow-lg ${
            toast.ok ? "bg-slate-950 text-white" : "bg-red-600 text-white"
          }`}
        >
          {toast.ok ? <CheckCircle2 size={15} /> : <X size={15} />}
          {toast.text}
        </div>
      )}
    </div>
  );
}
