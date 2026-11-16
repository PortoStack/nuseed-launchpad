-- Seed: 001_taxonomy_seed.sql
-- หมวดหมู่ 6 กลุ่มอุตสาหกรรมหลัก
INSERT INTO tag_categories (code, name_th, name_en, color, display_order)
VALUES 
  ('main-agriculture-food', 'เกษตรและการแปรรูปอาหาร', 'Agriculture and Food Processing', '#10b981', 1),
  ('main-health', 'สุขภาพและการแพทย์', 'Health and Medicine', '#3b82f6', 2),
  ('main-cosmetics', 'เครื่องสำอางและเวชสำอาง', 'Cosmetics and Cosmeceuticals', '#ec4899', 3),
  ('main-technology', 'เทคโนโลยีสารสนเทศและดิจิทัล', 'IT Software and Digital Content', '#8b5cf6', 4),
  ('main-energy-materials', 'พลังงานทดแทนและวัสดุ', 'Renewable Energy and Materials', '#f59e0b', 5),
  ('main-creative-craft', 'งานสร้างสรรค์ หัตถกรรม และสิ่งทอ', 'Creative Crafts and Textiles', '#06b6d4', 6)
ON CONFLICT (code) DO UPDATE 
SET name_th = EXCLUDED.name_th, name_en = EXCLUDED.name_en, color = EXCLUDED.color;

-- Tags เริ่มต้น
DO $$
DECLARE
    cat_agri UUID;
    cat_health UUID;
    cat_cosmetics UUID;
    cat_tech UUID;
    cat_energy UUID;
    cat_craft UUID;
BEGIN
    SELECT id INTO cat_agri FROM tag_categories WHERE code = 'main-agriculture-food';
    SELECT id INTO cat_health FROM tag_categories WHERE code = 'main-health';
    SELECT id INTO cat_cosmetics FROM tag_categories WHERE code = 'main-cosmetics';
    SELECT id INTO cat_tech FROM tag_categories WHERE code = 'main-technology';
    SELECT id INTO cat_energy FROM tag_categories WHERE code = 'main-energy-materials';
    SELECT id INTO cat_craft FROM tag_categories WHERE code = 'main-creative-craft';

    -- เกษตรและอาหาร
    INSERT INTO tags (category_id, name, aliases) VALUES
      (cat_agri, 'เกษตรและการแปรรูปอาหาร', ARRAY['เกษตรแปรรูป', 'Food Processing']),
      (cat_agri, 'เทคโนโลยีการอบแห้ง', ARRAY['Drying Technology', 'อบแห้ง', 'Freeze Dry']),
      (cat_agri, 'กล้วยแปรรูป', ARRAY['กล้วยตาก', 'กล้วยผง', 'กล้วยม้วน']),
      (cat_agri, 'อาหารปลอดภัย (GHPs)', ARRAY['GHPs', 'GMP', 'มาตรฐานอาหาร']),
      (cat_agri, 'โพรไบโอติกส์และพรีไบโอติกส์', ARRAY['Probiotics', 'Prebiotics', 'FOS']),
      (cat_agri, 'ยืดอายุการเก็บรักษา', ARRAY['Shelf Life Extension', 'ถุงเพ้าช์', 'Retort Pouch']),
      (cat_agri, 'สารสกัดจากพืชและสมุนไพร', ARRAY['Plant Extract', 'สมุนไพร']),
      (cat_agri, 'เกษตรอินทรีย์', ARRAY['Organic', 'พืชอินทรีย์', 'GAP']),
      (cat_agri, 'การสกัดและการแปรรูปโกโก้', ARRAY['Cocoa', 'โกโก้', 'Cacao']),
      (cat_agri, 'การแปรรูปข้าวและธัญพืช', ARRAY['ข้าวไรซ์เบอรี่', 'ข้าวกล้อง', 'แป้งข้าว'])
    ON CONFLICT (name) DO NOTHING;

    -- เครื่องสำอางและเวชสำอาง
    INSERT INTO tags (category_id, name, aliases) VALUES
      (cat_cosmetics, 'เครื่องสำอางและเวชสำอาง', ARRAY['Cosmetics', 'Cosmeceuticals']),
      (cat_cosmetics, 'สเปรย์สมุนไพร', ARRAY['Herbal Spray', 'สเปรย์ปรับอากาศ']),
      (cat_cosmetics, 'ลิปทินท์และเมคอัพ', ARRAY['Lip Tint', 'เครื่องสำอางแต่งหน้า']),
      (cat_cosmetics, 'ผลิตภัณฑ์บำรุงผิวและเส้นผม', ARRAY['Skincare', 'Haircare', 'เซรั่ม'])
    ON CONFLICT (name) DO NOTHING;

    -- สุขภาพและการแพทย์
    INSERT INTO tags (category_id, name, aliases) VALUES
      (cat_health, 'การแพทย์ครบวงจร', ARRAY['Integrated Medicine', 'Healthcare']),
      (cat_health, 'นวัตกรรมสารสกัดต้านความเสื่อม', ARRAY['Anti-aging', 'พรมมิ']),
      (cat_health, 'หลอดเก็บเลือดและเวชภัณฑ์', ARRAY['Medical Device', 'อุปกรณ์การแพทย์']),
      (cat_health, 'กัญชาและกัญชงทางการแพทย์', ARRAY['Medical Cannabis', 'CBD', 'กัญชง'])
    ON CONFLICT (name) DO NOTHING;

    -- เทคโนโลยีสารสนเทศและดิจิทัล
    INSERT INTO tags (category_id, name, aliases) VALUES
      (cat_tech, 'อินเทอร์เน็ตของสรรพสิ่ง (IoT)', ARRAY['IoT', 'Smart Sensors', 'เซนเซอร์']),
      (cat_tech, 'ปัญญาประดิษฐ์ (AI)', ARRAY['AI', 'Machine Learning', 'Data Analysis']),
      (cat_tech, 'ระบบติดตามและ GPS Tracking', ARRAY['GPS', 'Tracking', 'Fleet Management']),
      (cat_tech, 'ระบบห้องเย็นอัจฉริยะ', ARRAY['Smart Cold Storage', 'ห้องเย็น'])
    ON CONFLICT (name) DO NOTHING;

    -- พลังงานและวัสดุ
    INSERT INTO tags (category_id, name, aliases) VALUES
      (cat_energy, 'บรรจุภัณฑ์ย่อยสลายได้', ARRAY['Biodegradable Packaging', 'PLA', 'บรรจุภัณฑ์ชีวภาพ']),
      (cat_energy, 'การจัดการขยะและเศรษฐกิจหมุนเวียน', ARRAY['Circular Economy', 'Zero Waste', 'รีไซเคิล']),
      (cat_energy, 'ยานพาหนะไฟฟ้า (EV)', ARRAY['Electric Vehicle', 'EV', 'สามล้อไฟฟ้า'])
    ON CONFLICT (name) DO NOTHING;

    -- หัตถกรรมและสิ่งทอ
    INSERT INTO tags (category_id, name, aliases) VALUES
      (cat_craft, 'สิ่งทอและผ้าทอพื้นเมือง', ARRAY['Textiles', 'ผ้าทอ', 'ย้อมสีธรรมชาติ']),
      (cat_craft, 'งานหัตถกรรมสร้างสรรค์', ARRAY['Crafts', 'ว่าวพระร่วง', 'มีดหมอมงคล'])
    ON CONFLICT (name) DO NOTHING;
END $$;
