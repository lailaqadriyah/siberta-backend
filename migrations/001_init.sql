-- Initial schema for Siberta TA submission system
-- Run this against your SQL database (Postgres/MySQL). Adjust types as needed.

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  nama VARCHAR(255) NOT NULL,
  username VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'mahasiswa',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS departments (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  ml_model_version VARCHAR(64),
  last_synced_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pengajuan (
  id SERIAL PRIMARY KEY,
  judul TEXT NOT NULL,
  abstract TEXT,
  student_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  pembimbing1_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  pembimbing2_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  file_pendukung VARCHAR(1024),
  status VARCHAR(32) DEFAULT 'draft',
  similarity_score DOUBLE PRECISION,
  sbert_vector_id VARCHAR(255),
  komentar TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS submission_files (
  id SERIAL PRIMARY KEY,
  submission_id INTEGER REFERENCES pengajuan(id) ON DELETE CASCADE,
  filename VARCHAR(512) NOT NULL,
  storage_path VARCHAR(1024) NOT NULL,
  mime VARCHAR(128),
  uploaded_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL PRIMARY KEY,
  submission_id INTEGER REFERENCES pengajuan(id) ON DELETE CASCADE,
  reviewer_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  decision VARCHAR(16) NOT NULL,
  comment TEXT,
  score DOUBLE PRECISION,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tugas_akhir (
  id SERIAL PRIMARY KEY,
  judul TEXT NOT NULL,
  penulis VARCHAR(255) NOT NULL,
  tahun INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS master_titles (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  source VARCHAR(255),
  notes TEXT,
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(255) NOT NULL,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_pengajuan_student ON pengajuan(student_id);
CREATE INDEX IF NOT EXISTS idx_pengajuan_status ON pengajuan(status);
CREATE INDEX IF NOT EXISTS idx_reviews_submission ON reviews(submission_id);
