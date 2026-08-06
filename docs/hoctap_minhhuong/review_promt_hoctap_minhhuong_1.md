# Review kết quả Codex — Promt học tập Minh Hương 1 — Learning Branch Audit

Ngày review: 2026-06-14  
Dự án: Minh Hương Learning Platform  
Nhánh: Học tập / Learning Branch  
Review theo: `promt_chatgptweb_hoctap_minhhuong_1.md`  
Input chính: `ketqua_promt_hoctap_mihhuong_1.md`, `ketqua_promt_hoctap_mihhuong_1.json` và các file inventory/gap/test/evidence phụ.

---

## 1. Phán quyết

**Kết luận:** ĐẠT CÓ ĐIỀU KIỆN.

**Điểm tin cậy evidence:** 7/10.  
**Readiness nhánh học tập theo audit Codex:** 4/10.  
**Có thể chuyển sang `promt_hoctap_minhhuong_2.md` chưa:** Có, nhưng chỉ được chuyển sang **Sprint L1A Foundation/Security/Entitlement**, chưa được nhảy sang game, AI provider thật, daily plan nâng cao, mobile/PWA hoặc learning path phức tạp.

Lý do đạt có điều kiện:

1. Codex đã audit đúng nhánh học tập, có route/entity/gap/test/build inventory, phân loại `PARTIAL`, `MISSING`, `MOCK_DEV_ONLY` khá nhất quán.
2. Codex chỉ ra đúng các rủi ro P0: child-scoped authorization chưa đồng nhất, `/ai-chat` public/mock-only, `/billing/users/:userId/*` public, thiếu learning path/content package, daily plan in-memory, screen-time chưa tách active/passive/game/AI.
3. Codex chạy được API test, API build, web build; lint không chạy vì script có `--fix`, lý do hợp lệ trong audit read-only.
4. Điểm trừ lớn: khi Codex chạy audit, repo/workspace của Codex **không có** `00_truc_lamviec_hoctap_minhhuong*.md` và `ba_hoctap_minhhuong_v1_1_20260614.md`, nên Codex không đối chiếu trực tiếp được BA canonical. Vì vậy Prompt 2 bắt buộc phải bắt đầu bằng repo-sync/canonical file check.

**Quyết định:** Soạn `promt_hoctap_minhhuong_2.md` để làm Sprint L1A: đưa canonical files vào repo, sửa nền authorization/ownership, khóa route public, tạo entitlement service dùng chung, thêm negative tests. Không làm learning path/day plan/game/AI provider trong vòng 2.

---

## 2. File đã đọc và file còn thiếu

| File | Trạng thái trong review ChatGPT | Vai trò | Nhận xét |
|---|---|---|---|
| `00_truc_lamviec_hoctap_minhhuong.md` | Có | Trục làm việc canonical | Đã dùng để xác định quy ước chuỗi nhiều prompt. |
| `00_truc_lamviec_hoctap_minhhuong_20260614.md` | Có | Trục dated alias | Có thể dùng khi chuyển hội thoại. |
| `ba_hoctap_minhhuong_v1_1_20260614.md` | Có | BA canonical v1.1 | Đã dùng để đối chiếu gap. |
| `promt_hoctap_mihhuong_1.md` | Có | Prompt Codex vòng 1 | Codex có đọc file này. |
| `promt_chatgptweb_hoctap_minhhuong_1.md` | Có | Review instruction | Dùng làm chuẩn review. |
| `ketqua_promt_hoctap_mihhuong_1.md` | Có | Kết quả audit chính | Đủ cấu trúc executive/module/security/test/recommendation. |
| `ketqua_promt_hoctap_mihhuong_1.json` | Có | Kết quả có cấu trúc | Hữu ích để kiểm status, risks, blockers, score. |
| `promt_hoctap_mihhuong_1_route_inventory.md` | Có | Route inventory | Có phát hiện các route public/gap auth. |
| `promt_hoctap_mihhuong_1_entity_inventory.md` | Có | Entity inventory | Có mapping schema và missing entities. |
| `promt_hoctap_mihhuong_1_gap_matrix.md` | Có | Gap matrix | Có priority grouping P0/P1/P2/P3. |
| `promt_hoctap_mihhuong_1_evidence_index.md` | Có | Evidence index | Có 56 evidence items, đa số direct code/schema/route/test. |
| `promt_hoctap_mihhuong_1_test_build_lint.md` | Có | Test/build/lint | API test/build/web build pass; lint skipped hợp lý. |
| `promt_hoctap_mihhuong_1_next_recommendation.md` | Có | Đề xuất prompt sau | Hướng đề xuất đúng nhưng cần viết lại thành prompt vòng 2 đầy đủ hơn. |

File thiếu trong **môi trường Codex lúc audit**:

| File Codex báo thiếu | Ảnh hưởng |
|---|---|
| `00_truc_lamviec_hoctap_minhhuong_20260614.md` | Codex không nắm trục canonical trong repo. |
| `00_truc_lamviec_hoctap_minhhuong.md` | Codex không có single source of truth để duy trì chuỗi nhiều prompt. |
| `ba_hoctap_minhhuong_v1_1_20260614.md` | Codex không đối chiếu trực tiếp được BA v1.1; một số gap được suy ra từ prompt chứ không từ BA đầy đủ. |

Tác động: không làm hỏng toàn bộ audit vì Codex vẫn có evidence code tốt, nhưng giảm độ tin cậy khi đối chiếu BA. Vì vậy vòng 2 phải xử lý repo-sync trước.

---

## 3. Điểm Codex làm tốt

### 3.1 Audit đúng stack và phạm vi

Codex xác định repo là NestJS API, Prisma/PostgreSQL, Next.js web, versioning `/v1`, package manager npm. Đây là dấu hiệu audit bám repo thật, không chỉ lặp lại BA.

### 3.2 Có inventory đủ rộng cho nhánh học tập

Codex kiểm các nhóm chính:

- Identity/roles.
- Parent-child profiles.
- Entitlement/subscription.
- Content/CMS.
- Teacher content.
- Child learning home.
- Daily learning plan.
- Video immersion.
- Practice/game attempts.
- Screen time.
- AI Buddy.
- Parent report.
- Tests/build/lint.

Đây là đúng phạm vi BA học tập, không lan sai sang sale/agency/commission.

### 3.3 Phát hiện đúng rủi ro P0

Các phát hiện đáng tin nhất:

1. `/progress/*` có nguy cơ childProfileId injection vì JWT nhưng thiếu ownership check.
2. `/ai-chat/*` public, mock-only, client truyền childProfileId.
3. `/billing/users/:userId/*` public userId lookup.
4. Learning path/content package bị thiếu.
5. Daily learning plan đang in-memory, chưa có DB entity/idempotency.
6. Screen time chưa tách active/passive/video/game/AI/idle/background.
7. AI Buddy chưa production-ready.

### 3.4 Có command output baseline

Codex đã chạy:

- `npm --prefix apps/api run test -- --runInBand`: pass 6 suites/20 tests.
- `npm --prefix apps/api run build`: pass.
- `npm --prefix apps/web run build`: pass.
- Lint skipped vì script có `--fix`, phù hợp yêu cầu read-only.

---

## 4. Lỗi/gap trong báo cáo Codex

### 4.1 Gap lớn nhất: không đọc được BA/trục trong repo

Codex ghi rõ chỉ đọc được `promt_hoctap_mihhuong_1.md`, không tìm thấy trục/BA canonical. Đây là blocker về quy trình, không phải blocker về code. Vòng 2 phải đưa các file canonical vào repo trước khi code.

### 4.2 Chưa có bằng chứng `git status`/files changed

Audit là read-only nhưng chưa thấy báo cáo `git status --short` hoặc xác nhận cụ thể không có file code bị sửa. Do lint không chạy vì có `--fix`, khả năng sửa code thấp, nhưng Prompt 2 và các prompt sau phải bắt buộc có `git status` đầu/cuối hoặc files_changed.

### 4.3 Evidence line range là do Codex cung cấp, chưa có source code upload để reviewer xác minh trực tiếp

Các kết luận có path/line rõ, nhưng ChatGPT review hiện không có repo source code đầy đủ để tự mở lại từng file. Vì vậy review chấp nhận ở mức “evidence đáng tin có điều kiện”, không phải verified-by-source.

### 4.4 Next recommendation còn quá ngắn

File `promt_hoctap_mihhuong_1_next_recommendation.md` đúng hướng nhưng chưa đủ chuẩn để gửi Codex ngay. Cần bổ sung acceptance criteria, stop conditions, output file contract, không-code-scope, test commands, files_changed/evidence report.

### 4.5 Chưa tách rõ Prompt 2 nên code cái gì và không code cái gì

Nếu gửi prompt ngắn, Codex có thể vừa sửa auth, vừa làm learning path/daily plan. Điều đó rủi ro. Prompt 2 phải khóa phạm vi: chỉ canonical repo sync + child access + entitlement + test.

---

## 5. Evidence quality check

| Kết luận Codex | Evidence Codex đưa | Loại evidence | Đánh giá reviewer | Quyết định |
|---|---|---|---|---|
| Repo có NestJS/Prisma/PostgreSQL/Next.js | `app.module.ts`, `main.ts`, `schema.prisma`, `package.json`, `page.tsx` | Direct code/schema | Đủ tin cậy | Chấp nhận |
| Có ChildProfile nhưng student-child relation chưa rõ | `schema.prisma:217-235`, auth service | Direct schema/code | Hợp lý | Chấp nhận |
| Parent service có ownership nhưng progress/AI/billing còn gap | parent/progress/ai/billing controllers/services | Direct route/code | Rất quan trọng | Chấp nhận P0 |
| Learning access có active subscription check | `learning.service.ts:1121-1134` | Direct code | Có nhưng chỉ ở learning service | Chấp nhận PARTIAL |
| Content/CMS có draft/review/publish | schema + admin content service | Direct code/schema | Đủ cho PARTIAL | Chấp nhận |
| LearningPath/ContentPackage missing | search output + entity inventory | Missing evidence/search | Hợp lý nhưng cần xác minh lại ở Prompt 2 sau repo-sync | Chấp nhận có điều kiện |
| Daily plan in-memory | `learning.service.ts:728-836` | Direct code | Đủ tin cậy | Chấp nhận PARTIAL |
| Watch completion tin client event | learning service + DTO | Direct code | Rủi ro thật | Chấp nhận P2 |
| Practice payload hide answer key | learning service lines | Direct code | Điểm mạnh | Chấp nhận IMPLEMENTED |
| AI Buddy mock/dev-only | ai-chat service/controller + schema | Direct route/code/schema | Rất rõ | Chấp nhận MOCK_DEV_ONLY |
| Test/build pass | Command output | Command output | Baseline tốt | Chấp nhận |
| Lint skipped vì `--fix` | script behavior | Command/script evidence | Hợp lý | Chấp nhận |

---

## 6. Repo-sync check

**Kết luận:** Codex audit đúng repo code, nhưng chưa sync đúng tài liệu canonical.

Điểm đạt:

- Nêu đúng stack/framework/API versioning.
- Nêu đúng module học tập và module lân cận.
- Có route/entity/test inventory.
- Có build/test output.
- Không có dấu hiệu copy BA máy móc.

Điểm chưa đạt:

- Không đọc được trục và BA canonical.
- Tên file vòng 1 vẫn có alias sai chính tả `mihhuong`; từ vòng 2 phải dùng chuẩn `minhhuong`.
- Chưa có xác nhận canonical files được commit hoặc lưu trong repo.

Quyết định repo-sync cho vòng 2:

1. Đưa `00_truc_lamviec_hoctap_minhhuong.md` và `ba_hoctap_minhhuong_v1_1_20260614.md` vào repo.
2. Prompt 2 yêu cầu Codex đọc các file này trước khi code.
3. Nếu thiếu file, Codex phải dừng và báo blocker, không code tiếp.

---

## 7. Prompt-compliance check

| Yêu cầu Prompt 1 | Kết quả Codex | Đánh giá |
|---|---|---|
| Read-only/no-code | Không thấy báo cáo sửa code; lint skip vì tránh `--fix` | Đạt có điều kiện; cần git status ở vòng sau |
| Evidence first | Có evidence index, route/entity/test inventory | Đạt |
| Status taxonomy | Dùng `PARTIAL`, `MISSING`, `MOCK_DEV_ONLY`, `IMPLEMENTED` | Đạt |
| Output files | Có md/json và 6 file phụ | Đạt |
| Scope learning branch | Không lan sang sale/agency | Đạt |
| No curriculum decision | Tôn trọng nguyên tắc giáo viên/chuyên gia, phát hiện thiếu path/package | Đạt |
| No AI overclaim | AI được đánh `MOCK_DEV_ONLY` | Đạt |
| Permission/entitlement | Có kiểm sâu và phát hiện P0 | Đạt |
| Đọc BA/trục | Không đọc được do file thiếu trong workspace | Không đạt về repo-sync, nhưng Codex có ghi rõ blocker |

---

## 8. Gap code thật so với BA v1.1

Các gap phải đưa vào lộ trình sau review:

### P0 — Phải sửa trước khi mở rộng tính năng

1. Shared child ownership guard/service cho mọi API nhận `childProfileId`.
2. Khóa `/ai-chat` bằng JWT + child ownership; giữ mock/dev-only, không quảng cáo production AI.
3. Khóa hoặc đổi `/billing/users/:userId/*` để không còn public lookup theo userId.
4. Xử lý `/progress/*` để không cho truyền childProfileId của child khác.
5. Entitlement service dùng chung, không để mỗi service tự check rời rạc.
6. Đưa BA/trục vào repo để vòng sau không mất nguồn chuẩn.

### P1 — Sau P0 mới làm

1. LearningPath/ContentPackage/ChildContentAssignment do giáo viên/chuyên gia quản lý.
2. DailyLearningPlan/DailyLearningPlanItem persistent, idempotent theo child/day.
3. Package capabilities/quota cho video/practice/game/AI.

### P2 — Sau khi path/plan ổn

1. Watch event table/minWatchPercent/visibility/idle check.
2. Usage taxonomy: active study, passive immersion, game, AI, device.
3. Parent report 7/30 ngày, skill evidence, AI safety summary.

### P3 — Sau khi core vững

1. Reward/streak entity.
2. SkillProgress/mastery.
3. Game config nhiều loại.
4. AI provider thật, prompt version, moderation, token/cost ledger.

---

## 9. Rủi ro triển khai

1. **Rủi ro bảo mật child data:** nếu chưa sửa ownership mà thêm daily plan/game/AI, dữ liệu trẻ có thể bị đọc/ghi sai.
2. **Rủi ro AI production overclaim:** AI hiện mock/public; không được đưa lên landing/sản phẩm như AI thật.
3. **Rủi ro daily plan sai nguyên tắc:** nếu chưa có learning path/content package, hệ thống sẽ tiếp tục lấy global published lessons thay vì lộ trình do giáo viên/chuyên gia duyệt.
4. **Rủi ro tính giờ ảo:** screen-time/usage hiện còn đơn giản, chưa chống idle/background/pause.
5. **Rủi ro sửa content sau publish:** thiếu revision/version có thể làm lệch lịch sử attempt.

---

## 10. Quyết định bước tiếp theo

**Soạn `promt_hoctap_minhhuong_2.md`** với phạm vi:

- Phase: `L1A_FOUNDATION_SECURITY_ENTITLEMENT`.
- Loại việc: code allowed but tightly scoped.
- Bắt buộc đọc canonical files trong repo.
- Nếu thiếu canonical files, dừng và báo blocker.
- Sửa nền child access/ownership.
- Khóa route public liên quan AI/billing/progress.
- Tạo `EntitlementService` dùng chung.
- Viết negative tests ownership/unauth/entitlement.
- Không làm learning path, daily plan persistence, game engine, reward, AI provider, mobile/PWA.

Đồng thời soạn `promt_chatgptweb_hoctap_minhhuong_2.md` để review kết quả vòng 2.

---

## 11. Nội dung cần cập nhật vào trục làm việc

Cập nhật trạng thái:

- Promt 1: đã chạy Codex audit xong.
- Review Promt 1: đạt có điều kiện.
- Readiness hiện tại: 4/10.
- Evidence reliability: 7/10.
- Active next prompt: `promt_hoctap_minhhuong_2.md`.
- Phase tiếp theo: `L1A_FOUNDATION_SECURITY_ENTITLEMENT`.
- Điều kiện lớn: canonical files phải có trong repo trước khi code vòng 2.
- Prompt 2 không được triển khai learning path/day plan/game/AI provider; chỉ làm access/entitlement foundation.

---

## 12. Kết luận cuối

Kết quả Codex vòng 1 **đủ dùng làm nền quyết định kỹ thuật**, nhưng chưa đủ để triển khai các tính năng học tập sâu. Vòng 2 phải xử lý nền bảo mật/entitlement trước. Sau khi Prompt 2 pass, mới nên sang Prompt 3 để thiết kế hoặc triển khai LearningPath/ContentPackage do giáo viên/chuyên gia quản lý.
