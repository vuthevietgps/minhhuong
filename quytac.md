# Quy tac phat trien he thong Minh Huong

Tai lieu nay la chuan bat buoc khi phat trien he thong hoc tieng Anh Minh Huong. Muc tieu la giu code de mo rong, de bao tri, phu hop voi NestJS, Next.js, PostgreSQL/Prisma va san sang dung lai cho mobile app sau nay.

> **BAT BUOC:** Moi lap trinh vien va moi tro ly AI (Claude, Codex, Cursor, Copilot...) phai doc toan bo file nay **truoc khi** viet, sua, tach hoac kiem thu code trong repo. File `CLAUDE.md` va `AGENTS.md` o goc repo tro toi file nay de AI tu dong doc.

## 0. Quy tac cho tro ly AI

- Doc `quytac.md` truoc moi phien lam viec. Neu yeu cau cua nguoi dung mau thuan voi quy tac, phai noi ro mau thuan va hoi lai truoc khi lam.
- Doc code hien co cua module lien quan truoc khi them code moi; lam theo pattern san co, khong tu tao kien truc moi.
- Truoc khi sua mot file, kiem tra so dong. File sap vuot 1000 dong thi tach truoc (muc 2), khong viet them vao file da qua dai.
- Moi thay doi phai kem kiem thu theo muc 12 va phai bao cao trung thuc: lenh nao da chay, ket qua ra sao, phan nao chua kiem tra duoc.
- Khong xoa, skip hoac sua sai test de cho "xanh". Test fail thi sua code hoac hoi lai.
- Khong commit secret, file `.env`, du lieu that cua khach hang, file debug hay log tam.
- Khong tu y commit, push, merge, xoa nhanh hay xoa du lieu khi nguoi dung chua yeu cau.
- Next.js trong repo la phien ban moi, co thay doi so voi kien thuc cu; doc `apps/web/AGENTS.md` va tai lieu trong `node_modules/next/dist/docs/` truoc khi sua frontend.

## 1. Nguyen tac chung

- Moi thay doi phai phuc vu ro mot luong nghiep vu: hoc vien, admin, sale, dai ly, van hanh, tai chinh hoac noi dung.
- Khong viet tat tuy tien, khong dat ten mo ho. Ten bien, ham, class, module phai noi ro y nghia nghiep vu.
- Khong tron logic giao dien, logic nghiep vu va logic truy cap database vao cung mot noi.
- Khong hard-code secret, token, mat khau, API key, thong tin ngan hang that trong source code.
- Khong sua schema database truc tiep ngoai Prisma migration.
- Khong tao abstraction neu chua co nhu cau that; uu tien ro rang, de doc, de test.
- Code moi phai tuan thu style san co cua repo truoc khi them pattern moi.
- Mot file chi lam mot viec (single responsibility). Mot class/component chinh moi file.

## 2. Gioi han do dai file

Muc dich: file ngan thi de doc, de review, de kiem soat thay doi va it xung dot khi nhieu nguoi (hoac AI) cung sua.

- **Moi file source khong duoc vuot 1000 dong.** Ap dung cho `.ts`, `.tsx`, `.js`, `.mjs`, `.cjs`, `.css`, `.prisma`, script `.ps1`/`.sh`/`.py`, ke ca file test `*.spec.ts`.
- Muc tieu nen huong toi:
  - Controller, DTO, hook, component: duoi 300 dong.
  - Service, trang (page): duoi 500 dong.
  - Vuot 700 dong la dau hieu can len ke hoach tach.
- Khong tinh: code sinh tu dong (`generated/`, `*.d.ts`), du lieu xuat (`exports/`), migration SQL, file `.json`, `.md`, lock file.
- Kiem tra tu dong: `npm run check:file-length` (chay trong CI). File moi vuot 1000 dong se lam CI fail.
- File da qua dai tu truoc khi co quy tac duoc ghi trong `scripts/file-length-baseline.json`:
  - Chi duoc giu nguyen hoac ngan di, **khong duoc dai them** du 1 dong.
  - Muon them chuc nang vao file trong baseline thi phai tach file truoc.
  - Tach xong thi xoa file khoi baseline. **Khong them file moi vao baseline.**

Cach tach chuan:

- **Service NestJS lon:** giu class cu lam facade (giu nguyen method public, chi goi tiep), tach nghiep vu thanh cac service con `@Injectable` dang ky trong cung module; ham thuan (khong dung `this`) dua ra `<ten>.helpers.ts`. Controller va noi goi khong phai sua.
- **Type/DTO lon:** tach theo nhom nghiep vu vao thu muc `types/` hoac `dto/`, file goc thanh barrel `export * from ...` de duong dan import cu van dung duoc.
- **Trang/component React lon:** state va handler dua vao custom hook `use-<ten>-state.ts`; tung khoi giao dien thanh component trong `_components/<ten>-section.tsx`; ham phu va hang so dung chung vao `_components/shared.tsx`.
- **Spec lon:** tach theo nhom hanh vi (`<ten>.<nhom>.spec.ts`), fixture/factory dung chung vao `<module>.testing.ts`.
- Tach file la refactor: **khong doi hanh vi** trong cung PR, va phai chung minh bang kiem thu (muc 12).

## 3. Cau truc monorepo

- `apps/api`: NestJS backend, chua API, auth, RBAC, nghiep vu, Prisma.
- `apps/web`: Next.js frontend cho hoc vien, admin, sale, van hanh, giam doc.
- `packages/shared`: kieu du lieu, contract, constant dung chung cho web, API va mobile sau nay.
- `minhhuongextension`: Chrome extension quan ly trinh duyet.
- `docs`: tai lieu kien truc, luong nghiep vu, van hanh, quy trinh.
- `scripts`: script ho tro local development, database, seed, automation, kiem tra CI.

Quy tac:

- Khong dat logic backend trong `apps/web`.
- Khong dat UI component trong `apps/api`.
- Kieu du lieu dung chung nhieu client nen dua ve `packages/shared`.
- Tai lieu nghiep vu lon nen dat trong `docs`, khong nhet vao comment code.

## 4. Chuan NestJS backend

Backend tuan theo kien truc chuan cua NestJS (module, controller, service, DTO, dependency injection), giong cach to chuc cua Angular.

Moi domain lon phai tach thanh module rieng:

- `auth`: dang nhap, JWT, current user, guard, role.
- `activation-orders`: don kich hoat, thanh toan thu cong, duyet tien.
- `admin-content`: tao khoa hoc, bai hoc, video, bai tap.
- `channel-admin`: quan ly dai ly, sale, user, chinh sach hoa hong.
- `channel-finance`: vi hoa hong, ledger, yeu cau rut tien, hoa don rut tien.
- `learning`: hoc video, lam bai tap, tien do hoc tap.

Trong moi module NestJS:

- `*.module.ts`: khai bao module va provider.
- `*.controller.ts`: chi nhan request, validate role, goi service, tra response.
- `*.service.ts`: chua logic nghiep vu.
- `dto/*.dto.ts`: validate input bang `class-validator`.
- `*.helpers.ts`: ham thuan dung chung trong module (neu can).
- `*.spec.ts`: unit test dat canh file duoc test; `*.integration.spec.ts` cho test can database.
- Khong truy cap Prisma truc tiep trong controller.
- Khong de controller xu ly tinh tien, tinh ngay het han, tinh hoa hong, tao ledger.
- Khong tra ve password hash, token noi bo, secret, metadata nhay cam.
- Moi endpoint quan tri phai co `JwtAuthGuard` va `RolesGuard`.
- Endpoint thay doi du lieu phai co audit log neu lien quan tai chinh, user, quyen, noi dung hoc.

Quy uoc dat ten va DI:

- Ten file kebab-case theo vai tro: `channel-admin.service.ts`, `create-agency.dto.ts`. Class PascalCase co hau to vai tro: `ChannelAdminService`, `CreateAgencyDto`.
- Phu thuoc lay qua constructor injection; khong tu `new` service trong code nghiep vu (chi duoc lam trong test).
- Provider dung o module khac phai duoc `exports` trong module; khong import file service cua module khac vong qua module.
- Khong tao phu thuoc vong (circular dependency) giua cac module.

## 5. DTO va validation

- Tat ca request body phai co DTO. Khong khai bao kieu inline trong `@Body()` vi ValidationPipe khong kiem tra kieu inline.
- Query string co nhieu tham so cung phai co DTO.
- Dung `@IsString`, `@IsEmail`, `@IsEnum`, `@IsInt`, `@Min`, `@Max`, `@MaxLength`, `@IsOptional`.
- So tien nen luu dang integer theo don vi nho nhat: `amountCents`.
- Ty le hoa hong dung basis points: `rateBps`, vi du 1000 = 10%.
- Enum API phai bam sat enum Prisma, khong dung string tuy tien.
- Loi validate phai ro de nguoi van hanh biet sua input.

## 6. Prisma va PostgreSQL

- Moi thay doi schema phai tao migration.
- Khong sua database bang tay roi quen migration.
- Quan he tai chinh, subscription, commission, payout phai co index phu hop.
- Cac bang tien te phai luu `currency`.
- Cac thao tac nhieu bang trong cung mot nghiep vu tien/duyet/rut tien phai dung transaction.
- Ledger khong nen sua/xoa tuy tien; neu can dieu chinh thi tao but toan dao hoac entry bo sung.
- Cac record quan trong can co `createdAt`, `updatedAt`, `reviewedById`, `reviewNotes` neu co buoc duyet.
- Doi cau truc du lieu tra ve cua API thi phai cap nhat moi noi doc du lieu do (web, extension, mobile) trong cung PR.

## 7. Phan quyen va bao mat

- Role hien tai: `STUDENT`, `PARENT`, `TEACHER`, `CONTENT_EDITOR`, `SUPPORT`, `SALE`, `AGENCY_OWNER`, `AGENCY_MANAGER`, `OPERATIONS`, `ADMIN`, `DIRECTOR`.
- `ADMIN`: quan tri he thong, cau hinh lon, quan ly user/khoa hoc/kenh ban.
- `OPERATIONS`: duyet tien, doi soat hoa don, xu ly rut tien, thao tac van hanh.
- `DIRECTOR`: uu tien xem bao cao, han che thao tac sua/xoa.
- `SALE`: tao order cho khach, xem hoa hong/vi/rut tien cua minh.
- `AGENCY_OWNER`: quan ly dai ly cua minh, tao sale trong dai ly, xem bao cao scoped, yeu cau rut tien hoa hong dai ly.
- `AGENCY_MANAGER`: van hanh dai ly duoc giao, tao order/sale trong pham vi dai ly, xem bao cao scoped.
- `CONTENT_EDITOR`: tao bai hoc, upload video, tao bai tap, gui duyet.
- `STUDENT`: hoc, lam bai tap, chat AI neu co quyen.

Quy tac:

- Khong chi an nut tren UI de bao mat; backend bat buoc check role.
- User het han subscription khong duoc truy cap noi dung hoc co phi.
- Tai khoan chua duyet thanh toan phai o trang thai khong duoc hoc.
- Reset mat khau, suspend user, approve payment, approve payout deu phai audit.

## 8. Tai chinh, don hang va hoa hong

- Don sale tao phai co trang thai cho duyet truoc khi kich hoat user.
- Thoi han subscription bat dau tai thoi diem van hanh duyet tien thanh cong.
- So tien, goi, so ngay su dung va hoa don doi ung phai duoc luu lai.
- Hoa hong sale/dai ly chi duoc ghi nhan sau khi order duoc duyet.
- Rut tien phai co trang thai, nguoi duyet, hoa don/chung tu payout.
- Khong tinh hoa hong bang frontend.
- Khong cap nhat so du vi truc tiep; phai thong qua ledger entry.

## 9. Chuan Next.js frontend

Frontend dung Next.js (App Router, React), khong phai Angular. Tuy vay cach to chuc code ap dung cung nguyen tac cua Angular/NestJS: chia theo tinh nang, tach state/logic khoi giao dien, moi file mot vai tro.

Nghiep vu:

- UI phai phan tach theo role: hoc vien, sale, operations, admin, director.
- Goi API qua helper chung, khong lap lai fetch logic tuy tien.
- Khong luu secret trong frontend.
- UI quan tri phai uu tien ro rang, de scan, de thao tac nhieu lan.
- Form quan tri phai co trang thai loading, error, thanh cong.
- Nut nguy hiem nhu suspend, reject, approve payout can hien ro y nghia.
- Khong dua logic tai chinh quan trong len frontend; frontend chi hien thi va gui request.
- Mobile sau nay phai dung lai API, khong tao API rieng neu khong can.

Cau truc file:

- Moi route la mot thu muc trong `app/`; `page.tsx` chi ghep cac phan lai, khong chua logic dai.
- Code rieng cua route dat trong thu muc private `_components/` (hoac `_<ten>/`) canh `page.tsx`:
  - `use-<ten>-state.ts`: custom hook chua state, effect, handler va loi goi API (tuong tu service cua Angular).
  - `<ten>-section.tsx`, `<ten>-modal.tsx`: component hien thi, nhan du lieu qua props, khong tu goi API neu khong can.
  - `shared.tsx` hoac `types.ts`: ham phu, hang so, kieu du lieu dung chung trong route.
- Code dung chung nhieu route dat trong `app/_lib/`, `app/admin/_lib/` hoac `packages/shared`.
- Ten file kebab-case; component va type PascalCase; hook bat dau bang `use`.
- Kieu du lieu cua response API phai khop voi API that; khi API doi thi sua kieu va noi hien thi trong cung PR.
- Doc du lieu tu API phai chiu duoc truong rong/thieu (`?.`, `?? []`) de mot truong thieu khong lam trang trang.

## 10. Video, bai hoc va bai tap

- Video co the la upload noi bo, YouTube embed, hoac external link.
- Admin/content editor duoc them link YouTube nhung hoc vien phai xem trong app neu co the.
- Moi video can co provider, playback/embed URL, trang thai xu ly, title, sort order.
- Bai hoc nen co trang thai: draft, review, published, archived.
- Bai tap can co type ro rang: quiz, listening, speaking, writing, vocab game, AI chat.
- Cau hoi phai co type, prompt, diem, dap an, giai thich neu can.
- Ket qua lam bai phai luu attempt, score, submittedAt.

## 11. Quy trinh phat trien chuc nang moi

1. **Doc quy tac va code lien quan:** doc file nay, module backend va trang frontend lien quan, kiem tra so dong cac file se sua.
2. **Tao nhanh moi tu `main`:** ten nhanh ngan, mo ta viec lam (`add-payout-export`, `fix-admin-channel-users`). Khong lam truc tiep tren `main`.
3. **Thiet ke truoc khi code:** xac dinh role nao duoc dung, du lieu nao thay doi, co can migration, audit, transaction khong.
4. **Backend truoc:**
   - Schema + migration (neu can) -> DTO -> service -> controller -> dang ky trong module.
   - Kieu dung chung dua vao `packages/shared`.
   - Viet unit test cho service ngay khi viet logic.
5. **Frontend sau:** hook state + component theo muc 9, dung kieu khop voi response API.
6. **Kiem thu** theo muc 12, sua het loi lint/type/test.
7. **Mo PR:**
   - Moi PR chi mot muc dich: chuc nang, sua loi hoac refactor. Khong tron refactor (tach file, doi ten) voi thay doi hanh vi.
   - Mo ta PR ghi ro: muc dich, thay doi chinh, cach kiem thu va ket qua, rui ro/viec con lai.
   - PR phu thuoc PR khac thi ghi ro thu tu gop.

Sua loi:

- Tim nguyen nhan goc truoc khi sua; ghi nguyen nhan vao mo ta PR.
- Them test tai hien loi (fail truoc khi sua, pass sau khi sua) khi co the.
- Loi phat hien ngoai pham vi PR dang lam thi ghi lai va sua trong PR rieng.

## 12. Kiem thu

### 12.1. Lenh bat buoc truoc khi giao

```bash
npm run check:file-length
npm run lint
npm run build
npm --prefix apps/api run test -- --runInBand
```

Them tuy pham vi thay doi:

```bash
npm run test:extension          # sua minhhuongextension
npm run test:scripts            # sua script trong scripts/
npm run test:learning-local     # sua learning-local-demo
npm run seed:demo && npm run report:demo   # sua du lieu/bao cao demo
```

Neu thay doi DB:

```bash
npm run db:local:start
npm run prisma:migrate
npm run prisma:seed
```

### 12.2. Backend

- Logic nghiep vu moi trong service phai co unit test (`*.spec.ts` canh file), gom ca truong hop thanh cong va truong hop bi tu choi (sai quyen, sai trang thai, input sai).
- Logic phan quyen theo pham vi (dai ly, kenh, phu huynh) phai co integration test voi database (`*.integration.spec.ts`).
- Nghiep vu tien/hoa hong/rut tien phai test ca so tien, trang thai va ledger entry duoc tao.
- Test dung factory/fixture chung (`<module>.testing.ts`), khong copy du lieu mau lap lai.
- Endpoint API quan trong phai co smoke test toi thieu:
  - Dang nhap dung role.
  - Goi endpoint thanh cong.
  - Kiem tra endpoint bi chan voi role khong du quyen neu co rui ro.
  - Don dep du lieu test sau khi chay.

### 12.3. Frontend

- Bat buoc: `tsc`/lint/`next build` sach.
- Moi thay doi giao dien phai mo trang that tren trinh duyet voi it nhat mot role duoc phep, kiem tra trang hien du lieu va **khong co loi console**.
- Thay doi lien quan phan quyen phai kiem tra them voi role khong duoc phep.
- Form moi phai kiem tra ca trang thai loading, loi va thanh cong.

### 12.4. Refactor (tach file, doi ten, sap xep lai code)

Refactor khong duoc doi hanh vi va phai chung minh dieu do:

- Backend: toan bo test cua module pass truoc va sau; script/bao cao (neu co) cho ket qua giong het.
- Frontend: so sanh noi dung hien thi cua trang truoc va sau khi tach (vi du chup text bang Playwright) phai giong nhau, va khong phat sinh loi console moi.
- Ghi ket qua so sanh vao mo ta PR.

### 12.5. Nguyen tac chung

- Khong xoa, `skip` hoac noi long assertion de test pass.
- Khong merge khi CI fail, tru khi loi da biet ro la co san va khong lien quan (ghi ro trong PR).
- Du lieu test dung tai khoan demo cua seed; khong dung du lieu that cua khach hang.

## 13. Quy tac review code

- Review uu tien bug, ro ri quyen, sai tien, sai trang thai, mat du lieu, thieu migration.
- Khong merge code khi lint/build/test/check-file-length fail.
- Khong merge file moi vuot 1000 dong hoac file trong baseline bi dai them.
- Khong merge endpoint quan tri ma thieu guard/role.
- Khong merge request body khong co DTO.
- Khong merge thay doi tai chinh ma thieu transaction hoac audit.
- Khong merge UI moi neu form khong bao loi ro rang.
- Khong merge schema moi neu seed/migration khong chay lai duoc tu database trong.
- Khong merge chuc nang moi khong co test, hoac PR tron refactor voi thay doi hanh vi.

## 14. Quy tac van hanh local

Chay PostgreSQL local khong can Docker:

```bash
npm run db:local:start
```

Dung PostgreSQL local:

```bash
npm run db:local:stop
```

Chay backend:

```bash
npm run dev:api
```

Chay frontend:

```bash
npm --prefix apps/web run dev -- --port 3001
```

Mac dinh:

- API: `http://localhost:4000`
- Web: `http://localhost:3001`
- PostgreSQL: `localhost:5432`

## 15. Nguyen tac mo rong mobile sau nay

- Mobile React Native/Flutter phai dung lai backend API hien co.
- Auth, subscription, role, entitlement phai nam o backend.
- Khong tao logic tinh tien, tinh hoa hong, tinh ngay het han trong mobile.
- Cac response API nen on dinh, co type/contract dung chung de mobile tich hop de hon.

## 16. Dinh nghia "xong"

Mot tinh nang chi duoc xem la xong khi:

- Dung nghiep vu da thong nhat.
- Co phan quyen backend day du.
- Co validate input bang DTO.
- Co luu audit neu lien quan user/tien/noi dung.
- Co test cho logic moi va chay qua lint/build/test/check-file-length.
- Khong file nao vuot 1000 dong.
- UI co trang thai loading/error/success neu co thao tac, va da duoc mo thu tren trinh duyet.
- Khong de lai du lieu smoke test, file debug, secret, log tam trong source.
