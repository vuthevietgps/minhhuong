#!/usr/bin/env node

const config = {
  baseUrl: trimTrailingSlash(
    process.env.LEARNING_SMOKE_BASE_URL ?? 'http://localhost:4000/v1',
  ),
  parentEmail: process.env.LEARNING_SMOKE_PARENT_EMAIL ?? 'parent@demo.local',
  parentPassword: process.env.LEARNING_SMOKE_PARENT_PASSWORD ?? 'Demo@12345',
  childName: process.env.LEARNING_SMOKE_CHILD_NAME ?? 'Demo Con',
  packageCode:
    process.env.LEARNING_SMOKE_PACKAGE_CODE ?? 'MH-DEMO-A1-GREETINGS-PACKAGE',
  pathCode: process.env.LEARNING_SMOKE_PATH_CODE ?? 'MH-DEMO-A1-GREETINGS',
  lessonSlug: process.env.LEARNING_SMOKE_LESSON_SLUG ?? 'greetings-basics',
  activityTitle: process.env.LEARNING_SMOKE_ACTIVITY_TITLE ?? 'Greeting check',
};

class SmokeFailure extends Error {
  constructor(step, expected, actual, route) {
    super(`${step}: expected ${expected}; actual ${stringifyShort(actual)}`);
    this.name = 'SmokeFailure';
    this.step = step;
    this.expected = expected;
    this.actual = actual;
    this.route = route;
  }
}

async function main() {
  if (typeof fetch !== 'function') {
    throw new SmokeFailure(
      'runtime',
      'global fetch available in Node.js runtime',
      'fetch is not available',
    );
  }

  const login = await httpJson('POST', '/auth/login', {
    step: 'login parent demo',
    expectedStatuses: [200, 201],
    body: {
      email: config.parentEmail,
      password: config.parentPassword,
    },
  });
  const token = expectString(login.accessToken, 'login parent demo', 'token');

  const childrenResponse = await httpJson('GET', '/parent/children', {
    step: 'list parent children',
    token,
  });
  const children = Array.isArray(childrenResponse)
    ? childrenResponse
    : childrenResponse.children;
  assert(Array.isArray(children), 'list parent children', 'array response', {
    keys: Object.keys(childrenResponse ?? {}),
  });

  const child = children.find((item) => item.displayName === config.childName);
  assert(child?.id, 'find demo child', `child named ${config.childName}`, {
    childNames: children.map((item) => item.displayName),
  });

  const assignment = await httpJson(
    'GET',
    `/parent/children/${encodePath(child.id)}/content-assignment`,
    {
      step: 'read active assignment',
      token,
    },
  );
  const contentPackage = assignment.contentPackage;
  const learningPath = contentPackage?.learningPath;
  assert(
    assignment.status === 'ACTIVE',
    'read active assignment',
    'assignment.status ACTIVE',
    assignment.status,
  );
  assert(
    contentPackage?.code === config.packageCode,
    'verify package code',
    config.packageCode,
    contentPackage?.code,
  );
  assert(
    learningPath?.code === config.pathCode,
    'verify learning path code',
    config.pathCode,
    learningPath?.code,
  );

  const dailyPlan = await httpJson(
    'GET',
    `/learning/daily-plans/today?childProfileId=${encodeQuery(child.id)}`,
    {
      step: 'get daily plan',
      token,
    },
  );
  assert(dailyPlan.plan?.id, 'get daily plan', 'plan.id exists', dailyPlan);
  const contentSourceMode =
    dailyPlan.plan?.contentSourceMode ?? dailyPlan.contentSource?.mode;
  const sourceMatchesAssignment =
    contentSourceMode === 'ASSIGNED_PATH' ||
    contentSourceMode === 'ASSIGNED_PACKAGE' ||
    dailyPlan.plan?.contentPackageId === assignment.contentPackageId ||
    dailyPlan.plan?.contentPackageId === contentPackage?.id ||
    dailyPlan.plan?.learningPathId === contentPackage?.learningPathId ||
    dailyPlan.plan?.learningPathId === learningPath?.id;
  assert(
    sourceMatchesAssignment,
    'verify daily plan content source',
    'assigned path/package source',
    {
      contentSourceMode,
      contentPackageId: dailyPlan.plan?.contentPackageId,
      learningPathId: dailyPlan.plan?.learningPathId,
    },
  );

  const planItems = expectArray(dailyPlan.items, 'get daily plan', 'items');
  assert(
    planItems.length > 0,
    'get daily plan',
    'demo daily plan has video/practice items; run `npm --prefix apps/api run prisma:seed` to reset demo smoke state',
    {
      plan: dailyPlan.plan,
      contentSource: dailyPlan.contentSource,
      itemCount: planItems.length,
    },
  );
  const videoItem = findVideoItem(planItems);
  const practiceItem = findPracticeItem(planItems, videoItem);
  assert(
    videoItem?.lessonId,
    'find video item',
    'video item lessonId',
    videoItem,
  );
  assert(
    practiceItem?.activityId,
    'find practice item',
    'practice item activityId',
    practiceItem,
  );

  const watch = await httpJson(
    'POST',
    `/learning/lessons/${encodePath(
      videoItem.lessonId,
    )}/watch?childProfileId=${encodeQuery(child.id)}`,
    {
      step: 'record video watch',
      token,
      expectedStatuses: [200, 201],
      body: {
        event: 'COMPLETED',
        lastPositionSec: 600,
        watchedDurationSec: 600,
      },
    },
  );
  const watchEvidence = watch.watchEvidence ?? {};
  const watchPassed =
    watchEvidence.passed === true ||
    numberOrZero(watchEvidence.watchPercent) >=
      numberOrDefault(watchEvidence.minWatchPercent, 80);
  assert(watchPassed, 'record video watch', 'watchEvidence passed', {
    watchEvidence,
  });

  const afterVideoPlan = await httpJson(
    'POST',
    `/learning/daily-plans/${encodePath(
      dailyPlan.plan.id,
    )}/items/${encodePath(videoItem.id)}/complete`,
    {
      step: 'complete video daily plan item',
      token,
      expectedStatuses: [200, 201],
    },
  );
  const afterVideoItem = findItem(afterVideoPlan.items, videoItem.id);
  assert(
    afterVideoItem?.status === 'COMPLETED',
    'complete video daily plan item',
    'video item COMPLETED',
    afterVideoItem?.status,
  );

  const practice = await httpJson(
    'GET',
    `/learning/lessons/${encodePath(
      videoItem.lessonId,
    )}/practice?childProfileId=${encodeQuery(child.id)}`,
    {
      step: 'read lesson practice',
      token,
    },
  );
  const activity = findPracticeActivity(practice, practiceItem.activityId);
  const question = findPracticeQuestion(activity);
  const answer = findDemoAnswer(question);

  const attempt = await httpJson(
    'POST',
    `/learning/activities/${encodePath(
      activity.id,
    )}/attempts?childProfileId=${encodeQuery(child.id)}`,
    {
      step: 'submit practice attempt',
      token,
      expectedStatuses: [200, 201],
      body: {
        responses: [
          {
            questionId: question.id,
            selectedAnswerIds: [answer.id],
          },
        ],
      },
    },
  );
  const attemptScore = numberOrZero(attempt.score);
  const attemptMaxScore = numberOrDefault(attempt.maxScore, 1);
  const practicePassed =
    attempt.passed === true ||
    attemptScore / Math.max(attemptMaxScore, 1) >= 0.8;
  assert(practicePassed, 'submit practice attempt', 'practice score passed', {
    score: attempt.score,
    maxScore: attempt.maxScore,
  });

  const afterPracticePlan = await httpJson(
    'POST',
    `/learning/daily-plans/${encodePath(
      dailyPlan.plan.id,
    )}/items/${encodePath(practiceItem.id)}/complete`,
    {
      step: 'complete practice daily plan item',
      token,
      expectedStatuses: [200, 201],
    },
  );

  const learningHome = await httpJson(
    'GET',
    `/learning/home?childProfileId=${encodeQuery(child.id)}`,
    {
      step: 'refresh learning home',
      token,
    },
  );
  const homeItems = expectArray(
    learningHome.persistentDailyPlan?.items,
    'refresh learning home',
    'persistent daily plan items',
  );
  const homeVideoItem =
    findItem(homeItems, videoItem.id) ?? findVideoItem(homeItems);
  const homePracticeItem =
    findItem(homeItems, practiceItem.id) ??
    findPracticeItem(homeItems, videoItem);
  const homeVideoPassed = itemHasPassedEvidence(homeVideoItem);
  const homePracticePassed = itemHasPassedEvidence(homePracticeItem);
  assert(homeVideoPassed, 'refresh learning home', 'video evidence passed', {
    status: homeVideoItem?.status,
    evidenceSummary: homeVideoItem?.evidenceSummary,
  });
  assert(
    homePracticePassed,
    'refresh learning home',
    'practice evidence passed',
    {
      status: homePracticeItem?.status,
      evidenceSummary: homePracticeItem?.evidenceSummary,
    },
  );

  const report = await httpJson(
    'GET',
    `/parent/children/${encodePath(child.id)}/learning-report?range=7d`,
    {
      step: 'read parent learning report',
      token,
    },
  );
  const reportSummary = report.summary ?? {};
  const parentReportVerified =
    numberOrZero(reportSummary.completedItems) >= 2 ||
    (numberOrZero(reportSummary.videoItemsCompleted) >= 1 &&
      numberOrZero(reportSummary.practiceItemsCompleted) >= 1) ||
    (numberOrZero(reportSummary.bestWatchPercent) >= 80 &&
      numberOrZero(reportSummary.averagePracticeScorePercent) >= 80);
  assert(
    parentReportVerified,
    'read parent learning report',
    'learning evidence in report',
    {
      summary: reportSummary,
    },
  );

  await httpJson(
    'GET',
    `/learning/home?childProfileId=${encodeQuery(child.id)}`,
    {
      step: 'negative gate missing token',
      expectedStatuses: [401],
    },
  );

  printSummary({
    child,
    contentPackage,
    learningPath,
    contentSourceMode,
    watchEvidence,
    attemptScore,
    attemptMaxScore,
    homeVideoItem,
    homePracticeItem,
    afterPracticePlan,
    reportSummary,
  });
}

async function httpJson(method, path, options = {}) {
  const expectedStatuses = options.expectedStatuses ?? [200];
  const headers = {
    accept: 'application/json',
  };
  if (options.body !== undefined) {
    headers['content-type'] = 'application/json';
  }
  if (options.token) {
    headers.authorization = `Bearer ${options.token}`;
  }

  const response = await fetch(`${config.baseUrl}${path}`, {
    method,
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });
  const responseText = await response.text();
  const responseBody = parseJson(responseText);

  if (!expectedStatuses.includes(response.status)) {
    throw new SmokeFailure(
      options.step ?? `${method} ${path}`,
      `HTTP ${expectedStatuses.join(' or ')}`,
      {
        status: response.status,
        body: responseBody ?? responseText,
      },
      `${method} ${path}`,
    );
  }

  return responseBody ?? {};
}

function findVideoItem(items) {
  const videoItems = expectArray(
    items,
    'find video item',
    'daily plan items',
  ).filter((item) => item.itemType === 'VIDEO');
  const matching = videoItems.find(
    (item) => item.lesson?.slug === config.lessonSlug,
  );
  const fallback = matching ?? videoItems[0];
  assert(fallback, 'find video item', 'VIDEO item in daily plan', videoItems);
  if (fallback.lesson?.slug) {
    assert(
      fallback.lesson.slug === config.lessonSlug,
      'find video item',
      `lesson slug ${config.lessonSlug}`,
      fallback.lesson.slug,
    );
  }
  return fallback;
}

function findPracticeItem(items, videoItem) {
  const practiceItems = expectArray(
    items,
    'find practice item',
    'daily plan items',
  ).filter((item) => item.itemType === 'PRACTICE');
  const matching =
    practiceItems.find((item) => item.lessonId === videoItem?.lessonId) ??
    practiceItems.find((item) => item.activity?.title === config.activityTitle);
  const fallback = matching ?? practiceItems[0];
  assert(fallback, 'find practice item', 'PRACTICE item in daily plan', {
    practiceItems,
  });
  return fallback;
}

function findPracticeActivity(practice, expectedActivityId) {
  const activities = Array.isArray(practice.activities)
    ? practice.activities
    : practice.activity
      ? [practice.activity]
      : [];
  const activity =
    activities.find((item) => item.id === expectedActivityId) ??
    activities.find((item) => item.title === config.activityTitle) ??
    activities[0];
  assert(activity?.id, 'read lesson practice', 'practice activity exists', {
    activityTitles: activities.map((item) => item.title),
  });
  assert(
    activity.title === config.activityTitle ||
      activity.id === expectedActivityId,
    'read lesson practice',
    `activity ${config.activityTitle}`,
    { id: activity.id, title: activity.title },
  );
  return activity;
}

function findPracticeQuestion(activity) {
  const questions = expectArray(
    activity.questions,
    'read lesson practice',
    'activity questions',
  );
  const question = questions.find(
    (item) => Array.isArray(item.answers) && item.answers.length > 0,
  );
  assert(question?.id, 'read lesson practice', 'question with public answers', {
    questionCount: questions.length,
  });
  return question;
}

function findDemoAnswer(question) {
  const answers = expectArray(
    question.answers,
    'read lesson practice',
    'question public answers',
  );
  const answer =
    answers.find((item) =>
      /good morning, nice to meet you/i.test(item.text ?? ''),
    ) ?? answers[0];
  assert(answer?.id, 'read lesson practice', 'answer option exists', {
    answerCount: answers.length,
  });
  return answer;
}

function findItem(items, id) {
  return Array.isArray(items)
    ? items.find((item) => item.id === id)
    : undefined;
}

function itemHasPassedEvidence(item) {
  if (!item) {
    return false;
  }
  if (item.evidenceSummary?.passed === true) {
    return true;
  }
  if (item.status === 'COMPLETED') {
    return true;
  }
  return false;
}

function printSummary(data) {
  console.log('LEARNING_MVP_SMOKE PASS');
  console.log(`baseUrl=${config.baseUrl}`);
  console.log(`child=${data.child.displayName}`);
  console.log(`package=${data.contentPackage.code}`);
  console.log(`path=${data.learningPath.code}`);
  console.log(`contentSourceMode=${data.contentSourceMode}`);
  console.log(
    `videoEvidence=${data.watchEvidence.passed === true ? 'passed' : 'passed-by-percent'}`,
  );
  console.log(`practiceScore=${data.attemptScore}/${data.attemptMaxScore}`);
  console.log(`homeVideo=${data.homeVideoItem.status}`);
  console.log(`homePractice=${data.homePracticeItem.status}`);
  console.log(`planStatus=${data.afterPracticePlan.plan?.status ?? 'UNKNOWN'}`);
  console.log(
    `reportCompletedItems>=2 actual=${numberOrZero(
      data.reportSummary.completedItems,
    )}`,
  );
  console.log('negativeGate=missing-token-401');
}

function assert(condition, step, expected, actual) {
  if (!condition) {
    throw new SmokeFailure(step, expected, actual);
  }
}

function expectString(value, step, expected) {
  assert(typeof value === 'string' && value.length > 0, step, expected, value);
  return value;
}

function expectArray(value, step, expected) {
  assert(Array.isArray(value), step, expected, value);
  return value;
}

function parseJson(value) {
  if (!value) {
    return null;
  }
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function numberOrZero(value) {
  return numberOrDefault(value, 0);
}

function numberOrDefault(value, defaultValue) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : defaultValue;
}

function stringifyShort(value) {
  const raw =
    typeof value === 'string'
      ? value
      : (JSON.stringify(value, null, 2) ?? String(value));
  return raw.length > 900 ? `${raw.slice(0, 900)}...` : raw;
}

function trimTrailingSlash(value) {
  return value.replace(/\/+$/, '');
}

function encodePath(value) {
  return encodeURIComponent(String(value));
}

function encodeQuery(value) {
  return encodeURIComponent(String(value));
}

main().catch((error) => {
  console.error('LEARNING_MVP_SMOKE FAIL');
  if (error instanceof SmokeFailure) {
    console.error(`step=${error.step}`);
    if (error.route) {
      console.error(`route=${error.route}`);
    }
    console.error(`expected=${error.expected}`);
    console.error(`actual=${stringifyShort(error.actual)}`);
  } else {
    console.error(error instanceof Error ? error.message : String(error));
  }
  process.exitCode = 1;
});
