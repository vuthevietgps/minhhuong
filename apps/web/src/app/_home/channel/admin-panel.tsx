"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { apiBaseUrl, readApiError } from "../lib/api";
import {
  formatMoney,
  formatRoleCodeVi,
  formatStatusCodeVi,
  roleLabels,
} from "../lib/format";
import type { ChannelParticipantSummary, Role, Session } from "../types";

type ChannelUser = {
  id: string;
  email: string;
  status: "ACTIVE" | "SUSPENDED" | "DELETED";
  createdAt: string;
  profile?: {
    displayName?: string;
  };
  roles: Array<{
    role: {
      name: Role;
    };
  }>;
  agencyMemberships: Array<{
    id: string;
    role: "OWNER" | "MANAGER" | "SALE";
    title?: string;
    rateBps?: number;
    referralCode?: string;
    isActive: boolean;
    agency: {
      id: string;
      code: string;
      name: string;
    };
  }>;
  channelParticipant?: ChannelParticipantSummary;
  subscriptions: Array<{
    status: string;
    currentPeriodEnd: string;
  }>;
};

type ChannelUserPage = {
  items: ChannelUser[];
  total: number;
  limit: number;
  nextCursor?: string | null;
};

type AgencyAdmin = {
  id: string;
  code: string;
  name: string;
  status: "ACTIVE" | "SUSPENDED";
  defaultRateBps: number;
  channelParticipant?: ChannelParticipantSummary;
  notes?: string;
  members: Array<{
    id: string;
    role: "OWNER" | "MANAGER" | "SALE";
    title?: string;
    rateBps?: number;
    referralCode?: string;
    isActive: boolean;
    user: {
      id: string;
      email: string;
      status: string;
      profile?: {
        displayName?: string;
      };
    };
  }>;
  _count: {
    activationOrders: number;
    commissions: number;
    payoutRequests: number;
  };
};

type CommissionPolicyAdmin = {
  id: string;
  code: string;
  name: string;
  beneficiaryType: "SALE" | "AGENCY";
  rateBps: number;
  baseSalaryCents: number;
  isDefaultForSale: boolean;
  isDefaultForAgency: boolean;
  isActive: boolean;
};

type ChannelAdminSummary = {
  agencies: number;
  activeAgencies: number;
  saleUsers: number;
  activeMembers: number;
  policies: number;
  learners: number;
};

const dataTextVi: Record<string, string> = {
  "Default sale commission 10%": "Hoa hồng kinh doanh mặc định 10%",
  "Default agency commission 15%": "Hoa hồng đại lý mặc định 15%",
};

function formatDataTextVi(value: string) {
  return dataTextVi[value] ?? value;
}

export function ChannelAdminPanel({
  role,
  session,
}: {
  role: Role;
  session: Session;
}) {
  const canManageGlobal = role === "ADMIN" || role === "OPERATIONS";
  const canManageMembers = canManageGlobal;
  const [summary, setSummary] = useState<ChannelAdminSummary | null>(null);
  const [agencies, setAgencies] = useState<AgencyAdmin[]>([]);
  const [users, setUsers] = useState<ChannelUser[]>([]);
  const [userTotal, setUserTotal] = useState(0);
  const [nextUserCursor, setNextUserCursor] = useState<string | null>(null);
  const [userSearch, setUserSearch] = useState("");
  const [userSearchInput, setUserSearchInput] = useState("");
  const [userRole, setUserRole] = useState<"ALL" | Role>("ALL");
  const [userStatus, setUserStatus] = useState<
    "ALL" | "ACTIVE" | "SUSPENDED" | "DELETED"
  >("ALL");
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [policies, setPolicies] = useState<CommissionPolicyAdmin[]>([]);
  const [agencyCode, setAgencyCode] = useState("NEW-AGENCY");
  const [agencyName, setAgencyName] = useState("Đại lý mới");
  const [agencyRate, setAgencyRate] = useState("1500");
  const [saleEmail, setSaleEmail] = useState("new.sale@example.com");
  const [salePassword, setSalePassword] = useState("Sale@12345");
  const [saleName, setSaleName] = useState("Nhân viên kinh doanh mới");
  const [saleBaseSalary, setSaleBaseSalary] = useState("8000000");
  const [selectedAgencyId, setSelectedAgencyId] = useState("");
  const [memberSaleEmail, setMemberSaleEmail] = useState("sale@demo.local");
  const [memberRate, setMemberRate] = useState("1000");
  const [policyCode, setPolicyCode] = useState("default-sale-10");
  const [policyName, setPolicyName] = useState(
    "Hoa hồng kinh doanh mặc định 10%",
  );
  const [policyType, setPolicyType] = useState<"SALE" | "AGENCY">("SALE");
  const [policyRate, setPolicyRate] = useState("1000");
  const [message, setMessage] = useState("Đang tải quản trị kênh.");
  const [isSaving, setIsSaving] = useState(false);

  const authHeaders = useMemo(
    () => ({ Authorization: `Bearer ${session.accessToken}` }),
    [session.accessToken],
  );

  const jsonHeaders = useMemo(
    () => ({
      ...authHeaders,
      "Content-Type": "application/json",
    }),
    [authHeaders],
  );

  const buildUserListUrl = useCallback(
    (cursor?: string) => {
      const params = new URLSearchParams({ limit: "50" });
      const q = userSearch.trim();
      if (q) {
        params.set("q", q);
      }
      if (userRole !== "ALL") {
        params.set("role", userRole);
      }
      if (userStatus !== "ALL") {
        params.set("status", userStatus);
      }
      if (cursor) {
        params.set("cursor", cursor);
      }

      return `${apiBaseUrl}/v1/channel-admin/users?${params.toString()}`;
    },
    [userRole, userSearch, userStatus],
  );

  const loadUsersPage = useCallback(
    async (cursor?: string, append = false) => {
      setIsLoadingUsers(true);
      try {
        const response = await fetch(buildUserListUrl(cursor), {
          headers: authHeaders,
        });
        if (!response.ok) {
          throw new Error(
            await readApiError(response, "Không thể tải người dùng."),
          );
        }

        const page = (await response.json()) as ChannelUserPage;
        setUsers((current) =>
          append ? [...current, ...page.items] : page.items,
        );
        setUserTotal(page.total);
        setNextUserCursor(page.nextCursor ?? null);
      } finally {
        setIsLoadingUsers(false);
      }
    },
    [authHeaders, buildUserListUrl],
  );

  const loadChannelAdmin = useCallback(async () => {
    try {
      const [summaryResponse, agenciesResponse, policiesResponse] =
        await Promise.all([
          fetch(`${apiBaseUrl}/v1/channel-admin/summary`, {
            headers: authHeaders,
          }),
          fetch(`${apiBaseUrl}/v1/channel-admin/agencies`, {
            headers: authHeaders,
          }),
          fetch(`${apiBaseUrl}/v1/channel-admin/commission-policies`, {
            headers: authHeaders,
          }),
        ]);

      if (!summaryResponse.ok || !agenciesResponse.ok || !policiesResponse.ok) {
        throw new Error("Vai trò này không được truy cập API quản trị kênh.");
      }

      const nextAgencies = (await agenciesResponse.json()) as AgencyAdmin[];
      setSummary((await summaryResponse.json()) as ChannelAdminSummary);
      setAgencies(nextAgencies);
      setPolicies((await policiesResponse.json()) as CommissionPolicyAdmin[]);
      setSelectedAgencyId((current) => current || nextAgencies[0]?.id || "");
      await loadUsersPage();
      setMessage(
        canManageMembers
          ? "Quản trị kênh đã sẵn sàng."
          : "Chế độ chỉ xem kênh.",
      );
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Không thể tải quản trị kênh.",
      );
    }
  }, [authHeaders, canManageMembers, loadUsersPage]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadChannelAdmin();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadChannelAdmin]);

  async function createAgency(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canManageGlobal) {
      return;
    }

    setIsSaving(true);
    setMessage("Đang tạo đại lý...");
    try {
      const response = await fetch(`${apiBaseUrl}/v1/channel-admin/agencies`, {
        method: "POST",
        headers: jsonHeaders,
        body: JSON.stringify({
          code: agencyCode,
          name: agencyName,
          defaultRateBps: Number(agencyRate),
        }),
      });
      if (!response.ok) {
        throw new Error(await readApiError(response, "Không thể tạo đại lý."));
      }

      setMessage("Đã tạo đại lý.");
      await loadChannelAdmin();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Không thể tạo đại lý.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function createSaleUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canManageMembers) {
      return;
    }

    setIsSaving(true);
    setMessage("Đang tạo nhân viên kinh doanh...");
    try {
      const response = await fetch(
        `${apiBaseUrl}/v1/channel-admin/sale-users`,
        {
          method: "POST",
          headers: jsonHeaders,
          body: JSON.stringify({
            email: saleEmail,
            password: salePassword,
            displayName: saleName,
            role: "SALE",
            rateBps: Number(memberRate),
            baseSalaryVnd: Number(saleBaseSalary),
          }),
        },
      );
      if (!response.ok) {
        throw new Error(
          await readApiError(response, "Không thể tạo nhân viên kinh doanh."),
        );
      }

      setMessage("Đã tạo nhân viên kinh doanh.");
      await loadChannelAdmin();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Không thể tạo nhân viên kinh doanh.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function addMember(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canManageMembers || !selectedAgencyId) {
      return;
    }

    setIsSaving(true);
    setMessage("Đang gán nhân viên vào đại lý...");
    try {
      const response = await fetch(
        `${apiBaseUrl}/v1/channel-admin/agencies/${selectedAgencyId}/members`,
        {
          method: "POST",
          headers: jsonHeaders,
          body: JSON.stringify({
            saleEmail: memberSaleEmail,
            title: "Kinh doanh đại lý",
            rateBps: Number(memberRate),
          }),
        },
      );
      if (!response.ok) {
        throw new Error(
          await readApiError(response, "Không thể gán thành viên."),
        );
      }

      setMessage("Đã gán thành viên đại lý.");
      await loadChannelAdmin();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Không thể gán thành viên.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function upsertPolicy(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canManageGlobal) {
      return;
    }

    setIsSaving(true);
    setMessage("Đang lưu chính sách hoa hồng...");
    try {
      const response = await fetch(
        `${apiBaseUrl}/v1/channel-admin/commission-policies`,
        {
          method: "POST",
          headers: jsonHeaders,
          body: JSON.stringify({
            code: policyCode,
            name: policyName,
            beneficiaryType: policyType,
            rateBps: Number(policyRate),
            isDefaultForSale: policyType === "SALE",
            isDefaultForAgency: policyType === "AGENCY",
            isActive: true,
          }),
        },
      );
      if (!response.ok) {
        throw new Error(
          await readApiError(response, "Không thể lưu chính sách."),
        );
      }

      setMessage("Đã lưu chính sách hoa hồng.");
      await loadChannelAdmin();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Không thể lưu chính sách.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function updateUserStatus(
    userId: string,
    status: "ACTIVE" | "SUSPENDED",
    reason?: string,
  ) {
    if (!canManageMembers) {
      return;
    }

    setIsSaving(true);
    setMessage("Đang cập nhật trạng thái người dùng...");
    try {
      const response = await fetch(
        `${apiBaseUrl}/v1/channel-admin/users/${userId}/status`,
        {
          method: "PATCH",
          headers: jsonHeaders,
          body: JSON.stringify({ status, ...(reason ? { reason } : {}) }),
        },
      );
      if (!response.ok) {
        throw new Error(
          await readApiError(response, "Không thể cập nhật người dùng."),
        );
      }

      setMessage("Đã cập nhật trạng thái người dùng.");
      await loadChannelAdmin();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Không thể cập nhật người dùng.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  const [suspendModal, setSuspendModal] = useState<{ userId: string } | null>(
    null,
  );
  const [suspendReasonInput, setSuspendReasonInput] = useState("");

  const saleUsers = users.filter((user) =>
    user.roles.some((item) => item.role.name === "SALE"),
  );

  return (
    <>
      <section className="mt-4 rounded-lg border border-slate-200 bg-white p-4 sm:p-5">
        <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
              Quản trị kênh
            </p>
            <h2 className="mt-1 text-xl font-semibold">
              Đại lý, nhân viên kinh doanh và chính sách
            </h2>
            <p className="mt-1 text-sm text-slate-500">{message}</p>
          </div>
          <div className="grid grid-cols-3 border-y border-slate-200 text-center lg:min-w-96">
            {[
              [
                "Đại lý",
                `${summary?.activeAgencies ?? 0}/${summary?.agencies ?? 0}`,
              ],
              [
                "Nhân viên kinh doanh",
                String(summary?.saleUsers ?? saleUsers.length),
              ],
              ["Học viên", String(summary?.learners ?? 0)],
            ].map(([label, value], index) => (
              <div
                className={index > 0 ? "border-l border-slate-200 p-3" : "p-3"}
                key={label}
              >
                <p className="text-xs text-slate-500">{label}</p>
                <p className="mt-1 text-sm font-semibold">{value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-4">
            {canManageMembers ? (
              <>
                {canManageGlobal && (
                  <form className="space-y-3" onSubmit={createAgency}>
                    <h3 className="text-base font-semibold">Tạo đại lý</h3>
                    <div className="grid gap-3 sm:grid-cols-3">
                      <input
                        className="h-10 rounded-lg border border-slate-300 px-3 text-sm"
                        onChange={(event) => setAgencyCode(event.target.value)}
                        placeholder="Mã"
                        value={agencyCode}
                      />
                      <input
                        className="h-10 rounded-lg border border-slate-300 px-3 text-sm"
                        onChange={(event) => setAgencyName(event.target.value)}
                        placeholder="Tên"
                        value={agencyName}
                      />
                      <input
                        className="h-10 rounded-lg border border-slate-300 px-3 text-sm"
                        onChange={(event) => setAgencyRate(event.target.value)}
                        placeholder="Tỷ lệ (điểm cơ bản)"
                        type="number"
                        value={agencyRate}
                      />
                    </div>
                    <button
                      className="h-10 rounded-lg bg-slate-950 px-4 text-sm font-medium text-white disabled:opacity-60"
                      disabled={isSaving}
                      type="submit"
                    >
                      Tạo đại lý
                    </button>
                  </form>
                )}

                <form
                  className="space-y-3 border-t border-slate-200 pt-4"
                  onSubmit={createSaleUser}
                >
                  <h3 className="text-base font-semibold">
                    Tạo nhân viên kinh doanh
                  </h3>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <input
                      className="h-10 rounded-lg border border-slate-300 px-3 text-sm"
                      onChange={(event) => setSaleEmail(event.target.value)}
                      placeholder="Email"
                      type="email"
                      value={saleEmail}
                    />
                    <input
                      className="h-10 rounded-lg border border-slate-300 px-3 text-sm"
                      onChange={(event) => setSalePassword(event.target.value)}
                      placeholder="Mật khẩu"
                      value={salePassword}
                    />
                    <input
                      className="h-10 rounded-lg border border-slate-300 px-3 text-sm"
                      onChange={(event) => setSaleName(event.target.value)}
                      placeholder="Tên hiển thị"
                      value={saleName}
                    />
                    <input
                      className="h-10 rounded-lg border border-slate-300 px-3 text-sm"
                      onChange={(event) =>
                        setSaleBaseSalary(event.target.value)
                      }
                      placeholder="Lương cơ bản (VND)"
                      type="number"
                      value={saleBaseSalary}
                    />
                  </div>
                  <button
                    className="h-10 rounded-lg bg-slate-950 px-4 text-sm font-medium text-white disabled:opacity-60"
                    disabled={isSaving}
                    type="submit"
                  >
                    Tạo nhân viên
                  </button>
                </form>

                <form
                  className="space-y-3 border-t border-slate-200 pt-4"
                  onSubmit={addMember}
                >
                  <h3 className="text-base font-semibold">
                    Gán nhân viên vào đại lý
                  </h3>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <select
                      className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm"
                      onChange={(event) =>
                        setSelectedAgencyId(event.target.value)
                      }
                      value={selectedAgencyId}
                    >
                      {agencies.map((agency) => (
                        <option key={agency.id} value={agency.id}>
                          {agency.code}
                        </option>
                      ))}
                    </select>
                    <input
                      className="h-10 rounded-lg border border-slate-300 px-3 text-sm"
                      onChange={(event) =>
                        setMemberSaleEmail(event.target.value)
                      }
                      placeholder="Email nhân viên"
                      type="email"
                      value={memberSaleEmail}
                    />
                    <input
                      className="h-10 rounded-lg border border-slate-300 px-3 text-sm"
                      onChange={(event) => setMemberRate(event.target.value)}
                      placeholder="Tỷ lệ (điểm cơ bản)"
                      type="number"
                      value={memberRate}
                    />
                  </div>
                  <button
                    className="h-10 rounded-lg bg-teal-700 px-4 text-sm font-medium text-white disabled:opacity-60"
                    disabled={isSaving || agencies.length === 0}
                    type="submit"
                  >
                    Gán thành viên
                  </button>
                </form>

                {canManageGlobal && (
                  <form
                    className="space-y-3 border-t border-slate-200 pt-4"
                    onSubmit={upsertPolicy}
                  >
                    <h3 className="text-base font-semibold">
                      Chính sách hoa hồng
                    </h3>
                    <div className="grid gap-3 sm:grid-cols-4">
                      <input
                        className="h-10 rounded-lg border border-slate-300 px-3 text-sm"
                        onChange={(event) => setPolicyCode(event.target.value)}
                        placeholder="Mã"
                        value={policyCode}
                      />
                      <input
                        className="h-10 rounded-lg border border-slate-300 px-3 text-sm"
                        onChange={(event) => setPolicyName(event.target.value)}
                        placeholder="Tên"
                        value={policyName}
                      />
                      <select
                        className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm"
                        onChange={(event) =>
                          setPolicyType(event.target.value as "SALE" | "AGENCY")
                        }
                        value={policyType}
                      >
                        <option value="SALE">Kinh doanh</option>
                        <option value="AGENCY">Đại lý</option>
                      </select>
                      <input
                        className="h-10 rounded-lg border border-slate-300 px-3 text-sm"
                        onChange={(event) => setPolicyRate(event.target.value)}
                        placeholder="Tỷ lệ (điểm cơ bản)"
                        type="number"
                        value={policyRate}
                      />
                    </div>
                    <button
                      className="h-10 rounded-lg bg-teal-700 px-4 text-sm font-medium text-white disabled:opacity-60"
                      disabled={isSaving}
                      type="submit"
                    >
                      Lưu chính sách
                    </button>
                  </form>
                )}
              </>
            ) : (
              <div className="rounded-lg bg-slate-100 p-4 text-sm text-slate-600">
                Vai trò này chỉ được xem cấu hình thành viên kênh.
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold">Đại lý</h3>
                <span className="text-xs text-slate-500">
                  {agencies.length} bản ghi
                </span>
              </div>
              <div className="mt-3 max-h-72 divide-y divide-slate-200 overflow-auto border-y border-slate-200">
                {agencies.map((agency) => (
                  <div className="py-3" key={agency.id}>
                    <p className="text-sm font-semibold">
                      {agency.code} / {agency.name}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {formatStatusCodeVi(agency.status)} /{" "}
                      {(agency.channelParticipant?.commissionRateBps ??
                        agency.defaultRateBps) / 100}
                      % / {agency._count.activationOrders} đơn hàng
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Thành viên:{" "}
                      {agency.members
                        .map(
                          (member) =>
                            member.user.profile?.displayName ??
                            member.user.email,
                        )
                        .join(", ") || "Không có"}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-base font-semibold">Người dùng</h3>
                  <span className="text-xs text-slate-500">
                    {users.length}/{userTotal} đã tải
                  </span>
                </div>
                <div className="grid gap-2 sm:grid-cols-[minmax(160px,1fr)_120px_120px_auto]">
                  <input
                    className="h-9 rounded-lg border border-slate-300 px-3 text-sm"
                    onChange={(event) => setUserSearchInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        setUserSearch(userSearchInput);
                      }
                    }}
                    placeholder="Email, tên hoặc mã"
                    value={userSearchInput}
                  />
                  <select
                    className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-sm"
                    onChange={(event) =>
                      setUserRole(event.target.value as "ALL" | Role)
                    }
                    value={userRole}
                  >
                    <option value="ALL">Tất cả vai trò</option>
                    {(Object.keys(roleLabels) as Role[]).map((item) => (
                      <option key={item} value={item}>
                        {formatRoleCodeVi(item)}
                      </option>
                    ))}
                  </select>
                  <select
                    className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-sm"
                    onChange={(event) =>
                      setUserStatus(
                        event.target.value as
                          "ALL" | "ACTIVE" | "SUSPENDED" | "DELETED",
                      )
                    }
                    value={userStatus}
                  >
                    <option value="ALL">Tất cả trạng thái</option>
                    <option value="ACTIVE">Đang hoạt động</option>
                    <option value="SUSPENDED">Tạm khóa</option>
                    <option value="DELETED">Đã xóa</option>
                  </select>
                  <button
                    className="h-9 rounded-lg bg-slate-950 px-3 text-sm font-medium text-white disabled:opacity-60"
                    disabled={isLoadingUsers}
                    onClick={() => setUserSearch(userSearchInput)}
                    type="button"
                  >
                    Tìm kiếm
                  </button>
                </div>
              </div>
              <div className="mt-3 max-h-80 divide-y divide-slate-200 overflow-auto border-y border-slate-200">
                {users.map((item) => {
                  const roles = item.roles
                    .map((entry) => formatRoleCodeVi(entry.role.name))
                    .join(", ");
                  return (
                    <div className="py-3" key={item.id}>
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="text-sm font-medium">
                            {item.profile?.displayName ?? item.email}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {item.email} / {formatStatusCodeVi(item.status)} /{" "}
                            {roles}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {item.channelParticipant
                              ? `${item.channelParticipant.code} / ${item.channelParticipant.commissionRateBps ?? 0} điểm cơ bản / lương ${formatMoney(item.channelParticipant.baseSalaryCents ?? 0, "VND")}`
                              : item.agencyMemberships
                                  .map((member) => member.agency.code)
                                  .join(", ") || "Chưa có thành viên kênh"}
                          </p>
                        </div>
                        {canManageMembers && item.status !== "DELETED" && (
                          <div className="flex gap-2">
                            <button
                              className="h-8 rounded-lg border border-slate-200 px-3 text-xs font-medium"
                              disabled={isSaving || item.status === "ACTIVE"}
                              onClick={() =>
                                void updateUserStatus(item.id, "ACTIVE")
                              }
                              type="button"
                            >
                              Kích hoạt
                            </button>
                            <button
                              className="h-8 rounded-lg border border-rose-200 px-3 text-xs font-medium text-rose-700"
                              disabled={isSaving || item.status === "SUSPENDED"}
                              onClick={() => {
                                setSuspendModal({ userId: item.id });
                                setSuspendReasonInput("");
                              }}
                              type="button"
                            >
                              Tạm khóa
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              {nextUserCursor && (
                <button
                  className="mt-3 h-9 rounded-lg border border-slate-200 px-3 text-sm font-medium disabled:opacity-60"
                  disabled={isLoadingUsers}
                  onClick={() => void loadUsersPage(nextUserCursor, true)}
                  type="button"
                >
                  {isLoadingUsers ? "Đang tải..." : "Tải thêm"}
                </button>
              )}
            </div>

            <div>
              <h3 className="text-base font-semibold">Chính sách hoa hồng</h3>
              <div className="mt-3 divide-y divide-slate-200 border-y border-slate-200">
                {policies.map((policy) => (
                  <div className="py-3" key={policy.id}>
                    <p className="text-sm font-medium">
                      {policy.code} / {formatRoleCodeVi(policy.beneficiaryType)}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {formatDataTextVi(policy.name)} / {policy.rateBps / 100}%
                      / lương {formatMoney(policy.baseSalaryCents, "VND")} /{" "}
                      {policy.isActive ? "Đang hoạt động" : "Ngừng hoạt động"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Suspend reason modal */}
      {suspendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setSuspendModal(null)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="font-semibold text-slate-900 mb-1">
              Tạm khóa người dùng?
            </h3>
            <p className="text-sm text-slate-500 mb-4">
              Bạn có thể nhập lý do; nội dung sẽ được lưu trong nhật ký kiểm
              toán.
            </p>
            <textarea
              rows={3}
              value={suspendReasonInput}
              onChange={(e) => setSuspendReasonInput(e.target.value)}
              placeholder="Lý do tạm khóa (không bắt buộc)"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-slate-400 mb-4"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setSuspendModal(null)}
                className="px-4 py-2 text-sm border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  void updateUserStatus(
                    suspendModal.userId,
                    "SUSPENDED",
                    suspendReasonInput.trim() || undefined,
                  );
                  setSuspendModal(null);
                }}
                className="px-4 py-2 text-sm bg-rose-700 text-white rounded-lg hover:bg-rose-800 font-medium"
              >
                Tạm khóa
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
