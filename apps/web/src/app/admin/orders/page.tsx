"use client";

import {
  CalendarRange,
  CheckCircle2,
  ClipboardList,
  Copy,
  Eye,
  EyeOff,
  FileText,
  RefreshCw,
  RotateCcw,
  Search,
  ShieldAlert,
  XCircle,
} from "lucide-react";
import {
  Fragment,
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  adminFetch,
  adminJson,
  formatDate,
  formatMoney,
  formatStatusVi,
  openAuthedAsset,
  readApiError,
} from "../_lib/admin-client";
import {
  adminOrdersRoles,
  hasAllowedRole,
  useStoredAdminSession,
} from "../_lib/admin-session";

type ActivationOrderStatus =
  | "WAITING_PAYMENT"
  | "PENDING_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "CANCELED"
  | "REVOKED";

type ActivationOrder = {
  id: string;
  customerEmail: string;
  customerPhone?: string;
  packageName?: string;
  requestedDurationDays?: number;
  amountCents: number;
  currency: string;
  status: ActivationOrderStatus;
  source: "SALE_ASSISTED" | "SELF_SERVICE";
  createdAt: string;
  activatedAt?: string;
  expiresAt?: string;
  notes?: string;
  reviewNotes?: string;
  revokeReason?: string;
  saleInvoiceUrl?: string;
  operationInvoiceUrl?: string;
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountName?: string;
  transferContent?: string;
  user: {
    email: string;
    status: string;
    profile?: {
      displayName?: string;
    };
  };
  reviewedBy?: {
    email: string;
  };
  createdBy?: {
    email: string;
  };
  agency?: {
    code: string;
    name: string;
  };
};

type OrderPage = {
  items: ActivationOrder[];
  nextCursor?: string | null;
  hasMore: boolean;
};

type ActivationPackage = {
  code: string;
  name: string;
  amountVnd: number;
  durationDays: number;
  description?: string;
};

type SelfServiceOptions = {
  packages: ActivationPackage[];
};

type CreateOrderResponse = {
  order: ActivationOrder;
  generatedPassword: string | null;
  isNewAccount: boolean;
};

const fallbackActivationPackages: ActivationPackage[] = [
  {
    code: "one-month",
    name: "Quyền truy cập 1 tháng",
    amountVnd: 300000,
    durationDays: 30,
  },
  {
    code: "three-months",
    name: "Quyền truy cập 3 tháng",
    amountVnd: 800000,
    durationDays: 90,
  },
  {
    code: "one-year",
    name: "Quyền truy cập 1 năm",
    amountVnd: 2400000,
    durationDays: 365,
  },
];

const statusTabs: Array<{
  label: string;
  value: "ALL" | ActivationOrderStatus;
}> = [
  { label: "Tất cả", value: "ALL" },
  { label: "Chờ xét duyệt", value: "PENDING_REVIEW" },
  { label: "Đã duyệt", value: "APPROVED" },
  { label: "Đã từ chối", value: "REJECTED" },
  { label: "Đã hủy", value: "CANCELED" },
  { label: "Đã thu hồi", value: "REVOKED" },
];

function statusClass(status: ActivationOrderStatus) {
  return {
    WAITING_PAYMENT: "bg-amber-50 text-amber-700",
    PENDING_REVIEW: "bg-sky-50 text-sky-700",
    APPROVED: "bg-teal-50 text-teal-700",
    REJECTED: "bg-rose-50 text-rose-700",
    CANCELED: "bg-slate-100 text-slate-700",
    REVOKED: "bg-purple-50 text-purple-700",
  }[status];
}

export default function OrdersPage() {
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

  if (!loaded) {
    return (
      <div className="px-6 py-6 lg:px-8 lg:py-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-sm text-slate-500 shadow-sm">
          Đang kiểm tra quyền đơn hàng...
        </div>
      </div>
    );
  }

  if (!canViewOrders) {
    return (
      <div className="px-6 py-6 lg:px-8 lg:py-8">
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-8 shadow-sm">
          <h1 className="text-xl font-semibold text-amber-950">
            Vai trò này không được mở không gian đơn hàng.
          </h1>
          <p className="mt-3 text-sm leading-6 text-amber-900">
            Hãy mở cổng phù hợp với phạm vi quyền hiện tại.
          </p>
        </div>
      </div>
    );
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

  return (
    <div className="px-6 py-6 lg:px-8 lg:py-8">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-teal-700">
              <ClipboardList size={18} />
              Danh sách đơn hàng
            </div>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
              {canReviewOrders
                ? "Theo dõi vòng đời kích hoạt và các lượt thu hồi sau phê duyệt"
                : isAgencyWorkspace
                  ? "Tạo đơn học viên và khôi phục doanh thu đại lý bị gián đoạn"
                  : "Tạo đơn học viên và theo dõi tiến độ xét duyệt"}
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              {canReviewOrders
                ? message
                : isAgencyWorkspace
                  ? "Không gian đơn hàng được giới hạn theo các đại lý gắn với tài khoản này. Bạn có thể tạo đơn học viên mới, theo dõi phê duyệt, từ chối, hủy và gửi lại ngay tại đây."
                  : message}
            </p>
          </div>
          <button
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            disabled={isLoading}
            onClick={() => void loadOrders()}
            type="button"
          >
            <RefreshCw size={16} />
            Làm mới
          </button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            [
              "Hàng đợi đã tải",
              String(queueSummary.loaded),
              "Đơn hàng trong dữ liệu hiện tại",
            ],
            [
              "Chờ xét duyệt",
              String(queueSummary.pendingReview),
              canReviewOrders
                ? "Cần bộ phận vận hành xử lý"
                : "Đang chờ bộ phận vận hành",
            ],
            [
              "Đã duyệt",
              String(queueSummary.approved),
              "Tài khoản đang hoạt động theo bộ lọc hiện tại",
            ],
            [
              "Đã chuyển xử lý",
              String(queueSummary.escalated),
              "Đơn bị từ chối hoặc thu hồi",
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

        <div className="mt-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap gap-2">
            {statusTabs.map((tab) => (
              <button
                className={`h-10 rounded-full px-4 text-sm font-medium ${
                  status === tab.value
                    ? "bg-slate-950 text-white"
                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
                key={tab.value}
                onClick={() => setStatus(tab.value)}
                type="button"
              >
                {tab.label}
              </button>
            ))}
          </div>
          <form
            className="grid gap-2 md:grid-cols-[minmax(220px,1fr)_160px_160px_auto_auto]"
            onSubmit={onSearchSubmit}
          >
            <div className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-500">
              <Search size={16} />
              <input
                className="w-full bg-transparent outline-none placeholder:text-slate-400"
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Tìm email khách hàng"
                value={searchInput}
              />
            </div>
            <label className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-500">
              <CalendarRange size={16} />
              <input
                className="w-full bg-transparent outline-none"
                onChange={(event) => setFromDateInput(event.target.value)}
                type="date"
                value={fromDateInput}
              />
            </label>
            <label className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-500">
              <CalendarRange size={16} />
              <input
                className="w-full bg-transparent outline-none"
                onChange={(event) => setToDateInput(event.target.value)}
                type="date"
                value={toDateInput}
              />
            </label>
            <button
              className="h-10 rounded-xl bg-slate-950 px-4 text-sm font-medium text-white"
              type="submit"
            >
              Áp dụng
            </button>
            <button
              className="h-10 rounded-xl border border-slate-200 px-4 text-sm font-medium text-slate-600 hover:bg-slate-50"
              onClick={() => {
                setSearchInput("");
                setSearch("");
                setFromDateInput("");
                setToDateInput("");
                setFromDate("");
                setToDate("");
              }}
              type="button"
            >
              Xóa bộ lọc
            </button>
          </form>
        </div>
      </section>

      {canCreateOrders && (
        <section className="mt-6 grid gap-4 xl:grid-cols-[1fr_0.9fr]">
          <form
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
            onSubmit={createOrder}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Tạo đơn học viên
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {isAgencyWorkspace
                    ? "Đơn hàng mới tự động thuộc phạm vi đại lý của bạn, trừ khi quản trị viên thay đổi nguồn ghi nhận."
                    : "Gửi đơn kích hoạt có nhân viên kinh doanh hỗ trợ, kèm gói học, số tiền và minh chứng thanh toán."}
                </p>
              </div>
              {selectedPackage && (
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                  {selectedPackage.durationDays} ngày
                </span>
              )}
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Email học viên
                </span>
                <input
                  className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm"
                  onChange={(event) => setCustomerEmail(event.target.value)}
                  placeholder="learner@example.com"
                  required
                  type="email"
                  value={customerEmail}
                />
              </label>
              <label className="block">
                <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Tên hiển thị
                </span>
                <input
                  className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm"
                  onChange={(event) => setDisplayName(event.target.value)}
                  placeholder="Tên hiển thị của học viên"
                  value={displayName}
                />
              </label>
              <label className="block">
                <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Số điện thoại
                </span>
                <input
                  className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm"
                  onChange={(event) => setCustomerPhone(event.target.value)}
                  placeholder="0901 234 567"
                  value={customerPhone}
                />
              </label>
              <label className="block">
                <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Gói học
                </span>
                <select
                  className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm"
                  onChange={(event) => selectPackage(event.target.value)}
                  value={packageCode}
                >
                  {packageOptions.map((item) => (
                    <option key={item.code} value={item.code}>
                      {item.name} • {formatMoney(item.amountVnd * 100, "VND")}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Số tiền (VNĐ)
                </span>
                <input
                  className={`mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm ${
                    usesLockedPackagePricing ? "bg-slate-50 text-slate-500" : ""
                  }`}
                  min="1000"
                  onChange={(event) => setAmountVnd(event.target.value)}
                  readOnly={usesLockedPackagePricing}
                  required
                  type="number"
                  value={displayAmountVnd}
                />
                {usesLockedPackagePricing && (
                  <p className="mt-1 text-xs text-slate-500">
                    Số tiền được khóa theo gói đã chọn để đơn đại lý luôn khớp
                    giá công bố.
                  </p>
                )}
              </label>
              {canOverrideAgencyCode && (
                <label className="block">
                  <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Mã đại lý
                  </span>
                  <input
                    className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm"
                    onChange={(event) => setAgencyCode(event.target.value)}
                    placeholder="AGENCY-CODE"
                    value={agencyCode}
                  />
                </label>
              )}
              <label className="block sm:col-span-2">
                <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Hóa đơn kinh doanh
                </span>
                <input
                  accept="application/pdf,image/jpeg,image/png,image/webp"
                  className="mt-1 block w-full text-sm text-slate-600"
                  onChange={(event) =>
                    setSaleInvoice(event.target.files?.[0] ?? null)
                  }
                  type="file"
                />
              </label>
              <label className="block sm:col-span-2">
                <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Ghi chú
                </span>
                <textarea
                  className="mt-1 min-h-28 w-full rounded-2xl border border-slate-200 px-3 py-2.5 text-sm"
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Thông tin khách hàng, ghi chú thanh toán hoặc bàn giao nội bộ"
                  value={notes}
                />
              </label>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                className="inline-flex h-11 items-center rounded-xl bg-slate-950 px-4 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
                disabled={isCreatingOrder}
                type="submit"
              >
                {isCreatingOrder ? "Đang tạo..." : "Tạo đơn học viên"}
              </button>
              {selectedPackage && (
                <p className="text-sm text-slate-500">
                  Gói đề xuất:{" "}
                  <span className="font-medium text-slate-700">
                    {selectedPackage.name}
                  </span>
                </p>
              )}
            </div>
          </form>

          <div className="space-y-4">
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold text-slate-900">
                Quy trình chủ đại lý
              </p>
              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  1. Tạo đơn học viên kèm gói học và minh chứng thanh toán.
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  2. Theo dõi trạng thái duyệt, từ chối hoặc thu hồi trong cùng
                  danh sách.
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  3. Khi đơn bị từ chối, gửi lại hoặc hủy ngay trong phạm vi đại
                  lý.
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold text-slate-900">
                Bàn giao tài khoản
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Tài khoản học viên mới có thể sinh mật khẩu tạm. Hãy gửi qua
                kênh vận hành an toàn, không để trong ghi chú trình duyệt hoặc
                ảnh chụp màn hình.
              </p>
              {lastCreatedAccount && generatedPassword ? (
                <div className="mt-4 rounded-2xl border border-teal-200 bg-teal-50 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-teal-900">
                        Mật khẩu tạm đã sẵn sàng
                      </p>
                      <p className="mt-2 text-sm text-teal-900">
                        {lastCreatedAccount.email} •{" "}
                        {lastCreatedAccount.packageName}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        className="inline-flex h-9 items-center gap-2 rounded-xl border border-teal-300 bg-white px-3 text-sm font-medium text-teal-900 hover:bg-teal-100"
                        onClick={() =>
                          setIsGeneratedPasswordVisible((current) => !current)
                        }
                        type="button"
                      >
                        {isGeneratedPasswordVisible ? (
                          <EyeOff size={15} />
                        ) : (
                          <Eye size={15} />
                        )}
                        {isGeneratedPasswordVisible ? "Ẩn" : "Hiện"}
                      </button>
                      <button
                        className="inline-flex h-9 items-center gap-2 rounded-xl border border-teal-300 bg-white px-3 text-sm font-medium text-teal-900 hover:bg-teal-100"
                        onClick={() => void copyGeneratedPassword()}
                        type="button"
                      >
                        <Copy size={15} />
                        {isGeneratedPasswordCopied ? "Đã sao chép" : "Sao chép"}
                      </button>
                    </div>
                  </div>
                  <p className="mt-3 rounded-xl bg-white px-3 py-2 font-mono text-sm text-slate-900">
                    {isGeneratedPasswordVisible
                      ? generatedPassword
                      : "*".repeat(Math.max(12, generatedPassword.length))}
                  </p>
                  <p className="mt-2 text-xs text-teal-900">
                    Chỉ hiển thị khi sẵn sàng bàn giao, sau đó sao chép vào kênh
                    vận hành an toàn.
                  </p>
                </div>
              ) : (
                <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                  Tạo đơn học viên mới để nhận mật khẩu tạm khi tài khoản chưa
                  tồn tại.
                </div>
              )}
            </section>
          </div>
        </section>
      )}

      <section className="mt-6 rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3 font-medium">Khách hàng</th>
                <th className="px-5 py-3 font-medium">Gói học</th>
                <th className="px-5 py-3 font-medium">Nguồn</th>
                <th className="px-5 py-3 font-medium">Trạng thái</th>
                <th className="px-5 py-3 font-medium">Số tiền</th>
                <th className="px-5 py-3 font-medium">Ngày tạo</th>
                <th className="px-5 py-3 font-medium">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {orders.map((order) => {
                const isPendingReview = order.status === "PENDING_REVIEW";
                const hasBankTransfer = Boolean(order.bankAccountNumber);
                const showDetailRow =
                  isPendingReview ||
                  Boolean(order.saleInvoiceUrl) ||
                  Boolean(order.operationInvoiceUrl) ||
                  Boolean(order.notes) ||
                  Boolean(order.reviewNotes) ||
                  Boolean(order.revokeReason) ||
                  Boolean(order.activatedAt) ||
                  Boolean(order.expiresAt) ||
                  hasBankTransfer;

                return (
                  <Fragment key={order.id}>
                    <tr>
                      <td className="px-5 py-4 align-top">
                        <p className="font-medium text-slate-950">
                          {order.customerEmail}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {order.customerPhone ??
                            order.createdBy?.email ??
                            order.user.profile?.displayName ??
                            "-"}
                        </p>
                        {order.agency && (
                          <p className="mt-1 text-xs text-slate-500">
                            Đại lý: {order.agency.code} • {order.agency.name}
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-4 align-top text-slate-600">
                        <p>{order.packageName ?? "Gói học đang chờ"}</p>
                        {order.requestedDurationDays && (
                          <p className="mt-1 text-xs text-slate-500">
                            Ngày yêu cầu {order.requestedDurationDays} ngày
                          </p>
                        )}
                        {order.expiresAt && (
                          <p className="mt-1 text-xs text-slate-500">
                            Hết hạn {formatDate(order.expiresAt)}
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-4 align-top text-slate-600">
                        {formatStatusVi(order.source)}
                      </td>
                      <td className="px-5 py-4 align-top">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(order.status)}`}
                        >
                          {formatStatusVi(order.status)}
                        </span>
                      </td>
                      <td className="px-5 py-4 align-top font-medium text-slate-950">
                        {formatMoney(order.amountCents, order.currency)}
                      </td>
                      <td className="px-5 py-4 align-top text-slate-600">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-5 py-4 align-top">
                        {isPendingReview && canReviewOrders ? (
                          <span className="text-xs font-medium text-sky-700">
                            Duyệt bên dưới
                          </span>
                        ) : order.status === "APPROVED" && canReviewOrders ? (
                          <button
                            className="rounded-xl border border-purple-200 px-3 py-2 text-xs font-medium text-purple-700 hover:bg-purple-50"
                            onClick={() => setRevokeOrder(order)}
                            type="button"
                          >
                            Thu hồi quyền truy cập
                          </button>
                        ) : order.status === "REJECTED" && canRecoverOrders ? (
                          <div className="flex flex-col gap-2">
                            <button
                              className="inline-flex items-center gap-1.5 rounded-xl border border-sky-200 px-3 py-2 text-xs font-medium text-sky-700 hover:bg-sky-50"
                              onClick={() => {
                                setPendingResubmit(order);
                                setResubmitFile(null);
                              }}
                              type="button"
                            >
                              <RotateCcw size={12} />
                              Gửi lại
                            </button>
                            <button
                              className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                              onClick={() => void cancelOrder(order)}
                              type="button"
                            >
                              Hủy đơn hàng
                            </button>
                          </div>
                        ) : ["WAITING_PAYMENT", "PENDING_REVIEW"].includes(
                            order.status,
                          ) && canRecoverOrders ? (
                          <button
                            className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                            onClick={() => void cancelOrder(order)}
                            type="button"
                          >
                            Hủy đơn hàng
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400">
                            Không cần thao tác
                          </span>
                        )}
                      </td>
                    </tr>
                    {showDetailRow && (
                      <tr className="bg-slate-50/80">
                        <td className="px-5 py-4" colSpan={7}>
                          <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
                            <div className="grid gap-3 md:grid-cols-2">
                              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                  Dòng thời gian
                                </p>
                                <div className="mt-3 space-y-2 text-sm text-slate-600">
                                  <p>Ngày tạo: {formatDate(order.createdAt)}</p>
                                  <p>
                                    Ngày kích hoạt:{" "}
                                    {formatDate(order.activatedAt)}
                                  </p>
                                  <p>
                                    Ngày hết hạn: {formatDate(order.expiresAt)}
                                  </p>
                                  <p>
                                    Người duyệt:{" "}
                                    {order.reviewedBy?.email ?? "-"}
                                  </p>
                                </div>
                              </div>
                              {hasBankTransfer && (
                                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 md:col-span-2">
                                  <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                                    Chuyển khoản ngân hàng
                                  </p>
                                  <div className="mt-3 grid gap-1 text-sm text-amber-900">
                                    <p>
                                      <span className="font-medium">
                                        Ngân hàng:
                                      </span>{" "}
                                      {order.bankName ?? "—"}
                                    </p>
                                    <p>
                                      <span className="font-medium">
                                        Tài khoản:
                                      </span>{" "}
                                      {order.bankAccountNumber} —{" "}
                                      {order.bankAccountName}
                                    </p>
                                    <p>
                                      <span className="font-medium">
                                        Nội dung:
                                      </span>{" "}
                                      <span className="font-mono">
                                        {order.transferContent ?? "—"}
                                      </span>
                                    </p>
                                  </div>
                                </div>
                              )}
                              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                  Chứng từ
                                </p>
                                <div className="mt-3 flex flex-wrap gap-2">
                                  {order.saleInvoiceUrl ? (
                                    <button
                                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                                      onClick={() =>
                                        void openAuthedAsset(
                                          order.saleInvoiceUrl!,
                                          "Không thể mở hóa đơn kinh doanh.",
                                        ).catch((error: unknown) =>
                                          setMessage(
                                            error instanceof Error
                                              ? error.message
                                              : "Không thể mở hóa đơn kinh doanh.",
                                          ),
                                        )
                                      }
                                      type="button"
                                    >
                                      <FileText size={14} />
                                      Hóa đơn kinh doanh
                                    </button>
                                  ) : (
                                    <span className="text-xs text-slate-400">
                                      Chưa có hóa đơn kinh doanh
                                    </span>
                                  )}
                                  {order.operationInvoiceUrl && (
                                    <button
                                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                                      onClick={() =>
                                        void openAuthedAsset(
                                          order.operationInvoiceUrl!,
                                          "Không thể mở hóa đơn vận hành.",
                                        ).catch((error: unknown) =>
                                          setMessage(
                                            error instanceof Error
                                              ? error.message
                                              : "Không thể mở hóa đơn vận hành.",
                                          ),
                                        )
                                      }
                                      type="button"
                                    >
                                      <FileText size={14} />
                                      Hóa đơn vận hành
                                    </button>
                                  )}
                                </div>
                              </div>
                              {(order.notes ||
                                order.reviewNotes ||
                                order.revokeReason) && (
                                <div className="rounded-2xl border border-slate-200 bg-white p-4 md:col-span-2">
                                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Ghi chú
                                  </p>
                                  <div className="mt-3 space-y-2 text-sm text-slate-600">
                                    {order.notes && (
                                      <p>Ghi chú kinh doanh: {order.notes}</p>
                                    )}
                                    {order.reviewNotes && (
                                      <p>Ghi chú duyệt: {order.reviewNotes}</p>
                                    )}
                                    {order.revokeReason && (
                                      <p className="text-purple-700">
                                        Lý do thu hồi: {order.revokeReason}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>

                            {isPendingReview && canReviewOrders ? (
                              <div className="rounded-2xl border border-sky-200 bg-white p-4">
                                <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">
                                  Duyệt vận hành
                                </p>
                                <div className="mt-4 grid gap-3">
                                  <label className="block text-sm text-slate-600">
                                    Thời hạn (ngày)
                                    <input
                                      className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm"
                                      min="1"
                                      onChange={(event) =>
                                        setDurationDays((current) => ({
                                          ...current,
                                          [order.id]: event.target.value,
                                        }))
                                      }
                                      type="number"
                                      value={
                                        durationDays[order.id] ??
                                        String(
                                          order.requestedDurationDays ?? 365,
                                        )
                                      }
                                    />
                                  </label>
                                  <label className="block text-sm text-slate-600">
                                    Hóa đơn vận hành
                                    <input
                                      accept="application/pdf,image/jpeg,image/png,image/webp"
                                      className="mt-1 block w-full text-sm text-slate-600"
                                      onChange={(event) =>
                                        setOperationInvoices((current) => ({
                                          ...current,
                                          [order.id]:
                                            event.target.files?.[0] ?? null,
                                        }))
                                      }
                                      type="file"
                                    />
                                  </label>
                                  <label className="block text-sm text-slate-600">
                                    Ghi chú xét duyệt
                                    <textarea
                                      className="mt-1 min-h-24 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                                      onChange={(event) =>
                                        setReviewNotes((current) => ({
                                          ...current,
                                          [order.id]: event.target.value,
                                        }))
                                      }
                                      placeholder="Ghi chú xét duyệt"
                                      value={
                                        reviewNotes[order.id] ??
                                        order.reviewNotes ??
                                        ""
                                      }
                                    />
                                  </label>
                                  <div className="flex flex-wrap gap-2 pt-1">
                                    <button
                                      className="inline-flex h-10 items-center gap-2 rounded-xl bg-teal-700 px-4 text-sm font-medium text-white hover:bg-teal-800 disabled:opacity-60"
                                      disabled={actionOrderId === order.id}
                                      onClick={() =>
                                        void approveOrder(order.id)
                                      }
                                      type="button"
                                    >
                                      <CheckCircle2 size={16} />
                                      Phê duyệt quyền truy cập
                                    </button>
                                    <button
                                      className="inline-flex h-10 items-center gap-2 rounded-xl border border-rose-200 px-4 text-sm font-medium text-rose-700 hover:bg-rose-50 disabled:opacity-60"
                                      disabled={actionOrderId === order.id}
                                      onClick={() => void rejectOrder(order.id)}
                                      type="button"
                                    >
                                      <XCircle size={16} />
                                      Từ chối
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-500">
                                {canReviewOrders
                                  ? "Đơn hàng này hiện không cần thao tác xét duyệt."
                                  : "Vai trò của bạn chỉ có quyền xem. Bộ phận vận hành có thể duyệt, từ chối hoặc thu hồi trong cùng hàng đợi."}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
              {!isLoading && orders.length === 0 && (
                <tr>
                  <td
                    className="px-5 py-10 text-center text-sm text-slate-500"
                    colSpan={7}
                  >
                    Không có đơn phù hợp với bộ lọc hiện tại.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {hasMore && (
          <div className="border-t border-slate-200 px-5 py-4">
            <button
              className="h-10 rounded-xl border border-slate-200 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
              disabled={isLoadingMore}
              onClick={() => void loadOrders(nextCursor ?? undefined, true)}
              type="button"
            >
              {isLoadingMore ? "Đang tải..." : "Xem thêm"}
            </button>
          </div>
        )}
      </section>

      {revokeOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setRevokeOrder(null)}
          />
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start gap-3">
              <div className="grid size-11 place-items-center rounded-2xl bg-purple-50 text-purple-700">
                <ShieldAlert size={18} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-950">
                  Thu hồi quyền đã duyệt?
                </h2>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Thao tác này sẽ hoàn nguyên hoa hồng và hủy gói học gắn với{" "}
                  {revokeOrder.customerEmail}.
                </p>
              </div>
            </div>
            <textarea
              className="mt-5 min-h-28 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none ring-0 placeholder:text-slate-400"
              onChange={(event) => setRevokeReason(event.target.value)}
              placeholder="Lý do thu hồi (không bắt buộc)"
              value={revokeReason}
            />
            <div className="mt-5 flex justify-end gap-3">
              <button
                className="h-10 rounded-xl border border-slate-200 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
                onClick={() => setRevokeOrder(null)}
                type="button"
              >
                Hủy
              </button>
              <button
                className="h-10 rounded-xl bg-purple-700 px-4 text-sm font-medium text-white hover:bg-purple-800 disabled:opacity-60"
                disabled={isRevoking}
                onClick={() => void confirmRevoke()}
                type="button"
              >
                {isRevoking ? "Đang thu hồi..." : "Xác nhận thu hồi"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resubmit Modal */}
      {pendingResubmit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setPendingResubmit(null)}
          />
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start gap-3">
              <div className="grid size-11 place-items-center rounded-2xl bg-sky-50 text-sky-700">
                <RotateCcw size={18} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-950">
                  Gửi lại đơn bị từ chối?
                </h2>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Thao tác này sẽ chuyển đơn về <strong>Chờ duyệt</strong> cho{" "}
                  {pendingResubmit.customerEmail}. Có thể đính kèm hóa đơn kinh
                  doanh mới.
                </p>
              </div>
            </div>
            <div className="mt-5">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Hóa đơn kinh doanh mới (không bắt buộc)
              </label>
              <input
                type="file"
                accept="application/pdf,image/jpeg,image/png,image/webp"
                className="block w-full text-sm text-slate-600"
                onChange={(e) => setResubmitFile(e.target.files?.[0] ?? null)}
              />
            </div>
            <div className="mt-5 flex justify-end gap-3">
              <button
                className="h-10 rounded-xl border border-slate-200 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
                onClick={() => setPendingResubmit(null)}
                type="button"
              >
                Hủy
              </button>
              <button
                className="h-10 rounded-xl bg-sky-700 px-4 text-sm font-medium text-white hover:bg-sky-800 disabled:opacity-60"
                disabled={isResubmitting}
                onClick={() => void resubmitOrder(pendingResubmit)}
                type="button"
              >
                {isResubmitting ? "Đang gửi lại..." : "Xác nhận gửi lại"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
