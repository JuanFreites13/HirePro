-- CREAR BUCKET SIMPLE - SIN PROBLEMAS DE SINTAXIS
-- ================================================

-- 1. Crear bucket (solo si no existe)
INSERT INTO storage.buckets (id, name, public) VALUES ('candidate-files', 'candidate-files', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Eliminar política si existe y crear nueva
DROP POLICY IF EXISTS "candidate_files_policy" ON storage.objects;
CREATE POLICY "candidate_files_policy" ON storage.objects
FOR ALL USING (bucket_id = 'candidate-files');

-- ✅ Bucket listo
SELECT 'Bucket creado correctamente! 📁✅' as resultado;

