"use client";

import type { ParentTab, Session } from "../types";
import { ParentBillingPanel } from "./billing-panel";
import { ParentChildLearningPanel } from "./child-learning-panel";
import { ParentChildrenPanel } from "./children-panel";
import { ParentFamilyPanel } from "./family-panel";
import { ParentLearningPathPanel } from "./learning-path-panel";
import { ParentLearningReportPanel } from "./learning-report-panel";
import { ParentProfilePanel } from "./profile-panel";

export function ParentPortal({
  activeTab,
  onLogout,
  onTabChange,
  session,
}: {
  activeTab: ParentTab;
  onLogout: () => void;
  onTabChange: (tab: ParentTab) => void;
  session: Session;
}) {
  const tabs: Array<{ id: ParentTab; label: string }> = [
    { id: "children", label: "Tổng quan" },
    { id: "learning", label: "Cùng con học" },
    { id: "learningPath", label: "Lộ trình học" },
    { id: "family", label: "Các con" },
    { id: "reports", label: "Kết quả" },
    { id: "billing", label: "Gói học" },
    { id: "profile", label: "Tài khoản" },
  ];

  return (
    <section className="mt-6 scroll-mt-4" id="parent-portal-panel">
      <div
        aria-label="Khu vực dành cho phụ huynh"
        className="kid-tab-rail flex gap-2 overflow-x-auto border-b border-slate-200 pb-1"
        role="tablist"
      >
        {tabs.map((tab) => (
          <button
            aria-selected={activeTab === tab.id}
            className={`min-h-11 shrink-0 rounded-t-lg px-4 py-2 text-sm font-bold transition-colors ${
              activeTab === tab.id
                ? "border-b-2 border-teal-600 text-teal-700"
                : "text-slate-500 hover:text-slate-800"
            }`}
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            role="tab"
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="mt-4">
        {activeTab === "children" && (
          <ParentChildrenPanel
            onSwitchToBilling={() => onTabChange("billing")}
            onSwitchToFamily={() => onTabChange("family")}
            session={session}
          />
        )}
        {activeTab === "learningPath" && (
          <ParentLearningPathPanel session={session} />
        )}
        {activeTab === "learning" && (
          <ParentChildLearningPanel session={session} />
        )}
        {activeTab === "billing" && <ParentBillingPanel session={session} />}
        {activeTab === "reports" && (
          <ParentLearningReportPanel session={session} />
        )}
        {activeTab === "family" && <ParentFamilyPanel session={session} />}
        {activeTab === "profile" && (
          <ParentProfilePanel onLogout={onLogout} session={session} />
        )}
      </div>
    </section>
  );
}
