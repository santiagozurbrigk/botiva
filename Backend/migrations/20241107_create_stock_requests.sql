CREATE TABLE IF NOT EXISTS stock_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section text NOT NULL,
  requester_name text,
  missing_items text NOT NULL,
  additional_notes text,
  status text NOT NULL DEFAULT 'pendiente',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Índice para ordenar rápidamente por fecha
CREATE INDEX IF NOT EXISTS stock_requests_created_at_idx
  ON stock_requests (created_at DESC);

