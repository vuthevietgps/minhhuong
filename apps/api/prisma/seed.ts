import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { randomUUID, scryptSync } from 'node:crypto';

const prisma = new PrismaClient({
  adapter: new PrismaPg(
    process.env.DATABASE_URL ??
      'postgresql://minhhuong:minhhuong@localhost:5432/minhhuong?schema=public',
  ),
});

const roleDefinitions = [
  ['STUDENT', 'Learner account'],
  ['PARENT', 'Parent account'],
  ['TEACHER', 'Teacher account'],
  ['CONTENT_EDITOR', 'Content authoring account'],
  ['ADMIN', 'System administration account'],
  ['DIRECTOR', 'Executive reporting account'],
  ['SUPPORT', 'Customer support account'],
  ['SALE', 'Sales account'],
  ['AGENCY_OWNER', 'Agency owner account'],
  ['AGENCY_MANAGER', 'Agency manager account'],
  ['OPERATIONS', 'Payment operations account'],
] as const;

const demoUsers = [
  ['student@demo.local', 'Minh Anh', 'STUDENT'],
  ['parent@demo.local', 'Phu huynh Minh Anh', 'PARENT'],
  ['teacher@demo.local', 'Ms. Lan', 'TEACHER'],
  ['content@demo.local', 'Content Team', 'CONTENT_EDITOR'],
  ['support@demo.local', 'Support Desk', 'SUPPORT'],
  ['admin@demo.local', 'Admin Operator', 'ADMIN'],
  ['director@demo.local', 'Director', 'DIRECTOR'],
  ['sale@demo.local', 'Sales Operator', 'SALE'],
  ['agency@demo.local', 'Demo Agency Owner', 'AGENCY_OWNER'],
  ['operations@demo.local', 'Payment Operations', 'OPERATIONS'],
] as const;

async function main() {
  for (const [name, description] of roleDefinitions) {
    await prisma.role.upsert({
      where: { name },
      update: { description },
      create: { name, description },
    });
  }

  for (const [email, displayName, roleName] of demoUsers) {
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        passwordHash: hashPassword('Demo@12345'),
        status: 'ACTIVE',
        profile: {
          upsert: {
            update: { displayName },
            create: { displayName },
          },
        },
      },
      create: {
        email,
        passwordHash: hashPassword('Demo@12345'),
        status: 'ACTIVE',
        profile: {
          create: { displayName },
        },
      },
    });
    const role = await prisma.role.findUniqueOrThrow({
      where: { name: roleName },
    });
    await prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId: user.id,
          roleId: role.id,
        },
      },
      update: {},
      create: {
        userId: user.id,
        roleId: role.id,
      },
    });
  }

  const manualPlan = await prisma.plan.upsert({
    where: { code: 'manual-access' },
    update: {
      name: 'Manual access package',
      description:
        'Duration is controlled by operations when payment is approved.',
      priceCents: 0,
      currency: 'VND',
      billingCycle: 'YEARLY',
      isActive: true,
    },
    create: {
      code: 'manual-access',
      name: 'Manual access package',
      description:
        'Duration is controlled by operations when payment is approved.',
      priceCents: 0,
      currency: 'VND',
      billingCycle: 'YEARLY',
      isActive: true,
    },
  });

  const parent = await prisma.user.findUniqueOrThrow({
    where: { email: 'parent@demo.local' },
  });
  const student = await prisma.user.findUniqueOrThrow({
    where: { email: 'student@demo.local' },
  });
  const admin = await prisma.user.findUniqueOrThrow({
    where: { email: 'admin@demo.local' },
  });
  const sale = await prisma.user.findUniqueOrThrow({
    where: { email: 'sale@demo.local' },
  });
  const agencyOwner = await prisma.user.findUniqueOrThrow({
    where: { email: 'agency@demo.local' },
  });
  const now = new Date();
  const demoEnd = new Date(now);
  demoEnd.setFullYear(demoEnd.getFullYear() + 1);

  // Upsert a ChildProfile for the demo parent account
  const existingChildProfile = await prisma.childProfile.findFirst({
    where: { parentId: parent.id },
    select: { id: true },
    orderBy: { createdAt: 'asc' },
  });
  const demoChildProfile = existingChildProfile
    ? await prisma.childProfile.update({
        where: { id: existingChildProfile.id },
        data: { displayName: 'Demo Con' },
      })
    : await prisma.childProfile.create({
        data: { parentId: parent.id, displayName: 'Demo Con' },
      });

  // The current learner runtime authorizes STUDENT accounts through a child
  // profile they own. Keep a dedicated profile so the database-backed demo
  // account follows the same entitlement gate as a real learner account.
  const existingStudentProfile = await prisma.childProfile.findFirst({
    where: { parentId: student.id },
    select: { id: true },
    orderBy: { createdAt: 'asc' },
  });
  const demoStudentProfile = existingStudentProfile
    ? await prisma.childProfile.update({
        where: { id: existingStudentProfile.id },
        data: { displayName: 'Minh Anh' },
      })
    : await prisma.childProfile.create({
        data: { parentId: student.id, displayName: 'Minh Anh' },
      });

  await prisma.subscription.upsert({
    where: { id: 'demo-parent-child-access' },
    update: {
      status: 'ACTIVE',
      currentPeriodStart: now,
      currentPeriodEnd: demoEnd,
      planId: manualPlan.id,
    },
    create: {
      id: 'demo-parent-child-access',
      childProfileId: demoChildProfile.id,
      planId: manualPlan.id,
      status: 'ACTIVE',
      currentPeriodStart: now,
      currentPeriodEnd: demoEnd,
      providerRef: 'seed-demo',
    },
  });

  await prisma.subscription.upsert({
    where: { id: 'demo-student-access' },
    update: {
      childProfileId: demoStudentProfile.id,
      status: 'ACTIVE',
      currentPeriodStart: now,
      currentPeriodEnd: demoEnd,
      planId: manualPlan.id,
    },
    create: {
      id: 'demo-student-access',
      childProfileId: demoStudentProfile.id,
      planId: manualPlan.id,
      status: 'ACTIVE',
      currentPeriodStart: now,
      currentPeriodEnd: demoEnd,
      providerRef: 'seed-demo-student',
    },
  });

  await prisma.childScreenTimeSetting.upsert({
    where: { childProfileId: demoChildProfile.id },
    update: {
      isEnabled: true,
      dailyLimitMinutes: 45,
    },
    create: {
      childProfileId: demoChildProfile.id,
      isEnabled: true,
      dailyLimitMinutes: 45,
    },
  });

  await prisma.commissionPolicy.upsert({
    where: { code: 'default-sale-10' },
    update: {
      name: 'Default sale commission 10%',
      beneficiaryType: 'SALE',
      rateBps: 1000,
      baseSalaryCents: 0,
      isDefaultForSale: true,
      isActive: true,
    },
    create: {
      code: 'default-sale-10',
      name: 'Default sale commission 10%',
      beneficiaryType: 'SALE',
      rateBps: 1000,
      baseSalaryCents: 0,
      isDefaultForSale: true,
      isActive: true,
    },
  });

  await prisma.commissionPolicy.upsert({
    where: { code: 'default-agency-15' },
    update: {
      name: 'Default agency commission 15%',
      beneficiaryType: 'AGENCY',
      rateBps: 1500,
      baseSalaryCents: 0,
      isDefaultForAgency: true,
      isActive: true,
    },
    create: {
      code: 'default-agency-15',
      name: 'Default agency commission 15%',
      beneficiaryType: 'AGENCY',
      rateBps: 1500,
      baseSalaryCents: 0,
      isDefaultForAgency: true,
      isActive: true,
    },
  });

  const agency = await prisma.agency.upsert({
    where: { code: 'DEMO-AGENCY' },
    update: {
      name: 'Demo Agency',
      status: 'ACTIVE',
      defaultRateBps: 1500,
    },
    create: {
      code: 'DEMO-AGENCY',
      name: 'Demo Agency',
      status: 'ACTIVE',
      defaultRateBps: 1500,
      notes: 'Seed agency for channel finance testing.',
    },
  });

  await prisma.channelParticipant.upsert({
    where: { agencyId: agency.id },
    update: {
      code: agency.code,
      displayName: agency.name,
      status: 'ACTIVE',
      baseSalaryCents: 0,
      commissionRateBps: 1500,
    },
    create: {
      type: 'AGENCY',
      code: agency.code,
      displayName: agency.name,
      status: 'ACTIVE',
      agencyId: agency.id,
      baseSalaryCents: 0,
      commissionRateBps: 1500,
      notes: 'Agency settlement account for platform payouts.',
    },
  });

  await prisma.channelParticipant.upsert({
    where: { userId: sale.id },
    update: {
      code: 'DEMO-COMPANY-SALE',
      displayName: 'Demo Company Sale',
      status: 'ACTIVE',
      baseSalaryCents: 8000000 * 100,
      commissionRateBps: 1000,
    },
    create: {
      type: 'SALE',
      code: 'DEMO-COMPANY-SALE',
      displayName: 'Demo Company Sale',
      status: 'ACTIVE',
      userId: sale.id,
      baseSalaryCents: 8000000 * 100,
      commissionRateBps: 1000,
      notes: 'Company sales settlement account.',
    },
  });

  await prisma.agencyMember.upsert({
    where: {
      agencyId_userId: {
        agencyId: agency.id,
        userId: sale.id,
      },
    },
    update: {
      title: 'Demo agency sale',
      role: 'SALE',
      rateBps: 1000,
      referralCode: 'DEMO-SALE',
      isActive: true,
    },
    create: {
      agencyId: agency.id,
      userId: sale.id,
      role: 'SALE',
      title: 'Demo agency sale',
      rateBps: 1000,
      referralCode: 'DEMO-SALE',
    },
  });

  await prisma.agencyMember.upsert({
    where: {
      agencyId_userId: {
        agencyId: agency.id,
        userId: agencyOwner.id,
      },
    },
    update: {
      title: 'Demo agency owner',
      role: 'OWNER',
      rateBps: null,
      referralCode: 'DEMO-OWNER',
      isActive: true,
    },
    create: {
      agencyId: agency.id,
      userId: agencyOwner.id,
      role: 'OWNER',
      title: 'Demo agency owner',
      referralCode: 'DEMO-OWNER',
    },
  });

  const beginner = await prisma.level.upsert({
    where: { code: 'A1' },
    update: {},
    create: {
      code: 'A1',
      title: 'Beginner',
      description: 'Foundational English for everyday situations.',
      sortOrder: 1,
    },
  });

  const course = await prisma.course.upsert({
    where: { slug: 'english-starter' },
    update: {},
    create: {
      levelId: beginner.id,
      slug: 'english-starter',
      title: 'English Starter',
      description:
        'A compact starter path with video, quiz, and speaking practice.',
      isPublished: true,
      sortOrder: 1,
    },
  });

  const unit =
    (await prisma.unit.findFirst({
      where: {
        courseId: course.id,
        title: 'Greetings',
      },
    })) ??
    (await prisma.unit.create({
      data: {
        courseId: course.id,
        title: 'Greetings',
        description: 'Say hello, introduce yourself, and ask simple questions.',
        sortOrder: 1,
      },
    }));

  const lesson = await prisma.lesson.upsert({
    where: { slug: 'greetings-basics' },
    update: {
      unitId: unit.id,
      title: 'Greeting Basics',
      description: 'Starter video lesson for greetings and introductions.',
      type: 'MIXED',
      status: 'PUBLISHED',
      publishedAt: new Date(),
      durationSec: 480,
      sortOrder: 1,
    },
    create: {
      unitId: unit.id,
      slug: 'greetings-basics',
      title: 'Greeting Basics',
      description: 'Starter video lesson for greetings and introductions.',
      type: 'MIXED',
      status: 'PUBLISHED',
      publishedAt: new Date(),
      durationSec: 480,
      sortOrder: 1,
    },
  });

  const greetingVideoId = 'IeaadwctbD4';
  const existingGreetingVideo = await prisma.videoAsset.findFirst({
    where: {
      lessonId: lesson.id,
      playbackId: greetingVideoId,
    },
  });

  if (existingGreetingVideo) {
    await prisma.videoAsset.update({
      where: { id: existingGreetingVideo.id },
      data: {
        title: 'Nice to meet you',
        provider: 'YOUTUBE',
        processingStatus: 'READY',
        sourceUrl: `https://www.youtube.com/watch?v=${greetingVideoId}`,
        embedUrl: `https://www.youtube-nocookie.com/embed/${greetingVideoId}`,
        thumbnailUrl: `https://img.youtube.com/vi/${greetingVideoId}/hqdefault.jpg`,
        durationSec: 600,
        sortOrder: 1,
      },
    });
  } else {
    await prisma.videoAsset.create({
      data: {
        lessonId: lesson.id,
        title: 'Nice to meet you',
        provider: 'YOUTUBE',
        processingStatus: 'READY',
        playbackId: greetingVideoId,
        sourceUrl: `https://www.youtube.com/watch?v=${greetingVideoId}`,
        embedUrl: `https://www.youtube-nocookie.com/embed/${greetingVideoId}`,
        thumbnailUrl: `https://img.youtube.com/vi/${greetingVideoId}/hqdefault.jpg`,
        durationSec: 600,
        sortOrder: 1,
      },
    });
  }

  const activity =
    (await prisma.activity.findFirst({
      where: {
        lessonId: lesson.id,
        title: 'Greeting check',
      },
    })) ??
    (await prisma.activity.create({
      data: {
        lessonId: lesson.id,
        title: 'Greeting check',
        description: 'Short after-video quiz for the first greeting lesson.',
        type: 'QUIZ',
        sortOrder: 1,
      },
    }));

  await prisma.dailyLearningPlan.deleteMany({
    where: {
      childProfileId: demoChildProfile.id,
    },
  });
  await prisma.videoExposureLog.deleteMany({
    where: {
      childProfileId: demoChildProfile.id,
      lessonId: lesson.id,
    },
  });
  await prisma.activityAttempt.deleteMany({
    where: {
      childProfileId: demoChildProfile.id,
      activityId: activity.id,
    },
  });

  await prisma.lessonProgress.upsert({
    where: {
      childProfileId_lessonId: {
        childProfileId: demoChildProfile.id,
        lessonId: lesson.id,
      },
    },
    update: {
      status: 'IN_PROGRESS',
      score: null,
      completedAt: null,
      lastPositionSec: 300,
      lastWatchedAt: new Date(),
      watchCount: 2,
    },
    create: {
      childProfileId: demoChildProfile.id,
      lessonId: lesson.id,
      status: 'IN_PROGRESS',
      lastPositionSec: 300,
      lastWatchedAt: new Date(),
      watchCount: 2,
    },
  });

  await prisma.learningUsageDay.upsert({
    where: {
      childProfileId_usageDate_deviceType: {
        childProfileId: demoChildProfile.id,
        usageDate: todayInBangkok(),
        deviceType: 'COMPUTER',
      },
    },
    update: {
      usedSeconds: 10 * 60,
      lastRecordedAt: new Date(),
    },
    create: {
      childProfileId: demoChildProfile.id,
      usageDate: todayInBangkok(),
      deviceType: 'COMPUTER',
      usedSeconds: 10 * 60,
    },
  });

  const existingQuestion = await prisma.question.findFirst({
    where: {
      activityId: activity.id,
      prompt: 'Which answer is the best polite greeting?',
    },
  });

  if (!existingQuestion) {
    await prisma.question.create({
      data: {
        activityId: activity.id,
        type: 'SINGLE_CHOICE',
        prompt: 'Which answer is the best polite greeting?',
        explanation: '"Good morning, nice to meet you" is clear and polite.',
        points: 1,
        sortOrder: 1,
        answers: {
          create: [
            {
              text: 'Good morning, nice to meet you.',
              isCorrect: true,
              sortOrder: 1,
            },
            {
              text: 'Move now.',
              isCorrect: false,
              sortOrder: 2,
            },
            {
              text: 'No talk.',
              isCorrect: false,
              sortOrder: 3,
            },
          ],
        },
      },
    });
  }

  const learningPath = await prisma.learningPath.upsert({
    where: { code: 'MH-DEMO-A1-GREETINGS' },
    update: {
      title: 'Minh Huong Demo A1 Greetings',
      description:
        'Demo learning path for local MVP smoke: assignment -> daily plan -> video -> practice -> parent report.',
      levelId: beginner.id,
      ageBand: '6-9',
      status: 'PUBLISHED',
      updatedById: admin.id,
      publishedAt: new Date(),
    },
    create: {
      code: 'MH-DEMO-A1-GREETINGS',
      title: 'Minh Huong Demo A1 Greetings',
      description:
        'Demo learning path for local MVP smoke: assignment -> daily plan -> video -> practice -> parent report.',
      levelId: beginner.id,
      ageBand: '6-9',
      status: 'PUBLISHED',
      createdById: admin.id,
      updatedById: admin.id,
      publishedAt: new Date(),
    },
  });

  await prisma.learningPathItem.upsert({
    where: {
      learningPathId_lessonId: {
        learningPathId: learningPath.id,
        lessonId: lesson.id,
      },
    },
    update: {
      sequence: 1,
      required: true,
      minScore: 80,
      minWatchPercent: 80,
      prerequisiteItemId: null,
      reviewPolicyJson: { demo: true, reviewAfterDays: 7 },
    },
    create: {
      learningPathId: learningPath.id,
      lessonId: lesson.id,
      sequence: 1,
      required: true,
      minScore: 80,
      minWatchPercent: 80,
      reviewPolicyJson: { demo: true, reviewAfterDays: 7 },
    },
  });

  const contentPackage = await prisma.contentPackage.upsert({
    where: { code: 'MH-DEMO-A1-GREETINGS-PACKAGE' },
    update: {
      title: 'Minh Huong Demo A1 Package',
      description:
        'Published local/dev package assigned to the demo child for MVP learning flow QA.',
      learningPathId: learningPath.id,
      planId: manualPlan.id,
      status: 'PUBLISHED',
      publishedAt: new Date(),
    },
    create: {
      code: 'MH-DEMO-A1-GREETINGS-PACKAGE',
      title: 'Minh Huong Demo A1 Package',
      description:
        'Published local/dev package assigned to the demo child for MVP learning flow QA.',
      learningPathId: learningPath.id,
      planId: manualPlan.id,
      status: 'PUBLISHED',
      createdById: admin.id,
      publishedAt: new Date(),
    },
  });

  for (const childProfile of [demoChildProfile, demoStudentProfile]) {
    const existingDemoAssignment =
      await prisma.childContentAssignment.findFirst({
        where: {
          childProfileId: childProfile.id,
          contentPackageId: contentPackage.id,
          status: 'ACTIVE',
        },
        orderBy: { startedAt: 'desc' },
      });

    if (existingDemoAssignment) {
      await prisma.childContentAssignment.update({
        where: { id: existingDemoAssignment.id },
        data: {
          assignedById: admin.id,
          startedAt: new Date(),
          endedAt: null,
        },
      });
    } else {
      await prisma.childContentAssignment.create({
        data: {
          childProfileId: childProfile.id,
          contentPackageId: contentPackage.id,
          assignedById: admin.id,
          status: 'ACTIVE',
          startedAt: new Date(),
        },
      });
    }
  }

  console.log(
    `Seeded ${beginner.code}/${course.slug}/${unit.title}/${lesson.slug} with ${learningPath.code}/${contentPackage.code}`,
  );
}

function hashPassword(password: string): string {
  const salt = randomUUID();
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function todayInBangkok(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Bangkok',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
