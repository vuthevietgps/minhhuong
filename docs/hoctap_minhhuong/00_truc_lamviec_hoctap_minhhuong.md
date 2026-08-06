# 00_truc_lamviec_hoctap_minhhuong.md — Trục làm việc nhánh Học tập Minh Hương

Dự án: Minh Hương Learning Platform  
Nhánh: Học tập / Learning Branch  
Ngày cập nhật: 2026-07-10  
Phiên bản trục: v1.4 — chốt Prompt 15B và chuyển auto-loop sang Sprint L6 hardening  
Trạng thái hiện tại: **Prompt 13 PASS_RC_READY**, **Prompt 14 PASS_MVP_RC_HANDOFF_READY**, **Prompt 15A PASS_AUDIT_READY**, **Prompt 15B/manual paid pilot gate PASS_WITH_NOTES**. Chuỗi Codex local đã khép các lát cắt refund-window, commission release, revoke/clawback và payout safety đến `codex_job_minhhuong_00057_manual_paid_pilot_subscription_refund_commission_gate`. Sprint L6 đã đi đến gate phê duyệt thủ công ở job 00071 và được siết evidence integrity ở `codex_job_minhhuong_00072_learning_core_production_hardening_go_live_gate`: 32 role/scenario fixture resolve đầy đủ, nhưng sáu owner approval vẫn `PENDING_HUMAN_APPROVAL`, staging/production chưa được phép, và auto-loop phải `PAUSE_AUTO_LOOP`. Tiếp tục giữ `production_ready=false`.

---

## 0. Vai trò của file trục

File này là **single source of truth** cho nhánh Học tập. Mọi hội thoại mới, mọi lần chuyển sang reviewer khác, mọi lần giao Codex tiếp theo đều phải đọc file này trước.

Không được phụ thuộc vào trí nhớ của cuộc hội thoại cũ. Khi chuyển ngữ cảnh hoặc mở lại luồng tự động, cung cấp/đọc tối thiểu:

1. `00_truc_lamviec_hoctap_minhhuong.md` hoặc `00_truc_lamviec_hoctap_minhhuong_20260614.md`.
2. `ba_hoctap_minhhuong_v1_1_20260614.md`.
3. `docs/hoctap_minhhuong/production_hardening_go_live_gate.md`.
4. `audit-output/promt_hoctap_minhhuong_15A_canonical_ops_decision_audit/NEXT_CONTEXT_PACKET.md`.
5. `audit-output/promt_hoctap_minhhuong_15A_canonical_ops_decision_audit/NEXT_CONTEXT_INDEX.json`.
6. `audit-output/promt_hoctap_minhhuong_15A_canonical_ops_decision_audit/13_recommended_prompt15B.md`.

Câu lệnh khởi động hội thoại mới nên dùng:

> Đọc file trục làm việc trước, sau đó tiếp tục đúng trạng thái mới nhất trong trục. Không dựa vào trí nhớ hội thoại cũ. Nếu thiếu file nào làm giảm độ tin cậy, hãy nói rõ.

### 0.1. Luồng auto code-review hiện hành

Luồng ưu tiên từ 2026-07-07:

```text
BA/trục/context trong repo + Drive artifact hiện có
-> runner đọc pointer và safety gate
-> Codex CLI sinh code/tests/evidence trong workspace local
-> runner publish output contract
-> Codex local review / Codex UI review tạo AUTO_REVIEW_DECISION và next pointer
-> runner compile pointer an toàn
-> Codex CLI chạy job tiếp theo
```

ChatGPT Web không còn là reviewer chính cho nhánh này. Nếu vẫn còn tên field/pointer kiểu `chatgptweb_*` trong runner, đó là legacy transport/compatibility của runner, không phải quyền quyết định BA. Reviewer chính là Codex local review/Codex UI, nhưng vẫn phải bám file trục này, BA v1.1, `production_hardening_go_live_gate.md`, và context 15A.

Hard stop vẫn giữ nguyên: không production DB, không payment/refund/payout thật, không provider API, không live AI provider, không live notification, không dữ liệu khách/học viên thật, không `production_ready=true` nếu chưa có manual go-live approval.

---

## 1. Mục tiêu sản phẩm nhánh Học tập

Xây dựng app học tiếng Anh cho trẻ em theo mô hình:

- Tắm video/ngôn ngữ.
- Học theo kế hoạch hằng ngày.
- Làm bài tập/trò chơi.
- Trò chuyện/luyện tập với AI English Buddy.
- Phụ huynh cài đặt và kiểm soát thời gian học.
- Phụ huynh xem báo cáo tiến bộ có bằng chứng.
- Hệ thống kiểm soát quyền học theo gói/subscription.
- Hệ thống quản lý học liệu/CMS nhưng không thay giáo viên quyết định nội dung sư phạm.

---

## 2. Quyết định nghiệp vụ đã chốt

### 2.1 Giáo viên/chuyên gia quyết định học liệu và thứ tự học

Đã chốt:

- Giáo viên/chuyên gia phụ trách quyết định học liệu gì được đưa lên.
- Giáo viên/chuyên gia quyết định thứ tự học, level, prerequisite, chuẩn đạt, review rule.
- Hệ thống không tự ý quyết định nội dung sư phạm.
- Daily plan engine chỉ sinh kế hoạch dựa trên learning path/content package đã được duyệt.
- AI không được tự ý thay đổi lộ trình học.
- AI chỉ hỗ trợ luyện tập trong phạm vi scenario/prompt/level đã được duyệt.

### 2.2 Hệ thống chịu trách nhiệm vận hành và kiểm soát

Hệ thống phải làm tốt:

- Quản lý hồ sơ child.
- Quản lý parent-child ownership/permission.
- Quản lý quyền học theo subscription/entitlement.
- Quản lý học liệu/CMS/workflow/revision/audit.
- Sinh daily plan theo lộ trình đã duyệt.
- Ghi nhận watch/usage/progress/attempt/AI/reward.
- Kiểm soát thời gian học và giới hạn phụ huynh cài.
- Báo cáo learning evidence cho parent.
- Tách rõ AI mock/dev và AI production.

---

## 3. Quy ước đặt tên file mới

### 3.1 Quy ước canonical từ vòng 2 trở đi

| Vai trò                   | Quy ước                                  | Ví dụ                                    |
| ------------------------- | ---------------------------------------- | ---------------------------------------- |
| Prompt gửi Codex          | `promt_hoctap_minhhuong_N.md`            | `promt_hoctap_minhhuong_2.md`            |
| Prompt ChatGPT web review | `promt_chatgptweb_hoctap_minhhuong_N.md` | `promt_chatgptweb_hoctap_minhhuong_2.md` |
| Kết quả chính Codex       | `ketqua_promt_hoctap_minhhuong_N.md`     | `ketqua_promt_hoctap_minhhuong_2.md`     |
| Kết quả JSON Codex        | `ketqua_promt_hoctap_minhhuong_N.json`   | `ketqua_promt_hoctap_minhhuong_2.json`   |
| File phụ Codex            | `promt_hoctap_minhhuong_N_<ten_file>.md` | `promt_hoctap_minhhuong_2_gap_matrix.md` |
| Review ChatGPT web        | `review_promt_hoctap_minhhuong_N.md`     | `review_promt_hoctap_minhhuong_2.md`     |
| Trục làm việc             | `00_truc_lamviec_hoctap_minhhuong.md`    | file này                                 |
| BA canonical              | `ba_hoctap_minhhuong_vX_Y_YYYYMMDD.md`   | `ba_hoctap_minhhuong_v1_1_20260614.md`   |

### 3.2 Ghi chú riêng vòng 1

Theo yêu cầu đổi tên hiện tại, vòng 1 có các file:

| Vai trò                                        | Tên file vòng 1                                  |
| ---------------------------------------------- | ------------------------------------------------ |
| Prompt gửi Codex — đúng tên người dùng yêu cầu | `promt_hoctap_mihhuong_1.md`                     |
| Alias đúng chính tả, nội dung tương đương      | `promt_hoctap_minhhuong_1.md`                    |
| Prompt ChatGPT web review                      | `promt_chatgptweb_hoctap_minhhuong_1.md`         |
| Kết quả chính Codex yêu cầu tạo                | `ketqua_promt_hoctap_mihhuong_1.md`              |
| Kết quả JSON Codex yêu cầu tạo                 | `ketqua_promt_hoctap_mihhuong_1.json`            |
| Route inventory                                | `promt_hoctap_mihhuong_1_route_inventory.md`     |
| Entity inventory                               | `promt_hoctap_mihhuong_1_entity_inventory.md`    |
| Gap matrix                                     | `promt_hoctap_mihhuong_1_gap_matrix.md`          |
| Evidence index                                 | `promt_hoctap_mihhuong_1_evidence_index.md`      |
| Test/build/lint                                | `promt_hoctap_mihhuong_1_test_build_lint.md`     |
| Next recommendation                            | `promt_hoctap_mihhuong_1_next_recommendation.md` |
| Review output đề xuất                          | `review_promt_hoctap_mihhuong_1.md`              |

Từ vòng 2 trở đi nên dùng thống nhất `minhhuong` đúng chính tả để tránh nhầm lẫn.

---

## 4. Canonical files hiện tại

| File                                                                                               | Vai trò                                                                 | Trạng thái          |
| -------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- | ------------------- |
| `ba_hoctap_minhhuong_v1_1_20260614.md`                                                             | BA canonical hiện tại cho nhánh học tập v1.1 bổ sung                    | Active              |
| `00_truc_lamviec_hoctap_minhhuong.md`                                                              | Trục làm việc canonical tên ngắn                                        | Active              |
| `00_truc_lamviec_hoctap_minhhuong_20260614.md`                                                     | Trục làm việc canonical có ngày                                         | Active              |
| `production_hardening_go_live_gate.md`                                                             | Source of truth cho hardening/go-live gate sau MVP local-demo           | Active              |
| `audit-output/promt_hoctap_minhhuong_15A_canonical_ops_decision_audit/NEXT_CONTEXT_PACKET.md`      | Baseline đã dùng để triển khai Prompt 15B                               | Historical baseline |
| `audit-output/promt_hoctap_minhhuong_15A_canonical_ops_decision_audit/NEXT_CONTEXT_INDEX.json`     | Index context/source đã dùng cho Prompt 15B                             | Historical baseline |
| `audit-output/promt_hoctap_minhhuong_15A_canonical_ops_decision_audit/13_recommended_prompt15B.md` | Recommendation đã được thực thi; không được dùng để sinh lặp Prompt 15B | Completed           |

Nếu xuất hiện phiên bản BA mới hơn hoặc prompt mới hơn, phải cập nhật mục này.

---

## 5. Phạm vi nhánh Học tập

Trong phạm vi:

1. Child learning home.
2. Daily learning plan.
3. Video immersion/tắm tiếng Anh.
4. Practice/game engine.
5. AI English Buddy.
6. Parent dashboard/report.
7. Content CMS cho học liệu/video/game/AI scenario.
8. Learning progress/usage/skill/reward/streak.
9. Screen time/study time policy.
10. Entitlement check ở mức quyền học.
11. API contract cho web/mobile/PWA.
12. Learning path/content package do giáo viên/chuyên gia phụ trách.
13. Parent-facing learning evidence.

Ngoài phạm vi:

- Sale/agency/commission/payout.
- Payment gateway/đối soát tiền.
- Báo cáo doanh thu/giám đốc/marketer.
- Ads platform/API quảng cáo.
- Viết học liệu cụ thể thay giáo viên/chuyên gia.

---

## 6. Phase hiện tại

### Phase L6 — Production hardening and go-live gate, non-production only

Trạng thái: Prompt 15B/manual paid pilot gate đã có chuỗi code, test và evidence PASS_WITH_NOTES đến job 00057. Không sinh thêm job cùng tên `MANUAL_PAID_PILOT_SUBSCRIPTION_REFUND_COMMISSION_GATE` nếu không có blocking defect cụ thể.

Mục tiêu hiện hành:

- Hoàn thiện demo-data matrix cho parent, child/student, teacher, admin, support/ops và sales/channel/finance khi liên quan subscription/payment.
- Hoàn thiện happy path, denied path, expired/inactive path và permission negative tests theo role.
- Chạy learning-local, smoke/e2e và build mà không hạ chuẩn test hiện có.
- Chốt deploy-readiness gaps, rollback/backup/monitoring/audit checklist và go-live gate report.
- Chỉ dùng local/demo/fixture/staging-dry-run/staging-readonly.
- Không production deploy, production DB, provider API hoặc payment/refund/payout/live notification/live AI mutation.
- Giữ `production_ready=false` cho đến manual go-live approval riêng.

Output kỳ vọng từ Codex CLI:

1. `CHATGPT_REVIEW_BUNDLE.md`
2. `RESULT.md`
3. `RESULT.json`
4. `REVIEW_PACKET.md`
5. `MANIFEST.json`
6. `FILES_CHANGED.md`
7. `TESTS_RUN.md`
8. `RISKS_AND_GAPS.md`
9. `NEXT_CONTEXT_PACKET.md`
10. `NEXT_CONTEXT_INDEX.json`
11. `CONTEXT_DELTA.md`

Sau đó dùng Codex local review/Codex UI review để tạo `AUTO_REVIEW_DECISION.json`. Nếu gate PASS và không còn blocking defect cụ thể, reviewer phải đóng auto-loop thay vì sinh lại cùng hardening gate. Không dùng ChatGPT Web làm reviewer chính.

---

## 7. Sprint mục tiêu sau audit

Chưa được triển khai trước khi có audit đạt hoặc đạt có điều kiện.

### Sprint L1 — Stabilize learning core

Dự kiến gồm:

1. Rà soát/chuẩn hóa `ChildProfile` + parent-child permission.
2. Rà soát/chuẩn hóa subscription/entitlement guard.
3. Child learning home API tổng hợp.
4. Watch event + learning usage ổn định.
5. Practice attempt backend scoring.
6. Parent report 7 ngày cơ bản.
7. Smoke test: parent login → chọn child → xem video → làm bài → xem report.
8. Tách AI mock/dev khỏi production claim.

### Sprint L2 — Daily plan + immersion

Dự kiến gồm:

1. `DailyLearningPlan`, `DailyLearningPlanItem` nếu chưa có.
2. Sinh plan theo learning path/content package đã published.
3. Không đưa content chưa publish/hết entitlement/vượt screen time vào plan.
4. Immersion playlist auto next/replay.
5. Gắn plan item status với watch/practice.

### Sprint L3 — Game + reward

Dự kiến gồm:

1. `GameActivityConfig`.
2. 2 game P0: `PICTURE_CHOICE`, `LISTEN_CHOOSE`.
3. Reward catalog/ledger/streak.
4. Không lộ đáp án đúng cho client.

### Sprint L4 — AI Buddy boundary

Dự kiến gồm:

1. Scenario/prompt version/quota.
2. Provider boundary.
3. Moderation/safety.
4. Token/cost ledger.
5. Parent AI summary.

### Sprint L5 — Parent insight + CMS hardening

Dự kiến gồm:

1. Report 7/30 ngày.
2. Skill progress/mastery evidence.
3. CMS workflow/revision/audit.
4. Import/export học liệu.
5. API contract/OpenAPI/types.

### Sprint L6 - Production hardening and go-live gate

Chay sau khi learning-core MVP/local-demo da PASS va `production_ready=false`.

Muc tieu khong phai deploy live ngay. Muc tieu la dong goi MVP thanh release candidate co du demo data, role journey, test matrix, staging/read-only gate, rollback/runbook va bang chung deploy readiness.

Bat buoc:

1. Tao `docs/hoctap_minhhuong/production_hardening_go_live_gate.md` lam source of truth cho phase.
2. Demo data phai day du parent, child/student, teacher, admin, support/ops, sales/channel neu lien quan den subscription/payment.
3. Moi role phai co happy path, denied path, expired/inactive path, permission negative test.
4. Khong duoc sua/xoa/skip/ha chuan test hien co de pass. Chi duoc them test hoac fix code/data/config.
5. Neu bat buoc sua test vi test sai voi BA, phai tao `TEST_STANDARD_CHANGE_REQUEST.md` va can human approval.
6. Khong mo production DB, provider API, payment/refund mutation, notification live, AI provider live, hoac deploy production trong auto-loop.
7. `production_ready` van la false cho den khi go-live gate co manual approval rieng.

---

## 8. Quy tắc review/nghiệm thu các vòng sau

1. Không chấp nhận kết quả nếu thiếu evidence code.
2. Không tin summary/json nếu không có route/entity/file/test đi kèm.
3. Mỗi kết luận phải phân loại: direct evidence / assertion / missing evidence.
4. Nếu Codex không thấy BA/trục mới nhất, phải yêu cầu audit lại hoặc sync lại repo/context.
5. Nếu task là audit thì không được code.
6. Nếu task là code thì phải có diff/files_changed/tests/static checks.
7. Không nhảy phase khi blocker nền chưa xử lý.
8. Không trộn nhánh học tập với nhánh bán hàng.
9. Không quảng cáo AI thật nếu code còn mock/dev-only.
10. Không kết luận permission an toàn nếu chưa có parent-child negative test hoặc guard rõ.
11. Không để AI tự quyết định học liệu/thứ tự học.
12. Không triển khai prompt sau chỉ dựa trên hội thoại; phải đọc trục + kết quả file.
13. Sau mỗi vòng, phải cập nhật lại file trục và log vòng làm việc.
14. Không được sửa/xóa/skip/ha chuan test hiện có chỉ để pass; nếu test sai phải tạo `TEST_STANDARD_CHANGE_REQUEST.md`.
15. Sau khi MVP/local-demo pass, phải đi qua Sprint L6 hardening/go-live gate trước mọi quyết định production.

---

## 9. Ma trận quyết định ưu tiên

| Nếu audit cho thấy            | Quyết định tiếp theo                                                              |
| ----------------------------- | --------------------------------------------------------------------------------- |
| Parent-child permission yếu   | Sprint L1 ưu tiên guard + test trước mọi UI mới.                                  |
| Entitlement chưa có           | Làm access guard trước daily plan/game/AI.                                        |
| Watch event chưa ổn           | Ổn định usage/progress trước parent report.                                       |
| Practice client tự chấm       | Chuyển backend scoring trước game mở rộng.                                        |
| AI đang mock                  | Tách mock/dev boundary trước khi bán/claim AI.                                    |
| CMS thiếu publish status      | Thêm content status/publish gate trước daily plan tự động.                        |
| Report thiếu evidence         | Bổ sung usage/attempt aggregation trước UI đẹp.                                   |
| Learning path chưa có         | Làm cơ chế giáo viên/chuyên gia quản lý thứ tự học trước daily plan thông minh.   |
| Screen time chỉ đếm tổng phút | Tách device/study/passive/game/AI time trước khi bán tính năng quản lý thời gian. |

---

## 10. Câu hỏi mở cần chốt sau audit

1. Code hiện tại dùng stack/framework/ORM gì?
2. Entity learning hiện tại đã trùng bao nhiêu % với BA?
3. Permission parent-child đã chắc chưa?
4. Subscription/entitlement đang ở mức nào?
5. Watch/progress/usage đang tính thế nào?
6. AI hiện mock hay provider thật?
7. CMS đã có publish/revision/audit chưa?
8. Test hiện có đủ tin cậy không?
9. Sprint L1 nên sửa theo code hiện tại hay cần refactor nền trước?
10. Code hiện có learning path/content package do giáo viên/chuyên gia quản lý chưa?
11. Screen time hiện chỉ là device lock hay đã tách study/passive/game/AI time?

---

## 11. Định nghĩa đạt để chuyển khỏi Phase L0

Phase L0 được coi là đạt khi có:

- Báo cáo audit chính có evidence.
- Inventory route/API.
- Inventory entity/migration.
- Gap matrix theo BA v1.1.
- JSON machine-readable.
- Test/build/lint result nếu chạy được.
- Evidence index rõ direct evidence vs assertion vs missing.
- Review ChatGPT web kết luận đạt hoặc đạt có điều kiện.
- Prompt Sprint L1 được soạn dựa trên audit thật, không dựa trên suy đoán.

---

## 12. Log vòng làm việc

| Vòng                         | Prompt Codex                                                                                  | Prompt review                            | Kết quả chính                                                                                                                                                                          | Trạng thái         | Ghi chú                                                                                                                                                                                                                                 |
| ---------------------------- | --------------------------------------------------------------------------------------------- | ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1                            | `promt_hoctap_mihhuong_1.md`                                                                  | `promt_chatgptweb_hoctap_minhhuong_1.md` | Chờ `ketqua_promt_hoctap_mihhuong_1.md`                                                                                                                                                | Chưa chạy Codex    | Audit hiện trạng code, read-only/no-code.                                                                                                                                                                                               |
| 15B auto                     | `codex_job_minhhuong_00040` đến `00057_manual_paid_pilot_subscription_refund_commission_gate` | Codex UI/codex_local                     | Code, targeted tests, API build và review bundles                                                                                                                                      | PASS_WITH_NOTES    | Đã chốt chuỗi manual paid pilot gate; cấm sinh lặp cùng gate nếu không có blocking defect cụ thể.                                                                                                                                       |
| L6 hardening                 | `codex_job_minhhuong_00058_learning_core_production_hardening_go_live_gate`                   | Codex UI/codex_local                     | Runtime safety, local-demo route containment, deploy-readiness matrix, tests và bộ go-live gate artifacts                                                                              | CODEX_REVIEW_READY | 2 runtime gates closed by code; 7 staging/manual blockers remain; non-production only, `production_ready=false`.                                                                                                                        |
| L6 auth ops                  | `codex_job_minhhuong_00060_learning_core_production_hardening_go_live_gate`                   | Codex UI/codex_local                     | Login/refresh throttling, auth operational counters, deterministic fixtures, seed/report evidence và full go-live gate artifacts                                                       | CODEX_REVIEW_READY | 7 local auth-control rows verified; shared multi-instance monitoring/rate-limit, staging and manual approval remain blocked; `production_ready=false`.                                                                                  |
| L6 auth backup/smoke         | `codex_job_minhhuong_00061_prisma_auth_session_store_local_staging`                           | Codex UI/codex_local                     | Disposable localhost backup/restore, two-process API revocation, repository-outage denial, measured local RPO/RTO, exact cleanup và full evidence contract                             | CODEX_REVIEW_READY | Local two-process/backup contract closed; staging approval/rehearsal, monitoring/incident/retention/security review and manual go-live approval remain blocked; `production_ready=false`.                                               |
| L6 shared auth control       | `codex_job_minhhuong_00062_manual_paid_pilot_subscription_refund_commission_gate`             | Codex UI/codex_local                     | Prisma shared limiter/counters, concurrent two-process proof, HMAC key protection, bounded retention cleanup, outage denial và exact local cleanup                                     | CODEX_REVIEW_READY | Transport title cũ được chuẩn hóa theo next-context 00061; Prompt 15B không bị mở lại. Shared adapter chỉ verified disposable-local; staging/observability/retention/security/manual approval còn blocked; `production_ready=false`.    |
| L6 auth alert policy         | `codex_job_minhhuong_00063_learning_core_production_hardening_go_live_gate`                   | Codex UI/codex_local                     | Repo-local alert thresholds, cooldown/dedup, ADMIN/SUPPORT read-only inspection, denied learner access, snapshot-outage denial và seed/report evidence                                 | CODEX_REVIEW_READY | Không gọi external alert/notification provider. Shared dedup, time-window calibration, staging/dashboard/correlation/incident/retention/security/manual approval còn blocked; `production_ready=false`.                                 |
| L6 auth hash integrity       | `codex_job_minhhuong_00064_prisma_auth_session_store_local_staging`                           | Codex UI/codex_local                     | Application + PostgreSQL SHA-256 hash enforcement, audited revoke/tombstone forward repair, constraint rollback/reactivation, two-client revocation regression và seed/report evidence | CODEX_REVIEW_READY | Enforced runner lặp lại AuthSessionStore slice; job chỉ đóng concrete persistence-integrity gap. Staging/operations/security/manual approval còn blocked; `production_ready=false`.                                                     |
| L6 shared auth alert state   | `codex_job_minhhuong_00065_manual_paid_pilot_subscription_refund_commission_gate`             | Codex UI/codex_local                     | Shared Prisma cooldown/dedup, explicit rolling-window snapshot, two-process OPEN/suppressed proof, outage denial, exact cleanup và redacted seed/report evidence                       | CODEX_REVIEW_READY | Transport title cũ được chuẩn hóa theo reviewed next-context 00064; real-money behavior không thay đổi. Staging calibration/observability/incident/retention/security/manual approval còn blocked; `production_ready=false`.            |
| L6 auth alert audit/capacity | `codex_job_minhhuong_00066_learning_core_production_hardening_go_live_gate`                   | Codex UI/codex_local                     | Append-only redacted evaluation audit/correlation, idempotent replay, exact dual retention, two-process contention timing, fail-closed outage và seed/report evidence                  | CODEX_REVIEW_READY | Chỉ dùng một random localhost PostgreSQL database và synthetic account. Staging migration/calibration/load, dashboard/log/trace, routing/on-call, retention/privacy, security và manual approval còn blocked; `production_ready=false`. |
| L6 atomic auth revocation    | `codex_job_minhhuong_00067_prisma_auth_session_store_local_staging`                           | Codex UI/codex_local                     | Atomic session-family revocation, shared session-row serialization với refresh issuance/rotation, six-race two-client disposable-local proof và preserved fail-closed/runtime gates    | CODEX_REVIEW_READY | Enforced runner lặp AuthSessionStore slice; job đóng concrete rotate/revoke race. Staging rehearsal/observability/retention/security/manual approval còn blocked; `production_ready=false`.                                             |
| L6 RC evidence integrity     | `codex_job_minhhuong_00072_learning_core_production_hardening_go_live_gate`                   | Codex UI/codex_local                     | 32 synthetic role/scenario fixtures, fail-closed unknown/cross-role evaluation, repo-relative evidence integrity, additive tests và regenerated seed/report                            | CODEX_REVIEW_READY | Baseline 00071/115 tests được giữ và tăng lên 117; sáu human approvals vẫn pending, staging/production denied, auto-loop pause, `production_ready=false`.                                                                               |

Sau mỗi vòng, phải cập nhật bảng này.

---

## 13. Quy trình chuyển hội thoại

Khi cần chuyển sang hội thoại mới:

1. Upload file trục mới nhất.
2. Upload BA canonical mới nhất.
3. Upload prompt Codex gần nhất.
4. Upload kết quả Codex gần nhất.
5. Upload review ChatGPT web gần nhất.
6. Nói rõ: “Hãy đọc file trục trước và tiếp tục từ trạng thái trong trục. Không dựa vào trí nhớ hội thoại.”

Không yêu cầu assistant nhớ bằng lời. Tất cả trạng thái quan trọng phải nằm trong file trục.

---

## 14. Ghi chú vận hành hiện tại

- Các ghi chú ChatGPT Web bên dưới là lịch sử của vòng cũ và đã bị luồng Codex UI/codex_local ở mục 0.1 thay thế.
- `promt_hoctap_mihhuong_1.md` là prompt audit đầu tiên cho Codex.
- Có alias `promt_hoctap_minhhuong_1.md` để tránh nhầm chính tả khi tìm file.
- Sau khi có kết quả Codex, không triển khai ngay.
- Upload kết quả vào ChatGPT web để review theo `promt_chatgptweb_hoctap_minhhuong_1.md`.
- Nếu review đạt, mới soạn `promt_hoctap_minhhuong_2.md` triển khai Sprint L1 hoặc audit sâu phần còn thiếu.
- Nếu review chưa đạt, soạn prompt audit bổ sung hoặc yêu cầu Codex sửa báo cáo.

---

## 8. Cập nhật sau khi nhận kết quả Promt 2 — 2026-06-14

File kết quả đã nhận:

- `ketqua_promt_hoctap_minhhuong_2.md`
- `ketqua_promt_hoctap_minhhuong_2.json`
- `promt_hoctap_minhhuong_2_blocker.md`
- `promt_hoctap_minhhuong_2_files_changed.md`
- `promt_hoctap_minhhuong_2_evidence_index.md`
- `promt_hoctap_minhhuong_2_security_tests.md`
- `promt_hoctap_minhhuong_2_test_build_lint.md`
- `promt_hoctap_minhhuong_2_remaining_gaps.md`

Phán quyết review:

- `promt_hoctap_minhhuong_2.md`: **BLOCKED HỢP LỆ**.
- Codex dừng đúng vì không thấy `00_truc_lamviec_hoctap_minhhuong*.md`, `ba_hoctap_minhhuong_v1_1_20260614.md`, và review vòng 1 trong workspace/Downloads.
- Không có source code changed.
- Không có service/guard/EntitlementService được tạo.
- Không có security tests chạy.
- Không được chuyển sang Prompt 3.

Nguyên nhân vận hành:

- Bộ file gửi Codex vòng 2 chưa đủ file canonical.
- Workspace Codex báo không phải git repo; vòng sau không được block chỉ vì thiếu `.git` nếu source tree vẫn hợp lệ, nhưng phải báo `NO_GIT_CONTEXT` và liệt kê files changed thủ công.

Quyết định BA tạm thời để gỡ blocker `STUDENT` / `ChildProfile`:

- MVP L1A dùng mô hình **parent account đăng nhập và chọn child để học**.
- Chưa triển khai student login riêng như một tài khoản trẻ độc lập.
- Nếu source hiện có role `STUDENT`, chỉ allow truy cập childProfile thuộc `user.sub` theo mô hình hiện tại `ChildProfile.parentId = user.sub`; không cho truyền arbitrary childProfileId.
- Không thêm relation DB mới `studentUserId` trong vòng 2B.

Prompt tiếp theo:

- `promt_hoctap_minhhuong_2B.md` — L1A retry/fix blocker: sync canonical files + security/entitlement foundation.
- Prompt review đi kèm: `promt_chatgptweb_hoctap_minhhuong_2B.md`.

Điều kiện gửi Codex vòng 2B:

1. Gửi kèm hoặc giải nén bundle chứa đủ:
   - `00_truc_lamviec_hoctap_minhhuong.md`
   - `ba_hoctap_minhhuong_v1_1_20260614.md`
   - `review_promt_hoctap_minhhuong_1.md`
   - `review_promt_hoctap_minhhuong_2.md`
   - `promt_hoctap_minhhuong_2B.md`
   - kết quả vòng 2
2. Codex phải copy/sync canonical docs vào `docs/hoctap_minhhuong/` trong repo.
3. Sau khi sync xong mới code L1A.
4. Không triển khai LearningPath/ContentPackage, game, reward, AI provider thật, DailyLearningPlan ở vòng 2B.

Điều kiện chuyển sang Prompt 3:

- Chỉ khi 2B pass hoặc đạt có điều kiện nhẹ sau review ChatGPT Web.
- Nếu 2B còn security P0, tiếp tục prompt fix/hardening, không mở LearningPath.

---

## Cập nhật 2026-06-14 — Review Promt 2B và quyết định Promt 2C

### Trạng thái Promt 2B

- File kết quả: `ketqua_promt_hoctap_minhhuong_2B.md/json`.
- Phán quyết review: **BLOCKED HỢP LỆ**.
- Nguyên nhân: Codex vẫn không tìm thấy đúng file canonical trong môi trường chạy:
  - `00_truc_lamviec_hoctap_minhhuong.md`
  - `ba_hoctap_minhhuong_v1_1_20260614.md`
- Codex có tìm thấy BA candidate v1.0 nhưng không rename thành v1.1 để tránh tạo sai source of truth. Đây là hành vi đúng.
- Không có source code, migration, test, build, UI nào được sửa.

### P0 gap còn nguyên sau Promt 2B

- Chưa có shared `ChildAccessService`.
- Chưa có shared `EntitlementService`.
- `/progress/*` vẫn cần child ownership hardening.
- `/ai-chat/*` vẫn cần JWT/auth/ownership/mock-only boundary.
- `/billing/users/:userId/*` vẫn cần self/admin/support guard hoặc route thay thế an toàn.
- Chưa có negative security tests ownership/auth/entitlement.

### Quyết định không mở Prompt 3

Không được sang `promt_hoctap_minhhuong_3.md` cho LearningPath/ContentPackage khi L1A chưa pass.

### Prompt tiếp theo

Prompt tiếp theo là:

- `promt_hoctap_minhhuong_2C.md`

Tính chất:

- Self-contained retry.
- Không block chỉ vì thiếu external canonical files.
- Nếu Codex không tìm thấy canonical docs, Codex phải tạo `docs/hoctap_minhhuong/00_truc_lamviec_hoctap_minhhuong.md` và `docs/hoctap_minhhuong/ba_hoctap_minhhuong_v1_1_20260614.md` từ phụ lục trong prompt 2C.
- Sau đó mới code L1A: ChildAccessService, EntitlementService, harden `/progress`, `/ai-chat`, `/billing`, negative tests, build/test.

### Quyết định BA dùng cho L1A

- MVP dùng parent account đăng nhập và chọn child.
- Chưa triển khai student login relation riêng ở L1A.
- Role `STUDENT` nếu tồn tại không được truyền arbitrary `childProfileId`.
- Giáo viên/chuyên gia quyết định nội dung học, thứ tự học, level, prerequisite, chuẩn đạt và review rule.
- Hệ thống chỉ kiểm soát quyền, ghi nhận tiến độ, báo cáo và vận hành theo cấu hình đã duyệt.

---

## 15. L6 update - Codex job 00059 (2026-07-10)

`codex_job_minhhuong_00059_prisma_auth_session_store_local_staging` implements the Prisma-backed `AuthSessionStore` behind the existing provider seam. Local demo remains fixture-backed by default; disposable local/staging may explicitly select Prisma; production fixture fallback is forbidden. Repository outage and inconsistent-row behavior fail closed.

Disposable-local evidence covers migration deploy, schema/index/foreign-key checks, hash-only refresh-token persistence, two independent Prisma clients sharing revocation state, pre-activation rollback, forward repair, and exact random-database cleanup. No production DB, deploy, provider call, real customer/student/session, payment/refund/payout, notification, or AI mutation was used.

Status remains `production_ready=false`, `production_enabled=false`, and manual go-live approval is still required. Next review must verify the code/tests/evidence for job 00059; staging backup/restore, two-process API smoke, monitoring/incident ownership, retention approval, and security review remain blockers.

---

## 16. L6 update - Codex job 00060 (2026-07-10)

`codex_job_minhhuong_00060_learning_core_production_hardening_go_live_gate` adds repo-local login and refresh throttling plus auth operational counters behind `AUTH_OPERATIONAL_CONTROL`. Deterministic fixtures cover login/refresh 429 behavior, fail-closed rate-limit outage, refresh replay, auth repository outage, cleanup totals, and role-scoped audit exports. Seed/report now export the auth operational control matrix.

The local implementation stores only hashed rate-limit keys and sends no external metrics or alerts. A shared multi-instance adapter, dashboards/alert routing, approved retention, staging backup/restore and two-process rehearsal, security review, and manual go-live approval remain blockers. Status remains `production_ready=false` and `production_enabled=false`.

---

## 17. L6 update - Codex job 00061 (2026-07-10)

`codex_job_minhhuong_00061_prisma_auth_session_store_local_staging` adds an executable disposable-local backup/restore and two-process API smoke harness around the Prisma auth-session store. Two independent Nest processes prove refresh replay revocation is shared: process B accepts the access token before process A revokes the session family and denies it afterward. A forced repository outage returns 503.

The harness uses only random localhost databases and one synthetic `@example.test` admin account. `pg_dump`/`pg_restore` preserves the revoked session, token hashes, and audit rows with a matching digest; measured local backup/RPO/RTO evidence and exact database/dump cleanup are exported without raw tokens. AuthModule fixture providers also use explicit factories so real API bootstrap succeeds.

No staging or production DB, deploy, provider, payment/refund/payout, notification, AI, real customer, learner, or session was used. Approved staging rehearsal, shared monitoring/rate limiting, incident/retention/security approval, and manual go-live approval remain blockers. Status remains `production_ready=false` and `production_enabled=false`.

---

## 18. L6 update - Codex job 00062 (2026-07-10)

The incoming runner transport reused the completed Prompt 15B/manual-paid-pilot title, while job 00061's reviewed next context and this canonical axis name the concrete open L6 blocker: shared multi-instance `AuthOperationalControl`. This job follows that concrete blocker and does not change subscription, refund, commission, payout, or other real-money behavior.

`PrismaAuthOperationalControl` now provides shared atomic login/refresh admission and shared metric buckets behind the existing seam. Persisted rate keys use HMAC-SHA256, rate attempts expire with their policy window, metric buckets use a bounded 30-day local technical default, and an hourly cleanup removes expired rows. Production still rejects provider activation pending explicit approval.

Disposable localhost evidence runs two Nest processes against one random PostgreSQL database: 12 concurrent login requests yield exactly 5 credential denials and 7 throttles; 16 refresh requests yield exactly 10 token denials and 6 throttles. Shared counters match, expired rows are deleted while current rows remain, forced adapter outage returns 503, and processes/database/temp artifacts are cleaned exactly. No raw rate key, secret, or token is exported.

No staging or production DB, provider, payment/refund/payout, live notification, live AI, real customer/student/order/session mutation, or production enablement was used. Staging rehearsal, dashboards/alerts/correlation, incident ownership/drill, retention approval, security review, and separate manual go-live approval remain blockers. Status remains `production_ready=false` and `production_enabled=false`.

---

## 19. L6 update - Codex job 00063 (2026-07-10)

`codex_job_minhhuong_00063_learning_core_production_hardening_go_live_gate` adds a repo-local auth operational alert-policy evaluator over the shared redacted snapshot. Synthetic fixtures prove threshold candidates for login/refresh throttling, refresh replay, and repository error; stable fingerprints and cooldowns suppress repeat candidates; `ADMIN` and `SUPPORT` receive read-only inspection while learner/parent roles are denied before snapshot access; snapshot outage returns 503.

The evaluator sends no external alert or notification and exposes no identity, rate key, access token, or refresh token. Seed/report now export the auth alert-policy matrix. Cooldown state remains process-local and thresholds use retained snapshot totals, so shared deduplication, staging time-window calibration, dashboards/correlation, external routing, on-call/incident rehearsal, retention approval, security review, and separate manual go-live approval remain blockers. Status remains `production_ready=false` and `production_enabled=false`.

---

## 20. L6 update - Codex job 00064 (2026-07-10)

The enforced runner contract repeated the Prisma `AuthSessionStore` local/staging slice that jobs 00059 and 00061 had already implemented. This round closes a concrete adjacent defect: the repository previously accepted any non-empty persisted refresh-token value as a hash and PostgreSQL had no hash-format constraint.

`PrismaAuthSessionStore` now rejects malformed token hashes on read, create, update, and atomic rotation. A forward-only validated PostgreSQL constraint enforces lowercase 64-character SHA-256 form. Disposable-local repair evidence revokes malformed rows, writes redacted `ADMIN`/`SUPPORT` audit events, replaces invalid values with non-authenticating tombstone hashes, rehearses constraint-only rollback/reactivation, and proves the database rejects new raw-token-like values. Existing two-client/two-process shared revocation, repository-outage denial, backup/restore harness, and production runtime gates remain preserved.

No staging or production DB, deploy, provider, payment/refund/payout, notification, live AI, real customer/learner/account/session, or production enablement was used. Database-owner-approved staging rehearsal, production observability/incident/retention/security evidence, and separate manual go-live approval remain blockers. Status remains `production_ready=false` and `production_enabled=false`.

---

## 21. L6 update - Codex job 00065 (2026-07-10)

The incoming transport reused the completed Prompt 15B/manual-paid-pilot title, while job 00064's reviewed next context names shared auth-alert state and rolling-window input as the concrete L6 blocker. This job follows that blocker and preserves the existing subscription, 10-day refund-window, commission release, revoke/clawback, and payout-safety behavior unchanged.

`AUTH_OPERATIONAL_ALERT_STATE` now provides fixture and Prisma implementations behind a production-blocked provider seam. Alert inspection uses an explicit rolling 60-minute snapshot. The Prisma implementation serializes candidate-set evaluation with a PostgreSQL transaction advisory lock and stores only redacted policy fingerprints/codes and cooldown timestamps.

One random localhost PostgreSQL rehearsal starts two independent Nest processes. Concurrent ADMIN inspection produces exactly one four-candidate OPEN set and one four-candidate cooldown-suppressed set; state/snapshot outage fails closed; two expired rows are removed while four current rows remain; identity/rate key/token redaction and exact process/database/temp cleanup pass. No external alert/notification provider is called.

No staging or production DB, deploy, provider, payment/refund/commission/payout, live notification, live AI, real customer/learner/account/session/order mutation, or production enablement was used. Staging migration/calibration/capacity, dashboards/correlation/routing, on-call incident rehearsal, retention/privacy approval, external security review, and separate manual go-live approval remain blockers. Status remains `production_ready=false` and `production_enabled=false`.

---

## 22. L6 update - Codex job 00066 (2026-07-10)

`codex_job_minhhuong_00066_learning_core_production_hardening_go_live_gate` follows the reviewed job 00065 blocker with a redacted append-only auth-alert evaluation audit and disposable-local advisory-lock contention evidence. State decisions and audit rows commit atomically; exact correlation replay is idempotent, conflicting reuse fails closed, and hourly cleanup removes expired state plus audit rows.

One random localhost PostgreSQL rehearsal runs eight concurrent inspections across two independent Nest processes behind a deliberate 500 ms advisory-lock hold. It proves one whole OPEN set plus seven whole cooldown-suppressed sets, unique redacted response correlations, exact two-state/two-audit cleanup, snapshot/state/audit outage denial, and measured lock/evaluation/client durations under a 5,000 ms local technical threshold. This threshold is local evidence only, not a production SLA.

No staging or production DB, deploy, provider, payment/refund/commission/payout, live notification, live AI, real customer/learner/account/session/order mutation, or production enablement was used. Staging migration/calibration/load evidence, production dashboards/log/trace integration, routing/on-call rehearsal, retention/privacy approval, external security review, and separate manual go-live approval remain blockers. Status remains `production_ready=false` and `production_enabled=false`.

---

## 23. L6 update - Codex job 00067 (2026-07-10)

The enforced runner contract repeated the Prisma `AuthSessionStore` slice already implemented in jobs 00059, 00061, and 00064. This round closes a concrete cross-instance race: service-level revocation previously updated the session and each active refresh token in separate calls, while refresh rotation did not lock the session row before claiming and creating a replacement.

`AuthSessionStore` now provides atomic session-family revocation. The Prisma provider locks the shared session row before issuance, rotation, and revocation; revocation updates the session plus every active family token in one transaction. If rotation commits first, the replacement is revoked by the next transaction. If revocation commits first, rotation cannot create a replacement. Six concurrent rotate/revoke races through two independent Prisma clients finish with the session revoked and zero active refresh tokens every time.

The existing random-localhost migration/rollback/forward-repair contract, hash-only persistence, outage denial, two-process backup/restore smoke, learning-local evidence, and manual paid-pilot safety checks remain preserved. No staging/production database, deploy, real account/session, provider, payment/refund/payout, notification, live AI, or production enablement was used. Staging race rehearsal, observability/incident/retention/security approval, capacity/failover evidence, and separate manual go-live approval remain blockers. Status remains `production_ready=false` and `production_enabled=false`.

---

## 24. L6 update - Codex job 00068 (2026-07-10)

The incoming transport reused the completed Prompt 15B/manual-paid-pilot title, but its enforced requirement and job 00067's reviewed next context identify the concrete open L6 slice: a redacted auth-alert evaluation-audit read model. This job follows that concrete slice and leaves the subscription, 10-day refund window, commission release, revoke/clawback, and payout-safety implementation unchanged.

ADMIN and SUPPORT now have read-only exact correlation lookup plus bounded paginated JSON incident export. The service denies learner roles before repository access, limits windows to seven days and pages to 100 rows, orders deterministically by evaluation time and correlation, filters expired rows at read time, and returns 503 on repository/integrity outage. The read schema excludes identity, rate-key, credential, token, digest, and internal-fingerprint fields.

One random localhost PostgreSQL rehearsal through two Nest processes proves a retained correlation lookup, three pages covering nine unique audit rows, stable tie-safe ordering, overlong-window rejection, response redaction, repository-outage denial for both routes, and exact database/process/temp cleanup. No external export delivery, alert/notification provider, staging/production DB, real account/session, payment/refund/commission/payout, live AI, or production enablement was used.

Staging migration/read calibration, production-like volume/capacity, approved retention/export handling, dashboard/log/trace integration, incident routing/on-call drill, privacy/security approval, and separate manual go-live approval remain blockers. Status remains `production_ready=false` and `production_enabled=false`.

---

## 25. L6 update - Codex job 00069 (2026-07-10)

`codex_job_minhhuong_00069_learning_core_production_hardening_go_live_gate` adds an executable local-demo release-candidate gate report instead of reopening completed auth or manual-paid-pilot behavior. The guarded endpoint, seed, and report paths now produce 32 deterministic journeys across student, parent, teacher, admin, support, sales, channel, and finance roles. Every role includes a happy path, denied path, inactive/expired path, and permission-negative path.

The report also consolidates six passing local smoke areas, two staging-only smoke blockers, the nine canonical runtime/deploy gates, and rollback/containment guidance for every deploy gate. The job 00068 learning-local test baseline is recorded as immutable; the slice adds tests and does not delete, skip, rename, relax, or weaken existing acceptance.

The result is a non-production release-candidate evidence bundle, not go-live approval. No staging/production database, deploy, provider API, live notification, live AI, real customer/student/order/payment/refund/payout mutation, or production enablement was used. Staging migration/backup/restore/capacity rehearsal, observability and incident drill, privacy/retention/export approval, external security review, provider approvals, and separate manual go-live approval remain blockers. Status remains `production_ready=false` and `production_enabled=false`.

---

## 26. L6 update - Codex job 00070 (2026-07-10)

The enforced runner contract repeated the Prisma `AuthSessionStore` slice already implemented in earlier jobs. This round closes the remaining atomicity gap in normal logout: the service previously wrote `ENDED` and revoked active refresh tokens through separate repository calls even though the canonical transition requires one atomic provider write.

`AuthSessionStore.endSessionAtomically` now terminates the session family behind the fixture/Prisma provider seam. The Prisma provider locks the same shared session row used by refresh rotation, writes `ENDED`, and revokes every active refresh token in one transaction. Six rotate/logout races across two Prisma clients finish with either clean `ENDED` logout or stronger replay `REVOKED` denial and always zero active refresh tokens.

The random-localhost migration/rollback/forward-repair contract and two-process backup/restore smoke were rerun with exact cleanup. No new schema migration was required. No staging/production database, deploy, real account/session, provider, payment/refund/payout, notification, live AI, or production enablement was used. Staging rehearsal, observability/incident/retention/security approval, capacity/failover evidence, and separate manual go-live approval remain blockers. Status remains `production_ready=false` and `production_enabled=false`.

---

## 27. L6 update - Codex job 00071 (2026-07-10)

The incoming transport reused the completed Prompt 15B/manual-paid-pilot title, while job 00070's exact next prompt requires the auto-loop to pause for staging and go-live approvals. This repo-local slice does not reopen the money flow and does not invent human authorization.

The executable release-candidate report now lists database-owner, privacy/retention-owner, incident-owner, security-owner, provider-owner, and named release-owner approval rows. Each row defines the exact acceptance criteria and evidence needed for migration/read/backup/restore/forward repair/capacity/failover, RPO/RTO, rollback, monitoring/correlation/incident, retention/deletion/export, provider reconciliation/limits/kill switches, and the final residual-risk/release decision.

All six approvals remain `PENDING_HUMAN_APPROVAL`; five block their relevant staging activity and all six block production. The report emits `NEEDS_HUMAN_APPROVAL`, `PAUSE_AUTO_LOOP`, `stagingExecutionAuthorized=false`, and `productionExecutionAuthorized=false`. Existing fixture-only 10-day refund-window, commission release/hold, revoke/clawback, entitlement, and payout-safety evidence remains unchanged.

No staging/production DB, deploy, real learner/customer/order/payment mutation, provider API, payment/refund/commission/payout mutation, notification, or live AI action was used. `production_ready=false`, `production_enabled=false`, and manual go-live approval remain mandatory. Resume only with authentic external approval evidence and a newly scoped job.

---

## 28. L6 update - Codex job 00072 (2026-07-10)

`codex_job_minhhuong_00072_learning_core_production_hardening_go_live_gate` closes a repo-local evidence-integrity defect in the release-candidate gate. The previous report asserted 32 journeys but did not expose an executable role/scenario fixture resolution contract.

Gate schema v3 now emits 32 synthetic role/scenario fixtures across student, parent, teacher, admin, support, sales, channel, and finance. Every journey resolves to one matching fixture; unknown fixture identifiers, cross-role access, denied actions, and inactive/expired fixtures fail closed. The report records zero role mismatches, zero unsafe evidence paths, no credentials, and no real-person data. The reviewed job 00071 baseline of 115 learning-local tests is preserved and extended to 117.

All six external approvals remain `PENDING_HUMAN_APPROVAL`; no approver identity, approval timestamp, signature, or evidence was fabricated. No staging/production DB, deploy, provider, money mutation, notification, live AI, or real learner/customer/order/payment action was used. `production_ready=false`, `production_enabled=false`, and `PAUSE_AUTO_LOOP` remain mandatory.

---

## 29. L6 update - Codex job 00073 (2026-07-10)

The workspace-owner directive is recorded in `docs/hoctap_minhhuong/approvals/2026-07-10_staging_conditional_approval.json`. It conditionally authorizes only `minhhuong-staging-rc-v3-local`, an isolated non-production local staging target. It does not authorize production, real data, production credentials, or external provider mutation.

The new `rehearse:staging` lane validates that approval and then composes the existing disposable PostgreSQL contracts into one reviewable rehearsal: migration/read validation, pre-activation rollback, malformed-hash forward repair, constraint reactivation, backup/checksum/restore, cross-process session revocation, atomic operational controls, alert correlation/read model, outage denial, retention deletion, resource headroom, and exact cleanup. The run passed 12/12 gates with 655 ms observed local RPO, 1,175 ms restore/validation RTO, 34.09% minimum free-memory headroom, and zero remaining matching databases/processes/listeners/temp artifacts.

Gate schema v4 accepts rehearsal evidence only when the target, approval code, PASS checks, false production flags, and all four exact-cleanup counters match. The two staging smoke rows then become `PASS_ISOLATED_STAGING`, while all production blockers remain. Learning-local is 118/118, paid-pilot money safety is 90/90, seed/report and the full Nest/Next build pass.

Provider sandbox credentials were not supplied, so provider contracts remained fixture/mock-only and the provider lane stays blocked. This local rehearsal is not hosted production capacity, failover, external alert-routing, independent security-review, or provider acceptance evidence. The next state is `STOP_FOR_SEPARATE_FINAL_RELEASE_DECISION`; `production_ready=false` and `production_enabled=false` remain mandatory.

---

## 30. L6 update - Codex job 00074 (2026-07-10)

`codex_job_minhhuong_00074_learning_core_production_hardening_go_live_gate` closes a repo-local release-evidence integrity gap without extending the job 00073 staging authorization. The new fail-closed manifest verifies that every v4 gate evidence reference is repo-contained and present, rejects traversal/symlink/unsupported paths, and records SHA-256 hashes for files plus deterministic directory inventories.

The regenerated report proves 101 references, 38 unique evidence paths, 75 hashed files, and zero failed paths; per-path and aggregate SHA-256 digests are kept in the generated manifest. Three additive contract tests advance learning-local from the reviewed 118-test baseline to 121/121. The preserved manual paid-pilot safety suite remains 90/90, seed/report pass, and the full Nest/Next build passes with 17 static pages.

This manifest is local integrity evidence only. It does not prove hosted load/capacity/failover, external routing/on-call, provider acceptance, independent security review, trusted signing, or production authorization. The auto-loop remains `STOP_FOR_SEPARATE_FINAL_RELEASE_DECISION`; `production_ready=false` and `production_enabled=false` remain mandatory.

---

## 31. L6 update - Codex job 00075 (2026-07-11)

`codex_job_minhhuong_00075_hosted_staging_deployment_engineering_foundation` packages the release candidate as a provider-neutral hosted-staging reference without selecting a provider, creating cloud resources, publishing images, or enabling production.

The repository now contains deterministic multi-stage Nest API and Next web images, non-root application runtimes, liveness/readiness/metrics contracts, a private PostgreSQL/Redis data network, a one-shot advisory-locked `prisma migrate deploy` job with backup and controlled restore hooks, fail-closed hosted-staging environment validation, CI-ready verification, and a complete operational runbook. The API runtime image excludes the Prisma schema/migration source tree; only the migration target contains those assets.

Local verification passed: deployment contracts 8/8, focused runtime/health/provider tests 26/26, learning-local 123/123, preserved paid-pilot safety 90/90, deterministic seed/report, Prisma generate/validate, Nest/Next build with 17 pages, both container builds, and the isolated container smoke. The smoke proved API liveness, PostgreSQL/Redis readiness, web reachability, production denial of local-demo routes, migration rerun, API restart, non-root/minimal image contents, and exact cleanup with zero remaining containers, networks, volumes, or listeners.

This is local deployment engineering evidence, not a hosted deployment or production approval. A real hosted target, DNS/TLS, managed-service credentials, object storage/multi-instance upload behavior, external monitoring/on-call, capacity/failover evidence, independent security/privacy review, provider acceptance, and a separate release-owner decision remain open. Required status remains `production_ready=false`, `production_enabled=false`, and `GO_LIVE_BLOCKED`.

---

## 32. L6 update - Codex job 00076 (2026-07-11)

`codex_job_minhhuong_00076_learning_core_production_hardening_go_live_gate` closes a concrete hosted-staging upload-storage consistency defect without selecting a provider or authorizing a hosted deployment. Static serving already honored `UPLOADS_PATH`, but admin video, teacher video, activation-order invoice/payment-proof, and channel-finance payout-invoice uploads still resolved from `process.cwd()` independently.

All four upload surfaces now use one filesystem resolver and the same configured root as static serving. Hosted-staging runtime validation accepts the current filesystem adapter only when `UPLOAD_STORAGE_TOPOLOGY=single-instance` and `API_REPLICA_COUNT=1`; missing topology and multi-replica claims fail closed. Dependency readiness now proves the configured upload root is writable with a private create/sync/delete probe and returns only status/timing, not the path.

Synthetic seed/report evidence covers four upload surfaces and three denied negative cases with zero unsafe accepts. Deployment contracts pass 9/9, learning-local advances additively from 123 to 128 tests, paid-pilot safety remains 90/90, full Nest/Next build passes with 17 routes, both runtime images build, and isolated container smoke proves database/Redis/upload readiness plus exact cleanup.

This is still a single-instance filesystem release-candidate contract. Object/shared storage, hosted target authorization, managed-service and DNS/TLS ownership, capacity/failover, external observability/on-call, privacy/security acceptance, provider acceptance, and a separate named release-owner production decision remain blockers. Required status remains `production_ready=false`, `production_enabled=false`, and `GO_LIVE_BLOCKED`.
