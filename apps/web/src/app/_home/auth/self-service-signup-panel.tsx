"use client";

import { CircleDollarSign, Sparkles, WalletCards } from "lucide-react";
import {
  FormEvent,
  useCallback,
  useEffect,
  useState,
} from "react";
import { apiBaseUrl, readApiError } from "../lib/api";
import { formatDate, formatMoney } from "../lib/format";
import type { ActivationOrder, BankTransferInfo, SelfServiceOptions } from "../types";

type FreeTrial = {
  childProfile: {
    id: string;
    displayName: string;
  };
  trial: {
    subscriptionId: string;
    status: "TRIALING";
    startsAt: string;
    endsAt: string;
    reportAvailableAt: string;
    limits: {
      initialAssessments: number;
      lessons: number;
      aiResponses: number;
    };
  };
  login: { email: string };
};

export function SelfServiceSignupPanel() {
  const [options, setOptions] = useState<SelfServiceOptions | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [packageCode, setPackageCode] = useState("one-year");
  const [notes, setNotes] = useState("");
  const [createdOrder, setCreatedOrder] = useState<ActivationOrder | null>(
    null,
  );
  const [createdTrial, setCreatedTrial] = useState<FreeTrial | null>(null);
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [message, setMessage] = useState(
    "Dùng thử 3 ngày không cần thẻ hoặc chuyển khoản. Giá gói luôn hiển thị công khai.",
  );
  const [isSaving, setIsSaving] = useState(false);

  const loadOptions = useCallback(async () => {
    try {
      const response = await fetch(
        `${apiBaseUrl}/v1/activation-orders/self-service/options`,
      );
      if (!response.ok) {
        throw new Error(
          await readApiError(
            response,
            "Không thể tải các lựa chọn thanh toán.",
          ),
        );
      }

      const data = (await response.json()) as SelfServiceOptions;
      setOptions(data);
      setPackageCode(data.packages[0]?.code ?? "one-year");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Không thể tải các lựa chọn thanh toán.",
      );
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadOptions();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadOptions]);

  const selectedPackage =
    options?.packages.find((item) => item.code === packageCode) ??
    options?.packages[0];

  async function createSelfServiceOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedPackage) {
      setMessage("Hãy chọn gói học trước.");
      return;
    }

    setIsSaving(true);
    setMessage("Đang tạo yêu cầu thanh toán...");

    try {
      const response = await fetch(
        `${apiBaseUrl}/v1/activation-orders/self-service`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            password,
            displayName,
            packageCode: selectedPackage.code,
            notes,
          }),
        },
      );
      if (!response.ok) {
        throw new Error(
          await readApiError(response, "Không thể tạo yêu cầu thanh toán."),
        );
      }

      const data = (await response.json()) as {
        order: ActivationOrder;
        bankTransfer: BankTransferInfo;
      };
      setCreatedOrder(data.order);
      setOptions((current) =>
        current ? { ...current, bankTransfer: data.bankTransfer } : current,
      );
      setMessage(
        "Hãy chuyển khoản đúng nội dung, sau đó tải minh chứng thanh toán lên.",
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Không thể tạo yêu cầu thanh toán.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function startFreeTrial() {
    if (!email.trim() || password.length < 8 || !displayName.trim()) {
      setMessage(
        "Hãy nhập email, mật khẩu ít nhất 8 ký tự và tên học sinh để bắt đầu dùng thử.",
      );
      return;
    }

    setIsSaving(true);
    setMessage("Đang mở dùng thử 3 ngày...");

    try {
      const response = await fetch(
        `${apiBaseUrl}/v1/activation-orders/self-service/trial`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, displayName }),
        },
      );
      if (!response.ok) {
        throw new Error(await readApiError(response, "Không thể mở dùng thử."));
      }

      const data = (await response.json()) as FreeTrial;
      setCreatedTrial(data);
      setMessage(
        "Đã mở dùng thử. Đăng nhập bằng email và mật khẩu vừa tạo để bắt đầu học.",
      );
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Không thể mở dùng thử.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function uploadPaymentProof() {
    if (!createdOrder || !paymentProof) {
      setMessage("Hãy chọn ảnh hoặc tệp PDF minh chứng thanh toán trước.");
      return;
    }

    setIsSaving(true);
    setMessage("Đang tải minh chứng thanh toán...");

    try {
      const formData = new FormData();
      formData.append("email", createdOrder.customerEmail);
      formData.append("paymentProof", paymentProof);

      const response = await fetch(
        `${apiBaseUrl}/v1/activation-orders/self-service/${createdOrder.id}/payment-proof`,
        {
          method: "POST",
          body: formData,
        },
      );
      if (!response.ok) {
        throw new Error(
          await readApiError(response, "Không thể tải minh chứng thanh toán."),
        );
      }

      const updated = (await response.json()) as ActivationOrder;
      setCreatedOrder(updated);
      setMessage(
        "Đã nhận minh chứng thanh toán. Bộ phận vận hành sẽ kích hoạt tài khoản sau khi xét duyệt.",
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Không thể tải minh chứng thanh toán.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="mt-6 border-t border-slate-200 pt-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Đăng ký tự phục vụ</h2>
          <p className="mt-1 text-sm text-slate-500">
            Dùng thử trước, chỉ thanh toán khi thấy phù hợp. Không tự động trừ
            tiền và không gọi điện đại trà.
          </p>
        </div>
        <WalletCards className="text-slate-500" size={22} />
      </div>

      <form className="mt-4 grid gap-3" onSubmit={createSelfServiceOrder}>
        <div className="rounded-xl border border-teal-200 bg-teal-50 p-3 text-sm text-teal-950">
          <p className="font-semibold">Dùng thử 3 ngày miễn phí</p>
          <p className="mt-1 leading-5 text-teal-800">
            Bao gồm 1 bài đánh giá đầu vào, 2 bài học và tối đa 5 lượt trợ lý
            AI. Cuối ngày thứ 2, phụ huynh xem được báo cáo tiến độ và lộ trình
            đề xuất.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">
              Email phụ huynh
            </span>
            <input
              className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="phuhuynh@email.com"
              required
              type="email"
              value={email}
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Mật khẩu</span>
            <input
              className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm"
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Tối thiểu 8 ký tự"
              required
              type="password"
              value={password}
            />
          </label>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Tên con</span>
            <input
              className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm"
              onChange={(event) => setDisplayName(event.target.value)}
              placeholder="Tên học sinh (ví dụ: Bé Minh)"
              required
              value={displayName}
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Gói học</span>
            <select
              className="mt-1 h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm"
              onChange={(event) => setPackageCode(event.target.value)}
              value={packageCode}
            >
              {(options?.packages ?? []).map((item) => (
                <option key={item.code} value={item.code}>
                  {item.name} - {item.durationDays} ngày
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Ghi chú</span>
          <input
            className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm"
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Không bắt buộc"
            value={notes}
          />
        </label>

        <div className="grid gap-2 sm:grid-cols-2">
          <button
            className="flex h-10 items-center justify-center gap-2 rounded-lg bg-teal-700 px-4 text-sm font-medium text-white disabled:opacity-60"
            disabled={isSaving}
            onClick={() => void startFreeTrial()}
            type="button"
          >
            <Sparkles size={18} />
            Dùng thử miễn phí 3 ngày
          </button>
          <button
            className="flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-800 disabled:opacity-60"
            disabled={isSaving || !selectedPackage}
            type="submit"
          >
            <CircleDollarSign size={18} />
            Mua gói ngay
          </button>
        </div>
      </form>

      {selectedPackage && (
        <div className="mt-3 rounded-lg bg-slate-100 p-3 text-sm text-slate-600">
          Giá gói công khai:{" "}
          {formatMoney(selectedPackage.amountVnd * 100, "VND")} /{" "}
          {selectedPackage.durationDays} ngày. Không tự động trừ tiền.
        </div>
      )}

      {createdTrial && (
        <div className="mt-3 rounded-lg border border-teal-200 bg-teal-50 p-3 text-sm text-teal-950">
          <p className="font-semibold">
            Đã mở dùng thử cho {createdTrial.childProfile.displayName}
          </p>
          <p className="mt-1">
            Hết hạn lúc {formatDate(createdTrial.trial.endsAt)}. Tài khoản, tiến
            độ và báo cáo vẫn được giữ lại sau khi trial kết thúc; chỉ AI và bài
            học mới bị khóa.
          </p>
          <p className="mt-1 text-teal-800">
            Đăng nhập bằng {createdTrial.login.email} để bắt đầu.
          </p>
        </div>
      )}

      {createdOrder && (
        <div className="mt-3 rounded-lg border border-teal-200 bg-teal-50 p-3">
          <div className="grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
            <p>
              Ngân hàng:{" "}
              <span className="font-medium">
                {createdOrder.bankName ?? options?.bankTransfer.bankName}
              </span>
            </p>
            <p>
              Tài khoản:{" "}
              <span className="font-medium">
                {createdOrder.bankAccountNumber ??
                  options?.bankTransfer.accountNumber}
              </span>
            </p>
            <p>
              Chủ tài khoản:{" "}
              <span className="font-medium">
                {createdOrder.bankAccountName ??
                  options?.bankTransfer.accountName}
              </span>
            </p>
            <p>
              Nội dung:{" "}
              <span className="font-medium">
                {createdOrder.transferContent}
              </span>
            </p>
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto]">
            <input
              accept="application/pdf,image/jpeg,image/png,image/webp"
              className="block w-full text-sm text-slate-600"
              onChange={(event) =>
                setPaymentProof(event.target.files?.[0] ?? null)
              }
              type="file"
            />
            <button
              className="h-10 rounded-lg bg-slate-950 px-4 text-sm font-medium text-white disabled:opacity-60"
              disabled={isSaving || createdOrder.status === "PENDING_REVIEW"}
              onClick={() => void uploadPaymentProof()}
              type="button"
            >
              Tải minh chứng
            </button>
          </div>
        </div>
      )}

      <p className="mt-3 text-sm text-slate-500">{message}</p>
    </section>
  );
}
