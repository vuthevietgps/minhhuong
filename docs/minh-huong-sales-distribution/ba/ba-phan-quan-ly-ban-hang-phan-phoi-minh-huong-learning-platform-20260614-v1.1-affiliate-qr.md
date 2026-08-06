# BA triển khai nhánh Quản lý bán hàng và phân phối — Minh Huong Learning Platform

Ngày xuất bản: 2026-06-14  
Phiên bản: v1.0 tách nhánh cho coder  
Phạm vi: nhánh quản lý bán phần mềm/gói học, gồm package, giá, đơn hàng, thanh toán, activation, subscription, sale/agency/channel, hoa hồng, ví, payout, renewal, báo cáo và audit.  
Nguồn nền: `ba-current-software-assessment.md` và BA bổ sung tách 2 nhánh học tập/bán hàng.

---

## 1. Mục tiêu tài liệu

Tài liệu này dùng để giao riêng cho coder phụ trách nhánh **Quản lý bán hàng và phân phối phần mềm**. Mục tiêu là biến Minh Huong Learning Platform thành sản phẩm có thể bán, kích hoạt, gia hạn và phân phối qua nhiều kênh: self-service, sale nội bộ, agency, đối tác, referral.

Nhánh bán hàng phải trả lời 7 câu hỏi nghiệp vụ:

1. Khách mua gói nào, giá nào, quyền học gì?
2. Ai là người tạo đơn/gắn công bán hàng?
3. Tiền đã được xác nhận chưa?
4. Subscription của child/customer được kích hoạt/gia hạn thế nào?
5. Hoa hồng tính cho ai, theo chính sách nào, khi nào được rút?
6. Operations kiểm soát duyệt, từ chối, revoke, payout ra sao?
7. Admin/director xem được doanh thu, pipeline, hiệu quả kênh và rủi ro vận hành như thế nào?

Nguyên tắc sản phẩm: **nhánh bán hàng tạo dòng tiền và kênh phân phối, nhưng không được phá vỡ tính đúng đắn của quyền học/subscription và ledger tài chính**.

---

## 2. Phạm vi và không phạm vi

### 2.1 Trong phạm vi

- Quản lý package/gói học/gói phần mềm.
- Quản lý giá, duration, entitlement, trial/refund rule.
- Self-service order.
- Sale-assisted order.
- Manual bank transfer hiện tại và đường nâng cấp payment gateway.
- Operations review/approve/reject/revoke.
- Subscription activation/renewal/expiry.
- Channel hierarchy: director, manager, agency, sale.
- Referral/agency code và attribution.
- Commission policy, earning, release, clawback.
- Wallet ledger, payout request, payout approval/payment.
- Sales/finance report theo scope.
- Audit, status history, anti-duplicate, anti-fraud.

### 2.2 Ngoài phạm vi của file này

- Child learning home.
- Video immersion/game/AI Buddy chi tiết.
- Chi tiết attempt, skill progress, reward.
- Thiết kế giao diện học cho trẻ.
- Nội dung bài học, course/unit/lesson chi tiết.

Nhánh bán hàng chỉ cần tích hợp với nhánh học tập qua `Package`, `PackageEntitlement`, `Subscription`, `ChildProfile`, `LearningUsageSummary` và `AccessControl`.

---

## 3. Hiện trạng nền cần giữ

Hệ thống hiện có nhiều nền thương mại cần tận dụng:

| Nhóm | Entity/module hiện có | Cách dùng trong nhánh bán hàng |
|---|---|---|
| Identity/RBAC | `User`, `Role`, `UserRole`, guards | Phân quyền admin, operations, director, sale, agency |
| Billing | `Plan`, `Subscription`, `Payment`, `ActivationPackage` | Gói, quyền truy cập, thanh toán thủ công/legacy |
| Orders | `ActivationOrder` | Đơn kích hoạt từ self-service hoặc sale |
| Channel | `Agency`, `AgencyMember`, `ChannelParticipant`, `CommissionPolicy` | Đại lý, sale, cây phân phối, chính sách hoa hồng |
| Finance | `CommissionEarning`, `CommissionLedgerEntry`, `WalletLedgerEntry`, `PayoutRequest` | Hoa hồng, ví, payout |
| Audit | `AuditLog` | Lưu thao tác quan trọng |
| Notification | Email order lifecycle/reminder/digest | Gửi thông báo đơn hàng, gia hạn, duyệt/từ chối |

Luồng hiện tại đã có self-service order, sale-assisted order, approve/reject/revoke, commission pending sau khi order approved, release commission theo cron, payout request và report cơ bản. Cần chuẩn hóa để bán/phân phối bền hơn.

---

## 4. Định vị nhánh bán hàng/phân phối

Nhánh bán hàng là **Commercial Distribution Branch** gồm 7 lớp:

1. **Product & Pricing Layer**: gói, giá, quyền học, thời hạn.
2. **Customer & Lead Layer**: khách hàng, phụ huynh, child, lead, lịch sử chăm sóc.
3. **Order & Payment Layer**: đơn hàng, thanh toán, biên lai, đối soát.
4. **Subscription & Entitlement Layer**: kích hoạt/gia hạn/thu hồi quyền học.
5. **Channel & Attribution Layer**: sale/agency/referral/upline.
6. **Commission & Wallet Layer**: hoa hồng, ledger, ví, payout, clawback.
7. **Reporting & Audit Layer**: báo cáo, scope, audit, cảnh báo rủi ro.

Tuyệt đối không thiết kế kiểu “duyệt đơn xong sửa số dư trực tiếp”. Mọi phát sinh tài chính phải qua ledger/event có audit.

---

## 5. Actor và quyền trong nhánh bán hàng

| Actor | Mục tiêu | Chức năng cần có |
|---|---|---|
| CUSTOMER/PARENT | Mua/gia hạn gói | Chọn gói, tạo order, upload biên lai, xem trạng thái/gia hạn |
| SALE | Bán trực tiếp | Tạo đơn, xem khách của mình, theo dõi hoa hồng/ví |
| AGENCY_OWNER | Quản lý đại lý | Quản lý sale thuộc agency, đơn, doanh thu, payout agency |
| AGENCY_MANAGER | Quản lý nhánh | Quản lý subtree được phân quyền |
| DIRECTOR | Quản lý cấp cao | Xem report toàn hệ thống hoặc scope được phân quyền, tuyển/kích hoạt channel |
| OPERATIONS | Đối soát/duyệt | Duyệt/từ chối/revoke order, duyệt payout, upload invoice |
| ADMIN | Quản trị toàn hệ thống | Cấu hình package, chính sách, user/channel, audit |
| FINANCE | Kiểm tra tài chính | Đối soát tiền, payout, report, export |
| SUPPORT | Hỗ trợ khách | Tra cứu order/subscription, hỗ trợ gia hạn, không sửa tài chính nếu không có quyền |
| SYSTEM_CRON | Tự động hóa | Expiry reminder, commission release, renewal opportunity, report snapshot |

---

## 6. Nguyên tắc nghiệp vụ bắt buộc

1. **Order là nguồn nghiệp vụ bán hàng chính**: mọi kích hoạt/gia hạn phải trace được về order hoặc migration rõ ràng.
2. **Subscription là nguồn quyền học chính**: learning branch chỉ đọc subscription/entitlement, không tự mở khóa học.
3. **Payment phải idempotent**: một giao dịch/biên lai/webhook không được tạo nhiều order/activation.
4. **Commission tính theo policy version tại thời điểm approve order**: không bị thay đổi ngược khi admin đổi chính sách.
5. **Không sửa số dư ví trực tiếp**: mọi thay đổi qua ledger entry.
6. **Payout phải có trạng thái và chứng từ**: pending, approved/rejected, paid/canceled.
7. **Revoke/refund phải xử lý clawback**: thu hồi quyền học và hoa hồng chưa/đã release nếu chính sách yêu cầu.
8. **Scope dữ liệu theo channel subtree**: sale/agency chỉ xem dữ liệu thuộc scope của mình.
9. **Mọi hành động tài chính có audit**: ai làm, lúc nào, lý do, trước/sau.
10. **Nhánh bán hàng không được đọc chi tiết riêng tư học tập quá mức**: chỉ dùng usage summary/customer health phục vụ renewal/chăm sóc.

---

## 7. Mô hình dữ liệu đề xuất

### 7.1 Entity hiện có cần rà soát/mở rộng

| Entity | Việc cần làm |
|---|---|
| `ActivationPackage` | Chuẩn hóa thành package thương mại; nếu đổi tên cần migration rõ |
| `Plan` | Phân biệt plan kỹ thuật/subscription với package bán hàng nếu cần |
| `Subscription` | Gắn rõ `childProfileId`, `packageId`, `sourceOrderId`, `startsAt`, `expiresAt`, `status` |
| `Payment` | Làm rõ vai trò: legacy, provider transaction hay đối soát |
| `ActivationOrder` | Thêm status history, payment reference, attribution snapshot, entitlement snapshot |
| `ChannelParticipant` | Là source chính cho hierarchy; cần roadmap cleanup `AgencyMember` legacy |
| `CommissionPolicy` | Cần versioning và effective date |
| `CommissionEarning` | Gắn policy version, order line, release/clawback status |
| `WalletLedgerEntry` | Chuẩn hóa loại entry, balance snapshot nếu cần |
| `PayoutRequest` | Thêm approval/payment proof/status history nếu chưa đủ |
| `AuditLog` | Bắt buộc cho package/order/channel/commission/payout |

### 7.2 Entity mới P0/P1/P2

#### `ProductPackage`

Nếu giữ `ActivationPackage`, có thể coi đây là tên nghiệp vụ mới. Nếu coder chưa muốn rename, có thể bổ sung field vào `ActivationPackage`.

| Field | Ý nghĩa |
|---|---|
| `id` | ID gói |
| `code` | Mã gói duy nhất |
| `name` | Tên gói |
| `description` | Mô tả bán hàng |
| `durationDays` | Thời hạn mặc định |
| `basePrice` | Giá niêm yết |
| `currency` | VND mặc định |
| `status` | `DRAFT`, `ACTIVE`, `ARCHIVED` |
| `isPublic` | Có hiện self-service không |
| `createdAt`, `updatedAt` | Audit time |

#### `PackageEntitlement`

Định nghĩa quyền học/tính năng theo gói.

| Field | Ý nghĩa |
|---|---|
| `packageId` | Gói |
| `entitlementKey` | `COURSE_ACCESS`, `AI_MESSAGES`, `CHILD_COUNT`, `DAILY_MINUTES`, `TEACHER_GRADING`, `OFFLINE` |
| `valueJson` | Giá trị quyền: list course, quota, boolean, limit |
| `startsPolicy` | Có hiệu lực ngay hay sau trial |
| `status` | Active/disabled |

#### `PriceBook` và `PriceBookItem`

Quản lý nhiều bảng giá theo kênh/thời gian.

| Entity | Ý nghĩa |
|---|---|
| `PriceBook` | Bảng giá: public, agency, promotion, campaign |
| `PriceBookItem` | Giá từng package trong bảng giá, effective date, channel scope |

#### `Lead`

Khách tiềm năng trước khi thành order.

| Field | Ý nghĩa |
|---|---|
| `id` | ID lead |
| `parentName`, `phone`, `email` | Thông tin liên hệ |
| `childName`, `childAge` | Thông tin học viên tiềm năng |
| `source` | Facebook, Google, referral, agency, manual |
| `ownerParticipantId` | Sale/agency phụ trách |
| `status` | `NEW`, `CONTACTED`, `TRIAL`, `ORDER_CREATED`, `WON`, `LOST` |
| `notes` | Ghi chú chăm sóc |

#### `ReferralCode`

| Field | Ý nghĩa |
|---|---|
| `code` | Mã giới thiệu |
| `participantId` | Sale/agency/director sở hữu |
| `packageScope` | Gói được áp dụng |
| `status` | Active/disabled |
| `expiresAt` | Hết hạn nếu có |

#### `SalesAttributionSnapshot`

Chốt công bán hàng tại thời điểm tạo/approve order.

| Field | Ý nghĩa |
|---|---|
| `orderId` | Order |
| `closerParticipantId` | Người chốt |
| `agencyId` | Agency liên quan |
| `uplineJson` | Chuỗi upline snapshot |
| `source` | self-service/sale/referral/agency |
| `capturedAt` | Thời điểm chốt snapshot |

#### `PaymentTransaction`

Dùng cho payment gateway hoặc đối soát chuyển khoản.

| Field | Ý nghĩa |
|---|---|
| `id` | ID giao dịch |
| `orderId` | Order liên quan |
| `provider` | manual_bank, vnpay, momo, stripe... |
| `providerTransactionId` | ID từ provider |
| `amount` | Số tiền |
| `status` | `PENDING`, `SUCCEEDED`, `FAILED`, `REFUNDED`, `DUPLICATED` |
| `idempotencyKey` | Chống ghi trùng |
| `rawPayloadJson` | Payload gốc |

#### `PaymentWebhookEvent`

| Field | Ý nghĩa |
|---|---|
| `provider` | Cổng thanh toán |
| `eventId` | ID event provider |
| `eventType` | Loại event |
| `payloadJson` | Payload |
| `processedAt` | Đã xử lý |
| `processingStatus` | success/error/skipped |

#### `ReconciliationBatch`

Đối soát nhiều giao dịch thủ công/provider.

| Field | Ý nghĩa |
|---|---|
| `id` | Batch |
| `source` | bank statement/provider export/manual |
| `periodStart`, `periodEnd` | Khoảng đối soát |
| `status` | draft/reviewed/closed |
| `summaryJson` | Tổng hợp |

#### `OrderStatusHistory`

| Field | Ý nghĩa |
|---|---|
| `orderId` | Order |
| `fromStatus`, `toStatus` | Trạng thái trước/sau |
| `actorUserId` | Người thao tác |
| `reason` | Lý do |
| `metadataJson` | Dữ liệu liên quan |

#### `CommissionPolicyVersion`

| Field | Ý nghĩa |
|---|---|
| `policyId` | Policy cha |
| `version` | Phiên bản |
| `effectiveFrom`, `effectiveTo` | Hiệu lực |
| `rulesJson` | Công thức tính |
| `status` | draft/active/archived |

#### `CommissionClawbackEntry`

| Field | Ý nghĩa |
|---|---|
| `earningId` | Earning bị thu hồi |
| `orderId` | Order liên quan |
| `reason` | refund/revoke/fraud/manual adjustment |
| `amount` | Số tiền thu hồi |
| `status` | pending/applied/waived |

#### `RenewalOpportunity`

| Field | Ý nghĩa |
|---|---|
| `childProfileId` | Child/subscription cần gia hạn |
| `parentUserId` | Phụ huynh |
| `currentSubscriptionId` | Subscription hiện tại |
| `ownerParticipantId` | Sale/agency phụ trách |
| `stage` | due_soon/contacted/order_created/renewed/lost |
| `dueDate` | Ngày hết hạn |
| `healthScore` | Điểm sức khỏe khách hàng |

---

## 8. Module chức năng chi tiết

### 8.1 Package, pricing và entitlement

Mục tiêu: admin cấu hình được gói bán ra và quyền học tương ứng.

Yêu cầu:

- Tạo/sửa/archive package.
- Package có duration, price, public/private, package code.
- Package có entitlement: khóa học, số child, AI quota, giới hạn ngày/phút, teacher grading.
- Có bảng giá theo kênh/campaign nếu cần.
- Khi order tạo ra, snapshot giá/quyền phải được lưu để sau này đổi package không làm sai đơn cũ.

API đề xuất:

| Method | Endpoint | Mục đích |
|---|---|---|
| GET | `/v1/admin/packages` | Danh sách package |
| POST | `/v1/admin/packages` | Tạo package |
| PATCH | `/v1/admin/packages/:id` | Sửa package |
| POST | `/v1/admin/packages/:id/archive` | Ngừng bán |
| PUT | `/v1/admin/packages/:id/entitlements` | Cập nhật quyền gói |
| GET | `/v1/public/packages` | Gói public cho self-service |

Acceptance criteria:

- Không xóa cứng package đã có order.
- Package archived không tạo order mới nhưng order cũ vẫn tra cứu được.
- Entitlement snapshot được lưu tại order/subscription.

### 8.2 Lead và customer management

Mục tiêu: quản lý khách trước và sau khi tạo đơn.

Yêu cầu P1:

- Tạo lead từ sale/agency/admin.
- Gắn lead owner theo channel participant.
- Chuyển lead thành order.
- Theo dõi stage chăm sóc.
- Tìm kiếm theo phone/email/child name.

API đề xuất:

| Method | Endpoint | Mục đích |
|---|---|---|
| GET | `/v1/sales/leads` | Danh sách lead theo scope |
| POST | `/v1/sales/leads` | Tạo lead |
| PATCH | `/v1/sales/leads/:id` | Cập nhật lead |
| POST | `/v1/sales/leads/:id/create-order` | Chuyển thành order |

Acceptance criteria:

- Sale chỉ xem lead thuộc mình/scope.
- Trùng phone/email phải cảnh báo.
- Lead chuyển order phải giữ attribution.

### 8.3 Self-service order

Mục tiêu: parent tự mua gói.

Luồng P0:

1. Parent/khách xem package public.
2. Nhập thông tin parent/child, chọn package.
3. API tạo/fetch parent account và child profile.
4. Tạo order `WAITING_PAYMENT`.
5. Sinh mã chuyển khoản/payment content duy nhất.
6. Khách upload proof.
7. Order chuyển `PENDING_REVIEW`.
8. Operations duyệt.

API đề xuất:

| Method | Endpoint | Mục đích |
|---|---|---|
| GET | `/v1/activation-orders/self-service/options` | Gói + thông tin thanh toán |
| POST | `/v1/activation-orders/self-service` | Tạo order |
| POST | `/v1/activation-orders/self-service/:id/payment-proof` | Upload proof |
| GET | `/v1/me/orders` | Khách xem đơn của mình |

Acceptance criteria:

- Không tạo nhiều pending order trùng email/child/package trong thời gian ngắn nếu chưa cần.
- Payment code duy nhất.
- Upload proof không tự approve.
- Email hướng dẫn thanh toán gửi được hoặc log rõ nếu SMTP chưa cấu hình.

### 8.4 Sale-assisted order

Mục tiêu: sale/agency tạo đơn cho khách.

Luồng P0:

1. Sale nhập thông tin khách/child/package/amount.
2. API kiểm tra quyền sale và scope.
3. API kiểm tra duplicate pending order.
4. API tạo/fetch customer/learner.
5. API chụp attribution snapshot.
6. Order vào `PENDING_REVIEW` hoặc `WAITING_PAYMENT` tùy policy.
7. Operations duyệt.

API đề xuất:

| Method | Endpoint | Mục đích |
|---|---|---|
| POST | `/v1/activation-orders` | Sale/admin tạo order |
| GET | `/v1/activation-orders` | Danh sách order theo scope |
| GET | `/v1/activation-orders/:id` | Chi tiết order |
| PATCH | `/v1/activation-orders/:id` | Cập nhật trước khi duyệt nếu được phép |

Acceptance criteria:

- Sale không tạo đơn bằng email internal account.
- Order lưu creator, channel participant, agency/referral nếu có.
- Amount/duration khác package chuẩn phải có quyền hoặc lý do.

### 8.5 Operations review, approve, reject, revoke

Mục tiêu: kiểm soát tiền và quyền học trước/sau kích hoạt.

Trạng thái order chuẩn:

| Status | Ý nghĩa |
|---|---|
| `WAITING_PAYMENT` | Chờ khách thanh toán/upload proof |
| `PENDING_REVIEW` | Đang chờ operations/admin duyệt |
| `APPROVED` | Đã kích hoạt subscription |
| `REJECTED` | Bị từ chối, có thể resubmit theo quyền |
| `CANCELED` | Hủy trước khi kích hoạt |
| `REVOKED` | Thu hồi quyền sau kích hoạt |
| `REFUNDED` | Hoàn tiền nếu triển khai refund |

Yêu cầu:

- Approve bắt buộc có chứng cứ thanh toán/operation invoice theo policy hiện tại.
- Approve phải chạy trong transaction.
- Approve tạo/gia hạn subscription đúng child.
- Approve tạo commission earning pending theo policy version.
- Reject lưu lý do.
- Revoke thu hồi quyền học và xử lý earning/clawback theo chính sách.
- Mọi đổi status ghi `OrderStatusHistory` và `AuditLog`.

API đề xuất:

| Method | Endpoint | Mục đích |
|---|---|---|
| POST | `/v1/activation-orders/:id/approve` | Duyệt/kích hoạt |
| POST | `/v1/activation-orders/:id/reject` | Từ chối |
| POST | `/v1/activation-orders/:id/cancel` | Hủy |
| POST | `/v1/activation-orders/:id/revoke` | Thu hồi sau kích hoạt |
| GET | `/v1/activation-orders/:id/status-history` | Lịch sử trạng thái |

Acceptance criteria:

- Không approve order không ở trạng thái hợp lệ.
- Không approve thiếu invoice/proof nếu policy bắt buộc.
- Approve lặp lại không tạo subscription/commission trùng.
- Revoke không xóa dữ liệu học, chỉ thu hồi quyền truy cập tương lai.

### 8.6 Subscription và renewal

Mục tiêu: quyền học rõ ràng, gia hạn không sai.

Yêu cầu:

- Subscription gắn child profile là chuẩn chính.
- Nếu gia hạn trước khi hết hạn, cộng dồn từ `max(now, currentExpiresAt)`.
- Nếu đã hết hạn, start từ ngày approve/gia hạn.
- Mỗi subscription phải trace được order nguồn.
- Có trạng thái `TRIALING`, `ACTIVE`, `EXPIRED`, `CANCELED`, `REVOKED`.
- Cron nhắc gia hạn trước 7 ngày, 3 ngày, ngày hết hạn.
- Tạo renewal opportunity cho sale/agency phụ trách nếu có.

API đề xuất:

| Method | Endpoint | Mục đích |
|---|---|---|
| GET | `/v1/admin/subscriptions` | Admin xem subscription |
| GET | `/v1/parent/children/:childId/subscription` | Parent xem subscription con |
| POST | `/v1/subscriptions/:id/renewal-order` | Tạo order gia hạn |
| POST | `/v1/admin/subscriptions/:id/revoke` | Thu hồi quyền nếu cần |

Acceptance criteria:

- Learning access guard chỉ dựa vào subscription/entitlement hợp lệ.
- Gia hạn không làm mất ngày còn lại.
- Hết hạn tự cập nhật hoặc access guard xử lý nhất quán.

### 8.7 Channel hierarchy và scope

Mục tiêu: quản lý phân phối theo cây director/manager/agency/sale.

Yêu cầu:

- `ChannelParticipant` là mô hình chính.
- Có `parentParticipantId`, `rootParticipantId`, `lineage`, `depth`.
- Rule tuyển:
  - Director tuyển manager, agency, sale.
  - Manager tuyển agency, sale.
  - Agency tuyển sale.
  - Sale không tuyển.
- Query report/order/customer theo subtree.
- Nếu vẫn giữ `AgencyMember`, phải có migration/compatibility rõ.

API đề xuất:

| Method | Endpoint | Mục đích |
|---|---|---|
| GET | `/v1/channel-admin/participants` | Cây channel |
| POST | `/v1/channel-admin/participants` | Tạo participant/user |
| PATCH | `/v1/channel-admin/participants/:id` | Sửa trạng thái/scope |
| POST | `/v1/channel-admin/participants/:id/reset-password` | Reset password |
| GET | `/v1/channel-admin/participants/:id/subtree` | Xem subtree |

Acceptance criteria:

- Sale/agency không xem được dữ liệu ngoài subtree.
- Đổi parent participant sau khi đã có order phải bị chặn hoặc có quy trình migration đặc biệt.
- Mọi thay đổi hierarchy ghi audit.

### 8.8 Commission policy, earning và release

Mục tiêu: hoa hồng minh bạch và kiểm soát được.

Yêu cầu:

- Chính sách hoa hồng có version.
- Khi order approve, tính earning theo policy version active tại thời điểm đó.
- Lưu snapshot upline và công thức tính.
- Earning ban đầu `PENDING`.
- Sau trial/hold period, cron chuyển `AVAILABLE` nếu order vẫn hợp lệ.
- Nếu order revoke/refund trước release, earning `CANCELED`.
- Nếu đã release rồi mới refund/revoke, tạo clawback theo policy.

API đề xuất:

| Method | Endpoint | Mục đích |
|---|---|---|
| GET | `/v1/channel-admin/commission-policies` | Danh sách policy |
| POST | `/v1/channel-admin/commission-policies` | Tạo policy |
| POST | `/v1/channel-admin/commission-policies/:id/versions` | Tạo version |
| POST | `/v1/channel-finance/commission/release-due` | Manual trigger nếu cần |
| GET | `/v1/channel-finance/earnings` | Earning theo scope |

Acceptance criteria:

- Đổi policy mới không làm đổi earning order cũ.
- Cron release idempotent, chạy lại không tạo ledger trùng.
- Có test cho order approved → pending earning → available → ledger credit.

### 8.9 Wallet và payout

Mục tiêu: sale/agency rút tiền minh bạch, operations kiểm soát được.

Yêu cầu:

- Available balance tính từ ledger, không lưu số dư tùy tiện.
- Khi tạo payout request, tạo ledger `HOLD`.
- Khi payout paid, tạo `RELEASE` và `DEBIT` hoặc mô hình ledger tương đương nhưng phải giải thích được.
- Khi reject, release hold.
- Payout paid bắt buộc có invoice/proof nếu policy yêu cầu.
- Có payout status history.

API đề xuất:

| Method | Endpoint | Mục đích |
|---|---|---|
| GET | `/v1/channel-finance/wallet` | Ví của user/agency |
| GET | `/v1/channel-finance/wallet/ledger` | Ledger entries |
| POST | `/v1/channel-finance/payout-requests` | Tạo yêu cầu rút |
| POST | `/v1/channel-finance/payout-requests/:id/approve` | Duyệt payout |
| POST | `/v1/channel-finance/payout-requests/:id/reject` | Từ chối |
| POST | `/v1/channel-finance/payout-requests/:id/mark-paid` | Đánh dấu đã trả |

Acceptance criteria:

- Không request payout vượt available balance.
- Không paid payout chưa approved nếu policy bắt buộc approve.
- Không paid lặp tạo double debit.
- Tất cả entry có reference rõ: earning/order/payout.

### 8.10 Payment gateway và reconciliation

Mục tiêu: nâng cấp từ chuyển khoản thủ công sang tự động có đối soát.

P0:

- Giữ manual bank transfer/upload proof.
- Chuẩn hóa payment code và operation invoice.
- Thêm idempotency ở order approve/payment proof nếu thiếu.

P2:

- Tích hợp provider qua `PaymentTransaction` và `PaymentWebhookEvent`.
- Webhook idempotent.
- Tự chuyển order sang `PENDING_REVIEW` hoặc auto-approve nếu policy cho phép.
- Đối soát bank/provider bằng batch.

Acceptance criteria:

- Webhook cùng event gửi lại nhiều lần không tạo nhiều payment/order.
- Số tiền lệch package phải đưa vào trạng thái review.
- Có raw payload để trace.

### 8.11 Report và dashboard thương mại

Mục tiêu: quản lý bán hàng nhìn được doanh thu và hiệu quả kênh.

Report P0:

- Order pipeline theo status.
- Approved revenue.
- Doanh thu theo package.
- Doanh thu theo sale/agency/channel.
- Pending payout/paid payout.
- Commission pending/available/paid.
- Renewal due soon.

Report P1/P2:

- Conversion lead → order → approved.
- CAC nếu gắn ads/source sau này.
- Customer health score từ usage summary.
- Churn/renewal rate.
- Export CSV theo scope.

API đề xuất:

| Method | Endpoint | Mục đích |
|---|---|---|
| GET | `/v1/channel-finance/report` | Báo cáo finance hiện có/mở rộng |
| GET | `/v1/channel-finance/report/orders` | Pipeline order |
| GET | `/v1/channel-finance/report/commissions` | Hoa hồng |
| GET | `/v1/channel-finance/report/renewals` | Gia hạn |
| GET | `/v1/channel-finance/export/approved-orders.csv` | Export CSV |

Acceptance criteria:

- Report tôn trọng scope user.
- Số liệu doanh thu khớp order approved.
- Số liệu payout khớp ledger/payout status.

---

## 9. Luồng nghiệp vụ chính

### UC-S01: Admin tạo package bán hàng

1. Admin tạo package code, tên, giá, duration.
2. Admin cấu hình entitlement: course access, AI quota, child count.
3. Admin bật public/private.
4. Package xuất hiện ở self-service hoặc chỉ sale thấy tùy cấu hình.
5. Audit ghi thao tác.

### UC-S02: Khách tự mua gói

1. Khách vào trang mua gói.
2. Chọn package.
3. Nhập thông tin parent/child.
4. Tạo order `WAITING_PAYMENT`.
5. Hệ thống sinh mã chuyển khoản.
6. Khách upload proof.
7. Order chuyển `PENDING_REVIEW`.
8. Operations approve.
9. Subscription được kích hoạt.
10. Email gửi thông báo.

### UC-S03: Sale tạo đơn

1. Sale nhập khách/child/package/amount.
2. Hệ thống kiểm tra duplicate.
3. Hệ thống gắn attribution theo sale/upline.
4. Order vào `PENDING_REVIEW`.
5. Operations duyệt.
6. Commission pending được tạo cho sale/upline.

### UC-S04: Operations approve order

1. Operations mở order.
2. Kiểm tra proof/invoice/số tiền.
3. Bấm approve.
4. Transaction thực hiện:
   - update order approved;
   - create/extend subscription;
   - activate user nếu cần;
   - create commission earnings;
   - write audit/status history.
5. Email gửi khách/sale nếu cần.

### UC-S05: Reject/cancel/revoke order

- Reject: order chưa approved, lưu lý do, có thể resubmit nếu policy cho phép.
- Cancel: hủy trước approve, không tạo subscription/commission.
- Revoke: order đã approved, thu hồi quyền, xử lý commission/clawback, ghi audit.

### UC-S06: Release commission sau trial/hold period

1. Cron chạy theo lịch.
2. Tìm earning pending tới hạn.
3. Kiểm tra order còn approved và không refund/revoke.
4. Chuyển earning available.
5. Tạo wallet ledger credit.
6. Nếu không hợp lệ, cancel earning.

### UC-S07: Sale/agency tạo payout request

1. User mở ví.
2. Xem available balance.
3. Nhập số tiền và tài khoản nhận.
4. Hệ thống tạo payout request + hold ledger.
5. Operations duyệt/trả.
6. Nếu paid, ledger debit; nếu reject, release hold.

### UC-S08: Renewal pipeline

1. Cron tìm subscription sắp hết hạn.
2. Tạo renewal opportunity.
3. Gắn owner theo attribution/order cũ nếu có.
4. Sale/agency liên hệ khách.
5. Tạo order gia hạn.
6. Approve order gia hạn cộng dồn thời hạn subscription.

### UC-S09: Quản lý channel

1. Director/admin tạo manager/agency/sale.
2. Hệ thống tạo channel participant với lineage.
3. User đăng nhập chỉ thấy dữ liệu theo scope.
4. Khi sale tạo order, attribution theo participant.
5. Report/commission tính theo subtree.

---

## 10. API groups đề xuất

| Nhóm API | Prefix đề xuất | Ghi chú |
|---|---|---|
| Public packages | `/v1/public/packages` | Cho trang mua gói |
| Admin packages | `/v1/admin/packages` | Quản lý package/entitlement |
| Self-service orders | `/v1/activation-orders/self-service` | Khách tự mua/upload proof |
| Sales orders | `/v1/activation-orders` | Sale/admin tạo và xem order |
| Operations order actions | `/v1/activation-orders/:id/*` | Approve/reject/cancel/revoke |
| Subscriptions | `/v1/subscriptions` | Xem/gia hạn/thu hồi quyền |
| Channel admin | `/v1/channel-admin` | Participant, agency, users, policies |
| Channel finance | `/v1/channel-finance` | Report, wallet, payout, commission |
| Leads/CRM | `/v1/sales/leads` | P1 nếu triển khai CRM nhẹ |
| Payment/reconciliation | `/v1/payments`, `/v1/payment-webhooks` | P2 payment gateway |
| Renewal | `/v1/renewals` | Cơ hội gia hạn |
| Audit | `/v1/admin/audit` | Audit log |

---

## 11. Contract với nhánh học tập

Nhánh bán hàng không được can thiệp trực tiếp vào learning progress. Hai nhánh giao tiếp qua các contract sau:

### 11.1 Package entitlement contract

Khi package được tạo/sửa, cần mô tả quyền học:

```json
{
  "packageCode": "ENGLISH_BASIC_12M",
  "durationDays": 365,
  "entitlements": {
    "courseAccess": ["ENGLISH_LEVEL_A", "ENGLISH_LEVEL_B"],
    "childCount": 1,
    "aiMessagesPerMonth": 300,
    "dailyStudyMinutes": 30,
    "teacherGrading": false,
    "offlineAccess": false
  }
}
```

### 11.2 Subscription/access contract

Learning branch cần API/logic trả lời:

- Child có subscription active không?
- Child được học course/lesson nào?
- Child còn AI quota không?
- Child có quyền teacher grading/offline không?
- Gói hết hạn khi nào?

### 11.3 Usage summary for renewal

Sales branch chỉ nên nhận dữ liệu tổng hợp:

```json
{
  "childProfileId": "...",
  "last7DaysStudyMinutes": 120,
  "last7DaysActiveDays": 5,
  "lastLessonAt": "...",
  "healthScore": 78,
  "renewalRisk": "LOW"
}
```

Không cần đọc chi tiết toàn bộ hội thoại AI hoặc đáp án bài tập của trẻ nếu không có lý do nghiệp vụ rõ ràng.

---

## 12. Acceptance checklist tổng

### 12.1 P0 — MVP bán hàng vận hành trả phí

- [ ] Admin tạo/sửa/archive package.
- [ ] Package có duration, price, entitlement cơ bản.
- [ ] Self-service order hoạt động.
- [ ] Sale-assisted order hoạt động.
- [ ] Duplicate pending order guard hoạt động.
- [ ] Operations approve/reject/cancel/revoke hoạt động.
- [ ] Approve tạo/gia hạn subscription đúng child.
- [ ] Approve tạo commission earning pending.
- [ ] Cron release commission idempotent.
- [ ] Wallet/payout request hoạt động.
- [ ] Report order/revenue/commission/payout theo scope.
- [ ] Audit/status history cho thao tác quan trọng.
- [ ] Smoke test: self-service order → approve → learning access.
- [ ] Smoke test: sale order → approve → commission → payout.

### 12.2 P1 — Chuẩn hóa phân phối

- [ ] `ChannelParticipant` là source chính; có migration/cleanup `AgencyMember` legacy.
- [ ] Commission policy có version.
- [ ] Referral code hoạt động.
- [ ] Renewal opportunity hoạt động.
- [ ] Lead CRM nhẹ hoạt động.
- [ ] Report conversion/renewal theo scope.

### 12.3 P2 — Payment tự động và đối soát

- [ ] `PaymentTransaction` và `PaymentWebhookEvent` có idempotency.
- [ ] Webhook provider hoạt động ở sandbox.
- [ ] Reconciliation batch import/đối soát được.
- [ ] Lệch tiền/lệch order vào trạng thái manual review.
- [ ] Refund/revoke/clawback có flow rõ.

### 12.4 P3 — Scale vận hành

- [ ] Payout batch.
- [ ] Balance snapshot/report tài chính nhanh.
- [ ] SLA dashboard cho operations.
- [ ] Advanced anti-fraud/duplicate detection.
- [ ] Export accounting/report cho kế toán.

---

## 13. Test cases ưu tiên cho coder

| Test | Kỳ vọng |
|---|---|
| Tạo package active | Package xuất hiện đúng kênh |
| Archive package đã có order | Không xóa order cũ, không tạo order mới |
| Self-service tạo order | Status `WAITING_PAYMENT`, có payment code |
| Upload proof | Status sang `PENDING_REVIEW` |
| Approve thiếu invoice nếu bắt buộc | Bị chặn |
| Approve order hợp lệ | Tạo subscription + commission pending |
| Approve lặp lại | Không tạo subscription/commission trùng |
| Sale xem order ngoài scope | Bị chặn |
| Commission release cron chạy 2 lần | Không tạo double credit |
| Order revoked trước release | Earning canceled |
| Order revoked sau release | Tạo clawback theo policy |
| Payout vượt available | Bị chặn |
| Paid payout lặp lại | Không double debit |
| Subscription gia hạn còn hạn | Cộng dồn đúng ngày |
| Subscription hết hạn | Access guard không cho học premium |

---

## 14. Gợi ý thứ tự giao việc cho coder

### Sprint S1 — Stabilize commercial MVP hiện có

1. Rà soát `ActivationPackage`, `ActivationOrder`, `Subscription`.
2. Chốt status transition order.
3. Thêm/chuẩn hóa `OrderStatusHistory` nếu chưa có.
4. Viết test self-service order và sale order.
5. Viết test approve tạo subscription.

### Sprint S2 — Commission/wallet/payout hardening

1. Rà soát commission earning hiện tại.
2. Đảm bảo release cron idempotent.
3. Chuẩn hóa wallet ledger.
4. Thêm test payout hold/release/debit.
5. Viết tài liệu giải thích available/held balance.

### Sprint S3 — Channel hierarchy cleanup

1. Chọn `ChannelParticipant` làm source chính.
2. Rà soát mọi query scope dùng lineage.
3. Lập migration/compat layer cho `AgencyMember`.
4. Test director/manager/agency/sale scope.

### Sprint S4 — Package entitlement + renewal

1. Thêm entitlement vào package.
2. Snapshot entitlement vào order/subscription.
3. Tạo renewal opportunity.
4. Gắn renewal với owner participant.
5. Tạo report gia hạn.

### Sprint S5 — Payment gateway/reconciliation

1. Thêm `PaymentTransaction`.
2. Thêm webhook event table.
3. Làm provider sandbox hoặc manual provider chuẩn hóa.
4. Thêm idempotency.
5. Làm reconciliation batch.

---

## 15. Rủi ro và lưu ý kỹ thuật

| Rủi ro | Ảnh hưởng | Cách xử lý |
|---|---|---|
| Trộn `AgencyMember` và `ChannelParticipant` | Lệch scope/commission | Chọn source chính, migration rõ |
| Đổi commission policy làm sai order cũ | Tranh chấp hoa hồng | Policy version + snapshot |
| Approve order không idempotent | Double subscription/commission | Transaction + unique reference |
| Sửa ví trực tiếp | Sai tài chính | Chỉ qua ledger |
| Không lưu order status history | Khó xử lý khiếu nại | Bắt buộc history/audit |
| Payment manual scale kém | Operations quá tải | Chuẩn hóa trước, gateway sau |
| Sales branch đọc quá nhiều dữ liệu học | Rủi ro riêng tư | Chỉ nhận usage summary |
| Revoke không clawback | Lỗ tài chính | Clawback flow |
| Report không theo scope | Lộ dữ liệu kênh khác | Test RBAC/scope nghiêm |

---

## 16. Câu hỏi nghiệp vụ cần chốt

1. Package bán theo child hay theo parent/family?
2. Một parent mua nhiều child thì tính giá thế nào?
3. Có trial miễn phí không? Trial ảnh hưởng commission thế nào?
4. Sau bao nhiêu ngày thì commission được release?
5. Refund/revoke sau khi đã trả hoa hồng xử lý clawback thế nào?
6. Agency có ví riêng hay owner đại diện ví agency?
7. Agency có nhiều staff không?
8. Sale có được tự giảm giá/sửa duration không?
9. Payment gateway nào sẽ dùng trước?
10. Có cần hóa đơn VAT/kế toán chính thức ngay không?
11. Renewal thuộc sale cũ, agency cũ hay hệ thống phân lại?
12. Nếu khách tự mua bằng referral code thì commission tính thế nào?
13. Có giới hạn payout tối thiểu/tối đa theo kỳ không?
14. Có cần hợp đồng/điều khoản cho đại lý trong hệ thống không?
15. Admin có được sửa order sau approve không, hay phải dùng adjustment/revoke?

---

## 17. Định nghĩa hoàn thành nhánh bán hàng

Nhánh quản lý bán hàng/phân phối được coi là đạt MVP thương mại khi:

- Admin cấu hình được gói bán và quyền học.
- Khách tự mua hoặc sale tạo đơn được.
- Operations duyệt đơn và kích hoạt subscription đúng child.
- Learning branch đọc subscription/entitlement để mở quyền học.
- Sale/agency được gắn attribution và hoa hồng rõ ràng.
- Commission pending → available → wallet/payout có ledger/audit.
- Director/admin xem được doanh thu, order pipeline, payout, commission theo scope.
- Revoke/reject/cancel không làm sai quyền học hoặc số dư tài chính.
- Coder có smoke test đủ cho order → subscription → commission → payout.

---

## 18. Bổ sung BA v1.1 — Affiliate link, QR affiliate và install/order attribution

### 18.1 Mục tiêu

Bổ sung cơ chế để sale, đại lý, agency hoặc đối tác phân phối có thể tạo **affiliate link** và **QR affiliate** gửi cho khách hàng cuối cùng. Khi khách truy cập link hoặc quét QR để tải/cài app, đăng ký, tạo đơn và thanh toán, hệ thống phải ghi nhận được nguồn phân phối tương ứng để tính doanh thu, hoa hồng, renewal ownership và báo cáo hiệu quả kênh.

Nguyên tắc quan trọng: **install/download chỉ là tín hiệu attribution, không phải doanh thu**. Doanh thu và hoa hồng chỉ được ghi nhận khi có `ActivationOrder` hợp lệ được approve/thanh toán theo chính sách.

### 18.2 Kết luận nghiệp vụ

Có cơ chế tạo link/QR affiliate và nên đưa vào BA như một module riêng: **Affiliate Link & QR Attribution Module**.

Module này phải nối được chuỗi dữ liệu:

`Affiliate Link/QR → Click/Scan → Landing/App Store → Install/First Open → Register/Login → Package Selection → Order → Payment → Approve → Subscription → Commission → Renewal`.

Nếu khách chỉ tải app nhưng chưa mua gói, hệ thống chỉ ghi nhận `install attribution` hoặc `lead attribution`, chưa ghi doanh thu và chưa phát sinh hoa hồng bán hàng.

### 18.3 Vị trí trong kiến trúc nhánh bán hàng

Bổ sung vào Commercial Distribution Branch hiện tại như một phần của:

- **Channel & Attribution Layer**: tạo link/QR, tracking click/install/register/order.
- **Customer & Lead Layer**: tạo lead/first-touch attribution nếu khách chưa mua ngay.
- **Order & Payment Layer**: order snapshot nguồn affiliate tại thời điểm tạo/approve.
- **Commission & Wallet Layer**: tính hoa hồng theo policy version khi order approved.
- **Reporting & Audit Layer**: báo cáo lượt click, install, đăng ký, order, doanh thu, commission theo link/QR/participant/channel subtree.

### 18.4 Actor liên quan

| Actor | Quyền/chức năng |
|---|---|
| SALE | Tạo link/QR affiliate của mình, xem click/install/order/doanh thu/hoa hồng thuộc mình |
| AGENCY_OWNER | Tạo link/QR cho agency hoặc cấp dưới nếu được quyền, xem hiệu quả theo subtree |
| AGENCY_MANAGER | Tạo/quản lý link trong scope được phân quyền |
| DIRECTOR | Xem toàn hệ thống hoặc scope được phân quyền |
| ADMIN | Cấu hình policy link, domain, attribution window, conflict rule, anti-fraud |
| CUSTOMER/PARENT | Nhận link/QR, mở landing/app, đăng ký, mua/gia hạn gói |
| SYSTEM | Ghi nhận click/install/first open/register/order attribution |

### 18.5 Mô hình link/QR affiliate

Link affiliate chuẩn nên có dạng:

```text
https://go.minhhuong.app/r/{referralCode}
https://go.minhhuong.app/r/{referralCode}?pkg=ENGLISH_BASIC_12M&campaign=summer2026
```

QR affiliate chỉ là mã QR encode link affiliate chuẩn. Không nên tạo logic QR tách biệt với logic link, vì như vậy sẽ làm lệch attribution/report.

Các biến mở rộng có thể có:

| Tham số | Ý nghĩa |
|---|---|
| `referralCode` | Mã công khai của sale/agency/participant |
| `linkId` | ID link cụ thể nếu một participant có nhiều link |
| `campaign` | Chiến dịch/đợt phát hành |
| `pkg` | Gói học muốn gợi ý sẵn |
| `channel` | Kênh: zalo, facebook, offline_qr, school_event, teacher_group |
| `placement` | Vị trí QR: poster, tờ rơi, lớp học, hội thảo, nhóm phụ huynh |
| `utm_source`, `utm_medium`, `utm_campaign` | Tham số marketing nếu cần đồng bộ analytics |

### 18.6 Entity đề xuất bổ sung

#### `AffiliateLink`

| Field | Ý nghĩa |
|---|---|
| `id` | ID link |
| `participantId` | Sale/agency/director sở hữu link |
| `referralCodeId` | Mã referral gốc |
| `linkCode` | Mã link public, không lộ ID nội bộ |
| `name` | Tên link do user đặt |
| `packageScope` | Gói được phép gợi ý/bán |
| `campaignCode` | Mã chiến dịch nếu có |
| `landingUrl` | URL public sau khi sinh |
| `status` | `ACTIVE`, `PAUSED`, `EXPIRED`, `REVOKED` |
| `expiresAt` | Ngày hết hạn link nếu có |
| `createdByUserId` | Người tạo |
| `createdAt`, `updatedAt` | Audit time |

#### `AffiliateQrAsset`

| Field | Ý nghĩa |
|---|---|
| `id` | ID QR asset |
| `affiliateLinkId` | Link gốc |
| `qrImageUrl` | URL ảnh QR |
| `format` | PNG/SVG/PDF |
| `label` | Tên QR: tờ rơi, poster, hội thảo... |
| `placement` | Vị trí sử dụng |
| `status` | Active/disabled |
| `generatedAt` | Thời điểm sinh |

#### `AffiliateClickEvent`

| Field | Ý nghĩa |
|---|---|
| `id` | ID click/scan |
| `affiliateLinkId` | Link được click/quét |
| `referralCode` | Mã referral tại thời điểm click |
| `participantId` | Chủ sở hữu attribution ban đầu |
| `clickId` | Mã click duy nhất, dùng để match về sau |
| `ipHash`, `userAgentHash` | Chống gian lận, không cần lưu thô nếu không cần |
| `deviceType` | iOS/Android/web/unknown |
| `landingDecision` | open_app/app_store/play_store/web_checkout |
| `utmJson` | UTM/campaign metadata |
| `createdAt` | Thời điểm click/scan |

#### `AppInstallAttribution`

| Field | Ý nghĩa |
|---|---|
| `id` | ID attribution |
| `clickId` | Click gốc nếu match được |
| `affiliateLinkId` | Link gốc |
| `participantId` | Chủ attribution |
| `platform` | iOS/Android/web |
| `installSource` | app_store/play_store/apk/web_pwa/unknown |
| `installAt` | Thời điểm first open/install attribution |
| `matchMethod` | referrer/deep_link/session_match/manual_code/coupon_code |
| `matchConfidence` | high/medium/low |
| `rawPayloadJson` | Payload kỹ thuật nếu có |
| `status` | pending/linked_to_user/expired/rejected |

#### `CustomerAttribution`

| Field | Ý nghĩa |
|---|---|
| `id` | ID attribution của customer |
| `parentUserId` | Phụ huynh/người mua |
| `childProfileId` | Child nếu đã có |
| `participantId` | Sale/agency sở hữu attribution |
| `affiliateLinkId` | Link gốc |
| `firstClickAt` | Lần click đầu tiên |
| `lastClickAt` | Lần click cuối cùng |
| `attributionModel` | first_click/last_click/manual_override |
| `validUntil` | Hạn sở hữu attribution |
| `status` | active/overridden/expired/disputed |

#### Mở rộng `SalesAttributionSnapshot`

Bổ sung field:

| Field | Ý nghĩa |
|---|---|
| `affiliateLinkId` | Link tạo ra đơn |
| `affiliateQrAssetId` | QR cụ thể nếu có |
| `clickId` | Click/scan gần nhất được dùng |
| `installAttributionId` | Attribution install nếu có |
| `customerAttributionId` | Attribution customer nếu có |
| `attributionModel` | first_click/last_click/manual_override |
| `matchConfidence` | high/medium/low |
| `disputeStatus` | none/disputed/resolved |

### 18.7 Luồng nghiệp vụ affiliate link/QR

#### UC-AF01: Sale/agency tạo affiliate link

1. Sale/agency vào dashboard affiliate.
2. Chọn gói hoặc để all packages theo quyền.
3. Nhập tên link/campaign/placement nếu cần.
4. Hệ thống kiểm tra quyền participant và trạng thái channel.
5. Hệ thống sinh `AffiliateLink` và public URL.
6. User copy link gửi Zalo/Facebook/tin nhắn hoặc gắn vào landing.
7. Audit ghi thao tác tạo link.

#### UC-AF02: Tạo QR affiliate

1. Sale/agency chọn affiliate link.
2. Bấm tạo QR.
3. Hệ thống sinh QR encode đúng public URL của link.
4. User tải PNG/SVG/PDF để in tờ rơi, poster, gửi nhóm phụ huynh.
5. QR scan được ghi nhận như click event bình thường, có thêm metadata `placement=offline_qr` nếu có.

#### UC-AF03: Khách đã cài app bấm link/quét QR

1. Khách bấm link hoặc quét QR.
2. Tracking endpoint tạo `AffiliateClickEvent`.
3. Nếu thiết bị đã cài app, Universal Link/App Link mở app.
4. App nhận token/clickId và gọi API ghi nhận attribution.
5. Khi khách đăng ký/tạo order, order snapshot affiliate attribution.
6. Khi operations approve order, commission được tính cho participant/upline theo policy version.

#### UC-AF04: Khách chưa cài app bấm link/quét QR

1. Khách bấm link/quét QR.
2. Tracking endpoint tạo `AffiliateClickEvent`.
3. Landing page hiển thị thông tin gói/hướng dẫn tải app.
4. Hệ thống chuyển khách sang App Store/Google Play hoặc web checkout theo thiết bị.
5. Sau khi cài và mở app lần đầu, app cố gắng match click/install bằng referrer/deferred token/session/manual code.
6. Nếu match được, tạo `AppInstallAttribution`.
7. Khi khách đăng ký/tạo đơn, tạo `CustomerAttribution` và snapshot vào order.
8. Chỉ khi order approved mới phát sinh doanh thu/commission.

#### UC-AF05: Khách tự mua qua link affiliate trên web, chưa cài app

1. Khách mở link affiliate.
2. Landing page cho phép mua luôn trên web hoặc để lại số điện thoại.
3. Nếu mua trên web, order tạo từ self-service nhưng có affiliate attribution.
4. Khi order approved, subscription được kích hoạt; khách có thể cài app sau.
5. Revenue và commission vẫn ghi nhận cho affiliate link/participant vì order là nguồn doanh thu chính.

#### UC-AF06: Renewal từ khách từng đến qua affiliate

1. Hệ thống kiểm tra subscription sắp hết hạn.
2. Renewal opportunity gắn theo `CustomerAttribution` hoặc `SalesAttributionSnapshot` của order trước.
3. Nếu khách gia hạn qua link mới của người khác, áp dụng conflict rule đã cấu hình.
4. Order gia hạn snapshot attribution mới hoặc giữ owner cũ tùy policy.
5. Commission renewal tính theo policy version tại thời điểm approve renewal order.

### 18.8 Quy tắc ghi nhận doanh thu và hoa hồng

| Sự kiện | Có ghi doanh thu không? | Có hoa hồng không? | Ghi chú |
|---|---:|---:|---|
| Click link/scan QR | Không | Không | Chỉ là tracking |
| Tải/cài app | Không | Không | Chỉ là install attribution |
| Đăng ký tài khoản | Không | Không | Có thể tạo lead/customer attribution |
| Tạo order chờ thanh toán | Không hoặc doanh thu pipeline | Không | Chưa phải doanh thu approved |
| Upload proof/chờ duyệt | Không hoặc doanh thu pending | Không | Chưa release commission |
| Order approved/thanh toán hợp lệ | Có | Có, theo policy | Sự kiện chính để ghi doanh thu/commission |
| Refund/revoke | Giảm/đảo doanh thu theo policy | Clawback/cancel | Bắt buộc ledger/audit |
| Gia hạn approved | Có | Có nếu policy cho phép | Có thể khác commission bán mới |

### 18.9 Attribution model và conflict rule

Cần cấu hình rõ:

| Rule | Đề xuất mặc định |
|---|---|
| Attribution window | 30 ngày từ click/scan gần nhất, có thể cấu hình |
| Mô hình mặc định | Last-click trước khi order, nếu không có tranh chấp |
| Existing customer | Renewal giữ owner cũ trong X ngày trước/sau hết hạn, trừ khi admin override |
| Multiple clicks | Lưu tất cả click, order snapshot click được chọn |
| Manual sale override | Chỉ admin/operations có quyền override, bắt buộc lý do |
| Khách nhập referral code thủ công | Ưu tiên nếu code hợp lệ và chưa có order attribution mạnh hơn |
| QR offline | Xem như affiliate link bình thường, có thêm placement/campaign |
| Sale nghỉ việc/agency bị khóa | Customer attribution chuyển về agency upline hoặc company pool theo policy |
| Link hết hạn | Không tạo attribution mới, nhưng order cũ vẫn giữ snapshot |
| Tranh chấp | Đưa order/commission vào trạng thái dispute/hold cho đến khi xử lý |

### 18.10 API đề xuất

| Method | Endpoint | Mục đích |
|---|---|---|
| GET | `/v1/channel-affiliate/links` | Danh sách link theo scope |
| POST | `/v1/channel-affiliate/links` | Tạo affiliate link |
| PATCH | `/v1/channel-affiliate/links/:id` | Sửa tên/status/campaign/package scope |
| POST | `/v1/channel-affiliate/links/:id/qr` | Sinh QR asset |
| GET | `/v1/channel-affiliate/links/:id/report` | Report link cụ thể |
| GET | `/r/:linkCode` | Public redirect/tracking endpoint |
| POST | `/v1/mobile/attribution/first-open` | App gửi first open/install attribution |
| POST | `/v1/mobile/attribution/register` | App/web gắn attribution vào user mới |
| POST | `/v1/orders/:id/attribution/resolve` | Admin resolve/override attribution nếu cần |
| GET | `/v1/channel-affiliate/report` | Report tổng affiliate theo scope |

### 18.11 Báo cáo cần có

| Report | Chỉ số |
|---|---|
| Link performance | click, unique click, install, register, order, approved order, revenue |
| QR performance | scan, register, order, approved revenue theo placement |
| Participant performance | doanh thu/commission theo sale/agency/upline |
| Funnel | click → install → register → order → approved → renewal |
| Package performance | gói nào bán tốt qua affiliate |
| Renewal attribution | khách affiliate tái tục bao nhiêu, renewal rate |
| Fraud/risk | click bất thường, nhiều tài khoản cùng thiết bị/IP, duplicate phone/email |

### 18.12 Acceptance criteria bổ sung

- [ ] Sale/agency tạo được affiliate link theo quyền.
- [ ] Sale/agency tạo được QR từ affiliate link.
- [ ] QR scan tạo `AffiliateClickEvent` như click link bình thường.
- [ ] Link hết hạn/paused không tạo attribution mới.
- [ ] Khách đã cài app bấm link thì app mở đúng màn hình/package/referral.
- [ ] Khách chưa cài app bấm link thì được chuyển đúng App Store/Google Play/landing.
- [ ] App first open gửi attribution về backend nếu có token/referrer.
- [ ] Đăng ký tài khoản từ link/QR tạo `CustomerAttribution`.
- [ ] Order self-service từ affiliate link lưu `SalesAttributionSnapshot`.
- [ ] Order approved tạo commission cho participant/upline theo policy version.
- [ ] Click/install/register không tự tạo doanh thu/commission.
- [ ] Refund/revoke xử lý clawback như order khác.
- [ ] Report doanh thu affiliate khớp order approved.
- [ ] Report theo scope không lộ dữ liệu ngoài subtree.
- [ ] Admin override attribution bắt buộc lý do và audit.

### 18.13 Test cases bổ sung cho coder

| Test | Kỳ vọng |
|---|---|
| Sale tạo link affiliate | Link active, gắn đúng participant |
| Agency tạo QR | QR mở đúng URL tracking |
| Scan QR | Tạo click event có affiliateLinkId/placement |
| Link paused | Không ghi attribution mới, hiển thị thông báo/landing fallback |
| Android install từ link | First open match được referrer/click nếu cấu hình đủ |
| iOS install từ link | Match qua landing/session/manual code/campaign method tùy giải pháp |
| Khách đăng ký sau click | CustomerAttribution active |
| Khách tạo order sau click | Order có attribution snapshot |
| Approve order affiliate | Tạo subscription + commission đúng participant/upline |
| Click nhiều link trước khi mua | Áp dụng đúng first-click/last-click policy |
| Existing customer gia hạn | Áp dụng đúng renewal ownership policy |
| Admin override attribution | Audit ghi lý do và commission hold/recompute theo policy |
| Refund order affiliate | Earning canceled/clawback đúng |
| Report affiliate | Revenue khớp approved order, không khớp click/install |

### 18.14 Rủi ro và cách xử lý

| Rủi ro | Ảnh hưởng | Cách xử lý |
|---|---|---|
| Ghi doanh thu theo install | Sai doanh thu/hoa hồng | Chỉ ghi doanh thu khi order approved |
| Không match được install sau App Store | Mất attribution | Dùng landing + registration token + manual referral code fallback |
| Dễ gian lận click/QR | Hoa hồng sai | Chỉ commission theo paid order; anti-fraud theo phone/email/device/IP |
| Tranh chấp last-click/first-click | Mâu thuẫn đại lý | Cấu hình conflict rule, snapshot và audit |
| Link public lộ participantId | Rủi ro bảo mật | Dùng linkCode/token không đoán được, không lộ ID nội bộ |
| QR in ra rồi đại lý bị khóa | Vẫn kéo traffic sai | Link status active/paused/revoked kiểm tra tại redirect endpoint |
| App store attribution hạn chế | Số liệu install không hoàn hảo | Lấy order/subscription là nguồn tài chính, install chỉ là chỉ số phụ |

### 18.15 Câu hỏi nghiệp vụ cần brainstorming/chốt thêm

1. Hoa hồng tính từ sự kiện nào: order approved, tiền về, hết thời gian hoàn tiền, hay sau X ngày sử dụng?
2. Khách chỉ cài app qua QR nhưng 2 tháng sau mới mua thì còn tính cho người giới thiệu không? Attribution window bao lâu?
3. Dùng first-click, last-click, hay ưu tiên người đang chăm sóc lead?
4. Renewal thuộc người giới thiệu đầu tiên, sale chăm sóc hiện tại, hay link mới mà khách dùng khi gia hạn?
5. Đại lý cấp trên được hưởng override theo doanh thu gross, net revenue, hay theo hoa hồng của cấp dưới?
6. Một khách có nhiều con thì hoa hồng tính theo từng child subscription hay theo parent/family account?
7. QR offline có cần tách theo từng sự kiện/trường/lớp/nhóm phụ huynh không?
8. Có cho đại lý tự tạo coupon/giảm giá đi kèm link affiliate không?
9. Link affiliate có cần landing page riêng theo agency/sale không?
10. Khi sale/agency bị khóa hoặc chấm dứt hợp tác thì khách cũ và QR/link đã in xử lý thế nào?
11. Có cần chống spam referral/self-referral: tự mua bằng link của mình, cùng số điện thoại, cùng tài khoản ngân hàng?
12. Có cần hiển thị cho khách biết ai là người giới thiệu/chăm sóc không?
13. Có cần chính sách chia doanh thu khác nhau giữa bán mới, upgrade, cross-sell, renewal không?
14. Có cần đồng bộ dữ liệu affiliate với Google/Facebook Ads hoặc chỉ quản trị nội bộ?
15. Có cần tích hợp mobile measurement partner sau này không, hay self-hosted tracking là đủ ở MVP?

### 18.16 Ưu tiên triển khai

#### P0 — Affiliate/QR thực dụng cho MVP

- Tạo `ReferralCode`/`AffiliateLink` cho sale/agency.
- Sinh QR encode public tracking URL.
- Tracking click/scan.
- Landing page giữ token và cho khách tạo order web hoặc nhập số điện thoại.
- Order snapshot affiliate attribution.
- Commission chỉ tính khi order approved.
- Report click/order/approved revenue/commission theo link và participant.

#### P1 — App deep link và deferred attribution

- Android App Links + Play Install Referrer.
- iOS Universal Links + landing/session/manual referral fallback.
- App first-open attribution API.
- CustomerAttribution cho đăng ký app.
- Conflict rule first-click/last-click/existing-customer.

#### P2 — Scale/measurement

- Dynamic QR theo campaign/placement.
- Advanced fraud detection.
- Attribution dispute workflow.
- Store campaign link/custom product page/iOS measurement nâng cao nếu cần.
- Tích hợp MMP/analytics provider nếu quy mô đủ lớn.

### 18.17 Định nghĩa hoàn thành bổ sung

Module affiliate link/QR được coi là đạt khi:

- Sale/agency tự tạo được link và QR.
- Khách dùng link/QR có thể tải app hoặc mua gói qua web/app.
- Hệ thống trace được từ link/QR đến order approved.
- Doanh thu/commission ghi nhận cho đúng participant/upline theo policy version.
- Click/install chỉ dùng làm chỉ số phễu, không tự tạo hoa hồng.
- Renewal có rule ownership rõ ràng.
- Có audit và report đủ để xử lý tranh chấp đại lý.
