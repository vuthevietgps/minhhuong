# Kien truc he thong

Tai lieu nay mo ta huong kien truc cho ung dung hoc tieng Anh dung NestJS, PostgreSQL va Next.js. Mobile app se dung lai cung API sau khi web on dinh.

## Tong quan

He thong nen tach thanh cac lop ro rang:

- `apps/web`: Next.js cho hoc vien va admin portal neu can lam nhanh giai doan dau.
- `apps/api`: NestJS REST API, chua business logic, auth, subscription, noi dung hoc va tich hop ben ngoai.
- `PostgreSQL`: nguon du lieu chinh cho user, noi dung, tien do hoc, don hang va audit.
- Object storage: luu video, audio, hinh anh, file bai hoc. API chi phat signed URL, khong stream truc tiep qua NestJS.
- AI provider/service: nam sau mot service boundary rieng, khong goi truc tiep tu frontend.

Luon coi API la contract chinh. Web va mobile chi la client cua cung mot backend.

## Module backend de xuat

- `AuthModule`: dang ky, dang nhap, refresh token, reset mat khau, social login neu co.
- `UsersModule`: ho so hoc vien, vai tro, trang thai tai khoan.
- `AdminModule`: endpoint quan tri, phan quyen theo role.
- `ContentModule`: level, course, unit, lesson, activity, question, media metadata.
- `LearningModule`: enrollment, progress, completion, score, streak.
- `SubscriptionModule`: plan, entitlement, order, payment webhook, lich su quyen truy cap.
- `MediaModule`: upload metadata, signed upload/download URL, kiem tra entitlement truoc khi cap URL.
- `AiModule`: tao goi y, cham diem noi/viet, giai thich dap an, feedback ca nhan hoa.
- `AuditModule`: ghi log thao tac admin va cac thay doi quan trong.

Khong nen de module content tu xu ly payment, hoac module payment tu biet chi tiet cau truc bai hoc. Cac module giao tiep qua service interface noi bo.

## Data flow hoc vien

1. Hoc vien dang nhap va nhan access token ngan han, refresh token dai hon.
2. Client goi API lay danh sach level/course co kem trang thai khoa/mo theo entitlement.
3. Khi vao lesson, API tra ve noi dung da publish va cac activity phu hop.
4. Neu lesson co video/audio, client goi endpoint media de xin signed URL.
5. API kiem tra user, entitlement, lesson status, sau do cap signed URL thoi han ngan.
6. Client nop dap an/activity attempt.
7. API cham diem phan co the cham tu dong, goi AI service khi can, luu attempt va progress.
8. Client lay lai progress de cap nhat UI.

Frontend khong tu suy luan quyen truy cap tu gia goi hay nhan admin; backend la nguon quyet dinh cuoi cung.

## Entitlement va subscription

Nen tach `subscription` khoi `entitlement`:

- `Subscription`: thong tin goi, chu ky, trang thai thanh toan, payment provider reference.
- `Entitlement`: quyen truy cap thuc te ma user dang co, vi du `course:ielts-foundation`, `level:A1`, `feature:ai-speaking-feedback`.

Luon kiem tra entitlement o API truoc cac hanh dong:

- Xem lesson premium.
- Lay signed URL video/audio.
- Nop bai co tinh nang AI premium.
- Tai tai lieu kem theo khoa hoc.

Webhook thanh toan chi nen cap nhat subscription va tao/cap nhat entitlement tuong ung. Neu payment provider loi hoac webhook lap lai, thao tac phai idempotent theo provider event id.

## Video va signed URL

Video nen dat trong object storage/CDN private. Database chi luu metadata:

- `storageKey`
- `duration`
- `mimeType`
- `transcodingStatus`
- `lessonId`
- `visibility`

Flow truy cap:

1. Client goi `POST /media/:id/signed-url`.
2. API xac thuc user.
3. API kiem tra media thuoc lesson da publish va user co entitlement.
4. API tao signed URL het han ngan, vi du 5-15 phut.
5. Client phat video truc tiep tu CDN/storage.

Khong dua `storageKey` private hoac bucket path noi bo ra client neu khong can. Log truy cap media nen luu user id, media id, lesson id va thoi diem cap URL.

## AI service boundary

AI nen duoc boc trong `AiModule` hoac mot service rieng, voi interface on dinh:

- `gradeWritingAttempt(input)`
- `gradeSpeakingAttempt(input)`
- `explainAnswer(input)`
- `generatePractice(input)`
- `summarizeProgress(input)`

Frontend va cac module khac khong goi provider truc tiep. Moi request AI can co:

- user id va context bai hoc
- input da validate
- gioi han token/chi phi
- timeout
- retry co gioi han
- logging request metadata, khong log du lieu nhay cam neu khong can

Ket qua AI nen luu kem version prompt/model de sau nay audit va so sanh chat luong. Cac quyet dinh quan trong nhu hoan thanh khoa hoc, cap chung chi, hoan tien khong nen phu thuoc hoan toan vao AI.

## Nguyen tac API

- REST JSON la mac dinh; dat version bang `/v1` neu du kien mobile dung lau dai.
- Pagination cho danh sach course, lesson, attempt, audit.
- Response loi co format thong nhat: `code`, `message`, `details`, `requestId`.
- DTO request/response phai duoc validate o NestJS.
- Endpoint admin va hoc vien nen tach ro theo prefix, vi du `/admin/content` va `/me/progress`.

