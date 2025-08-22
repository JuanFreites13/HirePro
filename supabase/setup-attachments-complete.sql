-- CONFIGURACIÓN COMPLETA DE ARCHIVOS ADJUNTOS PARA CANDIDATOS
-- ============================================================

-- 1. Crear tabla para archivos adjuntos de candidatos
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

-- Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "Users can view attachments" ON candidate_attachments;
DROP POLICY IF EXISTS "Users can upload attachments" ON candidate_attachments;
DROP POLICY IF EXISTS "Users can update their own attachments" ON candidate_attachments;
DROP POLICY IF EXISTS "Users can delete their own attachments" ON candidate_attachments;

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
DROP TRIGGER IF EXISTS update_candidate_attachments_updated_at ON candidate_attachments;
CREATE TRIGGER update_candidate_attachments_updated_at
  BEFORE UPDATE ON candidate_attachments
  FOR EACH ROW
  EXECUTE FUNCTION update_candidate_attachments_updated_at();

-- 2. Configurar bucket de storage (usando bucket unificado 'candidates')
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'candidates',
  'candidates',
  false, -- privado, solo usuarios autenticados
  52428800, -- 50MB máximo por archivo
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'text/plain',
    'application/zip',
    'application/x-rar-compressed'
  ]
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Eliminar políticas de storage existentes si existen
DROP POLICY IF EXISTS "Users can upload candidate files" ON storage.objects;
DROP POLICY IF EXISTS "Users can view candidate files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own candidate files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own candidate files" ON storage.objects;

-- Políticas de storage para el bucket candidates
-- Política para subir archivos (usuarios autenticados)
CREATE POLICY "Users can upload candidate files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'candidates' AND 
    auth.role() = 'authenticated'
  );

-- Política para leer archivos (usuarios autenticados)
CREATE POLICY "Users can view candidate files" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'candidates' AND 
    auth.role() = 'authenticated'
  );

-- Política para actualizar archivos (solo el propietario)
CREATE POLICY "Users can update their own candidate files" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'candidates' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Política para eliminar archivos (solo el propietario)
CREATE POLICY "Users can delete their own candidate files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'candidates' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Comentarios para documentación
COMMENT ON TABLE candidate_attachments IS 'Archivos adjuntos de candidatos (CVs, certificados, etc.)';
COMMENT ON COLUMN candidate_attachments.candidate_id IS 'ID del candidato al que pertenece el archivo';
COMMENT ON COLUMN candidate_attachments.original_name IS 'Nombre original del archivo subido';
COMMENT ON COLUMN candidate_attachments.file_name IS 'Nombre único del archivo en storage';
COMMENT ON COLUMN candidate_attachments.file_path IS 'Ruta completa del archivo en bucket candidates';
COMMENT ON COLUMN candidate_attachments.file_size IS 'Tamaño del archivo en bytes';
COMMENT ON COLUMN candidate_attachments.file_type IS 'Tipo MIME del archivo';
COMMENT ON COLUMN candidate_attachments.uploaded_by IS 'Usuario que subió el archivo';
COMMENT ON COLUMN candidate_attachments.description IS 'Descripción opcional del archivo';

-- Verificar que todo se creó correctamente
SELECT 'Tabla candidate_attachments creada correctamente' as status;
SELECT 'Bucket candidates configurado correctamente' as status;

