-- CONFIGURACIÓN MÍNIMA SOLO PARA IA - SIN MODIFICAR NADA EXISTENTE
-- ================================================================

-- 1. Crear tabla para candidatos globales (solo si no existe)
CREATE TABLE IF NOT EXISTS global_candidates (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50),
  position VARCHAR(255),
  experience TEXT,
  location VARCHAR(255),
  source VARCHAR(100),
  skills TEXT[],
  cv_url TEXT,
  video_url TEXT,
  ai_analysis JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Índices básicos
CREATE INDEX IF NOT EXISTS idx_global_candidates_email ON global_candidates(email);

-- 3. Bucket para archivos (solo si no existe)
INSERT INTO storage.buckets (id, name, public) VALUES ('candidate-files', 'candidate-files', true)
ON CONFLICT (id) DO NOTHING;

-- 4. RLS básico
ALTER TABLE global_candidates ENABLE ROW LEVEL SECURITY;

-- 5. Política básica de acceso
CREATE POLICY IF NOT EXISTS "allow_all_global_candidates" ON global_candidates
FOR ALL USING (true);

-- 6. Política básica para storage
CREATE POLICY IF NOT EXISTS "allow_all_candidate_files" ON storage.objects
FOR ALL USING (bucket_id = 'candidate-files');

-- ✅ Solo lo esencial para IA - sin tocar nada más
SELECT 'IA setup listo! 🤖' as resultado;

