"use client";

import { ShieldCheck, UserPlus } from "lucide-react";
import { buildTemporaryPassword } from "./shared";
import type { AgencyMemberRole, ChannelAccountRole } from "./shared";
import type { ChannelPageState } from "./use-channel-page-state";

/** "Thiết lập và quản trị": create agencies, channel accounts and members. */
export function ChannelSetupSection(state: ChannelPageState) {
  const {
    accountAgencyCode,
    accountBaseSalary,
    accountEmail,
    accountName,
    accountPassword,
    accountRateBps,
    accountReferralCode,
    accountRole,
    addMember,
    agencies,
    agencyCode,
    agencyName,
    agencyNotes,
    agencyRate,
    canManageGlobal,
    canManageMembers,
    canManageScopedMembers,
    createAgency,
    createChannelAccount,
    effectiveAccountRole,
    isSaving,
    memberEmail,
    memberRate,
    memberReferralCode,
    memberRole,
    memberTitle,
    policyBaseSalary,
    policyCode,
    policyIsActive,
    policyIsDefault,
    policyName,
    policyRate,
    policyType,
    selectedAgencyId,
    setAccountAgencyCode,
    setAccountBaseSalary,
    setAccountEmail,
    setAccountName,
    setAccountPassword,
    setAccountRateBps,
    setAccountReferralCode,
    setAccountRole,
    setAgencyCode,
    setAgencyName,
    setAgencyNotes,
    setAgencyRate,
    setMemberEmail,
    setMemberRate,
    setMemberReferralCode,
    setMemberRole,
    setMemberTitle,
    setPolicyBaseSalary,
    setPolicyCode,
    setPolicyIsActive,
    setPolicyIsDefault,
    setPolicyName,
    setPolicyRate,
    setPolicyType,
    setSelectedAgencyId,
    upsertPolicy,
  } = state;
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
        <ShieldCheck size={18} />
        Thiết lập và quản trị
      </div>
      <p className="mt-2 text-sm text-slate-500">
        {canManageGlobal
          ? "Tạo đại lý, cấp tài khoản kênh, gán thành viên và quản lý quy tắc hoa hồng mặc định."
          : canManageScopedMembers
            ? "Tạo tài khoản kinh doanh, gán mã giới thiệu và quản lý nhân viên trong phạm vi đại lý."
            : "Xem cấu trúc đại lý và thiết lập kênh trong phạm vi hiện tại."}
      </p>

      {canManageMembers ? (
        <div className="mt-5 space-y-5">
          {canManageGlobal && (
            <form className="space-y-3" onSubmit={createAgency}>
              <h2 className="text-base font-semibold text-slate-950">
                Tạo đại lý
              </h2>
              <div className="grid gap-3 sm:grid-cols-3">
                <input
                  className="h-10 rounded-xl border border-slate-200 px-3 text-sm"
                  onChange={(event) => setAgencyCode(event.target.value)}
                  placeholder="Mã đại lý"
                  required
                  value={agencyCode}
                />
                <input
                  className="h-10 rounded-xl border border-slate-200 px-3 text-sm"
                  onChange={(event) => setAgencyName(event.target.value)}
                  placeholder="Tên đại lý"
                  required
                  value={agencyName}
                />
                <input
                  className="h-10 rounded-xl border border-slate-200 px-3 text-sm"
                  onChange={(event) => setAgencyRate(event.target.value)}
                  placeholder="Tỷ lệ mặc định (điểm cơ bản)"
                  required
                  type="number"
                  value={agencyRate}
                />
              </div>
              <textarea
                className="min-h-24 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none placeholder:text-slate-400"
                onChange={(event) => setAgencyNotes(event.target.value)}
                placeholder="Ghi chú đại lý hoặc phạm vi hoạt động"
                value={agencyNotes}
              />
              <button
                className="h-10 rounded-xl bg-slate-950 px-4 text-sm font-medium text-white disabled:opacity-60"
                disabled={isSaving}
                type="submit"
              >
                Tạo đại lý
              </button>
            </form>
          )}

          <form
            className="space-y-3 border-t border-slate-200 pt-5"
            onSubmit={createChannelAccount}
          >
            <div className="flex items-center gap-2 text-base font-semibold text-slate-950">
              <UserPlus size={18} />
              Tạo tài khoản kênh
            </div>
            {!canManageGlobal && (
              <p className="text-sm text-slate-500">
                Tài khoản tạo tại đây luôn là tài khoản kinh doanh và tự
                động thuộc phạm vi đại lý đang hoạt động của bạn.
              </p>
            )}
            <p className="text-sm text-slate-500">
              Mật khẩu tạm được tạo tự động cho mỗi tài khoản mới. Hãy tạo
              lại trước khi gửi nếu cần bàn giao mật khẩu mới.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                className="h-10 rounded-xl border border-slate-200 px-3 text-sm"
                onChange={(event) => setAccountEmail(event.target.value)}
                placeholder="Email"
                required
                type="email"
                value={accountEmail}
              />
              <div className="grid gap-2">
                <input
                  className="h-10 rounded-xl border border-slate-200 px-3 font-mono text-sm"
                  onChange={(event) =>
                    setAccountPassword(event.target.value)
                  }
                  placeholder="Mật khẩu tạm"
                  required
                  type="text"
                  value={accountPassword}
                />
                <button
                  className="justify-self-start text-xs font-medium text-teal-700 hover:text-teal-800"
                  onClick={() =>
                    setAccountPassword(buildTemporaryPassword())
                  }
                  type="button"
                >
                  Tạo mật khẩu khác
                </button>
              </div>
              <input
                className="h-10 rounded-xl border border-slate-200 px-3 text-sm"
                onChange={(event) => setAccountName(event.target.value)}
                placeholder="Tên hiển thị"
                required
                value={accountName}
              />
              {canManageGlobal ? (
                <select
                  className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm"
                  onChange={(event) =>
                    setAccountRole(
                      event.target.value as ChannelAccountRole,
                    )
                  }
                  value={accountRole}
                >
                  <option value="SALE">Nhân viên kinh doanh</option>
                  <option value="AGENCY_OWNER">Chủ đại lý</option>
                  <option value="AGENCY_MANAGER">Quản lý đại lý</option>
                </select>
              ) : (
                <input
                  className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-500"
                  readOnly
                  value="Nhân viên kinh doanh (thuộc phạm vi đại lý của bạn)"
                />
              )}
              <input
                className="h-10 rounded-xl border border-slate-200 px-3 text-sm"
                onChange={(event) =>
                  setAccountReferralCode(event.target.value)
                }
                placeholder="Mã giới thiệu (không bắt buộc)"
                value={accountReferralCode}
              />
              {effectiveAccountRole === "SALE" ? (
                <input
                  className="h-10 rounded-xl border border-slate-200 px-3 text-sm"
                  onChange={(event) =>
                    setAccountRateBps(event.target.value)
                  }
                  placeholder="Tỷ lệ hoa hồng (điểm cơ bản)"
                  required
                  type="number"
                  value={accountRateBps}
                />
              ) : (
                <input
                  className="h-10 rounded-xl border border-slate-200 px-3 text-sm"
                  onChange={(event) =>
                    setAccountAgencyCode(event.target.value)
                  }
                  placeholder="Mã đại lý"
                  required
                  value={accountAgencyCode}
                />
              )}
              {effectiveAccountRole === "SALE" && (
                <input
                  className="h-10 rounded-xl border border-slate-200 px-3 text-sm sm:col-span-2"
                  onChange={(event) =>
                    setAccountBaseSalary(event.target.value)
                  }
                  placeholder="Lương cơ bản (VNĐ)"
                  required
                  type="number"
                  value={accountBaseSalary}
                />
              )}
            </div>
            <button
              className="h-10 rounded-xl bg-slate-950 px-4 text-sm font-medium text-white disabled:opacity-60"
              disabled={isSaving}
              type="submit"
            >
              Tạo tài khoản
            </button>
          </form>

          <form
            className="space-y-3 border-t border-slate-200 pt-5"
            onSubmit={addMember}
          >
            <h2 className="text-base font-semibold text-slate-950">
              Gán thành viên vào đại lý
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <select
                className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm"
                onChange={(event) =>
                  setSelectedAgencyId(event.target.value)
                }
                value={selectedAgencyId}
              >
                {agencies.map((agency) => (
                  <option key={agency.id} value={agency.id}>
                    {agency.code} • {agency.name}
                  </option>
                ))}
              </select>
              {canManageGlobal ? (
                <select
                  className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm"
                  onChange={(event) =>
                    setMemberRole(event.target.value as AgencyMemberRole)
                  }
                  value={memberRole}
                >
                  <option value="SALE">Nhân viên kinh doanh</option>
                  <option value="MANAGER">Quản lý</option>
                  <option value="OWNER">Chủ sở hữu</option>
                </select>
              ) : (
                <input
                  className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-500"
                  readOnly
                  value="Thành viên kinh doanh"
                />
              )}
              <input
                className="h-10 rounded-xl border border-slate-200 px-3 text-sm"
                onChange={(event) => setMemberEmail(event.target.value)}
                placeholder="Email người dùng kênh"
                required
                type="email"
                value={memberEmail}
              />
              <input
                className="h-10 rounded-xl border border-slate-200 px-3 text-sm"
                onChange={(event) => setMemberTitle(event.target.value)}
                placeholder="Chức danh"
                value={memberTitle}
              />
              <input
                className="h-10 rounded-xl border border-slate-200 px-3 text-sm"
                onChange={(event) =>
                  setMemberReferralCode(event.target.value)
                }
                placeholder="Mã giới thiệu (không bắt buộc)"
                value={memberReferralCode}
              />
              <input
                className="h-10 rounded-xl border border-slate-200 px-3 text-sm"
                onChange={(event) => setMemberRate(event.target.value)}
                placeholder="Tỷ lệ (điểm cơ bản)"
                required
                type="number"
                value={memberRate}
              />
            </div>
            <button
              className="h-10 rounded-xl bg-teal-700 px-4 text-sm font-medium text-white disabled:opacity-60"
              disabled={isSaving || agencies.length === 0}
              type="submit"
            >
              Gán thành viên
            </button>
          </form>

          {canManageGlobal && (
            <form
              className="space-y-3 border-t border-slate-200 pt-5"
              onSubmit={upsertPolicy}
            >
              <h2 className="text-base font-semibold text-slate-950">
                Chính sách hoa hồng
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  className="h-10 rounded-xl border border-slate-200 px-3 text-sm"
                  onChange={(event) => setPolicyCode(event.target.value)}
                  placeholder="Mã chính sách"
                  value={policyCode}
                />
                <input
                  className="h-10 rounded-xl border border-slate-200 px-3 text-sm"
                  onChange={(event) => setPolicyName(event.target.value)}
                  placeholder="Tên chính sách"
                  value={policyName}
                />
                <select
                  className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm"
                  onChange={(event) =>
                    setPolicyType(event.target.value as "SALE" | "AGENCY")
                  }
                  value={policyType}
                >
                  <option value="SALE">Nhân viên kinh doanh</option>
                  <option value="AGENCY">Đại lý</option>
                </select>
                <input
                  className="h-10 rounded-xl border border-slate-200 px-3 text-sm"
                  onChange={(event) => setPolicyRate(event.target.value)}
                  placeholder="Tỷ lệ (điểm cơ bản)"
                  type="number"
                  value={policyRate}
                />
                <input
                  className="h-10 rounded-xl border border-slate-200 px-3 text-sm"
                  onChange={(event) =>
                    setPolicyBaseSalary(event.target.value)
                  }
                  placeholder="Lương cơ bản (VNĐ)"
                  type="number"
                  value={policyBaseSalary}
                />
                <div className="flex items-center gap-4 rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700">
                  <label className="flex items-center gap-2">
                    <input
                      checked={policyIsDefault}
                      onChange={(event) =>
                        setPolicyIsDefault(event.target.checked)
                      }
                      type="checkbox"
                    />
                    Đặt làm mặc định
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      checked={policyIsActive}
                      onChange={(event) =>
                        setPolicyIsActive(event.target.checked)
                      }
                      type="checkbox"
                    />
                    Đang hoạt động
                  </label>
                </div>
              </div>
              <button
                className="h-10 rounded-xl bg-teal-700 px-4 text-sm font-medium text-white disabled:opacity-60"
                disabled={isSaving}
                type="submit"
              >
                Lưu chính sách
              </button>
            </form>
          )}
        </div>
      ) : (
        <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
          Vai trò này được xem cấu trúc kênh, nhưng thao tác thiết lập chỉ
          dành cho Quản trị viên và Vận hành.
        </div>
      )}
    </section>
  );
}
