-- Migration: 002_create_researchers.sql
CREATE TABLE IF NOT EXISTS researchers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(100),
    discipline VARCHAR(255), -- กลุ่มสาขาวิชา เช่น วิทยาศาสตร์สุขภาพ, วิศวกรรมศาสตร์
    institution VARCHAR(255) DEFAULT 'มหาวิทยาลัยนเรศวร', -- สังกัด
    faculty VARCHAR(255), -- คณะ
    department VARCHAR(255), -- ภาควิชา
    expertise_primary TEXT, -- ความเชี่ยวชาญหลัก
    expertise_secondary TEXT, -- ความเชี่ยวชาญอื่น ๆ
    outstanding_works TEXT, -- ผลงานวิจัยเด่น
    past_grants TEXT, -- ทุนที่เคยได้รับ
    role_key VARCHAR(50) DEFAULT 'researcher', -- researcher, coach, advisor, external
    avatar_url TEXT,
    avatar_initial VARCHAR(10),
    avatar_color VARCHAR(50) DEFAULT '#0e6197',
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_researchers_name ON researchers(name);
CREATE INDEX IF NOT EXISTS idx_researchers_faculty ON researchers(faculty);
