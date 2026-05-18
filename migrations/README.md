Migrations
----------

Files in this folder are plain SQL migrations you can run against your database.

- `001_init.sql` — creates core tables (users, pengajuan, reviews, submission_files, tugas_akhir, master_titles, departments, audit_logs).
- `002_seed_admin.sql` — convenience seed to create an initial admin user (update password hash before use).

If you prefer to use Sequelize CLI or Knex migrations, convert these SQL files into the corresponding migration format.
