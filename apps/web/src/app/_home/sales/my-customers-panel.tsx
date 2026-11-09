"use client";

import { useEffect, useMemo, useState } from "react";
import { apiBaseUrl, readApiError } from "../lib/api";
import { formatDate, formatStatusCodeVi } from "../lib/format";
import type { ActivationOrderStatus, Session } from "../types";
import { activationStatusLabels } from "./activation-status";

type MyCustomer = {
  id: string;
  email: string;
  status: string;
  displayName?: string | null;
  subscription: { status: string; currentPeriodEnd: string } | null;
  totalOrders: number;
  approvedOrders: number;
  latestOrder: {
    id: string;
    status: string;
    packageName?: string | null;
    expiresAt?: string | null;
    createdAt: string;
  };
};

export function MyCustomersPanel({ session }: { session: Session }) {
  const [customers, setCustomers] = useState<MyCustomer[]>([]);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("Đang tải khách hàng...");

  const authHeaders = useMemo(
    () => ({ Authorization: `Bearer ${session.accessToken}` }),
    [session.accessToken],
  );

  useEffect(() => {
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(
          `${apiBaseUrl}/v1/activation-orders/my-customers`,
          {
            headers: authHeaders,
          },
        );
        if (!response.ok) {
          throw new Error(
            await readApiError(response, "Không thể tải khách hàng."),
          );
        }
        const data = (await response.json()) as { customers: MyCustomer[] };
        const list = data.customers;
        setCustomers(list);
        setMessage(`${list.length} customer(s) found.`);
      } catch (error) {
        setMessage(
          error instanceof Error ? error.message : "Không thể tải khách hàng.",
        );
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [authHeaders]);

  return (
    <section className="mt-4 rounded-lg border border-slate-200 bg-white p-4 sm:p-5">
      <div className="border-b border-slate-200 pb-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
          Khách hàng của tôi
        </p>
        <h2 className="mt-1 text-xl font-semibold">Danh sách học viên</h2>
        <p className="mt-1 text-sm text-slate-500">{message}</p>
        <input
          className="mt-2 h-9 w-full rounded-lg border border-slate-300 px-3 text-sm sm:max-w-xs"
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Tìm theo tên hoặc email..."
          type="search"
          value={search}
        />
      </div>

      <div className="mt-3 divide-y divide-slate-200">
        {customers.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-500">
            Chưa có khách hàng.
          </p>
        ) : (
          customers
            .filter(
              (c) =>
                !search ||
                c.email.toLowerCase().includes(search.toLowerCase()) ||
                (c.displayName ?? "")
                  .toLowerCase()
                  .includes(search.toLowerCase()),
            )
            .map((customer) => (
              <div
                className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between"
                key={customer.id}
              >
                <div>
                  <p className="text-sm font-medium">
                    {customer.displayName ?? customer.email}
                  </p>
                  <p className="text-xs text-slate-500">{customer.email}</p>
                  {customer.subscription && (
                    <p className="text-xs text-teal-700">
                      Gói học:{" "}
                      {formatStatusCodeVi(customer.subscription.status)} · hết
                      hạn {formatDate(customer.subscription.currentPeriodEnd)}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap gap-3 text-xs text-slate-600">
                  <span>
                    {customer.approvedOrders}/{customer.totalOrders} đã duyệt
                  </span>
                  {customer.latestOrder && (
                    <span
                      className={
                        customer.latestOrder.status === "APPROVED"
                          ? "text-teal-700"
                          : "text-amber-700"
                      }
                    >
                      {activationStatusLabels[
                        customer.latestOrder.status as ActivationOrderStatus
                      ] ?? customer.latestOrder.status}
                    </span>
                  )}
                  {customer.latestOrder?.expiresAt && (
                    <span>
                      Hết hạn {formatDate(customer.latestOrder.expiresAt)}
                    </span>
                  )}
                </div>
              </div>
            ))
        )}
      </div>
    </section>
  );
}
