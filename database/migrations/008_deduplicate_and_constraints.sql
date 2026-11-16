-- Migration: 008_deduplicate_and_constraints.sql
-- ป้องกันข้อมูลซ้ำซ้อนในตาราง researchers และ requirements

CREATE UNIQUE INDEX IF NOT EXISTS idx_researchers_name_unique ON researchers(name);
CREATE UNIQUE INDEX IF NOT EXISTS idx_requirements_unique_proj ON requirements(project_title, company_name);
