# Minhhuong website + minhhuongextension

## Phần đã tích hợp

- Quản trị tài khoản phụ huynh tiếp tục dùng `/admin/users` và phân quyền sẵn có.
- Phụ huynh mở `/browser-control` từ dashboard: quản lý hồ sơ con, lịch, hạn mức mỗi thiết bị, link được duyệt, ngữ cảnh, câu hỏi, ghép/thu hồi thiết bị và nhật ký 30 ngày.
- Trẻ xem nội dung → hết hạn mức → cùng tab chuyển tới link AI đã duyệt hoặc `/kid-learning?item=<id>` trên website.
- Góc học Minhhuong có bài tập chọn đáp án, thử lại, AI tutor và lưu kết quả/lịch sử trò chuyện trên server. Đây là dạng trò chơi nhận biết đơn giản; chưa phải thư viện trò chơi tương tác phong phú.
- Phụ huynh chọn nhanh combo từ khóa học đã xuất bản hoặc thêm link YouTube trên website. Link mới dùng lại module server lấy script/phụ đề → tạo ngữ cảnh diễn đạt độc lập → tạo bài học và câu hỏi phù hợp trẻ 5–9 tuổi. Ngữ cảnh đã có được tái sử dụng. Script không được gửi xuống extension.
- Ba mẫu biên soạn thủ công (màu sắc, động vật, số đếm) vẫn dùng được trong trình chỉnh sửa nâng cao.
- Mỗi nội dung lưu link học nội bộ ổn định theo UUID. Ngữ cảnh được nạp vào mỗi yêu cầu AI; hội thoại được phân tách theo thiết bị + nội dung.
- Link AI ngoài là tùy chọn. Phụ huynh nạp ngữ cảnh trước tại dịch vụ đó rồi lưu link. Extension không tự tạo cuộc trò chuyện ở dịch vụ ngoài và không có khả năng thu kết quả ngoài nếu không có tích hợp API riêng. Nên dùng AI nội bộ cho luồng trẻ nhỏ và báo cáo đầy đủ.

## Chạy hệ thống

Yêu cầu Node.js 22+, PostgreSQL, Chrome/Chromium 120+. Cài dependencies gốc, `apps/api`, `apps/web` theo repository.

```powershell
npm run db:local:start
npm run prisma:generate
npm run prisma:validate
# Xem các migration còn chờ trước khi áp dụng vào database đang dùng.
npm --prefix apps/api exec -- prisma migrate status
# Chạy tại apps/api để áp dụng các migration đã được kiểm tra:
cd apps/api
npx prisma migrate deploy
cd ../..
npm run dev:api
# Terminal khác:
npm run dev:web
```

Migration mới: `apps/api/prisma/migrations/20260919100000_browser_control/migration.sql`. Nó thêm sáu bảng và quan hệ tới `ChildProfile`; không thay đổi dữ liệu học cũ. Không tự động đưa thay đổi lên hosting. Repository có thể đã có các migration chưa áp dụng từ công việc trước; `migrate deploy` áp dụng **tất cả** migration còn chờ, cần đối chiếu môi trường trước khi chạy.

Luồng combo/import cần thêm migration `20260919120000_browser_content_preparation`, tạo hàng đợi bền `BrowserPreparation`. Worker lấy tối đa hai công việc mỗi lượt, có lease và phục hồi công việc sau 10 phút nếu tiến trình bị ngắt. Trang web cập nhật trạng thái mỗi 5 giây khi còn công việc đang chạy; phụ huynh có thể đóng trang và quay lại sau.

### Thiết lập nội dung nhanh trên website

1. Chọn hồ sơ con và thời lượng mặc định cho link mới.
2. Chọn combo Minhhuong: mỗi khóa học đã xuất bản là một combo, lấy các video YouTube thuộc bài học `PUBLISHED`. Chỉ các video có ngữ cảnh `READY` hợp lệ do ADMIN/CONTENT_EDITOR/TEACHER tạo mới được chuẩn bị; UI chỉ rõ số link còn thiếu ngữ cảnh. Không đưa bản nháp hoặc upload riêng của phụ huynh vào danh mục combo.
3. Hoặc dán link YouTube khác: server chuẩn hóa link và tái sử dụng nguồn nếu đã có. Nếu chưa có, pipeline hiện có lấy script/phụ đề, AI tạo ngữ cảnh, sau đó AI tạo câu hỏi và đáp án. Nhập thông tin nguồn/quyền sử dụng theo quy trình nhập video sẵn có. Không tải video về máy phụ huynh. Các trang ngoài YouTube vẫn thêm thủ công ở trình chỉnh sửa; chưa tự trích script từ mọi website.
4. Trạng thái: `WAITING_CONTEXT` → `PROCESSING` → `READY`, hoặc `FAILED` kèm lý do. Có thể thử lại, bổ sung script khi không lấy tự động được, hoặc xóa dòng chuẩn bị. Nội dung không phù hợp / đáp án AI sai cấu trúc không được tự chấp nhận.
5. Xem ngữ cảnh và câu hỏi; thêm một hoặc tất cả nội dung sẵn sàng vào cấu hình, chỉnh thời lượng/link AI nếu cần rồi **Lưu cấu hình cho con**. Không tự bật video khi còn đang xử lý. Các link trùng không được thêm hai lần; tối đa 50 link đang cấu hình, 100 nội dung chuẩn bị mỗi hồ sơ.

Ngữ cảnh nguồn được dùng lại; gói câu hỏi được lưu riêng cho hồ sơ con. Chọn lại cùng combo/link trong hồ sơ dùng lại công việc đã có, không tạo lại AI vô hạn. Trường hợp nguồn dùng chung đang lỗi do người khác tạo, chỉ chủ nguồn hoặc người có quyền sửa theo module hiện tại mới thử xử lý lại được; phụ huynh vẫn có thể dùng phần biên soạn thủ công.

Để tạo ngữ cảnh và bài tập thật, cấu hình provider của module hiện có: `AI_CONTEXT_PROVIDER=openai` cùng `OPENAI_API_KEY`, hoặc `AI_CONTEXT_PROVIDER=deepinfra` cùng `DEEPINFRA_API_KEY`. Đây là xử lý phía server; không gửi khóa vào web/extension. Nếu provider chưa cấu hình hoặc video không có script lấy được, job báo lỗi và chờ xử lý lại, không tạo bài tập giả.

Các biến môi trường dùng lại:

| Biến | Local | Vai trò |
| --- | --- | --- |
| `WEB_PUBLIC_URL` | `http://localhost:3000` | Server tạo link góc học đúng website; khi hosting phải là origin HTTPS của web |
| `NEXT_PUBLIC_API_URL` | `http://localhost:4000` | URL API dùng khi build web |
| `CORS_ORIGIN` | `http://localhost:3000` | Cho website gọi API; giữ quy tắc bảo mật đang có |
| `DATABASE_URL` | PostgreSQL local | Lưu chính sách, thiết bị, bộ đếm, hội thoại và kết quả |
| `AI_PROVIDER` | `disabled` hoặc cấu hình hiện có | `openai` để dùng AI tutor thật; bài tập vẫn chạy khi AI tắt |
| `OPENAI_API_KEY` | Chỉ đặt ở API server | Dùng lại AI tutor hiện tại; không gửi khóa tới extension |
| `OPENAI_AI_TUTOR_MODEL` | Cấu hình hiện có | Model của AI tutor |

Mỗi lần đổi `NEXT_PUBLIC_API_URL` cần build lại web. Khi dùng AI nội bộ, provider hiện có kiểm tra moderation đầu vào/đầu ra và dùng hướng dẫn dành cho trẻ; không có bảo đảm mọi câu trả lời đều đúng. Chế độ `EXERCISE_ONLY` tắt chat ở cả giao diện và server. Mock AI chỉ dùng cho kiểm thử/local theo cấu hình sẵn có.

Đóng gói extension: `npm run package:extension`. ZIP nằm ở `output/minhhuongextension/minhhuongextension-1.0.0.zip`. Giải nén rồi dùng Load unpacked; chưa phát hành Chrome Web Store. Xem [hướng dẫn cài extension](../minhhuongextension/README.md).

## API và dữ liệu

Parent JWT + role `PARENT`; tất cả kiểm tra `ChildProfile.parentId`:

| Endpoint (prefix `/v1`) | Chức năng |
| --- | --- |
| `GET/PUT /parent/browser-control/:childId` | Cấu hình và báo cáo / lưu cấu hình |
| `POST /parent/browser-control/:childId/pairing` | Mã ghép ngẫu nhiên 128 bit, SHA-256 trong DB, TTL 10 phút |
| `DELETE /parent/browser-control/:childId/devices/:deviceId` | Thu hồi thiết bị |
| `GET /parent/browser-control/:childId/content/combos` | Combo từ kho đã xuất bản và mức sẵn sàng ngữ cảnh |
| `POST /parent/browser-control/:childId/content/combos/:comboId` | Chuẩn bị các link có ngữ cảnh trong combo |
| `GET/POST /parent/browser-control/:childId/content/imports` | Xem hàng đợi / thêm link YouTube vào pipeline |
| `POST /parent/browser-control/:childId/content/imports/:id/retry` | Thử lại, có thể bổ sung script |
| `DELETE /parent/browser-control/:childId/content/imports/:id` | Xóa công việc chuẩn bị; không gỡ bản đã lưu trong cấu hình |

Device bearer riêng 256 bit, chỉ lưu hash tại server:

| Endpoint (prefix `/v1/browser-extension`) | Chức năng |
| --- | --- |
| `POST /pair` | Đổi mã ghép thành token, thao tác tiêu thụ mã nguyên tử |
| `POST /sync` | Bộ đếm tích lũy + sự kiện có UUID; trả cấu hình, giờ server, bộ đếm gần đây |
| `GET /learning/:itemId` | Ngữ cảnh/câu hỏi/hội thoại của nội dung được duyệt; không trả đáp án |
| `POST /learning/:itemId/chat` | Nạp ngữ cảnh tự viết vào provider, lưu hội thoại; tối thiểu 10 giây giữa yêu cầu trên một thiết bị |
| `POST /learning/:itemId/attempt` | Chấm tại server, lưu kết quả theo event ID, gửi lại không tạo kết quả trùng |

Token thiết bị được giữ trong `chrome.storage.local` với `TRUSTED_CONTEXTS`, không trả cho website qua bridge. Bridge chỉ cho ba thao tác learning từ đúng origin, path và item đã ghép; không cho arbitrary fetch. Parent JWT không được lưu vào extension. Tài khoản phụ huynh bị suspend hoặc thiết bị bị thu hồi bị từ chối tại API; extension khóa ở lần sync tiếp theo.

Các bảng mới: `BrowserPolicy`, `BrowserPairing`, `BrowserDevice`, `BrowserUsage`, `BrowserEvent`, `BrowserMessage`. Xóa hồ sơ con sẽ cascade dữ liệu này. Báo cáo giới hạn 200 sự kiện gần nhất, 5.000 dòng usage trong 30 ngày; dữ liệu DB chưa có tác vụ dọn theo TTL. Không ghi URL ngoài danh sách, nội dung trang bị chặn hay phụ đề video. Hội thoại học và đáp án của con là dữ liệu lưu tại server.

## Quy tắc thực thi và giới hạn

- DNR chặn mặc định main-frame, chỉ mở đúng URL HTTPS đã duyệt, chặn subframe. Content script kiểm tra mỗi giây, dừng audio/video và che tab chưa được cấp quyền. Theo dõi navigation thường và History API để xử lý SPA.
- Cấp trước các đoạn tối đa 5 giây, lưu bền trước phản hồi. Trình duyệt crash hoặc đóng rồi mở lại không trả lại quota. Khi offline không có yêu cầu đến server trong đường tính giờ. Retry sync lấy `GREATEST` theo thiết bị/ngày/item và event ID duy nhất.
- Lịch xem không giới hạn phần học. Chuyển `LEARN_ONLY` hoặc `EXERCISE_ONLY` có hiệu lực khi nhận cấu hình mới; `PAUSED` khóa toàn bộ hoạt động được quản lý.
- Hạn mức là **mỗi thiết bị**. Báo cáo tổng hợp toàn bộ thiết bị nhưng không quảng bá là hạn mức chung tuyệt đối khi nhiều máy đều offline.
- Truy cập tab đang dùng được tính dù video tạm dừng. Đây là hạn mức dùng trình duyệt cho nội dung, không phải đo chính xác độ tập trung hay số giây phát video.
- AI/bài tập cần mạng. Offline vẫn chặn nội dung hết giờ và hiển thị trạng thái; không tạo kết quả giả. Đổi lịch/thu hồi thiết bị chỉ tới máy khi có mạng.
- Extension người dùng cài không thể ngăn người có quyền gỡ extension, đổi profile/browser, thay đồng hồ hoặc sửa storage. Cần Chrome/OS được quản lý nếu muốn chống can thiệp. Không tuyên bố đây là bộ lọc tuyệt đối mọi nội dung bên trong một trang đã duyệt.

## Kiểm thử và kiểm chứng

```powershell
npm run test:extension
npm run test:browser-control
npm run build
# Cài Chromium một lần, sau đó chạy web localhost:3000:
npx playwright install chromium
npm run smoke:browser-control
```

`test:browser-control` chỉ cho PostgreSQL localhost; tạo database tên `minhhuong_browser_test_<timestamp>`, push schema vào DB tạm, thử SQL migration trong transaction rollback, chạy Jest và xóa đúng DB vừa tạo. Không dùng dữ liệu ứng dụng hiện có.

`smoke:browser-control` dùng Chromium profile tạm có extension thật, giao diện Next.js thật và API fixture xác định. Nó kiểm tra cấu hình/ghép ở web, desktop/mobile, DNR allow/deny, quota qua restart, hết giờ → học, bài tập/chat, offline và thu hồi. Lưu ảnh tại `output/browser-control-smoke`. Có thể đặt `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` để dùng Chromium đã cài và `BROWSER_CONTROL_WEB_URL` để đổi web local. AI live không được gọi trong smoke.

Tham chiếu triển khai: [Chrome DNR](https://developer.chrome.com/docs/extensions/reference/api/declarativeNetRequest), [Chrome storage](https://developer.chrome.com/docs/extensions/reference/api/storage), [Chrome alarms](https://developer.chrome.com/docs/extensions/reference/api/alarms), [Playwright extension testing](https://playwright.dev/docs/chrome-extensions).
