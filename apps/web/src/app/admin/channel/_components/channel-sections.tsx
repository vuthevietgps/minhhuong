"use client";

import { Building2, ShieldCheck } from "lucide-react";
import { formatMoney, formatRoleVi, formatStatusVi } from "../../_lib/admin-client";
import type { ChannelPageState } from "./use-channel-page-state";

/** Commission policy list. */
export function CommissionPoliciesSection(state: ChannelPageState) {
  const { canManageGlobal, openPolicyEditor, policies } = state;
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
        <ShieldCheck size={18} />
        Các chính sách hoa hồng
      </div>
      <div className="mt-4 space-y-3">
        {policies.map((policy) => (
          <article
            className="rounded-2xl border border-slate-200 p-4"
            key={policy.id}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-950">
                  {policy.code} • {policy.name}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {policy.beneficiaryType} •{" "}
                  {(policy.rateBps / 100).toFixed(1)}% • lương{" "}
                  {formatMoney(policy.baseSalaryCents, "VND")}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${policy.isActive ? "bg-teal-50 text-teal-700" : "bg-slate-100 text-slate-600"}`}
                >
                  {policy.isActive ? "Đang hoạt động" : "Không hoạt động"}
                </span>
                {canManageGlobal && (
                  <button
                    className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    onClick={() => openPolicyEditor(policy)}
                    type="button"
                  >
                    Chỉnh sửa
                  </button>
                )}
              </div>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              {policy.isDefaultForSale
                ? "Chính sách kinh doanh mặc định"
                : policy.isDefaultForAgency
                  ? "Chính sách đại lý mặc định"
                  : "Chính sách riêng"}
            </p>
          </article>
        ))}
        {policies.length === 0 && (
          <div className="rounded-2xl bg-slate-50 px-4 py-6 text-sm text-slate-500">
            Chưa cấu hình chính sách hoa hồng.
          </div>
        )}
      </div>
    </section>
  );
}

/** Agency list. */
export function AgenciesSection(state: ChannelPageState) {
  const {
    agencies,
    canManageGlobal,
    canManageMembers,
    openAgencyEditor,
    openMemberEditor,
  } = state;
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
        <Building2 size={18} />
        Đại lý
      </div>
      <div className="mt-4 space-y-3">
        {agencies.map((agency) => (
          <article
            className="rounded-2xl border border-slate-200 p-4"
            key={agency.id}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-950">
                  {agency.code} • {agency.name}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {formatStatusVi(agency.status)} • tỷ lệ{" "}
                  {(
                    (agency.channelParticipant?.commissionRateBps ??
                      agency.defaultRateBps) / 100
                  ).toFixed(1)}
                  %
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                  {agency._count.activationOrders} đơn hàng
                </span>
                {canManageGlobal && (
                  <button
                    className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    onClick={() => openAgencyEditor(agency)}
                    type="button"
                  >
                    Chỉnh sửa
                  </button>
                )}
              </div>
            </div>
            {agency.notes && (
              <p className="mt-3 text-sm text-slate-500">{agency.notes}</p>
            )}
            <div className="mt-3 space-y-2">
              {agency.members.length > 0 ? (
                agency.members.map((member) => (
                  <div
                    className="flex items-start justify-between gap-3 rounded-2xl bg-slate-50 px-3 py-3"
                    key={member.id}
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-800">
                        {member.user.profile?.displayName ??
                          member.user.email}{" "}
                        • {formatRoleVi(member.role)}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {member.user.email}
                        {member.title ? ` • ${member.title}` : ""}
                        {member.referralCode
                          ? ` • ${member.referralCode}`
                          : ""}
                        {member.rateBps != null
                          ? ` • ${(member.rateBps / 100).toFixed(1)}%`
                          : ""}
                        {member.isActive
                          ? " • đang hoạt động"
                          : " • không hoạt động"}
                      </p>
                    </div>
                    {canManageMembers &&
                      (canManageGlobal || member.role === "SALE") && (
                        <button
                          className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-white"
                          onClick={() => openMemberEditor(agency, member)}
                          type="button"
                        >
                          Sửa thành viên
                        </button>
                      )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">
                  Thành viên: Chưa có
                </p>
              )}
            </div>
            <p className="mt-2 text-xs text-slate-500">
              {agency._count.commissions} dòng hoa hồng •{" "}
              {agency._count.payoutRequests} khoản chi trả
            </p>
          </article>
        ))}
        {agencies.length === 0 && (
          <div className="rounded-2xl bg-slate-50 px-4 py-6 text-sm text-slate-500">
            Không có đại lý nào trong phạm vi này.
          </div>
        )}
      </div>
    </section>
  );
}
