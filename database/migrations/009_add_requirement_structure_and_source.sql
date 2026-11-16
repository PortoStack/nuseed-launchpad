-- Migration: 009_add_requirement_structure_and_source.sql
-- Add source_channel and problem structure JSONB to requirements table

ALTER TABLE requirements 
ADD COLUMN IF NOT EXISTS source_channel VARCHAR(100) DEFAULT 'LINE',
ADD COLUMN IF NOT EXISTS structure JSONB DEFAULT '{}'::jsonb;
