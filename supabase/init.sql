-- =====================================================
-- TALENTO PRO - DATABASE INITIALIZATION SCRIPT
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLES CREATION
-- =====================================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('Admin RRHH', 'Entrevistador')),
    permissions TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Applications table
CREATE TABLE IF NOT EXISTS applications (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    area VARCHAR(100) NOT NULL,
    location VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Activa' CHECK (status IN ('Activa', 'Pausada', 'Cerrada')),
    responsible_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Candidates table
CREATE TABLE IF NOT EXISTS candidates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    position VARCHAR(255) NOT NULL,
    stage VARCHAR(100) NOT NULL DEFAULT 'Pre-entrevista',
    score DECIMAL(3,1) DEFAULT 0.0,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'scheduled', 'stalled', 'completed', 'rejected', 'on-hold')),
    assignee_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    application_id INTEGER NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    experience VARCHAR(255),
    location VARCHAR(255),
    avatar VARCHAR(500),
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Candidate notes table
CREATE TABLE IF NOT EXISTS candidate_notes (
    id SERIAL PRIMARY KEY,
    candidate_id INTEGER NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    stage VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    score DECIMAL(3,1) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Candidate attachments table
CREATE TABLE IF NOT EXISTS candidate_attachments (
    id SERIAL PRIMARY KEY,
    candidate_id INTEGER NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Candidate timeline table
CREATE TABLE IF NOT EXISTS candidate_timeline (
    id SERIAL PRIMARY KEY,
    candidate_id INTEGER NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    stage VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('completed', 'current', 'pending')),
    date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Applications indexes
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_responsible ON applications(responsible_id);
CREATE INDEX IF NOT EXISTS idx_applications_created_at ON applications(created_at);

-- Candidates indexes
CREATE INDEX IF NOT EXISTS idx_candidates_application_id ON candidates(application_id);
CREATE INDEX IF NOT EXISTS idx_candidates_stage ON candidates(stage);
CREATE INDEX IF NOT EXISTS idx_candidates_status ON candidates(status);
CREATE INDEX IF NOT EXISTS idx_candidates_assignee ON candidates(assignee_id);
CREATE INDEX IF NOT EXISTS idx_candidates_email ON candidates(email);

-- Notes indexes
CREATE INDEX IF NOT EXISTS idx_candidate_notes_candidate_id ON candidate_notes(candidate_id);
CREATE INDEX IF NOT EXISTS idx_candidate_notes_author_id ON candidate_notes(author_id);

-- Attachments indexes
CREATE INDEX IF NOT EXISTS idx_candidate_attachments_candidate_id ON candidate_attachments(candidate_id);

-- Timeline indexes
CREATE INDEX IF NOT EXISTS idx_candidate_timeline_candidate_id ON candidate_timeline(candidate_id);

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_candidates_updated_at BEFORE UPDATE ON candidates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_timeline ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Admin users can view all users" ON users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id::text = auth.uid()::text 
            AND role = 'Admin RRHH'
        )
    );

-- Applications policies
CREATE POLICY "Users can view applications they are responsible for" ON applications
    FOR SELECT USING (responsible_id::text = auth.uid()::text);

CREATE POLICY "Admin users can view all applications" ON applications
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id::text = auth.uid()::text 
            AND role = 'Admin RRHH'
        )
    );

-- Candidates policies
CREATE POLICY "Users can view candidates they are assigned to" ON candidates
    FOR SELECT USING (assignee_id::text = auth.uid()::text);

CREATE POLICY "Admin users can view all candidates" ON candidates
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id::text = auth.uid()::text 
            AND role = 'Admin RRHH'
        )
    );

-- Notes policies
CREATE POLICY "Users can view notes for candidates they are assigned to" ON candidate_notes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM candidates 
            WHERE candidates.id = candidate_notes.candidate_id 
            AND candidates.assignee_id::text = auth.uid()::text
        )
    );

CREATE POLICY "Admin users can view all notes" ON candidate_notes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id::text = auth.uid()::text 
            AND role = 'Admin RRHH'
        )
    );

-- Attachments policies
CREATE POLICY "Users can view attachments for candidates they are assigned to" ON candidate_attachments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM candidates 
            WHERE candidates.id = candidate_attachments.candidate_id 
            AND candidates.assignee_id::text = auth.uid()::text
        )
    );

CREATE POLICY "Admin users can view all attachments" ON candidate_attachments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id::text = auth.uid()::text 
            AND role = 'Admin RRHH'
        )
    );

-- Timeline policies
CREATE POLICY "Users can view timeline for candidates they are assigned to" ON candidate_timeline
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM candidates 
            WHERE candidates.id = candidate_timeline.candidate_id 
            AND candidates.assignee_id::text = auth.uid()::text
        )
    );

CREATE POLICY "Admin users can view all timeline" ON candidate_timeline
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id::text = auth.uid()::text 
            AND role = 'Admin RRHH'
        )
    );

-- =====================================================
-- INITIAL DATA
-- =====================================================

-- Insert default admin user
INSERT INTO users (id, name, email, role, permissions) VALUES 
(
    '550e8400-e29b-41d4-a716-446655440000',
    'Admin TalentoPro',
    'admin@talentopro.com',
    'Admin RRHH',
    ARRAY[
        'crear_postulaciones',
        'mover_etapas',
        'ver_todas_postulaciones',
        'gestionar_usuarios',
        'acceso_configuracion',
        'eliminar_candidatos',
        'editar_postulaciones'
    ]
) ON CONFLICT (email) DO NOTHING;

-- Insert sample users
INSERT INTO users (id, name, email, role, permissions) VALUES 
(
    '550e8400-e29b-41d4-a716-446655440001',
    'María González',
    'maria@empresa.com',
    'Admin RRHH',
    ARRAY[
        'crear_postulaciones',
        'mover_etapas',
        'ver_todas_postulaciones',
        'gestionar_usuarios',
        'acceso_configuracion'
    ]
) ON CONFLICT (email) DO NOTHING;

INSERT INTO users (id, name, email, role, permissions) VALUES 
(
    '550e8400-e29b-41d4-a716-446655440002',
    'Carlos Rodríguez',
    'carlos@empresa.com',
    'Entrevistador',
    ARRAY['mover_etapas', 'ver_postulaciones_asignadas']
) ON CONFLICT (email) DO NOTHING;

INSERT INTO users (id, name, email, role, permissions) VALUES 
(
    '550e8400-e29b-41d4-a716-446655440003',
    'Ana Martínez',
    'ana@empresa.com',
    'Entrevistador',
    ARRAY['ver_postulaciones_asignadas']
) ON CONFLICT (email) DO NOTHING;

-- Insert sample applications
INSERT INTO applications (title, area, location, type, status, responsible_id, description) VALUES 
(
    'Desarrollador Frontend Senior',
    'Tecnología',
    'Santiago, Chile',
    'Tiempo completo',
    'Activa',
    '550e8400-e29b-41d4-a716-446655440001',
    'Buscamos un desarrollador frontend con experiencia en React y TypeScript'
) ON CONFLICT DO NOTHING;

INSERT INTO applications (title, area, location, type, status, responsible_id, description) VALUES 
(
    'Product Manager',
    'Producto',
    'Santiago, Chile',
    'Tiempo completo',
    'Activa',
    '550e8400-e29b-41d4-a716-446655440002',
    'Product Manager para liderar el desarrollo de nuevas funcionalidades'
) ON CONFLICT DO NOTHING;

INSERT INTO applications (title, area, location, type, status, responsible_id, description) VALUES 
(
    'UX Designer',
    'Diseño',
    'Santiago, Chile',
    'Tiempo completo',
    'Cerrada',
    '550e8400-e29b-41d4-a716-446655440003',
    'Diseñador UX/UI para mejorar la experiencia de usuario'
) ON CONFLICT DO NOTHING;

-- Insert sample candidates
INSERT INTO candidates (name, email, phone, position, stage, score, status, assignee_id, application_id, experience, location, avatar) VALUES 
(
    'María González',
    'maria.gonzalez@email.com',
    '+56 9 1234 5678',
    'Desarrollador Frontend Senior',
    'Primera etapa',
    6.7,
    'pending',
    '550e8400-e29b-41d4-a716-446655440002',
    1,
    '5 años',
    'Santiago, Chile',
    '/professional-woman.png'
) ON CONFLICT DO NOTHING;

INSERT INTO candidates (name, email, phone, position, stage, score, status, assignee_id, application_id, experience, location, avatar) VALUES 
(
    'Juan Pérez',
    'juan.perez@email.com',
    '+56 9 8765 4321',
    'Product Manager',
    'Fit cultural',
    7.2,
    'scheduled',
    '550e8400-e29b-41d4-a716-446655440003',
    2,
    '3 años',
    'Santiago, Chile',
    '/professional-man.png'
) ON CONFLICT DO NOTHING;

INSERT INTO candidates (name, email, phone, position, stage, score, status, assignee_id, application_id, experience, location, avatar) VALUES 
(
    'Sofia Martínez',
    'sofia.martinez@email.com',
    '+56 9 5555 1234',
    'UX Designer',
    'Segunda etapa',
    5.8,
    'stalled',
    '550e8400-e29b-41d4-a716-446655440002',
    3,
    '4 años',
    'Santiago, Chile',
    '/woman-designer.png'
) ON CONFLICT DO NOTHING;

-- Insert sample notes
INSERT INTO candidate_notes (candidate_id, author_id, stage, content, score) VALUES 
(
    1,
    '550e8400-e29b-41d4-a716-446655440002',
    'Pre-entrevista',
    'Candidata con excelente perfil técnico. Experiencia sólida en React y TypeScript.',
    6.7
) ON CONFLICT DO NOTHING;

INSERT INTO candidate_notes (candidate_id, author_id, stage, content, score) VALUES 
(
    1,
    '550e8400-e29b-41d4-a716-446655440003',
    'Primera etapa',
    'Muy buena comunicación. Resolvió los ejercicios técnicos correctamente.',
    7.2
) ON CONFLICT DO NOTHING;

-- Insert sample attachments
INSERT INTO candidate_attachments (candidate_id, name, type, file_path) VALUES 
(
    1,
    'CV_Maria_Gonzalez.pdf',
    'CV',
    '/attachments/cv_maria_gonzalez.pdf'
) ON CONFLICT DO NOTHING;

INSERT INTO candidate_attachments (candidate_id, name, type, file_path) VALUES 
(
    1,
    'Prueba_Tecnica.zip',
    'Prueba técnica',
    '/attachments/prueba_tecnica_maria.zip'
) ON CONFLICT DO NOTHING;

-- Insert sample timeline
INSERT INTO candidate_timeline (candidate_id, stage, status, date) VALUES 
(1, 'Pre-entrevista', 'completed', '2024-01-10 10:00:00'),
(1, 'Primera etapa', 'current', '2024-01-12 14:30:00'),
(1, 'Segunda etapa', 'pending', NULL),
(1, 'Fit cultural', 'pending', NULL),
(1, 'Seleccionado', 'pending', NULL) ON CONFLICT DO NOTHING;

-- =====================================================
-- VIEWS FOR ANALYTICS
-- =====================================================

-- View for application statistics
CREATE OR REPLACE VIEW application_stats AS
SELECT 
    a.id,
    a.title,
    a.status,
    COUNT(c.id) as total_candidates,
    COUNT(CASE WHEN c.status = 'pending' THEN 1 END) as pending_candidates,
    COUNT(CASE WHEN c.status = 'scheduled' THEN 1 END) as scheduled_candidates,
    COUNT(CASE WHEN c.status = 'completed' THEN 1 END) as completed_candidates,
    COUNT(CASE WHEN c.stage = 'Seleccionado' THEN 1 END) as selected_candidates,
    AVG(c.score) as average_score
FROM applications a
LEFT JOIN candidates c ON a.id = c.application_id
GROUP BY a.id, a.title, a.status;

-- View for user statistics
CREATE OR REPLACE VIEW user_stats AS
SELECT 
    u.id,
    u.name,
    u.role,
    COUNT(DISTINCT a.id) as total_applications,
    COUNT(DISTINCT c.id) as total_candidates,
    COUNT(CASE WHEN c.status = 'pending' THEN 1 END) as pending_candidates,
    COUNT(CASE WHEN c.status = 'scheduled' THEN 1 END) as scheduled_candidates,
    AVG(c.score) as average_score
FROM users u
LEFT JOIN applications a ON u.id = a.responsible_id
LEFT JOIN candidates c ON u.id = c.assignee_id
GROUP BY u.id, u.name, u.role;

-- =====================================================
-- FUNCTIONS FOR COMMON OPERATIONS
-- =====================================================

-- Function to get candidate with all related data
CREATE OR REPLACE FUNCTION get_candidate_full_data(candidate_id_param INTEGER)
RETURNS TABLE (
    candidate_id INTEGER,
    candidate_name VARCHAR(255),
    candidate_email VARCHAR(255),
    candidate_phone VARCHAR(50),
    candidate_position VARCHAR(255),
    candidate_stage VARCHAR(100),
    candidate_score DECIMAL(3,1),
    candidate_status VARCHAR(50),
    candidate_experience VARCHAR(255),
    candidate_location VARCHAR(255),
    candidate_avatar VARCHAR(500),
    application_title VARCHAR(255),
    assignee_name VARCHAR(255),
    notes_count INTEGER,
    attachments_count INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.name,
        c.email,
        c.phone,
        c.position,
        c.stage,
        c.score,
        c.status,
        c.experience,
        c.location,
        c.avatar,
        a.title as application_title,
        u.name as assignee_name,
        COUNT(DISTINCT cn.id) as notes_count,
        COUNT(DISTINCT ca.id) as attachments_count
    FROM candidates c
    LEFT JOIN applications a ON c.application_id = a.id
    LEFT JOIN users u ON c.assignee_id = u.id
    LEFT JOIN candidate_notes cn ON c.id = cn.candidate_id
    LEFT JOIN candidate_attachments ca ON c.id = ca.candidate_id
    WHERE c.id = candidate_id_param
    GROUP BY c.id, c.name, c.email, c.phone, c.position, c.stage, c.score, c.status, c.experience, c.location, c.avatar, a.title, u.name;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'TALENTO PRO DATABASE INITIALIZED SUCCESSFULLY';
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'Default admin user created: admin@talentopro.com';
    RAISE NOTICE 'Sample data inserted for testing';
    RAISE NOTICE 'Row Level Security (RLS) enabled';
    RAISE NOTICE 'Indexes created for optimal performance';
    RAISE NOTICE '=====================================================';
END $$;
