"use client";



export type ChannelAdminSummary = {
  agencies: number;
  activeAgencies: number;
  saleUsers: number;
  activeMembers: number;
  policies: number;
  learners: number;
};

export type AgencyAdmin = {
  id: string;
  code: string;
  name: string;
  status: "ACTIVE" | "SUSPENDED";
  defaultRateBps: number;
  notes?: string | null;
  channelParticipant?: {
    commissionRateBps?: number | null;
  } | null;
  _count: {
    activationOrders: number;
    commissions: number;
    payoutRequests: number;
  };
  members: Array<{
    id: string;
    role: "OWNER" | "MANAGER" | "SALE";
    title?: string | null;
    referralCode?: string | null;
    rateBps?: number | null;
    isActive: boolean;
    user: {
      email: string;
      profile?: {
        displayName?: string;
      };
    };
  }>;
};

export type CommissionPolicyAdmin = {
  id: string;
  code: string;
  name: string;
  beneficiaryType: "SALE" | "AGENCY";
  rateBps: number;
  baseSalaryCents: number;
  isDefaultForSale: boolean;
  isDefaultForAgency: boolean;
  isActive: boolean;
};

export type ChannelUser = {
  id: string;
  email: string;
  status: "ACTIVE" | "SUSPENDED" | "DELETED";
  createdAt: string;
  profile?: {
    displayName?: string;
  };
  roles: Array<{
    role: {
      name: string;
    };
  }>;
  agencyMemberships: Array<{
    role: "OWNER" | "MANAGER" | "SALE";
    title?: string | null;
    referralCode?: string | null;
    rateBps?: number | null;
    agency: {
      code: string;
      name: string;
    };
  }>;
  channelParticipant?: {
    code: string;
    commissionRateBps?: number | null;
    baseSalaryCents?: number | null;
  } | null;
  childProfiles: Array<{
    subscriptions: Array<{
      status: string;
      currentPeriodEnd?: string;
    }>;
  }>;
};

export type ChannelUserPage = {
  items: ChannelUser[];
  total: number;
  nextCursor?: string | null;
};

export type ChannelAccountRole = "SALE" | "AGENCY_OWNER" | "AGENCY_MANAGER";

export type AgencyMemberRole = "SALE" | "MANAGER" | "OWNER";

export type EditableAgencyMember = AgencyAdmin["members"][number] & {
  agencyId: string;
  agencyCode: string;
  agencyName: string;
};

// The API returns each child profile's latest ACTIVE/TRIALING subscription;
// show the one that ends last across all of the user's child profiles.
export function latestChildSubscription(user: ChannelUser) {
  return (user.childProfiles ?? [])
    .flatMap((child) => child.subscriptions ?? [])
    .sort((a, b) =>
      (b.currentPeriodEnd ?? "").localeCompare(a.currentPeriodEnd ?? ""),
    )[0];
}

export function randomIndex(max: number) {
  if (max <= 0) {
    return 0;
  }

  if (typeof crypto !== "undefined") {
    const values = new Uint32Array(1);
    crypto.getRandomValues(values);
    return values[0] % max;
  }

  return Math.floor(Math.random() * max);
}

export function buildTemporaryPassword(length = 14) {
  const sets = [
    "ABCDEFGHJKLMNPQRSTUVWXYZ",
    "abcdefghijkmnopqrstuvwxyz",
    "23456789",
    "!@#$%&*?",
  ];
  const allChars = sets.join("");
  const chars = sets.map((set) => set[randomIndex(set.length)]);

  while (chars.length < length) {
    chars.push(allChars[randomIndex(allChars.length)]);
  }

  for (let index = chars.length - 1; index > 0; index -= 1) {
    const nextIndex = randomIndex(index + 1);
    [chars[index], chars[nextIndex]] = [chars[nextIndex], chars[index]];
  }

  return chars.join("");
}
