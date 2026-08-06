"use client";

import { ClipboardList, Search } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { adminJson, formatDate } from "../_lib/admin-client";
import { hasAllowedRole, useStoredAdminSession } from "../_lib/admin-session";

const auditViewRoles = ["ADMIN", "DIRECTOR", "OPERATIONS"] as const;

type AuditEntry = {
  id: string;
  action: string;
  entityType?: string;
  entityId?: string;
  ipAddress?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  user?: {
    id: string;
    email: string;
    profile?: { displayName?: string };
  };
};

type AuditPage = {
  items: AuditEntry[];
  nextCursor: string | null;
  hasMore: boolean;
};

function actionColor(action: string) {
  if (
    action.includes("delete") ||
    action.includes("revoke") ||
    action.includes("suspend")
  )
    return "bg-rose-50 text-rose-700";
  if (
    action.includes("create") ||
    action.includes("add") ||
    action.includes("approve")
  )
    return "bg-teal-50 text-teal-700";
  if (
    action.includes("update") ||
    action.includes("edit") ||
    action.includes("publish")
  )
    return "bg-sky-50 text-sky-700";
  if (action.includes("reset") || action.includes("password"))
    return "bg-amber-50 text-amber-700";
  return "bg-slate-100 text-slate-600";
}

const auditTokenLabelsVi: Record<string, string> = {
  create: "tạo",
  created: "đã tạo",
  add: "thêm",
  added: "đã thêm",
  update: "cập nhật",
  updated: "đã cập nhật",
  edit: "chỉnh sửa",
  edited: "đã chỉnh sửa",
  delete: "xóa",
  deleted: "đã xóa",
  approve: "phê duyệt",
  approved: "đã phê duyệt",
  reject: "từ chối",
  rejected: "đã từ chối",
  revoke: "thu hồi",
  revoked: "đã thu hồi",
  suspend: "tạm khóa",
  suspended: "đã tạm khóa",
  activate: "kích hoạt",
  activated: "đã kích hoạt",
  publish: "xuất bản",
  published: "đã xuất bản",
  reset: "đặt lại",
  channel: "kênh",
  user: "người dùng",
  agency: "đại lý",
  member: "thành viên",
  commission: "hoa hồng",
  policy: "chính sách",
  order: "đơn hàng",
  payout: "chi trả",
  content: "nội dung",
  lesson: "bài học",
  package: "gói học",
  status: "trạng thái",
  role: "vai trò",
  password: "mật khẩu",
};

function formatAuditCodeVi(value: string) {
  return value
    .split(/[._-]+/)
    .map((token) => auditTokenLabelsVi[token.toLowerCase()] ?? token)
    .join(" · ");
}

export default function AuditLogPage() {
  const { loaded, roles } = useStoredAdminSession();
  const canView = hasAllowedRole(roles, auditViewRoles);

  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  const [actionFilter, setActionFilter] = useState("");
  const [userEmailFilter, setUserEmailFilter] = useState("");
  const [entityTypeFilter, setEntityTypeFilter] = useState("");

  // Track submitted search values separately
  const [appliedAction, setAppliedAction] = useState("");
  const [appliedEmail, setAppliedEmail] = useState("");
  const [appliedEntity, setAppliedEntity] = useState("");

  const [expandedId, setExpandedId] = useState<string | null>(null);

  const load = useCallback(
    async (cursor?: string) => {
      setLoading(true);
      setError("");
      try {
        const params = new URLSearchParams({ limit: "50" });
        if (appliedAction) params.set("action", appliedAction);
        if (appliedEmail) params.set("userEmail", appliedEmail);
        if (appliedEntity) params.set("entityType", appliedEntity);
        if (cursor) params.set("cursor", cursor);

        const data = await adminJson<AuditPage>(
          `/channel-admin/audit-logs?${params}`,
        );
        setEntries((prev) => (cursor ? [...prev, ...data.items] : data.items));
        setNextCursor(data.nextCursor);
        setHasMore(data.hasMore);
      } catch (err) {
        setError((err as Error).message ?? "Không thể tải nhật ký kiểm toán.");
      } finally {
        setLoading(false);
      }
    },
    [appliedAction, appliedEmail, appliedEntity],
  );

  useEffect(() => {
    if (!loaded || !canView) {
      return;
    }

    const timer = window.setTimeout(() => {
      setEntries([]);
      void load();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loaded, canView, load]);

  function applySearch() {
    setAppliedAction(actionFilter);
    setAppliedEmail(userEmailFilter);
    setAppliedEntity(entityTypeFilter);
  }

  if (loaded && !canView) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-slate-500">Không có quyền truy cập.</p>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="grid size-10 place-items-center rounded-2xl bg-slate-950 text-white">
          <ClipboardList size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Nhật ký kiểm toán
          </h1>
          <p className="text-sm text-slate-500">
            Lịch sử mọi thao tác quản trị và vận hành
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 rounded-2xl border border-slate-200 bg-white p-4">
        <input
          className="h-9 min-w-[180px] flex-1 rounded-xl border border-slate-200 px-3 text-sm"
          onChange={(e) => setActionFilter(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && applySearch()}
          placeholder="Lọc hành động (ví dụ: channel.user)"
          value={actionFilter}
        />
        <input
          className="h-9 min-w-[180px] flex-1 rounded-xl border border-slate-200 px-3 text-sm"
          onChange={(e) => setUserEmailFilter(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && applySearch()}
          placeholder="Lọc theo email người dùng"
          value={userEmailFilter}
        />
        <input
          className="h-9 min-w-[140px] flex-1 rounded-xl border border-slate-200 px-3 text-sm"
          onChange={(e) => setEntityTypeFilter(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && applySearch()}
          placeholder="Loại đối tượng"
          value={entityTypeFilter}
        />
        <button
          className="inline-flex h-9 items-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-medium text-white hover:bg-slate-800"
          onClick={applySearch}
          type="button"
        >
          <Search size={14} />
          Tìm kiếm
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-5 py-3 font-medium">Thời gian</th>
              <th className="px-5 py-3 font-medium">Người thực hiện</th>
              <th className="px-5 py-3 font-medium">Hành động</th>
              <th className="px-5 py-3 font-medium">Đối tượng</th>
              <th className="px-5 py-3 font-medium">IP</th>
              <th className="px-5 py-3 font-medium">Chi tiết</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {entries.length === 0 && !loading && (
              <tr>
                <td
                  className="px-5 py-8 text-center text-slate-400"
                  colSpan={6}
                >
                  Không tìm thấy bản ghi kiểm toán
                </td>
              </tr>
            )}
            {entries.map((entry) => (
              <>
                <tr key={entry.id} className="hover:bg-slate-50/60">
                  <td className="px-5 py-3 text-slate-500 text-xs whitespace-nowrap">
                    {formatDate(entry.createdAt)}
                  </td>
                  <td className="px-5 py-3">
                    <p className="font-medium text-slate-800">
                      {entry.user?.email ?? "(hệ thống)"}
                    </p>
                    {entry.user?.profile?.displayName && (
                      <p className="text-xs text-slate-400">
                        {entry.user.profile.displayName}
                      </p>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${actionColor(entry.action)}`}
                    >
                      {formatAuditCodeVi(entry.action)}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-slate-600">
                    {entry.entityType ? (
                      <span>
                        {formatAuditCodeVi(entry.entityType)}
                        {entry.entityId && (
                          <span className="ml-1 text-xs text-slate-400">
                            #{entry.entityId.slice(-8)}
                          </span>
                        )}
                      </span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-xs text-slate-400">
                    {entry.ipAddress ?? "—"}
                  </td>
                  <td className="px-5 py-3">
                    {entry.metadata &&
                      Object.keys(entry.metadata).length > 0 && (
                        <button
                          className="text-xs text-sky-600 hover:underline"
                          onClick={() =>
                            setExpandedId(
                              expandedId === entry.id ? null : entry.id,
                            )
                          }
                          type="button"
                        >
                          {expandedId === entry.id ? "Ẩn" : "Hiện"}
                        </button>
                      )}
                  </td>
                </tr>
                {expandedId === entry.id && entry.metadata && (
                  <tr key={`${entry.id}-meta`} className="bg-slate-50">
                    <td className="px-5 py-3" colSpan={6}>
                      <pre className="overflow-auto rounded-xl bg-slate-100 p-3 text-xs text-slate-600">
                        {JSON.stringify(entry.metadata, null, 2)}
                      </pre>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>

      {loading && (
        <p className="text-center text-sm text-slate-400">Đang tải…</p>
      )}

      {hasMore && !loading && (
        <div className="flex justify-center">
          <button
            className="rounded-xl border border-slate-200 bg-white px-5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            onClick={() => load(nextCursor ?? undefined)}
            type="button"
          >
            Xem thêm
          </button>
        </div>
      )}
    </div>
  );
}
