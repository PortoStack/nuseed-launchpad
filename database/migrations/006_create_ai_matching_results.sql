-- Migration: 006_create_ai_matching_results.sql
CREATE TABLE IF NOT EXISTS ai_match_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requirement_id UUID REFERENCES requirements(id) ON DELETE CASCADE,
    researcher_id UUID REFERENCES researchers(id) ON DELETE CASCADE,
    funding_id UUID REFERENCES funding_programs(id) ON DELETE SET NULL,
    fit_score DECIMAL(5, 4), -- 0.0000 - 1.0000
    score_breakdown JSONB, -- {"expertise_match": 0.85, "domain_synergy": 0.9, ...}
    explanation TEXT, -- คำอธิบายวิเคราะห์จาก Gemini AI เป็นภาษาไทย
    suggested_tags TEXT[] DEFAULT '{}',
    is_selected BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_match_results_req ON ai_match_results(requirement_id);
CREATE INDEX IF NOT EXISTS idx_ai_match_results_res ON ai_match_results(researcher_id);
