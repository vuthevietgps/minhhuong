import { buildLearningLocalDemoSeedReports } from './run-learning-local-demo-seed.build';
import { writeLearningLocalDemoSeed } from './run-learning-local-demo-seed.write';
import { printLearningLocalDemoSeedSummary } from './run-learning-local-demo-seed.summary';

const buildLearningLocalDemoSeedReportsResult =
  buildLearningLocalDemoSeedReports();
writeLearningLocalDemoSeed({ ...buildLearningLocalDemoSeedReportsResult });
printLearningLocalDemoSeedSummary({
  ...buildLearningLocalDemoSeedReportsResult,
});
