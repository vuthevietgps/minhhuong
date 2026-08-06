# BA triển khai nhánh Học tập — Minh Huong Learning Platform

Ngày xuất bản: 2026-06-14  
Phiên bản: v1.1 tách nhánh cho coder, bổ sung chuẩn học liệu/quản lý học tập/screen time/CMS/AI  
Phạm vi: nhánh Học tập, bao gồm trải nghiệm học của học viên/child, phụ huynh, nội dung học, video immersion, bài tập/trò chơi, AI English Buddy, tiến độ học và báo cáo học tập.  
Nguồn nền: `ba-current-software-assessment.md` và BA bổ sung tách 2 nhánh học tập/bán hàng.

---

## 1. Mục tiêu tài liệu

Tài liệu này dùng để giao riêng cho coder phụ trách nhánh **Học tập**. Mục tiêu là biến nền tảng hiện tại từ mức “có learning portal + video + quiz + parent report” thành một app học tiếng Anh thực dụng cho trẻ nhỏ, có thể bán được vì tạo ra giá trị học thật.

Nhánh học tập phải trả lời 5 câu hỏi nghiệp vụ:

1. Hôm nay học viên cần học gì?
2. Học viên có được tắm video/ngôn ngữ đều không?
3. Học viên có làm bài tập/trò chơi sau khi xem không?
4. Học viên có nói chuyện/luyện tập với AI đúng trình độ không?
5. Phụ huynh có thấy con học đều, tiến bộ và đáng tiếp tục trả tiền không?

Nguyên tắc sản phẩm: **giá trị học tập là lõi giữ chân khách hàng**. Nhánh bán hàng chỉ giúp đưa khách vào hệ thống; nhánh học tập quyết định khách có gia hạn và giới thiệu tiếp hay không.

---

## 2. Phạm vi và không phạm vi

### 2.1 Trong phạm vi

- Child learning home.
- Daily learning plan.
- Immersion video engine.
- Practice/game engine.
- AI English Buddy.
- Speaking/listening support ở mức có thể triển khai dần.
- Parent dashboard/report.
- Content CMS mở rộng cho video/game/AI scenario.
- Learning progress, usage tracking, skill progress.
- Entitlement check ở mức đọc quyền học từ subscription/package.
- API contract phục vụ web/mobile/PWA sau này.

### 2.2 Ngoài phạm vi của file này

- Sale, agency, director, commission, payout.
- Payment gateway, đối soát tiền, hóa đơn, payout.
- Báo cáo doanh thu, hiệu quả sale, ví đại lý.
- Chính sách hoa hồng và clawback.

Các phần ngoài phạm vi được chuyển sang file **BA quản lý bán hàng/phân phối**. Nhánh học tập chỉ cần biết học viên/child có quyền học gì, gói nào, còn hạn hay không, quota AI/video/game còn hay không.

---

## 3. Hiện trạng nền cần giữ

Hệ thống hiện có các nền sau cần tận dụng:

| Nhóm | Entity/module hiện có | Cách dùng trong nhánh học tập |
|---|---|---|
| Identity | `User`, `Profile`, `Role`, `UserRole` | Xác thực parent/student/admin/teacher/content editor |
| Parent/Child | `ChildProfile`, `ChildScreenTimeSetting`, `DeviceTimeGrant`, `LearningUsageDay` | Hồ sơ con, giới hạn thiết bị, đo usage hằng ngày |
| Content | `Level`, `Course`, `Unit`, `Lesson`, `ContentTag`, `LessonTag`, `VideoAsset`, `Activity`, `Question`, `Answer` | Cây nội dung học, video, bài tập, câu hỏi |
| Learning | `LessonProgress`, `ActivityAttempt`, `QuestionAttempt` | Tiến độ xem bài, làm bài, câu trả lời |
| Billing/Access | `Plan`, `Subscription`, `ActivationPackage` | Đọc quyền học/quyền tính năng theo gói |
| AI | `AiChatSession`, `AiChatMessage` | Nền lưu hội thoại, hiện cần thay mock bằng provider thật |
| Audit | `AuditLog` | Ghi thao tác publish, sửa nội dung, thay đổi dữ liệu quan trọng |

Luồng hiện tại đã có learning home, video feed, watch event, practice tự chấm, parent report. Tuy nhiên cần nâng cấp để trở thành trải nghiệm học cho trẻ nhỏ: ít chữ, nhiều hình, theo ngày, có trò chơi, có AI thật, có động lực học đều.

---

## 4. Định vị nhánh học tập

Nhánh học tập là **Learning Product Branch** gồm 6 lớp:

1. **Learning Access Layer**: kiểm tra child có quyền học gì.
2. **Content Layer**: course, unit, lesson, video, activity, question, game, AI scenario.
3. **Daily Learning Layer**: kế hoạch học từng ngày, học tiếp, ôn lại, lộ trình.
4. **Engagement Layer**: video immersion, game, reward, streak.
5. **AI Tutor Layer**: AI nói chuyện, hỏi sau video, luyện mẫu câu, phản hồi nhẹ nhàng.
6. **Parent Insight Layer**: báo cáo học tập, cảnh báo bỏ học, đề xuất ôn tập.

Không được thiết kế learning branch như một trang admin thu nhỏ. Học viên nhỏ tuổi cần trải nghiệm đơn giản: mở app → học tiếp → xem video → chơi → nói → nhận thưởng.

---

## 5. Actor và quyền trong nhánh học tập

| Actor | Mục tiêu | Chức năng cần có |
|---|---|---|
| CHILD/STUDENT | Học mỗi ngày | Xem bài hôm nay, xem video, chơi game, làm bài, nói với AI, nhận thưởng |
| PARENT | Quản lý việc học | Tạo hồ sơ con, chọn mục tiêu, xem báo cáo, giới hạn thời gian, cấp thêm thời gian |
| TEACHER | Tạo/chấm nội dung | Tạo lesson draft, tạo bài luyện, chấm speaking/writing nếu được phân công |
| CONTENT_EDITOR | Vận hành học liệu | Tạo course/unit/lesson/video/activity/game/question/AI scenario |
| ADMIN | Duyệt và kiểm soát | Publish/archive content, cấu hình level/path, kiểm chất lượng nội dung |
| AI_TUTOR_SYSTEM | Hỗ trợ luyện tập | Sinh câu hỏi, hội thoại, phản hồi câu trả lời, kiểm soát an toàn |
| SYSTEM_CRON | Tự động hóa | Tạo daily plan, nhắc học, tổng hợp báo cáo, phát hiện bỏ học |

---

## 6. Nguyên tắc nghiệp vụ bắt buộc

1. **Child profile là trung tâm học tập**: mọi progress, usage, AI session, reward phải gắn với `childProfileId`.
2. **Parent sở hữu quản lý, child sở hữu tiến độ học**: parent có quyền xem/điều chỉnh; không được trộn tiến độ của nhiều child.
3. **Subscription/entitlement là cổng vào học**: nếu hết hạn, child không học nội dung premium/AI premium.
4. **Content publish mới được học**: lesson/activity/game/AI scenario chỉ hiện cho child khi ở trạng thái published/active.
5. **Không lộ đáp án đúng khi lấy bài tập**: API practice/game không trả đáp án đúng cho client.
6. **Mọi event học quan trọng phải ghi log**: watch, attempt, AI message, reward, streak, time usage.
7. **AI phải có guardrail**: theo tuổi, trình độ, chủ đề, thời lượng, quota và nội dung an toàn.
8. **KPI học tập tách khỏi KPI bán hàng**: learning branch không tính hoa hồng, không xử lý payout.
9. **UX trẻ nhỏ ưu tiên ít chữ**: frontend child mode không bê nguyên admin dashboard vào.
10. **Mobile/PWA sau này dùng cùng API**: không hard-code logic chỉ cho web hiện tại.

---

## 7. Mô hình dữ liệu đề xuất

### 7.1 Entity hiện có cần rà soát/mở rộng

| Entity | Việc cần làm |
|---|---|
| `ChildProfile` | Thêm level hiện tại, mục tiêu học, avatar/mascot, preferred topics nếu chưa có |
| `ChildScreenTimeSetting` | Phân biệt device time và study time; cho phép policy theo ngày trong tuần |
| `LearningUsageDay` | Tách `activeStudyMinutes`, `passiveImmersionMinutes`, `aiMinutes`, `gameMinutes` |
| `Lesson` | Thêm learning objective, estimated age/level, skill focus, revision/version |
| `VideoAsset` | Thêm duration, transcript, thumbnail, source type, storage status, language level |
| `Activity` | Thêm activity mode: quiz/game/speaking/listening/story |
| `Question` | Thêm media prompt, audio prompt, image options, auto-grade strategy |
| `LessonProgress` | Thêm completion source, mastery score, last meaningful event |
| `AiChatSession` | Thêm scenarioId, promptVersionId, child level, usage/cost metadata |
| `AiChatMessage` | Thêm moderation status, token count, audio transcript, feedback metadata |

### 7.2 Entity mới P0/P1

#### `DailyLearningPlan`

Kế hoạch học từng ngày cho từng child.

| Field | Ý nghĩa |
|---|---|
| `id` | ID kế hoạch |
| `childProfileId` | Child được giao kế hoạch |
| `planDate` | Ngày học |
| `theme` | Chủ đề học: animals, food, family... |
| `levelCode` | Level mục tiêu |
| `targetMinutes` | Tổng phút học đề xuất |
| `status` | `DRAFT`, `ACTIVE`, `COMPLETED`, `SKIPPED`, `EXPIRED` |
| `source` | `SYSTEM_RULE`, `AI`, `PARENT`, `TEACHER`, `ADMIN` |
| `createdAt`, `updatedAt` | Audit time |

#### `DailyLearningPlanItem`

Từng việc học trong kế hoạch.

| Field | Ý nghĩa |
|---|---|
| `id` | ID item |
| `planId` | Kế hoạch cha |
| `sequence` | Thứ tự học |
| `itemType` | `VIDEO`, `PRACTICE`, `GAME`, `AI_CONVERSATION`, `REVIEW`, `REWARD` |
| `lessonId` | Nếu là lesson/video |
| `activityId` | Nếu là activity/game |
| `aiScenarioId` | Nếu là hội thoại AI |
| `required` | Có bắt buộc để hoàn thành ngày không |
| `status` | `LOCKED`, `READY`, `STARTED`, `COMPLETED`, `SKIPPED` |

#### `ImmersionPlaylist`

Playlist tắm video/ngôn ngữ.

| Field | Ý nghĩa |
|---|---|
| `id` | ID playlist |
| `childProfileId` | Child được áp dụng |
| `title` | Tên playlist |
| `theme` | Chủ đề |
| `levelCode` | Level |
| `mode` | `ACTIVE_STUDY`, `PASSIVE_IMMERSION`, `REVIEW` |
| `status` | `ACTIVE`, `ARCHIVED` |

#### `ImmersionPlaylistItem`

| Field | Ý nghĩa |
|---|---|
| `playlistId` | Playlist cha |
| `videoAssetId` | Video |
| `lessonId` | Lesson liên quan |
| `sequence` | Thứ tự chạy |
| `repeatPolicy` | Chính sách lặp |
| `minWatchPercent` | % tối thiểu để tính hoàn thành |

#### `VideoExposureLog`

Ghi từng lần child tiếp xúc video.

| Field | Ý nghĩa |
|---|---|
| `childProfileId` | Child |
| `videoAssetId` | Video |
| `lessonId` | Lesson |
| `eventType` | `STARTED`, `PROGRESSED`, `COMPLETED`, `REPLAYED`, `SKIPPED` |
| `positionSec` | Vị trí xem |
| `durationWatchedSec` | Thời lượng đã xem |
| `mode` | active/passive/review |
| `createdAt` | Thời điểm ghi |

#### `GameActivityConfig`

Cấu hình game cho activity.

| Field | Ý nghĩa |
|---|---|
| `activityId` | Activity cha |
| `gameType` | `PICTURE_CHOICE`, `DRAG_DROP`, `LISTEN_CHOOSE`, `MATCHING`, `SENTENCE_BUILD`, `SPEAK_REPEAT` |
| `configJson` | Cấu hình game |
| `assetJson` | Ảnh/audio/animation cần dùng |
| `scoringJson` | Cách tính điểm |
| `published` | Cho phép học viên chơi |

#### `RewardCatalog` và `RewardLedger`

Reward dùng tạo động lực.

| Entity | Ý nghĩa |
|---|---|
| `RewardCatalog` | Danh sách sticker, badge, star, mascot item |
| `RewardLedger` | Lịch sử child nhận reward |

#### `SkillProgress`

Theo dõi tiến bộ theo kỹ năng.

| Field | Ý nghĩa |
|---|---|
| `childProfileId` | Child |
| `skill` | `LISTENING`, `SPEAKING`, `VOCAB`, `PHONICS`, `SENTENCE`, `READING`, `WRITING` |
| `levelCode` | Level hiện tại |
| `masteryScore` | 0–100 |
| `lastPracticedAt` | Lần luyện gần nhất |
| `evidenceJson` | Dữ liệu chứng minh điểm |

### 7.3 Entity mới cho AI Buddy

#### `AiTutorProfile`

| Field | Ý nghĩa |
|---|---|
| `childProfileId` | Child |
| `displayName` | Tên AI buddy/mascot |
| `voiceProfile` | Giọng đọc nếu có TTS |
| `languageLevel` | Level hội thoại |
| `allowedTopics` | Chủ đề được nói |
| `blockedTopics` | Chủ đề cấm |
| `style` | nhẹ nhàng, vui vẻ, ngắn gọn |

#### `AiConversationScenario`

Kịch bản hội thoại AI theo bài học.

| Field | Ý nghĩa |
|---|---|
| `id` | ID scenario |
| `lessonId` | Lesson liên quan |
| `title` | Tên scenario |
| `objective` | Mục tiêu nói |
| `targetPhrases` | Mẫu câu cần luyện |
| `allowedVocabulary` | Từ vựng dùng trong hội thoại |
| `maxTurns` | Số lượt tối đa |
| `published` | Trạng thái dùng được |

#### `AiPromptVersion`

| Field | Ý nghĩa |
|---|---|
| `id` | ID prompt version |
| `scenarioId` | Scenario |
| `systemPrompt` | Prompt hệ thống |
| `safetyPrompt` | Prompt an toàn |
| `version` | Phiên bản |
| `status` | `DRAFT`, `ACTIVE`, `ARCHIVED` |

#### `AiUsageLedger`

| Field | Ý nghĩa |
|---|---|
| `childProfileId` | Child |
| `sessionId` | Phiên AI |
| `provider` | OpenAI/khác |
| `model` | Model |
| `inputTokens`, `outputTokens` | Token |
| `estimatedCost` | Chi phí ước tính |
| `quotaType` | Theo ngày/tháng/gói |

#### `SpeakingAttempt`

| Field | Ý nghĩa |
|---|---|
| `childProfileId` | Child |
| `lessonId` | Lesson |
| `activityId` | Activity nếu có |
| `audioUrl` | File ghi âm |
| `transcript` | Text nhận dạng |
| `targetText` | Câu mẫu |
| `score` | Điểm phát âm/nói |
| `feedbackJson` | Phản hồi |

---

## 8. Module chức năng chi tiết

### 8.1 Child Learning Home

Mục tiêu: một màn hình chính dành cho trẻ nhỏ.

Yêu cầu:

- Có avatar/mascot/chủ đề ngày.
- Có nút lớn “Học tiếp”.
- Hiển thị 3–5 việc học, không nhiều hơn trong một buổi.
- Mỗi việc học có icon: xem, chơi, nói, nhận thưởng.
- Có progress vòng tròn/ngôi sao/sticker.
- Nếu hết thời gian thiết bị, hiện thông báo thân thiện và nút xin thêm thời gian từ phụ huynh.

API đề xuất:

| Method | Endpoint | Mục đích |
|---|---|---|
| GET | `/v1/learning/children/:childId/home` | Lấy home tổng hợp |
| GET | `/v1/learning/children/:childId/today-plan` | Lấy kế hoạch hôm nay |
| POST | `/v1/learning/children/:childId/today-plan/:itemId/start` | Bắt đầu item |
| POST | `/v1/learning/children/:childId/today-plan/:itemId/complete` | Hoàn thành item |

Acceptance criteria:

- Child chỉ thấy dữ liệu của mình hoặc parent sở hữu child đó.
- Nếu không có plan hôm nay, hệ thống tự tạo plan rule-based tối thiểu.
- Nếu subscription hết hạn, chỉ hiện trạng thái cần gia hạn, không cho học premium.
- Home load trong một API tổng hợp, tránh frontend gọi quá nhiều API rời rạc.

### 8.2 Daily Learning Plan Engine

Mục tiêu: mỗi ngày hệ thống tự biết child nên học gì.

Rule P0:

- Nếu có lesson đang học dở, ưu tiên học tiếp.
- Nếu chưa có lesson dở, lấy lesson published tiếp theo theo course/unit/level.
- Sau video phải có practice/game nếu lesson có activity.
- Nếu có AI scenario published, thêm một item nói chuyện AI.
- Nếu child học ít hơn mục tiêu tuần, tăng nhẹ số item review.

Rule P1:

- Thêm spaced repetition.
- Thêm cá nhân hóa theo lỗi thường gặp.
- Thêm AI đề xuất plan nhưng phải có giới hạn và audit.

API đề xuất:

| Method | Endpoint | Mục đích |
|---|---|---|
| POST | `/v1/learning/children/:childId/daily-plans/generate` | Sinh plan theo rule |
| GET | `/v1/learning/children/:childId/daily-plans?from=&to=` | Xem lịch học |
| PATCH | `/v1/learning/daily-plans/:planId` | Parent/admin chỉnh plan |

Acceptance criteria:

- Không tạo trùng plan active cho cùng child/ngày.
- Plan sinh ra phải chỉ chứa content published và child có entitlement.
- Plan item có thứ tự, trạng thái rõ ràng.

### 8.3 Immersion Video Engine

Mục tiêu: biến video feed thành cơ chế tắm ngôn ngữ, không chỉ là danh sách video.

Yêu cầu P0:

- Playlist video theo ngày/chủ đề/level.
- Auto next trong cùng playlist.
- Ghi lại watch event và exposure log.
- Tính active/passive minutes.
- Cho phép replay dễ dàng.

Yêu cầu P1:

- Spaced repetition cho video.
- Video transcript/audio text.
- Gợi ý video theo lỗi/vốn từ của child.
- Playlist nghe thụ động.

API đề xuất:

| Method | Endpoint | Mục đích |
|---|---|---|
| GET | `/v1/learning/children/:childId/immersion-playlists/today` | Playlist hôm nay |
| POST | `/v1/learning/watch-events` | Ghi watch event hiện có/mở rộng |
| POST | `/v1/learning/video-exposure` | Ghi exposure chi tiết |

Acceptance criteria:

- Watch event không cho client tự đánh completed nếu chưa đạt `minWatchPercent`.
- Không ghi âm thời gian học vô hạn khi video pause/background sai mode.
- Có migration tương thích với `LessonProgress` hiện tại.

### 8.4 Practice/Game Engine

Mục tiêu: trẻ học qua trò chơi, không chỉ quiz khô.

Game type P0/P1:

| Game type | Mục tiêu | Ưu tiên |
|---|---|---|
| `PICTURE_CHOICE` | Nghe/đọc và chọn tranh | P0 |
| `LISTEN_CHOOSE` | Nghe audio chọn đáp án | P0 |
| `MATCHING` | Ghép từ với tranh/nghĩa | P1 |
| `DRAG_DROP` | Kéo thả từ/câu | P1 |
| `SENTENCE_BUILD` | Xếp câu | P1 |
| `SPEAK_REPEAT` | Nói theo mẫu | P2 |

Yêu cầu:

- Activity có thể là quiz hoặc game.
- Client không nhận đáp án đúng.
- Attempt lưu đủ input của child để phân tích lỗi.
- Feedback ngắn, thân thiện.
- Có reward sau khi hoàn thành.

API đề xuất:

| Method | Endpoint | Mục đích |
|---|---|---|
| GET | `/v1/learning/activities/:activityId/play` | Lấy game/practice payload công khai |
| POST | `/v1/learning/activities/:activityId/attempts` | Submit attempt |
| GET | `/v1/learning/children/:childId/rewards` | Lấy reward đã nhận |

Acceptance criteria:

- Submit attempt phải tự chấm ở backend.
- Mỗi attempt lưu score, maxScore, feedback, detail.
- Hoàn thành lesson không chỉ dựa vào xem video, mà có thể dựa vào video + practice/game.

### 8.5 AI English Buddy

Mục tiêu: AI trở thành bạn luyện tiếng Anh của child, không phải chatbot chung chung.

Chế độ P0/P1:

| Mode | Mục tiêu |
|---|---|
| `AFTER_VIDEO_QA` | Xem video xong AI hỏi 3–5 câu đơn giản |
| `TARGET_PHRASE_PRACTICE` | Luyện mẫu câu trong lesson |
| `FREE_TALK_SAFE` | Nói tự do trong chủ đề an toàn |
| `ROLE_PLAY` | Đóng vai: mua đồ ăn, chào hỏi, giới thiệu bản thân |

Guardrail bắt buộc:

- Giới hạn tuổi/trình độ.
- Giới hạn chủ đề.
- Giới hạn số lượt hội thoại.
- Giới hạn token/quota theo gói.
- Moderation input/output.
- Không tạo nội dung người lớn, bạo lực, chính trị, tài chính, y tế, hẹn gặp riêng.
- Phản hồi ngắn, dễ hiểu, ưu tiên tiếng Anh đơn giản kèm hỗ trợ nếu cần.

API đề xuất:

| Method | Endpoint | Mục đích |
|---|---|---|
| POST | `/v1/ai-buddy/sessions` | Tạo phiên AI theo child/scenario |
| POST | `/v1/ai-buddy/sessions/:sessionId/messages` | Gửi tin nhắn |
| GET | `/v1/ai-buddy/children/:childId/quota` | Xem quota AI |
| GET | `/v1/admin/ai/scenarios` | Admin quản lý scenario |
| POST | `/v1/admin/ai/scenarios/:id/publish` | Publish scenario |

Acceptance criteria:

- Không còn reply mock ở production mode.
- Nếu thiếu AI provider key, hệ thống phải fail có kiểm soát, không giả vờ là AI thật.
- Mọi session/message lưu provider, model, prompt version, token/cost nếu có.
- Child không thể đổi prompt/system role từ client.

### 8.6 Parent Dashboard và báo cáo học tập

Mục tiêu: phụ huynh thấy app có giá trị và con đang tiến bộ.

Thông tin tối thiểu:

- Hôm nay con đã học chưa.
- Tổng phút học hôm nay/tuần.
- Video đã xem.
- Game/bài tập đã làm.
- AI đã nói chuyện bao nhiêu lượt/phút.
- Streak.
- Chủ đề đang học.
- Kỹ năng mạnh/yếu.
- Gợi ý ngày mai nên ôn gì.

API đề xuất:

| Method | Endpoint | Mục đích |
|---|---|---|
| GET | `/v1/parent/children/:childId/learning-summary?range=7d` | Báo cáo ngắn |
| GET | `/v1/parent/children/:childId/skill-progress` | Tiến bộ theo kỹ năng |
| GET | `/v1/parent/children/:childId/activity-feed` | Dòng hoạt động gần đây |
| PATCH | `/v1/parent/children/:childId/learning-goals` | Cấu hình mục tiêu |

Acceptance criteria:

- Parent chỉ xem được child của mình.
- Report phân biệt `study time`, `device time`, `passive immersion time`, `AI time`.
- Có empty state dễ hiểu khi child chưa học.

### 8.7 Content CMS mở rộng

Yêu cầu bổ sung cho content editor/admin:

- Tạo game activity từ template.
- Gắn ảnh/audio cho question/game.
- Tạo AI scenario theo lesson.
- Quản lý prompt version.
- Xem preview child payload trước khi publish.
- Version/revision content khi đã published.

Acceptance criteria:

- Published content không bị sửa trực tiếp gây lệch attempt cũ.
- Nếu sửa đáp án/question sau publish, phải tạo revision hoặc ghi audit rõ.
- Không publish AI scenario nếu chưa có guardrail/prompt version active.

---

## 9. Luồng nghiệp vụ chính

### UC-L01: Child mở app và học hôm nay

1. Child/parent đăng nhập.
2. Web/mobile gọi home theo child.
3. API kiểm tra subscription, screen time, daily plan.
4. Nếu chưa có plan, API sinh plan.
5. Child bấm “Học tiếp”.
6. Hệ thống mở item đầu tiên: video/game/AI.
7. Mỗi item hoàn thành cập nhật plan status, progress, reward.
8. Hoàn thành đủ item thì ngày học chuyển `COMPLETED`.

### UC-L02: Xem video immersion

1. Child mở playlist hôm nay.
2. API trả danh sách video published, đúng entitlement.
3. Child xem video.
4. Frontend gửi watch event định kỳ.
5. Backend cập nhật exposure log, learning usage, lesson progress.
6. Nếu đạt điều kiện, item video hoàn thành.
7. Hệ thống chuyển sang game/practice kế tiếp.

### UC-L03: Làm bài tập/trò chơi

1. Child mở activity/game.
2. API trả payload đã ẩn đáp án đúng.
3. Child chơi/trả lời.
4. Frontend submit attempt.
5. Backend chấm điểm, lưu attempt detail.
6. Backend cập nhật skill progress/mistake pattern.
7. Nếu đạt điểm tối thiểu, item hoàn thành và có reward.

### UC-L04: Nói chuyện với AI sau video

1. Child hoàn thành video hoặc lesson.
2. Hệ thống đề xuất AI scenario tương ứng.
3. Child bắt đầu AI session.
4. API kiểm tra entitlement/quota/safety.
5. AI hỏi ngắn theo target phrases.
6. Child trả lời text/voice.
7. Backend lưu message, token/cost, feedback.
8. Hết lượt hoặc hoàn thành objective thì session kết thúc.

### UC-L05: Parent xem báo cáo tuần

1. Parent mở dashboard child.
2. API tổng hợp usage, progress, attempts, AI sessions.
3. UI hiển thị học đều hay không, kỹ năng nào yếu, đề xuất ôn tập.
4. Parent có thể cấp thêm thời gian hoặc điều chỉnh mục tiêu.

### UC-L06: Content editor tạo lesson có video + game + AI

1. Content editor tạo lesson draft.
2. Gắn video.
3. Tạo activity/game từ template.
4. Tạo AI scenario theo lesson.
5. Submit review.
6. Admin preview child payload.
7. Publish nếu đủ điều kiện.

---

## 10. API groups đề xuất

| Nhóm API | Prefix đề xuất | Ghi chú |
|---|---|---|
| Child learning home | `/v1/learning/children/:childId/home` | API tổng hợp cho child mode |
| Daily plan | `/v1/learning/children/:childId/daily-plans` | Sinh/xem/cập nhật kế hoạch |
| Immersion | `/v1/learning/children/:childId/immersion-playlists` | Playlist tắm video |
| Watch event | `/v1/learning/watch-events` | Mở rộng API hiện có |
| Practice/game | `/v1/learning/activities` | Play payload + submit attempts |
| Reward | `/v1/learning/children/:childId/rewards` | Sticker/badge/star |
| Skill progress | `/v1/learning/children/:childId/skills` | Tiến bộ theo kỹ năng |
| AI Buddy | `/v1/ai-buddy` | AI thật, quota, session, scenario |
| Parent learning report | `/v1/parent/children/:childId/learning-*` | Summary/skill/activity feed |
| Admin learning content | `/v1/admin/content` | Mở rộng game/AI/revision |

---

## 11. Acceptance checklist tổng

### 11.1 P0 — MVP học tập có thể dùng/bán thử

- [ ] Child home có API tổng hợp và UI tối giản.
- [ ] Mỗi child có daily plan hôm nay.
- [ ] Video watch event cập nhật progress/usage ổn định.
- [ ] Practice/game tối thiểu 2 loại: `PICTURE_CHOICE`, `LISTEN_CHOOSE` hoặc quiz hiện tại được game hóa giao diện.
- [ ] Parent report 7 ngày phân biệt học/xem/video/game.
- [ ] Entitlement/subscription được kiểm tra trước khi học.
- [ ] AI mock được tách rõ khỏi production; chưa bật AI thật thì UI không quảng cáo sai.
- [ ] Có smoke test: login parent, chọn child, học video, làm bài, xem report.

### 11.2 P1 — Tăng giữ chân học viên

- [ ] Immersion playlist có auto next/replay.
- [ ] Reward/sticker/streak hoạt động.
- [ ] Skill progress có dữ liệu từ attempt.
- [ ] Content editor tạo game activity từ CMS.
- [ ] Có spaced repetition rule cơ bản.
- [ ] Có notification/reminder học tập.

### 11.3 P2 — AI learning thật

- [ ] AI provider thật được tích hợp sau service boundary.
- [ ] Có AI scenario, prompt version, safety prompt.
- [ ] Có quota AI theo child/package.
- [ ] Có lưu token/cost/moderation metadata.
- [ ] Có after-video AI conversation.
- [ ] Có voice/speaking attempt nếu triển khai speaking.

### 11.4 P3 — Mobile/PWA và scale

- [ ] API dùng được cho mobile/PWA.
- [ ] Media chuyển sang object storage/CDN/signed URL.
- [ ] Có refresh token/device session.
- [ ] Có offline/cache/sync queue nếu business yêu cầu.
- [ ] Có e2e test cho child learning flow.

---

## 12. Test cases ưu tiên cho coder

| Test | Kỳ vọng |
|---|---|
| Parent login rồi lấy danh sách child | Chỉ thấy child của parent đó |
| Child hết subscription | Không học premium, hiện thông báo gia hạn |
| Child chưa có daily plan | API sinh plan hợp lệ |
| Plan có video unpublished | Không được đưa vào plan |
| Watch 10% video | Không completed nếu minWatchPercent cao hơn |
| Submit game attempt | Backend chấm điểm, không tin client score |
| Parent xem report | Số liệu khớp usage/progress/attempt |
| AI vượt quota | API từ chối có message rõ |
| AI provider lỗi | Không mất session, trả lỗi có kiểm soát |
| Content sửa sau publish | Có revision/audit hoặc bị chặn theo policy |

---

## 13. Gợi ý thứ tự giao việc cho coder

### Sprint L1 — Stabilize learning core

1. Rà soát `ChildProfile` + `Subscription` + access guard.
2. Tạo/chuẩn hóa API child home.
3. Chuẩn hóa watch event và learning usage.
4. Viết smoke test video + practice + parent report.

### Sprint L2 — Daily plan + immersion

1. Thêm `DailyLearningPlan`, `DailyLearningPlanItem`.
2. Sinh plan rule-based.
3. Thêm playlist/today plan UI.
4. Gắn plan item status với watch/practice.

### Sprint L3 — Game engine + reward

1. Thêm `GameActivityConfig`.
2. Làm 2 game type đầu tiên.
3. Thêm reward catalog/ledger.
4. Tích hợp reward vào child home.

### Sprint L4 — AI Buddy boundary

1. Tách AI service boundary khỏi mock.
2. Thêm scenario/prompt version/quota.
3. Tạo after-video AI session.
4. Log token/cost/moderation.

### Sprint L5 — Parent insight + mobile readiness

1. Báo cáo 7/30 ngày.
2. Skill progress.
3. API contract/OpenAPI/types.
4. Chuẩn bị PWA/mobile.

---

## 14. Rủi ro và lưu ý kỹ thuật

| Rủi ro | Ảnh hưởng | Cách xử lý |
|---|---|---|
| AI mock bị hiểu nhầm là AI thật | Sản phẩm bán ra không đúng cam kết | Tách mode `mock/dev` và `production` rõ |
| Game engine làm quá phức tạp ngay | Chậm MVP | Làm 2 game type trước |
| Daily plan sinh sai content | Child học sai trình độ/quyền | Validate published + entitlement + level |
| Không tách child/parent đúng | Lộ dữ liệu giữa trẻ | Test permission nghiêm |
| Video local storage | Khó scale/mất file | P0 giữ tạm, P2 chuyển CDN/storage |
| AI cost vượt kiểm soát | Lỗ khi bán gói | Quota và usage ledger từ đầu |
| Frontend child mode dùng lại admin UI | Trẻ không thích học | Tách child UX riêng |

---

## 15. Câu hỏi nghiệp vụ cần chốt

1. Child học qua tài khoản parent hay có tài khoản child riêng?
2. Một subscription áp dụng cho một child hay nhiều child?
3. Package có giới hạn số phút AI/ngày/tháng không?
4. Có cho child học offline không?
5. Video là YouTube, upload nội bộ hay cả hai?
6. Trò chơi cần ưu tiên listening hay vocabulary trước?
7. AI speaking có cần voice ngay giai đoạn đầu không?
8. Parent có được tự chọn chủ đề/lộ trình cho con không?
9. Có cần giáo viên thật chấm speaking/writing không?
10. KPI học tập nào sẽ đưa lên landing để bán hàng: phút học, streak, số câu nói, level, kỹ năng?

---

## 16. Định nghĩa hoàn thành nhánh học tập

Nhánh học tập được coi là đạt MVP thương mại khi:

- Một phụ huynh mua/kích hoạt gói cho child xong có thể cho child học ngay.
- Child mở app thấy kế hoạch học hôm nay rõ ràng.
- Child xem video, làm game/bài tập, nhận reward.
- Parent xem được báo cáo học tập có ý nghĩa.
- Hệ thống kiểm soát được quyền học theo subscription.
- AI nếu được quảng cáo là tính năng sản phẩm thì phải là AI thật có quota/safety/logging; nếu chưa có AI thật thì phải ghi rõ là chưa bật.


---

# PHẦN BỔ SUNG V1.1 — Chuẩn hóa học liệu, quản lý học tập, screen time, game, AI và CMS

Ngày bổ sung: 2026-06-14  
Phiên bản: v1.1 bổ sung để kiểm tra code hiện trạng và chuẩn bị triển khai Sprint L1-L2  
Quyết định nghiệp vụ quan trọng: **giáo viên/chuyên gia phụ trách quyết định học liệu gì được đưa lên, thứ tự học như thế nào, chuẩn đầu ra của từng bài và chính sách ôn tập. Hệ thống không tự ý quyết định nội dung sư phạm; hệ thống chỉ hỗ trợ quản lý, kiểm soát, xuất bản, ghi nhận tiến độ, sinh kế hoạch hằng ngày theo lộ trình đã được giáo viên/chuyên gia duyệt.**

## 17. Bổ sung nguyên tắc phân quyền học liệu và lộ trình

### 17.1 Nguyên tắc lõi

1. **Giáo viên/chuyên gia là chủ sở hữu chuyên môn của học liệu.**  
   Giáo viên/chuyên gia quyết định bài nào học trước, bài nào học sau, nội dung nào phù hợp độ tuổi/trình độ nào, mục tiêu của từng bài là gì, và khi nào học viên cần ôn lại.

2. **App không thay giáo viên quyết định chuyên môn.**  
   Daily plan engine chỉ lấy dữ liệu từ learning path/content package đã được duyệt. Nếu có cá nhân hóa, hệ thống chỉ cá nhân hóa trong phạm vi cấu hình do giáo viên/chuyên gia cho phép.

3. **AI không được tự ý thay đổi lộ trình học.**  
   AI có thể gợi ý hoặc hỗ trợ luyện tập trong scenario đã duyệt. AI không được tự phát sinh bài học mới, chuyển level, bỏ qua prerequisite, hoặc thay đổi chuẩn đánh giá nếu chưa có cơ chế duyệt của giáo viên/chuyên gia.

4. **Phụ huynh được điều chỉnh mục tiêu học trong khung cho phép.**  
   Ví dụ: tăng nghe thụ động, tăng luyện nói, ôn lại nhiều hơn. Tuy nhiên lựa chọn này chỉ tác động đến trọng số trong kế hoạch học; không phá thứ tự lộ trình đã được duyệt.

5. **Content editor là người vận hành học liệu, không phải người quyết định chuyên môn cuối cùng.**  
   Content editor có thể nhập video, câu hỏi, game, audio, transcript, AI scenario; nhưng publish cần theo workflow kiểm duyệt.

### 17.2 Vai trò bổ sung

| Vai trò | Trách nhiệm |
|---|---|
| `CURRICULUM_OWNER` | Chốt khung chương trình, level, learning path, chuẩn đầu ra, quy tắc prerequisite/review/mastery. |
| `TEACHER_EXPERT` | Thiết kế lesson package, chọn học liệu, thứ tự bài, từ vựng/mẫu câu, bài tập/game/AI scenario tương ứng. |
| `CONTENT_EDITOR` | Nhập liệu vào CMS: video, transcript, câu hỏi, ảnh/audio, game config, AI scenario draft. |
| `QA_REVIEWER` | Kiểm nội dung đúng level, đúng đáp án, an toàn trẻ em, audio/ảnh/video đủ chất lượng. |
| `ADMIN` | Publish/archive, phân quyền, cấu hình hệ thống, xử lý sự cố. |
| `AI_TUTOR_SYSTEM` | Luyện tập theo scenario đã duyệt, không tự quyết định chương trình học. |

### 17.3 Quyết định chuyên môn do giáo viên/chuyên gia nắm

| Nhóm quyết định | Ví dụ |
|---|---|
| Cấu trúc chương trình | Course nào, unit nào, lesson nào, thứ tự nào. |
| Level/trình độ | Bài thuộc level nào, phù hợp tuổi nào, prerequisite nào. |
| Nội dung đầu vào | Video nào, transcript nào, audio nào, hình ảnh nào. |
| Mục tiêu bài học | Từ vựng nào, mẫu câu nào, kỹ năng nào. |
| Bài tập/game | Câu hỏi nào, game nào, đáp án nào, mức điểm đạt. |
| AI scenario | AI hỏi gì, luyện mẫu câu nào, tối đa bao nhiêu lượt. |
| Ôn tập | Sai gì thì ôn lại khi nào, review item nào được đưa vào plan. |
| Chuẩn đạt | Bao nhiêu % xem video, bao nhiêu điểm game, bao nhiêu lần luyện AI thì coi là hoàn thành. |

## 18. Chuẩn gói học liệu — Lesson Package Standard

Mục tiêu của phần này không phải quy định chuyên môn thay giáo viên, mà là tạo **khung dữ liệu thống nhất** để giáo viên/chuyên gia đóng gói học liệu vào hệ thống.

### 18.1 Một lesson package tối thiểu phải có

| Nhóm | Trường dữ liệu đề xuất | Ghi chú |
|---|---|---|
| Định danh | `courseId`, `unitId`, `lessonId`, `lessonCode`, `revision` | Dùng để versioning và audit. |
| Phân loại | `ageBand`, `levelCode`, `topic`, `skillFocus` | Do giáo viên/chuyên gia định nghĩa. |
| Mục tiêu | `learningObjectives`, `targetVocabulary`, `targetPhrases` | Không để trống với bài published. |
| Điều kiện học | `prerequisiteLessonIds`, `recommendedPreviousSkills` | Daily plan engine dùng để kiểm tra thứ tự. |
| Video/audio | `videoAssetIds`, `transcript`, `thumbnail`, `durationSec` | Phục vụ immersion và parent evidence. |
| Practice/game | `activityIds`, `gameConfigIds`, `minPassingScore` | Backend chấm, client không nhận đáp án đúng. |
| AI | `aiScenarioIds`, `targetTurns`, `allowedVocabulary` | AI luyện đúng bài, không chat chung chung. |
| Reward | `rewardPolicy`, `sticker/badge/star rule` | Tạo động lực cho trẻ. |
| Parent view | `parentSummary`, `whatChildPracticed`, `suggestedHomePractice` | Giúp phụ huynh thấy giá trị. |
| QA | `reviewStatus`, `reviewerId`, `qaChecklist`, `approvedAt` | Chỉ published khi pass QA. |

### 18.2 Điều kiện publish một lesson package

Một lesson chỉ được publish khi đạt tối thiểu:

- Có level/age/topic/skill focus.
- Có learning objective rõ.
- Có ít nhất một nội dung học chính: video/audio/story.
- Nếu có practice/game thì đáp án và scoring rule đã được backend hiểu.
- Nếu có AI scenario thì phải có prompt version active và safety prompt.
- Có parent summary để phụ huynh hiểu con đang học gì.
- Đã pass QA nội dung và QA kỹ thuật.
- Nếu sửa lesson đã published và đã có attempt/progress, phải tạo revision mới hoặc ghi audit rõ.

### 18.3 Trạng thái lesson/content

| Status | Ý nghĩa |
|---|---|
| `DRAFT` | Đang nhập liệu, chưa kiểm. |
| `IN_REVIEW` | Đã gửi giáo viên/QA kiểm. |
| `APPROVED` | Đạt chuyên môn, chờ publish. |
| `PUBLISHED` | Học viên có thể học. |
| `ARCHIVED` | Không còn đưa vào plan mới, nhưng vẫn giữ lịch sử học. |
| `REPLACED` | Đã có revision mới thay thế. |

## 19. Bổ sung Daily Learning Plan Engine theo lộ trình đã duyệt

### 19.1 Nguyên tắc sinh plan

Daily plan engine không tự quyết định học liệu. Nó chỉ chọn item dựa trên:

1. Learning path đã published.
2. Lesson package đã published.
3. Prerequisite do giáo viên/chuyên gia cấu hình.
4. Entitlement/subscription của child.
5. Screen time policy của parent.
6. Progress/attempt/review need của child.
7. Các biến thể mục tiêu học do parent chọn trong giới hạn cho phép.

### 19.2 Thứ tự ưu tiên sinh plan P0

1. Nếu phụ huynh/giáo viên đã gán plan cụ thể cho ngày đó, dùng plan đó.
2. Nếu có lesson đang học dở trong learning path active, ưu tiên học tiếp.
3. Nếu có review item đến hạn theo rule đã cấu hình, thêm review item.
4. Nếu chưa có lesson dở, lấy lesson tiếp theo theo learning path đã published.
5. Nếu lesson có video, thêm video item.
6. Nếu lesson có activity/game, thêm practice/game item sau video.
7. Nếu lesson có AI scenario và child còn quota, thêm AI conversation item.
8. Nếu hoàn thành đủ item, cấp reward/streak theo policy.

### 19.3 Các giới hạn chống sinh plan sai

- Không đưa content `DRAFT`, `IN_REVIEW`, `ARCHIVED` vào plan.
- Không đưa content ngoài entitlement/gói học của child.
- Không bỏ qua prerequisite nếu lesson yêu cầu prerequisite.
- Không tạo nhiều hơn một active plan cho cùng child/ngày.
- Không tạo plan vượt daily/session cap do parent cài đặt.
- Không để AI tự thêm bài học chưa được duyệt.

### 19.4 Personalization scope

| Mức | Cho phép? | Ghi chú |
|---|---|---|
| Chọn lesson ngoài learning path | Không | Trừ khi teacher/admin gán. |
| Tăng review do sai nhiều | Có | Trong rule đã được cấu hình. |
| Chọn game thay quiz nếu cùng activity | Có | Nếu lesson package cho phép. |
| Tăng luyện nói nếu parent chọn mục tiêu speaking | Có | Nếu AI scenario/speaking activity tồn tại. |
| AI tự tạo nội dung mới | Không ở P0/P1 | Chỉ có thể đề xuất cho teacher review ở phase sau. |

## 20. Bổ sung Screen Time / Study Time Policy Engine

BA v1.0 đã phân biệt device time, study time, passive immersion time, AI time và game time. V1.1 yêu cầu biến phần này thành policy engine rõ ràng.

### 20.1 Các loại thời gian cần tách

| Loại thời gian | Ý nghĩa | Có tính vào học chính không? |
|---|---|---|
| `deviceMinutes` | Tổng thời gian app mở/child session active | Không mặc định. |
| `activeStudyMinutes` | Thời gian tương tác học thật: xem active, làm bài, nói AI | Có. |
| `passiveImmersionMinutes` | Nghe/xem thụ động theo playlist | Có nhưng tách riêng. |
| `videoMinutes` | Thời gian video thực sự phát | Tùy mode. |
| `gameMinutes` | Thời gian chơi game học tập | Có. |
| `aiMinutes` | Thời gian phiên AI | Có, theo quota. |
| `idleMinutes` | Mở app nhưng không tương tác | Không. |

### 20.2 Chính sách cài đặt bởi parent/admin

| Field đề xuất | Ý nghĩa |
|---|---|
| `dailyDeviceCapMinutes` | Giới hạn tổng thời gian dùng app/ngày. |
| `dailyActiveStudyTargetMinutes` | Mục tiêu học chủ động/ngày. |
| `dailyActiveStudyCapMinutes` | Trần học chủ động/ngày. |
| `dailyPassiveImmersionCapMinutes` | Trần nghe/xem thụ động/ngày. |
| `dailyAiCapMinutes` | Trần AI/ngày. |
| `dailyGameCapMinutes` | Trần game/ngày. |
| `sessionCapMinutes` | Một phiên học tối đa bao lâu. |
| `breakAfterMinutes` | Sau bao nhiêu phút thì nhắc nghỉ. |
| `breakDurationMinutes` | Thời gian nghỉ đề xuất. |
| `bedtimeStart`, `bedtimeEnd` | Khung giờ không học. |
| `weekdayPolicyJson` | Chính sách khác nhau theo ngày trong tuần. |
| `parentGrantEnabled` | Cho phép con xin thêm thời gian. |
| `maxParentGrantMinutesPerDay` | Tổng số phút phụ huynh có thể cấp thêm. |

### 20.3 Parent grant

Luồng nghiệp vụ:

1. Child hết thời gian hoặc sắp hết thời gian.
2. App hiện thông báo thân thiện: “Con đã học rất tốt hôm nay. Hỏi bố/mẹ để học thêm nhé.”
3. Child gửi yêu cầu thêm 10/15/30 phút.
4. Parent nhận thông báo hoặc mở app duyệt.
5. Hệ thống tạo `DeviceTimeGrant` có thời hạn và lý do.
6. Usage engine cộng thêm thời gian theo grant, có audit.

### 20.4 Chống tính giờ học ảo

- Video pause thì không tính videoMinutes.
- App background quá ngưỡng thì dừng tính activeStudyMinutes.
- Không tương tác trong thời gian dài thì chuyển sang idle.
- Passive immersion phải được đánh dấu mode riêng, không nhập nhằng với active study.
- Một child dùng nhiều thiết bị thì usage cộng dồn theo childProfileId.
- Client chỉ gửi event; backend quyết định tính phút hợp lệ.

## 21. Bổ sung Game Payload Schema v1

Mục tiêu: coder có schema tối thiểu để làm 2 game P0 mà không hiểu mỗi người một kiểu.

### 21.1 `PICTURE_CHOICE`

Mục tiêu: trẻ nghe/đọc từ hoặc câu ngắn rồi chọn tranh đúng.

Public payload trả cho client không chứa đáp án đúng:

```json
{
  "activityId": "act_001",
  "gameType": "PICTURE_CHOICE",
  "title": "Choose the picture",
  "prompt": {
    "promptType": "audio_text",
    "text": "cat",
    "audioUrl": "https://.../cat.mp3",
    "imageUrl": null
  },
  "options": [
    {"optionId": "opt_a", "imageUrl": "https://.../cat.png", "label": null},
    {"optionId": "opt_b", "imageUrl": "https://.../dog.png", "label": null},
    {"optionId": "opt_c", "imageUrl": "https://.../fish.png", "label": null}
  ],
  "settings": {
    "randomizeOptions": true,
    "maxAttempts": 2,
    "feedbackMode": "instant",
    "timeLimitSec": 30
  }
}
```

Submit payload:

```json
{
  "childProfileId": "child_001",
  "activityId": "act_001",
  "answers": [
    {"questionId": "q_001", "selectedOptionId": "opt_a", "responseTimeMs": 4200}
  ],
  "clientStartedAt": "2026-06-14T08:00:00+07:00",
  "clientSubmittedAt": "2026-06-14T08:00:12+07:00"
}
```

Backend result:

```json
{
  "attemptId": "att_001",
  "score": 1,
  "maxScore": 1,
  "passed": true,
  "feedback": "Great job!",
  "rewardGranted": true
}
```

### 21.2 `LISTEN_CHOOSE`

Mục tiêu: trẻ nghe audio rồi chọn đáp án đúng. Có thể chọn tranh hoặc chữ tùy level.

Public payload:

```json
{
  "activityId": "act_002",
  "gameType": "LISTEN_CHOOSE",
  "title": "Listen and choose",
  "prompt": {
    "promptType": "audio",
    "audioUrl": "https://.../i-like-apples.mp3",
    "textHidden": true
  },
  "options": [
    {"optionId": "opt_a", "text": "I like apples.", "imageUrl": null},
    {"optionId": "opt_b", "text": "I like bananas.", "imageUrl": null},
    {"optionId": "opt_c", "text": "I like cats.", "imageUrl": null}
  ],
  "settings": {
    "allowReplayAudio": true,
    "maxReplayCount": 3,
    "randomizeOptions": true,
    "feedbackMode": "after_submit"
  }
}
```

### 21.3 Quy tắc backend chấm điểm

- Client không nhận `correctOptionId`.
- Backend đọc answer key từ DB/revision hiện hành.
- Mỗi attempt lưu raw input của child.
- Nếu content đã có revision mới, attempt vẫn tham chiếu revision cũ.
- Score, passed, feedback, reward đều do backend quyết định.
- Nếu phát hiện payload không khớp revision, reject hoặc tạo lỗi kiểm soát.

## 22. Bổ sung AI Safety & Parent Transparency

### 22.1 Nguyên tắc AI Buddy

AI Buddy là công cụ luyện tập theo lesson/scenario, không phải chatbot tự do hoàn toàn.

Bắt buộc:

- Session phải gắn `childProfileId`.
- Session phải gắn `scenarioId` nếu là bài học có scenario.
- Prompt version phải active.
- Có moderation input/output.
- Có quota theo child/package.
- Có logging token/cost/provider/model.
- Có parent-facing summary.
- Không cho client gửi system prompt, hidden prompt hoặc đổi role.

### 22.2 Parent transparency

Parent dashboard cần hiển thị tối thiểu:

| Trường | Ý nghĩa |
|---|---|
| `aiSessionsCount` | Số phiên AI trong kỳ. |
| `aiTurnsCount` | Số lượt hội thoại. |
| `targetPhrasesPracticed` | Mẫu câu con đã luyện. |
| `topicsPracticed` | Chủ đề đã nói. |
| `safetyStatus` | Bình thường/có nội dung bị chặn/cần review. |
| `blockedEventsCount` | Số lần moderation chặn. |
| `parentSummary` | Tóm tắt dễ hiểu cho phụ huynh. |
| `quotaUsed` | Đã dùng bao nhiêu lượt/phút/token theo gói. |

### 22.3 Chính sách transcript

P0 đề xuất:

- Lưu transcript đầy đủ ở backend để audit/safety.
- Parent xem summary mặc định, không cần xem toàn bộ nếu UI chưa làm.
- Admin/QA có thể xem transcript khi xử lý khiếu nại hoặc kiểm lỗi.
- Có retention policy: lưu bao lâu, xóa thế nào khi cần.

### 22.4 Voice/STT/TTS boundary

Nếu chưa triển khai voice ở P0:

- Không quảng cáo là speaking AI thật.
- Chỉ ghi rõ: text chat hoặc guided conversation.
- Speaking attempt/voice cần tách boundary: upload audio, STT, pronunciation scoring, TTS voice, storage, consent.

Nếu triển khai voice:

- File audio gắn `childProfileId`, `sessionId`, `attemptId`.
- Có chính sách lưu/xóa audio.
- Có timeout, giới hạn dung lượng, định dạng file.
- STT/TTS provider phải được ghi ledger chi phí.

## 23. Bổ sung Content CMS Workflow

### 23.1 Workflow học liệu

```text
DRAFT -> IN_REVIEW -> APPROVED -> PUBLISHED -> ARCHIVED
                       |             |
                       |             -> REPLACED nếu có revision mới
                       -> NEEDS_REVISION nếu QA không đạt
```

### 23.2 Publish gate

Không cho publish nếu:

- Thiếu objective/level/age/topic.
- Video/audio asset lỗi hoặc chưa ready.
- Game thiếu answer key/scoring rule.
- Question public payload lộ đáp án.
- AI scenario chưa có prompt version active/safety prompt.
- Chưa có parent summary.
- Chưa pass QA checklist.
- Người publish không có quyền.

### 23.3 QA checklist tối thiểu

| Nhóm QA | Câu hỏi kiểm tra |
|---|---|
| Sư phạm | Bài đúng level/tuổi chưa? Từ vựng/mẫu câu có quá tải không? |
| Nội dung | Video/audio/ảnh có phù hợp trẻ em không? Có lỗi chính tả/phát âm không? |
| Kỹ thuật | Asset có load được không? Payload có đủ không? |
| Bài tập | Đáp án đúng chưa? Distractor có hợp lý không? |
| AI | Prompt có giới hạn chủ đề, lượt nói, level, safety chưa? |
| Parent view | Phụ huynh có hiểu con học gì và tiến bộ gì không? |

### 23.4 Version/revision policy

- Content published không sửa trực tiếp nếu đã có học viên học.
- Sửa lỗi nhỏ có thể patch nhưng phải ghi audit.
- Sửa nội dung ảnh hưởng đáp án/điểm/learning objective phải tạo revision mới.
- Attempt/progress luôn lưu `contentRevisionId` để báo cáo không bị lệch.

### 23.5 Bulk import/export

P1 nên hỗ trợ import học liệu hàng loạt:

- CSV/Excel/JSON cho vocabulary/question/activity.
- Upload asset theo batch.
- Validate trước khi import.
- Báo lỗi dòng nào, trường nào.
- Import vào `DRAFT`, không tự publish.

## 24. Bổ sung Learning Evidence & Parent Report Standard

### 24.1 Nguyên tắc báo cáo

Parent report không chỉ báo “con học bao nhiêu phút”. Báo cáo phải chứng minh được:

1. Con học đều hay không.
2. Con tiếp xúc tiếng Anh qua video/audio bao nhiêu.
3. Con có tương tác thật qua game/bài tập không.
4. Con luyện được từ/mẫu câu/chủ đề nào.
5. Con yếu ở kỹ năng hoặc nhóm lỗi nào.
6. Con có dùng AI an toàn và đúng mục tiêu không.
7. Tuần sau nên ôn gì.

### 24.2 KPI học tập đề xuất

| KPI | Ý nghĩa |
|---|---|
| `activeStudyMinutes` | Phút học chủ động. |
| `passiveImmersionMinutes` | Phút tắm nghe/xem thụ động. |
| `completedPlanDays` | Số ngày hoàn thành plan. |
| `streakDays` | Số ngày học liên tục. |
| `videosCompleted` | Video xem đạt điều kiện. |
| `gamesCompleted` | Game/bài tập hoàn thành. |
| `averagePracticeScore` | Điểm trung bình practice/game. |
| `targetVocabularyPracticed` | Từ đã luyện trong kỳ. |
| `targetPhrasesPracticed` | Mẫu câu đã luyện trong kỳ. |
| `aiTurnsCount` | Lượt hội thoại AI. |
| `weakSkills` | Kỹ năng yếu cần ôn. |
| `reviewItemsDue` | Nội dung đến hạn ôn. |

### 24.3 Parent-facing wording

Báo cáo phụ huynh nên dùng ngôn ngữ dễ hiểu, ví dụ:

- “Tuần này con học 5/7 ngày.”
- “Con đã luyện chủ đề Animals và Food.”
- “Con nghe/xem tiếng Anh 42 phút, làm 18 câu luyện tập.”
- “Con cần ôn lại nhóm từ về màu sắc.”
- “Con đã luyện nói 12 lượt với AI Buddy theo mẫu câu: I like …”

Không nên chỉ hiện biểu đồ kỹ thuật hoặc thuật ngữ như `attempt`, `exposure`, `token`.

## 25. Bổ sung yêu cầu audit hiện trạng code trước khi triển khai

Trước khi giao coder viết mới, cần có một vòng Codex kiểm tra code hiện trạng để xác định:

- Entity/module nào đã có thật.
- API nào đã tồn tại.
- Phần nào đang mock/dev-only.
- Phần nào thiếu migration/schema.
- Permission parent/child đã chắc chưa.
- Watch event/usage/progress đang hoạt động đến đâu.
- Practice/game backend chấm điểm hay client tự chấm.
- AI chat đang mock hay provider thật.
- Parent report hiện có dữ liệu gì.
- Test hiện có và smoke flow có chạy được không.

Kết quả audit phải có evidence từ file code, route, migration, test, command output. Không được kết luận “đã có” nếu không chỉ ra bằng chứng.

## 26. Acceptance checklist cập nhật v1.1

### 26.1 Bắt buộc trước khi code tính năng mới

- [ ] Có báo cáo audit code hiện trạng theo prompt Codex.
- [ ] Có inventory route/API hiện tại.
- [ ] Có inventory DB/entity/migration hiện tại.
- [ ] Có phân loại `IMPLEMENTED`, `PARTIAL`, `MOCK_DEV_ONLY`, `MISSING`, `UNKNOWN` cho từng nhóm BA.
- [ ] Có xác định Sprint L1 nên sửa gì trước.

### 26.2 Bắt buộc cho phần học liệu/CMS

- [ ] Có workflow `DRAFT/IN_REVIEW/APPROVED/PUBLISHED/ARCHIVED` hoặc có kế hoạch migrate tương đương.
- [ ] Published content không sửa trực tiếp gây lệch attempt cũ.
- [ ] Có parent summary trong lesson package.
- [ ] Có audit cho publish/archive/revision.
- [ ] Có QA checklist hoặc ít nhất field để lưu kết quả QA.

### 26.3 Bắt buộc cho daily plan

- [ ] Plan lấy từ learning path/lesson package đã published.
- [ ] Không đưa content chưa publish/hết entitlement/vượt screen time vào plan.
- [ ] Không để AI tự quyết định thứ tự bài.
- [ ] Có rule học tiếp/review/lesson tiếp theo.

### 26.4 Bắt buộc cho screen time

- [ ] Tách device/active/passive/game/AI/idle minutes.
- [ ] Backend quyết định thời gian hợp lệ, không tin hoàn toàn client.
- [ ] Có daily/session cap.
- [ ] Có parent grant hoặc có thiết kế rõ để bổ sung.

### 26.5 Bắt buộc cho AI Buddy

- [ ] Tách rõ mock/dev và production.
- [ ] Session gắn child/scenario/prompt version.
- [ ] Có quota/cost/token/provider/model ledger.
- [ ] Có moderation/safety boundary.
- [ ] Có parent summary/safety status.

## 27. Production hardening and go-live gate

Phase nay bat buoc chay sau khi MVP/local-demo pass va truoc moi quyet dinh deploy that. Phase nay khong tu dong bat production. `production_ready` mac dinh van la `false` cho den khi go-live gate du bang chung va co manual approval.

### 27.1 Nguyen tac test khong duoc ha chuan

- [ ] Khong sua, xoa, skip, relax, rename test/acceptance hien co chi de pass.
- [ ] Neu test fail, phai fix code, demo data, fixture, config, hoac evidence truoc.
- [ ] Chi sua test khi chung minh test sai voi BA/truc; phai tao `TEST_STANDARD_CHANGE_REQUEST.md`.
- [ ] Moi test bi skip phai co ly do, owner, risk va follow-up.
- [ ] Duoc them test de tang coverage, khong duoc giam coverage hien co.

### 27.2 Demo data bat buoc

- [ ] Parent co it nhat 2 child/student: active, expired/no entitlement.
- [ ] Student/child co course/package/enrollment/subscription/daily plan/progress/report evidence.
- [ ] Teacher co class/course scope, review queue, intervention, remedial/support plan, escalation/closure case.
- [ ] Admin/support/ops co evidence xu ly config, report, issue, audit/read-only monitoring.
- [ ] Sales/channel/finance neu lien quan subscription: lead/order/payment fixture/refund fixture/commission fixture/payout fixture.
- [ ] Moi role co happy path, denied path, expired/inactive path, permission negative path.
- [ ] Demo data phai du cho dashboard/report UI va API evidence; khong chi du cho smoke 200.

### 27.3 Test matrix bat buoc truoc deploy

- [ ] Auth/session: login, logout, expired token, revoked session/device, wrong role.
- [ ] RBAC/data permission: parent chi thay child cua minh; teacher chi thay scope duoc giao; admin/support co audit.
- [ ] Enrollment/subscription/entitlement: active, trialing, pending payment, expired, revoked, refunded.
- [ ] Daily plan/screen time: allowed, blocked by entitlement, blocked by screen time, parent grant, stale/invalid plan.
- [ ] Learning evidence: lesson/video/practice completion, retry, support, unresolved, escalation, resolution.
- [ ] Parent/teacher reports: approved preview visible, held preview hidden, read/ack, privacy redaction.
- [ ] AI Buddy: mock/dev boundary, moderation/safety, quota/cost ledger, no false production AI claim.
- [ ] Payment/refund/provider: fixture-only unless manual production approval; no live mutation in auto-loop.
- [ ] API contract/error: validation errors, not found, forbidden, conflict/idempotency where relevant.
- [ ] Build/lint/unit/e2e/smoke: command evidence captured in `TESTS_RUN.md`.

### 27.4 Go-live gate output

Moi hardening job phai tao hoac cap nhat cac artifact sau khi scope lien quan:

- `PRODUCTION_HARDENING_PLAN.md`
- `DEMO_DATA_MATRIX.md`
- `ROLE_PERMISSION_TEST_MATRIX.md`
- `E2E_SMOKE_TEST_MATRIX.md`
- `DEPLOY_READINESS_GAPS.md`
- `GO_LIVE_GATE_REPORT.md`
- `TEST_STANDARD_CHANGE_REQUEST.md` neu co de xuat sua test/acceptance

### 27.5 Hard-stop trong auto-loop

- [ ] Khong doc/ghi production DB.
- [ ] Khong goi provider/payment/refund/notification/AI live API.
- [ ] Khong deploy production.
- [ ] Khong mutate real customer/student/order/payment data.
- [ ] Khong dat `production_ready=true` neu chua co manual go-live approval.

---

# Tóm tắt thay đổi v1.1

V1.1 không thay đổi định hướng module của BA v1.0. V1.1 bổ sung 6 điểm để tài liệu đủ vững trước khi kiểm tra code và triển khai:

1. Giáo viên/chuyên gia quyết định học liệu và thứ tự học; hệ thống chỉ vận hành theo lộ trình đã duyệt.
2. Chuẩn hóa lesson package để học liệu có thể nhập, kiểm, publish, version, audit.
3. Daily plan engine phải dựa trên learning path/published content/prerequisite/entitlement/screen time.
4. Screen time phải thành policy engine, không chỉ đếm phút.
5. Game và AI cần schema/boundary rõ để coder không triển khai lệch.
6. Parent report phải chứng minh giá trị học tập bằng evidence, không chỉ thống kê thời gian.
