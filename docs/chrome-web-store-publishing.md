# Đưa tiện ích Minh Hương lên Chrome Web Store

## Tình trạng hiện tại

Tiện ích đã dùng Manifest V3 và có gói ZIP, nhưng **chưa nên gửi duyệt ngay**. Trước khi gửi cần hoàn thành bốn việc:

1. Chốt địa chỉ API production dùng HTTPS.
2. Thêm biểu tượng PNG 16, 32, 48 và 128 px vào `manifest.json`.
3. Đăng công khai trang Chính sách quyền riêng tư và email hỗ trợ.
4. Chuẩn bị ảnh chụp, ảnh giới thiệu và tài khoản/mã thử cho đội duyệt.

## 1. Tạo gói production

Không gửi gói còn chứa `http://localhost:4000`. Từ thư mục gốc, chạy:

```powershell
npm run package:extension -- -ApiUrl https://API-CUA-BAN
```

Gói mới nằm trong `output/minhhuongextension` và có số phiên bản lấy từ `manifest.json`. Mỗi lần cập nhật phải tăng số phiên bản trước khi đóng gói lại.

Kiểm tra ZIP: `manifest.json` phải nằm ngay ở thư mục gốc của ZIP, không nằm trong một thư mục con.

## 2. Chuẩn bị nội dung cửa hàng

- Tên đề xuất: **Minh Hương — Máy học của con**.
- Mô tả ngắn: **Chỉ mở nội dung bố mẹ đã chọn, giới hạn thời gian xem và đưa con đến bài học Minh Hương.**
- Mục đích duy nhất: giúp phụ huynh chọn nội dung, đặt thời gian xem và chuyển trẻ sang hoạt động học.
- Biểu tượng cửa hàng: PNG 128×128.
- Ảnh chụp: ít nhất một ảnh 1280×800 hoặc 640×400; nên có 3 ảnh gồm kết nối máy, trang bị chặn thân thiện và góc học.
- Ảnh giới thiệu nhỏ: 440×280.
- URL hỗ trợ và URL chính sách quyền riêng tư phải truy cập công khai, không yêu cầu đăng nhập.

## 3. Khai báo quyền và dữ liệu

Trong mục **Privacy practices**, mô tả đúng hành vi hiện tại:

- `storage`: lưu mã thiết bị và thiết lập gần nhất trên máy.
- `alarms`: kiểm tra thay đổi định kỳ.
- `tabs`, `webNavigation`, `declarativeNetRequest`: chỉ cho mở đường dẫn phụ huynh đã chọn và chuyển sang góc học khi hết giờ.
- Quyền truy cập HTTP/HTTPS: cần để áp dụng danh sách cho phép trên trình duyệt của trẻ.

Dữ liệu cần công khai rõ:

- tên thiết bị do phụ huynh đặt;
- nội dung đã được phụ huynh chọn;
- thời gian dùng theo nội dung đã chọn;
- kết quả bài tập và nội dung trò chuyện học tập;
- mã thiết bị dùng để kết nối an toàn.

Nêu rõ tiện ích không gửi mật khẩu, cookie hay nội dung của trang ngoài danh sách về máy chủ; không bán dữ liệu cho quảng cáo. Các khai báo phải khớp hoàn toàn với chính sách quyền riêng tư và hành vi thực tế.

## 4. Đăng ký tài khoản nhà phát hành

1. Mở [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole/).
2. Đăng nhập bằng tài khoản Google dành riêng cho Minh Hương.
3. Chấp nhận thỏa thuận và thanh toán phí đăng ký một lần Google hiển thị.
4. Điền tên nhà phát hành, xác minh email liên hệ và hoàn tất các thông tin tài khoản được yêu cầu.

Không dùng tài khoản cá nhân của một nhân sự nếu tiện ích thuộc doanh nghiệp. Nên mời thêm ít nhất một quản trị viên dự phòng sau khi tài khoản nhà phát hành được tạo.

## 5. Tải lên và gửi duyệt

1. Chọn **Add new item**.
2. Tải ZIP production lên.
3. Hoàn thành các mục **Store Listing**, **Privacy**, **Distribution** và **Test instructions**.
4. Ở **Test instructions**, cung cấp tài khoản thử và hướng dẫn tạo mã kết nối để đội duyệt có thể kiểm tra đầy đủ.
5. Lần đầu nên chọn **Private** cho nhóm thử hoặc **Unlisted**. Các chế độ này vẫn phải qua quy trình duyệt.
6. Chọn **Submit for Review**. Có thể bật deferred publishing để tự quyết định thời điểm phát hành sau khi được duyệt.

## 6. Nối lại với website

Sau khi được duyệt, lấy URL trang Chrome Web Store và đặt khi build/deploy website:

```env
NEXT_PUBLIC_EXTENSION_STORE_URL=https://chromewebstore.google.com/detail/...
```

Trang **Thiết lập máy học của con** sẽ tự hiện nút **Cài vào Chrome**. Nếu chưa có biến này, giao diện chỉ báo đây là bản thử nghiệm cần người hỗ trợ cài.

## Tài liệu chính thức

- [Đăng ký tài khoản nhà phát triển](https://developer.chrome.com/docs/webstore/register)
- [Chuẩn bị gói tiện ích](https://developer.chrome.com/docs/webstore/prepare)
- [Đăng tiện ích lần đầu](https://developer.chrome.com/docs/webstore/publish/)
- [Khai báo dữ liệu và quyền riêng tư](https://developer.chrome.com/docs/webstore/program-policies/user-data)
- [Yêu cầu hình ảnh](https://developer.chrome.com/docs/webstore/images)
- [Chọn phạm vi phát hành](https://developer.chrome.com/docs/webstore/cws-dashboard-distribution)
