import { BadRequestException } from '@nestjs/common';
import { ChannelReportQueryDto } from './dto/channel-report-query.dto';

export type MoneyStatusRow<T extends string> = {
  status: T;
  _count?: true | number | { id?: number; _all?: number };
  _sum?: {
    amountCents?: number | null;
  };
};

export type SourceRow = {
  source: 'SALE_ASSISTED' | 'SELF_SERVICE';
  _count?: true | number | { id?: number; _all?: number };
  _sum?: {
    amountCents?: number | null;
  };
};

export function resolveReportPeriod(query: ChannelReportQueryDto) {
  const to = query.to ? endOfReportDay(query.to) : new Date();
  const from = query.from
    ? new Date(query.from)
    : new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000);

  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
    throw new BadRequestException('Invalid report date range');
  }

  if (from > to) {
    throw new BadRequestException('Report start date must be before end date');
  }

  const maxRangeMs = 366 * 24 * 60 * 60 * 1000;
  if (to.getTime() - from.getTime() > maxRangeMs) {
    throw new BadRequestException('Report range cannot exceed 366 days');
  }

  return {
    from,
    to,
    toExclusive: new Date(to.getTime() + 1),
  };
}

export function endOfReportDay(value: string) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const date = new Date(value);
    date.setUTCHours(23, 59, 59, 999);
    return date;
  }

  return new Date(value);
}

export function rowsByStatus<T extends string>(rows: MoneyStatusRow<T>[]) {
  return rows.reduce(
    (result, row) => ({
      ...result,
      [row.status]: {
        count: countOf(row),
        amountCents: amountOf(row),
      },
    }),
    {} as Record<T, { count: number; amountCents: number }>,
  );
}

export function rowsBySource(rows: SourceRow[]) {
  return rows.reduce(
    (result, row) => ({
      ...result,
      [row.source]: {
        count: countOf(row),
        amountCents: amountOf(row),
      },
    }),
    {} as Record<
      'SALE_ASSISTED' | 'SELF_SERVICE',
      { count: number; amountCents: number }
    >,
  );
}

export function countOf(row?: {
  _count?: true | number | { id?: number; _all?: number };
}) {
  const count = row?._count;
  if (typeof count === 'number') {
    return count;
  }
  if (count && typeof count === 'object') {
    return count.id ?? count._all ?? 0;
  }

  return 0;
}

export function amountOf(row?: { _sum?: { amountCents?: number | null } }) {
  return row?._sum?.amountCents ?? 0;
}
