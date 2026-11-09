import { execFileSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { join } from 'node:path';
import { ForbiddenException } from '@nestjs/common';
import { config } from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

import type { AuthenticatedUser } from '../auth/auth.types';
import { ChannelAdminService } from './channel-admin.service';
import { createChannelAdminServiceForTest } from './channel-admin.testing';

const apiRoot = process.cwd().endsWith(`${join('apps', 'api')}`)
  ? process.cwd()
  : join(process.cwd(), 'apps', 'api');

config({ path: join(apiRoot, '../../.env') });
config({ path: join(apiRoot, '.env') });

const baseDatabaseUrl =
  process.env.DATABASE_URL ??
  'postgresql://minhhuong:minhhuong@localhost:5432/minhhuong?schema=public';

type ChannelAdminScopeFixture = Awaited<
  ReturnType<typeof seedChannelAdminScopeFixture>
>;

describe('Channel admin scope integration', () => {
  jest.setTimeout(120_000);

  const databaseName = `prompt9_channel_admin_${randomUUID().replace(/-/g, '_')}`;
  let adminPrisma: PrismaClient;
  let prisma: PrismaClient;
  let service: ChannelAdminService;
  let fixture: ChannelAdminScopeFixture;

  beforeAll(async () => {
    adminPrisma = new PrismaClient({
      adapter: new PrismaPg(baseDatabaseUrl),
    });
    await adminPrisma.$connect();
    await adminPrisma.$executeRawUnsafe(`CREATE DATABASE "${databaseName}"`);

    const databaseUrl = databaseUrlForDatabase(databaseName);
    execFileSync(
      process.execPath,
      [
        join(apiRoot, 'node_modules/prisma/build/index.js'),
        'migrate',
        'deploy',
        '--schema',
        join(apiRoot, 'prisma/schema.prisma'),
      ],
      {
        cwd: apiRoot,
        env: { ...process.env, DATABASE_URL: databaseUrl },
        stdio: 'pipe',
      },
    );

    prisma = new PrismaClient({
      adapter: new PrismaPg(databaseUrl),
    });
    await prisma.$connect();
    const currentDatabase = await prisma.$queryRawUnsafe<
      Array<{ current_database: string }>
    >('select current_database()');
    expect(currentDatabase[0]?.current_database).toBe(databaseName);

    service = createChannelAdminServiceForTest(prisma as any);
    fixture = await seedChannelAdminScopeFixture(prisma);
  });

  afterAll(async () => {
    await prisma?.$disconnect();
    if (adminPrisma) {
      await adminPrisma.$executeRawUnsafe(
        `DROP DATABASE IF EXISTS "${databaseName}" WITH (FORCE)`,
      );
      await adminPrisma.$disconnect();
    }
  });

  it('filters agency lists and participant summary counts by channel subtree', async () => {
    const managerAAgencies = await service.listAgencies(fixture.users.managerA);
    expect(idsOf(managerAAgencies)).toEqual([fixture.agencies.agencyA]);

    const agencyAOwnerAgencies = await service.listAgencies(
      fixture.users.agencyAOwner,
    );
    expect(idsOf(agencyAOwnerAgencies)).toEqual([fixture.agencies.agencyA]);

    const directorAgencies = await service.listAgencies(fixture.users.director);
    expect(idsOf(directorAgencies)).toEqual(
      expect.arrayContaining([
        fixture.agencies.agencyA,
        fixture.agencies.agencyB,
      ]),
    );

    await expect(service.listAgencies(fixture.users.admin)).resolves.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: fixture.agencies.agencyA }),
        expect.objectContaining({ id: fixture.agencies.agencyB }),
      ]),
    );
    await expect(service.listAgencies(fixture.users.ops)).resolves.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: fixture.agencies.agencyA }),
        expect.objectContaining({ id: fixture.agencies.agencyB }),
      ]),
    );
    await expect(service.listAgencies(fixture.users.unscoped)).resolves.toEqual(
      [],
    );

    await expect(service.getSummary(fixture.users.managerA)).resolves.toEqual(
      expect.objectContaining({
        agencies: 1,
        activeAgencies: 1,
        saleUsers: 2,
        activeMembers: 4,
      }),
    );
    await expect(
      service.getSummary(fixture.users.agencyAOwner),
    ).resolves.toEqual(
      expect.objectContaining({
        agencies: 1,
        activeAgencies: 1,
        saleUsers: 1,
        activeMembers: 2,
      }),
    );
    await expect(service.getSummary(fixture.users.unscoped)).resolves.toEqual(
      expect.objectContaining({
        agencies: 0,
        activeAgencies: 0,
        saleUsers: 0,
        activeMembers: 0,
      }),
    );
  });

  it('filters user lists and participant payloads by channel subtree', async () => {
    const managerAUsers = await service.listUsers(fixture.users.managerA, {
      limit: 50,
    });
    expect(idsOf(managerAUsers.items)).toEqual(
      expect.arrayContaining([
        fixture.userIds.managerAUser,
        fixture.userIds.agencyAOwnerUser,
        fixture.userIds.saleAUser,
        fixture.userIds.saleADirectUser,
      ]),
    );
    expect(idsOf(managerAUsers.items)).not.toEqual(
      expect.arrayContaining([
        fixture.userIds.managerBUser,
        fixture.userIds.agencyBOwnerUser,
        fixture.userIds.saleBUser,
        fixture.userIds.saleBDirectUser,
      ]),
    );
    expect(
      idsOf(
        managerAUsers.items
          .map((user) => user.channelParticipant)
          .filter(Boolean) as Array<{ id: string }>,
      ),
    ).toEqual(
      expect.arrayContaining([
        fixture.participants.managerA,
        fixture.participants.agencyAParticipant,
        fixture.participants.saleA,
        fixture.participants.saleADirect,
      ]),
    );

    const agencyAUsers = await service.listUsers(fixture.users.agencyAOwner, {
      limit: 50,
    });
    expect(idsOf(agencyAUsers.items)).toEqual(
      expect.arrayContaining([
        fixture.userIds.agencyAOwnerUser,
        fixture.userIds.saleAUser,
      ]),
    );
    expect(idsOf(agencyAUsers.items)).not.toEqual(
      expect.arrayContaining([
        fixture.userIds.saleADirectUser,
        fixture.userIds.saleBUser,
      ]),
    );

    const directorUsers = await service.listUsers(fixture.users.director, {
      limit: 50,
    });
    expect(idsOf(directorUsers.items)).toEqual(
      expect.arrayContaining([
        fixture.userIds.managerAUser,
        fixture.userIds.managerBUser,
        fixture.userIds.saleAUser,
        fixture.userIds.saleBUser,
      ]),
    );

    const adminUsers = await service.listUsers(fixture.users.admin, {
      limit: 50,
    });
    expect(idsOf(adminUsers.items)).toEqual(
      expect.arrayContaining([
        fixture.userIds.adminUser,
        fixture.userIds.opsUser,
        fixture.userIds.unscopedUser,
        fixture.userIds.saleAUser,
        fixture.userIds.saleBUser,
      ]),
    );

    const unscopedUsers = await service.listUsers(fixture.users.unscoped, {
      limit: 50,
    });
    expect(unscopedUsers.items).toHaveLength(0);
  });

  it('rejects sibling actions while allowing in-scope positive controls', async () => {
    await expect(
      service.updateUserStatus(
        fixture.userIds.saleAUser,
        { status: 'SUSPENDED', reason: 'Prompt 9 in-scope control' } as any,
        fixture.users.managerA,
      ),
    ).resolves.toEqual(
      expect.objectContaining({ id: fixture.userIds.saleAUser }),
    );

    await expect(
      service.updateUserStatus(
        fixture.userIds.saleBUser,
        { status: 'SUSPENDED', reason: 'Prompt 9 sibling attempt' } as any,
        fixture.users.managerA,
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
    await expect(
      prisma.user.findUniqueOrThrow({
        where: { id: fixture.userIds.saleBUser },
        select: { status: true },
      }),
    ).resolves.toEqual({ status: 'ACTIVE' });

    await expect(
      service.resetUserPassword(
        fixture.userIds.saleAUser,
        { password: 'Prompt9NewPass!' },
        fixture.users.agencyAOwner,
      ),
    ).resolves.toEqual(
      expect.objectContaining({ id: fixture.userIds.saleAUser }),
    );

    await expect(
      service.resetUserPassword(
        fixture.userIds.saleBUser,
        { password: 'Prompt9NewPass!' },
        fixture.users.agencyAOwner,
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);

    await expect(
      service.updateAgencyMember(
        fixture.members.saleA,
        { title: 'Prompt 9 scoped sale' },
        fixture.users.managerA,
      ),
    ).resolves.toEqual(expect.objectContaining({ id: fixture.members.saleA }));

    await expect(
      service.updateAgencyMember(
        fixture.members.saleB,
        { title: 'Prompt 9 forbidden sibling' },
        fixture.users.managerA,
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
    await expect(
      prisma.agencyMember.findUniqueOrThrow({
        where: { id: fixture.members.saleB },
        select: { title: true },
      }),
    ).resolves.toEqual({ title: 'Prompt 9 Sale B' });
  });
});

function databaseUrlForDatabase(database: string) {
  const url = new URL(baseDatabaseUrl);
  url.pathname = `/${database}`;
  url.searchParams.delete('schema');
  url.searchParams.delete('options');
  return url.toString();
}

function idsOf(rows: Array<{ id: string }>) {
  return rows.map((row) => row.id).sort();
}

async function seedChannelAdminScopeFixture(prisma: PrismaClient) {
  const userIds = {
    adminUser: 'p9-admin-user',
    opsUser: 'p9-ops-user',
    directorUser: 'p9-director-user',
    managerAUser: 'p9-manager-a-user',
    managerBUser: 'p9-manager-b-user',
    agencyAOwnerUser: 'p9-agency-a-owner-user',
    agencyBOwnerUser: 'p9-agency-b-owner-user',
    saleAUser: 'p9-sale-a-user',
    saleBUser: 'p9-sale-b-user',
    saleADirectUser: 'p9-sale-a-direct-user',
    saleBDirectUser: 'p9-sale-b-direct-user',
    unscopedUser: 'p9-unscoped-user',
  };
  const agencies = {
    agencyA: 'p9-agency-a',
    agencyB: 'p9-agency-b',
  };
  const participants = {
    directorRoot: 'p9-director-root',
    managerA: 'p9-manager-a',
    managerB: 'p9-manager-b',
    agencyAParticipant: 'p9-agency-a-participant',
    agencyBParticipant: 'p9-agency-b-participant',
    saleA: 'p9-sale-a',
    saleB: 'p9-sale-b',
    saleADirect: 'p9-sale-a-direct',
    saleBDirect: 'p9-sale-b-direct',
  };
  const members = {
    agencyAOwner: 'p9-member-agency-a-owner',
    agencyBOwner: 'p9-member-agency-b-owner',
    saleA: 'p9-member-sale-a',
    saleB: 'p9-member-sale-b',
  };

  await prisma.role.createMany({
    data: [
      role('ADMIN'),
      role('OPERATIONS'),
      role('DIRECTOR'),
      role('AGENCY_MANAGER'),
      role('AGENCY_OWNER'),
      role('SALE'),
    ],
  });
  await prisma.user.createMany({
    data: [
      user(userIds.adminUser, 'p9-admin@example.com'),
      user(userIds.opsUser, 'p9-ops@example.com'),
      user(userIds.directorUser, 'p9-director@example.com'),
      user(userIds.managerAUser, 'p9-manager-a@example.com'),
      user(userIds.managerBUser, 'p9-manager-b@example.com'),
      user(userIds.agencyAOwnerUser, 'p9-agency-a@example.com'),
      user(userIds.agencyBOwnerUser, 'p9-agency-b@example.com'),
      user(userIds.saleAUser, 'p9-sale-a@example.com'),
      user(userIds.saleBUser, 'p9-sale-b@example.com'),
      user(userIds.saleADirectUser, 'p9-sale-a-direct@example.com'),
      user(userIds.saleBDirectUser, 'p9-sale-b-direct@example.com'),
      user(userIds.unscopedUser, 'p9-unscoped@example.com'),
    ],
  });
  await prisma.userRole.createMany({
    data: [
      userRole(userIds.adminUser, 'ADMIN'),
      userRole(userIds.opsUser, 'OPERATIONS'),
      userRole(userIds.directorUser, 'DIRECTOR'),
      userRole(userIds.managerAUser, 'AGENCY_MANAGER'),
      userRole(userIds.managerBUser, 'AGENCY_MANAGER'),
      userRole(userIds.agencyAOwnerUser, 'AGENCY_OWNER'),
      userRole(userIds.agencyBOwnerUser, 'AGENCY_OWNER'),
      userRole(userIds.saleAUser, 'SALE'),
      userRole(userIds.saleBUser, 'SALE'),
      userRole(userIds.saleADirectUser, 'SALE'),
      userRole(userIds.saleBDirectUser, 'SALE'),
      userRole(userIds.unscopedUser, 'AGENCY_MANAGER'),
    ],
  });

  await prisma.agency.createMany({
    data: [
      {
        id: agencies.agencyA,
        code: 'P9-AGENCY-A',
        name: 'Prompt 9 Agency A',
        defaultRateBps: 500,
      },
      {
        id: agencies.agencyB,
        code: 'P9-AGENCY-B',
        name: 'Prompt 9 Agency B',
        defaultRateBps: 500,
      },
    ],
  });

  await prisma.channelParticipant.create({
    data: participant({
      id: participants.directorRoot,
      type: 'DIRECTOR',
      code: 'P9-DIRECTOR',
      displayName: 'Prompt 9 Director',
      userId: userIds.directorUser,
      lineage: `/${participants.directorRoot}/`,
      depth: 0,
    }),
  });
  await prisma.channelParticipant.update({
    where: { id: participants.directorRoot },
    data: { rootParticipantId: participants.directorRoot },
  });

  await prisma.channelParticipant.createMany({
    data: [
      participant({
        id: participants.managerA,
        type: 'MANAGER',
        code: 'P9-MANAGER-A',
        displayName: 'Prompt 9 Manager A',
        userId: userIds.managerAUser,
        parentParticipantId: participants.directorRoot,
        rootParticipantId: participants.directorRoot,
        lineage: `/${participants.directorRoot}/${participants.managerA}/`,
        depth: 1,
      }),
      participant({
        id: participants.managerB,
        type: 'MANAGER',
        code: 'P9-MANAGER-B',
        displayName: 'Prompt 9 Manager B',
        userId: userIds.managerBUser,
        parentParticipantId: participants.directorRoot,
        rootParticipantId: participants.directorRoot,
        lineage: `/${participants.directorRoot}/${participants.managerB}/`,
        depth: 1,
      }),
    ],
  });

  await prisma.channelParticipant.createMany({
    data: [
      participant({
        id: participants.agencyAParticipant,
        type: 'AGENCY',
        code: 'P9-AGENCY-A',
        displayName: 'Prompt 9 Agency A',
        userId: userIds.agencyAOwnerUser,
        agencyId: agencies.agencyA,
        parentParticipantId: participants.managerA,
        rootParticipantId: participants.directorRoot,
        lineage: `/${participants.directorRoot}/${participants.managerA}/${participants.agencyAParticipant}/`,
        depth: 2,
      }),
      participant({
        id: participants.agencyBParticipant,
        type: 'AGENCY',
        code: 'P9-AGENCY-B',
        displayName: 'Prompt 9 Agency B',
        userId: userIds.agencyBOwnerUser,
        agencyId: agencies.agencyB,
        parentParticipantId: participants.managerB,
        rootParticipantId: participants.directorRoot,
        lineage: `/${participants.directorRoot}/${participants.managerB}/${participants.agencyBParticipant}/`,
        depth: 2,
      }),
    ],
  });

  await prisma.channelParticipant.createMany({
    data: [
      participant({
        id: participants.saleA,
        type: 'SALE',
        code: 'P9-SALE-A',
        displayName: 'Prompt 9 Sale A',
        userId: userIds.saleAUser,
        parentParticipantId: participants.agencyAParticipant,
        rootParticipantId: participants.directorRoot,
        lineage: `/${participants.directorRoot}/${participants.managerA}/${participants.agencyAParticipant}/${participants.saleA}/`,
        depth: 3,
      }),
      participant({
        id: participants.saleB,
        type: 'SALE',
        code: 'P9-SALE-B',
        displayName: 'Prompt 9 Sale B',
        userId: userIds.saleBUser,
        parentParticipantId: participants.agencyBParticipant,
        rootParticipantId: participants.directorRoot,
        lineage: `/${participants.directorRoot}/${participants.managerB}/${participants.agencyBParticipant}/${participants.saleB}/`,
        depth: 3,
      }),
      participant({
        id: participants.saleADirect,
        type: 'SALE',
        code: 'P9-SALE-A-DIRECT',
        displayName: 'Prompt 9 Sale A Direct',
        userId: userIds.saleADirectUser,
        parentParticipantId: participants.managerA,
        rootParticipantId: participants.directorRoot,
        lineage: `/${participants.directorRoot}/${participants.managerA}/${participants.saleADirect}/`,
        depth: 2,
      }),
      participant({
        id: participants.saleBDirect,
        type: 'SALE',
        code: 'P9-SALE-B-DIRECT',
        displayName: 'Prompt 9 Sale B Direct',
        userId: userIds.saleBDirectUser,
        parentParticipantId: participants.managerB,
        rootParticipantId: participants.directorRoot,
        lineage: `/${participants.directorRoot}/${participants.managerB}/${participants.saleBDirect}/`,
        depth: 2,
      }),
    ],
  });

  await prisma.agencyMember.createMany({
    data: [
      agencyMember(
        members.agencyAOwner,
        agencies.agencyA,
        userIds.agencyAOwnerUser,
        'OWNER',
        'Prompt 9 Agency A Owner',
        'P9-A-OWNER',
      ),
      agencyMember(
        members.agencyBOwner,
        agencies.agencyB,
        userIds.agencyBOwnerUser,
        'OWNER',
        'Prompt 9 Agency B Owner',
        'P9-B-OWNER',
      ),
      agencyMember(
        members.saleA,
        agencies.agencyA,
        userIds.saleAUser,
        'SALE',
        'Prompt 9 Sale A',
        'P9-SALE-A',
      ),
      agencyMember(
        members.saleB,
        agencies.agencyB,
        userIds.saleBUser,
        'SALE',
        'Prompt 9 Sale B',
        'P9-SALE-B',
      ),
    ],
  });

  return {
    userIds,
    agencies,
    participants,
    members,
    users: {
      admin: authUser(userIds.adminUser, ['ADMIN']),
      ops: authUser(userIds.opsUser, ['OPERATIONS']),
      director: authUser(userIds.directorUser, ['DIRECTOR']),
      managerA: authUser(userIds.managerAUser, ['AGENCY_MANAGER']),
      managerB: authUser(userIds.managerBUser, ['AGENCY_MANAGER']),
      agencyAOwner: authUser(userIds.agencyAOwnerUser, ['AGENCY_OWNER']),
      agencyBOwner: authUser(userIds.agencyBOwnerUser, ['AGENCY_OWNER']),
      saleA: authUser(userIds.saleAUser, ['SALE']),
      saleB: authUser(userIds.saleBUser, ['SALE']),
      unscoped: authUser(userIds.unscopedUser, ['AGENCY_MANAGER']),
    },
  };
}

function role(name: string) {
  return {
    id: `p9-role-${name.toLowerCase()}`,
    name,
    description: `Prompt 9 ${name}`,
  };
}

function userRole(userId: string, roleName: string) {
  return {
    userId,
    roleId: `p9-role-${roleName.toLowerCase()}`,
  };
}

function user(id: string, email: string) {
  return {
    id,
    email,
    passwordHash: 'test-hash',
    status: 'ACTIVE' as const,
  };
}

function authUser(sub: string, roles: string[]): AuthenticatedUser {
  return {
    sub,
    email: `${sub}@example.com`,
    roles,
  };
}

function participant(input: {
  id: string;
  type: 'DIRECTOR' | 'MANAGER' | 'AGENCY' | 'SALE';
  code: string;
  displayName: string;
  userId?: string;
  agencyId?: string;
  parentParticipantId?: string;
  rootParticipantId?: string;
  lineage: string;
  depth: number;
}) {
  return {
    id: input.id,
    type: input.type,
    code: input.code,
    displayName: input.displayName,
    userId: input.userId,
    agencyId: input.agencyId,
    parentParticipantId: input.parentParticipantId,
    rootParticipantId: input.rootParticipantId,
    lineage: input.lineage,
    depth: input.depth,
    status: 'ACTIVE' as const,
    baseSalaryCents: 0,
  };
}

function agencyMember(
  id: string,
  agencyId: string,
  userId: string,
  role: 'OWNER' | 'MANAGER' | 'SALE',
  title: string,
  referralCode: string,
) {
  return {
    id,
    agencyId,
    userId,
    role,
    title,
    referralCode,
    isActive: true,
  };
}
