import { ScreenTimeService } from './screen-time.service';

describe('ScreenTimeService', () => {
  const prisma = {
    childScreenTimeSetting: { findUnique: jest.fn() },
    learningAppSession: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
  };
  const service = new ScreenTimeService(prisma as any);

  beforeEach(() => {
    jest.resetAllMocks();
    jest.useFakeTimers().setSystemTime(new Date('2026-08-27T03:00:00.000Z'));
    prisma.learningAppSession.updateMany.mockResolvedValue({ count: 0 });
  });

  afterEach(() => jest.useRealTimers());

  it('leaves the app available when parental controls are disabled', async () => {
    prisma.childScreenTimeSetting.findUnique.mockResolvedValue(null);
    await expect(service.heartbeat('child-1', 'device-123')).resolves.toEqual(
      expect.objectContaining({ isEnabled: false, allowed: true }),
    );
  });

  it('ends a session and starts the configured break at the server boundary', async () => {
    prisma.childScreenTimeSetting.findUnique.mockResolvedValue({
      isEnabled: true,
      dailyLimitMinutes: 45,
      sessionLimitMinutes: 5,
      breakMinutes: 10,
    });
    prisma.learningAppSession.findFirst
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        id: 'session-1',
        childProfileId: 'child-1',
        deviceKey: 'device-123',
        status: 'ACTIVE',
        activeSeconds: 290,
        lastHeartbeatAt: new Date('2026-08-27T02:59:45.000Z'),
        breakUntil: null,
      });
    prisma.learningAppSession.update.mockImplementation(({ data }: any) => ({
      id: 'session-1',
      activeSeconds: data.activeSeconds,
      status: data.status,
      breakUntil: data.breakUntil,
    }));

    const result = await service.heartbeat(
      'child-1',
      'device-123',
      'session-1',
    );

    expect(result).toEqual(
      expect.objectContaining({
        allowed: false,
        remainingSessionSeconds: 0,
        breakRemainingSeconds: 600,
      }),
    );
    expect(prisma.learningAppSession.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'BREAK_REQUIRED' }),
      }),
    );
  });
});
