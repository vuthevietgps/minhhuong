import type { useDemoReportsData } from "./use-demo-reports-data";
import type { useDemoMetricCards } from "./use-demo-metric-cards";
import type { useDemoSafetyChecks } from "./use-demo-safety-checks";

/** Everything the LearningLocalDemoPage sections read: the merged results of its hooks. */
export type DemoPageState = ReturnType<typeof useDemoReportsData> &
  ReturnType<typeof useDemoMetricCards> &
  ReturnType<typeof useDemoSafetyChecks>;
