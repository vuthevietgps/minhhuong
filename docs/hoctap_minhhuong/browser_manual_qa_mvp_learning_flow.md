# Browser Manual QA MVP Learning Flow

Ngay lap: 2026-06-15

Tai lieu nay la QA pack thu cong cho luong hoc tap Minh Huong MVP khi repo chua co browser automation harness. No bo sung cho `qa_mvp_learning_flow.md` va dung de tao bang chung man hinh truoc khi goi luong nay la browser-verified.

## Pham vi xac nhan

- App web Next.js tai route `/`.
- API tai `http://localhost:4000/v1`.
- Luong parent demo: dang nhap, chon con, xem lo trinh, hoc hom nay, xem video, lam practice, xem bao cao phu huynh.
- Khong xac nhan cac flow admin/teacher/channel ngoai nhung man hinh can cho luong hoc tap.

## Ket qua browser automation

`NO_BROWSER_SCREENSHOT_AVAILABLE`

Ly do: repo hien khong co Playwright/Cypress/Puppeteer script, config, hoac dependency test browser. Prompt 12 khong them dependency lon moi chi de chup anh, nen ket qua hop le cua vong nay la manual QA pack san sang chay.

Neu sau nay them browser harness, can chay lai pack nay va luu anh vao:

```text
audit-output/promt_hoctap_minhhuong_12_browser_qa/screenshots/
```

## Local setup

Chay tu root repo:

```powershell
npm --prefix apps/api run prisma:generate
npx prisma migrate status --config apps/api/prisma.config.ts --schema apps/api/prisma/schema.prisma
npm --prefix apps/api run build
npm --prefix apps/api test -- --runInBand
npm --prefix apps/api run test:e2e -- --runInBand
npm --prefix apps/api run prisma:seed
```

Start API:

```powershell
npm --prefix apps/api run start:dev
```

Hoac sau khi build:

```powershell
node apps/api/dist/src/main.js
```

Start web. Neu port 3000 ban, dung 3100:

```powershell
$env:NEXT_PUBLIC_API_URL="http://localhost:4000"
npm --prefix apps/web run dev -- -p 3100
```

URL web:

- Primary: `http://localhost:3000`
- Fallback neu 3000 ban: `http://localhost:3100`

Seed co chu y reset baseline cho demo child/path cua smoke. Chay lai `npm --prefix apps/api run prisma:seed` truoc moi vong manual QA neu muon bat dau tu trang thai sach.

## Demo account

- Parent email: `parent@demo.local`
- Password: `Demo@12345`
- Child: `Demo Con`
- Content package: `MH-DEMO-A1-GREETINGS-PACKAGE`
- Learning path: `MH-DEMO-A1-GREETINGS`
- Lesson slug: `greetings-basics`
- Practice: `Greeting check`
- Correct answer: `Good morning, nice to meet you.`

## Screenshot checklist

Luu anh theo ten de audit de doc:

| File de xuat | Viewport | Man hinh |
| --- | --- | --- |
| `01-login-parent-desktop.png` | 1440x900 | Login va demo account Parent |
| `02-parent-home-child-desktop.png` | 1440x900 | Parent portal, tab Hoc sinh, child Demo Con |
| `03-learning-path-desktop.png` | 1440x900 | Tab Lo trinh, package/path demo |
| `04-daily-plan-initial-desktop.png` | 1440x900 | Tab Hoc hom nay sau seed |
| `05-video-evidence-desktop.png` | 1440x900 | Video evidence sau cap nhat tien do/xem du |
| `06-practice-result-desktop.png` | 1440x900 | Practice sau khi nop bai dung |
| `07-daily-plan-completed-desktop.png` | 1440x900 | Daily plan sau khi kiem tra hoan thanh |
| `08-parent-report-desktop.png` | 1440x900 | Bao cao 7 ngay co evidence |
| `09-daily-plan-mobile.png` | 390x844 | Hoc hom nay tren mobile |
| `10-practice-mobile.png` | 390x844 | Practice tren mobile |
| `11-report-mobile.png` | 390x844 | Bao cao tren mobile |

Moi screenshot can kem browser URL, viewport, ngay gio, va ghi chu pass/fail ngan.

## Flow QA chi tiet

### 1. Login parent

Route: `/`

Steps:

1. Mo web local.
2. Bam demo account Parent hoac nhap `parent@demo.local` / `Demo@12345`.
3. Xac nhan vao Parent portal.

Expected:

- Khong hien token, stack trace, hoac loi API.
- Co cac tab parent: `Hoc sinh`, `Hoc hom nay`, `Lo trinh`, `Ho so con`, `Bao cao`, `Don & thanh toan`, `Tai khoan`.
- Cac label quan trong khong hien raw enum ky thuat nhu `PUBLISHED`, `COMPLETED`, `VIDEO`, `PRACTICE`, `READY`, `LOCKED` cho phu huynh.

Evidence:

- Screenshot `01-login-parent-desktop.png`.
- Screenshot sau login `02-parent-home-child-desktop.png`.

### 2. Check child and screen-time context

Route: `/`, tab `Hoc sinh`

Steps:

1. Xac nhan child `Demo Con` ton tai.
2. Kiem tra thong tin gioi han/thoi gian hoc neu co.
3. Khong thay trang thai trong/loi khi API da seed.

Expected:

- Child demo hien bang ngon ngu phu huynh de hieu.
- Neu co screen-time warning, copy phai la copy nguoi dung, khong phai raw backend status.

Evidence:

- Screenshot `02-parent-home-child-desktop.png`.

### 3. Check assigned learning path

Route: `/`, tab `Lo trinh`

Steps:

1. Chon `Demo Con`.
2. Xac nhan package `MH-DEMO-A1-GREETINGS-PACKAGE`.
3. Xac nhan learning path `MH-DEMO-A1-GREETINGS`.
4. Xac nhan lesson `greetings-basics` / `Greeting Basics` nam trong path.

Expected:

- Package/path duoc giao boi assignment, khong phai fallback random.
- Trang thai path/lesson duoc Viet hoa, vi du `Dang hoat dong` thay vi `PUBLISHED`.
- Neu khong co assignment, day la P1 vi MVP flow khong the bat dau dung BA.

Evidence:

- Screenshot `03-learning-path-desktop.png`.

### 4. Check daily plan initial state

Route: `/`, tab `Hoc hom nay`

Steps:

1. Chon child `Demo Con`.
2. Doc card `Ke hoach hoc hom nay`.
3. Xac nhan co item video va item practice.
4. Xac nhan practice bi khoa neu video chua du evidence.

Expected:

- Headline noi ro hom nay con co viec hoc.
- Video item o trang thai san sang/hoc tiep.
- Practice item bi khoa hoac chua du dieu kien cho den khi video co evidence dat moc.
- Text evidence video neu chua xem: chua ghi nhan hoac can xem du moc 80%.
- Nut hanh dong: `Hoc tiep`, `Xem video`, `Lam bai`, `Kiem tra hoan thanh`/`Kiem tra diem` phu hop voi trang thai.

Evidence:

- Screenshot `04-daily-plan-initial-desktop.png`.

### 5. Record video evidence

Route: `/`, tab `Hoc hom nay`, then video panel

Steps:

1. Bam `Hoc tiep` hoac `Xem video` tren item video.
2. Video panel duoc scroll/mo toi lesson demo.
3. Neu la YouTube embed, dung nut `Cap nhat tien do` sau khi video panel san sang; neu la file video, play toi gan het hoac trigger end.
4. Quay lai item video va bam `Kiem tra hoan thanh`.

Expected:

- Panel co khu vuc `Bang chung xem video`.
- Evidence hien percent va moc can dat 80%.
- Sau khi dat moc, message noi he thong da ghi nhan du thoi luong xem video.
- Daily plan refresh: video co evidence passed, practice mo khoa/san sang.
- Khong hien raw field `watchPercent`, `minWatchPercent`, `evidenceId` cho parent/child.

Evidence:

- Screenshot `05-video-evidence-desktop.png`.
- Screenshot `07-daily-plan-completed-desktop.png` sau khi item duoc xac nhan.

### 6. Complete practice

Route: `/`, tab `Hoc hom nay`, then practice panel

Steps:

1. Bam `Lam bai` tren item practice khi da mo khoa.
2. Chon cau tra loi dung `Good morning, nice to meet you.`.
3. Bam `Nop bai`.
4. Xac nhan ket qua pass.
5. Quay lai daily plan va bam `Kiem tra diem` hoac `Kiem tra hoan thanh`.

Expected:

- Panel `Luyen tap` hien practice `Greeting check`.
- `Can dat` mac dinh 80% hoac dung moc tu plan.
- Ket qua sau submit hien diem, sao, va copy than thien.
- Daily plan refresh sau submit, khong can reload page.
- Evidence practice hien percent/min score, khong hien raw attempt id/token.
- Khi practice pass, daily plan co the chuyen completed neu tat ca item dat.

Evidence:

- Screenshot `06-practice-result-desktop.png`.
- Screenshot `07-daily-plan-completed-desktop.png`.

### 7. Parent evidence report

Route: `/`, tab `Bao cao`

Steps:

1. Chon `Demo Con`.
2. Chon range `7 ngay`.
3. Xac nhan summary va timeline co evidence video/practice vua tao.
4. Chuyen sang `30 ngay` de dam bao khong loi layout/data.

Expected:

- Summary co `Ngay co hoc`, `Ngay xong ke hoach`, `Video hoan thanh`, `Bai luyen dat`, `Diem bai luyen TB`, `Phut video da ghi nhan`.
- Timeline co ngay hoc, status Viet hoa, video percent/phut, practice score/attempt count.
- Bang chung theo viec hoc co dong video va practice.
- Copy khong dung thuat ngu ky thuat nhu exposure/token/attempt id.

Evidence:

- Screenshot `08-parent-report-desktop.png`.

## Mobile viewport checklist

Viewport de xuat: 390x844.

Kiem tra:

- Login va tab parent khong tran ngang bat buoc.
- Tab list co the scroll/line-wrap nhung khong che noi dung.
- Daily plan item khong overlap icon/status/button.
- Video iframe giu aspect ratio, khong tran viewport.
- Practice answers de bam bang ngon tay, nut `Nop bai` khong bi che.
- Report table neu rong thi co horizontal scroll hop ly, khong lam vo layout toan trang.
- Text dai nhu package/path code khong tran khoi card.

Evidence:

- `09-daily-plan-mobile.png`
- `10-practice-mobile.png`
- `11-report-mobile.png`

## Empty/error states

Chay cac check nay neu co thoi gian, khong can seed moi:

| Case | Cach test | Expected | Severity neu sai |
| --- | --- | --- | --- |
| API down | Stop API, refresh web | Login/API error than thien, khong crash page | P1 neu white screen |
| No child | Dung account parent khac neu co | Huong dan tao ho so con | P2 |
| No assignment | Child khong co content assignment | Noi ro chua co lo trinh duoc giao | P1 neu fallback thanh random path |
| Video locked/time limit | Dat screen-time het gio neu co data | Noi con het thoi gian hoc, can phu huynh cap them | P2 |
| Practice not answered | De trong cau hoi va submit | Nut disable/copy yeu cau tra loi du | P2 |

## Severity matrix

| Severity | Dinh nghia | Vi du |
| --- | --- | --- |
| P0 | Chan hoan toan luong hoc tap MVP hoac mat/ro ri du lieu | Khong login duoc parent demo; parent thay child khac; submit practice ghi sai user |
| P1 | Luong chinh sai hoac evidence khong dang tin | Khong co assignment demo; video pass nhung practice van khoa; report khong co evidence sau khi hoc |
| P2 | UX/copy gay nham lan nhung co workaround | Raw enum hien cho parent; mobile overlap mot phan; message sai ngu canh |
| P3 | Polish nho | Khoang cach UI, label chua nhat quan, empty copy co the tot hon |

## Pass/fail template

Copy block nay vao ket qua QA:

```text
Manual QA run:
- Date/time:
- Tester:
- Git/head or folder snapshot:
- API URL:
- Web URL:
- Browser:
- Desktop viewport:
- Mobile viewport:
- Seed command run before test: yes/no

Screenshots:
- 01-login-parent-desktop.png: PASS/FAIL
- 02-parent-home-child-desktop.png: PASS/FAIL
- 03-learning-path-desktop.png: PASS/FAIL
- 04-daily-plan-initial-desktop.png: PASS/FAIL
- 05-video-evidence-desktop.png: PASS/FAIL
- 06-practice-result-desktop.png: PASS/FAIL
- 07-daily-plan-completed-desktop.png: PASS/FAIL
- 08-parent-report-desktop.png: PASS/FAIL
- 09-daily-plan-mobile.png: PASS/FAIL
- 10-practice-mobile.png: PASS/FAIL
- 11-report-mobile.png: PASS/FAIL

Findings:
- [P0/P1/P2/P3] Title:
  Route/screen:
  Steps:
  Expected:
  Actual:
  Screenshot:

Overall:
- PASS_BROWSER_MANUAL_VERIFIED / FAIL
- Release recommendation:
```

## Release gate

Chi danh dau `PASS_BROWSER_VERIFIED` khi co it nhat cac screenshot bat buoc va khong con P0/P1. Neu chi co tai lieu nay ma chua co tester/screenshot, trang thai dung la `PASS_MANUAL_QA_PACK_READY`.
