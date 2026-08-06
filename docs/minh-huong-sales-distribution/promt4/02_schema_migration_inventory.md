# Schema Migration Inventory

## Schema

File: `apps/api/prisma/schema.prisma`

- `:162` added `IdempotencyRecordStatus`.
- `:216` added `User.orderStatusHistories`.
- `:217` added `User.idempotencyRecords`.
- `:781` added `ActivationOrder.statusHistory`.
- `:809` added `OrderStatusHistory`.
- `:827` added `IdempotencyRecord`.

## Migration

File: `apps/api/prisma/migrations/20260614143000_order_history_idempotency/migration.sql`

- `:2` creates enum `IdempotencyRecordStatus`.
- `:5` creates table `OrderStatusHistory`.
- `:20` creates table `IdempotencyRecord`.
- `:39`, `:42`, `:45` create history indexes.
- `:48` creates unique `(scope, key)`.
- `:51`, `:54`, `:57` create idempotency indexes.
- `:60`, `:63`, `:66` add foreign keys.

## Prisma Generate

Command: `npm --prefix apps/api run prisma:generate`

Result: passed.

Note: migration file was created but not applied to a live database in this prompt. Tests use mocked Prisma service and build validates generated client types.
