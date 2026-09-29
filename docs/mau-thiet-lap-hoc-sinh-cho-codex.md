# Mẫu thiết lập tài khoản và lộ trình học sinh bằng Codex

## Cách sử dụng

1. Sao chép phần từ `BẮT ĐẦU YÊU CẦU` đến `KẾT THÚC YÊU CẦU`.
2. Chỉ thay nội dung nằm trong dấu ngoặc vuông `[...]`.
3. Không điền họ tên pháp lý, ngày sinh đầy đủ, địa chỉ nhà, tên trường/lớp cụ thể, ảnh hoặc giấy tờ của trẻ.
4. Không dán mật khẩu, mã OTP, thông tin thẻ hay thông tin ngân hàng. Khi cần, yêu cầu Codex dừng để phụ huynh tự nhập.

---

## BẮT ĐẦU YÊU CẦU

Tôi là phụ huynh/người giám hộ và có quyền thiết lập hồ sơ học tập sau đây. Hãy tư vấn nội dung, tạo hoặc cập nhật hồ sơ học sinh trong hệ thống Minh Hương, tạo lộ trình học, gắn nội dung phù hợp và kiểm tra lại kết quả.

### 1. Phạm vi được phép thực hiện

- Chế độ thực hiện: `[TỰ_ĐỘNG_TRONG_PHẠM_VI | LẬP_KẾ_HOẠCH_ĐỂ_DUYỆT]`
- Môi trường: `[LOCAL | STAGING | PRODUCTION]`
- Địa chỉ hệ thống: `[URL hệ thống Minh Hương]`
- Cách truy cập: `[dùng phiên đăng nhập đang mở | yêu cầu tôi đăng nhập khi cần]`
- Được phép tạo tài khoản phụ huynh mới: `[CÓ | KHÔNG]`
- Được phép tạo hồ sơ trẻ dưới tài khoản phụ huynh: `[CÓ | KHÔNG]`
- Loại quyền học: `[DÙNG_THỬ_MIỄN_PHÍ | GÓI_ĐÃ_CÓ | CHƯA_XÁC_ĐỊNH]`
- Được phép tạo bài học/lộ trình/gói nội dung dạng nháp: `[CÓ | KHÔNG]`
- Được phép xuất bản nội dung và gán cho học sinh: `[CÓ | KHÔNG]`

Không tự thực hiện thanh toán, mua gói, gửi email/tin nhắn, công khai dữ liệu hoặc chấp nhận điều khoản thay tôi. Dừng lại để tôi thao tác khi gặp mật khẩu, OTP, CAPTCHA, xác nhận email, thanh toán hoặc một bước không thể hoàn tác. Không hiển thị thông tin đăng nhập trong báo cáo cuối.

### 2. Tài khoản phụ huynh

- Email phụ huynh: `[email]`
- Tên hiển thị phụ huynh: `[tên gọi, không bắt buộc]`
- Trạng thái dự kiến: `[đã có tài khoản | tạo tài khoản mới | không rõ, hãy kiểm tra]`
- Nếu tạo mới, mật khẩu: `YÊU_CẦU_TÔI_TỰ_NHẬP`

Nếu email đã tồn tại, không tạo tài khoản trùng. Nếu tài khoản đã có hồ sơ trẻ trùng tên gọi, hãy báo và ưu tiên cập nhật hồ sơ đó; không tự tạo bản sao.

### 3. Hồ sơ học sinh

- Tên gọi trong ứng dụng: `[biệt danh hoặc tên gọi]`
- Tuổi hoặc nhóm tuổi: `[ví dụ: 8 tuổi / 7–9 tuổi]`
- Lớp học chung: `[ví dụ: lớp 3; không ghi tên trường/lớp cụ thể]`
- Ngôn ngữ chính: `[Tiếng Việt]`
- Trình độ hiện tại: `[mới bắt đầu | A1 | A2 | mô tả khác | chưa rõ]`
- Điểm mạnh: `[mô tả ngắn]`
- Nội dung đang khó: `[mô tả ngắn]`
- Mục tiêu trong `[số]` tuần: `[mục tiêu đo được]`
- Sở thích: `[chủ đề, nhân vật, hoạt động yêu thích]`
- Cách học phù hợp: `[video ngắn | trò chơi | lặp lại | bài hát | kể chuyện | hỗn hợp]`
- Nhu cầu hỗ trợ đặc biệt có liên quan trực tiếp đến việc học: `[không | mô tả tối thiểu cần thiết]`

### 4. Thời gian và nhịp học

- Số buổi mỗi tuần: `[số buổi]`
- Các ngày ưu tiên: `[ngày trong tuần]`
- Số phút mỗi buổi: `[số phút]`
- Thời lượng tối đa của một video: `[số phút]`
- Thời gian màn hình tối đa mỗi ngày: `[số phút]`
- Tỷ lệ xem tối thiểu để hoàn thành: `[ví dụ: 80%]`
- Điểm bài luyện tối thiểu: `[ví dụ: 70%]`
- Có buổi ôn tập: `[CÓ | KHÔNG]`

### 5. Tiêu chuẩn chọn kênh và video

- Môn/kỹ năng: `[ví dụ: tiếng Anh giao tiếp, phát âm, từ vựng]`
- Ngôn ngữ video: `[Tiếng Việt | Tiếng Anh | song ngữ]`
- Nguồn cho phép: `[YouTube | kho nội bộ | cả hai]`
- Kênh ưu tiên: `[danh sách hoặc KHÔNG]`
- Kênh không được dùng: `[danh sách hoặc KHÔNG]`
- Chủ đề không được xuất hiện: `[danh sách]`
- Quảng cáo/tài trợ trong nội dung: `[KHÔNG CHẤP NHẬN | có thể chấp nhận nếu không nhắm tới trẻ]`
- Video có phụ đề: `[BẮT BUỘC | ƯU TIÊN | KHÔNG BẮT BUỘC]`
- Giọng đọc mong muốn: `[Anh-Mỹ | Anh-Anh | bất kỳ | khác]`

Với nguồn trực tuyến, hãy kiểm tra liên kết còn hoạt động tại thời điểm thực hiện. Đánh giá tính phù hợp theo độ tuổi dựa trên nội dung thực tế, không chỉ dựa vào tiêu đề hoặc ảnh thu nhỏ. Không chọn video chỉ vì kênh nổi tiếng. Ưu tiên nội dung ngắn, rõ mục tiêu, không gây xao nhãng và không dẫn trẻ sang nội dung liên quan ngoài lộ trình.

### 6. Cách chỉ định phần video

Mỗi video phải có đủ:

- Tên kênh.
- Tên video và URL gốc.
- Mốc bắt đầu `MM:SS`.
- Mốc kết thúc `MM:SS`.
- Thời lượng phần được chọn.
- Mục tiêu học của riêng đoạn đó.
- Một câu hướng dẫn trước khi xem.
- 1–3 câu hỏi hoặc hoạt động sau khi xem.
- Lý do phù hợp với tuổi, trình độ và mục tiêu của học sinh.

Không yêu cầu học sinh xem toàn bộ video khi chỉ một đoạn có ích. Nếu không xác minh được chính xác mốc thời gian, không tự đoán; hãy loại video hoặc ghi rõ `CHƯA XÁC MINH`.

### 7. Lộ trình cần tạo

- Thời lượng lộ trình: `[số tuần]`
- Số bài dự kiến: `[số bài hoặc để Codex đề xuất]`
- Chủ đề chính: `[danh sách]`
- Kết quả cần đạt: `[kết quả đo được]`
- Tên lộ trình mong muốn: `[tên hoặc để Codex đặt]`
- Mã lộ trình mong muốn: `[mã duy nhất hoặc để Codex tạo]`

Mỗi bài học cần có mục tiêu, video/đoạn video, hoạt động luyện tập, điều kiện hoàn thành và quan hệ tiên quyết nếu có. Sắp xếp từ dễ đến khó, xen kẽ bài mới và bài ôn. Không tạo nhiều bài chỉ để tăng số lượng.

### 8. Quy trình Codex phải thực hiện

1. Kiểm tra dữ liệu đầu vào. Chỉ hỏi lại nếu thiếu dữ liệu làm thay đổi đáng kể tài khoản hoặc lộ trình; nếu thiếu chi tiết nhỏ, dùng giả định an toàn và ghi rõ.
2. Kiểm tra tài khoản phụ huynh và hồ sơ trẻ hiện có để tránh tạo trùng.
3. Nếu được phép và cần thiết, tạo tài khoản/quyền dùng thử hoặc hồ sơ trẻ bằng luồng sẵn có của hệ thống.
4. Tìm và đánh giá nội dung theo các tiêu chuẩn trên. Lập bảng ứng viên và loại bỏ video không đạt.
5. Tái sử dụng bài học đã xuất bản nếu nội dung, video và mục tiêu tương đương; không tạo bản sao không cần thiết.
6. Nếu phải tạo nội dung mới, tạo course/unit/lesson, gắn video, bài luyện và các mốc đoạn video; sau đó tạo learning path và content package.
7. Chỉ xuất bản và gán gói cho học sinh khi phần quyền ở mục 1 cho phép. Nếu không, để ở trạng thái nháp và trình bày chính xác phần còn chờ duyệt.
8. Sau khi gán, đọc lại content assignment của học sinh và xác minh các bài học đều truy cập được.
9. Kiểm tra tên hiển thị, thời lượng, thứ tự bài, tỷ lệ xem tối thiểu, điểm tối thiểu, liên kết video và mốc thời gian.
10. Không tuyên bố “đã thiết lập” nếu chỉ mới lập kế hoạch hoặc nếu một bước xác minh thất bại.

### 9. Báo cáo cuối bắt buộc

Trả về báo cáo ngắn gồm:

- Tài khoản phụ huynh: `đã có | đã tạo | cần phụ huynh hoàn tất`.
- Hồ sơ học sinh: tên gọi và ID hồ sơ.
- Quyền học/gói học: trạng thái và ngày hết hạn nếu có.
- Lộ trình và content package: tên, mã, ID, trạng thái.
- Danh sách bài theo thứ tự.
- Với mỗi video: kênh, URL, mốc bắt đầu–kết thúc và mục tiêu.
- Kết quả xác minh content assignment.
- Các bước chưa hoàn tất và lý do.
- Các giả định đã sử dụng.

Không đưa mật khẩu, token, OTP hoặc dữ liệu nhạy cảm vào báo cáo.

## KẾT THÚC YÊU CẦU

---

## Ghi chú về khả năng hiện tại của hệ thống

Hệ thống hiện có luồng tạo tài khoản phụ huynh/dùng thử, tạo hồ sơ trẻ, tạo và xuất bản bài học, tạo learning path/content package, rồi gán package cho một child profile. Tuy nhiên mô hình `VideoAsset` hiện chỉ lưu video đầy đủ và chưa có trường riêng cho `startSec`/`endSec`. Vì vậy Codex có thể ghi mốc đoạn xem trong tiêu đề hoặc mô tả bài học, nhưng trình phát chưa chắc tự khóa đúng đoạn. Khi thực hiện, Codex phải báo rõ phần nào đã được hệ thống cưỡng chế và phần nào mới là hướng dẫn cho học sinh.
