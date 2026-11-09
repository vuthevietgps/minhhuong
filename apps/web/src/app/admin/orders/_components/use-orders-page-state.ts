import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { adminFetch, adminJson, readApiError } from "../../_lib/admin-client";
import { adminOrdersRoles, hasAllowedRole, useStoredAdminSession } from "../../_lib/admin-session";
import { fallbackActivationPackages } from "./shared";
import type { ActivationOrder, ActivationOrderStatus, ActivationPackage, CreateOrderResponse, OrderPage, SelfServiceOptions } from "./shared";

/** State, effects and handlers of OrdersPage, moved verbatim from page.tsx. */
export function useOrdersPageState() {
  const { loaded, roles } = useStoredAdminSession();
  const [status, setStatus] = useState<"ALL" | ActivationOrderStatus>(
    "PENDING_REVIEW",
  );
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [fromDateInput, setFromDateInput] = useState("");
  const [toDateInput, setToDateInput] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [orders, setOrders] = useState<ActivationOrder[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [actionOrderId, setActionOrderId] = useState<string | null>(null);
  const [isRevoking, setIsRevoking] = useState(false);
  const [message, setMessage] = useState("Đang tải danh sách đơn hàng...");
  const [revokeOrder, setRevokeOrder] = useState<ActivationOrder | null>(null);
  const [revokeReason, setRevokeReason] = useState("");
  const [pendingResubmit, setPendingResubmit] =
    useState<ActivationOrder | null>(null);
  const [resubmitFile, setResubmitFile] = useState<File | null>(null);
  const [isResubmitting, setIsResubmitting] = useState(false);
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});
  const [durationDays, setDurationDays] = useState<Record<string, string>>({});
  const [operationInvoices, setOperationInvoices] = useState<
    Record<string, File | null>
  >({});
  const [packageOptions, setPackageOptions] = useState<ActivationPackage[]>(
    fallbackActivationPackages,
  );
  const defaultPackage = fallbackActivationPackages[0];
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [packageCode, setPackageCode] = useState(defaultPackage?.code ?? "");
  const [amountVnd, setAmountVnd] = useState(
    defaultPackage ? String(defaultPackage.amountVnd) : "",
  );
  const [agencyCode, setAgencyCode] = useState("");
  const [notes, setNotes] = useState("");
  const [saleInvoice, setSaleInvoice] = useState<File | null>(null);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(
    null,
  );
  const [isGeneratedPasswordVisible, setIsGeneratedPasswordVisible] =
    useState(false);
  const [isGeneratedPasswordCopied, setIsGeneratedPasswordCopied] =
    useState(false);
  const [lastCreatedAccount, setLastCreatedAccount] = useState<{
    email: string;
    packageName: string;
    password: string;
  } | null>(null);
  const canViewOrders = hasAllowedRole(roles, adminOrdersRoles);
  const canCreateOrders = roles.some((role) =>
    ["ADMIN", "SALE", "AGENCY_OWNER", "AGENCY_MANAGER"].includes(role),
  );
  const canReviewOrders =
    roles.includes("ADMIN") || roles.includes("OPERATIONS");
  const canRecoverAgencyOrders =
    roles.includes("AGENCY_OWNER") || roles.includes("AGENCY_MANAGER");
  const canRecoverOrders = canReviewOrders || canRecoverAgencyOrders;
  const isAgencyWorkspace =
    roles.includes("AGENCY_OWNER") || roles.includes("AGENCY_MANAGER");
  const canOverrideAgencyCode = roles.includes("ADMIN");
  const usesLockedPackagePricing = isAgencyWorkspace && !canOverrideAgencyCode;
  const packageCodeRef = useRef(packageCode);
  useEffect(() => {
    packageCodeRef.current = packageCode;
  }, [packageCode]);
  const selectedPackage = useMemo(
    () => packageOptions.find((item) => item.code === packageCode),
    [packageCode, packageOptions],
  );
  const displayAmountVnd =
    usesLockedPackagePricing && selectedPackage
      ? String(selectedPackage.amountVnd)
      : amountVnd;
  const loadOrders = useCallback(
    async (cursor?: string, append = false) => {
      const setLoadingState = append ? setIsLoadingMore : setIsLoading;
      setLoadingState(true);
      setMessage(
        append ? "Đang tải thêm đơn hàng..." : "Đang tải danh sách đơn hàng...",
      );

      try {
        const params = new URLSearchParams({ limit: "25" });
        if (status !== "ALL") {
          params.set("status", status);
        }
        if (search.trim()) {
          params.set("search", search.trim());
        }
        if (fromDate) {
          params.set("fromDate", fromDate);
        }
        if (toDate) {
          params.set("toDate", toDate);
        }
        if (cursor) {
          params.set("cursor", cursor);
        }

        const data = await adminJson<OrderPage>(
          `/activation-orders?${params.toString()}`,
          undefined,
          "Không thể tải danh sách đơn hàng.",
        );

        setOrders((current) =>
          append ? [...current, ...data.items] : data.items,
        );
        setNextCursor(data.nextCursor ?? null);
        setHasMore(Boolean(data.hasMore));
        setMessage(
          `${append ? "Đã tải thêm" : "Đã tải"} ${data.items.length} đơn hàng.`,
        );
      } catch (error) {
        setMessage(
          error instanceof Error
            ? error.message
            : "Không thể tải danh sách đơn hàng.",
        );
      } finally {
        setLoadingState(false);
      }
    },
    [fromDate, search, status, toDate],
  );
  const loadPackages = useCallback(async () => {
    try {
      const data = await adminJson<SelfServiceOptions>(
        "/activation-orders/self-service/options",
        undefined,
        "Không thể tải danh sách gói học.",
      );
      if (data.packages.length > 0) {
        setPackageOptions(data.packages);
        const matchedPackage = data.packages.find(
          (item) => item.code === packageCodeRef.current,
        );
        if (!matchedPackage) {
          setPackageCode(data.packages[0].code);
          setAmountVnd(String(data.packages[0].amountVnd));
        }
      }
    } catch {
      // Keep local fallback options when the public package list is unavailable.
    }
  }, []);
  useEffect(() => {
    if (!loaded || !canViewOrders) {
      return;
    }

    const timer = window.setTimeout(() => {
      void loadOrders();
      void loadPackages();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [canViewOrders, loadOrders, loadPackages, loaded]);
  const queueSummary = useMemo(() => {
    return {
      loaded: orders.length,
      pendingReview: orders.filter((order) => order.status === "PENDING_REVIEW")
        .length,
      approved: orders.filter((order) => order.status === "APPROVED").length,
      escalated: orders.filter(
        (order) => order.status === "REJECTED" || order.status === "REVOKED",
      ).length,
    };
  }, [orders]);
  function selectPackage(nextCode: string) {
    setPackageCode(nextCode);
    const nextPackage = packageOptions.find((item) => item.code === nextCode);
    if (nextPackage) {
      setAmountVnd(String(nextPackage.amountVnd));
    }
  }
  async function createOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canCreateOrders) {
      return;
    }

    setIsCreatingOrder(true);
    setGeneratedPassword(null);
    setIsGeneratedPasswordVisible(false);
    setIsGeneratedPasswordCopied(false);
    setLastCreatedAccount(null);
    setMessage("Đang tạo đơn hàng cho học viên...");

    try {
      const formData = new FormData();
      formData.append("email", customerEmail.trim());
      if (displayName.trim()) {
        formData.append("displayName", displayName.trim());
      }
      if (customerPhone.trim()) {
        formData.append("phone", customerPhone.trim());
      }
      formData.append("amountVnd", displayAmountVnd);
      formData.append("currency", "VND");
      if (selectedPackage) {
        formData.append("packageCode", selectedPackage.code);
        formData.append("packageName", selectedPackage.name);
        formData.append(
          "requestedDurationDays",
          String(selectedPackage.durationDays),
        );
      }
      if (canOverrideAgencyCode && agencyCode.trim()) {
        formData.append("agencyCode", agencyCode.trim());
      }
      if (notes.trim()) {
        formData.append("notes", notes.trim());
      }
      if (saleInvoice) {
        formData.append("saleInvoice", saleInvoice);
      }

      const response = await adminFetch("/activation-orders", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        throw new Error(
          await readApiError(response, "Không thể tạo đơn hàng cho học viên."),
        );
      }

      const result = (await response.json()) as CreateOrderResponse;
      if (result.generatedPassword) {
        setGeneratedPassword(result.generatedPassword);
        setIsGeneratedPasswordVisible(false);
        setIsGeneratedPasswordCopied(false);
        setLastCreatedAccount({
          email: result.order.customerEmail,
          packageName:
            result.order.packageName ?? selectedPackage?.name ?? "Gói học",
          password: result.generatedPassword,
        });
        setMessage(
          `Đã tạo đơn cho ${result.order.customerEmail}. Mật khẩu tạm đã sẵn sàng để gửi qua kênh an toàn.`,
        );
      } else {
        setMessage(
          `Đã tạo đơn cho ${result.order.customerEmail} và chuyển sang chờ xét duyệt.`,
        );
      }

      setCustomerEmail("");
      setCustomerPhone("");
      setDisplayName("");
      setAmountVnd(String(selectedPackage?.amountVnd ?? 2400000));
      setNotes("");
      setSaleInvoice(null);
      if (canOverrideAgencyCode) {
        setAgencyCode("");
      }
      await loadOrders();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Không thể tạo đơn hàng cho học viên.",
      );
    } finally {
      setIsCreatingOrder(false);
    }
  }
  async function copyGeneratedPassword() {
    if (!generatedPassword) {
      return;
    }

    try {
      await navigator.clipboard.writeText(generatedPassword);
      setIsGeneratedPasswordCopied(true);
      setMessage(
        "Đã sao chép mật khẩu tạm. Hãy gửi qua kênh bàn giao an toàn.",
      );
    } catch {
      setMessage(
        "Không thể tự động sao chép mật khẩu tạm. Hãy sao chép thủ công và gửi qua kênh an toàn.",
      );
    }
  }
  async function confirmRevoke() {
    if (!revokeOrder) {
      return;
    }

    setIsRevoking(true);
    try {
      await adminJson(
        `/activation-orders/${revokeOrder.id}/revoke`,
        {
          method: "POST",
          body: JSON.stringify({
            revokeReason: revokeReason.trim() || undefined,
          }),
        },
        "Không thể thu hồi đơn hàng.",
      );
      setMessage(`Access revoked for ${revokeOrder.customerEmail}.`);
      setRevokeOrder(null);
      setRevokeReason("");
      await loadOrders();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Không thể thu hồi đơn hàng.",
      );
    } finally {
      setIsRevoking(false);
    }
  }
  async function approveOrder(orderId: string) {
    const operationInvoice = operationInvoices[orderId];
    const days = durationDays[orderId] ?? "365";

    if (!canReviewOrders || !operationInvoice) {
      setMessage("Cần có hóa đơn vận hành trước khi phê duyệt.");
      return;
    }

    setActionOrderId(orderId);
    setMessage("Đang duyệt đơn và kích hoạt tài khoản...");

    try {
      const formData = new FormData();
      formData.append("durationDays", days);
      formData.append("reviewNotes", reviewNotes[orderId] ?? "");
      formData.append("operationInvoice", operationInvoice);

      const response = await adminFetch(
        `/activation-orders/${orderId}/approve`,
        {
          method: "POST",
          body: formData,
        },
      );
      if (!response.ok) {
        throw new Error(
          await readApiError(response, "Không thể duyệt đơn hàng."),
        );
      }

      setMessage("Đã duyệt đơn. Tài khoản hoạt động đến ngày hết hạn đã chọn.");
      setOperationInvoices((current) => ({ ...current, [orderId]: null }));
      await loadOrders();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Không thể duyệt đơn hàng.",
      );
    } finally {
      setActionOrderId(null);
    }
  }
  async function rejectOrder(orderId: string) {
    if (!canReviewOrders) {
      return;
    }

    setActionOrderId(orderId);
    setMessage("Đang từ chối đơn hàng...");

    try {
      await adminJson(
        `/activation-orders/${orderId}/reject`,
        {
          method: "POST",
          body: JSON.stringify({
            reviewNotes:
              reviewNotes[orderId] ??
              "Bị từ chối trong quá trình xét duyệt thanh toán.",
          }),
        },
        "Không thể từ chối đơn hàng.",
      );

      setMessage("Đã từ chối đơn hàng.");
      await loadOrders();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Không thể từ chối đơn hàng.",
      );
    } finally {
      setActionOrderId(null);
    }
  }
  async function resubmitOrder(order: ActivationOrder) {
    setIsResubmitting(true);
    try {
      if (resubmitFile) {
        const formData = new FormData();
        formData.append("saleInvoice", resubmitFile);
        const res = await adminFetch(
          `/activation-orders/${order.id}/resubmit`,
          { method: "POST", body: formData },
        );
        if (!res.ok)
          throw new Error(
            await readApiError(res, "Không thể gửi lại đơn hàng."),
          );
      } else {
        await adminJson(
          `/activation-orders/${order.id}/resubmit`,
          { method: "POST", body: "{}" },
          "Không thể gửi lại đơn hàng.",
        );
      }
      setMessage(`Đã gửi lại đơn của ${order.customerEmail}.`);
      setPendingResubmit(null);
      setResubmitFile(null);
      await loadOrders();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Không thể gửi lại đơn hàng.",
      );
    } finally {
      setIsResubmitting(false);
    }
  }
  async function cancelOrder(order: ActivationOrder) {
    if (!canRecoverOrders) {
      return;
    }

    const confirmed = window.confirm(
      `Hủy đơn của ${order.customerEmail}? Không thể hoàn tác thao tác này từ hàng đợi.`,
    );
    if (!confirmed) {
      return;
    }

    setActionOrderId(order.id);
    setMessage("Đang hủy đơn hàng...");

    try {
      await adminJson(
        `/activation-orders/${order.id}/cancel`,
        {
          method: "POST",
        },
        "Không thể hủy đơn hàng.",
      );
      setMessage(`Đã hủy đơn của ${order.customerEmail}.`);
      await loadOrders();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Không thể hủy đơn hàng.",
      );
    } finally {
      setActionOrderId(null);
    }
  }
  function onSearchSubmit(event: FormEvent) {
    event.preventDefault();
    setSearch(searchInput);
    setFromDate(fromDateInput);
    setToDate(toDateInput);
  }

  return {
    loaded,
    roles,
    status,
    setStatus,
    searchInput,
    setSearchInput,
    search,
    setSearch,
    fromDateInput,
    setFromDateInput,
    toDateInput,
    setToDateInput,
    fromDate,
    setFromDate,
    toDate,
    setToDate,
    orders,
    setOrders,
    nextCursor,
    setNextCursor,
    hasMore,
    setHasMore,
    isLoading,
    setIsLoading,
    isLoadingMore,
    setIsLoadingMore,
    actionOrderId,
    setActionOrderId,
    isRevoking,
    setIsRevoking,
    message,
    setMessage,
    revokeOrder,
    setRevokeOrder,
    revokeReason,
    setRevokeReason,
    pendingResubmit,
    setPendingResubmit,
    resubmitFile,
    setResubmitFile,
    isResubmitting,
    setIsResubmitting,
    reviewNotes,
    setReviewNotes,
    durationDays,
    setDurationDays,
    operationInvoices,
    setOperationInvoices,
    packageOptions,
    setPackageOptions,
    defaultPackage,
    customerEmail,
    setCustomerEmail,
    customerPhone,
    setCustomerPhone,
    displayName,
    setDisplayName,
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
    isCreatingOrder,
    setIsCreatingOrder,
    generatedPassword,
    setGeneratedPassword,
    isGeneratedPasswordVisible,
    setIsGeneratedPasswordVisible,
    isGeneratedPasswordCopied,
    setIsGeneratedPasswordCopied,
    lastCreatedAccount,
    setLastCreatedAccount,
    canViewOrders,
    canCreateOrders,
    canReviewOrders,
    canRecoverAgencyOrders,
    canRecoverOrders,
    isAgencyWorkspace,
    canOverrideAgencyCode,
    usesLockedPackagePricing,
    packageCodeRef,
    selectedPackage,
    displayAmountVnd,
    loadOrders,
    loadPackages,
    queueSummary,
    selectPackage,
    createOrder,
    copyGeneratedPassword,
    confirmRevoke,
    approveOrder,
    rejectOrder,
    resubmitOrder,
    cancelOrder,
    onSearchSubmit,
  };
}

export type OrdersPageState = ReturnType<typeof useOrdersPageState>;
