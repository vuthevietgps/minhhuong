# Mã đại lý, affiliate và kích hoạt plugin

| Loại mã | Ai tạo | Công dụng | Thời điểm có hiệu lực |
| --- | --- | --- | --- |
| Mã đại lý | Đại lý đề xuất tại `/agency-register`; admin hoặc vận hành duyệt tại `/admin/agency-applications` | Định danh đại lý và cấp tài khoản `AGENCY_OWNER` để bán | Sau khi duyệt; trước đó hồ sơ chỉ có trạng thái `PENDING_REVIEW` |
| Mã/link affiliate | Sale hoặc đại lý đã có quyền tạo tại `/admin/affiliate`; quản lý kênh cũng có thể tạo cho người bán thuộc phạm vi của mình | Gắn nguồn giới thiệu, theo dõi lượt nhấp và nguồn đơn hàng | Khi link `ACTIVE`; có thể tạm dừng hoặc thu hồi |
| Mã kích hoạt plugin | Phụ huynh tạo trong tài khoản tại `/browser-control` | Ghép plugin trên máy con với hồ sơ con để áp dụng quản lý trình duyệt | Dùng một lần trong 10 phút; phụ huynh nhập mã vào plugin |

Mã đại lý không xác nhận thanh toán hoặc kích hoạt quyền học của trẻ. Link affiliate chỉ ghi nhận nguồn đơn; trạng thái thanh toán và quyền học vẫn do luồng đơn hàng quyết định. Mã plugin chỉ ghép thiết bị, không phải mã đại lý hay mã affiliate.

Khi tạo link affiliate, bỏ trống mã link để hệ thống sinh tự động, hoặc nhập mã riêng dạng `af_...` (3–48 ký tự chữ thường, số hoặc dấu `-` sau tiền tố). Mã đã dùng không thể tạo lại. Mã người bán có thể bỏ trống để tạo link cho chính tài khoản kênh, hoặc quản lý chọn mã của người bán thuộc phạm vi quyền mình có.

Triển khai thay đổi này cần chạy migration Prisma `20260923100000_agency_applications` trước khi dùng màn hình đăng ký đại lý. Email thông báo duyệt hoặc từ chối chỉ được gửi khi SMTP đã cấu hình; nếu chưa, hệ thống ghi log. Quy trình duyệt hiện dựa vào admin kiểm tra hồ sơ và thông tin liên hệ, chưa có bước xác minh email tự động.
