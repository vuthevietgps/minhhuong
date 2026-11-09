"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { apiBaseUrl, readApiError } from "../lib/api";
import { formatStatusCodeVi } from "../lib/format";
import type { ParentChild, ParentChildrenPayload, Session } from "../types";

// ---------------------------------------------------------------------------
// ParentFamilyPanel — quản lý hồ sơ con (thêm / xóa)
// ---------------------------------------------------------------------------
export function ParentFamilyPanel({ session }: { session: Session }) {
  const [children, setChildren] = useState<ParentChild[]>([]);
  const [childName, setChildName] = useState("");
  const [addStatus, setAddStatus] = useState("");
  const [addLoading, setAddLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const authHeaders = useMemo(
    () => ({ Authorization: `Bearer ${session.accessToken}` }),
    [session.accessToken],
  );

  const loadChildren = useCallback(async () => {
    try {
      const res = await fetch(`${apiBaseUrl}/v1/parent/children`, {
        headers: authHeaders,
      });
      if (res.ok) {
        const data = (await res.json()) as ParentChildrenPayload;
        setChildren(data.children);
      }
    } finally {
      setLoading(false);
    }
  }, [authHeaders]);

  useEffect(() => {
    void loadChildren();
  }, [loadChildren]);

  async function handleAddChild(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setAddLoading(true);
    setAddStatus("");
    try {
      const res = await fetch(`${apiBaseUrl}/v1/parent/children`, {
        method: "POST",
        headers: { ...authHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({ displayName: childName.trim() }),
      });
      if (!res.ok)
        throw new Error(await readApiError(res, "Không thể thêm hồ sơ con."));
      setAddStatus("Đã thêm hồ sơ thành công!");
      setChildName("");
      await loadChildren();
    } catch (err) {
      setAddStatus(err instanceof Error ? err.message : "Lỗi khi thêm hồ sơ.");
    } finally {
      setAddLoading(false);
    }
  }

  async function handleDeleteChild(childProfileId: string) {
    setConfirmDeleteId(null);
    setDeletingId(childProfileId);
    try {
      const res = await fetch(
        `${apiBaseUrl}/v1/parent/children/${childProfileId}`,
        {
          method: "DELETE",
          headers: authHeaders,
        },
      );
      if (!res.ok)
        throw new Error(await readApiError(res, "Không thể xóa hồ sơ."));
      await loadChildren();
    } catch {
      // ignore
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section className="space-y-5">
      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <h3 className="text-sm font-semibold">Thêm hồ sơ học sinh</h3>
        <p className="mt-1 text-xs text-slate-500">
          Nhập tên của con để tạo hồ sơ học tập mới.
        </p>
        <form
          className="mt-3 flex gap-2"
          onSubmit={(e) => void handleAddChild(e)}
        >
          <input
            className="h-9 flex-1 rounded-lg border border-slate-300 px-3 text-sm"
            onChange={(e) => setChildName(e.target.value)}
            placeholder="Tên con (ví dụ: Bé Minh)"
            required
            type="text"
            value={childName}
          />
          <button
            className="h-9 rounded-lg bg-teal-700 px-4 text-sm font-medium text-white disabled:opacity-60"
            disabled={addLoading}
            type="submit"
          >
            {addLoading ? "Đang thêm..." : "Thêm"}
          </button>
        </form>
        {addStatus && <p className="mt-2 text-sm text-teal-700">{addStatus}</p>}
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Đang tải...</p>
      ) : children.length === 0 ? (
        <p className="text-sm text-slate-500">
          Chưa có hồ sơ học sinh nào. Hãy thêm hồ sơ đầu tiên!
        </p>
      ) : (
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <h3 className="mb-3 text-sm font-semibold">
            Hồ sơ học sinh ({children.length})
          </h3>
          <ul className="divide-y divide-slate-100">
            {children.map((child) => (
              <li
                className="flex items-center justify-between gap-3 py-3"
                key={child.id}
              >
                <div>
                  <p className="text-sm font-medium">{child.displayName}</p>
                  {child.subscription && (
                    <p className="text-xs text-slate-500">
                      Gói: {formatStatusCodeVi(child.subscription.status)} · Hết
                      hạn{" "}
                      {new Date(
                        child.subscription.currentPeriodEnd,
                      ).toLocaleDateString("vi-VN")}
                    </p>
                  )}
                </div>
                {confirmDeleteId === child.id ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">
                      Xác nhận xóa?
                    </span>
                    <button
                      className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
                      disabled={deletingId === child.id}
                      onClick={() => void handleDeleteChild(child.id)}
                      type="button"
                    >
                      {deletingId === child.id ? "Đang xóa..." : "Xác nhận"}
                    </button>
                    <button
                      className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                      onClick={() => setConfirmDeleteId(null)}
                      type="button"
                    >
                      Không
                    </button>
                  </div>
                ) : (
                  <button
                    className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                    disabled={deletingId === child.id}
                    onClick={() => setConfirmDeleteId(child.id)}
                    type="button"
                  >
                    Xóa hồ sơ
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
