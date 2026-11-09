"use client";

import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import { apiBaseUrl, readApiError } from "../lib/api";
import { formatMoney } from "../lib/format";
import type {
  ActivationPackage,
  ParentChild,
  ParentChildrenPayload,
  SelfServiceOptions,
  Session,
} from "../types";

type MyOrder = {
  id: string;
  status: string;
  source: string;
  packageName?: string | null;
  childProfile?: { id: string; displayName: string } | null;
  amountCents: number;
  currency: string;
  bankName?: string | null;
  bankAccountNumber?: string | null;
  bankAccountName?: string | null;
  transferContent?: string | null;
  saleInvoiceUrl?: string | null;
  reviewNotes?: string | null;
  activatedAt?: string | null;
  expiresAt?: string | null;
  createdAt: string;
};

const orderStatusLabel: Record<string, string> = {
  WAITING_PAYMENT: "Chờ chuyển khoản",
  PENDING_REVIEW: "Chờ duyệt",
  APPROVED: "Đã kích hoạt",
  REJECTED: "Bị từ chối",
  CANCELED: "Đã hủy",
  REVOKED: "Đã thu hồi",
};

const orderStatusColor: Record<string, string> = {
  WAITING_PAYMENT: "bg-amber-100 text-amber-800",
  PENDING_REVIEW: "bg-blue-100 text-blue-800",
  APPROVED: "bg-teal-100 text-teal-800",
  REJECTED: "bg-red-100 text-red-800",
  CANCELED: "bg-slate-100 text-slate-600",
  REVOKED: "bg-red-100 text-red-800",
};

export function ParentBillingPanel({ session }: { session: Session }) {
  const [orders, setOrders] = useState<MyOrder[]>([]);
  const [children, setChildren] = useState<ParentChild[]>([]);
  const [packages, setPackages] = useState<ActivationPackage[]>([]);
  const [childProfileId, setChildProfileId] = useState("");
  const [packageCode, setPackageCode] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const authHeaders = useMemo(
    () => ({ Authorization: `Bearer ${session.accessToken}` }),
    [session.accessToken],
  );

  useEffect(() => {
    void (async () => {
      try {
        const [res, childrenRes, optionsRes] = await Promise.all([
          fetch(`${apiBaseUrl}/v1/me/activation-orders`, { headers: authHeaders }),
          fetch(`${apiBaseUrl}/v1/parent/children`, { headers: authHeaders }),
          fetch(`${apiBaseUrl}/v1/activation-orders/self-service/options`),
        ]);
        if (!res.ok)
          throw new Error(await readApiError(res, "Không thể tải đơn hàng."));
        if (!childrenRes.ok)
          throw new Error(await readApiError(childrenRes, "Không thể tải hồ sơ con."));
        if (!optionsRes.ok)
          throw new Error(await readApiError(optionsRes, "Không thể tải gói học."));
        const data = (await res.json()) as { orders: MyOrder[] };
        const childData = (await childrenRes.json()) as ParentChildrenPayload;
        const optionData = (await optionsRes.json()) as SelfServiceOptions;
        setOrders(data.orders);
        setChildren(childData.children);
        setPackages(optionData.packages);
        setChildProfileId((current) => current || childData.children[0]?.id || "");
        setPackageCode((current) => current || optionData.packages[0]?.code || "");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Lỗi tải dữ liệu.");
      } finally {
        setLoading(false);
      }
    })();
  }, [authHeaders]);

  async function createOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setNotice("");
    try {
      const response = await fetch(`${apiBaseUrl}/v1/activation-orders/self-service/parent`, {
        method: "POST",
        headers: { ...authHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({ childProfileId, packageCode, referralCode: referralCode.trim() || undefined }),
      });
      if (!response.ok) throw new Error(await readApiError(response, "Không thể tạo đơn."));
      const listResponse = await fetch(`${apiBaseUrl}/v1/me/activation-orders`, { headers: authHeaders });
      if (!listResponse.ok) throw new Error(await readApiError(listResponse, "Không thể tải lại đơn."));
      const data = (await listResponse.json()) as { orders: MyOrder[] };
      setOrders(data.orders);
      setNotice("Đã tạo đơn. Hãy chuyển khoản theo thông tin bên dưới và tải minh chứng thanh toán.");
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Không thể tạo đơn.");
    } finally {
      setSubmitting(false);
    }
  }

  async function uploadProof(orderId: string, file: File) {
    setNotice("");
    const form = new FormData();
    form.append("paymentProof", file);
    try {
      const response = await fetch(`${apiBaseUrl}/v1/activation-orders/self-service/parent/${orderId}/payment-proof`, {
        method: "POST",
        headers: authHeaders,
        body: form,
      });
      if (!response.ok) throw new Error(await readApiError(response, "Không thể tải minh chứng."));
      const listResponse = await fetch(`${apiBaseUrl}/v1/me/activation-orders`, { headers: authHeaders });
      if (!listResponse.ok) throw new Error(await readApiError(listResponse, "Không thể tải lại đơn."));
      const data = (await listResponse.json()) as { orders: MyOrder[] };
      setOrders(data.orders);
      setNotice("Đã gửi minh chứng. Đơn đang chờ duyệt.");
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Không thể tải minh chứng.");
    }
  }

  if (loading)
    return <p className="text-sm text-slate-500 py-6">Đang tải đơn hàng...</p>;
  if (error) return <p className="text-sm text-red-600 py-6">{error}</p>;

  return (
    <div className="space-y-4">
      <form className="rounded-lg border border-slate-200 bg-white p-5 space-y-3" onSubmit={createOrder}>
        <h3 className="font-semibold">Mua gói học cho con</h3>
        {children.length === 0 ? (
          <p className="text-sm text-slate-600">Hãy tạo hồ sơ con trong mục Các con trước khi mua gói.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm">Hồ sơ con
              <select className="mt-1 w-full rounded-lg border border-slate-300 p-2" value={childProfileId} onChange={(event) => setChildProfileId(event.target.value)}>
                {children.map((child) => <option key={child.id} value={child.id}>{child.displayName}</option>)}
              </select>
            </label>
            <label className="text-sm">Gói học
              <select className="mt-1 w-full rounded-lg border border-slate-300 p-2" value={packageCode} onChange={(event) => setPackageCode(event.target.value)}>
                {packages.map((pkg) => <option key={pkg.code} value={pkg.code}>{pkg.name} · {pkg.amountVnd.toLocaleString("vi-VN")} ₫ / {pkg.durationDays} ngày</option>)}
              </select>
            </label>
          </div>
        )}
        <label className="block text-sm">Mã giới thiệu (nếu có)
          <input className="mt-1 w-full rounded-lg border border-slate-300 p-2" value={referralCode} onChange={(event) => setReferralCode(event.target.value)} />
        </label>
        <button className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50" disabled={submitting || !childProfileId || !packageCode} type="submit">{submitting ? "Đang tạo đơn..." : "Tạo đơn thanh toán"}</button>
        {notice && <p className="text-sm text-slate-700" role="status">{notice}</p>}
      </form>
      {orders.length === 0 && <p className="text-sm text-slate-500">Chưa có đơn thanh toán nào.</p>}
      {orders.map((order) => {
        const statusLabel = orderStatusLabel[order.status] ?? order.status;
        const statusColor =
          orderStatusColor[order.status] ?? "bg-slate-100 text-slate-600";
        return (
          <article
            className="rounded-lg border border-slate-200 bg-white p-5"
            key={order.id}
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-medium">{order.packageName ?? "Gói học"}</p>
                {order.childProfile && <p className="text-xs text-slate-500">Cho {order.childProfile.displayName}</p>}
                <p className="mt-0.5 text-xs text-slate-500">
                  {formatMoney(order.amountCents, order.currency)} &middot;{" "}
                  {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                </p>
              </div>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor}`}
              >
                {statusLabel}
              </span>
            </div>
            {order.status === "WAITING_PAYMENT" && order.transferContent && (
              <div className="mt-4 rounded-lg bg-amber-50 p-4 text-sm">
                <p className="font-semibold text-amber-900">
                  Thông tin chuyển khoản
                </p>
                <table className="mt-2 w-full">
                  <tbody className="text-slate-700">
                    {order.bankName && (
                      <tr>
                        <td className="py-0.5 pr-4 text-slate-500 text-xs w-32">
                          Ngân hàng
                        </td>
                        <td className="font-medium">{order.bankName}</td>
                      </tr>
                    )}
                    {order.bankAccountNumber && (
                      <tr>
                        <td className="py-0.5 pr-4 text-slate-500 text-xs">
                          Số TK
                        </td>
                        <td className="font-medium">
                          {order.bankAccountNumber}
                        </td>
                      </tr>
                    )}
                    {order.bankAccountName && (
                      <tr>
                        <td className="py-0.5 pr-4 text-slate-500 text-xs">
                          Tên TK
                        </td>
                        <td className="font-medium">{order.bankAccountName}</td>
                      </tr>
                    )}
                    <tr>
                      <td className="py-0.5 pr-4 text-slate-500 text-xs">
                        Nội dung CK
                      </td>
                      <td className="font-semibold text-teal-800">
                        {order.transferContent}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-0.5 pr-4 text-slate-500 text-xs">
                        Số tiền
                      </td>
                      <td className="font-semibold">
                        {formatMoney(order.amountCents, order.currency)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
            {order.status === "WAITING_PAYMENT" && order.source === "SELF_SERVICE" && (
              <label className="mt-3 block text-sm font-medium text-teal-800">Tải minh chứng chuyển khoản
                <input accept="image/png,image/jpeg,image/webp,application/pdf" className="mt-1 block w-full text-sm" onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadProof(order.id, file); }} type="file" />
              </label>
            )}
            {order.status === "APPROVED" && order.expiresAt && (
              <p className="mt-2 text-xs text-teal-700">
                Hết hạn: {new Date(order.expiresAt).toLocaleDateString("vi-VN")}
              </p>
            )}
            {order.reviewNotes && (
              <p className="mt-2 text-xs text-red-600">
                Ghi chú: {order.reviewNotes}
              </p>
            )}
          </article>
        );
      })}
    </div>
  );
}
