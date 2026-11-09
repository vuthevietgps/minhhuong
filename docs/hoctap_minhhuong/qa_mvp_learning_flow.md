# QA MVP Learning Flow

Runbook nay dung cho smoke test local/dev cua luong hoc tap Minh Huong sau cac vong 2C-9A.

## Demo seed

- Parent demo: `parent@demo.local`
- Password demo: `Demo@12345`
- Child demo: `Demo Con`
- Learning path code: `MH-DEMO-A1-GREETINGS`
- Content package code: `MH-DEMO-A1-GREETINGS-PACKAGE`
- Lesson slug: `greetings-basics`
- Video provider: YouTube nocookie embed

Seed duoc thiet ke idempotent. Khong drop database, khong reset schema, khong xoa assignment hay du lieu hoc tap khong lien quan. Rieng demo child/path cua smoke, seed reset daily plan, video watch evidence, practice attempt va lesson progress ve baseline co the chay lai.

## Setup commands

```powershell
npm --prefix apps/api run prisma:generate
npx prisma migrate status --config apps/api/prisma.config.ts --schema apps/api/prisma
npm --prefix apps/api run prisma:seed
npm --prefix apps/api run build
npm --prefix apps/web run build
```

Prisma 7 trong repo nay doc datasource URL tu `apps/api/prisma.config.ts`, vi vay lenh migrate status can truyen ca `--config` va `--schema` khi chay tu root.

## Start local app

```powershell
npm --prefix apps/api run start:dev
npm --prefix apps/web run dev
```

Mac dinh local:

- API: `http://localhost:4000/v1`
- Web: `http://localhost:3000`

## Manual smoke steps

1. Dang nhap bang parent demo.
2. Mo khu vuc hoc tap va chon child `Demo Con`.
3. Kiem tra active assignment hien `MH-DEMO-A1-GREETINGS-PACKAGE`.
4. Mo Daily Plan hom nay. Expected: co item video dang `READY` va item practice dang `LOCKED` hoac cho video hoan thanh.
5. Mo video `Greeting Basics`, ghi nhan watch evidence dat nguong 80%.
6. Hoan thanh item video. Expected: practice item chuyen sang `READY`.
7. Lam practice `Greeting check` va chon dap an dung `Good morning, nice to meet you.`
8. Sau submit practice, Daily Plan tren home refresh va hien evidence practice passed.
9. Hoan thanh practice item. Expected: plan co the chuyen `COMPLETED` khi tat ca item dat yeu cau.
10. Mo parent learning report range `7d`. Expected: co evidence video/practice cua child demo.

## Browser/manual QA pack

Manual browser QA pack cho luong parent/child MVP nam o:

```text
docs/hoctap_minhhuong/browser_manual_qa_mvp_learning_flow.md
```

Dung file nay khi can screenshot checklist, mobile checklist, severity matrix va pass/fail template. Neu chua co screenshot/harness browser, ket qua dung la `PASS_MANUAL_QA_PACK_READY`, khong phai `PASS_BROWSER_VERIFIED`.

## Automated smoke

Backend e2e smoke nam o:

```text
apps/api/test/learning-mvp-flow.e2e-spec.ts
```

Non-mocked HTTP smoke command sau khi API dang chay va DB da seed:

```powershell
npm --prefix apps/api run smoke:learning-mvp
```

Test nay validate hop dong HTTP route cho:

- Parent list child
- Parent doc active content assignment
- Runtime daily plan
- Video watch evidence
- Practice attempt evidence
- Home refresh sau practice
- Parent report evidence
- 403/404 gate cho lesson ngoai assignment va child khong thuoc parent

HTTP smoke command validate runtime API that:

- Logs in with parent demo without printing token/password.
- Reads child `Demo Con`.
- Confirms active package/path assignment.
- Gets or generates today's daily plan.
- Records video watch evidence.
- Submits backend-graded practice.
- Refreshes learning home and checks item evidence/status.
- Reads parent 7-day report.
- Checks missing-token negative gate returns 401.
