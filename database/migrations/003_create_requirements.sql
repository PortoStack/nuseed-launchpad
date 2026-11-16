-- Migration: 003_create_requirements.sql
CREATE TABLE IF NOT EXISTS requirements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_title TEXT, -- ชื่อโครงการ (ถ้ามี)
    company_name VARCHAR(255) NOT NULL, -- ชื่อสถานประกอบการ / วิสาหกิจชุมชน
    entrepreneur_name VARCHAR(255), -- ชื่อ-นามสกุล ผู้ประกอบการ
    entrepreneur_prefix VARCHAR(50), -- คำนำหน้า
    entrepreneur_type VARCHAR(100), -- ประเภทผู้ประกอบการ (บริษัท, วิสาหกิจชุมชน, กลุ่ม)
    business_type VARCHAR(255), -- ประเภทธุรกิจ เช่น เกษตรและการแปรรูปอาหาร
    juristic_number VARCHAR(100), -- เลขนิติบุคคล
    products_services TEXT, -- รายละเอียดผลิตภัณฑ์ / บริการ
    address TEXT, -- ที่อยู่
    province VARCHAR(100), -- จังหวัด
    phone VARCHAR(100),
    email VARCHAR(255),
    budget DECIMAL(14, 2) DEFAULT 0, -- งบประมาณ
    raw_text TEXT NOT NULL, -- โจทย์ปัญหา / ความต้องการ
    need_types TEXT[] DEFAULT '{}', -- needTypes เช่น Technology, Marketing, Machinery
    status VARCHAR(50) DEFAULT 'open', -- open, matching, matched, closed
    target_program VARCHAR(100), -- แผนงานเป้าหมาย เช่น P7, IRTC, BCE, TM
    assigned_researcher VARCHAR(255), -- นักวิจัยเดิมที่ระบุไว้
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_requirements_company ON requirements(company_name);
CREATE INDEX IF NOT EXISTS idx_requirements_target_program ON requirements(target_program);
