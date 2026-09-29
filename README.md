# Minh Huong Learning Platform

Monorepo khoi dau cho nen tang hoc tieng Anh:

- `apps/api`: NestJS backend, PostgreSQL qua Prisma.
- `apps/web`: Next.js web app cho hoc vien va admin.
- `packages/shared`: kieu du lieu/contract dung chung cho web, backend, mobile sau nay.
- `docs`: tai lieu kien truc va van hanh noi dung.
- `minhhuongextension`: Chrome extension cho profile cua tre, dong bo cau hinh voi website.

## Quan Ly Trinh Duyet Cua Con

Trang `/browser-control` ket hop extension de duyet link, dat lich va han muc xem, chuyen sang AI/bai tap va theo doi ket qua. Xem [huong dan tich hop](docs/minhhuong-browser-control.md) va [cai extension](minhhuongextension/README.md).

Quy trinh chuan bi va gui duyet Chrome Web Store: [docs/chrome-web-store-publishing.md](docs/chrome-web-store-publishing.md).

## Yeu Cau

- Node.js 22+
- npm 10+
- PostgreSQL local qua script portable hoac Docker Desktop neu muon chay bang container

## Chay Local

```bash
cp .env.example .env
npm run db:local:start
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev:api
npm run dev:web
```

Mac dinh:

- API: `http://localhost:4000`
- Swagger: `http://localhost:4000/docs`
- Web: `http://localhost:3000`
- PostgreSQL: `localhost:5432`

Neu muon dung Docker thay vi PostgreSQL portable:

```bash
npm run db:up
```

Dung PostgreSQL local portable:

```bash
npm run db:local:stop
```

## Demo Accounts

Tat ca tai khoan demo dung mat khau `Demo@12345`.

```text
student@demo.local   -> Student dashboard
teacher@demo.local   -> Teacher dashboard
content@demo.local   -> Content editor dashboard
support@demo.local   -> Support dashboard
admin@demo.local     -> Admin dashboard
director@demo.local  -> Director dashboard
sale@demo.local      -> Sales dashboard
agency@demo.local    -> Agency owner dashboard
operations@demo.local -> Payment operations dashboard
```

Neu PostgreSQL chua chay, API van chap nhan cac demo account nay de frontend co the thu role-based dashboard. Khi DB da chay, `npm run prisma:seed` se tao cung cac tai khoan demo trong database.

## Huong Phat Trien

Ban web desktop/PWA duoc uu tien truoc. Mobile app React Native hoac Flutter se dung lai backend API, auth, entitlement/subscription, va design token trong `packages/shared`.

## Chuan Hoa Auto Loop

- `chuanhoatailieuv6.md`: chuan van hanh da du an cho Codex CLI + ChatGPT Web + watcher/runner; moi du an ap dung qua project adapter/registry rieng.
- `docs/hoctap_minhhuong/production_hardening_go_live_gate.md`: phase test/hardening sau MVP local-demo; khoa demo data, role permission matrix, go-live gate, va nguyen tac khong ha chuan test.

## Hosted Staging Foundation

Provider-neutral container files live in `deploy/hosted-staging.compose.yml`, with the operational contract in `docs/deployment/hosted-staging-runbook.md`. This package is staging-only, keeps all live providers disabled, and does not authorize an external or production deployment.
