"use client";

import type { AgencyMemberRole } from "./shared";
import type { ChannelPageState } from "./use-channel-page-state";

export function EditAgencyModal(state: ChannelPageState) {
  const {
    editAgencyName,
    editAgencyNotes,
    editAgencyRate,
    editAgencyStatus,
    editingAgency,
    isSaving,
    saveAgencyEdits,
    setEditAgencyName,
    setEditAgencyNotes,
    setEditAgencyRate,
    setEditAgencyStatus,
    setEditingAgency,
  } = state;
  if (!editingAgency) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => setEditingAgency(null)}
      />
      <div className="relative w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl">
        <h2 className="text-lg font-semibold text-slate-950">
          Chỉnh sửa đại lý {editingAgency.code}
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Cập nhật hồ sơ, trạng thái hoạt động và tỷ lệ hoa hồng mặc định
          ngay trong cổng.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <input
            className="h-11 rounded-2xl border border-slate-200 px-4 text-sm outline-none"
            onChange={(event) => setEditAgencyName(event.target.value)}
            placeholder="Tên đại lý"
            value={editAgencyName}
          />
          <select
            className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none"
            onChange={(event) =>
              setEditAgencyStatus(
                event.target.value as "ACTIVE" | "SUSPENDED",
              )
            }
            value={editAgencyStatus}
          >
            <option value="ACTIVE">Đang hoạt động</option>
            <option value="SUSPENDED">Tạm khóa</option>
          </select>
          <input
            className="h-11 rounded-2xl border border-slate-200 px-4 text-sm outline-none"
            onChange={(event) => setEditAgencyRate(event.target.value)}
            placeholder="Tỷ lệ mặc định (điểm cơ bản)"
            type="number"
            value={editAgencyRate}
          />
          <input
            className="h-11 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-500 outline-none"
            readOnly
            value={editingAgency.code}
          />
        </div>
        <textarea
          className="mt-3 min-h-28 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none placeholder:text-slate-400"
          onChange={(event) => setEditAgencyNotes(event.target.value)}
          placeholder="Ghi chú đại lý"
          value={editAgencyNotes}
        />
        <div className="mt-5 flex justify-end gap-3">
          <button
            className="h-10 rounded-xl border border-slate-200 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
            onClick={() => setEditingAgency(null)}
            type="button"
          >
            Hủy
          </button>
          <button
            className="h-10 rounded-xl bg-slate-950 px-4 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
            disabled={isSaving}
            onClick={() => void saveAgencyEdits()}
            type="button"
          >
            {isSaving ? "Đang lưu..." : "Lưu đại lý"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function EditPolicyModal(state: ChannelPageState) {
  const {
    editPolicyActive,
    editPolicyBaseSalary,
    editPolicyDefault,
    editPolicyName,
    editPolicyRate,
    editingPolicy,
    isSaving,
    savePolicyEdits,
    setEditPolicyActive,
    setEditPolicyBaseSalary,
    setEditPolicyDefault,
    setEditPolicyName,
    setEditPolicyRate,
    setEditingPolicy,
  } = state;
  if (!editingPolicy) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => setEditingPolicy(null)}
      />
      <div className="relative w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl">
        <h2 className="text-lg font-semibold text-slate-950">
          Chỉnh sửa chính sách hoa hồng {editingPolicy.code}
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Điều chỉnh cơ chế chi trả mặc định cho{" "}
          {editingPolicy.beneficiaryType.toLowerCase()} mà không cần tạo
          chính sách mới.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <input
            className="h-11 rounded-2xl border border-slate-200 px-4 text-sm outline-none"
            onChange={(event) => setEditPolicyName(event.target.value)}
            placeholder="Tên chính sách"
            value={editPolicyName}
          />
          <input
            className="h-11 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-500 outline-none"
            readOnly
            value={`${editingPolicy.beneficiaryType} • ${editingPolicy.code}`}
          />
          <input
            className="h-11 rounded-2xl border border-slate-200 px-4 text-sm outline-none"
            onChange={(event) => setEditPolicyRate(event.target.value)}
            placeholder="Tỷ lệ (điểm cơ bản)"
            type="number"
            value={editPolicyRate}
          />
          <input
            className="h-11 rounded-2xl border border-slate-200 px-4 text-sm outline-none"
            onChange={(event) =>
              setEditPolicyBaseSalary(event.target.value)
            }
            placeholder="Lương cơ bản (VNĐ)"
            type="number"
            value={editPolicyBaseSalary}
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-4 rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700">
          <label className="flex items-center gap-2">
            <input
              checked={editPolicyDefault}
              onChange={(event) =>
                setEditPolicyDefault(event.target.checked)
              }
              type="checkbox"
            />
            Mặc định cho {editingPolicy.beneficiaryType.toLowerCase()}
          </label>
          <label className="flex items-center gap-2">
            <input
              checked={editPolicyActive}
              onChange={(event) =>
                setEditPolicyActive(event.target.checked)
              }
              type="checkbox"
            />
            Đang hoạt động
          </label>
        </div>
        <div className="mt-5 flex justify-end gap-3">
          <button
            className="h-10 rounded-xl border border-slate-200 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
            onClick={() => setEditingPolicy(null)}
            type="button"
          >
            Hủy
          </button>
          <button
            className="h-10 rounded-xl bg-teal-700 px-4 text-sm font-medium text-white hover:bg-teal-800 disabled:opacity-60"
            disabled={isSaving}
            onClick={() => void savePolicyEdits()}
            type="button"
          >
            {isSaving ? "Đang lưu..." : "Lưu chính sách"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function EditMemberModal(state: ChannelPageState) {
  const {
    canManageGlobal,
    editMemberActive,
    editMemberRate,
    editMemberReferralCode,
    editMemberRole,
    editMemberTitle,
    editingMember,
    isSaving,
    saveMemberEdits,
    setEditMemberActive,
    setEditMemberRate,
    setEditMemberReferralCode,
    setEditMemberRole,
    setEditMemberTitle,
    setEditingMember,
  } = state;
  if (!editingMember) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => setEditingMember(null)}
      />
      <div className="relative w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl">
        <h2 className="text-lg font-semibold text-slate-950">
          Chỉnh sửa thành viên đại lý
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          {editingMember.user.profile?.displayName ??
            editingMember.user.email}{" "}
          trong {editingMember.agencyCode} • {editingMember.agencyName}
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {canManageGlobal ? (
            <select
              className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none"
              onChange={(event) =>
                setEditMemberRole(event.target.value as AgencyMemberRole)
              }
              value={editMemberRole}
            >
              <option value="SALE">Nhân viên kinh doanh</option>
              <option value="MANAGER">Quản lý</option>
              <option value="OWNER">Chủ sở hữu</option>
            </select>
          ) : (
            <input
              className="h-11 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-500 outline-none"
              readOnly
              value="Thành viên kinh doanh"
            />
          )}
          <input
            className="h-11 rounded-2xl border border-slate-200 px-4 text-sm outline-none"
            onChange={(event) => setEditMemberRate(event.target.value)}
            placeholder="Tỷ lệ (điểm cơ bản)"
            type="number"
            value={editMemberRate}
          />
          <input
            className="h-11 rounded-2xl border border-slate-200 px-4 text-sm outline-none"
            onChange={(event) => setEditMemberTitle(event.target.value)}
            placeholder="Chức danh"
            value={editMemberTitle}
          />
          <input
            className="h-11 rounded-2xl border border-slate-200 px-4 text-sm outline-none"
            onChange={(event) =>
              setEditMemberReferralCode(event.target.value)
            }
            placeholder="Mã giới thiệu"
            value={editMemberReferralCode}
          />
        </div>
        <label className="mt-3 flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700">
          <input
            checked={editMemberActive}
            onChange={(event) => setEditMemberActive(event.target.checked)}
            type="checkbox"
          />
          Thành viên đang hoạt động
        </label>
        <div className="mt-5 flex justify-end gap-3">
          <button
            className="h-10 rounded-xl border border-slate-200 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
            onClick={() => setEditingMember(null)}
            type="button"
          >
            Hủy
          </button>
          <button
            className="h-10 rounded-xl bg-slate-950 px-4 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
            disabled={isSaving}
            onClick={() => void saveMemberEdits()}
            type="button"
          >
            {isSaving ? "Đang lưu..." : "Lưu thành viên"}
          </button>
        </div>
      </div>
    </div>
  );
}
