-- =====================================================
-- ARREGLAR POLÍTICAS RLS - VERSIÓN FINAL
-- =====================================================

-- Deshabilitar RLS temporalmente para poder acceder a los datos
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE applications DISABLE ROW LEVEL SECURITY;
ALTER TABLE candidates DISABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_notes DISABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_attachments DISABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_timeline DISABLE ROW LEVEL SECURITY;

-- Eliminar todas las políticas existentes
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Admin users can view all users" ON users;
DROP POLICY IF EXISTS "Enable read access for all users" ON users;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON users;
DROP POLICY IF EXISTS "Enable update for users based on id" ON users;

DROP POLICY IF EXISTS "Users can view applications they are responsible for" ON applications;
DROP POLICY IF EXISTS "Admin users can view all applications" ON applications;
DROP POLICY IF EXISTS "Enable read access for all applications" ON applications;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON applications;
DROP POLICY IF EXISTS "Enable update for applications" ON applications;

DROP POLICY IF EXISTS "Users can view candidates they are assigned to" ON candidates;
DROP POLICY IF EXISTS "Admin users can view all candidates" ON candidates;
DROP POLICY IF EXISTS "Enable read access for all candidates" ON candidates;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON candidates;
DROP POLICY IF EXISTS "Enable update for candidates" ON candidates;

DROP POLICY IF EXISTS "Users can view notes for candidates they are assigned to" ON candidate_notes;
DROP POLICY IF EXISTS "Admin users can view all notes" ON candidate_notes;
DROP POLICY IF EXISTS "Enable read access for all notes" ON candidate_notes;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON candidate_notes;
DROP POLICY IF EXISTS "Enable update for notes" ON candidate_notes;

DROP POLICY IF EXISTS "Users can view attachments for candidates they are assigned to" ON candidate_attachments;
DROP POLICY IF EXISTS "Admin users can view all attachments" ON candidate_attachments;
DROP POLICY IF EXISTS "Enable read access for all attachments" ON candidate_attachments;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON candidate_attachments;
DROP POLICY IF EXISTS "Enable update for attachments" ON candidate_attachments;

DROP POLICY IF EXISTS "Users can view timeline for candidates they are assigned to" ON candidate_timeline;
DROP POLICY IF EXISTS "Admin users can view all timeline" ON candidate_timeline;
DROP POLICY IF EXISTS "Enable read access for all timeline" ON candidate_timeline;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON candidate_timeline;
DROP POLICY IF EXISTS "Enable update for timeline" ON candidate_timeline;

-- Habilitar RLS nuevamente
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_timeline ENABLE ROW LEVEL SECURITY;

-- Crear políticas simples que permitan acceso completo
CREATE POLICY "Allow all operations on users" ON users
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on applications" ON applications
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on candidates" ON candidates
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on candidate_notes" ON candidate_notes
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on candidate_attachments" ON candidate_attachments
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on candidate_timeline" ON candidate_timeline
    FOR ALL USING (true) WITH CHECK (true);

-- Verificar que las políticas se crearon correctamente
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'applications', 'candidates', 'candidate_notes', 'candidate_attachments', 'candidate_timeline')
ORDER BY tablename, policyname;

-- Probar acceso a la tabla users
SELECT COUNT(*) as total_users FROM users;

-- Mensaje de confirmación
DO $$
BEGIN
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'POLÍTICAS RLS ARREGLADAS - VERSIÓN FINAL';
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'Todas las políticas recursivas han sido eliminadas';
    RAISE NOTICE 'Nuevas políticas simples creadas';
    RAISE NOTICE 'Acceso completo habilitado para desarrollo';
    RAISE NOTICE 'El login ahora debería funcionar correctamente';
    RAISE NOTICE '=====================================================';
END $$;

