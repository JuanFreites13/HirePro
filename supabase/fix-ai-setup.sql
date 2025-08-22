-- CREAR TABLA Y BUCKET PARA IA - VERSIÓN DEFINITIVA
-- ==================================================

-- 1. Crear tabla global_candidates
CREATE TABLE global_candidates (
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

-- 2. Índice para email
CREATE INDEX idx_global_candidates_email ON global_candidates(email);

-- 3. Crear bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('candidate-files', 'candidate-files', true);

-- 4. RLS básico
ALTER TABLE global_candidates ENABLE ROW LEVEL SECURITY;

-- 5. Política simple
CREATE POLICY "allow_all_global_candidates" ON global_candidates FOR ALL USING (true);

-- 6. Política storage
CREATE POLICY "allow_all_candidate_files" ON storage.objects FOR ALL USING (bucket_id = 'candidate-files');

-- ✅ Verificación
SELECT 'Tabla y bucket creados exitosamente! 🎉' as resultado;

