Migrations
----------

Files in this folder use the standard Sequelize CLI migration format. Each table has its own migration file so schema changes are easy to audit.

- `20260528000001-create-users.js`
- `20260528000002-create-departments.js`
- `20260528000003-create-pengajuan.js`
- `20260528000004-create-submission-files.js`
- `20260528000005-create-reviews.js`
- `20260528000006-create-tugas-akhir.js`
- `20260528000007-create-master-titles.js`
- `20260528000008-create-audit-logs.js`

Run migrations with:

```bash
npm run db:migrate
```

Run seeders with:

```bash
npm run db:seed
```

The initial admin user seed is stored in `../seeders/20260528000002-seed-admin-user.js`.
