"use client";

import {
  Edit2,
  Package,
  Plus,
  Save,
  ToggleLeft,
  ToggleRight,
  X,
} from "lucide-react";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { getStoredAccessToken } from "../../session-storage";
import {
  adminPackagesRoles,
  adminPackageManageRoles,
  hasAllowedRole,
  useStoredAdminSession,
} from "../_lib/admin-session";

const apiBase = `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"}/v1`;

type ActivationPackage = {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  amountVnd: number;
  durationDays: number;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

type PackageForm = {
  code: string;
  name: string;
  description: string;
  amountVnd: string;
  durationDays: string;
  sortOrder: string;
};

function emptyForm(): PackageForm {
  return {
    code: "",
    name: "",
    description: "",
    amountVnd: "",
    durationDays: "",
    sortOrder: "0",
  };
}

function packageToForm(pkg: ActivationPackage): PackageForm {
  return {
    code: pkg.code,
    name: pkg.name,
    description: pkg.description ?? "",
    amountVnd: pkg.amountVnd.toString(),
    durationDays: pkg.durationDays.toString(),
    sortOrder: pkg.sortOrder.toString(),
  };
}

function formatVnd(amount: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
}

async function apiFetch(path: string, options?: RequestInit) {
  const token = getStoredAccessToken();
  if (!token) {
    throw new Error(
      "Phiên đã hết hạn. Hãy đăng nhập lại từ trang tổng quan chính.",
    );
  }

  const res = await fetch(`${apiBase}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options?.headers ?? {}),
    },
  });
  return res;
}

export default function PackagesPage() {
  const { loaded, roles } = useStoredAdminSession();
  const [packages, setPackages] = useState<ActivationPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<PackageForm>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const canViewPackages = hasAllowedRole(roles, adminPackagesRoles);
  const canManagePackages = hasAllowedRole(roles, adminPackageManageRoles);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch("/channel-admin/packages");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as ActivationPackage[];
      setPackages(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không thể tải danh sách gói");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!loaded || !canViewPackages) {
      return;
    }

    const timer = window.setTimeout(() => {
      void load();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [canViewPackages, load, loaded]);

  if (!loaded) {
    return (
      <div className="px-8 py-8 max-w-5xl">
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
          Đang kiểm tra quyền quản lý gói...
        </div>
      </div>
    );
  }

  if (!canViewPackages) {
    return (
      <div className="px-8 py-8 max-w-5xl">
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
          <h1 className="text-lg font-semibold text-amber-950">
            Vai trò này không được quản lý gói và bảng giá.
          </h1>
          <p className="mt-2 text-sm leading-6 text-amber-900">
            Hãy mở không gian quản trị phù hợp với phạm vi quyền của bạn.
          </p>
        </div>
      </div>
    );
  }

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm());
    setSaveError(null);
    setShowForm(true);
  }

  function openEdit(pkg: ActivationPackage) {
    setEditingId(pkg.id);
    setForm(packageToForm(pkg));
    setSaveError(null);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setSaveError(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);

    const body = {
      code: form.code.trim(),
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      amountVnd: Number(form.amountVnd),
      durationDays: Number(form.durationDays),
      sortOrder: Number(form.sortOrder),
    };

    try {
      const res = editingId
        ? await apiFetch(`/channel-admin/packages/${editingId}`, {
            method: "PATCH",
            body: JSON.stringify(body),
          })
        : await apiFetch("/channel-admin/packages", {
            method: "POST",
            body: JSON.stringify(body),
          });

      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as {
          message?: string | string[];
        };
        const msg = Array.isArray(err.message)
          ? err.message.join(", ")
          : (err.message ?? "Lưu thất bại");
        setSaveError(msg);
        return;
      }

      await load();
      closeForm();
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Lưu thất bại");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(pkg: ActivationPackage) {
    setTogglingId(pkg.id);
    try {
      await apiFetch(`/channel-admin/packages/${pkg.id}`, {
        method: "PATCH",
        body: JSON.stringify({ isActive: !pkg.isActive }),
      });
      await load();
    } finally {
      setTogglingId(null);
    }
  }

  return (
    <div className="px-8 py-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
            <Package size={16} />
            <span>Quản lý bảng giá</span>
          </div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Gói kích hoạt
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Quản lý gói tự phục vụ. Thay đổi có hiệu lực ngay lập tức.
          </p>
        </div>
        {canManagePackages && <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-slate-950 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors"
        >
          <Plus size={16} />
          Gói mới
        </button>}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 px-4 py-3 bg-rose-50 border border-rose-200 rounded-lg text-sm text-rose-800">
          {error}
        </div>
      )}

      {/* Package list */}
      {loading ? (
        <div className="grid gap-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 rounded-xl bg-slate-100 animate-pulse"
            />
          ))}
        </div>
      ) : packages.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <Package size={36} className="mx-auto mb-3 text-slate-300" />
          <p className="font-medium">Chưa có gói nào</p>
          <p className="text-sm mt-1">{canManagePackages ? "Tạo gói đầu tiên" : "Chưa có gói để xem"}</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className={`bg-white rounded-xl border transition-all ${
                pkg.isActive
                  ? "border-slate-200"
                  : "border-slate-100 opacity-60"
              }`}
            >
              <div className="px-5 py-4 flex items-center gap-4">
                {/* Sort order badge */}
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 grid place-items-center text-xs font-semibold text-slate-600">
                  {pkg.sortOrder || "—"}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-slate-900">
                      {pkg.name}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono">
                      {pkg.code}
                    </span>
                    {!pkg.isActive && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                        Ngừng hoạt động
                      </span>
                    )}
                  </div>
                  {pkg.description && (
                    <p className="text-sm text-slate-500 mt-0.5">
                      {pkg.description}
                    </p>
                  )}
                </div>

                {/* Price + Duration */}
                <div className="text-right flex-shrink-0 hidden sm:block">
                  <p className="font-semibold text-slate-900">
                    {formatVnd(pkg.amountVnd)}
                  </p>
                  <p className="text-xs text-slate-500">
                    {pkg.durationDays} ngày
                  </p>
                </div>

                {/* Actions */}
                {canManagePackages && <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => toggleActive(pkg)}
                    disabled={togglingId === pkg.id}
                    title={pkg.isActive ? "Ngừng kích hoạt" : "Kích hoạt"}
                    className="text-slate-400 hover:text-slate-700 transition-colors"
                  >
                    {pkg.isActive ? (
                      <ToggleRight size={22} className="text-teal-600" />
                    ) : (
                      <ToggleLeft size={22} />
                    )}
                  </button>
                  <button
                    onClick={() => openEdit(pkg)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    <Edit2 size={13} />
                    Chỉnh sửa
                  </button>
                </div>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stat bar */}
      {packages.length > 0 && (
        <p className="mt-4 text-xs text-slate-400">
          {packages.filter((p) => p.isActive).length} đang hoạt động /{" "}
          {packages.length} tổng số gói
        </p>
      )}

      {/* Slide-in form panel */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex">
          {/* Overlay */}
          <div className="flex-1 bg-black/30" onClick={closeForm} />
          {/* Panel */}
          <div className="w-full max-w-md bg-white shadow-2xl flex flex-col">
            <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">
              <h2 className="font-semibold text-slate-900">
                {editingId ? "Chỉnh sửa gói" : "Gói mới"}
              </h2>
              <button
                onClick={closeForm}
                className="text-slate-400 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="flex-1 overflow-y-auto px-6 py-5 space-y-4"
            >
              {/* Code (only when creating) */}
              {!editingId && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Mã <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.code}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, code: e.target.value }))
                    }
                    placeholder="ví dụ: SAU-THANG"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    Mã duy nhất, dùng chữ in hoa và dấu gạch nối.
                  </p>
                </div>
              )}

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Tên <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  placeholder="ví dụ: quyền truy cập 6 tháng"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Mô tả
                </label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  placeholder="Mô tả không bắt buộc hiển thị cho khách hàng"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 resize-none"
                />
              </div>

              {/* Price + Duration */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Giá (VND) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={1000}
                    value={form.amountVnd}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, amountVnd: e.target.value }))
                    }
                    placeholder="300000"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Thời hạn (ngày) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={3650}
                    value={form.durationDays}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, durationDays: e.target.value }))
                    }
                    placeholder="30"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                  />
                </div>
              </div>

              {/* Sort order */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Thứ tự hiển thị
                </label>
                <input
                  type="number"
                  min={0}
                  value={form.sortOrder}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, sortOrder: e.target.value }))
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                />
                <p className="text-xs text-slate-400 mt-1">
                  Số nhỏ hơn sẽ hiển thị trước.
                </p>
              </div>

              {/* Preview */}
              {form.amountVnd && form.durationDays && (
                <div className="bg-teal-50 border border-teal-200 rounded-lg px-4 py-3">
                  <p className="text-xs font-semibold text-teal-700 uppercase tracking-wide mb-1">
                    Xem trước
                  </p>
                  <p className="font-semibold text-teal-900">
                    {form.name || "(chưa đặt tên)"} —{" "}
                    {formatVnd(Number(form.amountVnd))} / {form.durationDays}{" "}
                    ngày
                  </p>
                  <p className="text-xs text-teal-700 mt-0.5">
                    ≈{" "}
                    {(
                      Number(form.amountVnd) / Number(form.durationDays)
                    ).toFixed(0)}{" "}
                    VND/ngày
                  </p>
                </div>
              )}

              {saveError && (
                <div className="px-3 py-2 bg-rose-50 border border-rose-200 rounded-lg text-sm text-rose-700">
                  {saveError}
                </div>
              )}
            </form>

            <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeForm}
                className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-slate-950 text-white text-sm font-medium rounded-lg hover:bg-slate-800 disabled:opacity-60 transition-colors"
              >
                {saving ? (
                  <>Đang lưu...</>
                ) : (
                  <>
                    <Save size={15} />
                    {editingId ? "Lưu thay đổi" : "Tạo gói"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
