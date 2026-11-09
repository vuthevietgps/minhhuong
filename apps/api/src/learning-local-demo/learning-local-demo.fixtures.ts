import type { DemoLearningCoreFixture } from './learning-local-demo.types';
import { commerceFixture } from './fixtures/commerce.fixture';
import { classroomFixture } from './fixtures/classroom.fixture';
import { learningPathFixture } from './fixtures/learning-path.fixture';
import { parentScreenTimeFixture } from './fixtures/parent-screen-time.fixture';
import { contentLibraryFixture } from './fixtures/content-library.fixture';
import { aiTutorFixture } from './fixtures/ai-tutor.fixture';
import { achievementsFixture } from './fixtures/achievements.fixture';
import { followUpFixture } from './fixtures/follow-up.fixture';

export const learningLocalDemoCoreFixture: DemoLearningCoreFixture = {
  generatedFor:
    'local-demo-student-course-enrollment-subscription-payment-refund-commission-report',
  currency: 'VND',
  ...commerceFixture,
  ...classroomFixture,
  ...learningPathFixture,
  ...parentScreenTimeFixture,
  ...contentLibraryFixture,
  ...aiTutorFixture,
  ...achievementsFixture,
  ...followUpFixture,
};
