import { FormEvent, useCallback, useEffect, useState } from "react";
import { adminJson } from "../../_lib/admin-client";
import { adminChannelRoles, hasAllowedRole, useStoredAdminSession } from "../../_lib/admin-session";
import { buildTemporaryPassword } from "./shared";
import type { AgencyAdmin, AgencyMemberRole, ChannelAccountRole, ChannelAdminSummary, ChannelUser, ChannelUserPage, CommissionPolicyAdmin, EditableAgencyMember } from "./shared";

/** State, effects and handlers of ChannelPage, moved verbatim from page.tsx. */
export function useChannelPageState() {
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

  return {
    loaded,
    roles,
    summary,
    setSummary,
    agencies,
    setAgencies,
    policies,
    setPolicies,
    users,
    setUsers,
    totalUsers,
    setTotalUsers,
    nextCursor,
    setNextCursor,
    selectedAgencyId,
    setSelectedAgencyId,
    searchInput,
    setSearchInput,
    search,
    setSearch,
    status,
    setStatus,
    role,
    setRole,
    message,
    setMessage,
    isLoading,
    setIsLoading,
    isLoadingMore,
    setIsLoadingMore,
    isSaving,
    setIsSaving,
    suspendUser,
    setSuspendUser,
    suspendReason,
    setSuspendReason,
    resetPasswordUser,
    setResetPasswordUser,
    newPassword,
    setNewPassword,
    editingAgency,
    setEditingAgency,
    editAgencyName,
    setEditAgencyName,
    editAgencyStatus,
    setEditAgencyStatus,
    editAgencyRate,
    setEditAgencyRate,
    editAgencyNotes,
    setEditAgencyNotes,
    editingPolicy,
    setEditingPolicy,
    editPolicyName,
    setEditPolicyName,
    editPolicyRate,
    setEditPolicyRate,
    editPolicyBaseSalary,
    setEditPolicyBaseSalary,
    editPolicyDefault,
    setEditPolicyDefault,
    editPolicyActive,
    setEditPolicyActive,
    editingMember,
    setEditingMember,
    editMemberRole,
    setEditMemberRole,
    editMemberTitle,
    setEditMemberTitle,
    editMemberReferralCode,
    setEditMemberReferralCode,
    editMemberRate,
    setEditMemberRate,
    editMemberActive,
    setEditMemberActive,
    agencyCode,
    setAgencyCode,
    agencyName,
    setAgencyName,
    agencyRate,
    setAgencyRate,
    agencyNotes,
    setAgencyNotes,
    accountEmail,
    setAccountEmail,
    accountPassword,
    setAccountPassword,
    accountName,
    setAccountName,
    accountRole,
    setAccountRole,
    accountAgencyCode,
    setAccountAgencyCode,
    accountReferralCode,
    setAccountReferralCode,
    accountRateBps,
    setAccountRateBps,
    accountBaseSalary,
    setAccountBaseSalary,
    memberEmail,
    setMemberEmail,
    memberRole,
    setMemberRole,
    memberTitle,
    setMemberTitle,
    memberReferralCode,
    setMemberReferralCode,
    memberRate,
    setMemberRate,
    policyCode,
    setPolicyCode,
    policyName,
    setPolicyName,
    policyType,
    setPolicyType,
    policyRate,
    setPolicyRate,
    policyBaseSalary,
    setPolicyBaseSalary,
    policyIsDefault,
    setPolicyIsDefault,
    policyIsActive,
    setPolicyIsActive,
    canViewChannel,
    canManageGlobal,
    canManageScopedMembers,
    canManageMembers,
    effectiveAccountRole,
    effectiveMemberRole,
    loadStatic,
    loadUsers,
    refreshChannel,
    updateUserStatus,
    resetUserPassword,
    openResetPasswordModal,
    copyTemporaryPassword,
    openAgencyEditor,
    saveAgencyEdits,
    openPolicyEditor,
    savePolicyEdits,
    openMemberEditor,
    saveMemberEdits,
    createAgency,
    createChannelAccount,
    addMember,
    upsertPolicy,
    onSearchSubmit,
  };
}

export type ChannelPageState = ReturnType<typeof useChannelPageState>;
