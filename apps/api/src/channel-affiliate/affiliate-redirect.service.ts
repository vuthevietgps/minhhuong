import { ConflictException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';
import {
  PublicRedirectInput,
  PublicRedirectResult,
  generateClickId,
  isLinkActiveForRedirect,
  queryString,
  redirectSnapshot,
  safeHttpUrl,
  sanitizeDeviceHint,
} from './affiliate-redirect.helpers';
import {
  isUniqueConflict,
  optionalTrim,
  setParam,
} from './channel-affiliate.helpers';

/** Public affiliate link redirect and click event capture. */
@Injectable()
export class AffiliateRedirectService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async resolvePublicRedirect(
    input: PublicRedirectInput,
  ): Promise<PublicRedirectResult> {
    const linkCode = optionalTrim(input.linkCode);
    if (!linkCode) {
      return {
        redirectUrl: this.fallbackRedirectUrl('missing'),
        eventCreated: false,
        reason: 'missing',
      };
    }

    const link = await this.prisma.affiliateLink.findUnique({
      where: { linkCode },
      include: {
        participant: {
          select: {
            id: true,
            status: true,
          },
        },
      },
    });

    if (!link) {
      return {
        redirectUrl: this.fallbackRedirectUrl('missing'),
        eventCreated: false,
        reason: 'missing',
      };
    }

    if (!isLinkActiveForRedirect(link)) {
      return {
        redirectUrl: this.fallbackRedirectUrl('inactive'),
        eventCreated: false,
        reason: 'inactive',
      };
    }

    const qrAsset = await this.resolveQrAssetForRedirect(
      link.id,
      queryString(input.query, 'qr'),
    );
    const snapshot = redirectSnapshot(link, qrAsset, input.query);
    const dedupeKeyHash = this.dedupeHash(link.id, input.dedupeKey);
    if (dedupeKeyHash) {
      const existing = await this.prisma.affiliateClickEvent.findUnique({
        where: { dedupeKeyHash },
        select: { clickId: true },
      });
      if (existing) {
        return {
          redirectUrl: this.redirectDestination(link.linkCode, {
            ...snapshot,
            clickId: existing.clickId,
          }),
          eventCreated: false,
          clickId: existing.clickId,
          reason: 'deduped',
        };
      }
    }

    return this.createClickEventWithUniqueId({
      link,
      qrAsset,
      snapshot,
      dedupeKeyHash,
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
      deviceHint: input.deviceHint,
    });
  }

  private async createClickEventWithUniqueId(input: {
    link: {
      id: string;
      linkCode: string;
      participantId: string;
      agencyId: string | null;
      agencyMemberId: string | null;
      referralCode: string | null;
    };
    qrAsset: { id: string } | null;
    snapshot: {
      packageCode?: string;
      campaign?: string;
      channel?: string;
      placement?: string;
    };
    dedupeKeyHash?: string;
    ipAddress?: string;
    userAgent?: string;
    deviceHint?: string;
  }) {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const clickId = generateClickId();
      const redirectUrl = this.redirectDestination(input.link.linkCode, {
        ...input.snapshot,
        clickId,
      });

      try {
        await this.prisma.affiliateClickEvent.create({
          data: {
            affiliateLinkId: input.link.id,
            affiliateQrAssetId: input.qrAsset?.id,
            participantId: input.link.participantId,
            agencyId: input.link.agencyId ?? undefined,
            agencyMemberId: input.link.agencyMemberId ?? undefined,
            referralCode: input.link.referralCode ?? undefined,
            clickId,
            dedupeKeyHash: input.dedupeKeyHash,
            ipHash: this.hashSensitive(input.ipAddress),
            userAgentHash: this.hashSensitive(input.userAgent),
            deviceHint: sanitizeDeviceHint(input.deviceHint),
            redirectUrl,
            campaign: input.snapshot.campaign,
            channel: input.snapshot.channel,
            placement: input.snapshot.placement,
            packageCode: input.snapshot.packageCode,
            metadataJson: {
              source: 'public_redirect',
              qrRequested: Boolean(input.qrAsset),
              qrAccepted: Boolean(input.qrAsset),
              explicitDedupe: Boolean(input.dedupeKeyHash),
            },
          },
        });

        return {
          redirectUrl,
          eventCreated: true,
          clickId,
          reason: 'active',
        } satisfies PublicRedirectResult;
      } catch (error) {
        if (isUniqueConflict(error)) {
          if (input.dedupeKeyHash) {
            const existing = await this.prisma.affiliateClickEvent.findUnique({
              where: { dedupeKeyHash: input.dedupeKeyHash },
              select: { clickId: true },
            });
            if (existing) {
              return {
                redirectUrl: this.redirectDestination(input.link.linkCode, {
                  ...input.snapshot,
                  clickId: existing.clickId,
                }),
                eventCreated: false,
                clickId: existing.clickId,
                reason: 'deduped',
              } satisfies PublicRedirectResult;
            }
          }
          continue;
        }
        throw error;
      }
    }

    throw new ConflictException(
      'Could not generate a unique affiliate click id',
    );
  }

  private async resolveQrAssetForRedirect(
    affiliateLinkId: string,
    qrAssetId?: string,
  ) {
    const normalizedQrAssetId = optionalTrim(qrAssetId);
    if (!normalizedQrAssetId) {
      return null;
    }

    return this.prisma.affiliateQrAsset.findFirst({
      where: {
        id: normalizedQrAssetId,
        affiliateLinkId,
        status: 'ACTIVE',
      },
      select: {
        id: true,
        placement: true,
      },
    });
  }

  private redirectDestination(
    linkCode: string,
    snapshot: {
      packageCode?: string;
      campaign?: string;
      channel?: string;
      placement?: string;
      clickId?: string;
    },
  ) {
    const url = new URL(this.redirectBaseUrl());
    setParam(url.searchParams, 'ref', linkCode);
    setParam(url.searchParams, 'pkg', snapshot.packageCode);
    setParam(url.searchParams, 'campaign', snapshot.campaign);
    setParam(url.searchParams, 'channel', snapshot.channel);
    setParam(url.searchParams, 'placement', snapshot.placement);
    setParam(url.searchParams, 'clickId', snapshot.clickId);
    return url.toString();
  }

  private fallbackRedirectUrl(reason: 'missing' | 'inactive') {
    const url = new URL(this.redirectBaseUrl());
    url.searchParams.set('affiliate', reason);
    return url.toString();
  }

  private redirectBaseUrl() {
    const raw =
      this.config.get<string>('AFFILIATE_REDIRECT_BASE_URL') ??
      process.env.AFFILIATE_REDIRECT_BASE_URL ??
      this.config.get<string>('WEB_PUBLIC_URL') ??
      process.env.WEB_PUBLIC_URL ??
      this.config.get<string>('APP_URL') ??
      process.env.APP_URL ??
      'https://minhhuong.app';
    return safeHttpUrl(raw, 'https://minhhuong.app', {
      rejectAffiliatePath: true,
    });
  }

  private dedupeHash(linkId: string, dedupeKey?: string) {
    const normalized = optionalTrim(dedupeKey);
    return normalized ? this.hmacHex(`${linkId}:${normalized}`) : undefined;
  }

  private hashSensitive(value?: string) {
    const normalized = optionalTrim(value);
    return normalized ? this.hmacHex(normalized) : undefined;
  }

  private hmacHex(value: string) {
    return createHmac('sha256', this.hashSecret()).update(value).digest('hex');
  }

  private hashSecret() {
    return (
      this.config.get<string>('AFFILIATE_HASH_SECRET') ??
      process.env.AFFILIATE_HASH_SECRET ??
      this.config.get<string>('JWT_SECRET') ??
      process.env.JWT_SECRET ??
      'dev-only-affiliate-hash-secret'
    );
  }
}
