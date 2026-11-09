import { buildLearningLocalDemoReports } from './run-learning-local-demo-report.build';
import { writeLearningLocalDemoReportExports } from './run-learning-local-demo-report.write';
import { printLearningLocalDemoReportSummary } from './run-learning-local-demo-report.summary';
import { printLearningLocalDemoReportMetrics } from './run-learning-local-demo-report.metrics';

const buildLearningLocalDemoReportsResult = buildLearningLocalDemoReports();
const writeLearningLocalDemoReportExportsResult =
  writeLearningLocalDemoReportExports({
    ...buildLearningLocalDemoReportsResult,
  });
printLearningLocalDemoReportSummary({
  ...writeLearningLocalDemoReportExportsResult,
  ...buildLearningLocalDemoReportsResult,
});
printLearningLocalDemoReportMetrics({ ...buildLearningLocalDemoReportsResult });
