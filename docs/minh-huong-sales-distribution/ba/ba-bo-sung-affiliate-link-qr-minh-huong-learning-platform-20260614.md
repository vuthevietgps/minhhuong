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
