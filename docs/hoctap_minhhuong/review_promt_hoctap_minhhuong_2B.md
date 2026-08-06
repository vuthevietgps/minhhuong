# Review kết quả Codex — Promt học tập Minh Hương 2B

Ngày review: 2026-06-14  
Dự án: Minh Hương Learning Platform  
Nhánh: Học tập / Learning Branch  
Prompt được review: `promt_hoctap_minhhuong_2B.md`  
Kết quả được review: `ketqua_promt_hoctap_minhhuong_2B.md/json` và các file phụ vòng 2B  
Phase: `L1A_FOUNDATION_SECURITY_ENTITLEMENT_RETRY`

---

## 1. Phán quyết

- Phán quyết: **BLOCKED HỢP LỆ**
- Evidence score: **8/10**
- Có thể sang `promt_hoctap_minhhuong_3.md` chưa: **Không**
- Quyết định tiếp theo: **không mở LearningPath/ContentPackage, không sang Prompt 3. Cần chạy vòng `2C` dạng self-contained để gỡ lỗi giao file canonical, rồi mới hoàn thành L1A.**

Lý do: Codex 2B vẫn không code vì không tìm thấy hai file canonical bắt buộc:

1. `00_truc_lamviec_hoctap_minhhuong.md`
2. `ba_hoctap_minhhuong_v1_1_20260614.md`

Codex có tìm thấy một BA candidate tên `ba-phan-hoc-tap-minh-huong-learning-platform-20260614.md`, nhưng file đó ghi header v1.0 nên Codex không tự rename thành v1.1. Đây là hành vi đúng, vì nếu tự đổi tên sẽ tạo sai source of truth.

---

## 2. File đã đọc / file thiếu

### 2.1 File Codex đã đọc/xác minh

- `promt_hoctap_minhhuong_2B.md`
- `ba-phan-hoc-tap-minh-huong-learning-platform-20260614.md` — chỉ được coi là candidate v1.0, không phải canonical v1.1
- `promt_chatgptweb_hoctap_minhhuong_1.md` — prompt review, không phải output review
- `promt_chatgptweb_hoctap_minhhuong_2.md` — prompt review, không phải output review
- `ketqua_promt_hoctap_minhhuong_2.json` từ audit-output vòng 2

### 2.2 File thiếu gây block

| File | Trạng thái | Tác động |
|---|---|---|
| `00_truc_lamviec_hoctap_minhhuong.md` | Missing trong môi trường Codex | Block code L1A |
| `00_truc_lamviec_hoctap_minhhuong_20260614.md` | Missing trong môi trường Codex | Không có alias để fallback |
| `ba_hoctap_minhhuong_v1_1_20260614.md` | Missing trong môi trường Codex | Không có BA canonical v1.1 |
| `review_promt_hoctap_minhhuong_1.md` / typo alias | Missing | Không có review output vòng 1 |
| `review_promt_hoctap_minhhuong_2.md` | Missing | Không có review output vòng 2 |

---

## 3. Codex làm đúng gì

1. **Dừng trước khi code đúng luật**: Prompt 2B yêu cầu block nếu thiếu canonical files; Codex đã không tự suy diễn BA.
2. **Không rename nhầm BA v1.0 thành v1.1**: Đây là điểm đúng quan trọng, vì BA v1.1 có bổ sung quyết định nghiệp vụ/sư phạm/screen-time/CMS/AI.
3. **Không sửa source code khi chưa đủ căn cứ**: Không động vào `apps/api`, `apps/web`, `packages`, `apps/api/prisma`.
4. **Không chạy test/build vô nghĩa**: Vì chưa code L1A, test/build sẽ không chứng minh được security foundation đã hoàn thành.
5. **Ghi rõ remaining gaps**: các P0 gap vẫn giữ nguyên: thiếu `ChildAccessService`, thiếu `EntitlementService`, `/progress`, `/ai-chat`, `/billing` chưa harden.

---

## 4. Lỗi/gap/blocker

Blocker không nằm ở code, mà nằm ở **cách giao file cho Codex**:

- Codex chỉ thấy prompt 2B và một BA v1.0 candidate.
- Codex không thấy file trục, BA v1.1, review output vòng 1/2.
- Vì vậy prompt 2B không thể tự sync docs vào `docs/hoctap_minhhuong/`.

Kết luận: vòng 2B là blocker hợp lệ, nhưng vòng sau không nên lặp lại bằng cách chỉ gửi prompt rời. Cần prompt 2C dạng self-contained và bundle có manifest.

---

## 5. Review canonical sync

- Canonical docs chưa được sync vào repo.
- Lý do hợp lệ: thiếu đúng file nguồn canonical.
- BA candidate v1.0 không được dùng thay v1.1.
- Source tree có vẻ đủ để làm việc (`package.json`, `apps/api`, `apps/web`) nhưng không có `.git`; `NO_GIT_CONTEXT` không nên là blocker code nếu source tree đầy đủ.

---

## 6. Review files changed/diff

- Source code: **không đổi**.
- Prisma/migration: **không đổi**.
- Web/UI: **không đổi**.
- Chỉ tạo audit-output vòng 2B.

Điều này phù hợp với trạng thái `BLOCKED`.

---

## 7. Review ChildAccessService / ownership

Chưa có vì code chưa được phép chạy.

P0 vẫn còn:

- Shared `ChildAccessService` chưa tồn tại.
- `/progress/*` chưa có ownership hardening.
- `/ai-chat/*` chưa có JWT/ownership.
- `/billing/users/:userId/*` chưa có self/admin/support guard.

---

## 8. Review route hardening

Chưa thực hiện. Không pass L1A.

Các route cần harden ở 2C:

| Route group | Trạng thái sau 2B | Yêu cầu 2C |
|---|---|---|
| `/progress/*` | Chưa sửa | Check `childProfileId` query/body/param bằng ChildAccessService |
| `/ai-chat/*` | Chưa sửa | JWT guard + child ownership + mock-only boundary |
| `/billing/users/:userId/*` | Chưa sửa | Không public; self/admin/support guard hoặc `/billing/me` |
| `/learning/*` | Chưa refactor | Không regression ownership/entitlement |
| `/parent/*` | Chưa refactor | Không phá parent report/screen-time/grant |

---

## 9. Review EntitlementService

Chưa có. 2C phải tạo boundary tối thiểu:

- `checkActiveSubscription(childProfileId)`
- `getCapabilitiesForChild(childProfileId)`
- Capability tối thiểu: `video`, `practice`, `aiChat`, `maxDailyMinutes`
- Default bảo thủ: nếu chưa có package capability schema, active subscription cho phép video/practice; AI không coi là production nếu chỉ mock.

---

## 10. Review tests/build/lint

- Security tests: chưa thêm/chưa chạy.
- API tests: chưa chạy.
- API build: chưa chạy.
- Web build: chưa chạy.
- Lint: chưa chạy.

Lý do block là hợp lệ. Nhưng 2C bắt buộc phải có tests âm tính trước khi được pass.

---

## 11. Scope compliance

Codex không làm ngoài scope. Không động vào:

- LearningPath/ContentPackage.
- Persisted DailyLearningPlan.
- Game engine/reward/SkillProgress.
- AI provider thật.
- UI redesign.
- Curriculum/content creation.
- Sale/agency/commission/payment.

---

## 12. Rủi ro còn lại

1. Dự án bị kẹt do giao file rời, không có manifest/canonical bundle.
2. Security P0 chưa được sửa.
3. AI chat vẫn public/mock-only trong source hiện tại.
4. Billing user lookup vẫn còn public trong source hiện tại.
5. Progress childProfileId injection risk vẫn còn.
6. Không có tests âm tính ownership/auth/entitlement.

---

## 13. Quyết định Prompt 3 hoặc fix tiếp

Không sang Prompt 3.

Tạo `promt_hoctap_minhhuong_2C.md` với tính chất:

- Self-contained retry.
- Không block chỉ vì thiếu external canonical files.
- Prompt 2C tự chứa quyết định BA tối thiểu để code L1A.
- Nếu không tìm thấy canonical docs, Codex phải tạo `docs/hoctap_minhhuong/00_truc_lamviec_hoctap_minhhuong.md` và `docs/hoctap_minhhuong/ba_hoctap_minhhuong_v1_1_20260614.md` từ phụ lục trong prompt.
- Sau đó hoàn thành L1A: ChildAccessService, EntitlementService, harden `/progress`, `/ai-chat`, `/billing`, negative tests, build/test.

---

## 14. Nội dung cập nhật vào trục làm việc

- Promt 2B: `BLOCKED HỢP LỆ`.
- Nguyên nhân: thiếu đúng canonical files trong môi trường Codex.
- Không có source code thay đổi.
- Không được mở Prompt 3.
- Prompt tiếp theo: `promt_hoctap_minhhuong_2C.md` — L1A self-contained retry.
- Quyết định BA dùng cho L1A: MVP parent account chọn child; chưa tạo student login relation; role STUDENT nếu tồn tại không được truyền arbitrary `childProfileId`.
