-- Migration: 010_cleanup_mock_data.sql
-- Ensure only real requirements and researchers exist in the database

DELETE FROM requirements
WHERE target_program IN ('BI-2569-001', 'BI-2569-002', 'TI-2569-001', 'TI-2569-002', 'TI-2569-003');

DELETE FROM researchers
WHERE name IN (
  'รศ.ดร.ชัยวัฒน์ เคมีบริสุทธิ์',
  'ผศ.ดร.ศุภชัย จุลชีววิทยา',
  'รศ.ดร.ธีรภัทร์ พลังงานทดแทน',
  'ดร.วิภาวรรณ เทคนิคการแพทย์',
  'รศ.ดร.สมคิด วิศวกรรมดี',
  'ผศ.ดร.นริศรา วิทยาการคอม'
);
