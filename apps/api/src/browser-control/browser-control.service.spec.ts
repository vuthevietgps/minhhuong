import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'node:crypto';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { AiTutorProvider } from '../ai-chat/ai-tutor.provider';
import { PrismaService } from '../prisma/prisma.service';
import { BrowserPolicyDto, BrowserSyncDto } from './browser-control.dto';
import {
  defaultBrowserPolicy,
  publicBrowserPolicy,
  validateBrowserPolicy,
} from './browser-control.policy';
import { BrowserControlService } from './browser-control.service';

const fixture = (): BrowserPolicyDto => ({
  ...defaultBrowserPolicy(),
  items: [
    {
      id: randomUUID(),
      title: 'Colors',
      url: 'https://video.test/watch?v=one',
      minutes: 5,
      context: 'Original topic notes about colors for young children.',
      questions: [{ prompt: 'Green?', options: ['Xanh lá', 'Đỏ'], answer: 0 }],
    },
  ],
});
describe('Browser control policy boundary', () => {
  it('rejects an AI URL that would exempt a video from its watch allowance', () => {
    const policy = fixture();
    policy.items[0].aiUrl = policy.items[0].url;
    expect(() => validateBrowserPolicy(policy)).toThrow(BadRequestException);
  });
  it.each([
    'javascript:alert(1)',
    'http://video.test/a',
    'https://user:pass@video.test/a',
    'https://video.test/a#b',
    'https://video.test:8080/a',
  ])('rejects unsafe or ambiguous approved URL %s', (url) => {
    const policy = fixture();
    policy.items[0].url = url;
    expect(() => validateBrowserPolicy(policy)).toThrow(BadRequestException);
  });
  it('validates timezone, duplicate IDs and answer bounds', () => {
    const policy = fixture();
    policy.timezone = 'Mars';
    expect(() => validateBrowserPolicy(policy)).toThrow();
    policy.timezone = 'Asia/Ho_Chi_Minh';
    policy.items.push(policy.items[0]);
    expect(() => validateBrowserPolicy(policy)).toThrow();
    policy.items.pop();
    policy.items[0].questions[0].answer = 3;
    expect(() => validateBrowserPolicy(policy)).toThrow();
  });
  it('keeps contexts and answer keys off extension configuration', () => {
    const result = publicBrowserPolicy(fixture(), 'https://school.test');
    expect(result.items[0]).not.toHaveProperty('context');
    expect(result.items[0]).not.toHaveProperty('questions');
    expect(result.items[0].learningUrl).toContain('/kid-learning?item=');
  });
  it('validates nested DTOs and rejects untrusted extra fields', async () => {
    const policy = fixture();
    policy.items[0].minutes = -1;
    expect(
      await validate(plainToInstance(BrowserPolicyDto, policy)),
    ).not.toHaveLength(0);
    const sync = plainToInstance(BrowserSyncDto, {
      usage: [{ day: '2026-09-19', itemId: randomUUID(), seconds: -5 }],
      events: [],
      childId: 'foreign-child',
    });
    expect(
      await validate(sync, { whitelist: true, forbidNonWhitelisted: true }),
    ).not.toHaveLength(0);
  });
  it('checks parent ownership before any mutation', async () => {
    const prisma = {
      childProfile: { findFirst: jest.fn().mockResolvedValue(null) },
      browserPolicy: { upsert: jest.fn() },
    };
    const service = new BrowserControlService(
      prisma as unknown as PrismaService,
      {} as ConfigService,
      {} as AiTutorProvider,
    );
    await expect(
      service.savePolicy('other-parent', 'child', fixture()),
    ).rejects.toThrow(NotFoundException);
    expect(prisma.browserPolicy.upsert).not.toHaveBeenCalled();
  });
});
