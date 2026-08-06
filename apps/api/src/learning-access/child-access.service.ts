import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { AccountRole, AuthenticatedUser } from '../auth/auth.types';
import { PrismaService } from '../prisma/prisma.service';

export type ChildAccessRecord = {
  id: string;
  parentId: string;
};

export type ChildAccessOptions = {
  allowStaff?: boolean;
  staffRoles?: AccountRole[];
  notFoundForDenied?: boolean;
  purpose?: string;
};

const learnerRuntimeRoles: AccountRole[] = ['PARENT', 'STUDENT'];
const defaultStaffBypassRoles: AccountRole[] = ['ADMIN', 'SUPPORT'];

@Injectable()
export class ChildAccessService {
  constructor(private readonly prisma: PrismaService) {}

  async assertCanAccessChild(
    user: AuthenticatedUser,
    childProfileId: string,
    options: ChildAccessOptions = {},
  ): Promise<ChildAccessRecord> {
    const normalizedChildProfileId = childProfileId?.trim();
    if (!normalizedChildProfileId) {
      throw new BadRequestException('childProfileId is required');
    }

    const child = await this.prisma.childProfile.findUnique({
      where: { id: normalizedChildProfileId },
      select: { id: true, parentId: true },
    });

    if (!child) {
      throw new NotFoundException('Child profile not found');
    }

    const isLearnerRuntimeUser = user.roles.some((role) =>
      learnerRuntimeRoles.includes(role),
    );
    if (isLearnerRuntimeUser && child.parentId === user.sub) {
      return child;
    }

    const staffRoles = options.staffRoles ?? defaultStaffBypassRoles;
    const canStaffBypass =
      options.allowStaff === true &&
      user.roles.some((role) => staffRoles.includes(role));

    if (canStaffBypass) {
      return child;
    }

    if (options.notFoundForDenied ?? true) {
      throw new NotFoundException('Child profile not found');
    }

    throw new ForbiddenException('Child profile access denied');
  }

  async canAccessChild(
    user: AuthenticatedUser,
    childProfileId: string,
    options: ChildAccessOptions = {},
  ): Promise<boolean> {
    try {
      await this.assertCanAccessChild(user, childProfileId, options);
      return true;
    } catch {
      return false;
    }
  }
}
