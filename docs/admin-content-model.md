# Admin content model

Tai lieu nay mo ta cach admin tao va publish noi dung hoc tieng Anh. Muc tieu la giu cau truc du ro cho san pham dau tien, nhung van mo rong duoc khi them mobile va AI.

## Cau truc noi dung

Thu tu de xuat:

`Level -> Course -> Unit -> Lesson -> Activity -> Question`

Thuc the chinh:

- `Level`: cap do nhu A1, A2, B1 hoac IELTS Foundation.
- `Course`: khoa hoc thuoc mot hoac nhieu level, co gia/goi truy cap.
- `Unit`: nhom bai hoc theo chu de hoac tuan hoc.
- `Lesson`: bai hoc cu the, co noi dung, media, activity.
- `Video/Media`: file video, audio, anh, PDF hoac transcript gan voi lesson.
- `Activity`: bai tap trong lesson, vi du multiple choice, fill blank, listening, speaking, writing.
- `Question`: cau hoi thuoc activity, co dap an, giai thich, diem.

Nen luu `sortOrder` cho course/unit/lesson/activity/question de admin sap xep ma khong phu thuoc vao id.

## Quy trinh tao noi dung

1. Tao level.
2. Tao course va gan level, mo ta, anh dai dien, entitlement can co.
3. Tao cac unit trong course.
4. Tao lesson trong unit.
5. Tai video/audio/tai lieu len storage thong qua signed upload URL hoac admin upload flow.
6. Gan media metadata vao lesson.
7. Tao activity cho lesson.
8. Tao question, dap an dung, giai thich va diem.
9. Preview lesson nhu hoc vien.
10. Submit review hoac publish tuy theo quyen admin.

Nen cho phep save draft bat cu luc nao. Viec publish chi dien ra khi noi dung dat cac dieu kien toi thieu.

## Trang thai publish

Trang thai de xuat:

- `draft`: dang soan, hoc vien khong thay.
- `in_review`: cho nguoi co quyen review.
- `published`: hoc vien co entitlement co the xem.
- `archived`: khong hien trong catalog moi, nhung co the giu lich su hoc.

Dieu kien publish toi thieu:

- Course co title, slug, level va entitlement mapping.
- Unit co title va thu tu.
- Lesson co title, noi dung hoac media.
- Media neu co phai upload xong va ready.
- Activity neu co phai co cau hoi hop le.
- Question phai co dap an dung voi loai cau hoi tu dong cham.

Khong nen xoa cung noi dung da co hoc vien hoc. Nen archived hoac tao version moi de giu lich su progress va attempt.

## Versioning noi dung

Khi lesson da publish va co hoc vien lam bai, sua noi dung can can than:

- Sua loi chinh ta, mo ta, transcript co the cap nhat truc tiep.
- Sua dap an, diem, cau hoi hoac thu tu activity nen tao revision moi.
- Attempt cua hoc vien can luu `contentVersion` de biet da lam tren ban nao.

Course va lesson nen co `publishedAt`, `updatedAt`, `createdBy`, `updatedBy`. Voi thay doi lon, luu them `revisionNote`.

## Audit

Moi thao tac admin quan trong nen ghi audit log:

- tao/sua/xoa draft
- publish/unpublish/archive
- thay doi entitlement cua course
- thay doi dap an dung hoac diem
- upload/thay media
- thao tac lien quan subscription neu admin co quyen

Audit log nen co:

- actor id
- action
- entity type
- entity id
- before/after summary
- request id
- thoi diem

Khong can luu full payload qua lon trong audit log. Voi media va question, luu phan thay doi chinh la du cho giai doan dau.

## Phan quyen admin

Role de xuat:

- `content_editor`: tao va sua draft.
- `content_reviewer`: review va publish.
- `admin`: quan ly user, role, entitlement va cau hinh he thong.

Mot nguoi co the co nhieu role. Endpoint publish nen yeu cau quyen cao hon endpoint save draft.

## Quyen da cai dat trong MVP

Backend hien co cac nhom quyen:

- `CONTENT_EDITOR`: tao course/unit/lesson draft, gan link YouTube, upload video local dev, submit review.
- `ADMIN`: co toan bo quyen cua content editor va duoc publish lesson.
- `DIRECTOR`: xem overview va danh sach noi dung o che do read-only.
- `STUDENT`, `TEACHER`, `SUPPORT`, `PARENT`: khong duoc truy cap API admin content.

Endpoint chinh:

- `GET /v1/admin/content/overview`
- `GET /v1/admin/content/courses`
- `GET /v1/admin/content/lessons`
- `POST /v1/admin/content/courses`
- `POST /v1/admin/content/units`
- `POST /v1/admin/content/lessons`
- `POST /v1/admin/content/lessons/:lessonId/videos/link`
- `POST /v1/admin/content/lessons/:lessonId/videos/upload`
- `POST /v1/admin/content/lessons/:lessonId/submit-review`
- `POST /v1/admin/content/lessons/:lessonId/publish`

YouTube link duoc chuan hoa thanh `https://www.youtube-nocookie.com/embed/:videoId` de hoc vien xem trong app bang iframe. Video upload local dev duoc luu o `apps/api/uploads/videos` va phuc vu qua `/uploads/videos/...`. Production nen doi sang object storage/CDN hoac video platform rieng.

## Luong preview

Admin can preview noi dung truoc publish:

- Preview lesson theo goc nhin hoc vien.
- Preview entitlement: free user, premium user, het han goi.
- Preview tren kich thuoc mobile co ban de tranh layout qua dai hoac activity kho thao tac.

Preview khong nen ghi progress hoc vien. Neu can luu attempt test, danh dau bang `isPreview` de khong anh huong analytics.
