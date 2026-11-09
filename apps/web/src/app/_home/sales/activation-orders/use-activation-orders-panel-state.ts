import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { apiBaseUrl, readApiError } from "../../lib/api";
import type { ActivationOrder, ActivationPackage, Role, SelfServiceOptions, Session } from "../../types";
import { fallbackActivationPackages, orderSearchText, saleOrderNeedsAction } from "./helpers";
import type { ActivationOrderTab, FreeTrialRecord } from "./helpers";

/** State, effects and handlers of ActivationOrdersPanel, moved verbatim from activation-orders-panel.tsx. */
export function useActivationOrdersPanelState({
  role,
  session,
}: {
  role: Role;
  session: Session;
}) {
  const canCreate =
    role === "SALE" ||
    role === "AGENCY_OWNER" ||
    role === "AGENCY_MANAGER" ||
    role === "ADMIN";
  const canApprove = role === "OPERATIONS" || role === "ADMIN";
  const canExtendTrial =
    role === "OPERATIONS" || role === "DIRECTOR" || role === "ADMIN";
  const [orders, setOrders] = useState<ActivationOrder[]>([]);
  const [trials, setTrials] = useState<FreeTrialRecord[]>([]);
  const [trialExtensionDays, setTrialExtensionDays] = useState<
    Record<string, string>
  >({});
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [packageOptions, setPackageOptions] = useState<ActivationPackage[]>(
    fallbackActivationPackages,
  );
  const [packageCode, setPackageCode] = useState("one-year");
  const [amountVnd, setAmountVnd] = useState("2400000");
  const [agencyCode, setAgencyCode] = useState("");
  const [notes, setNotes] = useState("");
  const [saleInvoice, setSaleInvoice] = useState<File | null>(null);
  const [operationInvoices, setOperationInvoices] = useState<
    Record<string, File | null>
  >({});
  const [resubmitInvoices, setResubmitInvoices] = useState<
    Record<string, File | null>
  >({});
  const [resubmitNotes, setResubmitNotes] = useState<Record<string, string>>(
    {},
  );
  const [durationDays, setDurationDays] = useState<Record<string, string>>({});
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});
  const [orderTab, setOrderTab] = useState<ActivationOrderTab>("ACTION");
  const [orderSearch, setOrderSearch] = useState("");
  const [filterFromDate, setFilterFromDate] = useState("");
  const [filterToDate, setFilterToDate] = useState("");
  const [showAdvancedFields, setShowAdvancedFields] = useState(
    role === "AGENCY_OWNER" || role === "AGENCY_MANAGER",
  );
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(
    null,
  );
  const [lastCreatedInfo, setLastCreatedInfo] = useState<{
    email: string;
    packageName: string;
    password: string;
  } | null>(null);
  const [message, setMessage] = useState("Đang tải đơn kích hoạt.");
  const [isLoading, setIsLoading] = useState(false);
  const prevStatusesRef = useRef<Record<string, string>>({});
  const [newStatusAlerts, setNewStatusAlerts] = useState<
    Array<{ id: string; email: string; newStatus: string }>
  >([]);
  const authHeaders = useMemo(
    () => ({ Authorization: `Bearer ${session.accessToken}` }),
    [session.accessToken],
  );
  const loadOrders = useCallback(async () => {
    try {
      const params = new URLSearchParams({ limit: "200" });
      if (filterFromDate) params.set("fromDate", filterFromDate);
      if (filterToDate) params.set("toDate", filterToDate);
      const response = await fetch(
        `${apiBaseUrl}/v1/activation-orders?${params.toString()}`,
        {
          headers: authHeaders,
        },
      );
      if (!response.ok) {
        throw new Error(
          await readApiError(response, "Không thể tải đơn kích hoạt."),
        );
      }

      const data = (await response.json()) as {
        items: ActivationOrder[];
        hasMore: boolean;
      };
      const items = Array.isArray(data)
        ? (data as ActivationOrder[])
        : data.items;
      // Detect status changes for real-time alerts
      const prev = prevStatusesRef.current;
      if (Object.keys(prev).length > 0) {
        const alerts: Array<{ id: string; email: string; newStatus: string }> =
          [];
        for (const item of items) {
          const oldStatus = prev[item.id];
          if (
            oldStatus &&
            oldStatus !== item.status &&
            (item.status === "APPROVED" || item.status === "REJECTED")
          ) {
            alerts.push({
              id: item.id,
              email: item.customerEmail,
              newStatus: item.status,
            });
          }
        }
        if (alerts.length > 0) {
          setNewStatusAlerts((current) => [...current, ...alerts]);
        }
      }
      prevStatusesRef.current = Object.fromEntries(
        items.map((item) => [item.id, item.status]),
      );
      setOrders(items);
      setMessage(`Đã tải ${items.length} đơn kích hoạt.`);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Không thể tải đơn kích hoạt.",
      );
    }
  }, [authHeaders, filterFromDate, filterToDate]);
  const loadPackages = useCallback(async () => {
    try {
      const response = await fetch(
        `${apiBaseUrl}/v1/activation-orders/self-service/options`,
      );
      if (!response.ok) {
        return;
      }

      const data = (await response.json()) as SelfServiceOptions;
      if (data.packages.length > 0) {
        setPackageOptions(data.packages);
      }
    } catch {
      // Keep the local package presets if the public options endpoint is offline.
    }
  }, []);
  const loadTrials = useCallback(async () => {
    if (!canExtendTrial) {
      return;
    }

    try {
      const response = await fetch(
        `${apiBaseUrl}/v1/activation-orders/trials`,
        {
          headers: authHeaders,
        },
      );
      if (!response.ok) {
        throw new Error(
          await readApiError(response, "Không thể tải danh sách dùng thử."),
        );
      }
      setTrials((await response.json()) as FreeTrialRecord[]);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Không thể tải danh sách dùng thử.",
      );
    }
  }, [authHeaders, canExtendTrial]);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadOrders();
      void loadPackages();
      void loadTrials();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadOrders, loadPackages, loadTrials]);
  useEffect(() => {
    const interval = window.setInterval(() => {
      if (!document.hidden) {
        void loadOrders();
        void loadTrials();
      }
    }, 30_000);
    return () => window.clearInterval(interval);
  }, [loadOrders, loadTrials]);
  const selectedPackage = useMemo(
    () => packageOptions.find((item) => item.code === packageCode),
    [packageCode, packageOptions],
  );
  function selectPackage(nextCode: string) {
    setPackageCode(nextCode);
    const nextPackage = packageOptions.find((item) => item.code === nextCode);
    if (nextPackage) {
      setAmountVnd(String(nextPackage.amountVnd));
    }
  }
  async function createOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canCreate) {
      return;
    }

    setIsLoading(true);
    setGeneratedPassword(null);
    setLastCreatedInfo(null);
    setMessage("Đang tạo đơn kích hoạt...");

    try {
      const formData = new FormData();
      formData.append("email", customerEmail);
      formData.append("displayName", displayName);
      if (customerPhone.trim()) {
        formData.append("phone", customerPhone.trim());
      }
      formData.append("amountVnd", amountVnd);
      formData.append("currency", "VND");
      if (selectedPackage) {
        formData.append("packageCode", selectedPackage.code);
        formData.append("packageName", selectedPackage.name);
        formData.append(
          "requestedDurationDays",
          String(selectedPackage.durationDays),
        );
      }
      if (agencyCode.trim()) {
        formData.append("agencyCode", agencyCode);
      }
      formData.append("notes", notes);
      if (saleInvoice) {
        formData.append("saleInvoice", saleInvoice);
      }

      const response = await fetch(`${apiBaseUrl}/v1/activation-orders`, {
        method: "POST",
        headers: authHeaders,
        body: formData,
      });
      if (!response.ok) {
        throw new Error(
          await readApiError(response, "Không thể tạo đơn kích hoạt."),
        );
      }

      const result = (await response.json()) as {
        order: ActivationOrder;
        generatedPassword: string | null;
        isNewAccount: boolean;
      };
      if (result.generatedPassword) {
        setGeneratedPassword(result.generatedPassword);
        setLastCreatedInfo({
          email: customerEmail,
          packageName: selectedPackage?.name ?? "Gói học",
          password: result.generatedPassword,
        });
        setMessage(
          "Đã tạo đơn và tài khoản mới — hãy gửi mật khẩu tạm cho học viên qua kênh an toàn.",
        );
      } else {
        setMessage("Đã tạo đơn và đang chờ bộ phận vận hành duyệt.");
      }
      setCustomerEmail("");
      setCustomerPhone("");
      setDisplayName("");
      setAmountVnd(String(selectedPackage?.amountVnd ?? 2400000));
      setAgencyCode("");
      setNotes("");
      setSaleInvoice(null);
      await loadOrders();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Không thể tạo đơn kích hoạt.",
      );
    } finally {
      setIsLoading(false);
    }
  }
  async function resubmitOrder(orderId: string) {
    setIsLoading(true);
    setMessage("Đang gửi duyệt lại đơn...");

    try {
      const formData = new FormData();
      formData.append("notes", resubmitNotes[orderId] ?? "");
      const invoice = resubmitInvoices[orderId];
      if (invoice) {
        formData.append("saleInvoice", invoice);
      }

      const response = await fetch(
        `${apiBaseUrl}/v1/activation-orders/${orderId}/resubmit`,
        {
          method: "POST",
          headers: authHeaders,
          body: formData,
        },
      );
      if (!response.ok) {
        throw new Error(
          await readApiError(response, "Không thể gửi duyệt lại đơn."),
        );
      }

      setMessage("Đã gửi lại đơn để duyệt.");
      setResubmitNotes((current) => ({ ...current, [orderId]: "" }));
      setResubmitInvoices((current) => ({ ...current, [orderId]: null }));
      await loadOrders();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Không thể gửi duyệt lại đơn.",
      );
    } finally {
      setIsLoading(false);
    }
  }
  async function approveOrder(orderId: string) {
    const operationInvoice = operationInvoices[orderId];
    const days = durationDays[orderId] || "365";

    if (!canApprove || !operationInvoice) {
      setMessage("Cần tải hóa đơn vận hành trước khi duyệt.");
      return;
    }

    setIsLoading(true);
    setMessage("Đang duyệt đơn và kích hoạt tài khoản...");

    try {
      const formData = new FormData();
      formData.append("durationDays", days);
      formData.append("reviewNotes", reviewNotes[orderId] ?? "");
      formData.append("operationInvoice", operationInvoice);

      const response = await fetch(
        `${apiBaseUrl}/v1/activation-orders/${orderId}/approve`,
        {
          method: "POST",
          headers: authHeaders,
          body: formData,
        },
      );
      if (!response.ok) {
        throw new Error(await readApiError(response, "Không thể duyệt đơn."));
      }

      setMessage("Đã duyệt đơn. Tài khoản hoạt động đến ngày hết hạn đã chọn.");
      await loadOrders();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Không thể duyệt đơn.",
      );
    } finally {
      setIsLoading(false);
    }
  }
  async function extendTrial(subscriptionId: string) {
    const days = Number(trialExtensionDays[subscriptionId] ?? "1");
    if (!Number.isInteger(days) || days < 1 || days > 15) {
      setMessage("Số ngày gia hạn trial phải từ 1 đến 15.");
      return;
    }

    setIsLoading(true);
    setMessage("Đang gia hạn dùng thử...");
    try {
      const response = await fetch(
        `${apiBaseUrl}/v1/activation-orders/trials/${subscriptionId}/extend`,
        {
          method: "POST",
          headers: { ...authHeaders, "Content-Type": "application/json" },
          body: JSON.stringify({ days }),
        },
      );
      if (!response.ok) {
        throw new Error(
          await readApiError(response, "Không thể gia hạn dùng thử."),
        );
      }
      setMessage(
        "Đã gia hạn trial. Tổng thời gian trial vẫn không vượt 15 ngày.",
      );
      setTrialExtensionDays((current) => ({
        ...current,
        [subscriptionId]: "",
      }));
      await loadTrials();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Không thể gia hạn dùng thử.",
      );
    } finally {
      setIsLoading(false);
    }
  }
  async function rejectOrder(orderId: string) {
    if (!canApprove) {
      return;
    }

    setIsLoading(true);
    setMessage("Đang từ chối đơn...");

    try {
      const response = await fetch(
        `${apiBaseUrl}/v1/activation-orders/${orderId}/reject`,
        {
          method: "POST",
          headers: {
            ...authHeaders,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            reviewNotes:
              reviewNotes[orderId] ??
              "Bị từ chối trong bước kiểm tra thanh toán.",
          }),
        },
      );
      if (!response.ok) {
        throw new Error(await readApiError(response, "Không thể từ chối đơn."));
      }

      setMessage("Đã từ chối đơn.");
      await loadOrders();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Không thể từ chối đơn.",
      );
    } finally {
      setIsLoading(false);
    }
  }
  const [revokeOrderId, setRevokeOrderId] = useState<string | null>(null);
  const [revokeReason, setRevokeReason] = useState("");
  function openRevokeModal(orderId: string) {
    setRevokeOrderId(orderId);
    setRevokeReason("");
  }
  function closeRevokeModal() {
    setRevokeOrderId(null);
    setRevokeReason("");
  }
  async function confirmRevoke() {
    if (!revokeOrderId) return;
    setIsLoading(true);
    setMessage("Đang thu hồi đơn...");
    closeRevokeModal();
    try {
      const response = await fetch(
        `${apiBaseUrl}/v1/activation-orders/${revokeOrderId}/revoke`,
        {
          method: "POST",
          headers: { ...authHeaders, "Content-Type": "application/json" },
          body: JSON.stringify({
            revokeReason: revokeReason.trim() || undefined,
          }),
        },
      );
      if (!response.ok) {
        throw new Error(await readApiError(response, "Không thể thu hồi đơn."));
      }
      setMessage("Đã thu hồi đơn và hoàn nguyên hoa hồng.");
      await loadOrders();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Không thể thu hồi đơn.",
      );
    } finally {
      setIsLoading(false);
    }
  }
  async function cancelOrder(orderId: string) {
    if (!window.confirm("Huỷ đơn hàng này? Thao tác không thể hoàn tác.")) {
      return;
    }

    setIsLoading(true);
    setMessage("Đang hủy đơn...");

    try {
      const response = await fetch(
        `${apiBaseUrl}/v1/activation-orders/${orderId}/cancel`,
        {
          method: "POST",
          headers: authHeaders,
        },
      );
      if (!response.ok) {
        throw new Error(await readApiError(response, "Không thể hủy đơn."));
      }

      setMessage("Đã hủy đơn.");
      await loadOrders();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Không thể hủy đơn.");
    } finally {
      setIsLoading(false);
    }
  }
  const reviewOrders = orders.filter(
    (order) => order.status === "PENDING_REVIEW",
  );
  const actionOrders = orders.filter((order) =>
    canApprove
      ? order.status === "PENDING_REVIEW" || order.status === "WAITING_PAYMENT"
      : saleOrderNeedsAction(order),
  );
  const approvedOrders = orders.filter((order) => order.status === "APPROVED");
  const rejectedOrders = orders.filter((order) => order.status === "REJECTED");
  const approvedRevenueCents = approvedOrders.reduce(
    (sum, order) => sum + order.amountCents,
    0,
  );
  const commissionCents = orders.reduce(
    (sum, order) =>
      sum +
      (order.commissionEarnings?.reduce(
        (earningSum, earning) => earningSum + earning.amountCents,
        0,
      ) ?? 0),
    0,
  );
  const thisMonth = new Date().toISOString().substring(0, 7);
  const thisMonthApprovedCount = approvedOrders.filter((o) =>
    o.createdAt.startsWith(thisMonth),
  ).length;
  const normalizedSearch = orderSearch.trim().toLowerCase();
  const visibleOrders = orders
    .filter((order) => {
      const matchesTab =
        orderTab === "ALL"
          ? true
          : orderTab === "ACTION"
            ? actionOrders.some((item) => item.id === order.id)
            : order.status === orderTab;
      const matchesSearch = normalizedSearch
        ? orderSearchText(order).includes(normalizedSearch)
        : true;
      return matchesTab && matchesSearch;
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const tabOptions: Array<{
    key: ActivationOrderTab;
    label: string;
    count: number;
  }> = [
    {
      key: "ACTION",
      label: canApprove ? "Cần duyệt" : "Cần xử lý",
      count: actionOrders.length,
    },
    { key: "PENDING_REVIEW", label: "Đang duyệt", count: reviewOrders.length },
    { key: "APPROVED", label: "Đã duyệt", count: approvedOrders.length },
    { key: "REJECTED", label: "Bị từ chối", count: rejectedOrders.length },
    { key: "ALL", label: "Tất cả", count: orders.length },
  ];

  return {
    role,
    session,
    canCreate,
    canApprove,
    canExtendTrial,
    orders,
    setOrders,
    trials,
    setTrials,
    trialExtensionDays,
    setTrialExtensionDays,
    customerEmail,
    setCustomerEmail,
    customerPhone,
    setCustomerPhone,
    displayName,
    setDisplayName,
    packageOptions,
    setPackageOptions,
    packageCode,
    setPackageCode,
    amountVnd,
    setAmountVnd,
    agencyCode,
    setAgencyCode,
    notes,
    setNotes,
    saleInvoice,
    setSaleInvoice,
    operationInvoices,
    setOperationInvoices,
    resubmitInvoices,
    setResubmitInvoices,
    resubmitNotes,
    setResubmitNotes,
    durationDays,
    setDurationDays,
    reviewNotes,
    setReviewNotes,
    orderTab,
    setOrderTab,
    orderSearch,
    setOrderSearch,
    filterFromDate,
    setFilterFromDate,
    filterToDate,
    setFilterToDate,
    showAdvancedFields,
    setShowAdvancedFields,
    generatedPassword,
    setGeneratedPassword,
    lastCreatedInfo,
    setLastCreatedInfo,
    message,
    setMessage,
    isLoading,
    setIsLoading,
    prevStatusesRef,
    newStatusAlerts,
    setNewStatusAlerts,
    authHeaders,
    loadOrders,
    loadPackages,
    loadTrials,
    selectedPackage,
    selectPackage,
    createOrder,
    resubmitOrder,
    approveOrder,
    extendTrial,
    rejectOrder,
    revokeOrderId,
    setRevokeOrderId,
    revokeReason,
    setRevokeReason,
    openRevokeModal,
    closeRevokeModal,
    confirmRevoke,
    cancelOrder,
    reviewOrders,
    actionOrders,
    approvedOrders,
    rejectedOrders,
    approvedRevenueCents,
    commissionCents,
    thisMonth,
    thisMonthApprovedCount,
    normalizedSearch,
    visibleOrders,
    tabOptions,
  };
}

export type ActivationOrdersPanelState = ReturnType<typeof useActivationOrdersPanelState>;
