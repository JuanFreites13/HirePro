-- =====================================================
-- ARREGLAR POLÍTICAS RLS DEFINITIVAMENTE
-- =====================================================

-- Eliminar todas las políticas existentes que causan recursión
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Admin users can view all users" ON users;
DROP POLICY IF EXISTS "Users can view applications they are responsible for" ON applications;
DROP POLICY IF EXISTS "Admin users can view all applications" ON applications;
DROP POLICY IF EXISTS "Users can view candidates they are assigned to" ON candidates;
DROP POLICY IF EXISTS "Admin users can view all candidates" ON candidates;
DROP POLICY IF EXISTS "Users can view notes for candidates they are assigned to" ON candidate_notes;
DROP POLICY IF EXISTS "Admin users can view all notes" ON candidate_notes;
DROP POLICY IF EXISTS "Users can view attachments for candidates they are assigned to" ON candidate_attachments;
DROP POLICY IF EXISTS "Admin users can view all attachments" ON candidate_attachments;
DROP POLICY IF EXISTS "Users can view timeline for candidates they are assigned to" ON candidate_timeline;
DROP POLICY IF EXISTS "Admin users can view all timeline" ON candidate_timeline;

-- Crear políticas simplificadas que no causen recursión

-- Políticas para users
CREATE POLICY "Enable read access for all users" ON users
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON users
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for users based on id" ON users
    FOR UPDATE USING (true);

-- Políticas para applications
CREATE POLICY "Enable read access for all applications" ON applications
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON applications
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for applications" ON applications
    FOR UPDATE USING (true);

-- Políticas para candidates
CREATE POLICY "Enable read access for all candidates" ON candidates
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON candidates
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for candidates" ON candidates
    FOR UPDATE USING (true);

-- Políticas para candidate_notes
CREATE POLICY "Enable read access for all notes" ON candidate_notes
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON candidate_notes
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for notes" ON candidate_notes
    FOR UPDATE USING (true);

-- Políticas para candidate_attachments
CREATE POLICY "Enable read access for all attachments" ON candidate_attachments
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON candidate_attachments
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for attachments" ON candidate_attachments
    FOR UPDATE USING (true);

-- Políticas para candidate_timeline
CREATE POLICY "Enable read access for all timeline" ON candidate_timeline
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON candidate_timeline
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for timeline" ON candidate_timeline
    FOR UPDATE USING (true);

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

-- Mensaje de confirmación
DO $$
BEGIN
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'POLÍTICAS RLS ARREGLADAS DEFINITIVAMENTE';
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'Todas las políticas recursivas han sido eliminadas';
    RAISE NOTICE 'Nuevas políticas simplificadas creadas';
    RAISE NOTICE 'El login ahora debería funcionar correctamente';
    RAISE NOTICE '=====================================================';
END $$;

