# Quy tac phat trien he thong Minh Huong

Tai lieu nay la chuan bat buoc khi phat trien he thong hoc tieng Anh Minh Huong. Muc tieu la giu code de mo rong, de bao tri, phu hop voi NestJS, Next.js, PostgreSQL/Prisma va san sang dung lai cho mobile app sau nay.

## 1. Nguyen tac chung

- Moi thay doi phai phuc vu ro mot luong nghiep vu: hoc vien, admin, sale, dai ly, van hanh, tai chinh hoac noi dung.
- Khong viet tat tuy tien, khong dat ten mo ho. Ten bien, ham, class, module phai noi ro y nghia nghiep vu.
- Khong tron logic giao dien, logic nghiep vu va logic truy cap database vao cung mot noi.
- Khong hard-code secret, token, mat khau, API key, thong tin ngan hang that trong source code.
- Khong sua schema database truc tiep ngoai Prisma migration.
- Khong tao abstraction neu chua co nhu cau that; uu tien ro rang, de doc, de test.
- Code moi phai tuan thu style san co cua repo truoc khi them pattern moi.

## 2. Cau truc monorepo

- `apps/api`: NestJS backend, chua API, auth, RBAC, nghiep vu, Prisma.
- `apps/web`: Next.js frontend cho hoc vien, admin, sale, van hanh, giam doc.
- `packages/shared`: kieu du lieu, contract, constant dung chung cho web, API va mobile sau nay.
- `docs`: tai lieu kien truc, luong nghiep vu, van hanh, quy trinh.
- `scripts`: script ho tro local development, database, seed, automation.

Quy tac:

- Khong dat logic backend trong `apps/web`.
- Khong dat UI component trong `apps/api`.
- Kieu du lieu dung chung nhieu client nen dua ve `packages/shared`.
- Tai lieu nghiep vu lon nen dat trong `docs`, khong nhet vao comment code.

## 3. Chuan NestJS backend

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
- Khong truy cap Prisma truc tiep trong controller.
- Khong de controller xu ly tinh tien, tinh ngay het han, tinh hoa hong, tao ledger.
- Khong tra ve password hash, token noi bo, secret, metadata nhay cam.
- Moi endpoint quan tri phai co `JwtAuthGuard` va `RolesGuard`.
- Endpoint thay doi du lieu phai co audit log neu lien quan tai chinh, user, quyen, noi dung hoc.

## 4. DTO va validation

- Tat ca request body phai co DTO.
- Dung `@IsString`, `@IsEmail`, `@IsEnum`, `@IsInt`, `@Min`, `@Max`, `@MaxLength`, `@IsOptional`.
- So tien nen luu dang integer theo don vi nho nhat: `amountCents`.
- Ty le hoa hong dung basis points: `rateBps`, vi du 1000 = 10%.
- Enum API phai bam sat enum Prisma, khong dung string tuy tien.
- Loi validate phai ro de nguoi van hanh biet sua input.

## 5. Prisma va PostgreSQL

- Moi thay doi schema phai tao migration.
- Khong sua database bang tay roi quen migration.
- Quan he tai chinh, subscription, commission, payout phai co index phu hop.
- Cac bang tien te phai luu `currency`.
- Cac thao tac nhieu bang trong cung mot nghiep vu tien/duyet/rut tien phai dung transaction.
- Ledger khong nen sua/xoa tuy tien; neu can dieu chinh thi tao but toan dao hoac entry bo sung.
- Cac record quan trong can co `createdAt`, `updatedAt`, `reviewedById`, `reviewNotes` neu co buoc duyet.

## 6. Phan quyen va bao mat

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

## 7. Tai chinh, don hang va hoa hong

- Don sale tao phai co trang thai cho duyet truoc khi kich hoat user.
- Thoi han subscription bat dau tai thoi diem van hanh duyet tien thanh cong.
- So tien, goi, so ngay su dung va hoa don doi ung phai duoc luu lai.
- Hoa hong sale/dai ly chi duoc ghi nhan sau khi order duoc duyet.
- Rut tien phai co trang thai, nguoi duyet, hoa don/chung tu payout.
- Khong tinh hoa hong bang frontend.
- Khong cap nhat so du vi truc tiep; phai thong qua ledger entry.

## 8. Chuan Next.js frontend

- UI phai phan tach theo role: hoc vien, sale, operations, admin, director.
- Goi API qua helper chung, khong lap lai fetch logic tuy tien.
- Khong luu secret trong frontend.
- UI quan tri phai uu tien ro rang, de scan, de thao tac nhieu lan.
- Form quan tri phai co trang thai loading, error, thanh cong.
- Nut nguy hiem nhu suspend, reject, approve payout can hien ro y nghia.
- Khong dua logic tai chinh quan trong len frontend; frontend chi hien thi va gui request.
- Mobile sau nay phai dung lai API, khong tao API rieng neu khong can.

## 9. Video, bai hoc va bai tap

- Video co the la upload noi bo, YouTube embed, hoac external link.
- Admin/content editor duoc them link YouTube nhung hoc vien phai xem trong app neu co the.
- Moi video can co provider, playback/embed URL, trang thai xu ly, title, sort order.
- Bai hoc nen co trang thai: draft, review, published, archived.
- Bai tap can co type ro rang: quiz, listening, speaking, writing, vocab game, AI chat.
- Cau hoi phai co type, prompt, diem, dap an, giai thich neu can.
- Ket qua lam bai phai luu attempt, score, submittedAt.

## 10. Testing va kiem tra truoc khi giao

Truoc khi coi la xong mot thay doi:

```bash
npm run lint
npm run build
npm --prefix apps/api run test -- --runInBand
```

Neu thay doi DB:

```bash
npm run db:local:start
npm run prisma:migrate
npm run prisma:seed
```

Neu thay doi API quan trong, phai co smoke test toi thieu:

- Dang nhap dung role.
- Goi endpoint thanh cong.
- Kiem tra endpoint bi chan voi role khong du quyen neu co rui ro.
- Don dep du lieu test sau khi chay.

## 11. Quy tac review code

- Review uu tien bug, ro ri quyen, sai tien, sai trang thai, mat du lieu, thieu migration.
- Khong merge code khi lint/build/test fail.
- Khong merge endpoint quan tri ma thieu guard/role.
- Khong merge thay doi tai chinh ma thieu transaction hoac audit.
- Khong merge UI moi neu form khong bao loi ro rang.
- Khong merge schema moi neu seed/migration khong chay lai duoc tu database trong.

## 12. Quy tac van hanh local

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

## 13. Nguyen tac mo rong mobile sau nay

- Mobile React Native/Flutter phai dung lai backend API hien co.
- Auth, subscription, role, entitlement phai nam o backend.
- Khong tao logic tinh tien, tinh hoa hong, tinh ngay het han trong mobile.
- Cac response API nen on dinh, co type/contract dung chung de mobile tich hop de hon.

## 14. Dinh nghia "xong"

Mot tinh nang chi duoc xem la xong khi:

- Dung nghiep vu da thong nhat.
- Co phan quyen backend day du.
- Co validate input.
- Co luu audit neu lien quan user/tien/noi dung.
- Chay qua lint/build/test.
- UI co trang thai loading/error/success neu co thao tac.
- Khong de lai du lieu smoke test, file debug, secret, log tam trong source.
