"use client";

import {
  Building2,
  KeyRound,
  RefreshCw,
  Search,
  ShieldCheck,
  UserPlus,
  Users,
} from "lucide-react";
import { FormEvent, useCallback, useEffect, useState } from "react";
import {
  adminJson,
  formatDate,
  formatMoney,
  formatRoleVi,
  formatStatusVi,
} from "../_lib/admin-client";
import {
  adminChannelRoles,
  hasAllowedRole,
  useStoredAdminSession,
} from "../_lib/admin-session";

type ChannelAdminSummary = {
  agencies: number;
  activeAgencies: number;
  saleUsers: number;
  activeMembers: number;
  policies: number;
  learners: number;
};

type AgencyAdmin = {
  id: string;
  code: string;
  name: string;
  status: "ACTIVE" | "SUSPENDED";
  defaultRateBps: number;
  notes?: string | null;
  channelParticipant?: {
    commissionRateBps?: number | null;
  } | null;
  _count: {
    activationOrders: number;
    commissions: number;
    payoutRequests: number;
  };
  members: Array<{
    id: string;
    role: "OWNER" | "MANAGER" | "SALE";
    title?: string | null;
    referralCode?: string | null;
    rateBps?: number | null;
    isActive: boolean;
    user: {
      email: string;
      profile?: {
        displayName?: string;
      };
    };
  }>;
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
      name: string;
    };
  }>;
  agencyMemberships: Array<{
    role: "OWNER" | "MANAGER" | "SALE";
    title?: string | null;
    referralCode?: string | null;
    rateBps?: number | null;
    agency: {
      code: string;
      name: string;
    };
  }>;
  channelParticipant?: {
    code: string;
    commissionRateBps?: number | null;
    baseSalaryCents?: number | null;
  } | null;
  subscriptions: Array<{
    status: string;
    currentPeriodEnd?: string;
  }>;
};

type ChannelUserPage = {
  items: ChannelUser[];
  total: number;
  nextCursor?: string | null;
};

type ChannelAccountRole = "SALE" | "AGENCY_OWNER" | "AGENCY_MANAGER";
type AgencyMemberRole = "SALE" | "MANAGER" | "OWNER";
type EditableAgencyMember = AgencyAdmin["members"][number] & {
  agencyId: string;
  agencyCode: string;
  agencyName: string;
};

function randomIndex(max: number) {
  if (max <= 0) {
    return 0;
  }

  if (typeof crypto !== "undefined") {
    const values = new Uint32Array(1);
    crypto.getRandomValues(values);
    return values[0] % max;
  }

  return Math.floor(Math.random() * max);
}

function buildTemporaryPassword(length = 14) {
  const sets = [
    "ABCDEFGHJKLMNPQRSTUVWXYZ",
    "abcdefghijkmnopqrstuvwxyz",
    "23456789",
    "!@#$%&*?",
  ];
  const allChars = sets.join("");
  const chars = sets.map((set) => set[randomIndex(set.length)]);

  while (chars.length < length) {
    chars.push(allChars[randomIndex(allChars.length)]);
  }

  for (let index = chars.length - 1; index > 0; index -= 1) {
    const nextIndex = randomIndex(index + 1);
    [chars[index], chars[nextIndex]] = [chars[nextIndex], chars[index]];
  }

  return chars.join("");
}

export default function ChannelPage() {
  const { loaded, roles } = useStoredAdminSession();
  const [summary, setSummary] = useState<ChannelAdminSummary | null>(null);
  const [agencies, setAgencies] = useState<AgencyAdmin[]>([]);
  const [policies, setPolicies] = useState<CommissionPolicyAdmin[]>([]);
  const [users, setUsers] = useState<ChannelUser[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [selectedAgencyId, setSelectedAgencyId] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<
    "ALL" | "ACTIVE" | "SUSPENDED" | "DELETED"
  >("ALL");
  const [role, setRole] = useState<string>("ALL");
  const [message, setMessage] = useState("Đang tải không gian quản lý kênh...");
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [suspendUser, setSuspendUser] = useState<ChannelUser | null>(null);
  const [suspendReason, setSuspendReason] = useState("");
  const [resetPasswordUser, setResetPasswordUser] =
    useState<ChannelUser | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [editingAgency, setEditingAgency] = useState<AgencyAdmin | null>(null);
  const [editAgencyName, setEditAgencyName] = useState("");
  const [editAgencyStatus, setEditAgencyStatus] = useState<
    "ACTIVE" | "SUSPENDED"
  >("ACTIVE");
  const [editAgencyRate, setEditAgencyRate] = useState("0");
  const [editAgencyNotes, setEditAgencyNotes] = useState("");
  const [editingPolicy, setEditingPolicy] =
    useState<CommissionPolicyAdmin | null>(null);
  const [editPolicyName, setEditPolicyName] = useState("");
  const [editPolicyRate, setEditPolicyRate] = useState("0");
  const [editPolicyBaseSalary, setEditPolicyBaseSalary] = useState("0");
  const [editPolicyDefault, setEditPolicyDefault] = useState(false);
  const [editPolicyActive, setEditPolicyActive] = useState(true);
  const [editingMember, setEditingMember] =
    useState<EditableAgencyMember | null>(null);
  const [editMemberRole, setEditMemberRole] =
    useState<AgencyMemberRole>("SALE");
  const [editMemberTitle, setEditMemberTitle] = useState("");
  const [editMemberReferralCode, setEditMemberReferralCode] = useState("");
  const [editMemberRate, setEditMemberRate] = useState("0");
  const [editMemberActive, setEditMemberActive] = useState(true);
  const [agencyCode, setAgencyCode] = useState("");
  const [agencyName, setAgencyName] = useState("");
  const [agencyRate, setAgencyRate] = useState("1500");
  const [agencyNotes, setAgencyNotes] = useState("");
  const [accountEmail, setAccountEmail] = useState("");
  const [accountPassword, setAccountPassword] = useState(() =>
    buildTemporaryPassword(),
  );
  const [accountName, setAccountName] = useState("");
  const [accountRole, setAccountRole] = useState<ChannelAccountRole>("SALE");
  const [accountAgencyCode, setAccountAgencyCode] = useState("");
  const [accountReferralCode, setAccountReferralCode] = useState("");
  const [accountRateBps, setAccountRateBps] = useState("1000");
  const [accountBaseSalary, setAccountBaseSalary] = useState("8000000");
  const [memberEmail, setMemberEmail] = useState("");
  const [memberRole, setMemberRole] = useState<AgencyMemberRole>("SALE");
  const [memberTitle, setMemberTitle] = useState("");
  const [memberReferralCode, setMemberReferralCode] = useState("");
  const [memberRate, setMemberRate] = useState("1000");
  const [policyCode, setPolicyCode] = useState("default-sale-10");
  const [policyName, setPolicyName] = useState(
    "Hoa hồng kinh doanh mặc định 10%",
  );
  const [policyType, setPolicyType] = useState<"SALE" | "AGENCY">("SALE");
  const [policyRate, setPolicyRate] = useState("1000");
  const [policyBaseSalary, setPolicyBaseSalary] = useState("0");
  const [policyIsDefault, setPolicyIsDefault] = useState(true);
  const [policyIsActive, setPolicyIsActive] = useState(true);

  const canViewChannel = hasAllowedRole(roles, adminChannelRoles);
  const canManageGlobal =
    roles.includes("ADMIN") || roles.includes("OPERATIONS");
  const canManageScopedMembers =
    roles.includes("AGENCY_OWNER") || roles.includes("AGENCY_MANAGER");
  const canManageMembers = canManageGlobal || canManageScopedMembers;
  const effectiveAccountRole: ChannelAccountRole = canManageGlobal
    ? accountRole
    : "SALE";
  const effectiveMemberRole: AgencyMemberRole = canManageGlobal
    ? memberRole
    : "SALE";

  const loadStatic = useCallback(async () => {
    const [summaryData, agenciesData, policiesData] = await Promise.all([
      adminJson<ChannelAdminSummary>(
        "/channel-admin/summary",
        undefined,
        "Không thể tải tổng quan kênh.",
      ),
      adminJson<AgencyAdmin[]>(
        "/channel-admin/agencies",
        undefined,
        "Không thể tải danh sách đại lý.",
      ),
      adminJson<CommissionPolicyAdmin[]>(
        "/channel-admin/commission-policies",
        undefined,
        "Không thể tải chính sách hoa hồng.",
      ),
    ]);

    setSummary(summaryData);
    setAgencies(agenciesData);
    setPolicies(policiesData);
    setSelectedAgencyId((current) =>
      agenciesData.some((agency) => agency.id === current)
        ? current
        : (agenciesData[0]?.id ?? ""),
    );
  }, []);

  const loadUsers = useCallback(
    async (cursor?: string, append = false) => {
      const setLoadingState = append ? setIsLoadingMore : setIsLoading;
      setLoadingState(true);

      try {
        const params = new URLSearchParams({ limit: "20" });
        if (search.trim()) {
          params.set("q", search.trim());
        }
        if (status !== "ALL") {
          params.set("status", status);
        }
        if (role !== "ALL") {
          params.set("role", role);
        }
        if (cursor) {
          params.set("cursor", cursor);
        }

        const page = await adminJson<ChannelUserPage>(
          `/channel-admin/users?${params.toString()}`,
          undefined,
          "Không thể tải danh sách người dùng.",
        );

        setUsers((current) =>
          append ? [...current, ...page.items] : page.items,
        );
        setTotalUsers(page.total);
        setNextCursor(page.nextCursor ?? null);
        setMessage(
          append
            ? "Đã tải thêm người dùng."
            : `Đã tải ${page.items.length} người dùng.`,
        );
      } catch (error) {
        setMessage(
          error instanceof Error
            ? error.message
            : "Không thể tải danh sách người dùng.",
        );
      } finally {
        setLoadingState(false);
      }
    },
    [role, search, status],
  );

  useEffect(() => {
    if (!loaded || !canViewChannel) {
      return;
    }

    const timer = window.setTimeout(() => {
      setIsLoading(true);
      setMessage("Đang tải không gian quản lý kênh...");
      void (async () => {
        try {
          await loadStatic();
          await loadUsers();
        } catch (error) {
          setMessage(
            error instanceof Error
              ? error.message
              : "Không thể tải không gian quản lý kênh.",
          );
          setIsLoading(false);
        }
      })();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [canViewChannel, loadStatic, loadUsers, loaded]);

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

  async function refreshChannel() {
    setMessage("Đang tải không gian quản lý kênh...");
    await loadStatic();
    await loadUsers();
  }

  async function updateUserStatus(
    userId: string,
    nextStatus: "ACTIVE" | "SUSPENDED",
    reason?: string,
  ) {
    setIsSaving(true);
    try {
      await adminJson(
        `/channel-admin/users/${userId}/status`,
        {
          method: "PATCH",
          body: JSON.stringify({
            status: nextStatus,
            ...(reason ? { reason } : {}),
          }),
        },
        "Không thể cập nhật trạng thái người dùng.",
      );
      setSuspendUser(null);
      setSuspendReason("");
      await loadStatic();
      await loadUsers();
      setMessage("Đã cập nhật trạng thái người dùng.");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Không thể cập nhật trạng thái người dùng.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function resetUserPassword(userId: string) {
    if (newPassword.trim().length < 8) {
      setMessage("Mật khẩu phải có ít nhất 8 ký tự.");
      return;
    }

    setIsSaving(true);
    try {
      await adminJson(
        `/channel-admin/users/${userId}/reset-password`,
        {
          method: "POST",
          body: JSON.stringify({ password: newPassword.trim() }),
        },
        "Không thể đặt lại mật khẩu.",
      );
      setResetPasswordUser(null);
      setNewPassword("");
      await loadUsers();
      setMessage("Đã đặt lại mật khẩu.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Không thể đặt lại mật khẩu.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  function openResetPasswordModal(user: ChannelUser) {
    setResetPasswordUser(user);
    setNewPassword(buildTemporaryPassword());
  }

  async function copyTemporaryPassword() {
    if (!newPassword) {
      return;
    }

    try {
      if (typeof navigator === "undefined" || !navigator.clipboard) {
        throw new Error("Trình duyệt này không cho phép truy cập bộ nhớ tạm.");
      }

      await navigator.clipboard.writeText(newPassword);
      setMessage("Đã sao chép mật khẩu tạm. Hãy gửi qua kênh an toàn.");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Không thể sao chép mật khẩu tạm.",
      );
    }
  }

  function openAgencyEditor(agency: AgencyAdmin) {
    setEditingAgency(agency);
    setEditAgencyName(agency.name);
    setEditAgencyStatus(agency.status);
    setEditAgencyRate(String(agency.defaultRateBps));
    setEditAgencyNotes(agency.notes ?? "");
  }

  async function saveAgencyEdits() {
    if (!editingAgency) {
      return;
    }

    setIsSaving(true);
    try {
      await adminJson(
        `/channel-admin/agencies/${editingAgency.id}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            name: editAgencyName,
            status: editAgencyStatus,
            defaultRateBps: Number(editAgencyRate),
            notes: editAgencyNotes,
          }),
        },
        "Không thể cập nhật đại lý.",
      );
      setEditingAgency(null);
      await loadStatic();
      await loadUsers();
      setMessage("Đã cập nhật đại lý.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Không thể cập nhật đại lý.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  function openPolicyEditor(policy: CommissionPolicyAdmin) {
    setEditingPolicy(policy);
    setEditPolicyName(policy.name);
    setEditPolicyRate(String(policy.rateBps));
    setEditPolicyBaseSalary(String(Math.floor(policy.baseSalaryCents / 100)));
    setEditPolicyDefault(
      policy.beneficiaryType === "SALE"
        ? policy.isDefaultForSale
        : policy.isDefaultForAgency,
    );
    setEditPolicyActive(policy.isActive);
  }

  async function savePolicyEdits() {
    if (!editingPolicy) {
      return;
    }

    setIsSaving(true);
    try {
      await adminJson(
        `/channel-admin/commission-policies/${editingPolicy.id}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            name: editPolicyName,
            rateBps: Number(editPolicyRate),
            baseSalaryVnd: Number(editPolicyBaseSalary),
            isDefaultForSale:
              editingPolicy.beneficiaryType === "SALE"
                ? editPolicyDefault
                : false,
            isDefaultForAgency:
              editingPolicy.beneficiaryType === "AGENCY"
                ? editPolicyDefault
                : false,
            isActive: editPolicyActive,
          }),
        },
        "Không thể cập nhật chính sách hoa hồng.",
      );
      setEditingPolicy(null);
      await loadStatic();
      setMessage("Đã cập nhật chính sách hoa hồng.");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Không thể cập nhật chính sách hoa hồng.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  function openMemberEditor(
    agency: AgencyAdmin,
    member: AgencyAdmin["members"][number],
  ) {
    setEditingMember({
      ...member,
      agencyId: agency.id,
      agencyCode: agency.code,
      agencyName: agency.name,
    });
    setEditMemberRole(member.role);
    setEditMemberTitle(member.title ?? "");
    setEditMemberReferralCode(member.referralCode ?? "");
    setEditMemberRate(String(member.rateBps ?? 0));
    setEditMemberActive(member.isActive);
  }

  async function saveMemberEdits() {
    if (!editingMember) {
      return;
    }

    setIsSaving(true);
    try {
      await adminJson(
        `/channel-admin/members/${editingMember.id}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            memberRole: editMemberRole,
            title: editMemberTitle.trim(),
            referralCode: editMemberReferralCode.trim(),
            rateBps: Number(editMemberRate),
            isActive: editMemberActive,
          }),
        },
        "Không thể cập nhật thành viên đại lý.",
      );
      setEditingMember(null);
      await loadStatic();
      await loadUsers();
      setMessage("Đã cập nhật thành viên đại lý.");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Không thể cập nhật thành viên đại lý.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function createAgency(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canManageGlobal) {
      return;
    }

    setIsSaving(true);
    try {
      await adminJson(
        "/channel-admin/agencies",
        {
          method: "POST",
          body: JSON.stringify({
            code: agencyCode,
            name: agencyName,
            defaultRateBps: Number(agencyRate),
            ...(agencyNotes.trim() ? { notes: agencyNotes.trim() } : {}),
          }),
        },
        "Không thể tạo đại lý.",
      );
      await loadStatic();
      await loadUsers();
      setAgencyCode("");
      setAgencyName("");
      setAgencyRate("1500");
      setAgencyNotes("");
      setMessage("Đã tạo đại lý.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Không thể tạo đại lý.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function createChannelAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canManageMembers) {
      return;
    }
    if (
      canManageGlobal &&
      effectiveAccountRole !== "SALE" &&
      !accountAgencyCode.trim()
    ) {
      setMessage(
        "Tài khoản chủ hoặc quản lý đại lý bắt buộc phải có mã đại lý.",
      );
      return;
    }

    setIsSaving(true);
    try {
      await adminJson(
        "/channel-admin/sale-users",
        {
          method: "POST",
          body: JSON.stringify({
            email: accountEmail,
            password: accountPassword,
            displayName: accountName,
            role: effectiveAccountRole,
            ...(canManageGlobal && accountAgencyCode.trim()
              ? { agencyCode: accountAgencyCode.trim() }
              : {}),
            ...(accountReferralCode.trim()
              ? { referralCode: accountReferralCode.trim() }
              : {}),
            ...(effectiveAccountRole === "SALE"
              ? { rateBps: Number(accountRateBps) }
              : {}),
            ...(effectiveAccountRole === "SALE"
              ? { baseSalaryVnd: Number(accountBaseSalary) }
              : {}),
          }),
        },
        "Không thể tạo tài khoản kênh.",
      );
      await loadStatic();
      await loadUsers();
      setAccountEmail("");
      setAccountPassword(buildTemporaryPassword());
      setAccountName("");
      setAccountRole("SALE");
      setAccountAgencyCode("");
      setAccountReferralCode("");
      setAccountRateBps("1000");
      setAccountBaseSalary("8000000");
      setMessage("Đã tạo tài khoản kênh.");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Không thể tạo tài khoản kênh.",
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
    try {
      await adminJson(
        `/channel-admin/agencies/${selectedAgencyId}/members`,
        {
          method: "POST",
          body: JSON.stringify({
            saleEmail: memberEmail,
            memberRole: effectiveMemberRole,
            ...(memberTitle.trim() ? { title: memberTitle.trim() } : {}),
            ...(memberReferralCode.trim()
              ? { referralCode: memberReferralCode.trim() }
              : {}),
            rateBps: Number(memberRate),
          }),
        },
        "Không thể gán thành viên.",
      );
      await loadStatic();
      await loadUsers();
      setMemberEmail("");
      setMemberRole("SALE");
      setMemberTitle("");
      setMemberReferralCode("");
      setMemberRate("1000");
      setMessage("Đã gán thành viên đại lý.");
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
    try {
      await adminJson(
        "/channel-admin/commission-policies",
        {
          method: "POST",
          body: JSON.stringify({
            code: policyCode,
            name: policyName,
            beneficiaryType: policyType,
            rateBps: Number(policyRate),
            baseSalaryVnd: Number(policyBaseSalary),
            isDefaultForSale: policyType === "SALE" ? policyIsDefault : false,
            isDefaultForAgency:
              policyType === "AGENCY" ? policyIsDefault : false,
            isActive: policyIsActive,
          }),
        },
        "Không thể lưu chính sách hoa hồng.",
      );
      await loadStatic();
      setMessage("Đã lưu chính sách hoa hồng.");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Không thể lưu chính sách hoa hồng.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  function onSearchSubmit(event: FormEvent) {
    event.preventDefault();
    setSearch(searchInput);
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
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <ShieldCheck size={18} />
              Thiết lập và quản trị
            </div>
            <p className="mt-2 text-sm text-slate-500">
              {canManageGlobal
                ? "Tạo đại lý, cấp tài khoản kênh, gán thành viên và quản lý quy tắc hoa hồng mặc định."
                : canManageScopedMembers
                  ? "Tạo tài khoản kinh doanh, gán mã giới thiệu và quản lý nhân viên trong phạm vi đại lý."
                  : "Xem cấu trúc đại lý và thiết lập kênh trong phạm vi hiện tại."}
            </p>

            {canManageMembers ? (
              <div className="mt-5 space-y-5">
                {canManageGlobal && (
                  <form className="space-y-3" onSubmit={createAgency}>
                    <h2 className="text-base font-semibold text-slate-950">
                      Tạo đại lý
                    </h2>
                    <div className="grid gap-3 sm:grid-cols-3">
                      <input
                        className="h-10 rounded-xl border border-slate-200 px-3 text-sm"
                        onChange={(event) => setAgencyCode(event.target.value)}
                        placeholder="Mã đại lý"
                        required
                        value={agencyCode}
                      />
                      <input
                        className="h-10 rounded-xl border border-slate-200 px-3 text-sm"
                        onChange={(event) => setAgencyName(event.target.value)}
                        placeholder="Tên đại lý"
                        required
                        value={agencyName}
                      />
                      <input
                        className="h-10 rounded-xl border border-slate-200 px-3 text-sm"
                        onChange={(event) => setAgencyRate(event.target.value)}
                        placeholder="Tỷ lệ mặc định (điểm cơ bản)"
                        required
                        type="number"
                        value={agencyRate}
                      />
                    </div>
                    <textarea
                      className="min-h-24 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none placeholder:text-slate-400"
                      onChange={(event) => setAgencyNotes(event.target.value)}
                      placeholder="Ghi chú đại lý hoặc phạm vi hoạt động"
                      value={agencyNotes}
                    />
                    <button
                      className="h-10 rounded-xl bg-slate-950 px-4 text-sm font-medium text-white disabled:opacity-60"
                      disabled={isSaving}
                      type="submit"
                    >
                      Tạo đại lý
                    </button>
                  </form>
                )}

                <form
                  className="space-y-3 border-t border-slate-200 pt-5"
                  onSubmit={createChannelAccount}
                >
                  <div className="flex items-center gap-2 text-base font-semibold text-slate-950">
                    <UserPlus size={18} />
                    Tạo tài khoản kênh
                  </div>
                  {!canManageGlobal && (
                    <p className="text-sm text-slate-500">
                      Tài khoản tạo tại đây luôn là tài khoản kinh doanh và tự
                      động thuộc phạm vi đại lý đang hoạt động của bạn.
                    </p>
                  )}
                  <p className="text-sm text-slate-500">
                    Mật khẩu tạm được tạo tự động cho mỗi tài khoản mới. Hãy tạo
                    lại trước khi gửi nếu cần bàn giao mật khẩu mới.
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <input
                      className="h-10 rounded-xl border border-slate-200 px-3 text-sm"
                      onChange={(event) => setAccountEmail(event.target.value)}
                      placeholder="Email"
                      required
                      type="email"
                      value={accountEmail}
                    />
                    <div className="grid gap-2">
                      <input
                        className="h-10 rounded-xl border border-slate-200 px-3 font-mono text-sm"
                        onChange={(event) =>
                          setAccountPassword(event.target.value)
                        }
                        placeholder="Mật khẩu tạm"
                        required
                        type="text"
                        value={accountPassword}
                      />
                      <button
                        className="justify-self-start text-xs font-medium text-teal-700 hover:text-teal-800"
                        onClick={() =>
                          setAccountPassword(buildTemporaryPassword())
                        }
                        type="button"
                      >
                        Tạo mật khẩu khác
                      </button>
                    </div>
                    <input
                      className="h-10 rounded-xl border border-slate-200 px-3 text-sm"
                      onChange={(event) => setAccountName(event.target.value)}
                      placeholder="Tên hiển thị"
                      required
                      value={accountName}
                    />
                    {canManageGlobal ? (
                      <select
                        className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm"
                        onChange={(event) =>
                          setAccountRole(
                            event.target.value as ChannelAccountRole,
                          )
                        }
                        value={accountRole}
                      >
                        <option value="SALE">Nhân viên kinh doanh</option>
                        <option value="AGENCY_OWNER">Chủ đại lý</option>
                        <option value="AGENCY_MANAGER">Quản lý đại lý</option>
                      </select>
                    ) : (
                      <input
                        className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-500"
                        readOnly
                        value="Nhân viên kinh doanh (thuộc phạm vi đại lý của bạn)"
                      />
                    )}
                    <input
                      className="h-10 rounded-xl border border-slate-200 px-3 text-sm"
                      onChange={(event) =>
                        setAccountReferralCode(event.target.value)
                      }
                      placeholder="Mã giới thiệu (không bắt buộc)"
                      value={accountReferralCode}
                    />
                    {effectiveAccountRole === "SALE" ? (
                      <input
                        className="h-10 rounded-xl border border-slate-200 px-3 text-sm"
                        onChange={(event) =>
                          setAccountRateBps(event.target.value)
                        }
                        placeholder="Tỷ lệ hoa hồng (điểm cơ bản)"
                        required
                        type="number"
                        value={accountRateBps}
                      />
                    ) : (
                      <input
                        className="h-10 rounded-xl border border-slate-200 px-3 text-sm"
                        onChange={(event) =>
                          setAccountAgencyCode(event.target.value)
                        }
                        placeholder="Mã đại lý"
                        required
                        value={accountAgencyCode}
                      />
                    )}
                    {effectiveAccountRole === "SALE" && (
                      <input
                        className="h-10 rounded-xl border border-slate-200 px-3 text-sm sm:col-span-2"
                        onChange={(event) =>
                          setAccountBaseSalary(event.target.value)
                        }
                        placeholder="Lương cơ bản (VNĐ)"
                        required
                        type="number"
                        value={accountBaseSalary}
                      />
                    )}
                  </div>
                  <button
                    className="h-10 rounded-xl bg-slate-950 px-4 text-sm font-medium text-white disabled:opacity-60"
                    disabled={isSaving}
                    type="submit"
                  >
                    Tạo tài khoản
                  </button>
                </form>

                <form
                  className="space-y-3 border-t border-slate-200 pt-5"
                  onSubmit={addMember}
                >
                  <h2 className="text-base font-semibold text-slate-950">
                    Gán thành viên vào đại lý
                  </h2>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <select
                      className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm"
                      onChange={(event) =>
                        setSelectedAgencyId(event.target.value)
                      }
                      value={selectedAgencyId}
                    >
                      {agencies.map((agency) => (
                        <option key={agency.id} value={agency.id}>
                          {agency.code} • {agency.name}
                        </option>
                      ))}
                    </select>
                    {canManageGlobal ? (
                      <select
                        className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm"
                        onChange={(event) =>
                          setMemberRole(event.target.value as AgencyMemberRole)
                        }
                        value={memberRole}
                      >
                        <option value="SALE">Nhân viên kinh doanh</option>
                        <option value="MANAGER">Quản lý</option>
                        <option value="OWNER">Chủ sở hữu</option>
                      </select>
                    ) : (
                      <input
                        className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-500"
                        readOnly
                        value="Thành viên kinh doanh"
                      />
                    )}
                    <input
                      className="h-10 rounded-xl border border-slate-200 px-3 text-sm"
                      onChange={(event) => setMemberEmail(event.target.value)}
                      placeholder="Email người dùng kênh"
                      required
                      type="email"
                      value={memberEmail}
                    />
                    <input
                      className="h-10 rounded-xl border border-slate-200 px-3 text-sm"
                      onChange={(event) => setMemberTitle(event.target.value)}
                      placeholder="Chức danh"
                      value={memberTitle}
                    />
                    <input
                      className="h-10 rounded-xl border border-slate-200 px-3 text-sm"
                      onChange={(event) =>
                        setMemberReferralCode(event.target.value)
                      }
                      placeholder="Mã giới thiệu (không bắt buộc)"
                      value={memberReferralCode}
                    />
                    <input
                      className="h-10 rounded-xl border border-slate-200 px-3 text-sm"
                      onChange={(event) => setMemberRate(event.target.value)}
                      placeholder="Tỷ lệ (điểm cơ bản)"
                      required
                      type="number"
                      value={memberRate}
                    />
                  </div>
                  <button
                    className="h-10 rounded-xl bg-teal-700 px-4 text-sm font-medium text-white disabled:opacity-60"
                    disabled={isSaving || agencies.length === 0}
                    type="submit"
                  >
                    Gán thành viên
                  </button>
                </form>

                {canManageGlobal && (
                  <form
                    className="space-y-3 border-t border-slate-200 pt-5"
                    onSubmit={upsertPolicy}
                  >
                    <h2 className="text-base font-semibold text-slate-950">
                      Chính sách hoa hồng
                    </h2>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <input
                        className="h-10 rounded-xl border border-slate-200 px-3 text-sm"
                        onChange={(event) => setPolicyCode(event.target.value)}
                        placeholder="Mã chính sách"
                        value={policyCode}
                      />
                      <input
                        className="h-10 rounded-xl border border-slate-200 px-3 text-sm"
                        onChange={(event) => setPolicyName(event.target.value)}
                        placeholder="Tên chính sách"
                        value={policyName}
                      />
                      <select
                        className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm"
                        onChange={(event) =>
                          setPolicyType(event.target.value as "SALE" | "AGENCY")
                        }
                        value={policyType}
                      >
                        <option value="SALE">Nhân viên kinh doanh</option>
                        <option value="AGENCY">Đại lý</option>
                      </select>
                      <input
                        className="h-10 rounded-xl border border-slate-200 px-3 text-sm"
                        onChange={(event) => setPolicyRate(event.target.value)}
                        placeholder="Tỷ lệ (điểm cơ bản)"
                        type="number"
                        value={policyRate}
                      />
                      <input
                        className="h-10 rounded-xl border border-slate-200 px-3 text-sm"
                        onChange={(event) =>
                          setPolicyBaseSalary(event.target.value)
                        }
                        placeholder="Lương cơ bản (VNĐ)"
                        type="number"
                        value={policyBaseSalary}
                      />
                      <div className="flex items-center gap-4 rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700">
                        <label className="flex items-center gap-2">
                          <input
                            checked={policyIsDefault}
                            onChange={(event) =>
                              setPolicyIsDefault(event.target.checked)
                            }
                            type="checkbox"
                          />
                          Đặt làm mặc định
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            checked={policyIsActive}
                            onChange={(event) =>
                              setPolicyIsActive(event.target.checked)
                            }
                            type="checkbox"
                          />
                          Đang hoạt động
                        </label>
                      </div>
                    </div>
                    <button
                      className="h-10 rounded-xl bg-teal-700 px-4 text-sm font-medium text-white disabled:opacity-60"
                      disabled={isSaving}
                      type="submit"
                    >
                      Lưu chính sách
                    </button>
                  </form>
                )}
              </div>
            ) : (
              <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                Vai trò này được xem cấu trúc kênh, nhưng thao tác thiết lập chỉ
                dành cho Quản trị viên và Vận hành.
              </div>
            )}
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <ShieldCheck size={18} />
              Các chính sách hoa hồng
            </div>
            <div className="mt-4 space-y-3">
              {policies.map((policy) => (
                <article
                  className="rounded-2xl border border-slate-200 p-4"
                  key={policy.id}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-950">
                        {policy.code} • {policy.name}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {policy.beneficiaryType} •{" "}
                        {(policy.rateBps / 100).toFixed(1)}% • lương{" "}
                        {formatMoney(policy.baseSalaryCents, "VND")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${policy.isActive ? "bg-teal-50 text-teal-700" : "bg-slate-100 text-slate-600"}`}
                      >
                        {policy.isActive ? "Đang hoạt động" : "Không hoạt động"}
                      </span>
                      {canManageGlobal && (
                        <button
                          className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                          onClick={() => openPolicyEditor(policy)}
                          type="button"
                        >
                          Chỉnh sửa
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    {policy.isDefaultForSale
                      ? "Chính sách kinh doanh mặc định"
                      : policy.isDefaultForAgency
                        ? "Chính sách đại lý mặc định"
                        : "Chính sách riêng"}
                  </p>
                </article>
              ))}
              {policies.length === 0 && (
                <div className="rounded-2xl bg-slate-50 px-4 py-6 text-sm text-slate-500">
                  Chưa cấu hình chính sách hoa hồng.
                </div>
              )}
            </div>
          </section>
        </div>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Building2 size={18} />
            Đại lý
          </div>
          <div className="mt-4 space-y-3">
            {agencies.map((agency) => (
              <article
                className="rounded-2xl border border-slate-200 p-4"
                key={agency.id}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">
                      {agency.code} • {agency.name}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {formatStatusVi(agency.status)} • tỷ lệ{" "}
                      {(
                        (agency.channelParticipant?.commissionRateBps ??
                          agency.defaultRateBps) / 100
                      ).toFixed(1)}
                      %
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                      {agency._count.activationOrders} đơn hàng
                    </span>
                    {canManageGlobal && (
                      <button
                        className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                        onClick={() => openAgencyEditor(agency)}
                        type="button"
                      >
                        Chỉnh sửa
                      </button>
                    )}
                  </div>
                </div>
                {agency.notes && (
                  <p className="mt-3 text-sm text-slate-500">{agency.notes}</p>
                )}
                <div className="mt-3 space-y-2">
                  {agency.members.length > 0 ? (
                    agency.members.map((member) => (
                      <div
                        className="flex items-start justify-between gap-3 rounded-2xl bg-slate-50 px-3 py-3"
                        key={member.id}
                      >
                        <div>
                          <p className="text-sm font-medium text-slate-800">
                            {member.user.profile?.displayName ??
                              member.user.email}{" "}
                            • {formatRoleVi(member.role)}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {member.user.email}
                            {member.title ? ` • ${member.title}` : ""}
                            {member.referralCode
                              ? ` • ${member.referralCode}`
                              : ""}
                            {member.rateBps != null
                              ? ` • ${(member.rateBps / 100).toFixed(1)}%`
                              : ""}
                            {member.isActive
                              ? " • đang hoạt động"
                              : " • không hoạt động"}
                          </p>
                        </div>
                        {canManageMembers &&
                          (canManageGlobal || member.role === "SALE") && (
                            <button
                              className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-white"
                              onClick={() => openMemberEditor(agency, member)}
                              type="button"
                            >
                              Sửa thành viên
                            </button>
                          )}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">
                      Thành viên: Chưa có
                    </p>
                  )}
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  {agency._count.commissions} dòng hoa hồng •{" "}
                  {agency._count.payoutRequests} khoản chi trả
                </p>
              </article>
            ))}
            {agencies.length === 0 && (
              <div className="rounded-2xl bg-slate-50 px-4 py-6 text-sm text-slate-500">
                Không có đại lý nào trong phạm vi này.
              </div>
            )}
          </div>
        </section>
      </div>

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
            const latestSubscription = user.subscriptions[0];
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

      {suspendUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setSuspendUser(null)}
          />
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
            <h2 className="text-lg font-semibold text-slate-950">
              Tạm khóa {suspendUser.profile?.displayName ?? suspendUser.email}?
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Có thể nhập lý do để bộ phận vận hành hiểu vì sao quyền truy cập
              bị tạm dừng.
            </p>
            <textarea
              className="mt-5 min-h-28 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none placeholder:text-slate-400"
              onChange={(event) => setSuspendReason(event.target.value)}
              placeholder="Lý do tạm khóa"
              value={suspendReason}
            />
            <div className="mt-5 flex justify-end gap-3">
              <button
                className="h-10 rounded-xl border border-slate-200 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
                onClick={() => setSuspendUser(null)}
                type="button"
              >
                Hủy
              </button>
              <button
                className="h-10 rounded-xl bg-rose-700 px-4 text-sm font-medium text-white hover:bg-rose-800 disabled:opacity-60"
                disabled={isSaving}
                onClick={() =>
                  void updateUserStatus(
                    suspendUser.id,
                    "SUSPENDED",
                    suspendReason.trim() || undefined,
                  )
                }
                type="button"
              >
                {isSaving ? "Đang lưu..." : "Xác nhận tạm khóa"}
              </button>
            </div>
          </div>
        </div>
      )}

      {resetPasswordUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => {
              setResetPasswordUser(null);
              setNewPassword("");
            }}
          />
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
            <h2 className="text-lg font-semibold text-slate-950">
              Đặt lại mật khẩu cho{" "}
              {resetPasswordUser.profile?.displayName ??
                resetPasswordUser.email}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Đã tạo mật khẩu tạm dùng một lần. Có thể tạo lại rồi gửi qua kênh
              vận hành an toàn.
            </p>
            <input
              className="mt-5 h-11 w-full rounded-2xl border border-slate-200 px-4 font-mono text-sm outline-none placeholder:text-slate-400"
              onChange={(event) => setNewPassword(event.target.value)}
              placeholder="Mật khẩu tạm"
              type="text"
              value={newPassword}
            />
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                className="h-10 rounded-xl border border-slate-200 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
                onClick={() => setNewPassword(buildTemporaryPassword())}
                type="button"
              >
                Tạo lại
              </button>
              <button
                className="h-10 rounded-xl border border-slate-200 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
                onClick={() => void copyTemporaryPassword()}
                type="button"
              >
                Sao chép mật khẩu
              </button>
            </div>
            <div className="mt-5 flex justify-end gap-3">
              <button
                className="h-10 rounded-xl border border-slate-200 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
                onClick={() => {
                  setResetPasswordUser(null);
                  setNewPassword("");
                }}
                type="button"
              >
                Hủy
              </button>
              <button
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
                disabled={isSaving}
                onClick={() => void resetUserPassword(resetPasswordUser.id)}
                type="button"
              >
                <KeyRound size={16} />
                {isSaving ? "Đang lưu..." : "Đặt lại mật khẩu"}
              </button>
            </div>
          </div>
        </div>
      )}

      {editingAgency && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setEditingAgency(null)}
          />
          <div className="relative w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl">
            <h2 className="text-lg font-semibold text-slate-950">
              Chỉnh sửa đại lý {editingAgency.code}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Cập nhật hồ sơ, trạng thái hoạt động và tỷ lệ hoa hồng mặc định
              ngay trong cổng.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <input
                className="h-11 rounded-2xl border border-slate-200 px-4 text-sm outline-none"
                onChange={(event) => setEditAgencyName(event.target.value)}
                placeholder="Tên đại lý"
                value={editAgencyName}
              />
              <select
                className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none"
                onChange={(event) =>
                  setEditAgencyStatus(
                    event.target.value as "ACTIVE" | "SUSPENDED",
                  )
                }
                value={editAgencyStatus}
              >
                <option value="ACTIVE">Đang hoạt động</option>
                <option value="SUSPENDED">Tạm khóa</option>
              </select>
              <input
                className="h-11 rounded-2xl border border-slate-200 px-4 text-sm outline-none"
                onChange={(event) => setEditAgencyRate(event.target.value)}
                placeholder="Tỷ lệ mặc định (điểm cơ bản)"
                type="number"
                value={editAgencyRate}
              />
              <input
                className="h-11 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-500 outline-none"
                readOnly
                value={editingAgency.code}
              />
            </div>
            <textarea
              className="mt-3 min-h-28 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none placeholder:text-slate-400"
              onChange={(event) => setEditAgencyNotes(event.target.value)}
              placeholder="Ghi chú đại lý"
              value={editAgencyNotes}
            />
            <div className="mt-5 flex justify-end gap-3">
              <button
                className="h-10 rounded-xl border border-slate-200 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
                onClick={() => setEditingAgency(null)}
                type="button"
              >
                Hủy
              </button>
              <button
                className="h-10 rounded-xl bg-slate-950 px-4 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
                disabled={isSaving}
                onClick={() => void saveAgencyEdits()}
                type="button"
              >
                {isSaving ? "Đang lưu..." : "Lưu đại lý"}
              </button>
            </div>
          </div>
        </div>
      )}

      {editingPolicy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setEditingPolicy(null)}
          />
          <div className="relative w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl">
            <h2 className="text-lg font-semibold text-slate-950">
              Chỉnh sửa chính sách hoa hồng {editingPolicy.code}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Điều chỉnh cơ chế chi trả mặc định cho{" "}
              {editingPolicy.beneficiaryType.toLowerCase()} mà không cần tạo
              chính sách mới.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <input
                className="h-11 rounded-2xl border border-slate-200 px-4 text-sm outline-none"
                onChange={(event) => setEditPolicyName(event.target.value)}
                placeholder="Tên chính sách"
                value={editPolicyName}
              />
              <input
                className="h-11 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-500 outline-none"
                readOnly
                value={`${editingPolicy.beneficiaryType} • ${editingPolicy.code}`}
              />
              <input
                className="h-11 rounded-2xl border border-slate-200 px-4 text-sm outline-none"
                onChange={(event) => setEditPolicyRate(event.target.value)}
                placeholder="Tỷ lệ (điểm cơ bản)"
                type="number"
                value={editPolicyRate}
              />
              <input
                className="h-11 rounded-2xl border border-slate-200 px-4 text-sm outline-none"
                onChange={(event) =>
                  setEditPolicyBaseSalary(event.target.value)
                }
                placeholder="Lương cơ bản (VNĐ)"
                type="number"
                value={editPolicyBaseSalary}
              />
            </div>
            <div className="mt-3 flex flex-wrap gap-4 rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700">
              <label className="flex items-center gap-2">
                <input
                  checked={editPolicyDefault}
                  onChange={(event) =>
                    setEditPolicyDefault(event.target.checked)
                  }
                  type="checkbox"
                />
                Mặc định cho {editingPolicy.beneficiaryType.toLowerCase()}
              </label>
              <label className="flex items-center gap-2">
                <input
                  checked={editPolicyActive}
                  onChange={(event) =>
                    setEditPolicyActive(event.target.checked)
                  }
                  type="checkbox"
                />
                Đang hoạt động
              </label>
            </div>
            <div className="mt-5 flex justify-end gap-3">
              <button
                className="h-10 rounded-xl border border-slate-200 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
                onClick={() => setEditingPolicy(null)}
                type="button"
              >
                Hủy
              </button>
              <button
                className="h-10 rounded-xl bg-teal-700 px-4 text-sm font-medium text-white hover:bg-teal-800 disabled:opacity-60"
                disabled={isSaving}
                onClick={() => void savePolicyEdits()}
                type="button"
              >
                {isSaving ? "Đang lưu..." : "Lưu chính sách"}
              </button>
            </div>
          </div>
        </div>
      )}

      {editingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setEditingMember(null)}
          />
          <div className="relative w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl">
            <h2 className="text-lg font-semibold text-slate-950">
              Chỉnh sửa thành viên đại lý
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              {editingMember.user.profile?.displayName ??
                editingMember.user.email}{" "}
              trong {editingMember.agencyCode} • {editingMember.agencyName}
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {canManageGlobal ? (
                <select
                  className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none"
                  onChange={(event) =>
                    setEditMemberRole(event.target.value as AgencyMemberRole)
                  }
                  value={editMemberRole}
                >
                  <option value="SALE">Nhân viên kinh doanh</option>
                  <option value="MANAGER">Quản lý</option>
                  <option value="OWNER">Chủ sở hữu</option>
                </select>
              ) : (
                <input
                  className="h-11 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-500 outline-none"
                  readOnly
                  value="Thành viên kinh doanh"
                />
              )}
              <input
                className="h-11 rounded-2xl border border-slate-200 px-4 text-sm outline-none"
                onChange={(event) => setEditMemberRate(event.target.value)}
                placeholder="Tỷ lệ (điểm cơ bản)"
                type="number"
                value={editMemberRate}
              />
              <input
                className="h-11 rounded-2xl border border-slate-200 px-4 text-sm outline-none"
                onChange={(event) => setEditMemberTitle(event.target.value)}
                placeholder="Chức danh"
                value={editMemberTitle}
              />
              <input
                className="h-11 rounded-2xl border border-slate-200 px-4 text-sm outline-none"
                onChange={(event) =>
                  setEditMemberReferralCode(event.target.value)
                }
                placeholder="Mã giới thiệu"
                value={editMemberReferralCode}
              />
            </div>
            <label className="mt-3 flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700">
              <input
                checked={editMemberActive}
                onChange={(event) => setEditMemberActive(event.target.checked)}
                type="checkbox"
              />
              Thành viên đang hoạt động
            </label>
            <div className="mt-5 flex justify-end gap-3">
              <button
                className="h-10 rounded-xl border border-slate-200 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
                onClick={() => setEditingMember(null)}
                type="button"
              >
                Hủy
              </button>
              <button
                className="h-10 rounded-xl bg-slate-950 px-4 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
                disabled={isSaving}
                onClick={() => void saveMemberEdits()}
                type="button"
              >
                {isSaving ? "Đang lưu..." : "Lưu thành viên"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
