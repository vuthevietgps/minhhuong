# Tiện ích Minh Hương cho máy của con

Tiện ích Chrome giúp máy của con chỉ mở nội dung phụ huynh đã chọn, giới hạn thời gian xem và chuyển sang bài học Minh Hương.

## Cách cài dành cho phụ huynh

Khi tiện ích đã được phát hành trên Chrome Web Store:

1. Phụ huynh mở trang **Thiết lập máy học của con** và bấm **Cài vào Chrome**.
2. Trên máy của con, bấm **Thêm vào Chrome**.
3. Trở lại trang phụ huynh và bấm **Tạo mã kết nối**.
4. Mở biểu tượng Minh Hương trên Chrome, dán mã và bấm **Kết nối máy**.

Mỗi máy chỉ cần làm một lần.

## Cài bản thử nghiệm dành cho người hỗ trợ

1. Chạy website/API theo [hướng dẫn tích hợp](../docs/minhhuong-browser-control.md). API cần migration `20260919100000_browser_control`.
2. Phụ huynh đăng nhập website, mở `/browser-control`, chọn hồ sơ con, thêm video và bấm **Lưu thay đổi**.
3. Tạo profile Chrome riêng trên máy trẻ. Mở `chrome://extensions`, bật Developer mode, chọn **Load unpacked** và chọn thư mục `minhhuongextension` (hoặc thư mục giải nén ZIP).
4. Ngay khi cài, tiện ích chặn các trang chưa được phụ huynh chọn. Mở biểu tượng Minh Hương, nhập địa chỉ máy chủ do người triển khai cung cấp, tên máy và mã kết nối tạo tại website. Mã hết hạn sau 10 phút và chỉ dùng một lần.
5. Mở **Góc học của con** trong popup để chọn nội dung. Hết hạn mức sẽ chuyển cùng tab sang AI/bài tập tương ứng.

Không đăng nhập tài khoản phụ huynh vào profile của trẻ. Địa chỉ API được giữ cố định sau ghép. Thiết bị được thu hồi trên website; extension đã thu hồi tiếp tục khóa truy cập. Để sử dụng lại, phụ huynh tạo mã mới trên website rồi nhập vào popup (mục **Kết nối lại máy của con**); không cần cài lại. Lần ghép lại vẫn dùng đúng địa chỉ máy chủ ban đầu.

## Hỗ trợ khách hàng

- Popup hiện **phiên bản** tiện ích và nút **Sao chép thông tin hỗ trợ**. Nội dung gồm trạng thái, tên máy, hồ sơ con, chế độ, máy chủ, lần kiểm tra gần nhất, lỗi gần nhất, số sự kiện chờ gửi, giờ trên máy và trình duyệt. Không chứa token thiết bị hay mật khẩu.
- Trang chặn báo riêng ba trường hợp: máy đã bị ngắt kết nối, ngày giờ trên máy chưa đúng, phụ huynh đang tạm dừng.
- Lỗi “Không kết nối được tới (địa chỉ máy chủ)” khi máy vẫn có mạng thường là gói cài trỏ sai địa chỉ máy chủ; kiểm tra lại tham số `-ApiUrl` khi đóng gói.
- Trên website, sau khi tạo mã, trang tự cập nhật khi máy của con kết nối xong và đếm ngược thời hạn mã.

## Cách tính giờ

- Tính thời gian **truy cập nội dung** ở tab đang hoạt động trong cửa sổ có focus; không khẳng định đây là số giây video thực sự phát.
- Cấp trước tối đa 5 giây và lưu vào `chrome.storage.local` trước khi cho xem. Đóng/mở trình duyệt không hoàn lại phần đã cấp. Mở nhiều tab không tạo hạn mức riêng. Tab nền bị che và dừng phần tử audio/video.
- Hạn mức áp dụng theo **thiết bị**, theo ngày và múi giờ phụ huynh chọn. Mỗi link còn có hạn mức riêng trong ngày. Ngoài lịch xem, hoạt động học vẫn được phép. Chế độ tạm dừng khóa cả học.
- Đồng bộ khoảng 30 giây khi Chrome hoạt động. Offline giữ cấu hình cuối và hàng đợi; không cấp lại thời gian khi khởi động. Server hợp nhất bộ đếm bằng giá trị lớn nhất và chống trùng nhật ký bằng ID.
- Lưu tối đa 2.000 sự kiện chờ gửi; bộ đếm giữ tối đa 30 ngày chờ đồng bộ. Khi vượt giới hạn hàng đợi, sự kiện cũ nhất bị bỏ, bộ đếm thời gian vẫn giữ riêng. AI/bài tập trên server cần mạng.

## Phạm vi kiểm soát

Chỉ duyệt **đúng URL**, có phân biệt path/query; fragment được bỏ qua. Không tự mở quyền cho toàn bộ tên miền, playlist, link đăng nhập hoặc các video đề xuất. Với YouTube, dùng URL cuối sau redirect, ví dụ `https://www.youtube.com/watch?v=VIDEO_ID`, bỏ tham số chia sẻ/playlist không cần thiết. Trang cần redirect hoặc iframe có thể không hoạt động cho đến khi được cấu hình phù hợp. Subframe bị chặn mặc định.

Extension kiểm soát HTTP(S) trong profile đã cài; không phải khóa hệ điều hành. Người có quyền tắt/gỡ extension, mở Guest/profile khác/trình duyệt khác hoặc sửa dữ liệu máy vẫn có thể vượt kiểm soát. Trang `chrome://`, file cục bộ, trình duyệt ẩn danh và phần mềm ngoài Chrome nằm ngoài phạm vi. Nếu cần chống gỡ, quản lý profile/Chrome và tài khoản hệ điều hành bằng chính sách thiết bị. Không có cơ chế ngăn tuyệt đối việc sửa đồng hồ khi máy offline; đồng hồ lệch lùi được khóa, lệch so với server trên một phút được phát hiện khi đồng bộ.

Extension không tải script/subtitle YouTube. Phụ huynh chọn combo hoặc thêm link ở website; module server xử lý script để tạo ngữ cảnh và câu hỏi. Khóa API AI và tài khoản phụ huynh không nằm trong extension; token thiết bị chỉ dùng cho đồng bộ và nội dung học của chính hồ sơ đã ghép.

## Kiểm thử

Từ thư mục gốc: `npm run test:extension`. Kiểm thử Chromium và backend được hướng dẫn trong tài liệu tích hợp.
