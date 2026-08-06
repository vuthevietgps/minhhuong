# Teacher Grading & Review Model

Tài liệu này mô tả luồng công việc của Giáo viên (Teacher) trên hệ thống, đặc biệt tập trung vào nghiệp vụ chấm bài, nhận xét và quản lý học viên. Việc này giúp giảm tải cho Admin, đồng thời đáp ứng nhu cầu cho các khóa học nâng cao yêu cầu tương tác giữa người với người.

## 1. Phân loại bài tập (Activities)

Hệ thống hiện tại ( Prisma schema ) đã định nghĩa các `ActivityType` và `QuestionType` có thể được chia làm hai nhóm chính:

-   **Auto-graded (Chấm điểm tự động):**
    -   `QUIZ`, `VOCAB_GAME`, `LISTENING`
    -   `SINGLE_CHOICE`, `MULTIPLE_CHOICE`, `ORDERING`
    -   *Luồng tác nghiệp:* Hệ thống tự chấm điểm ngay khi học viên `SUBMITTED` dựa trên `isCorrect` của `Answer`. Đuợc chuyển luôn sang trạng thái `GRADED` (hoặc hoàn thành nốt).

-   **Manual-graded (Chấm điểm thủ công):**
    -   `SPEAKING`, `WRITING`
    -   `TEXT_INPUT` (khi cần nhận xét dài)
    -   *Luồng tác nghiệp:* Khi học viên nộp bài, `ActivityAttempt` chuyển sang trạng thái `SUBMITTED`. Bài tập xếp hàng vào một danh sách "Cần chấm điểm" trên Teacher Portal. Sau khi giáo viên xem, nhận xét (`feedback`) và ghi nhận điểm số, trạng thái mới chuyển sang `GRADED`.

## 2. Quy trình chấm bài (Teacher Grading Workflow)

1.  **Học viên làm bài:**
    -   Học viên quay video/ghi âm (Speaking) hoặc gõ văn bản (Writing/Text Input).
    -   Hệ thống tải lên Media và lưu nội dung vào `QuestionAttempt.textAnswer` (hoặc 1 bảng lưu trữ file/audio url nếu cần mở rộng).
    -   `ActivityAttempt.status` = `SUBMITTED`.

2.  **Thông báo cho Giáo viên:**
    -   Hệ thống dựa trên phân công lớp học / nhóm học viên để đẩy bài tập vào _To-Do List_ của giáo viên phụ trách.
    -   *(Ghi chú: Cần bổ sung thêm bảng liên kết `TeacherStudent` hoặc `Class` trong Schema ở các giai đoạn sau nếu muốn chia lớp rõ ràng).*

3.  **Giáo viên thực hiện chấm điểm:**
    -   Truy cập **Teacher Portal**.
    -   Xem chi tiết bài nộp của học viên trong mục **Grading / Cần chấm**.
    -   Xem lại câu trả lời, nghe audio đoạn hội thoại, v.v.
    -   Thực hiện thao tác:
        -   Cập nhật `QuestionAttempt.score` (điểm).
        -   Ghi lại `QuestionAttempt.feedback` (Nhận xét/Sửa lỗi).
    -   Xác nhận hoàn thành bài chấm. Hệ thống tính tự động tổng điểm `ActivityAttempt.score` tính tổng từ các question.
    -   Cập nhật `ActivityAttempt.status` = `GRADED`.

4.  **Thông báo tới Học viên / Phụ huynh:**
    -   Hệ thống báo Notification/Email (qua service Notification) rằng phần trả lời đã có kết quả.
    -   Phụ huynh có thể xem trên Parent Portal, Học viên xem trong app học.

## 3. Quyền hạn của Teacher (Teacher Role Scopes)

Để đảm bảo bảo mật và rành mạch về chức năng, vai trò `TEACHER` cần được thiết kế với các đặc quyền sau:

-   **KHÔNG:** Có quyền thay đổi gốc của nội dung Course/Lesson/Unit/Activity (trừ khi họ được cấp thêm quyền `CONTENT_EDITOR`).
-   **KHÔNG:** Xem được toàn bộ thông tin thanh toán, quản trị người dùng.
-   **ĐƯỢC CẤP:** Truy cập danh sách các `ActivityAttempt` ở trạng thái `SUBMITTED` thuộc vùng quản lý của họ.
-   **ĐƯỢC CẤP:** Cập nhật (với quyền hạn bị giới hạn) các bảng Attempt (nhập điểm, nhập feedback).
-   **ĐƯỢC CẤP:** Xem lại báo cáo quá trình (Progress) của những học viên trong lớp mình phụ trách để có định hướng hỗ trợ.

## 4. API Endpoints đề xuất (Teacher Portal)

-   `GET /v1/teacher/assignments/pending`: Lấy danh sách các bài đang chờ chấm (`status=SUBMITTED`).
-   `GET /v1/teacher/assignments/:attemptId`: Xem chi tiết bài nộp của 1 học sinh nhất định.
-   `PUT /v1/teacher/assignments/:attemptId/grade`: Gửi điểm thành phần của các `QuestionAttempt`, đính kèm `feedback`, tự động hoàn tất bài chấm.
-   `GET /v1/teacher/students`: Lấy danh sách học viên giáo viên đang phụ trách.
-   `GET /v1/teacher/students/:studentId/progress`: Xem lịch sử học tập.

## 5. Mở rộng trong tương lai

-   **Mẫu Rubric:** Tích hợp bảng điểm chuẩn (Rubric) chi tiết cho Writing/Speaking để giáo viên chỉ cần tick chọn, rút ngắn thời gian chấm.
-   **AI Chat/AI Co-pilot cho Giáo viên:** AI có thể gợi ý trước feedback hoặc tự động chấm lỗi ngữ pháp cơ bản, giáo viên chỉ cần Review lại rồi bấm "Duyệt" -> Sinh ra 1 mô hình mới về tốc độ vận hành.
