# Kiểm chứng bản tích hợp — 2026-09-19

## Đã chạy

- Build NestJS API và build production Next.js thành công, gồm `/browser-control` và `/kid-learning`.
- Prisma schema validate và generate thành công.
- ESLint cho module backend mới và hai trang web mới; TypeScript web `--noEmit` thành công.
- 16 kiểm thử Node cho logic policy và service worker: deny mặc định, URL giả, hạn mức từng link/ngày, đổi ngày theo múi giờ, lịch xem, giữ quota qua restart, đồng bộ bằng giá trị lớn nhất, thu hồi, giới hạn message bridge và đồng hồ lùi.
- Jest kiểm tra DTO, sở hữu hồ sơ, URL cấu hình, giấu đáp án/ngữ cảnh khỏi cấu hình extension; PostgreSQL tạm kiểm tra ghép đồng thời chỉ thành công một lần, mã hết hạn, chống trùng sự kiện, bộ đếm không giảm, chấm bài, lưu hội thoại, khóa AI theo chế độ, suspend phụ huynh và thu hồi thiết bị.
- SQL migration mới được thực thi trong schema tạm rồi rollback. Database ứng dụng không được migrate bởi các kiểm thử này.
- Chromium thật, extension thật, giao diện Next.js thật, API fixture: phụ huynh lưu cấu hình và tạo mã; ghép extension; DNR chặn link lạ và cho link đã duyệt; đóng/mở browser giữ quota; hết giờ chuyển cùng tab sang góc học; trả lời câu hỏi, chat thử và báo cáo; offline giữ chặn; thu hồi khóa tab đang mở.
- Xem ảnh desktop, mobile 390px và góc học. Mobile không tràn ngang. Đã sửa hộp mời cài PWA che bài tập: không hiện trên `/kid-learning`.

## Giới hạn bằng chứng

### Bổ sung luồng chọn combo và import link

- 18 kiểm thử browser-control (unit + PostgreSQL tạm) đạt, gồm combo đã xuất bản, lọc nội dung chưa xuất bản, hàng đợi link mới, chuẩn hóa và chống trùng link, claim đồng thời, lỗi lấy script, bổ sung script/thử lại, lỗi AI và nội dung đang xử lý không tự kích hoạt.
- 18 kiểm thử AI context processor đạt, gồm tạo bài tập từ ngữ cảnh, từ chối nguồn không phù hợp, đáp án ngoài lựa chọn và lựa chọn rỗng/trùng.
- Chromium smoke mới đạt: chọn combo, thêm vào cấu hình, nhập link YouTube khác, hiển thị trạng thái xử lý, lưu chỉ nội dung đã sẵn sàng, giữ nguyên luồng extension → góc học → báo cáo.
- Hai migration browser-control và browser-content-preparation được thực thi trong schema tạm rồi rollback. Chưa áp dụng vào database ứng dụng.
- Kiểm tra bằng AI mock; chưa gọi transcript YouTube hoặc provider AI thật trong lượt kiểm thử này.

- Chromium smoke dùng API fixture, không phải một lần chạy toàn hệ thống với API production và tài khoản thật. Backend persistence được kiểm tra riêng bằng PostgreSQL tạm.
- AI được mock trong kiểm thử, không gọi model thật hoặc phát sinh chi phí. Khả năng model trả lời đúng chủ đề thực tế cần kiểm chứng với cấu hình AI triển khai.
- Chưa kiểm thử trên từng website video, redirect đăng nhập hay link hội thoại AI bên ngoài. URL phải được duyệt chính xác; subframe bị chặn.
- Chưa phát hành Chrome Web Store, chưa triển khai hosting, chưa áp dụng migration vào database ứng dụng.

## Ảnh và gói cài

- `output/browser-control-smoke/parent-desktop.png`
- `output/browser-control-smoke/parent-mobile.png`
- `output/browser-control-smoke/kid-learning.png`
- `output/browser-control-smoke/extension-blocked.png`
- `output/minhhuongextension/minhhuongextension-1.0.0.zip`

Lệnh tái kiểm thử và vận hành nằm trong [hướng dẫn tích hợp](minhhuong-browser-control.md).
