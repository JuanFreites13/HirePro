-- Crear bucket para archivos de candidatos (unificado)
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
