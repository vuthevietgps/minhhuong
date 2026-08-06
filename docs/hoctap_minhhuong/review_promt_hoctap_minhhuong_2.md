# Review kết quả Codex — Promt học tập Minh Hương 2

Ngày review: 2026-06-14  
Dự án: Minh Hương Learning Platform  
Nhánh: Học tập / Learning Branch  
Phase được review: `L1A_FOUNDATION_SECURITY_ENTITLEMENT`  
Prompt được review: `promt_hoctap_minhhuong_2.md`  
Kết quả Codex: `ketqua_promt_hoctap_minhhuong_2.md/json` và các file phụ vòng 2

---

## 1. Phán quyết

- Phán quyết: **BLOCKED HỢP LỆ**.
- Evidence score cho trạng thái blocker: **8/10**.
- Điểm hoàn thành Sprint L1A code: **0/10** vì chưa được phép code.
- Có thể sang `promt_hoctap_minhhuong_3.md` chưa: **Không**.
- Bước tiếp theo đúng: tạo và chạy **`promt_hoctap_minhhuong_2B.md`** để gỡ blocker, đưa file canonical vào repo/workspace rồi chạy lại L1A security/entitlement.

Lý do: Codex đã dừng đúng yêu cầu của prompt khi không tìm thấy file trục làm việc, BA v1.1 và review vòng 1. Việc dừng là đúng vì prompt 2 cấm tự suy diễn BA khi thiếu file canonical. Tuy nhiên vì không code nên toàn bộ mục tiêu L1A như ChildAccessService, route hardening và EntitlementService vẫn chưa hoàn thành.

---

## 2. File đã đọc / file thiếu

### 2.1 File Codex báo đã đọc

| File | Trạng thái |
|---|---|
| `promt_hoctap_minhhuong_2.md` | READ |
| `promt_hoctap_mihhuong_1.md` | READ |
| `ketqua_promt_hoctap_mihhuong_1.md/json` trong audit-output vòng 1 | READ |
| route/entity/gap/evidence/test report vòng 1 | READ |

### 2.2 File Codex báo thiếu

| File | Trạng thái | Ảnh hưởng |
|---|---|---|
| `00_truc_lamviec_hoctap_minhhuong.md` | MISSING | Blocker bắt buộc |
| `00_truc_lamviec_hoctap_minhhuong_20260614.md` | MISSING | Blocker bắt buộc |
| `ba_hoctap_minhhuong_v1_1_20260614.md` | MISSING | Blocker bắt buộc |
| `review_promt_hoctap_mihhuong_1.md` | MISSING | Thiếu review nền vòng 1 |
| `review_promt_hoctap_minhhuong_1.md` | MISSING | Thiếu review nền vòng 1 |

Reviewer đồng ý: thiếu các file này làm Codex không đủ căn cứ để chốt quan hệ child/student, ownership và entitlement theo BA.

---

## 3. Codex làm đúng gì

1. **Dừng trước khi code** đúng theo rule trong prompt 2.
2. **Không sửa source code**, không tạo migration, không tạo service/guard khi thiếu BA/trục.
3. **Tạo đủ report blocker** gồm: kết quả chính, JSON, blocker, evidence index, files changed, security tests, test/build/lint và remaining gaps.
4. **Không nhảy scope** sang LearningPath, game, AI provider, daily plan hoặc UI lớn.
5. **Giữ lại các rủi ro từ vòng 1** thay vì giả vờ đã xử lý.

---

## 4. Lỗi/gap/blocker

Đây không phải lỗi code của Codex, mà là lỗi vận hành file đầu vào:

1. Bộ file đưa cho Codex vòng 2 thiếu trục làm việc và BA v1.1.
2. Thiếu review vòng 1 nên Codex không đọc được phán quyết ChatGPT Web đã chấp thuận vòng 1 có điều kiện.
3. Workspace không phải git repo hoặc Codex chạy sai thư mục repo; `git status --short` trả lỗi `not a git repository`.
4. Quan hệ `STUDENT` với `ChildProfile` vẫn chưa được chốt trong file BA/trục mà Codex nhìn thấy.

---

## 5. Review files_changed

Kết luận: **đúng**.

- Không có source code thay đổi.
- Không sửa các thư mục `apps/api/src`, `apps/api/prisma`, `apps/web/src`, `packages`.
- Chỉ tạo report trong `audit-output/promt_hoctap_minhhuong_2_l1a_foundation/`.
- `git status` không chạy được vì workspace không phải git repo.

Reviewer không coi đây là fail vì prompt 2 đã yêu cầu dừng trước khi code nếu thiếu canonical files. Nhưng ở vòng 2B cần xử lý rõ: nếu workspace không có `.git` nhưng đúng là source tree có `apps/api`, `apps/web`, `package.json`, Codex vẫn được phép code và phải báo `NO_GIT_CONTEXT`, đồng thời tự liệt kê files changed bằng filesystem diff/đường dẫn.

---

## 6. Review child access/ownership

Trạng thái: **NOT STARTED**.

Các việc chưa làm:

- Chưa tạo `ChildAccessService`/guard/helper.
- Chưa apply ownership check cho `/progress`, `/ai-chat`, `/billing`, `/learning`, `/parent`.
- Chưa có negative tests parent A/child B.
- Chưa có quy tắc rõ cho `STUDENT` role.

Quyết định BA tạm thời để gỡ blocker vòng 2B:

> L1A/MVP chọn mô hình: **phụ huynh đăng nhập và chọn child để học**. Chưa triển khai student login riêng như một tài khoản trẻ độc lập. Nếu code hiện tại có role `STUDENT`, L1A chỉ được phép cho `STUDENT` truy cập childProfile thuộc chính `user.sub` theo mô hình hiện có `ChildProfile.parentId = user.sub`; không được cho truyền arbitrary `childProfileId` của child khác. Không thêm quan hệ DB mới `studentUserId` trong vòng 2B.

---

## 7. Review route hardening

Trạng thái: **NOT STARTED**.

Các route P0 vẫn chưa an toàn:

| Route group | Trạng thái sau vòng 2 | Cần xử lý ở vòng 2B |
|---|---|---|
| `/progress/*` | Vẫn có gap `childProfileId` ownership | Guard query/body/param childProfileId |
| `/ai-chat/*` | Vẫn public/mock-only | Thêm JWT, child ownership, entitlement, mock-only boundary |
| `/billing/users/:userId/*` | Vẫn public userId lookup | Guard self/admin/support hoặc thay bằng `/billing/me` |
| `/learning/*` | Đã có guard partial từ vòng 1 | Refactor về shared boundary nếu an toàn |
| `/parent/*` | Khá ổn theo parent service | Không làm regression |

---

## 8. Review EntitlementService

Trạng thái: **NOT STARTED**.

Vòng 2B cần tạo service dùng chung, tối thiểu:

- `assertActiveLearningAccess(childProfileId)`.
- `getCapabilities(childProfileId)`.
- Capability tối thiểu: `video`, `practice`, `aiChat`, `maxDailyMinutes`.
- Default bảo thủ: không bật AI production nếu chưa có provider/quota/moderation.
- Dùng service này trong learning/progress/ai-chat/billing liên quan tới quyền học.

---

## 9. Review tests/build/lint

Trạng thái: **NOT RUN - BLOCKED**.

- Chưa thêm negative tests.
- Chưa chạy API test/build/web build.
- Chỉ chạy `git status --short` và fail vì workspace không phải git repo.
- Baseline vòng 1 vẫn hữu ích nhưng không thay thế được test vòng 2B.

Vòng 2B phải có ít nhất:

1. Negative tests parent A không đọc/sửa child B qua progress/learning/ai-chat.
2. Unauthenticated `/ai-chat/*` bị 401.
3. Billing user route không còn public lookup.
4. Child hết subscription bị chặn ở các route learning/AI/progress ghi dữ liệu.
5. API tests pass, API build pass, web build pass hoặc lý do web không cần chạy.

---

## 10. Scope compliance

Vòng 2: **compliant**.

Không có dấu hiệu:

- Tích hợp AI provider thật.
- Tạo LearningPath/ContentPackage.
- Persist DailyLearningPlan.
- Làm game/reward/SkillProgress.
- Sửa UI lớn.
- Lan sang sale/payment/agency/payout.

---

## 11. Rủi ro còn lại

1. Child-scoped authorization vẫn chưa thống nhất.
2. `/progress` còn rủi ro childProfileId injection.
3. `/ai-chat` còn public/mock-only nếu source chưa được sửa.
4. `/billing/users/:userId/*` còn public lookup.
5. EntitlementService chưa có.
6. Canonical BA/trục chưa được đặt trong repo/workspace mà Codex nhìn thấy.
7. Workspace/git context chưa rõ.

---

## 12. Quyết định Prompt tiếp theo

Không tạo `promt_hoctap_minhhuong_3.md` lúc này.

Tạo prompt fix:

- `promt_hoctap_minhhuong_2B.md` — L1A retry/fix blocker: sync canonical files + code security/entitlement foundation.
- `promt_chatgptweb_hoctap_minhhuong_2B.md` — review kết quả 2B.

Điều kiện gửi Codex vòng 2B:

1. Gửi kèm đủ file trong bundle vòng 2B.
2. Đảm bảo Codex thấy được các file canonical ở repo root, Downloads hoặc thư mục prompt.
3. Không chạy prompt 3 cho đến khi 2B pass/đạt có điều kiện về security/entitlement.

---

## 13. Nội dung cập nhật vào trục làm việc

- Promt 2 status: **BLOCKED HỢP LỆ**.
- Không có source code changed.
- Không có tests/build mới.
- Remaining P0: child ownership, `/progress`, `/ai-chat`, `/billing`, EntitlementService, negative tests.
- Quyết định BA tạm thời: MVP dùng parent account chọn child; student login riêng chưa triển khai trong L1A.
- Prompt tiếp theo: `promt_hoctap_minhhuong_2B.md`, không phải prompt 3.
