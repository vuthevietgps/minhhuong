import { AccountRole } from './auth.types';

export const contentViewRoles: AccountRole[] = [
  'ADMIN',
  'DIRECTOR',
  'CONTENT_EDITOR',
];

export const contentManageRoles: AccountRole[] = ['ADMIN', 'CONTENT_EDITOR'];

export const contentPublishRoles: AccountRole[] = ['ADMIN'];

// Teacher content portal – scoped to lessons the teacher created themselves
export const teacherContentViewRoles: AccountRole[] = ['TEACHER'];
export const teacherContentManageRoles: AccountRole[] = ['TEACHER'];

export const activationOrderCreateRoles: AccountRole[] = [
  'ADMIN',
  'DIRECTOR',
  'SALE',
  'AGENCY_OWNER',
  'AGENCY_MANAGER',
];

export const activationOrderResubmitRoles: AccountRole[] = [
  'ADMIN',
  'DIRECTOR',
  'SALE',
  'AGENCY_OWNER',
  'AGENCY_MANAGER',
];

export const activationOrderReviewRoles: AccountRole[] = [
  'ADMIN',
  'OPERATIONS',
];

export const activationOrderViewRoles: AccountRole[] = [
  'ADMIN',
  'DIRECTOR',
  'SALE',
  'AGENCY_OWNER',
  'AGENCY_MANAGER',
  'OPERATIONS',
];

export const channelFinanceViewRoles: AccountRole[] = [
  'ADMIN',
  'DIRECTOR',
  'SALE',
  'AGENCY_OWNER',
  'AGENCY_MANAGER',
  'OPERATIONS',
];

export const channelFinanceManageRoles: AccountRole[] = ['ADMIN', 'OPERATIONS'];

export const channelReportViewRoles: AccountRole[] = [
  'ADMIN',
  'DIRECTOR',
  'OPERATIONS',
  'AGENCY_OWNER',
  'AGENCY_MANAGER',
];

export const channelAdminViewRoles: AccountRole[] = [
  'ADMIN',
  'DIRECTOR',
  'OPERATIONS',
  'AGENCY_OWNER',
  'AGENCY_MANAGER',
];

export const channelAdminManageRoles: AccountRole[] = ['ADMIN', 'OPERATIONS'];

export const channelMemberManageRoles: AccountRole[] = [
  'ADMIN',
  'DIRECTOR',
  'OPERATIONS',
  'AGENCY_OWNER',
  'AGENCY_MANAGER',
];

export const channelAffiliateViewRoles: AccountRole[] = [
  'ADMIN',
  'DIRECTOR',
  'OPERATIONS',
  'SALE',
  'AGENCY_OWNER',
  'AGENCY_MANAGER',
];

export const channelAffiliateManageRoles: AccountRole[] = [
  'ADMIN',
  'DIRECTOR',
  'OPERATIONS',
  'SALE',
  'AGENCY_OWNER',
  'AGENCY_MANAGER',
];
