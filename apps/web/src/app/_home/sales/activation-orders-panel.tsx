"use client";

import { CircleDollarSign } from "lucide-react";
import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { apiBaseUrl, openAuthenticatedUpload, readApiError } from "../lib/api";
import { formatDate, formatMoney, formatStatusCodeVi } from "../lib/format";
import type {
  ActivationOrder,
  ActivationOrderStatus,
  ActivationPackage,
  Role,
  SelfServiceOptions,
  Session,
} from "../types";
import { activationStatusClass, activationStatusLabels } from "./activation-status";

type FreeTrialRecord = {
  id: string;
  childProfileId: string;
  childName: string;
  parent: { email: string; displayName: string | null };
  status: "TRIALING" | "EXPIRED";
  startsAt: string;
  endsAt: string;
  maximumEnd: string;
  canExtend: boolean;
  report: { available: boolean; availableAt: string | null };
  usage: { initialAssessments: number; lessons: number; aiResponses: number };
  limits: { initialAssessments: number; lessons: number; aiResponses: number };
};

const fallbackActivationPackages: ActivationPackage[] = [
  {
    code: "one-month",
    name: "Gói học 1 tháng",
    amountVnd: 300000,
    durationDays: 30,
  },
  {
    code: "three-months",
    name: "Gói học 3 tháng",
    amountVnd: 800000,
    durationDays: 90,
  },
  {
    code: "one-year",
    name: "Gói học 1 năm",
    amountVnd: 2400000,
    durationDays: 365,
  },
];

type ActivationOrderTab = "ACTION" | "ALL" | ActivationOrderStatus;

function saleOrderNeedsAction(order: ActivationOrder) {
  return order.status === "WAITING_PAYMENT" || order.status === "REJECTED";
}

function saleOrderNextStep(order: ActivationOrder, role: Role) {
  if (order.status === "WAITING_PAYMENT") {
    return "Nhắc bổ sung minh chứng thanh toán";
  }

  if (order.status === "PENDING_REVIEW") {
    return role === "OPERATIONS" || role === "ADMIN"
      ? "Kiểm tra chuyển khoản và kích hoạt"
      : "Đang chờ bộ phận vận hành duyệt";
  }

  if (order.status === "APPROVED") {
    return order.expiresAt
      ? `Hoạt động đến ${formatDate(order.expiresAt)}`
      : "Tài khoản đang hoạt động";
  }

  if (order.status === "REJECTED") {
    return order.reviewNotes
      ? `Bị từ chối: ${order.reviewNotes}`
      : "Khắc phục vấn đề và gửi duyệt lại";
  }

  return "Không cần thao tác";
}

function orderSearchText(order: ActivationOrder) {
  return [
    order.customerEmail,
    order.customerPhone,
    order.user.profile?.displayName,
    order.status,
    order.packageName,
    order.agency?.code,
    order.channelParticipant?.code,
    order.transferContent,
    order.notes,
    order.reviewNotes,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function ActivationOrdersPanel({
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

  return (
    <section className="mt-4 rounded-lg border border-slate-200 bg-white p-4 sm:p-5">
      <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
            Đơn kích hoạt
          </p>
          <h2 className="mt-1 text-xl font-semibold">
            Bàn xử lý kinh doanh hằng ngày
          </h2>
          <p className="mt-1 text-sm text-slate-500">{message}</p>
          <button
            className="mt-2 h-7 rounded-lg border border-slate-200 px-2.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            disabled={isLoading}
            onClick={() => void loadOrders()}
            type="button"
          >
            ↺ Làm mới
          </button>
        </div>
        <div className="flex overflow-x-auto border-y border-slate-200 text-center">
          {[
            ["Cần xử lý", actionOrders.length],
            ["Đang duyệt", reviewOrders.length],
            ["Tháng này ✓", thisMonthApprovedCount],
            ["Doanh thu", formatMoney(approvedRevenueCents, "VND")],
            ["Hoa hồng", formatMoney(commissionCents, "VND")],
          ].map(([label, value], index) => (
            <div
              className={`min-w-[5rem] flex-1 shrink-0 p-3 ${index > 0 ? "border-l border-slate-200" : ""}`}
              key={label}
            >
              <p className="text-xs text-slate-500">{label}</p>
              <p className="mt-1 text-sm font-semibold">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {canExtendTrial && (
        <div className="mt-4 rounded-xl border border-violet-200 bg-violet-50 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-sm font-bold text-violet-950">
                Quản lý dùng thử
              </p>
              <p className="mt-1 text-xs text-violet-800">
                Vận hành và giám đốc chỉ có thể gia hạn tối đa 15 ngày tính từ
                lúc bắt đầu trial.
              </p>
            </div>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-violet-800">
              {trials.filter((trial) => trial.status === "TRIALING").length}{" "}
              đang dùng thử
            </span>
          </div>
          <div className="mt-3 grid gap-2">
            {trials.map((trial) => (
              <div
                className="grid gap-2 rounded-lg border border-violet-100 bg-white p-3 lg:grid-cols-[minmax(0,1fr)_auto_auto] lg:items-center"
                key={trial.id}
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {trial.childName} ·{" "}
                    {trial.parent.displayName ?? trial.parent.email}
                  </p>
                  <p className="mt-1 text-xs text-slate-600">
                    {trial.status === "TRIALING"
                      ? "Đang dùng thử"
                      : "Đã hết hạn"}{" "}
                    · hết hạn {formatDate(trial.endsAt)} · báo cáo{" "}
                    {trial.report.available
                      ? "đã mở"
                      : "mở từ ngày " +
                        formatDate(trial.report.availableAt ?? trial.endsAt)}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Đánh giá {trial.usage.initialAssessments}/
                    {trial.limits.initialAssessments} · bài học{" "}
                    {trial.usage.lessons}/{trial.limits.lessons} · AI{" "}
                    {trial.usage.aiResponses}/{trial.limits.aiResponses}
                  </p>
                </div>
                <input
                  className="h-9 w-24 rounded-lg border border-violet-200 px-2 text-sm"
                  disabled={isLoading || !trial.canExtend}
                  max="15"
                  min="1"
                  onChange={(event) =>
                    setTrialExtensionDays((current) => ({
                      ...current,
                      [trial.id]: event.target.value,
                    }))
                  }
                  placeholder="Ngày"
                  type="number"
                  value={trialExtensionDays[trial.id] ?? "1"}
                />
                <button
                  className="h-9 rounded-lg bg-violet-700 px-3 text-xs font-semibold text-white disabled:opacity-60"
                  disabled={isLoading || !trial.canExtend}
                  onClick={() => void extendTrial(trial.id)}
                  type="button"
                >
                  Gia hạn trial
                </button>
              </div>
            ))}
            {trials.length === 0 && (
              <p className="rounded-lg bg-white p-3 text-sm text-slate-500">
                Chưa có tài khoản dùng thử.
              </p>
            )}
          </div>
        </div>
      )}

      <div className="mt-4 grid gap-4 xl:grid-cols-[0.92fr_1.08fr]">
        {canCreate ? (
          <form className="space-y-3" onSubmit={createOrder}>
            <div className="rounded-lg bg-slate-100 p-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold">Đơn học viên mới</h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Kích hoạt qua nhân viên kinh doanh kèm minh chứng thanh
                    toán.
                  </p>
                </div>
                <span className="rounded-lg bg-white px-3 py-2 text-xs font-medium text-slate-700 ring-1 ring-slate-200">
                  {selectedPackage
                    ? `${selectedPackage.durationDays} ngày`
                    : "Số tiền tùy chỉnh"}
                </span>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">
                  Gói học
                </span>
                <select
                  className="mt-1 h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm"
                  onChange={(event) => selectPackage(event.target.value)}
                  value={packageCode}
                >
                  {packageOptions.map((item) => (
                    <option key={item.code} value={item.code}>
                      {item.name} - {formatMoney(item.amountVnd * 100, "VND")}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">
                  Số tiền (VND)
                </span>
                <input
                  className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm"
                  min="1000"
                  onChange={(event) => setAmountVnd(event.target.value)}
                  type="number"
                  value={amountVnd}
                />
              </label>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">
                  Email học viên{" "}
                  <span className="font-normal text-rose-500">*</span>
                </span>
                <input
                  className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm"
                  onChange={(event) => setCustomerEmail(event.target.value)}
                  placeholder="khachhang@email.com"
                  required
                  type="email"
                  value={customerEmail}
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">
                  Số điện thoại
                </span>
                <input
                  className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm"
                  onChange={(event) => setCustomerPhone(event.target.value)}
                  placeholder="0901 234 567 (không bắt buộc)"
                  type="tel"
                  value={customerPhone}
                />
              </label>
            </div>

            {customerEmail.includes("@") &&
              orders.some(
                (o) =>
                  o.customerEmail.toLowerCase() ===
                    customerEmail.toLowerCase() &&
                  (o.status === "PENDING_REVIEW" ||
                    o.status === "WAITING_PAYMENT" ||
                    o.status === "APPROVED"),
              ) && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                  ⚠️ Email này đã có đơn đang xử lý hoặc đã kích hoạt. Hãy kiểm
                  tra danh sách trước khi tạo mới.
                </div>
              )}

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">
                  Tên học viên{" "}
                  <span className="font-normal text-rose-500">*</span>
                </span>
                <input
                  className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm"
                  onChange={(event) => setDisplayName(event.target.value)}
                  placeholder="Nguyễn Văn A"
                  required
                  value={displayName}
                />
              </label>
            </div>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                Ảnh chứng từ{" "}
                <span className="font-normal text-slate-400">
                  (CK / hóa đơn — tùy chọn)
                </span>
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

            <button
              className="h-9 rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-700"
              onClick={() => setShowAdvancedFields((current) => !current)}
              type="button"
            >
              {showAdvancedFields ? "Ẩn chi tiết" : "Thêm chi tiết"}
            </button>

            {showAdvancedFields && (
              <div className="grid gap-3 rounded-lg bg-slate-50 p-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-sm font-medium text-slate-700">
                      Đại lý / mã giới thiệu
                    </span>
                    <input
                      className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm"
                      onChange={(event) => setAgencyCode(event.target.value)}
                      placeholder="Không bắt buộc"
                      value={agencyCode}
                    />
                  </label>
                </div>

                <label className="block">
                  <span className="text-sm font-medium text-slate-700">
                    Ghi chú kinh doanh
                  </span>
                  <textarea
                    className="mt-1 min-h-16 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    onChange={(event) => setNotes(event.target.value)}
                    value={notes}
                  />
                </label>
              </div>
            )}

            <button
              className="flex h-10 items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-medium text-white disabled:opacity-60"
              disabled={isLoading}
              type="submit"
            >
              <CircleDollarSign size={18} />
              Gửi bộ phận vận hành duyệt
            </button>

            {generatedPassword && (
              <div className="rounded-lg border border-teal-200 bg-teal-50 p-3">
                <p className="text-xs font-semibold text-teal-800">
                  Đã tạo tài khoản mới — hãy gửi mật khẩu tạm này cho học viên:
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <code className="flex-1 rounded bg-white px-3 py-1.5 font-mono text-sm font-bold text-teal-900 ring-1 ring-teal-200">
                    {generatedPassword}
                  </code>
                  <button
                    className="h-8 rounded-lg border border-teal-200 px-3 text-xs font-medium text-teal-800 hover:bg-teal-100"
                    onClick={() => {
                      void navigator.clipboard.writeText(generatedPassword);
                    }}
                    type="button"
                  >
                    Sao chép
                  </button>
                  <button
                    className="h-8 rounded-lg border border-slate-200 px-3 text-xs font-medium text-slate-600 hover:bg-slate-100"
                    onClick={() => {
                      setGeneratedPassword(null);
                      setLastCreatedInfo(null);
                    }}
                    type="button"
                  >
                    Đóng
                  </button>
                </div>
                {lastCreatedInfo && (
                  <button
                    className="mt-2 h-8 w-full rounded-lg border border-teal-300 bg-white px-3 text-xs font-medium text-teal-800 hover:bg-teal-50"
                    onClick={() => {
                      const msg = [
                        `🎓 Thông tin đăng nhập MinhHương`,
                        `Email: ${lastCreatedInfo.email}`,
                        `Mật khẩu tạm: ${lastCreatedInfo.password}`,
                        `Gói: ${lastCreatedInfo.packageName}`,
                        ``,
                        `Vui lòng đổi mật khẩu sau lần đăng nhập đầu tiên.`,
                      ].join("\n");
                      void navigator.clipboard.writeText(msg);
                    }}
                    type="button"
                  >
                    📋 Sao chép thông tin gửi khách (Zalo/Messenger)
                  </button>
                )}
                <p className="mt-1.5 text-xs text-teal-700">
                  Mật khẩu chỉ hiển thị một lần. Học viên nên đổi mật khẩu sau
                  lần đăng nhập đầu tiên.
                </p>
              </div>
            )}
          </form>
        ) : (
          <div className="rounded-lg bg-slate-100 p-4 text-sm text-slate-600">
            Bộ phận vận hành kiểm tra minh chứng, tải hóa đơn đối ứng và kích
            hoạt quyền học.
          </div>
        )}

        <div>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold">Danh sách đơn hàng</h3>
              <span className="text-xs text-slate-500">
                {visibleOrders.length} trong {orders.length} bản ghi
              </span>
            </div>
            <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
              <input
                className="h-10 rounded-lg border border-slate-300 px-3 text-sm"
                onChange={(event) => setOrderSearch(event.target.value)}
                placeholder="Tìm học viên, mã hoặc trạng thái"
                value={orderSearch}
              />
              <div className="flex gap-2 overflow-x-auto">
                {tabOptions.map((item) => (
                  <button
                    className={`h-10 shrink-0 rounded-lg px-3 text-xs font-medium ${
                      orderTab === item.key
                        ? "bg-slate-950 text-white"
                        : "border border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                    key={item.key}
                    onClick={() => setOrderTab(item.key)}
                    type="button"
                  >
                    {item.label} {item.count}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <label className="flex items-center gap-2 text-xs text-slate-600">
                <span>Từ ngày</span>
                <input
                  className="h-8 rounded-lg border border-slate-300 px-2 text-xs"
                  onChange={(event) => setFilterFromDate(event.target.value)}
                  type="date"
                  value={filterFromDate}
                />
              </label>
              <label className="flex items-center gap-2 text-xs text-slate-600">
                <span>Đến ngày</span>
                <input
                  className="h-8 rounded-lg border border-slate-300 px-2 text-xs"
                  onChange={(event) => setFilterToDate(event.target.value)}
                  type="date"
                  value={filterToDate}
                />
              </label>
              {(filterFromDate || filterToDate) && (
                <button
                  className="h-8 rounded-lg border border-slate-200 px-2 text-xs text-slate-600 hover:bg-slate-100"
                  onClick={() => {
                    setFilterFromDate("");
                    setFilterToDate("");
                  }}
                  type="button"
                >
                  Xóa bộ lọc ngày
                </button>
              )}
            </div>
          </div>

          {newStatusAlerts.length > 0 && (
            <div className="mt-3 space-y-2">
              {newStatusAlerts.map((alert) => (
                <div
                  className={`flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-xs font-medium ${
                    alert.newStatus === "APPROVED"
                      ? "border border-teal-200 bg-teal-50 text-teal-800"
                      : "border border-rose-200 bg-rose-50 text-rose-800"
                  }`}
                  key={alert.id}
                >
                  <span>
                    {alert.newStatus === "APPROVED" ? "✅" : "❌"} Đơn của{" "}
                    <strong>{alert.email}</strong> vừa{" "}
                    {alert.newStatus === "APPROVED"
                      ? "được duyệt"
                      : "bị từ chối"}
                  </span>
                  <button
                    className="shrink-0 rounded px-2 py-1 opacity-70 hover:opacity-100"
                    onClick={() =>
                      setNewStatusAlerts((current) =>
                        current.filter((a) => a.id !== alert.id),
                      )
                    }
                    type="button"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="mt-3 max-h-[520px] divide-y divide-slate-200 overflow-auto border-y border-slate-200">
            {visibleOrders.map((order) => (
              <div className="py-3" key={order.id}>
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold">
                          {order.customerEmail}
                        </p>
                        {order.customerPhone && (
                          <p className="text-xs text-slate-500">
                            {order.customerPhone}
                          </p>
                        )}
                        <span
                          className={`inline-flex h-7 items-center rounded-lg px-2 text-xs font-medium ring-1 ${activationStatusClass(order.status)}`}
                        >
                          {activationStatusLabels[order.status]}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-500">
                        {order.user.profile?.displayName ?? "Học viên"} /{" "}
                        {formatStatusCodeVi(order.user.status)}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {formatMoney(order.amountCents, order.currency)}
                        {order.packageName ? ` / ${order.packageName}` : ""}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {order.source === "SELF_SERVICE"
                          ? "Tự phục vụ"
                          : "Nhân viên hỗ trợ"}
                        {order.channelParticipant
                          ? ` / ${order.channelParticipant.code}`
                          : order.agency
                            ? ` / ${order.agency.code}`
                            : ""}
                        {order.transferContent
                          ? ` / ${order.transferContent}`
                          : ""}
                      </p>
                      <p className="mt-1 text-xs font-medium text-slate-700">
                        Bước tiếp theo: {saleOrderNextStep(order, role)}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Ngày tạo {formatDate(order.createdAt)}
                      </p>
                      <button
                        className="mt-0.5 font-mono text-xs text-slate-400 hover:text-slate-600"
                        onClick={() =>
                          void navigator.clipboard.writeText(order.id)
                        }
                        title="Sao chép mã đơn"
                        type="button"
                      >
                        #{order.id.slice(0, 8)}
                      </button>
                      {(order.commissionEarnings?.length ?? 0) > 0 && (
                        <p className="mt-1 text-xs text-teal-700">
                          Hoa hồng{" "}
                          {formatMoney(
                            order.commissionEarnings?.reduce(
                              (sum, earning) => sum + earning.amountCents,
                              0,
                            ) ?? 0,
                            order.currency,
                          )}
                        </p>
                      )}
                      {order.expiresAt && (
                        <p className="mt-1 text-xs text-teal-700">
                          Hết hạn {formatDate(order.expiresAt)}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {order.saleInvoiceUrl && (
                        <button
                          className="h-8 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium"
                          onClick={() => {
                            void openAuthenticatedUpload(
                              order.saleInvoiceUrl!,
                              session.accessToken,
                            ).catch((error: unknown) => {
                              setMessage(
                                error instanceof Error
                                  ? error.message
                                  : "Không thể mở hóa đơn kinh doanh.",
                              );
                            });
                          }}
                          type="button"
                        >
                          {order.source === "SELF_SERVICE"
                            ? "Minh chứng thanh toán"
                            : "Hóa đơn kinh doanh"}
                        </button>
                      )}
                      {order.operationInvoiceUrl && (
                        <button
                          className="h-8 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium"
                          onClick={() => {
                            void openAuthenticatedUpload(
                              order.operationInvoiceUrl!,
                              session.accessToken,
                            ).catch((error: unknown) => {
                              setMessage(
                                error instanceof Error
                                  ? error.message
                                  : "Không thể mở hóa đơn vận hành.",
                              );
                            });
                          }}
                          type="button"
                        >
                          Hóa đơn vận hành
                        </button>
                      )}
                    </div>
                  </div>

                  {canApprove && order.status === "WAITING_PAYMENT" && (
                    <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
                      Đang chờ học viên tải minh chứng thanh toán trước khi
                      duyệt.
                    </div>
                  )}

                  {canApprove && order.status === "PENDING_REVIEW" && (
                    <div className="grid gap-2 rounded-lg bg-slate-50 p-3 sm:grid-cols-[120px_1fr]">
                      <input
                        className="h-9 rounded-lg border border-slate-300 px-3 text-sm"
                        min="1"
                        onChange={(event) =>
                          setDurationDays((current) => ({
                            ...current,
                            [order.id]: event.target.value,
                          }))
                        }
                        placeholder={String(order.requestedDurationDays ?? 365)}
                        type="number"
                        value={
                          durationDays[order.id] ??
                          String(order.requestedDurationDays ?? 365)
                        }
                      />
                      <input
                        accept="application/pdf,image/jpeg,image/png,image/webp"
                        className="block w-full text-sm text-slate-600"
                        onChange={(event) =>
                          setOperationInvoices((current) => ({
                            ...current,
                            [order.id]: event.target.files?.[0] ?? null,
                          }))
                        }
                        type="file"
                      />
                      <input
                        className="h-9 rounded-lg border border-slate-300 px-3 text-sm sm:col-span-2"
                        onChange={(event) =>
                          setReviewNotes((current) => ({
                            ...current,
                            [order.id]: event.target.value,
                          }))
                        }
                        placeholder="Ghi chú duyệt"
                        value={reviewNotes[order.id] ?? ""}
                      />
                      <div className="flex flex-wrap gap-2 sm:col-span-2">
                        <button
                          className="h-9 rounded-lg bg-teal-700 px-3 text-xs font-medium text-white disabled:opacity-60"
                          disabled={isLoading}
                          onClick={() => void approveOrder(order.id)}
                          type="button"
                        >
                          Duyệt quyền truy cập
                        </button>
                        <button
                          className="h-9 rounded-lg border border-rose-200 px-3 text-xs font-medium text-rose-700 disabled:opacity-60"
                          disabled={isLoading}
                          onClick={() => void rejectOrder(order.id)}
                          type="button"
                        >
                          Từ chối
                        </button>
                      </div>
                    </div>
                  )}

                  {canApprove && order.status === "APPROVED" && (
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        className="h-8 rounded-lg border border-purple-200 px-3 text-xs font-medium text-purple-700 hover:bg-purple-50 disabled:opacity-60"
                        disabled={isLoading}
                        onClick={() => openRevokeModal(order.id)}
                        type="button"
                      >
                        Thu hồi quyền truy cập
                      </button>
                    </div>
                  )}

                  {canCreate && order.status === "REJECTED" && (
                    <div className="grid gap-2 rounded-lg bg-rose-50 p-3 sm:grid-cols-2">
                      <p className="text-xs font-semibold text-rose-800 sm:col-span-2">
                        Gửi duyệt lại sau khi đã khắc phục vấn đề
                      </p>
                      <input
                        accept="application/pdf,image/jpeg,image/png,image/webp"
                        className="block w-full text-sm text-slate-600 sm:col-span-2"
                        onChange={(event) =>
                          setResubmitInvoices((current) => ({
                            ...current,
                            [order.id]: event.target.files?.[0] ?? null,
                          }))
                        }
                        type="file"
                      />
                      <input
                        className="h-9 rounded-lg border border-rose-200 bg-white px-3 text-sm sm:col-span-2"
                        onChange={(event) =>
                          setResubmitNotes((current) => ({
                            ...current,
                            [order.id]: event.target.value,
                          }))
                        }
                        placeholder="Mô tả nội dung đã khắc phục (không bắt buộc)"
                        value={resubmitNotes[order.id] ?? ""}
                      />
                      <button
                        className="h-9 rounded-lg bg-rose-700 px-3 text-xs font-medium text-white disabled:opacity-60"
                        disabled={isLoading}
                        onClick={() => void resubmitOrder(order.id)}
                        type="button"
                      >
                        Gửi duyệt lại
                      </button>
                      <button
                        className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 disabled:opacity-60"
                        disabled={isLoading}
                        onClick={() => void cancelOrder(order.id)}
                        type="button"
                      >
                        Hủy đơn
                      </button>
                    </div>
                  )}

                  {canCreate &&
                    (order.status === "WAITING_PAYMENT" ||
                      order.status === "PENDING_REVIEW") && (
                      <div className="flex justify-end">
                        <button
                          className="h-8 rounded-lg border border-slate-200 px-3 text-xs font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-60"
                          disabled={isLoading}
                          onClick={() => void cancelOrder(order.id)}
                          type="button"
                        >
                          Huỷ đơn
                        </button>
                      </div>
                    )}
                </div>
              </div>
            ))}

            {visibleOrders.length === 0 && (
              <div className="py-8 text-center text-sm text-slate-500">
                Không có đơn kích hoạt phù hợp với bộ lọc.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Revoke confirmation modal */}
      {revokeOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={closeRevokeModal}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="font-semibold text-slate-900 mb-1">
              Thu hồi quyền truy cập?
            </h3>
            <p className="text-sm text-slate-500 mb-4">
              Thao tác này sẽ hủy gói học và hoàn nguyên toàn bộ hoa hồng của
              đơn. Không thể hoàn tác.
            </p>
            <textarea
              rows={3}
              value={revokeReason}
              onChange={(e) => setRevokeReason(e.target.value)}
              placeholder="Lý do thu hồi (không bắt buộc, hiển thị trong nhật ký)"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-slate-400 mb-4"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={closeRevokeModal}
                className="px-4 py-2 text-sm border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50"
              >
                Hủy
              </button>
              <button
                onClick={() => void confirmRevoke()}
                className="px-4 py-2 text-sm bg-purple-700 text-white rounded-lg hover:bg-purple-800 font-medium"
              >
                Xác nhận thu hồi
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
