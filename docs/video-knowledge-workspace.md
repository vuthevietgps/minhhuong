# Kho học liệu từ video

Mở `/ai-contexts` bằng tài khoản phụ huynh, giáo viên, biên tập, hỗ trợ hoặc quản trị.

## Các luồng sử dụng

1. **Một hoặc nhiều video:** nhập link YouTube, chọn ngôn ngữ phụ đề ưu tiên và đối tượng học. Chế độ nhiều video nhận tối đa 30 link, mỗi dòng một link. Có thể cung cấp transcript cho từng video qua API; trên giao diện, bổ sung transcript qua chế độ một video hoặc nút thử lại.
2. **Xử lý nền:** hồ sơ được lưu ngay. Worker lấy phụ đề vào bộ nhớ, chia script dài thành các đoạn rồi gọi AI rút ra kiến thức chung với các phần Kiến thức nền tảng, Nguyên lý, Cách vận dụng và Giới hạn. Bỏ phần không đủ dữ liệu, diễn đạt độc lập và sắp xếp theo khái niệm. Script tự lấy không lưu vào database. Script người dùng nhập chỉ là dữ liệu hàng đợi tạm thời, bị xóa trước khi gọi AI và khi tác vụ kết thúc. Trạng thái và lỗi của mỗi video độc lập; giao diện cập nhật mỗi 5 giây.
3. **Tổng hợp và tài liệu:** chọn 1–10 nguồn sẵn sàng, chọn báo cáo theo chủ đề, ghi chú, dàn ý, bài tổng hợp hoặc danh sách việc cần làm. Tài liệu tự lưu vào database và liên kết với tất cả nguồn đầu vào. AI được yêu cầu gộp ý trùng, giữ điểm khác biệt, dẫn nguồn và chỉ rõ thông tin chưa đủ.
4. **Hỏi đáp:** hệ thống chỉ tìm các đoạn liên quan trong bản ngữ cảnh AI đã lưu. Trích dẫn được kiểm tra ID và đoạn văn có thực trong ngữ cảnh, kèm link video gốc; không trình bày như lời nói nguyên văn hay gán mốc thời gian không có bằng chứng. Không lấy lại script hoặc tóm tắt lại để hỏi đáp. Nếu thiếu thông tin trong ngữ cảnh, AI phải báo không đủ dữ liệu. Lịch sử hỏi đáp của trang nằm trong phiên giao diện và có thể tải xuống Markdown.
5. **Tái sử dụng và xuất:** nguồn đã sẵn sàng không bị lấy script hoặc tóm tắt lại khi nhập trùng link. Tài liệu với cùng tập nguồn, loại tài liệu, tên và chủ đề dùng lại bản lưu. Chỉ xuất ngữ cảnh/tài liệu `.md` và dữ liệu `.json`, không xuất script. Báo cáo sẵn sàng cũng được dùng làm ngữ cảnh cho AI tutor, khi tất cả nguồn trong báo cáo phù hợp với vai trò tài khoản.

## Diễn đạt độc lập khi tổng hợp kiến thức

- Prompt chung áp dụng cho xử lý từng đoạn, gộp ngữ cảnh, tạo tài liệu, hỏi đáp và AI tutor. AI được yêu cầu chỉ lấy khái niệm, kiến thức, nguyên lý và cách học có thể khái quát; không chép lời, dịch sát, mô phỏng phong cách hoặc kể lại video theo trình tự nguồn.
- Bỏ câu chuyện cá nhân, cốt truyện, hội thoại, ẩn dụ đặc trưng, khẩu hiệu, lời bài hát, ví dụ riêng và bộ câu hỏi/bài tập của nguồn. Nếu nội dung chủ yếu là sáng tác hoặc kể chuyện, chỉ nêu chủ đề học tập có căn cứ hoặc báo không đủ kiến thức chung. Giữ điều kiện áp dụng, bất đồng và điều chưa chắc chắn; không biến trải nghiệm cá nhân thành sự thật chung.
- Mỗi đoạn tối đa 300 từ, bản gộp tối đa 600 từ; nguồn ngắn được yêu cầu viết ngắn hơn. Tài liệu tối đa 1.000 từ. Đây là hướng dẫn cho model, không phải giới hạn từ được kiểm tra bằng mã. Hỏi đáp không phục dựng lời gốc; trích đoạn xác minh chỉ lấy từ bản ngữ cảnh AI đã lưu. Câu luyện tập mới của tutor phải là ví dụ tự tạo, không gán cho video.
- Trước khi chấp nhận từng bản nháp và bản gộp, máy chủ đối chiếu với toàn bộ script trong bộ nhớ. Nếu trùng một chuỗi từ 16 token chữ/số liên tiếp sau chuẩn hóa Unicode, chữ hoa/thường và dấu câu, tác vụ báo lỗi và không lưu bản ngữ cảnh đó. Không tự gọi AI sửa lại, không phát sinh lượt kiểm tra AI bổ sung. Script vẫn bị xóa theo quy tắc hiện có.
- Kiểm tra trùng chữ là biện pháp kỹ thuật, **không phải ngưỡng hợp pháp**. Nó có thể chặn nhầm thuật ngữ/câu chung và bỏ sót diễn đạt sát nghĩa, bản dịch, đoạn ngắn hoặc cách sắp xếp đặc trưng. Prompt và kiểm tra này nhằm giảm khả năng sao chép ở đầu ra, không xác nhận quyền sử dụng nguồn hay bảo đảm không vi phạm.
- Bản ngữ cảnh tạo mới ghi `context-v4-independent-knowledge`; worker cũng tiếp tục xử lý hàng đợi phiên bản cũ và ghi phiên bản mới khi hoàn tất. Bản `READY` cũ được giữ nguyên và không tự gọi AI làm lại; không coi chúng là đã qua chính sách mới. Cache tài liệu mới có phiên bản chính sách để yêu cầu tạo mới không lấy nhầm tài liệu tạo bằng prompt cũ. Cần dừng worker cũ trước khi chạy phiên bản mới.

## Cấu hình máy chủ

```dotenv
AI_CONTEXT_PROVIDER=deepinfra
DEEPINFRA_API_KEY=your-server-side-key
DEEPINFRA_CONTEXT_MODEL=google/gemma-4-E4B-it
DEEPINFRA_SERVICE_TIER=flex
```

Tạo tài khoản, nạp credit tại [DeepInfra](https://deepinfra.com/) và lấy API key trong Dashboard theo [hướng dẫn xác thực](https://docs.deepinfra.com/account/authentication). Điền key vào `.env` của máy chủ, khởi động lại API rồi dùng **Thử xử lý lại** cho video đã lỗi. Không đưa API key vào biến `NEXT_PUBLIC_*`. Script không được giữ sau lỗi: lần thử lại sẽ lấy lại phụ đề YouTube; nguồn thủ công cần nhập lại script.

`AI_CONTEXT_PROVIDER` chỉ điều khiển tóm tắt video, tổng hợp, tạo tài liệu và hỏi đáp kho video. AI tutor giữ cấu hình `AI_PROVIDER` riêng. Để dùng OpenAI như trước, đặt `AI_CONTEXT_PROVIDER=openai`, `OPENAI_API_KEY` và `OPENAI_CONTEXT_MODEL`; nếu không khai báo provider riêng, hệ thống kế thừa `AI_PROVIDER`. `disabled` luôn tắt, kể cả khi có key. Hosted staging tiếp tục tắt cả hai provider theo cấu hình triển khai hiện có.

### Giá tham khảo ngày 02/09/2026

Giá USD cho một triệu token văn bản, chưa gồm thuế/phí thanh toán; không dùng hạn mức miễn phí để so sánh chi phí ổn định.

| Dịch vụ / model | Đầu vào | Đầu ra | Ghi chú |
|---|---:|---:|---|
| DeepInfra / Llama 3.1 8B Turbo | 0,02 | 0,04 | Rẻ nhất trong các lựa chọn đã đối chiếu; tiếng Việt không thuộc danh sách ngôn ngữ hỗ trợ chính thức |
| **DeepInfra / Gemma 4 E4B** | **0,02** | **0,10** | Cấu hình được chọn; model đa ngôn ngữ, cần kiểm tra chất lượng thực tế khi có key |
| **Gemma 4 E4B — Flex** | **0,016** | **0,08** | Mặc định tích hợp, giảm 20%; có thể không có tài nguyên khi bận |
| Mistral / Ministral 3 3B | 0,10 | 0,10 | Giá inference thông thường |
| Google / Gemini 2.5 Flash-Lite | 0,10 | 0,40 | Giá thông thường, không phải Batch |

Nguồn: [giá DeepInfra](https://deepinfra.com/pricing), [Gemma E4B và Flex](https://deepinfra.com/google/gemma-4-E4B-it), [ngôn ngữ Llama](https://deepinfra.com/meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo), [model card Gemma](https://ai.google.dev/gemma/docs/core/model_card_4), [Mistral](https://docs.mistral.ai/inference/pricing), [Gemini](https://ai.google.dev/gemini-api/docs/pricing). Đây là lựa chọn chi phí thấp cho nhu cầu hiện tại, không khẳng định rẻ nhất toàn thị trường hay chất lượng đã được kiểm chứng.

Ví dụ tổng 10 triệu token đầu vào + 1 triệu token đầu ra: **0,24 USD với Flex**, hoặc **0,30 USD với standard**. Đây là tổng token của mọi lần gọi (bao gồm prompt và bước gộp đoạn), không phải số token transcript gốc. Chưa gồm nhận dạng giọng nói; tính năng hiện tại dùng phụ đề có sẵn.

Tích hợp dùng [Chat Completions](https://docs.deepinfra.com/chat/overview), `reasoning_effort=none`, giới hạn đầu ra, không tự retry hay chuyển sang model/provider khác. Flex gửi `fail_fast=true` để không chờ hàng đợi tới 10 phút; nếu bận/hết hạn mức, video giữ trạng thái lỗi cho phép thử lại. Có thể đặt `DEEPINFRA_SERVICE_TIER=standard` để chọn mức giá và lịch xử lý thông thường. Gemma chưa quảng cáo strict JSON schema trên trang model, nên Q&A yêu cầu JSON qua prompt và kiểm tra cấu trúc, ID nguồn, trích đoạn tại máy chủ; output sai hoặc bị cắt không được lưu như kết quả thành công.

Nguồn và báo cáo sẵn sàng vẫn dùng lại từ database, không gọi AI khi mở hoặc xuất. Tạo báo cáo mới và mỗi câu hỏi mới có gọi AI. Đổi provider/model không tự tạo lại bản tóm tắt đã lưu.

Áp dụng migration và tạo Prisma client trước khi chạy bản API mới:

```sh
npm --prefix apps/api run prisma:generate
cd apps/api
npx prisma migrate deploy
```

Migration `20260902100000_video_knowledge_workspace` bổ sung bảng tài liệu, quan hệ tài liệu–nguồn, mốc thời gian phụ đề và lease cho worker. Nó giữ dữ liệu cũ. Hash transcript được chuyển thành index thường để hai video khác nhau có cùng nội dung vẫn giữ đúng link riêng. Khóa duy nhất của video là ID YouTube chuẩn hóa; script thủ công dùng hash nội dung.

## Vận hành và giới hạn

Migration `20260902120000_context_only_retention` xóa script ở nguồn đã xử lý hoặc lỗi và dọn phụ đề cũ; giữ nguyên ngữ cảnh, link, fingerprint, báo cáo và thời gian cập nhật để giữ cache. Ràng buộc database ngăn nguồn `READY`/`FAILED` chứa script hoặc phụ đề. `rawTranscript` chỉ còn dùng làm đầu vào tạm cho hàng đợi; không trả qua API danh sách hoặc xuất dữ liệu. Triển khai cần dừng worker cũ trước khi áp dụng migration và chạy worker mới.

- Chỉ hỗ trợ tự lấy transcript từ **phụ đề YouTube có sẵn**. Chưa nhận dạng giọng nói trực tiếp từ tệp audio/video. Video thiếu phụ đề, riêng tư, bị gỡ hoặc bị YouTube giới hạn truy cập có lỗi riêng và có thể bổ sung transcript thủ công. Không có cơ chế vượt đăng nhập hoặc hạn chế truy cập. Nếu không có ngôn ngữ yêu cầu, thử phụ đề gốc.
- Tối đa 100.000 ký tự/transcript; quá giới hạn sẽ báo lỗi thay vì cắt bỏ phần cuối. JSON request tối đa 4 MB. Nguồn và tài liệu hiện hiển thị lần lượt 200 và 100 bản mới nhất.
- Nest scheduler xử lý tối đa 2 nguồn và 1 tài liệu mỗi lượt. PostgreSQL giữ hàng đợi và khóa nhận việc bằng cập nhật có điều kiện; nhiều replica không đồng thời nhận cùng hồ sơ. Lease bỏ dở được nhận lại sau 10 phút. Worker giữ lease trong lúc tóm tắt dài. Một tác vụ bị dừng sau khi AI trả kết quả nhưng trước khi lưu thành công có thể gọi lại AI khi phục hồi. Với script thủ công đã xóa khỏi hàng đợi, tác vụ bị gián đoạn sẽ báo cần nhập lại script.
- Nguồn `READY` không được xử lý lại bằng nút retry. Nguồn `FAILED` có thể thử lại; chỉ chủ nguồn hoặc biên tập/hỗ trợ/quản trị được sửa hoặc gỡ. Gỡ nguồn đồng thời gỡ tài liệu chứa nguồn đó. Quy tắc xác nhận quyền sử dụng hiện có vẫn được giữ.
- Báo cáo và hỏi đáp dựa trên bản ngữ cảnh đã lưu, không tự xác minh sự thật bên ngoài video. Các chi tiết không còn trong ngữ cảnh có thể không trả lời được. Trích dẫn hợp lệ không phải là bảo đảm mọi suy luận của AI đều chính xác.

## API

Tất cả endpoint dưới `/v1/ai-contexts`, cần Bearer token và vai trò được phép quản lý kho.

| Method | Đường dẫn | Chức năng |
|---|---|---|
| GET | `/` | Danh sách nguồn; hỗ trợ `targetRole` |
| POST | `/youtube` | Nhập một link, `script` và `title` không bắt buộc |
| POST | `/youtube/batch` | `{videos: [...]}`, lỗi nhập liệu trả theo từng phần tử |
| POST | `/manual` | Nhập transcript thủ công |
| POST | `/:id/retry` | Thử lại nguồn lỗi; có thể bổ sung `script` |
| GET | `/:id/export` | Đọc ngữ cảnh và thông tin nguồn; không trả script |
| POST | `/documents` | `{sourceIds, kind, title, topic?}`; lưu yêu cầu xử lý nền |
| GET | `/documents` | Đọc tài liệu và danh sách nguồn liên kết |
| POST | `/documents/:id/retry` | Thử lại tài liệu lỗi |
| POST | `/ask` | `{sourceIds, question}`; trả câu trả lời và trích dẫn |
| DELETE | `/:id` | Gỡ nguồn và tài liệu phụ thuộc |

`kind`: `REPORT`, `NOTES`, `OUTLINE`, `ARTICLE`, `ACTION_ITEMS`.

## Kiểm thử

```sh
cd apps/api
npx jest ai-context ai-chat --runInBand
```

Để chạy thêm kiểm thử PostgreSQL, bật `AI_CONTEXT_DATABASE_TEST=true` với database local đã migrate. Test tạo user và học liệu tạm riêng rồi dọn lại; provider AI và script được mock, không phát sinh phí API. Kiểm tra chỉ giữ ngữ cảnh sau xử lý, xóa script cả khi lỗi, retry nguồn thủ công, cache sau khi khởi tạo lại service, hỏi đáp chỉ dùng ngữ cảnh, cạnh tranh worker, lease cũ, 5 loại tài liệu, xóa phụ thuộc và quyền sử dụng ngữ cảnh.

Tham khảo tích hợp: [OpenAI Responses API](https://developers.openai.com/api/reference/typescript/resources/responses/methods/create), [youtube-transcript-plus](https://github.com/ericmmartin/youtube-transcript-plus).
