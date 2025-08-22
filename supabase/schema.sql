-- Tabla para candidatos globales (información master)
CREATE TABLE IF NOT EXISTS global_candidates (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50),
  position VARCHAR(255),
  experience TEXT,
  location VARCHAR(255),
  source VARCHAR(100),
  skills TEXT[], -- Array de habilidades
  cv_url TEXT,
  video_url TEXT,
  ai_analysis JSONB, -- Análisis completo de IA
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_global_candidates_email ON global_candidates(email);
CREATE INDEX IF NOT EXISTS idx_global_candidates_name ON global_candidates(name);

-- Actualizar timestamp cuando se modifica
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_global_candidates_updated_at
    BEFORE UPDATE ON global_candidates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Bucket para archivos de candidatos en Storage
INSERT INTO storage.buckets (id, name, public) VALUES ('candidate-files', 'candidate-files', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de acceso para storage (solo crear si no existen)
DO $$
BEGIN
    -- Política para ver archivos
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Todos pueden ver archivos de candidatos'
    ) THEN
        CREATE POLICY "Todos pueden ver archivos de candidatos" ON storage.objects
        FOR SELECT USING (bucket_id = 'candidate-files');
    END IF;

    -- Política para subir archivos
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Usuarios autenticados pueden subir archivos'
    ) THEN
        CREATE POLICY "Usuarios autenticados pueden subir archivos" ON storage.objects
        FOR INSERT WITH CHECK (bucket_id = 'candidate-files');
    END IF;
END $$;

-- RLS para global_candidates
ALTER TABLE global_candidates ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para global_candidates (crear solo si no existen)
DO $$
BEGIN
    -- Política para ver candidatos
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'global_candidates' 
        AND policyname = 'Todos pueden ver candidatos globales'
    ) THEN
        CREATE POLICY "Todos pueden ver candidatos globales" ON global_candidates
        FOR SELECT USING (true);
    END IF;

    -- Política para crear candidatos
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'global_candidates' 
        AND policyname = 'Todos pueden crear candidatos globales'
    ) THEN
        CREATE POLICY "Todos pueden crear candidatos globales" ON global_candidates
        FOR INSERT WITH CHECK (true);
    END IF;

    -- Política para actualizar candidatos
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'global_candidates' 
        AND policyname = 'Todos pueden actualizar candidatos globales'
    ) THEN
        CREATE POLICY "Todos pueden actualizar candidatos globales" ON global_candidates
        FOR UPDATE USING (true);
    END IF;
END $$;

-- Agregar columna candidate_id a la tabla candidates existente (si no existe)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'candidates' AND column_name = 'candidate_id') THEN
        ALTER TABLE candidates ADD COLUMN candidate_id INTEGER REFERENCES global_candidates(id);
    END IF;
END $$;

-- Crear índice para la relación
CREATE INDEX IF NOT EXISTS idx_candidates_candidate_id ON candidates(candidate_id);

-- Comentarios para documentar la estructura
COMMENT ON TABLE global_candidates IS 'Tabla master de candidatos con información global reutilizable';
COMMENT ON COLUMN global_candidates.ai_analysis IS 'Análisis completo de IA en formato JSON';
COMMENT ON COLUMN global_candidates.skills IS 'Array de habilidades técnicas del candidato';
COMMENT ON COLUMN candidates.candidate_id IS 'Referencia al candidato global para reutilización entre postulaciones';
