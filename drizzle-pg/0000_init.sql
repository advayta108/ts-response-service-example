-- Supabase / PostgreSQL (prod). Идемпотентно: только CREATE IF NOT EXISTS.
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('dispatcher', 'master'))
);

CREATE TABLE IF NOT EXISTS requests (
  id SERIAL PRIMARY KEY,
  client_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  problem_text TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  assigned_to INTEGER REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_requests_status ON requests(status);
CREATE INDEX IF NOT EXISTS idx_requests_assigned ON requests(assigned_to);
