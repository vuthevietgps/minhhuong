import type {
  DemoLearningMvpReadinessOverviewReport,
  DemoLearningMvpReadinessOverviewSliceKey,
  DemoLearningMvpReadinessOverviewStatus,
} from './mvp-readiness-overview.types';
import type { DemoLearningCurrency } from './shared-statuses.types';

export type DemoLearningAcceptanceTraceabilityGateStatus =
  'MAPPED_LOCAL_DEMO' | 'NEEDS_LOCAL_DEMO_EVIDENCE';

export type DemoLearningAcceptanceTraceabilityGateStatusCounts = {
  acceptanceStatus: Record<
    DemoLearningAcceptanceTraceabilityGateStatus,
    number
  >;
};

export type DemoLearningAcceptanceTraceabilityGateTotals = {
  sliceCount: number;
  acceptanceCriterionCount: number;
  mappedCriterionCount: number;
  slicesWithMappingCount: number;
  slicesMissingMappingCount: number;
  productionReadyClaimCount: number;
  fixtureOnlyCriterionCount: number;
  safetyClosedCriterionCount: number;
  evidenceEndpointCount: number;
  jsonExportCount: number;
  markdownExportCount: number;
  dashboardEvidenceCount: number;
  seedCommandCount: number;
  reportCommandCount: number;
  testCommandCount: number;
  safetyGateCount: number;
  closedSafetyGateCount: number;
  openSafetyGateCount: number;
};

export type DemoLearningAcceptanceTraceabilityGateRow = {
  sliceKey: DemoLearningMvpReadinessOverviewSliceKey;
  sliceName: string;
  acceptanceCriterionId: string;
  acceptanceCriterionName: string;
  acceptanceStatus: DemoLearningAcceptanceTraceabilityGateStatus;
  readinessStatus: DemoLearningMvpReadinessOverviewStatus;
  productionReady: false;
  fixtureOnly: true;
  safetyClosed: boolean;
  evidenceEndpointPath: string;
  jsonExportPath: string;
  markdownExportPath: string;
  dashboardEvidencePath: string;
  seedCommand: string;
  reportCommand: string;
  testCommand: string;
  safetyGatesCovered: string[];
  remainingLocalDemoNote: string;
  evidenceSummary: string;
};

export type DemoLearningAcceptanceTraceabilityGateReport = {
  reportName: string;
  generatedFor: string;
  generatedAt: string;
  currency: DemoLearningCurrency;
  productionReady: false;
  fixtureOnly: true;
  safety: DemoLearningMvpReadinessOverviewReport['safety'];
  totals: DemoLearningAcceptanceTraceabilityGateTotals;
  statusCounts: DemoLearningAcceptanceTraceabilityGateStatusCounts;
  rows: DemoLearningAcceptanceTraceabilityGateRow[];
};
