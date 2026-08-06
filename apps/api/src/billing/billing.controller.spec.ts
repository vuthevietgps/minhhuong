import { ForbiddenException } from '@nestjs/common';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { BillingController } from './billing.controller';

describe('BillingController', () => {
  const billingService = {
    listPlans: jest.fn(),
    getCurrentSubscription: jest.fn(),
    getWallet: jest.fn(),
  };
  const controller = new BillingController(billingService as any);
  const user = {
    sub: 'user-1',
    email: 'user@example.com',
    roles: ['PARENT'],
  } as any;
  const admin = {
    sub: 'admin-1',
    email: 'admin@example.com',
    roles: ['ADMIN'],
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('keeps billing plans public', () => {
    const guards =
      Reflect.getMetadata(GUARDS_METADATA, controller.listPlans) ?? [];

    expect(guards).not.toContain(JwtAuthGuard);
  });

  it('requires JWT auth on legacy user subscription and wallet routes', () => {
    expect(
      Reflect.getMetadata(GUARDS_METADATA, controller.getCurrentSubscription),
    ).toContain(JwtAuthGuard);
    expect(
      Reflect.getMetadata(GUARDS_METADATA, controller.getWallet),
    ).toContain(JwtAuthGuard);
  });

  it('allows users to read their own billing routes', () => {
    billingService.getCurrentSubscription.mockReturnValue({ id: 'sub-1' });
    billingService.getWallet.mockReturnValue({ balanceCents: 0 });

    expect(controller.getCurrentSubscription('user-1', user)).toEqual({
      id: 'sub-1',
    });
    expect(controller.getWallet('user-1', user)).toEqual({ balanceCents: 0 });
  });

  it('blocks user A from reading billing data for user B', () => {
    expect(() => controller.getCurrentSubscription('user-2', user)).toThrow(
      ForbiddenException,
    );
    expect(() => controller.getWallet('user-2', user)).toThrow(
      ForbiddenException,
    );
  });

  it('allows admin/support to read guarded legacy billing routes', () => {
    billingService.getCurrentSubscription.mockReturnValue({ id: 'sub-2' });

    expect(controller.getCurrentSubscription('user-2', admin)).toEqual({
      id: 'sub-2',
    });
  });
});
