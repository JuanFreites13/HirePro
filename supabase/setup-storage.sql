-- =====================================================
-- CONFIGURACIÓN DE SUPABASE STORAGE
-- =====================================================

-- Crear bucket para archivos de candidatos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'candidate-files',
    'candidate-files',
    false, -- Privado por defecto
    10485760, -- 10MB límite por archivo
    ARRAY[
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/png',
        'image/gif',
        'text/plain',
        'application/zip',
        'application/x-zip-compressed'
    ]
) ON CONFLICT (id) DO NOTHING;

-- Crear bucket para avatares de candidatos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'candidate-avatars',
    'candidate-avatars',
    true, -- Público para mostrar avatares
    5242880, -- 5MB límite por archivo
    ARRAY[
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp'
    ]
) ON CONFLICT (id) DO NOTHING;

-- Políticas para el bucket candidate-files
CREATE POLICY "Users can view candidate files they are assigned to" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'candidate-files' AND (
            auth.uid() IN (
                SELECT assignee_id FROM candidates 
                WHERE id = (storage.foldername(name))[1]::integer
            ) OR
            auth.uid() IN (
                SELECT responsible_id FROM applications 
                WHERE id = (
                    SELECT application_id FROM candidates 
                    WHERE id = (storage.foldername(name))[1]::integer
                )
            )
        )
    );

CREATE POLICY "Users can upload candidate files" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'candidate-files' AND (
            auth.uid() IN (
                SELECT assignee_id FROM candidates 
                WHERE id = (storage.foldername(name))[1]::integer
            ) OR
            auth.uid() IN (
                SELECT responsible_id FROM applications 
                WHERE id = (
                    SELECT application_id FROM candidates 
                    WHERE id = (storage.foldername(name))[1]::integer
                )
            )
        )
    );

CREATE POLICY "Users can update candidate files" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'candidate-files' AND (
            auth.uid() IN (
                SELECT assignee_id FROM candidates 
                WHERE id = (storage.foldername(name))[1]::integer
            ) OR
            auth.uid() IN (
                SELECT responsible_id FROM applications 
                WHERE id = (
                    SELECT application_id FROM candidates 
                    WHERE id = (storage.foldername(name))[1]::integer
                )
            )
        )
    );

CREATE POLICY "Users can delete candidate files" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'candidate-files' AND (
            auth.uid() IN (
                SELECT assignee_id FROM candidates 
                WHERE id = (storage.foldername(name))[1]::integer
            ) OR
            auth.uid() IN (
                SELECT responsible_id FROM applications 
                WHERE id = (
                    SELECT application_id FROM candidates 
                    WHERE id = (storage.foldername(name))[1]::integer
                )
            )
        )
    );

-- Políticas para el bucket candidate-avatars (público)
CREATE POLICY "Anyone can view candidate avatars" ON storage.objects
    FOR SELECT USING (bucket_id = 'candidate-avatars');

CREATE POLICY "Users can upload candidate avatars" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'candidate-avatars' AND (
            auth.uid() IN (
                SELECT assignee_id FROM candidates 
                WHERE id = (storage.foldername(name))[1]::integer
            ) OR
            auth.uid() IN (
                SELECT responsible_id FROM applications 
                WHERE id = (
                    SELECT application_id FROM candidates 
                    WHERE id = (storage.foldername(name))[1]::integer
                )
            )
        )
    );

CREATE POLICY "Users can update candidate avatars" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'candidate-avatars' AND (
            auth.uid() IN (
                SELECT assignee_id FROM candidates 
                WHERE id = (storage.foldername(name))[1]::integer
            ) OR
            auth.uid() IN (
                SELECT responsible_id FROM applications 
                WHERE id = (
                    SELECT application_id FROM candidates 
                    WHERE id = (storage.foldername(name))[1]::integer
                )
            )
        )
    );

CREATE POLICY "Users can delete candidate avatars" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'candidate-avatars' AND (
            auth.uid() IN (
                SELECT assignee_id FROM candidates 
                WHERE id = (storage.foldername(name))[1]::integer
            ) OR
            auth.uid() IN (
                SELECT responsible_id FROM applications 
                WHERE id = (
                    SELECT application_id FROM candidates 
                    WHERE id = (storage.foldername(name))[1]::integer
                )
            )
        )
    );

-- Función para obtener la URL pública de un archivo
CREATE OR REPLACE FUNCTION get_storage_url(bucket_name text, file_path text)
RETURNS text AS $$
BEGIN
    RETURN 'https://' || current_setting('app.settings.supabase_url') || '/storage/v1/object/public/' || bucket_name || '/' || file_path;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener la URL firmada de un archivo privado
CREATE OR REPLACE FUNCTION get_storage_signed_url(bucket_name text, file_path text, expires_in integer DEFAULT 3600)
RETURNS text AS $$
DECLARE
    signed_url text;
BEGIN
    -- Esta función requeriría implementación en el lado del cliente
    -- ya que las URLs firmadas se generan con la clave de servicio
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verificar buckets creados
SELECT 
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets 
WHERE id IN ('candidate-files', 'candidate-avatars')
ORDER BY id;

-- Mensaje de confirmación
DO $$
BEGIN
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'STORAGE CONFIGURADO EXITOSAMENTE';
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'Buckets creados:';
    RAISE NOTICE '- candidate-files (privado, 10MB, documentos)';
    RAISE NOTICE '- candidate-avatars (público, 5MB, imágenes)';
    RAISE NOTICE '';
    RAISE NOTICE 'Políticas de seguridad configuradas:';
    RAISE NOTICE '- Solo usuarios asignados pueden acceder a archivos';
    RAISE NOTICE '- Avatares son públicos para visualización';
    RAISE NOTICE '=====================================================';
END $$;



