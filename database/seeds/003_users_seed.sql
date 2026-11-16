-- ============================================================
-- Seed: 003_users_seed.sql
-- Description: Seed initial default users for authentication
-- Password for all seed users is: Password123!
-- ============================================================

INSERT INTO users (username, email, password_hash, first_name, last_name, role, roles, department, avatar_url, status)
VALUES
  (
    'admin',
    'admin@nu.ac.th',
    'scrypt:a1b2c3d4e5f60718:34995d14b06b03d489a1e1f5735283b7ab1763f293892a0eed35ee0a631fa05bcb5bee8a4182b2552efb0ecdd8530d5c5924119a6b8fb843a51c8e134546f99b',
    'ผู้ดูแลระบบ',
    'อุทยานฯ',
    'admin',
    ARRAY['admin', 'staff'],
    'อุทยานวิทยาศาสตร์มหาวิทยาลัยนเรศวร',
    NULL,
    'active'
  ),
  (
    'nitipong',
    'nitipongj@nu.ac.th',
    'scrypt:a1b2c3d4e5f60718:34995d14b06b03d489a1e1f5735283b7ab1763f293892a0eed35ee0a631fa05bcb5bee8a4182b2552efb0ecdd8530d5c5924119a6b8fb843a51c8e134546f99b',
    'นิติพงศ์',
    'จิตรีโภชน์',
    'researcher',
    ARRAY['researcher'],
    'ภาควิชาอุตสาหกรรมเกษตร คณะเกษตรศาสตร์ฯ มหาวิทยาลัยนเรศวร',
    NULL,
    'active'
  ),
  (
    'worawut',
    'WG.Kriangkrai@gmail.com',
    'scrypt:a1b2c3d4e5f60718:34995d14b06b03d489a1e1f5735283b7ab1763f293892a0eed35ee0a631fa05bcb5bee8a4182b2552efb0ecdd8530d5c5924119a6b8fb843a51c8e134546f99b',
    'วรวุฒิ',
    'เกรียงไกร',
    'researcher',
    ARRAY['researcher'],
    'ภาควิชาเทคโนโลยีเภสัชกรรม คณะเภสัชศาสตร์ มหาวิทยาลัยนเรศวร',
    NULL,
    'active'
  )
ON CONFLICT (username) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  role = EXCLUDED.role,
  roles = EXCLUDED.roles,
  department = EXCLUDED.department;
