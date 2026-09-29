# AI English Buddy

AI English Buddy giúp trẻ luyện phản xạ nói sau khi học video hoặc bài tập. Mỗi phản hồi có một nguyên tắc: ghi nhận nỗ lực, sửa tối đa một lỗi nhẹ nhàng, cho một câu mẫu ngắn và hỏi một câu tiếp theo.

## Chế độ chạy

Mặc định AI bị tắt. Để dùng AI thật, cấu hình ở môi trường API:

```text
AI_PROVIDER=openai
OPENAI_API_KEY=<server-side-secret>
OPENAI_AI_TUTOR_MODEL=gpt-5-mini
OPENAI_CONTEXT_MODEL=gpt-5-mini
AI_CHAT_MOCK_ENABLED=false
```

Không đưa `OPENAI_API_KEY` vào frontend, source control hoặc biến `NEXT_PUBLIC_*`.

Để thử giao diện local mà không gọi provider:

```text
AI_PROVIDER=mock
AI_CHAT_MOCK_ENABLED=true
```

API trả rõ `mode=LIVE` hoặc `mode=MOCK_DEV_ONLY`. Không dùng mock để quảng cáo AI thật.

## An toàn và dữ liệu

- Backend kiểm tra phụ huynh/học viên có quyền với child profile và entitlement AI trước khi tạo phiên.
- Với OpenAI, cả câu trẻ nhập và phản hồi của AI được moderation trước khi lưu/hiển thị.
- Nội dung đầu vào bị chặn sẽ không được lưu nguyên văn; hệ thống thay bằng nhãn an toàn.
- AI không được hỏi thông tin riêng tư, vị trí, bí mật hay hướng trẻ đến các chủ đề không phù hợp.
- Lịch sử gần nhất chỉ được gửi để giữ ngữ cảnh luyện nói; Responses API được gọi với `store: false`.
- Kho ngữ cảnh chỉ nhận nội dung khi người nhập xác nhận quyền sở hữu hoặc quyền sử dụng. Video YouTube chỉ đọc phụ đề công khai; hệ thống không tải tệp video.
- Script được băm để chống trùng, cấu trúc một lần rồi dùng lại. Mỗi lượt chat chỉ nhận tối đa bốn nguồn phù hợp theo từ khóa và tối đa 12.000 ký tự đã cấu trúc.
- Nội dung nguồn luôn được coi là dữ liệu tham khảo, không phải chỉ dẫn cho mô hình; văn bản giống prompt nằm trong nguồn bị bỏ qua.

## Luyện nói trên web

Giao diện có nút micro dùng Speech Recognition của trình duyệt để chuyển câu trẻ nói thành văn bản, và nút đọc phản hồi dùng Speech Synthesis. Đây là cách khởi đầu cho luyện phản xạ; điểm phát âm, lưu audio, STT/TTS đồng nhất giữa thiết bị và realtime voice là các phần cần làm tiếp ở phase voice chuyên biệt.
