-- Seed admin user (replace password hash with a real bcrypt hash before running)
INSERT INTO users (nama, username, password, role, created_at, updated_at)
VALUES ('Administrator', 'admin', '$2b$10$REPLACE_WITH_BCRYPT_HASH', 'admin', now(), now())
ON CONFLICT (username) DO NOTHING;
