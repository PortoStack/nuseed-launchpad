-- Migration: 005_create_junction_tables.sql
CREATE TABLE IF NOT EXISTS researcher_tags (
    researcher_id UUID REFERENCES researchers(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (researcher_id, tag_id)
);

CREATE TABLE IF NOT EXISTS requirement_tags (
    requirement_id UUID REFERENCES requirements(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    accepted BOOLEAN DEFAULT TRUE,
    PRIMARY KEY (requirement_id, tag_id)
);

CREATE TABLE IF NOT EXISTS funding_tags (
    funding_id UUID REFERENCES funding_programs(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (funding_id, tag_id)
);

CREATE INDEX IF NOT EXISTS idx_researcher_tags_tag ON researcher_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_requirement_tags_tag ON requirement_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_funding_tags_tag ON funding_tags(tag_id);
