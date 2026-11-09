# Huong dan cho tro ly AI

**Truoc khi viet, sua, tach hoac kiem thu bat ky code nao trong repo nay, phai doc toan bo [`quytac.md`](quytac.md) va lam theo.**

Tom tat cac quy tac quan trong nhat (chi tiet va day du nam trong `quytac.md`):

1. Backend theo chuan NestJS: module / controller / service / DTO, dependency injection, moi request body phai co DTO (muc 4, 5).
2. Frontend Next.js to chuc theo tinh nang: hook state + component trong `_components/`, `page.tsx` chi ghep cac phan (muc 9).
3. Khong file source nao vuot 1000 dong; file trong `scripts/file-length-baseline.json` khong duoc dai them. Kiem tra bang `npm run check:file-length` (muc 2).
4. Chuc nang moi di theo quy trinh o muc 11, co test va kiem thu theo muc 12, bao cao trung thuc ket qua.
5. Khong xoa/skip test de pass, khong commit secret, khong tu y commit/push/merge khi nguoi dung chua yeu cau (muc 0).

Frontend dung phien ban Next.js moi: doc them `apps/web/AGENTS.md` truoc khi sua `apps/web`.
