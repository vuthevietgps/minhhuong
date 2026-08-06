# Channel Hierarchy Redesign

## Muc tieu

Thiet ke lai he thong kenh ban hang theo cay co thu bac ro rang:

- DIRECTOR
- MANAGER
- AGENCY
- SALE

Muc tieu cua thiet ke moi:

- bieu dien duoc quan he tuyen truc tiep giua cac cap
- cho phep cap tren tuyen truc tiep cap duoi hon
- tinh hoa hong theo chuoi upline thuc te, khong suy ra cung tu role
- tri hoan hoa hong den sau 15 ngay trial
- khong hoan tien sau khi qua trial

## Van de cua mo hinh hien tai

Mo hinh hien tai chi ho tro hai loai participant hoa hong:

- SALE
- AGENCY

Va hierarchy hien tai dang bi tron vao `AgencyMember` voi 3 role `OWNER`, `MANAGER`, `SALE`.

He qua:

- khong co quan he upline truc tiep tong quat
- khong bieu dien duoc chuoi `DIRECTOR -> MANAGER -> AGENCY -> SALE`
- commission engine chi tao 1 earning cho 1 participant/order
- web admin dang suy role cung thay vi di theo subtree thuc te

## Nguyen tac thiet ke moi

1. Role va cay tuyen dung la hai kham niem khac nhau.
2. Moi channel account phai co 1 parent truc tiep, tru root.
3. Hoa hong phai di theo chuoi parent truc tiep cua nguoi chot don.
4. Nguoi chot don co the la DIRECTOR, MANAGER, AGENCY hoac SALE.
5. Payout, wallet, report va permission deu scope theo subtree.

## Mo hinh nghiep vu de xuat

### Cap bac kenh

- DIRECTOR: xay va quan ly cay ben duoi; co the tuyen MANAGER, AGENCY, SALE
- MANAGER: quan ly 1 nhanh; co the tuyen AGENCY, SALE
- AGENCY: van hanh dai ly; co the tuyen SALE
- SALE: tim kiem khach hang va chot don

### Rule tuyen truc tiep

- DIRECTOR co the recruit: MANAGER, AGENCY, SALE
- MANAGER co the recruit: AGENCY, SALE
- AGENCY co the recruit: SALE
- SALE khong duoc recruit channel account khac

Node moi phai gan voi `parentNodeId` la nguoi recruit truc tiep.

Vi du:

- director recruit thang agency -> chain cua agency la `DIRECTOR -> AGENCY`
- manager recruit thang sale -> chain cua sale la `DIRECTOR -> MANAGER -> SALE`
- agency recruit sale -> chain la `DIRECTOR -> MANAGER -> AGENCY -> SALE`

## Data model moi

### 1. ChannelNode

Tao model tong quat thay cho viec suy hierarchy tu `AgencyMember`.

```prisma
enum ChannelNodeLevel {
  DIRECTOR
  MANAGER
  AGENCY
  SALE
}

model ChannelNode {
  id                 String            @id @default(cuid())
  code               String            @unique
  level              ChannelNodeLevel
  status             ChannelParticipantStatus @default(ACTIVE)
  displayName        String
  userId             String?           @unique
  agencyProfileId    String?           @unique
  parentNodeId       String?
  rootNodeId         String?
  referralCode       String?           @unique
  commissionRateBps  Int?
  baseSalaryCents    Int               @default(0)
  bankConfig         Json?
  metadata           Json?
  createdAt          DateTime          @default(now())
  updatedAt          DateTime          @updatedAt

  user               User?             @relation(fields: [userId], references: [id], onDelete: SetNull)
  agencyProfile      AgencyProfile?    @relation(fields: [agencyProfileId], references: [id], onDelete: SetNull)
  parent             ChannelNode?      @relation("ChannelNodeTree", fields: [parentNodeId], references: [id], onDelete: SetNull)
  children           ChannelNode[]     @relation("ChannelNodeTree")

  @@index([level, status])
  @@index([parentNodeId])
  @@index([rootNodeId])
}
```

### 2. AgencyProfile

Model `Agency` hien tai nen duoc giu lai nhung doi nghia thanh profile/to chuc cua node cap `AGENCY`.

No luu:

- ten phap ly dai ly
- ghi chu hop dong
- thong tin doi tac
- trang thai hoat dong

Khong dung `AgencyMember` de bieu dien cay quyen luc nua.

### 3. ActivationOrder

Bo sung cac truong sau:

- `closingNodeId`: node chot don truc tiep
- `commissionRootNodeId`: node root cua nhanh commission tai thoi diem chot don
- `commissionSnapshotJson`: snapshot chain tai thoi diem chot don
- `trialEndsAt`: `activatedAt + 15 days`
- `commissionReleasedAt`: thoi diem hoa hong duoc mo khoa

Order khong nen phu thuoc vao `agencyId` hay `referrerMemberId` de suy chain nua.

### 4. CommissionEarning

Mo rong de luu ro tung tang hoa hong:

- `nodeId`: nguoi nhan hoa hong
- `level`: DIRECTOR | MANAGER | AGENCY | SALE
- `depth`: 0 cho nguoi chot, 1 cho cap tren truc tiep, ...
- `upstreamOfEarningId`: earning cap duoi truc tiep
- `availableAt`: sau 15 ngay trial
- `releasedAt`: thoi diem chuyen AVAILABLE
- `ruleCode`: vd `CHAIN_40_40_TRIAL15`

Trang thai de xuat:

- PENDING: moi tao, dang trong trial
- AVAILABLE: qua 15 ngay, duoc payout
- CANCELED: bi huy trong trial

## Commission engine moi

### Rule chinh

- nguoi chot don truc tiep nhan 40% gia tri don
- moi cap tren truc tiep nhan 40% hoa hong cua cap duoi truc tiep
- commission chain di theo `parentNodeId`
- dung lai khi het parent hoac dat tran so tang cho phep

### Ty le mac dinh theo do sau

- depth 0: 4000 bps = 40%
- depth 1: 1600 bps = 16%
- depth 2: 640 bps = 6.4%
- depth 3: 256 bps = 2.56%

Tong toi da voi chain 4 tang la 64.96%.

### Thoi diem ghi nhan

1. Khi don duoc approve va kich hoat:
   - tao cac `CommissionEarning` o trang thai `PENDING`
   - set `availableAt = activatedAt + 15 days`
   - chua credit vao wallet spendable
2. Job hang ngay/15 phut kiem tra earning den han:
   - neu order van hop le va da qua trial -> chuyen `AVAILABLE`
   - tao `CommissionLedgerEntry` type `CREDIT`
3. Neu don bi huy trong trial:
   - chuyen cac earning lien quan sang `CANCELED`

### Y nghia van hanh

- khong can refund clawback sau trial
- don gian hoa payout
- report phai tach `pending trial commission` va `available commission`

## Permission model moi

### Quyen tao node

- ADMIN/OPERATIONS: tao moi cap
- DIRECTOR: tao MANAGER, AGENCY, SALE trong subtree cua minh
- MANAGER: tao AGENCY, SALE trong subtree cua minh
- AGENCY: tao SALE trong subtree cua minh
- SALE: khong tao node moi

### Quyen quan ly node

Moi node chi duoc:

- xem subtree cua minh
- khoa/mo khoa node trong subtree
- reset password node trong subtree
- xem report va wallet trong subtree

Khong duoc:

- xem sibling ngoai subtree
- doi parent cua ancestor
- tao node cung cap hoac cap tren minh

## Reporting va wallet

### Bao cao can co

- personal report: chi so cua node hien tai
- subtree report: tong doanh thu va hoa hong cua nhanh ben duoi
- closing report: thong ke don do node truc tiep chot
- override report: thong ke hoa hong tu tuyen duoi

### Wallet can co

Moi `ChannelNode` co 1 wallet logic rieng.

- DIRECTOR wallet
- MANAGER wallet
- AGENCY wallet
- SALE wallet

`PayoutRequest` nen tro toi `nodeId` thay vi vua `participantId`, vua `beneficiaryUserId`, vua `beneficiaryAgencyId`.

## Huong migrate tu he thong hien tai

### Mapping role cu -> role moi

- DIRECTOR -> DIRECTOR
- AGENCY_MANAGER -> MANAGER
- AGENCY_OWNER -> AGENCY
- SALE -> SALE

### Mapping du lieu cu

- `Agency` hien tai -> `AgencyProfile`
- `ChannelParticipant` cu -> `ChannelNode` neu con hop le
- `AgencyMember` -> du lieu tam de xac dinh parent ban dau

### Buoc migrate de xuat

1. Them schema moi song song voi schema cu
2. Backfill `ChannelNode` cho DIRECTOR, AGENCY_MANAGER, AGENCY_OWNER, SALE
3. Gan `parentNodeId` theo rule migrate tam thoi:
   - SALE dang nam trong agency -> parent = AGENCY
   - AGENCY_OWNER -> parent = MANAGER neu tim thay, neu khong thi DIRECTOR mac dinh
   - AGENCY_MANAGER -> parent = DIRECTOR
4. Them `closingNodeId` vao order moi
5. Viet commission engine moi song song
6. Chuyen web admin sang subtree model
7. Khoa duong code cu
8. Xoa `AgencyMember` khi da migrate xong va da doi report/payout

## API thay doi

### Channel admin

Thay vi API xoay quanh `agency` va `agency member`, doi sang:

- `POST /channel-nodes`
- `PATCH /channel-nodes/:id`
- `GET /channel-nodes/tree`
- `GET /channel-nodes/:id/detail`
- `POST /channel-nodes/:id/reset-password`
- `POST /channel-nodes/:id/suspend`
- `POST /channel-nodes/:id/reactivate`

### Orders

Khi tao order:

- neu user dang dang nhap la channel account -> auto gan `closingNodeId`
- neu order tu public referral -> resolve tu `referralCode` sang `closingNodeId`
- snapshot chain vao `commissionSnapshotJson`

### Finance

- `GET /channel-finance/my-wallet`
- `GET /channel-finance/my-report`
- `GET /channel-finance/subtree-report`
- `GET /channel-finance/payouts`

Tat ca deu scope theo `ChannelNode`.

## Web admin thay doi

Web can doi tu role-based workspace sang subtree workspace.

Can co:

- tree view cho network
- form tao node theo cap hop le
- detail page hien lineage va descendants
- report page tach `direct commission` va `override commission`
- payout page theo node wallet

File hien tai bi anh huong truc tiep:

- `apps/web/src/app/admin/_lib/admin-session.ts`
- `apps/web/src/app/admin/channel/page.tsx`
- `apps/web/src/app/admin/finance/page.tsx`
- `apps/web/src/app/admin/performance/page.tsx`
- `apps/web/src/app/admin/orders/page.tsx`

## Pha thuc hien de xuat

### Phase 1 - Backend foundation

- them schema `ChannelNode`
- them `trialEndsAt`, `availableAt`
- them migration va seed moi
- viet commission engine moi

### Phase 2 - Admin and permissions

- doi channel-admin service/controller
- doi scope rule tu agency sang subtree
- cap nhat auth permission helper

### Phase 3 - Web admin

- doi form tao account
- doi report, wallet, payout
- them tree/subtree UI

### Phase 4 - Cleanup

- xoa `AgencyMember`
- xoa old commission path
- xoa logic cu suy `AGENCY_OWNER`/`AGENCY_MANAGER`

## Quyet dinh da khoa trong tai lieu nay

- cay muc tieu: `DIRECTOR -> MANAGER -> AGENCY -> SALE`
- cap tren duoc recruit cap duoi hon truc tiep
- direct closer co the la moi cap trong 4 cap tren
- commission direct = 40%
- moi upline nhan 40% commission cua cap duoi truc tiep
- trial = 15 ngay
- chi release commission sau trial
- khong refund sau trial

## Phan can chot truoc khi code

1. 1 director co duoc xem toan bo he thong hay chi nhanh cua minh?
2. 1 node co duoc doi parent sau khi da co order hay khong?
3. 1 khach co bi lock ownership vao closing node dau tien hay cho phep chuyen owner?
4. AGENCY la 1 user role duy nhat hay can them nhieu staff duoi agency trong phase sau?
