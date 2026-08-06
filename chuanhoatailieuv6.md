# Chuan Hoa Tai Lieu V6 - Multi Project Auto Loop Standard

Ngay cap nhat: 2026-06-30

Ban chat: day la chuan van hanh chung de ap dung cho nhieu du an, khong thuoc rieng mot repo hay mot khach hang nao.

Nguon ke thua: kinh nghiem van hanh tu cac pack V5 auto-loop, cac vong Codex CLI + ChatGPT Web, va cac loi thuc te ve prompt qua dai, schema decision, stale decision, runner/watcher.

Muc tieu V6: giu truc BA san pham tren moi du an, tang toc vong lap Codex CLI + ChatGPT Web, giam lag prompt watcher extension, va khoa an toan schema de runner co the tiep tuc tu dong ma khong mat ngu canh.

## 0. Pham vi va project adapter

`chuanhoatailieuV6.md` la standard loi. Moi du an muon dung standard nay phai co mot project adapter rieng, toi thieu gom:

```text
PROJECT_KEY
REPO_KEY
PROJECT_NAME
LOCAL_REPO_PATH
DRIVE_PROJECT_ROOT_URL
DRIVE_DOCS_FOLDER_URL
DRIVE_PROMPTS_FOLDER_URL
DRIVE_CONTEXTS_FOLDER_URL
DRIVE_POINTERS_FOLDER_URL
DRIVE_OUTPUTS_FOLDER_URL
CHATGPT_CONVERSATION_URL
DRIVE_CHATGPT_POINTER_URL
DRIVE_CODEX_POINTER_URL
SAFE_SCOPES
HARD_STOPS
CURRENT_JOB_ID
CURRENT_STATUS
```

Quy tac:

- Chuan V6 khong hard-code ten du an.
- Moi gia tri cu the cua du an nam trong registry/adapter/pointer.
- ChatGPT Web, watcher, runner va Codex CLI phai doc adapter cua du an truoc khi ap dung rule V6.
- Khi copy sang du an moi, chi thay adapter va BA/docs/context; khong sua chuan loi tru khi co bai hoc van hanh moi dung cho nhieu du an.

## 1. Ket luan van hanh

Mo hinh dung cho san xuat phan mem theo vong lap:

```text
BA/docs/context
-> runner local safety gate
-> Codex CLI sinh code/evidence
-> runner upload output len Drive
-> watcher extension gui prompt nhe cho ChatGPT Web
-> ChatGPT Web review va ghi AUTO_REVIEW_DECISION.json
-> runner compile pointer an toan
-> Codex CLI chay job tiep theo
```

V6 chap nhan thuc te: Codex CLI va ChatGPT Web deu manh, nhung luong auto chi on khi tai lieu, schema, prompt budget va recovery rule du ro. Khong de ChatGPT Web doan schema. Khong de watcher extension gui prompt qua dai. Khong de runner bi chan boi stale decision cua job cu.

## 2. Phan vai bat buoc

ChatGPT Web:

- La BA Owner, Review Owner, Next-Step Decision Owner.
- Review output cua Codex dua tren Drive evidence.
- Ghi `AUTO_REVIEW_DECISION.json` va `runner_signal`.
- Duoc de xuat `next_codex_pointer` dang mo ta.
- Khong duoc tao executable `drive_codex_pointer.json` truc tiep.

Codex CLI:

- La worker thuc thi repo local.
- Sinh code, tests, evidence va output contract.
- Khong tu y vuot hard-stop production/live/provider/payment.
- Neu gap thieu ngu canh thi ghi ro gap va de xuat next prompt.

Runner:

- La execution compiler va safety gate.
- Doc decision cua ChatGPT Web, validate schema, compile pointer executable neu an toan.
- Duoc repair metadata vo hai khi co bang chung ro.
- Khong duoc repair safety fields nhu approval, scope, repo path, hard-stop, production mutation.

Watcher extension:

- La dispatcher gui prompt nhe vao ChatGPT Web.
- Khong lam BA, khong review, khong sinh decision thay ChatGPT Web.
- Khong nhan toan bo evidence neu da co Drive links va review bundle.

## 3. Bai hoc tu su co van hanh

### 3.1. Prompt watcher extension qua dai

Trieu chung:

- ChatGPT Web lag, treo hoac mat nhieu phut moi tra loi.
- Prompt bi lap lai nhieu phan context da nam trong Drive.
- ChatGPT Web tap trung vao noi dung phu thay vi decision JSON.

Rule V6:

- Prompt watcher extension chi la envelope ngan.
- Noi dung nang phai nam trong Drive files: `CHATGPT_REVIEW_BUNDLE.md`, `REVIEW_PACKET.md`, `RESULT.json`, `TESTS_RUN.md`, `RISKS_AND_GAPS.md`, `NEXT_CONTEXT_PACKET.md`.
- Prompt phai uu tien link/file id, job id, yeu cau review, schema output bat buoc.
- Khong dua toan bo source/evidence vao prompt neu da co file Drive.

Prompt watcher extension nen gom:

```text
1. Project key, repo key.
2. source_job_id cua ChatGPT review job.
3. reviewed_codex_job_id cua Codex job can review.
4. Link Drive root va cac file review bundle.
5. Yeu cau doc evidence, quyet dinh PASS/FAIL/BLOCKED.
6. JSON schema bat buoc cho AUTO_REVIEW_DECISION.json.
7. Hard-stop safety rules.
8. Huong dan runner_signal.
```

Muc tieu kich thuoc: du ngan de ChatGPT Web khong lag, du ro de khong tra sai schema.

### 3.2. Loi schema tu ChatGPT Web

Su co da gap:

- ChatGPT Web tra decision thieu `protocol_version`.
- ChatGPT Web tra decision thieu `reviewed_codex_job_id`.
- Runner block vi `AUTO_REVIEW_DECISION.json` khong du required fields.

Rule V6:

`AUTO_REVIEW_DECISION.json` bat buoc co cac field:

```json
{
  "schema_version": "chatgpt_review_decision.v2",
  "protocol_version": "1.0",
  "direction": "chatgptweb_review_decision",
  "project_key": "<PROJECT_KEY>",
  "repo_key": "<REPO_KEY>",
  "source_job_id": "chatgpt_review_job_TODO",
  "reviewed_codex_job_id": "codex_job_TODO",
  "updated_at": "TODO_ISO_TIMESTAMP",
  "decision": "PASS_WITH_NOTES",
  "production_ready": false,
  "summary": "TODO",
  "acceptance": {
    "all_input_files_read": true,
    "tests_passed": true,
    "safety_gates_closed": true,
    "production_db_used": false,
    "provider_api_used": false,
    "erp_mutation_used": false
  },
  "runner_signal": {
    "action": "REQUEST_CODEX_RUN",
    "recommended_status": "CODEX_READY_EVIDENCE_ONLY",
    "recommended_next_status": "CODEX_READY_EVIDENCE_ONLY",
    "human_approved": false,
    "approval_code": "",
    "approval_scope": "evidence_only",
    "runner_may_continue": false
  },
  "next_codex_pointer": null
}
```

Khong chap nhan decision neu:

- Thieu `source_job_id`.
- Thieu `reviewed_codex_job_id` va runner khong the suy ra tu current trusted pointer.
- `source_job_id` khong khop current ChatGPT review job.
- `runner_signal.action` khong thuoc danh sach hop le.
- `runner_may_continue=true` nhung scope khong an toan hoac thieu approval bat buoc.

### 3.3. Runner block vi stale decision

Su co da gap:

- Decision cua job cu van ton tai tren Drive.
- Runner dang xu ly job moi nhung doc phai decision cu.
- UI hien `Waiting for valid ChatGPT Web decision` hoac `REVIEW_DECISION_BLOCKED`.

Rule V6:

- Runner phai so khop `source_job_id` voi current `chatgptReviewJobId(currentPointer.job_id)`.
- Neu decision co `source_job_id` khac current review job thi bo qua nhu `not_requested`, khong block job hien tai.
- Stale decision la tin hieu lich su, khong phai loi cua job hien tai.
- UI nen hien ro: `stale decision ignored`.

### 3.4. Runner repair policy

Runner duoc repair metadata vo hai:

- `protocol_version` neu thieu va schema version/direction hop le.
- `reviewed_codex_job_id` neu `source_job_id` khop current review job va current pointer dang tin cay.
- Display title, source role, prompt role neu co the suy ra tu filename.

Runner khong duoc repair:

- `project_key`, `repo_key`, `repo_path`.
- `runner_may_continue`.
- `human_approved`.
- `approval_scope`.
- Hard-stop flags.
- Production/live/provider/payment permission.
- Expected outputs.
- Drive URLs.

Moi repair phai ghi audit flag, vi du:

```json
{
  "runner_repaired_missing_protocol_version": true,
  "runner_repaired_missing_reviewed_codex_job_id": true
}
```

### 3.5. Loi runner/watcher ban dau

Su co da gap:

- Watcher/runner cu van chay voi code cu.
- Run-once moi thanh cong nhung watch cu ghi lai state BLOCKED.
- UI hien loi cu, lam tuong CLI chua chay.

Rule V6:

- Chi duoc co mot watcher cho mot `project_key`.
- Truoc khi force-run phai kiem tra duplicate watcher/process.
- Sau khi rebuild extension/runner, phai stop old watch va start lai watch.
- Trang thai that phai doi chieu 4 nguon: process, workspace output, Drive pointer, UI live status.
- Khong chi nhin mot stale UI log de ket luan job dang loi.

## 4. Chuan prompt width

### 4.1. Prompt cho Codex CLI

Prompt Codex CLI phai du rong de lam viec doc lap:

- BA spine: muc tieu san pham, persona, workflow, scope.
- Current checkpoint: da xong gi, dang o job nao.
- Acceptance: file/test/evidence nao bat buoc.
- Safety: hard-stop, scope, DB/provider/live mutation.
- Next work: mot nhiem vu ro, co diem dung.
- Output contract: danh sach file phai sinh.

Khong nen qua hep nhu chi ghi mot cau task. Neu qua hep, Codex CLI co the lam dung viec nho nhung khong giu truc san pham.

### 4.2. Prompt cho ChatGPT Web

Prompt ChatGPT Web phai nhe hon Codex prompt:

- Khong nhung toan bo evidence dai.
- Khong copy lai toan bo BA neu da co Drive doc.
- Uu tien link/file ids va checklist review.
- Schema output phai xuat hien gan cuoi prompt, ro va ngan.
- Yeu cau tra `CHATGPTWEB_REVIEW_DECISION_UPDATED` kem JSON/file decision.

Nguyen tac:

```text
Codex prompt = du rong de thi cong.
ChatGPT Web prompt = du gon de review va ra decision dung schema.
Drive docs = noi giu ngu canh nang.
```

## 5. Safety gate bat buoc

Allowed safe scopes:

- `review_only`
- `evidence_only`
- `repo_local_only`
- `code_and_tests_only`
- `local_demo_only`
- `hardening_local_only`
- `production_readiness_audit`
- `staging_dry_run`
- `staging_readonly`

Hard-stop:

- Production DB read/write.
- Provider API mutation.
- Payment/refund mutation.
- Production deploy.
- Data destructive command.
- Privacy/security change khong co acceptance.

Neu vuot safe scope:

```json
{
  "runner_signal": {
    "action": "NEEDS_HUMAN_REVIEW",
    "runner_may_continue": false
  }
}
```

`human_approved=true` chi duoc dung cho cac scope duoc neu ro trong prompt va acceptance. Khong duoc dung approval nay de vuot production/live/provider/payment mutation.

## 6. Production hardening and go-live gate

Khi MVP/local-demo da PASS nhung `production_ready=false`, ChatGPT Web khong duoc tu ket luan du an da xong. Neu khong con vertical slice local-demo an toan nao, vong tiep theo phai chuyen sang phase:

```text
PRODUCTION_HARDENING_AND_GO_LIVE_GATE
```

Phase nay van la safe auto-loop phase. No khong cho production deploy, production DB mutation, provider/payment/refund mutation, live notification, live AI provider execution, hoac real customer data mutation. Muc tieu la bien MVP local-demo thanh release candidate co bang chung test, du lieu mau, staging/read-only gate va go-live checklist ro rang.

Thu tu phase bat buoc:

1. `H0_DEMO_DATA_COMPLETENESS`: seed/fixture/demo data phai day du role, lifecycle, success path, failure path, edge case, permission negative case.
2. `H1_TEST_MATRIX_FREEZE`: lap matrix test bat buoc va dong bang tieu chuan test hien co. Khong duoc ha chuan de pass.
3. `H2_REPO_LOCAL_HARDENING`: sua code/config/test trong repo local, chay lint/build/unit/e2e/smoke phu hop scope.
4. `H3_STAGING_DRY_RUN_OR_READONLY`: chi duoc dry-run/read-only neu co DB Test Gate, env separation, no mutation proof.
5. `H4_GO_LIVE_EVIDENCE_AUDIT`: tao bao cao deploy readiness, rollback, monitoring, backup/restore, auth/session/RBAC/data permission, privacy/audit, payment/provider gates.
6. `H5_MANUAL_PRODUCTION_APPROVAL`: chi con nguoi moi duoc quyet dinh deploy production/live/provider/payment.

Test standard immutable rule:

- Khong duoc sua, xoa, skip, relax, hoac rename test/acceptance hien co chi de pass.
- Neu test fail thi uu tien fix code, demo data, fixture, config, hoac evidence.
- Chi duoc sua test khi co bang chung test sai voi BA/truc hien hanh; phai tao `TEST_STANDARD_CHANGE_REQUEST.md`, neu ro test cu sai, anh huong, va approval can co.
- Codex/ChatGPT Web duoc them test moi de tang coverage; khong duoc giam coverage hien co.
- Moi vong hardening phai ghi ro tests run, tests skipped, ly do skip, va risk con lai.

Demo data completeness rule:

- Du lieu mau phai co du persona/role chinh cua du an.
- Moi role phai co it nhat mot happy path, mot denied/permission path, mot expired/inactive path neu nghiep vu co trang thai do.
- Payment/subscription/refund/provider chi duoc fixture/simulation tru khi co manual production approval rieng.
- Du lieu mau phai du de test dashboard/report/parent-facing/user-facing evidence, khong chi du de API tra 200.

Required hardening outputs:

```text
PRODUCTION_HARDENING_PLAN.md
DEMO_DATA_MATRIX.md
ROLE_PERMISSION_TEST_MATRIX.md
E2E_SMOKE_TEST_MATRIX.md
DEPLOY_READINESS_GAPS.md
GO_LIVE_GATE_REPORT.md
TEST_STANDARD_CHANGE_REQUEST.md (chi tao khi de xuat sua test/acceptance)
```

Runner/ChatGPT Web next-job rule:

- Neu latest Codex job PASS/PASS_WITH_NOTES, local-demo readiness da du, va `production_ready=false`, ChatGPT Web nen tao `next_codex_pointer` cho hardening gate thay vi `NO_NEXT_JOB`.
- `NO_NEXT_JOB` chi hop le khi hardening gate da xong hoac khi khong con viec an toan nao ma khong can human production approval.
- `runner_signal.action="REQUEST_CODEX_RUN"` duoc phep cho `production_readiness_audit`, `hardening_local_only`, `staging_dry_run`, `staging_readonly`, `repo_local_only`, `code_and_tests_only`, `evidence_only`.
- `production_ready=true` chi duoc dat sau `H5_MANUAL_PRODUCTION_APPROVAL` va day du gate bang chung; auto-loop khong tu dat true.

## 7. Force-run recovery SOP

Khi auto loop bi dung:

1. Kiem tra UI runner: latest job, state, waiting_on, process, artifacts.
2. Kiem tra Codex CLI process that su con chay khong.
3. Kiem tra workspace `.codex-workspaces` cua latest job co output/log moi khong.
4. Kiem tra Drive pointer va `AUTO_REVIEW_DECISION.json`.
5. Neu decision thieu schema vo hai, runner repair theo policy V6.
6. Neu decision stale, runner ignore, khong block.
7. Stop duplicate watcher neu co.
8. Chay `run once` de force job hien tai.
9. Sau khi `DONE`, start watch lai.
10. Xac nhan `watchRunning=true`, latest job `DONE`, khong con Codex CLI process.

Khong sua state file thu cong tru khi:

- Da co bang chung job thuc te `DONE`.
- Output da upload thanh cong.
- Pointer da cap nhat.
- Chi can sua state local bi stale do watch cu ghi de.

## 8. Health dashboard can doc nhu the nao

Neu UI bao `Waiting for valid ChatGPT Web decision`:

- Chua chac la Codex CLI loi.
- Kiem tra `waiting_on`.
- Kiem tra latest job id co khop ChatGPT Web response khong.
- Kiem tra `source_job_id` va `reviewed_codex_job_id`.

Neu ChatGPT Web da tra `REQUEST_CODEX_RUN` nhung runner khong chay:

- Kiem tra decision JSON co du schema khong.
- Kiem tra runner_signal co `runner_may_continue=true` khong.
- Kiem tra approval/scope.
- Kiem tra watcher/runner co phai ban build moi khong.

Neu ChatGPT Web lag:

- Giam prompt watcher extension.
- Dung Drive review bundle thay vi paste noi dung dai.
- Reload ChatGPT Web tab neu UI dang treo.
- Reload unpacked extension sau khi rebuild `dist-extension`.

## 9. Output contract giu nguyen tu V5

Codex must create:

```text
RESULT.md
RESULT.json
REVIEW_PACKET.md
MANIFEST.json
FILES_CHANGED.md
TESTS_RUN.md
RISKS_AND_GAPS.md
NEXT_CONTEXT_PACKET.md
NEXT_CONTEXT_INDEX.json
CONTEXT_DELTA.md
```

V6 khuyen khich them:

```text
CHATGPT_REVIEW_BUNDLE.md
RUNNER_HEALTH_NOTES.md
SCHEMA_COMPATIBILITY_NOTES.md
```

## 10. Acceptance cho moi vong auto

Moi vong duoc xem la hop le khi:

- Codex job co output contract day du.
- Test/build/lint phu hop scope da chay hoac ly do khong chay duoc duoc ghi ro.
- `REVIEW_PACKET.md` co du thong tin cho ChatGPT Web review.
- ChatGPT Web decision hop schema V6.
- Runner compile pointer an toan.
- Khong co duplicate watcher.
- Khong co stale decision block current job.
- UI live status va workspace output khop nhau.

## 11. Quy tac cap nhat tai lieu tiep theo

Khi gap su co van hanh moi:

- Khong chi fix code.
- Phai cap nhat tai lieu chuan hoa neu su co anh huong loop tu dong.
- Moi su co nen duoc ghi thanh: trieu chung, nguyen nhan, rule moi, guardrail, checklist verify.
- Neu guardrail can enforce bang code, them test runner/watcher/extension tuong ung.

V6 la ban chuan hoa cho auto-loop on dinh: prompt gon hon, schema chat hon, runner co kha nang tu phuc hoi co gioi han, va ChatGPT Web van giu vai tro review/BA trung tam.
