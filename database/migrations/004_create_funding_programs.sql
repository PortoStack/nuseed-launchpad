-- Migration: 004_create_funding_programs.sql
CREATE TABLE IF NOT EXISTS funding_programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL, -- P7, IRTC, P4, P5, P6, BCE, TM-TRACK-1, etc.
    title VARCHAR(255) NOT NULL, -- ชื่อโครงการเต็ม
    concept TEXT, -- ลักษณะโครงการ เช่น “ยกระดับธุรกิจชุมชนด้วยเทคโนโลยี”
    objective TEXT, -- วัตถุประสงค์
    target_group TEXT, -- กลุ่มเป้าหมาย
    output TEXT, -- ผลผลิต / Output
    open_period VARCHAR(100), -- ระยะเวลาเปิดรับ เช่น ต.ค. - พ.ย. ของทุกปี
    max_budget DECIMAL(14, 2) DEFAULT 0, -- งบประมาณสูงสุด
    support_ratio TEXT, -- สัดส่วนการสนับสนุน เช่น ภาครัฐ 100% หรือ In-Cash/In-Kind
    source VARCHAR(100), -- แหล่งทุน เช่น สป.อว., RSP, GSB
    duration_months VARCHAR(50), -- ระยะเวลาดำเนินโครงการ เช่น ไม่เกิน 6 เดือน
    status VARCHAR(50) DEFAULT 'open', -- open, closed, upcoming
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_funding_programs_code ON funding_programs(code);
CREATE INDEX IF NOT EXISTS idx_funding_programs_status ON funding_programs(status);
