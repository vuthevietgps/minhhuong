import { Injectable, NotFoundException } from '@nestjs/common';
import type { AuthenticatedUser } from '../auth/auth.types';
import { PrismaService } from '../prisma/prisma.service';
import {
  UpdateCommissionPolicyDto,
  UpsertCommissionPolicyDto,
} from './dto/agency.dto';
import { ChannelAdminAccessService } from './channel-admin-access.service';
import { normalizeCode, vndToCents } from './channel-admin.helpers';

/** Commission policy administration. */
@Injectable()
export class CommissionPolicyAdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly channelAdminAccessService: ChannelAdminAccessService,
  ) {}

  listCommissionPolicies() {
    return this.prisma.commissionPolicy.findMany({
      orderBy: [{ beneficiaryType: 'asc' }, { code: 'asc' }],
    });
  }

  async upsertCommissionPolicy(
    dto: UpsertCommissionPolicyDto,
    user: AuthenticatedUser,
  ) {
    const code = normalizeCode(dto.code);
    if (dto.isDefaultForSale) {
      await this.clearDefaultPolicies('SALE');
    }
    if (dto.isDefaultForAgency) {
      await this.clearDefaultPolicies('AGENCY');
    }

    const policy = await this.prisma.commissionPolicy.upsert({
      where: { code },
      update: {
        name: dto.name.trim(),
        beneficiaryType: dto.beneficiaryType,
        rateBps: dto.rateBps,
        baseSalaryCents: vndToCents(dto.baseSalaryVnd ?? 0),
        isDefaultForSale: dto.isDefaultForSale ?? false,
        isDefaultForAgency: dto.isDefaultForAgency ?? false,
        isActive: dto.isActive ?? true,
      },
      create: {
        code,
        name: dto.name.trim(),
        beneficiaryType: dto.beneficiaryType,
        rateBps: dto.rateBps,
        baseSalaryCents: vndToCents(dto.baseSalaryVnd ?? 0),
        isDefaultForSale: dto.isDefaultForSale ?? false,
        isDefaultForAgency: dto.isDefaultForAgency ?? false,
        isActive: dto.isActive ?? true,
      },
    });
    await this.channelAdminAccessService.audit(
      user,
      'channel.commission_policy.upsert',
      'CommissionPolicy',
      policy.id,
      {
        code,
      },
    );

    return policy;
  }

  async updateCommissionPolicy(
    policyId: string,
    dto: UpdateCommissionPolicyDto,
    user: AuthenticatedUser,
  ) {
    const existing = await this.prisma.commissionPolicy.findUnique({
      where: { id: policyId },
    });
    if (!existing) {
      throw new NotFoundException('Commission policy not found');
    }

    if (dto.isDefaultForSale) {
      await this.clearDefaultPolicies('SALE');
    }
    if (dto.isDefaultForAgency) {
      await this.clearDefaultPolicies('AGENCY');
    }

    const policy = await this.prisma.commissionPolicy.update({
      where: { id: policyId },
      data: {
        ...(dto.name ? { name: dto.name.trim() } : {}),
        ...(dto.rateBps !== undefined ? { rateBps: dto.rateBps } : {}),
        ...(dto.baseSalaryVnd !== undefined
          ? { baseSalaryCents: vndToCents(dto.baseSalaryVnd) }
          : {}),
        ...(dto.isDefaultForSale !== undefined
          ? { isDefaultForSale: dto.isDefaultForSale }
          : {}),
        ...(dto.isDefaultForAgency !== undefined
          ? { isDefaultForAgency: dto.isDefaultForAgency }
          : {}),
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
      },
    });
    await this.channelAdminAccessService.audit(
      user,
      'channel.commission_policy.update',
      'CommissionPolicy',
      policy.id,
    );

    return policy;
  }

  private async clearDefaultPolicies(type: 'SALE' | 'AGENCY') {
    await this.prisma.commissionPolicy.updateMany({
      where:
        type === 'SALE'
          ? { beneficiaryType: 'SALE', isDefaultForSale: true }
          : { beneficiaryType: 'AGENCY', isDefaultForAgency: true },
      data:
        type === 'SALE'
          ? { isDefaultForSale: false }
          : { isDefaultForAgency: false },
    });
  }
}
