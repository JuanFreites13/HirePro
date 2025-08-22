-- Crear tabla para archivos adjuntos de candidatos
CREATE TABLE IF NOT EXISTS candidate_attachments (
  id SERIAL PRIMARY KEY,
  candidate_id INTEGER NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  original_name TEXT NOT NULL,
  file_name TEXT NOT NULL, -- Nombre del archivo en storage
  file_path TEXT NOT NULL, -- Ruta completa en storage
  file_size BIGINT NOT NULL,
  file_type TEXT NOT NULL,
  uploaded_by UUID REFERENCES auth.users(id),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_candidate_attachments_candidate_id ON candidate_attachments(candidate_id);
CREATE INDEX IF NOT EXISTS idx_candidate_attachments_uploaded_by ON candidate_attachments(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_candidate_attachments_created_at ON candidate_attachments(created_at DESC);

-- RLS (Row Level Security)
ALTER TABLE candidate_attachments ENABLE ROW LEVEL SECURITY;

-- Política para leer archivos adjuntos (usuarios autenticados)
CREATE POLICY "Users can view attachments" ON candidate_attachments
  FOR SELECT USING (auth.role() = 'authenticated');

-- Política para insertar archivos adjuntos (usuarios autenticados)
CREATE POLICY "Users can upload attachments" ON candidate_attachments
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Política para actualizar archivos adjuntos (solo el que subió el archivo)
CREATE POLICY "Users can update their own attachments" ON candidate_attachments
  FOR UPDATE USING (uploaded_by = auth.uid());

-- Política para eliminar archivos adjuntos (solo el que subió el archivo)
CREATE POLICY "Users can delete their own attachments" ON candidate_attachments
  FOR DELETE USING (uploaded_by = auth.uid());

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_candidate_attachments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at
CREATE TRIGGER update_candidate_attachments_updated_at
  BEFORE UPDATE ON candidate_attachments
  FOR EACH ROW
  EXECUTE FUNCTION update_candidate_attachments_updated_at();

-- Comentarios para documentación
COMMENT ON TABLE candidate_attachments IS 'Archivos adjuntos de candidatos (CVs, certificados, etc.)';
COMMENT ON COLUMN candidate_attachments.candidate_id IS 'ID del candidato al que pertenece el archivo';
COMMENT ON COLUMN candidate_attachments.original_name IS 'Nombre original del archivo subido';
COMMENT ON COLUMN candidate_attachments.file_name IS 'Nombre único del archivo en storage';
COMMENT ON COLUMN candidate_attachments.file_path IS 'Ruta completa del archivo en Supabase Storage';
COMMENT ON COLUMN candidate_attachments.file_size IS 'Tamaño del archivo en bytes';
COMMENT ON COLUMN candidate_attachments.file_type IS 'Tipo MIME del archivo';
COMMENT ON COLUMN candidate_attachments.uploaded_by IS 'Usuario que subió el archivo';
COMMENT ON COLUMN candidate_attachments.description IS 'Descripción opcional del archivo';
