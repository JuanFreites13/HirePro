-- VERSIÓN SIMPLIFICADA - EJECUTAR EN SUPABASE SQL EDITOR
-- ========================================================

-- 1. Crear tabla de candidatos globales
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

-- 2. Crear índices
CREATE INDEX IF NOT EXISTS idx_global_candidates_email ON global_candidates(email);
CREATE INDEX IF NOT EXISTS idx_global_candidates_name ON global_candidates(name);

-- 3. Función para actualizar timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Trigger para timestamp
DROP TRIGGER IF EXISTS update_global_candidates_updated_at ON global_candidates;
CREATE TRIGGER update_global_candidates_updated_at
    BEFORE UPDATE ON global_candidates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 5. Crear bucket de storage
INSERT INTO storage.buckets (id, name, public) VALUES ('candidate-files', 'candidate-files', true)
ON CONFLICT (id) DO NOTHING;

-- 6. Habilitar RLS
ALTER TABLE global_candidates ENABLE ROW LEVEL SECURITY;

-- 7. Eliminar políticas existentes (si existen)
DROP POLICY IF EXISTS "Todos pueden ver candidatos globales" ON global_candidates;
DROP POLICY IF EXISTS "Todos pueden crear candidatos globales" ON global_candidates;
DROP POLICY IF EXISTS "Todos pueden actualizar candidatos globales" ON global_candidates;
DROP POLICY IF EXISTS "Todos pueden ver archivos de candidatos" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios autenticados pueden subir archivos" ON storage.objects;

-- 8. Crear políticas nuevas
CREATE POLICY "Todos pueden ver candidatos globales" ON global_candidates
FOR SELECT USING (true);

CREATE POLICY "Todos pueden crear candidatos globales" ON global_candidates
FOR INSERT WITH CHECK (true);

CREATE POLICY "Todos pueden actualizar candidatos globales" ON global_candidates
FOR UPDATE USING (true);

CREATE POLICY "Todos pueden ver archivos de candidatos" ON storage.objects
FOR SELECT USING (bucket_id = 'candidate-files');

CREATE POLICY "Usuarios autenticados pueden subir archivos" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'candidate-files');

-- 9. Agregar columna a tabla candidates existente
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS candidate_id INTEGER REFERENCES global_candidates(id);

-- 10. Crear índice para la relación
CREATE INDEX IF NOT EXISTS idx_candidates_candidate_id ON candidates(candidate_id);

-- ✅ COMPLETADO
SELECT 'Schema creado exitosamente! ✅' as resultado;

