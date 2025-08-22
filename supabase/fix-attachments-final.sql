-- SCRIPT FINAL PARA ARCHIVOS ADJUNTOS - SIN ERRORES
-- ===================================================

-- 1. Eliminar tabla si existe (para empezar limpio)
DROP TABLE IF EXISTS candidate_attachments CASCADE;

-- 2. Crear tabla candidate_attachments
CREATE TABLE candidate_attachments (
  id SERIAL PRIMARY KEY,
  candidate_id INTEGER NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  original_name TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_type TEXT NOT NULL,
  uploaded_by UUID REFERENCES auth.users(id),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Crear índices
CREATE INDEX idx_candidate_attachments_candidate_id ON candidate_attachments(candidate_id);
CREATE INDEX idx_candidate_attachments_uploaded_by ON candidate_attachments(uploaded_by);
CREATE INDEX idx_candidate_attachments_created_at ON candidate_attachments(created_at DESC);

-- 4. Habilitar RLS
ALTER TABLE candidate_attachments ENABLE ROW LEVEL SECURITY;

-- 5. Crear políticas (DESPUÉS de que la tabla existe)
CREATE POLICY "Users can view attachments" ON candidate_attachments
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can upload attachments" ON candidate_attachments
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own attachments" ON candidate_attachments
  FOR UPDATE USING (uploaded_by = auth.uid());

CREATE POLICY "Users can delete their own attachments" ON candidate_attachments
  FOR DELETE USING (uploaded_by = auth.uid());

-- 6. Función y trigger para updated_at
CREATE OR REPLACE FUNCTION update_candidate_attachments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_candidate_attachments_updated_at
  BEFORE UPDATE ON candidate_attachments
  FOR EACH ROW
  EXECUTE FUNCTION update_candidate_attachments_updated_at();

-- 7. Configurar bucket 'candidates' (si no existe)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'candidates',
  'candidates',
  false,
  52428800, -- 50MB
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
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 8. Políticas de storage (eliminar existentes primero)
DROP POLICY IF EXISTS "Users can upload candidate files" ON storage.objects;
DROP POLICY IF EXISTS "Users can view candidate files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own candidate files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own candidate files" ON storage.objects;

-- 9. Crear políticas de storage
CREATE POLICY "Users can upload candidate files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'candidates' AND 
    auth.role() = 'authenticated'
  );

CREATE POLICY "Users can view candidate files" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'candidates' AND 
    auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update their own candidate files" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'candidates' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own candidate files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'candidates' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- 10. Verificación final
SELECT 'Tabla candidate_attachments creada: ' || count(*) as status
FROM information_schema.tables 
WHERE table_name = 'candidate_attachments';

SELECT 'Bucket candidates configurado: ' || count(*) as status
FROM storage.buckets 
WHERE id = 'candidates';

