# BA hiện trạng phần mềm Minh Huong Learning Platform

Ngày đánh giá: 2026-06-14  
Phạm vi rà soát: mã nguồn hiện tại trong `apps/api`, `apps/web`, `packages/shared`, `docs`, `quytac.md`, Prisma schema và các tài liệu nghiệp vụ sẵn có.

## 1. Tóm tắt điều hành

Minh Huong Learning Platform là nền tảng học tiếng Anh theo gói truy cập, kết hợp ba trục nghiệp vụ chính:

1. Học tập: học viên/phụ huynh truy cập khóa học, video, bài luyện tập, tiến độ học, kiểm soát thời gian thiết bị.
2. Vận hành nội dung: admin/content editor/teacher tạo course, unit, lesson, video, activity, question, gửi duyệt và publish.
3. Thương mại và vận hành doanh thu: sale, đại lý, operations và admin tạo/duyệt đơn kích hoạt, quản lý kênh bán, hoa hồng, ví, payout và báo cáo.

Mức độ hiện tại: MVP có nền tảng backend khá rõ, schema dữ liệu phong phú và frontend đã có nhiều màn hình vận hành. Hệ thống phù hợp giai đoạn chạy thử nội bộ hoặc pilot có kiểm soát. Để tiến tới production chính thức, các mảng cần hardening gồm payment tự động, object storage/CDN cho media, API contract dùng chung, kiểm thử frontend/contract, audit/observability chuẩn hóa và AI thật thay cho mock.

## 2. Mục tiêu sản phẩm

### 2.1 Mục tiêu kinh doanh

- Bán gói học tiếng Anh qua self-service hoặc đội sale/agency.
- Kích hoạt tài khoản học sau khi vận hành xác nhận thanh toán.
- Cho phép học viên học video, làm bài luyện tập và theo dõi tiến độ.
- Cho phép phụ huynh quản lý hồ sơ con, xem báo cáo học tập, giới hạn thời gian thiết bị.
- Cho phép đội nội dung và giáo viên mở rộng kho bài học có quy trình duyệt.
- Quản lý kênh bán theo cấu trúc director, manager, agency, sale; tính hoa hồng và payout minh bạch.

### 2.2 Mục tiêu kỹ thuật

- API NestJS là nguồn nghiệp vụ trung tâm, dùng chung cho web và mobile sau này.
- PostgreSQL/Prisma là nguồn dữ liệu chính.
- Next.js web phục vụ học viên, phụ huynh, admin, sale, agency, operations và teacher.
- Có version API `/v1` và Swagger tại `/docs`.
- Chuẩn bị mở rộng mobile bằng cách giữ auth, subscription, progress, content và entitlement ở backend.

## 3. Actor và vai trò

| Vai trò | Mục tiêu chính | Chức năng hiện có |
| --- | --- | --- |
| STUDENT | Học nội dung, xem video, làm bài tập | Dashboard học, learning home, video feed, watch progress, practice tự chấm, AI chat mock |
| PARENT | Quản lý việc học của con | Hồ sơ con, subscription theo child profile, screen time, cộng thêm thời gian, báo cáo học tập, đổi mật khẩu/hồ sơ |
| TEACHER | Đóng góp nội dung bài học | Teacher portal, tạo lesson draft của mình, gắn video, upload video, submit review |
| CONTENT_EDITOR | Vận hành nội dung | Tạo course/unit/lesson/activity/question, gắn tag/video, submit review |
| ADMIN | Quản trị toàn hệ thống | Quản lý nội dung, user, order, channel, finance, package, publish lesson |
| DIRECTOR | Xem/quản lý cấp cao và channel | Dashboard, report, channel scope, order/finance theo quyền |
| SUPPORT | Hỗ trợ tài khoản | Truy cập thông tin user trong admin users theo role frontend |
| SALE | Tạo đơn và theo dõi hiệu quả cá nhân | Tạo activation order, xem khách hàng, performance, ví/hoa hồng theo scope |
| AGENCY_OWNER | Quản lý đại lý | Quản lý sale trong scope, tạo order, xem report/finance scoped, payout |
| AGENCY_MANAGER | Vận hành nhánh đại lý | Tương tự agency owner nhưng theo phân quyền nhánh |
| OPERATIONS | Đối soát và duyệt vận hành | Duyệt/từ chối/revoke order, quản lý payout, user/channel, packages |

## 4. Kiến trúc hiện tại

### 4.1 Cấu trúc repo

- `apps/api`: NestJS REST API, Prisma, RBAC, nghiệp vụ chính.
- `apps/web`: Next.js frontend cho dashboard đa vai trò, admin portal và teacher portal.
- `packages/shared`: type/contract dùng chung, hiện còn mỏng và chưa đồng bộ hoàn toàn với role/model thực tế.
- `docs`: tài liệu kiến trúc, content model, mobile roadmap, teacher grading, channel redesign.
- `scripts`: script PostgreSQL local.

### 4.2 Hạ tầng và runtime

- Node.js 22+, npm 10+.
- PostgreSQL qua Docker hoặc script local.
- Redis có trong `docker-compose.yml` nhưng chưa thấy được dùng trong code nghiệp vụ.
- File upload local tại `/uploads`, phục vụ static từ API.
- Email qua SMTP nếu cấu hình đủ; nếu không, email được log.
- Cron job:
  - Gửi reminder hết hạn subscription trước 7 và 3 ngày.
  - Gửi weekly learning digest cho phụ huynh.
  - Release commission đủ điều kiện mỗi giờ.

### 4.3 API và bảo mật

- API dùng URI versioning với default `/v1`.
- Swagger được dựng ở `/docs`.
- CORS cấu hình bằng `CORS_ORIGIN`.
- JWT Bearer auth, role guard theo module.
- Global `ValidationPipe` bật `whitelist`, `forbidNonWhitelisted`, `transform`.
- Demo accounts fallback giúp frontend test được khi database chưa đầy đủ.

## 5. Mô hình dữ liệu chính

| Nhóm dữ liệu | Entity chính | Ý nghĩa |
| --- | --- | --- |
| Identity | User, Profile, Role, UserRole, PasswordResetToken | Tài khoản, hồ sơ, role, reset password |
| Parent/Child | ChildProfile, ChildScreenTimeSetting, DeviceTimeGrant, LearningUsageDay | Hồ sơ con, giới hạn thiết bị, sử dụng hằng ngày |
| Content | Level, Course, Unit, Lesson, ContentTag, LessonTag, VideoAsset, Activity, Question, Answer | Cây nội dung học, video, bài tập, câu hỏi |
| Learning | LessonProgress, ActivityAttempt, QuestionAttempt | Tiến độ xem bài, lượt làm bài, đáp án và điểm |
| Billing | Plan, Subscription, Payment, ActivationPackage | Gói, subscription, thanh toán, package bán thủ công |
| Orders | ActivationOrder | Đơn kích hoạt từ sale hoặc self-service |
| Channel | Agency, AgencyMember, ChannelParticipant, CommissionPolicy | Đại lý, thành viên, node kênh bán dạng cây, chính sách hoa hồng |
| Finance | CommissionEarning, CommissionLedgerEntry, PayoutRequest, WalletLedgerEntry | Hoa hồng, ledger, yêu cầu rút tiền |
| AI | AiChatSession, AiChatMessage | Lưu phiên chat và tin nhắn AI mock |
| Audit | AuditLog | Lịch sử thao tác quan trọng |

## 6. Trạng thái nghiệp vụ quan trọng

### 6.1 User

- `ACTIVE`: được đăng nhập nếu thỏa điều kiện subscription.
- `SUSPENDED`: không được đăng nhập.
- `DELETED`: trạng thái xóa mềm logic.

### 6.2 Lesson

- `DRAFT`: được chỉnh sửa.
- `IN_REVIEW`: chờ duyệt.
- `PUBLISHED`: học viên có thể thấy nếu có quyền học.
- `ARCHIVED`: lưu lịch sử, không còn là nội dung active.

### 6.3 Activation order

- `WAITING_PAYMENT`: self-service đã tạo, chờ upload biên lai.
- `PENDING_REVIEW`: chờ operations/admin duyệt.
- `APPROVED`: đã kích hoạt subscription.
- `REJECTED`: bị từ chối, có thể resubmit theo quyền.
- `CANCELED`: bị hủy trước khi kích hoạt.
- `REVOKED`: đã thu hồi quyền truy cập sau khi kích hoạt.

### 6.4 Commission và payout

- Commission:
  - `PENDING`: ghi nhận nhưng chưa available, thường trong 15 ngày trial.
  - `AVAILABLE`: được release vào ledger.
  - `CANCELED`: order không còn hợp lệ.
- Payout:
  - `PENDING_REVIEW`, `APPROVED`, `REJECTED`, `PAID`, `CANCELED`.

## 7. Mô tả chức năng theo module

### 7.1 Authentication và tài khoản

Chức năng hiện có:

- Đăng ký tài khoản học viên, mặc định `SUSPENDED`, role `STUDENT`.
- Đăng nhập bằng email/password.
- Demo login cho các role chính bằng mật khẩu `Demo@12345`.
- JWT access token có `sub`, `email`, `roles`, thời hạn phản hồi 1800 giây.
- Kiểm tra điều kiện đăng nhập:
  - User phải `ACTIVE`.
  - Role `STUDENT` cần child profile có subscription `TRIALING` hoặc `ACTIVE` còn hạn.
  - Nếu subscription hết hạn, hệ thống cập nhật subscription thành `EXPIRED` và user thành `SUSPENDED`.
- Quên mật khẩu và reset mật khẩu bằng token một lần, hết hạn sau 1 giờ.
- Cập nhật profile và đổi mật khẩu từ `/me`.

Nhận xét BA:

- Hệ thống đang chuyển dần từ mô hình "student là user học" sang "parent có child profile học". Cần chốt mô hình định danh trước khi mở mobile.
- Chưa thấy refresh token/device session, trong khi tài liệu mobile roadmap có đề xuất.

### 7.2 Catalog và nội dung học

Chức năng hiện có:

- Catalog public trả level, course đã publish, outline course.
- Admin/content editor tạo:
  - Level tự upsert theo `levelCode`.
  - Course, Unit, Lesson.
  - Video từ YouTube, external link hoặc upload local.
  - Activity và Question/Answer.
  - Content tag theo kind: topic, audience, level, skill, format, intent, custom.
- Quy trình lesson:
  - Tạo lesson ở `DRAFT`.
  - Chỉ lesson draft mới được sửa nội dung chính.
  - Submit review nếu có video hoặc activity.
  - Publish chỉ khi `IN_REVIEW`, video ready, activity có question hợp lệ.
  - Publish lesson sẽ set course `isPublished = true`.
- YouTube URL được chuẩn hóa thành `youtube-nocookie` embed.

Nhận xét BA:

- Content model phù hợp MVP học qua video và bài tự chấm.
- Chưa có version/revision nội dung, dù tài liệu content model đã nêu nhu cầu.
- Speaking question không được publish do grading chưa hỗ trợ đầy đủ.

### 7.3 Teacher content portal

Chức năng hiện có:

- Teacher xem overview số lesson của mình.
- Xem cây course/unit để chọn nơi gắn lesson.
- Tạo lesson draft do mình sở hữu.
- Sửa metadata lesson draft của mình.
- Gắn YouTube/upload video.
- Tạo activity/question cho lesson draft của mình.
- Submit lesson của mình sang `IN_REVIEW`.

Ngoài phạm vi hiện tại:

- Teacher grading workflow trong `docs/teacher-grading-model.md` mới là đề xuất. Chưa thấy API thực tế cho pending assignments, grade attempt, student list hoặc class assignment.

### 7.4 Learning cho học viên

Chức năng hiện có:

- Learning home:
  - Trạng thái sử dụng thiết bị hôm nay.
  - Lesson tiếp tục học.
  - Daily plan.
  - Streak.
  - Tổng lesson, completed, in-progress, weekly study minutes.
- Video feed theo course/unit/lesson đã publish.
- Ghi nhận watch event:
  - `STARTED`, `PROGRESSED`, `COMPLETED`, `REPLAYED`.
  - Cập nhật `LessonProgress`, `lastPositionSec`, `watchCount`, `lastWatchedAt`.
  - Ghi nhận thời lượng học vào `LearningUsageDay`.
- Favorite lesson.
- Practice:
  - Lấy activity/question công khai, không lộ đáp án đúng.
  - Submit attempt và tự chấm các loại: single choice, multiple choice, text input, ordering.
  - Tính score, maxScore, feedback.
  - Recalculate lesson progress, hoàn thành nếu overall score >= 80.

Nhận xét BA:

- Luồng học tập cốt lõi đã usable cho video + quiz.
- Chưa có signed media URL, offline, download, push notification.
- AI chat hiện là mock nên chưa được coi là năng lực học thông minh thật.

### 7.5 Parent portal

Chức năng hiện có:

- Danh sách child profile của phụ huynh.
- Tạo/xóa child profile.
- Xem subscription hiện tại của từng child.
- Bật/tắt screen time và set daily limit.
- Cộng thêm thời gian thiết bị trong ngày.
- Xem insight học tập:
  - Limit reached.
  - Practice ready.
  - In progress.
  - No activity.
- Báo cáo 1 đến 12 tuần:
  - Tổng bài xem/hoàn thành.
  - Tổng thời gian học.
  - Tổng thời gian thiết bị.
  - Thời gian cộng thêm.
  - Weekly usage.
  - Recent lessons.

Nhận xét BA:

- Đây là điểm khác biệt sản phẩm tốt cho nhóm học viên nhỏ tuổi.
- Cần định nghĩa rõ "study time" và "device time" nếu dùng làm KPI với phụ huynh.

### 7.6 Activation orders và billing

Chức năng hiện có:

- Activation package có thể quản lý từ admin.
- Self-service:
  - Lấy options gói + thông tin chuyển khoản.
  - Parent tạo order, child profile được tạo/fetch.
  - Order ở `WAITING_PAYMENT`.
  - Upload payment proof để chuyển sang `PENDING_REVIEW`.
- Sale-assisted:
  - Sale/agency/admin tạo order cho customer.
  - Tạo mới learner nếu email chưa tồn tại.
  - Không reset mật khẩu user hiện có.
  - Guard chống duplicate pending order trong 48 giờ cho cùng creator/email.
  - Gắn attribution theo channel participant, agency code hoặc referral code.
- Operations/admin:
  - Approve order, bắt buộc upload operation invoice.
  - Kích hoạt user.
  - Tạo hoặc gia hạn subscription theo child profile.
  - Ghi `activatedAt`, `expiresAt`, `trialEndsAt`.
  - Tạo commission earning pending.
  - Reject, cancel, revoke theo trạng thái và quyền.
- Email:
  - Order created.
  - Approved.
  - Rejected.
  - Revoked.
  - Expiry reminder.

Nhận xét BA:

- Hệ thống hiện thiên về chuyển khoản thủ công và vận hành duyệt biên lai.
- Chưa có payment gateway/webhook/idempotency event.
- `Payment` model tồn tại nhưng luồng order hiện dùng `ActivationOrder` làm nguồn nghiệp vụ chính.

### 7.7 Channel admin

Chức năng hiện có:

- Quản lý agency.
- Tạo channel user theo role:
  - `DIRECTOR`.
  - `AGENCY_MANAGER` map sang participant `MANAGER`.
  - `AGENCY_OWNER` map sang participant `AGENCY`.
  - `SALE` map sang participant `SALE`.
- `ChannelParticipant` có `parentParticipantId`, `rootParticipantId`, `lineage`, `depth`.
- Rule recruit:
  - Director tuyển manager, agency, sale.
  - Manager tuyển agency, sale.
  - Agency tuyển sale.
  - Sale không tuyển.
- Scope dữ liệu theo subtree bằng `lineage startsWith`.
- Quản lý user status, reset password, role platform.
- Quản lý agency member cũ để tương thích.
- Quản lý commission policy.
- Quản lý activation packages.
- Audit log cho thao tác quan trọng.

Nhận xét BA:

- Code hiện tại đã triển khai nhiều ý từ tài liệu channel hierarchy redesign.
- Tuy nhiên vẫn tồn tại song song mô hình `AgencyMember` và `ChannelParticipant`, cần roadmap migrate/cleanup rõ để tránh nhầm logic vận hành.

### 7.8 Channel finance, commission và payout

Chức năng hiện có:

- Overview finance:
  - Tổng order.
  - Approved revenue.
  - Pending/paid payout.
  - Wallet summary.
- Report theo khoảng ngày, tối đa 366 ngày:
  - Pipeline order theo status/source.
  - Approved revenue.
  - Commission sale/agency.
  - Payout status.
  - Top sales/agencies.
  - Recent approved orders/payouts.
- CSV export approved orders.
- Wallet:
  - Ledger entries.
  - Earnings.
  - Payout requests.
- Commission:
  - Khi order approve, tạo earning theo chuỗi participant và upline tối đa 4 tầng.
  - Công thức mặc định: depth 0 = 40%, depth sau = 40% của tầng trước.
  - `availableAt = activatedAt + 15 ngày`.
  - Cron release hourly chuyển earning từ `PENDING` sang `AVAILABLE` và tạo ledger `CREDIT`.
  - Nếu order không còn `APPROVED`, earning due bị `CANCELED`.
- Payout:
  - User/agency tạo request nếu đủ available balance.
  - Tạo ledger `HOLD`.
  - Operations/admin pay kèm invoice, tạo `RELEASE` và `DEBIT`, set `PAID`.
  - Reject tạo `RELEASE` và set `REJECTED`.

Nhận xét BA:

- Ledger pattern đúng hướng, tránh sửa số dư trực tiếp.
- Cần thống nhất định nghĩa available/held vì cách tính hiện tại dựa trên CREDIT/RELEASE trừ DEBIT/HOLD có thể gây khó giải thích với business nếu không có tài liệu kế toán nội bộ.

### 7.9 AI chat

Chức năng hiện có:

- Tạo message và lưu session/message nếu có `childProfileId`.
- Reply là mock: không gọi AI provider.
- Metadata provider là `mock`.

Nhận xét BA:

- Chức năng đang ở mức placeholder để test UI/data model.
- Chưa có guard entitlement AI, giới hạn token/chi phí, prompt/model version, moderation hoặc audit chất lượng.

### 7.10 Notification

Chức năng hiện có:

- Email qua SMTP nếu đủ cấu hình.
- Nếu thiếu SMTP, hệ thống log email.
- Email template cho order lifecycle, renewal reminder, weekly digest, forgot password.

Nhận xét BA:

- Đủ cho pilot.
- Production cần tracking delivery, retry, unsubscribe/notification preferences nếu mở rộng marketing hoặc digest lớn.

## 8. Frontend hiện tại

### 8.1 Route chính

- `/`: dashboard đa vai trò, login, demo accounts, self-service signup và workspace theo role.
- `/admin`: admin overview có quick links, pending orders, finance/channel summary.
- `/admin/orders`: order queue, approve/reject/resubmit/revoke, tạo order.
- `/admin/content`: quản lý course/unit/lesson/video/activity/question/tag và publish.
- `/admin/users`: danh sách user, detail, suspend/activate, role.
- `/admin/channel`: agency, sale/channel users, commission policy.
- `/admin/finance`: finance report, wallet, payout, CSV.
- `/admin/audit`: audit log.
- `/admin/performance`: hiệu quả cá nhân cho sale/agency.
- `/admin/packages`: pricing/activation packages.
- `/teacher`: teacher overview.
- `/teacher/content`: teacher lesson workspace.

### 8.2 Đánh giá frontend

Điểm tốt:

- Đã tách admin portal route-based, dễ vận hành hơn dashboard một trang.
- Có role-based navigation ở frontend.
- Nhiều form có trạng thái loading/error/success.
- Có helper chung cho admin API.

Điểm cần cải thiện:

- `/` là file rất lớn, gom nhiều panel và domain trong một component tree, khó bảo trì.
- Frontend đang lặp type với backend thay vì dùng generated API contract.
- Chưa thấy test frontend/e2e.
- Lưu session trong `localStorage`, cần đánh giá lại nếu production yêu cầu bảo mật cao hơn.

## 9. Luồng nghiệp vụ chi tiết

### UC-01: Đăng nhập

Actor: tất cả user.

Tiền điều kiện:

- User tồn tại hoặc là demo account.
- User thật phải `ACTIVE`.
- Student thật cần subscription còn hạn trên child profile.

Luồng chính:

1. User nhập email/password.
2. API xác thực password.
3. API lấy roles.
4. API kiểm tra trạng thái user và subscription nếu là student.
5. API trả user profile, roles, access token.
6. Web lưu session và điều hướng dashboard theo role.

Ngoại lệ:

- Sai email/password: trả lỗi unauthorized.
- User suspended/chưa active: không cho login.
- Student hết hạn: cập nhật subscription expired, user suspended, trả thông báo gia hạn.

### UC-02: Self-service mua gói

Actor: phụ huynh/khách hàng.

Luồng chính:

1. Web lấy danh sách package và thông tin chuyển khoản.
2. Khách nhập email, mật khẩu, tên học viên, chọn package.
3. API tạo hoặc tìm parent account.
4. API tạo hoặc tìm child profile.
5. API tạo order `WAITING_PAYMENT` với mã nội dung chuyển khoản duy nhất.
6. Hệ thống gửi email hướng dẫn thanh toán.
7. Khách upload biên lai.
8. Order chuyển sang `PENDING_REVIEW`.
9. Operations duyệt ở UC-04.

### UC-03: Sale tạo đơn cho khách

Actor: sale, agency owner, agency manager, director, admin.

Luồng chính:

1. Actor nhập thông tin khách, gói, số tiền, thời hạn, invoice nếu có.
2. API kiểm tra duplicate pending order 48 giờ.
3. API tạo learner nếu email mới, hoặc dùng user học viên/phụ huynh hiện có.
4. API xác định channel attribution theo actor/referral/agency code.
5. API tạo order `PENDING_REVIEW`.
6. API audit thao tác.
7. Operations duyệt ở UC-04.

Ngoại lệ:

- Email thuộc internal account: không cho dùng làm learner.
- Referral/agency code không active: trả lỗi.

### UC-04: Operations duyệt đơn

Actor: operations, admin.

Luồng chính:

1. Actor mở order `PENDING_REVIEW`.
2. Actor kiểm tra biên lai sale/customer và thông tin chuyển khoản.
3. Actor upload operation invoice và nhập số ngày kích hoạt.
4. API tạo/gia hạn subscription theo child profile.
5. API set user `ACTIVE`.
6. API set order `APPROVED`, lưu `activatedAt`, `expiresAt`, `trialEndsAt`.
7. API tạo commission earning `PENDING` cho closer và upline.
8. Hệ thống gửi email approved.

Ngoại lệ:

- Thiếu operation invoice: không cho approve.
- Order không ở `PENDING_REVIEW`: không cho approve.
- Nếu từ chối, order chuyển `REJECTED`, lưu review notes, gửi email rejected.

### UC-05: Release commission sau trial

Actor: hệ thống cron.

Luồng chính:

1. Cron chạy mỗi giờ.
2. Tìm earning `PENDING` có `availableAt <= now`.
3. Nếu order vẫn `APPROVED`, chuyển earning thành `AVAILABLE`.
4. Tạo ledger `CREDIT`.
5. Nếu order không còn approved, chuyển earning thành `CANCELED`.

### UC-06: Tạo payout request

Actor: sale/agency/channel account.

Luồng chính:

1. Actor mở ví.
2. Nhập số tiền, ngân hàng, số tài khoản, tên tài khoản.
3. API xác định beneficiary theo participant hoặc agency.
4. API kiểm tra available balance.
5. API tạo payout request.
6. API tạo ledger `HOLD`.

Luồng operations:

1. Operations xem payout request.
2. Nếu pay, upload payout invoice.
3. API tạo ledger `RELEASE` và `DEBIT`, set payout `PAID`.
4. Nếu reject, API tạo `RELEASE`, set payout `REJECTED`.

### UC-07: Admin/content editor publish bài học

Actor: content editor, admin.

Luồng chính:

1. Tạo course/unit/lesson.
2. Gắn video hoặc tạo activity/question.
3. Gửi lesson sang `IN_REVIEW`.
4. Admin kiểm tra lesson.
5. API validate:
   - Lesson đang `IN_REVIEW`.
   - Có video hoặc activity.
   - Video ready.
   - Activity có question.
   - Question auto-grade có đáp án hợp lệ.
6. Admin publish.
7. Lesson thành `PUBLISHED`, course được đánh dấu published.

### UC-08: Teacher đóng góp lesson

Actor: teacher.

Luồng chính:

1. Teacher xem danh sách course/unit.
2. Tạo lesson draft trong unit.
3. Gắn video hoặc activity/question.
4. Submit review.
5. Admin tiếp tục review/publish bằng admin content flow.

Giới hạn:

- Teacher chỉ chỉnh lesson do mình tạo.
- Teacher không publish.
- Teacher grading chưa triển khai.

### UC-09: Học viên học video và làm practice

Actor: student hoặc parent đang thao tác cho child profile.

Luồng chính:

1. User mở learning home/video feed.
2. API kiểm tra learning access và subscription.
3. API kiểm tra screen time nếu child profile có bật limit.
4. User xem video.
5. Web gửi watch event, API ghi progress và usage.
6. User mở practice.
7. API trả question/answer công khai, không trả đáp án đúng.
8. User submit.
9. API tự chấm, lưu attempt, feedback và cập nhật progress.

Ngoại lệ:

- Hết daily limit: API từ chối học tiếp.
- Lesson/activity chưa publish: trả not found.
- Question type chưa auto-grade: trả lỗi.

### UC-10: Phụ huynh quản lý con

Actor: parent.

Luồng chính:

1. Parent tạo child profile.
2. Parent xem danh sách child, subscription, progress, insight.
3. Parent bật screen time và set daily limit.
4. Khi cần, parent cấp thêm thời gian trong ngày.
5. Parent xem báo cáo nhiều tuần.

## 10. API groups

| Nhóm API | Prefix | Mục đích |
| --- | --- | --- |
| Auth | `/v1/auth` | Register, login, forgot/reset password |
| Me | `/v1/me` | Profile, dashboard, my orders, change password |
| Catalog | `/v1/catalog` | Public catalog levels/courses/outline |
| Learning | `/v1/learning` | Home, video feed, watch, favorite, practice, attempt |
| Progress | `/v1/progress` | Progress list/summary/upsert giới hạn |
| Parent | `/v1/parent` | Children, screen time, grants, reports |
| Admin content | `/v1/admin/content` | Content CMS và publish |
| Teacher content | `/v1/teacher/content` | Teacher-owned draft lessons |
| Activation orders | `/v1/activation-orders` | Sale/admin order workflow |
| Self-service orders | `/v1/activation-orders/self-service` | Khách tự tạo order và upload proof |
| Channel admin | `/v1/channel-admin` | Agency, channel users, packages, policies, audit |
| Channel finance | `/v1/channel-finance` | Report, wallet, payout, CSV |
| Billing | `/v1/billing` | Plans, user subscription, wallet legacy |
| AI chat | `/v1/ai-chat` | AI chat mock session/message |
| Health | `/v1/health` | Health check |

## 11. Đánh giá hiện trạng

### 11.1 Điểm mạnh

- Domain backend tách module rõ, bám sát quy tắc trong `quytac.md`.
- Prisma schema bao phủ tương đối đầy đủ learning, parent, content, order, channel, finance.
- Có RBAC ở backend cho các endpoint quan trọng.
- Luồng tài chính chính dùng transaction và ledger, đúng hướng cho audit.
- Có audit log cho nhiều thao tác content, order, user, channel.
- Admin portal đã route-based, phù hợp vận hành thực tế hơn dashboard demo.
- Channel tree bằng `ChannelParticipant.lineage` đã giải quyết được subtree scope.
- Có cron job cho reminder, digest và release commission.

### 11.2 Hạn chế và rủi ro

| Mức độ | Vấn đề | Ảnh hưởng | Khuyến nghị |
| --- | --- | --- | --- |
| Cao | Payment vẫn là manual transfer, chưa có gateway/webhook/idempotency | Dễ phụ thuộc vận hành thủ công, khó scale | Tách rõ payment provider integration, webhook idempotency, reconciliation |
| Cao | Media upload local, chưa có object storage/CDN/signed URL | Rủi ro mất file, khó scale video | Chuyển sang storage private + CDN + signed URL |
| Cao | Teacher grading chưa triển khai dù đã có tài liệu | Khóa speaking/writing chưa vận hành được | Ưu tiên API pending assignments/grade/rubric/class assignment |
| Cao | AI chat chỉ mock | Chưa tạo giá trị AI thật, chưa kiểm soát chi phí | Tạo AI service boundary thật, entitlement, quota, logging prompt/model |
| Trung bình | Tồn tại song song AgencyMember và ChannelParticipant | Dễ lệch scope/commission/report | Lập kế hoạch migrate và cleanup legacy |
| Trung bình | `packages/shared` chưa đồng bộ với role/model thực tế | Web/API/mobile dễ lệch contract | Generate OpenAPI/types hoặc cập nhật shared contract chính thức |
| Trung bình | Frontend `/` quá lớn | Khó bảo trì và test | Tách thành feature modules/components theo domain |
| Trung bình | Chưa thấy refresh token/device session | Mobile/web session chưa hoàn chỉnh | Bổ sung refresh token, revoke theo device/session |
| Trung bình | Chưa có response envelope/error chuẩn thống nhất | Client khó xử lý lỗi nhất quán | Chuẩn hóa `code`, `message`, `details`, `requestId` |
| Thấp | Redis khai báo nhưng chưa dùng | Tăng độ nhiễu cấu hình | Xóa nếu chưa dùng hoặc ghi rõ mục đích |
| Thấp | Thiếu test frontend/e2e/contract | Dễ regression UI/luồng vận hành | Bổ sung smoke test theo role và order/content flows |

## 12. Đề xuất roadmap BA

### Phase 1: Chốt MVP vận hành trả phí

- Chốt mô hình account: parent/child là chuẩn chính hay student user độc lập.
- Hoàn thiện order approval, revoke, renewal, expired account rõ trạng thái.
- Viết tài liệu SOP cho operations: duyệt, từ chối, revoke, payout.
- Chuẩn hóa package, price, duration, refund/trial rule.
- Bổ sung smoke test cho login, self-service order, sale order, approve, learning access.

### Phase 2: Hardening production

- Đưa media sang object storage/CDN.
- Chuẩn hóa OpenAPI và sinh type frontend/mobile.
- Thêm refresh token, session/device management.
- Chuẩn hóa error response và request id.
- Tăng coverage test cho service tài chính, commission, payout, content publish.
- Tách frontend dashboard lớn thành module.
- Ap dung `docs/hoctap_minhhuong/production_hardening_go_live_gate.md` lam gate bat buoc: demo data matrix, role permission negative tests, E2E smoke matrix, deploy readiness gaps, rollback/backup/monitoring/audit evidence.
- Khong duoc ha chuan test de dat production readiness; moi thay doi test/acceptance phai co `TEST_STANDARD_CHANGE_REQUEST.md`.

### Phase 3: Teacher và learning nâng cao

- Xây Teacher grading:
  - Pending assignments.
  - Assignment detail.
  - Grade/feedback.
  - Rubric.
  - Class/teacher-student assignment.
- Cho phép publish speaking/writing khi grading sẵn sàng.
- Thêm learning analytics chi tiết hơn cho parent/teacher.

### Phase 4: AI và mobile

- Tích hợp AI provider thật sau service boundary.
- Entitlement/quota cho AI messages.
- Prompt/model versioning và cost control.
- Mobile app dùng chung API, auth, child profile, progress, catalog.
- Offline/cache/sync queue nếu business yêu cầu.

## 13. Nghiệp vụ cần chốt thêm

1. Một user có thể vừa là parent vừa là student hay phải tách rõ?
2. Mỗi parent có thể mua nhiều package cho nhiều child như thế nào?
3. Gia hạn subscription cộng dồn theo child profile hay theo user?
4. Sau 15 ngày trial có hoàn toàn không refund/clawback hay vẫn có ngoại lệ vận hành?
5. Channel participant có được đổi parent sau khi có order không?
6. Agency có nhiều staff không, hay agency owner là đại diện duy nhất?
7. Teacher được tạo nội dung vào mọi course/unit hay phải được phân quyền theo course?
8. Speaking/writing sẽ chấm thủ công, AI hỗ trợ hay AI tự chấm một phần?
9. Content đã publish có versioning/revision khi sửa đáp án chưa?
10. AI chat có nằm trong package premium riêng và có quota theo child hay theo parent?

## 14. Kết luận BA

Phần mềm hiện tại không chỉ là app học tiếng Anh đơn giản. Nó đang là một nền tảng vận hành doanh thu học tập gồm content CMS, learning portal, parent control, order activation, channel sales, commission ledger và payout. Thiết kế backend có nền tốt cho mở rộng, đặc biệt ở phần order, channel, finance và learning usage.

Ưu tiên tiếp theo nên là giảm rủi ro production: chuẩn hóa account/subscription, hoàn thiện media/payment, triển khai teacher grading nếu sản phẩm cần speaking/writing, và biến API contract thành nguồn dùng chung cho web/mobile. Sau khi các phần này ổn định, AI và mobile sẽ có nền tích hợp sạch hơn thay vì phải sửa lại core nghiệp vụ.
