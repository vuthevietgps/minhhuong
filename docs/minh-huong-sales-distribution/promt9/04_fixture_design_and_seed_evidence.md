# Fixture Design And Seed Evidence

## Tree

Prompt 9 seeds:

```text
director-root
|-- manager-A
|   |-- agency-A1
|   |   `-- sale-A
|   `-- sale-A-direct
`-- manager-B
    |-- agency-B1
    |   `-- sale-B
    `-- sale-B-direct
```

## Seed Evidence

In `apps/api/src/channel-admin/channel-admin-scope.integration.spec.ts`:

- fixture function starts: line 300
- user/agency/participant/member IDs: lines 301-336
- roles: lines 338-347
- users: lines 348-363
- user roles: lines 364-379
- agencies A/B: lines 381-396
- director root: lines 398-412
- manager A/B: lines 414-437
- agency participants A/B: lines 440-465
- sale A/B/direct participants: lines 469-515
- agency members: lines 518-552
- authenticated actors: lines 561-572

## Required Rows

Seeded actors:

- admin user;
- operations user;
- director/root user;
- manager A and manager B;
- agency A owner and agency B owner;
- sale A and sale B;
- sale A direct and sale B direct;
- unscoped non-admin user.

Seeded channel rows:

- agencies A/B;
- director, manager, agency, sale channel participants;
- agency members for agency owners and sale users.

