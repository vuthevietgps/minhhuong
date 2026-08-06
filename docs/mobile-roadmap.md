# Mobile roadmap

Muc tieu la lam web truoc nhung khong khoa kien truc vao Next.js. React Native hoac Flutter sau nay phai dung lai API, auth, noi dung va entitlement hien co.

## Nguyen tac chuan bi

- Backend la nguon su that cho auth, entitlement, progress va noi dung da publish.
- Web khong duoc phu thuoc vao endpoint chi danh rieng cho Next.js neu mobile cung can workflow do.
- Moi response quan trong nen co schema on dinh va version ro rang.
- File media dung signed URL thoi han ngan, mobile chi nhan URL sau khi API da kiem tra quyen.

## API contract

Can uu tien cac endpoint co contract on dinh:

- `POST /auth/login`
- `POST /auth/refresh`
- `GET /me`
- `GET /catalog/levels`
- `GET /catalog/courses`
- `GET /courses/:courseId`
- `GET /lessons/:lessonId`
- `POST /activities/:activityId/attempts`
- `GET /me/progress`
- `POST /media/:mediaId/signed-url`
- `GET /me/entitlements`

Nen tao OpenAPI spec tu NestJS va coi do la tai lieu contract cho web/mobile. Khi thay doi breaking change, tao version moi hoac giu backward compatibility den khi mobile cap nhat.

## Auth va token

De phu hop mobile:

- Access token ngan han, vi du 10-30 phut.
- Refresh token dai hon, co the revoke theo device/session.
- Luu device/session id de logout rieng tung thiet bi.
- Khong dua thong tin quyen premium vao token nhu nguon quyet dinh cuoi cung; token chi nen chua identity va claim co ban.
- Mobile can flow refresh token im lang khi access token het han.

Neu dung cookie cho web, backend van nen ho tro Authorization Bearer token cho mobile. CSRF la van de cua web cookie, con mobile can tap trung vao secure storage va revoke token.

## Design system

Ngay tu web nen co design token co the tai su dung:

- mau sac
- typography scale
- spacing
- radius
- icon style
- component state: loading, disabled, error, success

Khong can dung chung component code giua Next.js va mobile, nhung nen dung chung ngon ngu giao dien va token. Ten token nen doc lap nen tang, vi du `color.primary`, `space.4`, `radius.sm`, thay vi ten theo CSS class.

## Offline va caching

Mobile thuong can chiu mang yeu. Can chuan bi:

- Cache catalog, course, unit, lesson metadata.
- Cache progress gan nhat de hien thi nhanh.
- Queue attempt khi offline neu activity cho phep.
- Sync lai khi co mang, xu ly duplicate bang client generated id hoac idempotency key.
- Media download offline chi nen lam khi business cho phep va co entitlement hop le.

Khong nen cho client tu quyet dinh completion khi offline. Client co the hien thi trang thai tam thoi, nhung backend phai tinh lai ket qua cuoi khi sync.

## Push notification sau nay

Neu them push notification, can them bang device token:

- user id
- platform
- device id
- push token
- status
- last seen

Notification nen dua tren event backend nhu lesson moi, streak reminder, subscription expiring. Khong nen de client tao logic nhac hoc rieng ma backend khong biet.

## Lo trinh de xuat

1. Giai doan web: chot API contract, auth flow, entitlement, content model va progress model.
2. Giai doan hardening: tao OpenAPI, test contract, chuan hoa error response va pagination.
3. Giai doan mobile prototype: dung API that, khong tao backend rieng cho mobile.
4. Giai doan offline: them idempotency key, local cache strategy va sync queue.
5. Giai doan native polish: push notification, download co kiem soat, analytics theo device.

