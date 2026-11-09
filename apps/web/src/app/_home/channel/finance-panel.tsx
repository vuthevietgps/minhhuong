"use client";

import { WalletCards } from "lucide-react";
import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { apiBaseUrl, openAuthenticatedUpload, readApiError } from "../lib/api";
import { formatMoney, formatRoleCodeVi, formatStatusCodeVi } from "../lib/format";
import type {
  ChannelParticipantSummary,
  CommissionEarning,
  Role,
  Session,
} from "../types";

type CommissionSummary = {
  availableCents: number;
  heldCents: number;
  currency: string;
};

type PayoutRequest = {
  id: string;
  participant?: ChannelParticipantSummary;
  status: "PENDING_REVIEW" | "APPROVED" | "REJECTED" | "PAID" | "CANCELED";
  amountCents: number;
  currency: string;
  bankName: string;
  bankAccountNumber: string;
  bankAccountName: string;
  requestNotes?: string;
  reviewNotes?: string;
  payoutInvoiceUrl?: string;
  createdAt: string;
  paidAt?: string;
  beneficiaryUser?: {
    email: string;
    profile?: {
      displayName?: string;
    };
  };
  beneficiaryAgency?: {
    code: string;
    name: string;
  };
};

type ChannelFinanceOverview = {
  orders: number;
  approvedRevenueCents: number;
  approvedOrderCount: number;
  pendingPayoutCents: number;
  pendingPayoutCount: number;
  paidPayoutCents: number;
  paidPayoutCount: number;
  wallet: CommissionSummary;
};

type ChannelWallet = {
  summary: CommissionSummary;
  earnings: CommissionEarning[];
  payoutRequests: PayoutRequest[];
  participant?: {
    id: string;
    code: string;
    displayName: string;
    commissionRateBps?: number | null;
    baseSalaryCents?: number;
  } | null;
};

export function ChannelFinancePanel({
  role,
  session,
}: {
  role: Role;
  session: Session;
}) {
  const canRequestPayout =
    role === "SALE" || role === "AGENCY_OWNER" || role === "AGENCY_MANAGER";
  const canPayPayout = role === "OPERATIONS" || role === "ADMIN";
  const [overview, setOverview] = useState<ChannelFinanceOverview | null>(null);
  const [wallet, setWallet] = useState<ChannelWallet | null>(null);
  const [payouts, setPayouts] = useState<PayoutRequest[]>([]);
  const [amountVnd, setAmountVnd] = useState("100000");
  const [bankName, setBankName] = useState("Vietcombank");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [bankAccountName, setBankAccountName] = useState("");
  const [requestNotes, setRequestNotes] = useState("");
  const [payoutInvoices, setPayoutInvoices] = useState<
    Record<string, File | null>
  >({});
  const [payoutReviewNotes, setPayoutReviewNotes] = useState<
    Record<string, string>
  >({});
  const [message, setMessage] = useState("Đang tải tài chính kênh.");
  const [isSaving, setIsSaving] = useState(false);

  const authHeaders = useMemo(
    () => ({ Authorization: `Bearer ${session.accessToken}` }),
    [session.accessToken],
  );

  const loadFinance = useCallback(async () => {
    try {
      const [overviewResponse, walletResponse, payoutsResponse] =
        await Promise.all([
          fetch(`${apiBaseUrl}/v1/channel-finance/overview`, {
            headers: authHeaders,
          }),
          fetch(`${apiBaseUrl}/v1/channel-finance/wallet`, {
            headers: authHeaders,
          }),
          fetch(`${apiBaseUrl}/v1/channel-finance/payouts`, {
            headers: authHeaders,
          }),
        ]);

      if (!overviewResponse.ok || !walletResponse.ok || !payoutsResponse.ok) {
        throw new Error("Vai trò này không được truy cập API tài chính kênh.");
      }

      setOverview((await overviewResponse.json()) as ChannelFinanceOverview);
      setWallet((await walletResponse.json()) as ChannelWallet);
      setPayouts((await payoutsResponse.json()) as PayoutRequest[]);
      setMessage("Đã tải ví hoa hồng và danh sách chi trả.");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Không thể tải tài chính kênh.",
      );
    }
  }, [authHeaders]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadFinance();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadFinance]);

  async function createPayoutRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canRequestPayout) {
      return;
    }
    if (Number(amountVnd) > availableWithdrawalVnd) {
      setMessage("Số tiền rút vượt quá số dư hoa hồng khả dụng.");
      return;
    }

    setIsSaving(true);
    setMessage("Đang tạo yêu cầu chi trả...");

    try {
      const response = await fetch(`${apiBaseUrl}/v1/channel-finance/payouts`, {
        method: "POST",
        headers: {
          ...authHeaders,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amountVnd: Number(amountVnd),
          bankName,
          bankAccountNumber,
          bankAccountName,
          requestNotes,
        }),
      });
      if (!response.ok) {
        throw new Error(
          await readApiError(response, "Không thể tạo yêu cầu chi trả."),
        );
      }

      setMessage("Đã gửi yêu cầu chi trả để bộ phận vận hành duyệt.");
      setRequestNotes("");
      await loadFinance();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Không thể tạo yêu cầu chi trả.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function payPayout(payoutId: string) {
    const payoutInvoice = payoutInvoices[payoutId];
    if (!canPayPayout || !payoutInvoice) {
      setMessage("Cần tải hóa đơn chi trả trước khi đánh dấu đã chi.");
      return;
    }

    setIsSaving(true);
    setMessage("Đang xử lý chi trả...");

    try {
      const formData = new FormData();
      formData.append("reviewNotes", payoutReviewNotes[payoutId] ?? "");
      formData.append("payoutInvoice", payoutInvoice);

      const response = await fetch(
        `${apiBaseUrl}/v1/channel-finance/payouts/${payoutId}/pay`,
        {
          method: "POST",
          headers: authHeaders,
          body: formData,
        },
      );
      if (!response.ok) {
        throw new Error(
          await readApiError(response, "Không thể xử lý yêu cầu chi trả."),
        );
      }

      setMessage("Đã đánh dấu chi trả và lưu hóa đơn.");
      await loadFinance();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Không thể xử lý yêu cầu chi trả.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function rejectPayout(payoutId: string) {
    if (!canPayPayout) {
      return;
    }

    setIsSaving(true);
    setMessage("Đang từ chối yêu cầu chi trả...");

    try {
      const response = await fetch(
        `${apiBaseUrl}/v1/channel-finance/payouts/${payoutId}/reject`,
        {
          method: "POST",
          headers: {
            ...authHeaders,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            reviewNotes:
              payoutReviewNotes[payoutId] ?? "Bị bộ phận vận hành từ chối.",
          }),
        },
      );
      if (!response.ok) {
        throw new Error(
          await readApiError(response, "Không thể từ chối yêu cầu chi trả."),
        );
      }

      setMessage("Đã từ chối chi trả và hoàn lại số dư tạm giữ.");
      await loadFinance();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Không thể từ chối yêu cầu chi trả.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  const summary = overview?.wallet ?? wallet?.summary;
  const participant = wallet?.participant;
  const recentEarnings = wallet?.earnings ?? [];
  const pendingPayouts = payouts.filter(
    (payout) => payout.status === "PENDING_REVIEW",
  );
  const availableWithdrawalVnd = Math.floor(
    (summary?.availableCents ?? 0) / 100,
  );
  const canWithdrawNow = canRequestPayout && availableWithdrawalVnd > 0;
  const commissionRatePct =
    participant?.commissionRateBps != null
      ? (participant.commissionRateBps / 100).toFixed(1) + "%"
      : null;

  return (
    <section className="mt-4 rounded-lg border border-slate-200 bg-white p-4 sm:p-5">
      <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
            Tài chính kênh
          </p>
          <h2 className="mt-1 text-xl font-semibold">Ví hoa hồng và chi trả</h2>
          <p className="mt-1 text-sm text-slate-500">{message}</p>
          {commissionRatePct && (
            <p className="mt-1 text-xs text-teal-700">
              Tỷ lệ hoa hồng:{" "}
              <span className="font-semibold">{commissionRatePct}</span>
              {participant?.displayName ? ` · ${participant.displayName}` : ""}
            </p>
          )}
        </div>
        <div className="grid grid-cols-3 border-y border-slate-200 text-center lg:min-w-96">
          {[
            [
              "Khả dụng",
              formatMoney(
                summary?.availableCents ?? 0,
                summary?.currency ?? "VND",
              ),
            ],
            [
              "Tạm giữ",
              formatMoney(summary?.heldCents ?? 0, summary?.currency ?? "VND"),
            ],
            ["Đang chờ", String(pendingPayouts.length)],
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

      <div className="mt-4 grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg bg-slate-100 p-4">
              <p className="text-xs text-slate-500">Doanh thu đã duyệt</p>
              <p className="mt-2 text-xl font-semibold">
                {formatMoney(overview?.approvedRevenueCents ?? 0, "VND")}
              </p>
            </div>
            <div className="rounded-lg bg-slate-100 p-4">
              <p className="text-xs text-slate-500">Khoản đã chi</p>
              <p className="mt-2 text-xl font-semibold">
                {formatMoney(overview?.paidPayoutCents ?? 0, "VND")}
              </p>
            </div>
          </div>

          {canRequestPayout && (
            <form
              className="mt-4 space-y-3 border-t border-slate-200 pt-4"
              onSubmit={createPayoutRequest}
            >
              <h3 className="text-base font-semibold">Yêu cầu rút tiền</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="flex items-center justify-between gap-3 text-sm font-medium text-slate-700">
                    Số tiền (VND)
                    <button
                      className="text-xs font-medium text-teal-700 disabled:text-slate-400"
                      disabled={!canWithdrawNow}
                      onClick={() =>
                        setAmountVnd(String(availableWithdrawalVnd))
                      }
                      type="button"
                    >
                      Dùng toàn bộ số dư
                    </button>
                  </span>
                  <input
                    className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm"
                    min="10000"
                    max={Math.max(availableWithdrawalVnd, 10000)}
                    onChange={(event) => setAmountVnd(event.target.value)}
                    type="number"
                    value={amountVnd}
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">
                    Ngân hàng
                  </span>
                  <input
                    className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm"
                    onChange={(event) => setBankName(event.target.value)}
                    value={bankName}
                  />
                </label>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">
                    Số tài khoản
                  </span>
                  <input
                    className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm"
                    onChange={(event) =>
                      setBankAccountNumber(event.target.value)
                    }
                    value={bankAccountNumber}
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">
                    Tên chủ tài khoản
                  </span>
                  <input
                    className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm"
                    onChange={(event) => setBankAccountName(event.target.value)}
                    value={bankAccountName}
                  />
                </label>
              </div>
              <input
                className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm"
                onChange={(event) => setRequestNotes(event.target.value)}
                placeholder="Ghi chú rút tiền"
                value={requestNotes}
              />
              <button
                className="flex h-10 items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-medium text-white disabled:opacity-60"
                disabled={isSaving || !canWithdrawNow}
                type="submit"
              >
                <WalletCards size={18} />
                {canWithdrawNow ? "Yêu cầu chi trả" : "Không có số dư khả dụng"}
              </button>
            </form>
          )}

          <div className="mt-4">
            <h3 className="text-base font-semibold">Hoa hồng gần đây</h3>
            <div className="mt-3 max-h-72 divide-y divide-slate-200 overflow-auto border-y border-slate-200">
              {recentEarnings.map((earning) => (
                <div className="py-3" key={earning.id}>
                  <p className="text-sm font-medium">
                    {formatMoney(earning.amountCents, earning.currency)} /{" "}
                    {earning.rateBps / 100}%
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {earning.participant?.code ??
                      formatRoleCodeVi(earning.beneficiaryType)}
                    {earning.beneficiaryAgency
                      ? ` / ${earning.beneficiaryAgency.code}`
                      : ""}
                    {earning.activationOrder
                      ? ` / ${earning.activationOrder.customerEmail}`
                      : ""}
                  </p>
                </div>
              ))}
              {recentEarnings.length === 0 && (
                <div className="py-8 text-center text-sm text-slate-500">
                  Chưa có khoản hoa hồng nào.
                </div>
              )}
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold">Yêu cầu chi trả</h3>
            <span className="text-xs text-slate-500">
              {payouts.length} bản ghi
            </span>
          </div>
          <div className="mt-3 max-h-[520px] divide-y divide-slate-200 overflow-auto border-y border-slate-200">
            {payouts.map((payout) => (
              <div className="py-3" key={payout.id}>
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold">
                        {formatMoney(payout.amountCents, payout.currency)} /{" "}
                        {formatStatusCodeVi(payout.status)}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {payout.beneficiaryAgency?.code ??
                          payout.participant?.code ??
                          payout.beneficiaryUser?.profile?.displayName ??
                          payout.beneficiaryUser?.email ??
                          "Người thụ hưởng"}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {payout.bankName} / {payout.bankAccountNumber} /{" "}
                        {payout.bankAccountName}
                      </p>
                    </div>
                    {payout.payoutInvoiceUrl && (
                      <button
                        className="h-8 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium"
                        onClick={() => {
                          void openAuthenticatedUpload(
                            payout.payoutInvoiceUrl!,
                            session.accessToken,
                          ).catch((error: unknown) => {
                            setMessage(
                              error instanceof Error
                                ? error.message
                                : "Không thể mở hóa đơn chi trả.",
                            );
                          });
                        }}
                        type="button"
                      >
                        Hóa đơn chi trả
                      </button>
                    )}
                  </div>

                  {canPayPayout && payout.status === "PENDING_REVIEW" && (
                    <div className="grid gap-2 rounded-lg bg-slate-50 p-3">
                      <input
                        accept="application/pdf,image/jpeg,image/png,image/webp"
                        className="block w-full text-sm text-slate-600"
                        onChange={(event) =>
                          setPayoutInvoices((current) => ({
                            ...current,
                            [payout.id]: event.target.files?.[0] ?? null,
                          }))
                        }
                        type="file"
                      />
                      <input
                        className="h-9 rounded-lg border border-slate-300 px-3 text-sm"
                        onChange={(event) =>
                          setPayoutReviewNotes((current) => ({
                            ...current,
                            [payout.id]: event.target.value,
                          }))
                        }
                        placeholder="Ghi chú duyệt"
                        value={payoutReviewNotes[payout.id] ?? ""}
                      />
                      <div className="flex flex-wrap gap-2">
                        <button
                          className="h-9 rounded-lg bg-teal-700 px-3 text-xs font-medium text-white disabled:opacity-60"
                          disabled={isSaving}
                          onClick={() => void payPayout(payout.id)}
                          type="button"
                        >
                          Đánh dấu đã chi
                        </button>
                        <button
                          className="h-9 rounded-lg border border-rose-200 px-3 text-xs font-medium text-rose-700 disabled:opacity-60"
                          disabled={isSaving}
                          onClick={() => void rejectPayout(payout.id)}
                          type="button"
                        >
                          Từ chối
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {payouts.length === 0 && (
              <div className="py-8 text-center text-sm text-slate-500">
                Chưa có yêu cầu chi trả.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
