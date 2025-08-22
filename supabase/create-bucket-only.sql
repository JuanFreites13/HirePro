-- CREAR SOLO EL BUCKET PARA ARCHIVOS - SUPER SIMPLE
-- ===================================================

-- Solo crear bucket (si no existe)
INSERT INTO storage.buckets (id, name, public) VALUES ('candidate-files', 'candidate-files', true)
ON CONFLICT (id) DO NOTHING;

-- Solo política básica para el bucket
CREATE POLICY IF NOT EXISTS "candidate_files_policy" ON storage.objects
FOR ALL USING (bucket_id = 'candidate-files');

-- ✅ Listo para subir archivos
SELECT 'Bucket creado! 📁' as resultado;

