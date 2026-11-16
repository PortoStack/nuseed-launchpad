# 🚀 NU SEED Launchpad — Tag Matching & AI Transfer Platform

ระบบ **Tag Matching** และ **Tag Review / Catalog** ที่ถอดแบบ UI จาก `NUSEEDBITI` 100% พัฒนาด้วย **Next.js 16 (App Router)**, เชื่อมต่อฐานข้อมูล **Supabase (PostgreSQL)** ด้วย **Raw SQL** (ไม่ใช้ ORM) พร้อมระบบ **.sql Migration** และยกระดับการจับคู่ด้วย **Gemini AI Semantic Analysis**

---

## ✨ ไฮไลต์ฟีเจอร์สำคัญ

1. **🎯 100% Original UI (Tag Matching Workspace)**:
   - อัลกอริทึมต้นฉบับวิเคราะห์คะแนนความตรงของ Tag แบ่งเป็น **Exact Match** (เขียว), **Related Match** (ส้ม/ฟ้า), และ **Missing Tags** (เทาขีดฆ่า)
   - รองรับการจับคู่ครบทั้ง 4 โหมดความสัมพันธ์:
     - ผู้ประกอบการ ↔ นักวิจัย (Entrepreneur ↔ Researcher)
     - ผู้ประกอบการ ↔ แหล่งทุน (Entrepreneur ↔ Funding)
     - แหล่งทุน ↔ นักวิจัย (Funding ↔ Researcher)
     - Triple Matching: แหล่งทุน ↔ นักวิจัย ↔ ผู้ประกอบการ
   - แท็บเฉพาะสำหรับ **Coaches & Advisors** (ที่ปรึกษาและโค้ช)

2. **🧠 Gemini AI Deep Reasoning (ปุ่ม AI Analysis ในทุกการ์ด)**:
   - ผสานการวิเคราะห์เชิงลึกด้วย Google Gemini 2.5 Flash
   - แสดงคะแนน **AI Fit Score** (0-100%) พร้อมแจกแจงคะแนนความตรงของทักษะ, ความสอดคล้องอุตสาหกรรม และความเป็นไปได้ในการประยุกต์ใช้จริง
   - สรุปบทวิเคราะห์ภาษาไทยอธิบายเหตุผลความเหมาะสม และแนะนำแท็กที่เกี่ยวข้องเพิ่มเติม

3. **🏷️ Tag Review & Catalog Management**:
   - หน้าจัดการ Taxonomy และอนุมัติ/ควบรวม Tag Proposals
   - จำแนก 6 กลุ่มอุตสาหกรรมหลัก (เกษตรและแปรรูปอาหาร, สุขภาพ, เครื่องสำอาง, ดิจิทัล, พลังงานและวัสดุ, หัตถกรรม)

4. **🗄️ Raw SQL + .sql Migrations (Supabase & Vercel Ready)**:
   - ใช้งานไดรเวอร์ `postgres.js` ที่เร็วที่สุดและน้ำหนักเบา ไร้ ORM bloat
   - ปลอดภัยจาก SQL Injection ด้วย Tagged Template Literals
   - มีคำสั่งรัน Migration และ Seed ข้อมูลจริงจากชีต P7 ผ่านไฟล์ `.sql` หรือนำไฟล์ไปวางใน Supabase SQL Editor ได้ทันที

5. **🌐 Multi-language Support (next-intl)**:
   - รองรับภาษาไทย (`th`) และอังกฤษ (`en`)

---

## 🛠️ การเริ่มต้นใช้งาน (Quick Start)

### 1. ติดตั้ง Dependencies
```bash
npm install
```

### 2. ตั้งค่า Environment Variables
คัดลอกไฟล์ `.env.example` ไปเป็น `.env.local`:
```bash
cp .env.example .env.local
```
จากนั้นระบุ `DATABASE_URL` (จาก Supabase Project Settings > Database) และ `GEMINI_API_KEY` (จาก Google AI Studio)

### 3. รัน Migration และ Seed ข้อมูลจริง (ชีต P7)
```bash
# รันไฟล์ DDL migrations สร้างตารางบน Supabase
npm run db:migrate

# รันไฟล์ DML seeds นำเข้าข้อมูลนักวิจัย แหล่งทุน และโจทย์จริง P7
npm run db:seed
```
*(หรือสามารถคัดลอกโค้ดจาก `database/migrations/*.sql` และ `database/seeds/*.sql` ไปกด Run ใน Supabase SQL Editor ได้โดยตรง)*

### 4. รัน Development Server
```bash
npm run dev
```
เปิดบราวเซอร์ที่ [http://localhost:3000](http://localhost:3000)

---

## 🚢 การ Deploy ขึ้น Vercel

1. Push โค้ดขึ้น GitHub / GitLab
2. Import โปรเจกต์เข้า Vercel
3. เพิ่ม Environment Variables ใน Vercel Dashboard:
   - `DATABASE_URL`: แนะนำให้ใช้ **Connection Pooler URL (พอร์ต 6543)** ของ Supabase พร้อมพารามิเตอร์ `?pgbouncer=true`
   - `GEMINI_API_KEY`: API Key สำหรับ Gemini AI
4. กด **Deploy** ได้ทันที (Build ผ่าน 100% ไร้ Type Error)
