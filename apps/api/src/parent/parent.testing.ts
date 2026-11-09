import { ChildAccessService } from '../learning-access/child-access.service';
import { PrismaService } from '../prisma/prisma.service';
import { ParentChildrenService } from './parent-children.service';
import { ParentReportsService } from './parent-reports.service';
import { ParentScreenTimeService } from './parent-screen-time.service';
import { ParentService } from './parent.service';

/**
 * Builds ParentService with its focused services for unit tests that
 * construct it directly instead of through the Nest container.
 */
export function createParentServiceForTestParts(
  prisma: PrismaService,
  childAccess: ChildAccessService,
) {
  const parentChildrenService = new ParentChildrenService(prisma);
  const parentScreenTimeService = new ParentScreenTimeService(prisma);
  const parentReportsService = new ParentReportsService(prisma, childAccess);
  const service = new ParentService(
    parentChildrenService,
    parentScreenTimeService,
    parentReportsService,
  );
  return {
    service,
    parentChildrenService,
    parentScreenTimeService,
    parentReportsService,
  };
}

export function createParentServiceForTest(
  prisma: PrismaService,
  childAccess: ChildAccessService,
) {
  return createParentServiceForTestParts(prisma, childAccess).service;
}
