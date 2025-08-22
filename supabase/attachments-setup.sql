-- CREAR TABLA DE ARCHIVOS ADJUNTOS DE CANDIDATOS
-- ===============================================

-- 1. Crear tabla de archivos adjuntos
CREATE TABLE IF NOT EXISTS candidate_attachments (
  id SERIAL PRIMARY KEY,
  candidate_id INTEGER NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(100) NOT NULL, -- cv, video, document, etc.
  file_url TEXT NOT NULL,
  file_size INTEGER,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_candidate_attachments_candidate_id ON candidate_attachments(candidate_id);
CREATE INDEX IF NOT EXISTS idx_candidate_attachments_file_type ON candidate_attachments(file_type);
CREATE INDEX IF NOT EXISTS idx_candidate_attachments_uploaded_by ON candidate_attachments(uploaded_by);

-- 3. Trigger para updated_at
CREATE TRIGGER update_candidate_attachments_updated_at 
    BEFORE UPDATE ON candidate_attachments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4. RLS para archivos adjuntos
ALTER TABLE candidate_attachments ENABLE ROW LEVEL SECURITY;

-- 5. Políticas RLS
DROP POLICY IF EXISTS "allow_all_attachments" ON candidate_attachments;
CREATE POLICY "allow_all_attachments" ON candidate_attachments FOR ALL USING (true);

-- ✅ Verificación
SELECT 'Tabla de archivos adjuntos creada exitosamente! 📁' as resultado;

