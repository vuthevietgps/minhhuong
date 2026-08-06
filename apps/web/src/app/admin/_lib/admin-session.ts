"use client";

import { useEffect, useState } from "react";
import { readStoredSession } from "../../session-storage";

export type Role =
  | "STUDENT"
  | "PARENT"
  | "TEACHER"
  | "CONTENT_EDITOR"
  | "ADMIN"
  | "DIRECTOR"
  | "SUPPORT"
  | "SALE"
  | "AGENCY_OWNER"
  | "AGENCY_MANAGER"
  | "OPERATIONS";

type StoredAdminSession = {
  accessToken: string;
  user: {
    id: string;
    email: string;
    displayName?: string;
    roles: Role[];
  };
};

export const adminOverviewRoles = [
  "ADMIN",
  "DIRECTOR",
  "OPERATIONS",
  "AGENCY_OWNER",
  "AGENCY_MANAGER",
] as const;

export const adminOrdersRoles = [
  "ADMIN",
  "DIRECTOR",
  "SALE",
  "AGENCY_OWNER",
  "AGENCY_MANAGER",
  "OPERATIONS",
] as const;

export const adminChannelRoles = [
  "ADMIN",
  "DIRECTOR",
  "OPERATIONS",
  "AGENCY_OWNER",
  "AGENCY_MANAGER",
] as const;

export const adminFinanceRoles = [
  "ADMIN",
  "DIRECTOR",
  "OPERATIONS",
  "AGENCY_OWNER",
  "AGENCY_MANAGER",
] as const;

export const adminPackagesRoles = adminChannelRoles;

export const adminPerformanceRoles = [
  "SALE",
  "AGENCY_OWNER",
  "AGENCY_MANAGER",
] as const;

export function hasAllowedRole(
  userRoles: readonly Role[],
  allowedRoles: readonly Role[],
) {
  return userRoles.some((role) => allowedRoles.includes(role));
}

export function adminLandingForRoles(userRoles: readonly Role[]) {
  if (
    hasAllowedRole(userRoles, adminPerformanceRoles) &&
    !hasAllowedRole(userRoles, adminOverviewRoles)
  ) {
    return "/admin/performance";
  }

  return "/admin";
}

export function useStoredAdminSession() {
  const [session, setSession] = useState<StoredAdminSession | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSession(readStoredSession<StoredAdminSession>());
      setLoaded(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  return {
    session,
    roles: session?.user.roles ?? [],
    loaded,
  };
}
