# Lab 3 — Peer Review Record

**Author:** phatthidawadi — GitHub: @phatthidawadi
**Peer reviewer:** jejaebubu — GitHub: @jejaebubu (https://github.com/jejaebubu)

## Pull Requests I authored (reviewed by my partner)

| PR | Branch | Reviewer verdict |
|---|---|---|
| [PR #51](https://github.com/phatthidawadi/toktickit/pull/51) | `feature/15-doc-spec-tests` | Approved with comments |
| [PR #52](https://github.com/phatthidawadi/toktickit/pull/52) | `feature/16-db-schema-seed` | Pending |

---

### Reviewer comment I received (PR #51):
> ## P1 — ควรแก้ก่อน Approve
> 
> ### 1. `specification.md` — §7 Ticket model ไม่ตรงกับ BR-09
> ตอนนี้ `requestedPriority` และ `itPriority` ใช้ `String` และ `itPriority` มี default เป็น `"MEDIUM"`:
> ```text
> requestedPriority String
> itPriority        String @default("MEDIUM")
> currentStatus     String @default("NEW")
> ```
> แต่ BR-09 ระบุว่า `itPriority` ต้องเริ่มต้นจากค่าเดียวกับ `requestedPriority`
> ถ้าใช้ DB default เป็น `"MEDIUM"` ค่า `itPriority` อาจไม่ตรงกับ `requestedPriority` ได้
> **แนะนำ:** ใช้ Prisma `enum` สำหรับ Priority และ TicketStatus และกำหนดค่า `itPriority` ตอนสร้าง ticket ใน application code แทนการใช้ DB default
> 
> ---
> 
> ### 2. `tests.md` — AC Traceability Matrix มี test ID ที่ไม่มีอยู่จริง
> พบ reference ที่ไม่ตรงกับ test ในตาราง:
> * AC-02 → `UI-LOGIN-02` แต่ในตารางมีแค่ `UI-LOGIN-01`
> * AC-13 / AC-14 → `UI-NOTE-01` แต่ไม่มี test นี้
> * AC-18 / AC-19 → `UI-ADMIN-02` แต่ไม่มี test นี้
> รบกวนเพิ่ม test เหล่านี้ใน §2.2 หรือแก้ reference ให้ตรงกับ test ที่มีจริงครับ
> ตอนนี้ถ้าระบุว่า **“100% Covered”** จะยังตรวจสอบไม่ได้ เพราะบาง AC อ้างถึง test ที่ไม่มีอยู่ในรายการ
> 
> ---
> 
> ### 3. `tests.md` / PR description — จำนวน test ไม่ตรงกัน
> จากรายการ test ใน `tests.md`:
> * Server = 29
> * UI = 7
> * Style = 3
> * Responsive = 2
> * E2E = 3
> รวมเป็น **44 test cases**
> แต่ PR description และ `ai-use.md` ระบุว่า **41 test cases**
> รบกวนตรวจสอบและแก้จำนวนให้ตรงกัน
> 
> ---
> 
> ### 4. `api-spec.md` — Logout กับ Stateless JWT ยังไม่ชัดเจน
> ในเอกสารระบุว่า JWT เป็น **stateless** แต่ FR-04 / AC-04 ระบุว่า Logout ต้อง **invalidate session**
> สองส่วนนี้ยังไม่ชัดเจนว่า server จะ invalidate token อย่างไร
> ถ้าใช้ stateless JWT อย่างเดียว การ logout จะไม่ได้ทำให้ token ที่ออกไปแล้วหมดอายุทันที
> รบกวนอธิบายให้ชัดเจนว่า logout ใช้วิธีไหน เช่น มี session store / token blacklist หรือใช้วิธีอื่น เพื่อให้ตรงกับ requirement เรื่อง session invalidation 
> 
> ---
> 
> ### 5. `specification.md` — Definition of Done ระบุ AC ไม่ครบ
> DoD เขียนว่า:
> > AC-01 to AC-20
> แต่ในเอกสารมีถึง **AC-21**
> รบกวนแก้เป็น `AC-01 to AC-21` หรือปรับรายการให้ตรงกัน
> 
> ---
> 
> ## P2 — ควรแก้ให้ชัดเจน
> 
> ### 6. `api-spec.md` — Requester APIs หายไปจากเอกสาร
> Handout ระบุว่าต้องรองรับ **Lab 2 Requester Ticket และ Attachment APIs ต่อเนื่องใน Lab 3**
> แต่ใน `api-spec.md` ตอนนี้มีรายละเอียดหลัก ๆ ของ Staff, Admin และ Comments/Notes และยังไม่เห็น section ที่อ้างอิง Requester APIs เดิม
> อย่างน้อยควรเพิ่ม section ที่ระบุว่า Lab 2 Requester APIs ยังใช้งานต่อ และระบุว่า authentication/identity ใน Lab 3 เปลี่ยนมาใช้ session แบบใหม่อย่างไร
> 
> ---
> 
> ### 7. `specification.md` — BR-10 ยังไม่ชัดเจน
> BR-10 ระบุว่า:
> > WAITING_FOR_REQUESTER → IN_PROGRESS when Requester comments
> ขอให้ระบุให้ชัดเจนว่า **เมื่อ Requester ส่ง comment แล้วระบบเปลี่ยน status เป็น IN_PROGRESS อัตโนมัติใช่หรือไม่**
> ถ้าใช่ ควรระบุ behavior นี้ใน API และมี test แยกสำหรับกรณีนี้ด้วย เพราะ Requester ไม่ได้มีสิทธิ์เปลี่ยน status โดยตรง
> 
> ---
> 
> ### 8. `api-spec.md` — `priority_desc` ยังไม่ชัดว่าหมายถึง field ไหน
> ตอนนี้มี:
> ```text
> sort: createdAt_desc | createdAt_asc | priority_desc
> ```
> ขอระบุเพิ่มว่า `priority_desc` เรียงตาม `requestedPriority` หรือ `itPriority` เพื่อให้ implementation และ test ตรงกัน
> 
> ---
> 
> ### 9. `api-spec.md` — Edit user ยังไม่มี 409 สำหรับ duplicate email
> BR-13 ระบุว่า email ต้อง unique แบบ case-insensitive
> ตอน Create มีระบุ `409 Conflict` แล้ว แต่ตอน:
> ```text
> PATCH /api/admin/users/:id
> ```
> ยังไม่มีกรณี duplicate email
> ควรเพิ่ม `409 Conflict` สำหรับกรณีแก้ email แล้วไปซ้ำกับ user คนอื่นด้วย
> 
> ---
> 
> ### 10. `ui-spec.md` — Requester screens ยังไม่อยู่ใน Screen Specifications
> Header ระบุว่า REQUESTER สามารถไป:
> * My Tickets
> * Create Ticket
> แต่ใน §3 ยังมีรายละเอียดแค่ Login, Change Password, Staff Queue, Staff Ticket Detail และ Admin User Management
> ควรเพิ่ม Requester screens โดยเฉพาะ **Requester Ticket Detail** เพราะเป็นส่วนที่ต้องรองรับ Lab 2 regression รวมถึง Public Comments และ “Problem Appears Resolved”
> 
> ---
> 
> ### 11. `specification.md` — Migration strategy ยังอธิบายไม่ละเอียดพอ
> ตอนนี้ระบุขั้นตอนประมาณว่า:
> ```text
> npx prisma migrate dev --name init_lab3
> ```
> แต่เนื่องจาก Lab 3 ต้อง migrate ต่อจาก Lab 2 ควรอธิบายเพิ่มเติมว่า existing `RequesterUser` จะถูกย้ายมาเป็น `User` อย่างไร
> เช่น:
> * map ข้อมูลจากตารางเดิมไปตารางใหม่
> * preserve existing data / foreign keys
> * backfill `passwordHash`
> * จัดการ unique email
> * จัดการ field ที่เป็น nullable
> เพื่อให้เห็นชัดว่า migration จะไม่ทำข้อมูล Lab 2 หาย
> 
> ---
> 
> ## P3 — รายละเอียดเล็ก ๆ ที่ควรเช็ก
> 
> ### 12. `tests.md` — MIG-API-01 อ้าง Requirement ผิด
> `MIG-API-01` อ้าง `FR-08, BR-14` แต่ BR-14 เป็นเรื่อง self-deactivation ซึ่งไม่เกี่ยวกับ migration
> น่าจะตรวจสอบและแก้ reference เป็น requirement ที่เกี่ยวข้องจริง
> 
> ---
> 
> ### 13. `tests.md` — ยังขาด test บางกรณี
> แนะนำให้เพิ่ม test สำหรับ:
> * login attempts / brute-force
> * duplicate email ตอนแก้ไข user
> * Requester create-ticket regression
> โดยเฉพาะ regression เพราะ Lab 3 ต้องรักษาความสามารถเดิมจาก Lab 2 ไว้ด้วย
> 
> ---
> 
> ### 14. `specification.md` — `mustChangePassword` ไม่ตรงกับ schema default
> Assumption #4 ระบุว่า:
> > all newly created users mustChangePassword=true
> แต่ schema ใช้:
> ```text
> @default(false)
> ```
> ควรทำให้สองส่วนนี้สอดคล้องกันถ้าต้องการให้ user ใหม่เป็น `true` ต้องกำหนดใน application code หรือปรับ schema ให้ตรงกับ requirement
> 
> ---
> 
> ### 15. `specification.md` — BR-10 เรื่อง auto-claim ยังไม่ชัด
> BR-10 มีคำว่า:
> > optional auto-claim
> แต่ใน `api-spec.md` ยังไม่ชัดว่า auto-claim เป็น behavior ที่ระบบต้องทำจริง หรือเป็นแค่ option ที่อาจทำในอนาคต
> แนะนำให้ระบุให้ชัดว่าเป็น requirement จริงหรือไม่ และถ้าเป็นจริงควรระบุ behavior และ test ที่เกี่ยวข้อง
> 
> ---
> 
> ## สรุป
> โดยรวมเอกสารค่อนข้างละเอียดและโครงสร้างดีเลยค่ะ
> แต่ก่อน Approve อยากให้แก้ **3 จุดหลัก** ก่อน:
> 1. **P1 #1 — Ticket schema ต้องสอดคล้องกับ BR-09**
> 2. **P1 #4 — อธิบายให้ชัดว่า Logout สามารถ invalidate Stateless JWT ได้อย่างไร**
> 3. **P1 #2 — แก้ test IDs ใน Traceability Matrix ให้ตรงกับ test ที่มีจริง**
> เพราะ 3 จุดนี้กระทบทั้ง **Database design, Authentication และ Test Traceability** โดยตรงค่ะ

### How I responded (PR #51):
"ขอบคุณสำหรับการตรวจทาน Peer Review อย่างละเอียด ได้ทำการแก้ไขและอัปเดตเอกสารสเปกใน PR #51 ครบถ้วนทั้ง 15 ประเด็นเรียบร้อยแล้ว:

1. specification.md:
   - กำหนด Prisma TicketPriority และ TicketStatus Enum, ลบ default("MEDIUM") บน itPriority และตั้งค่า itPriority ให้ตรงกับ requestedPriority ตอนสร้างตั๋ว
   - ปรับ mustChangePassword default เป็น true ให้ตรงกับข้อกำหนด
   - อธิบายกลไก Auto-claim และการปรับสถานะตั๋วเป็น IN_PROGRESS อัตโนมัติเมื่อ Requester ส่ง comment ใน BR-10
   - ขยายรายละเอียด Data Migration Plan และปรับ DoD เป็น AC-01 to AC-21

2. api-spec.md:
   - อธิบายกลไก Stateless JWT Logout และการส่ง Header Clear Cookie (Set-Cookie: toktickit_session=; Max-Age=0)
   - กำหนดว่า priority_desc เรียงตาม itPriority จากสูงไปต่ำ
   - เพิ่ม 409 Conflict สำหรับกรณีแก้ไขอีเมลแล้วซ้ำใน PATCH /api/admin/users/:id
   - เพิ่ม Section 3 รองรับ Requester APIs Compatibility จาก Lab 2

3. ui-spec.md:
   - เพิ่ม Section 3.6 รายละเอียด Requester My Tickets & Ticket Detail Screen Specification

4. tests.md:
   - เพิ่ม test IDs ที่ขาดหายไป (UI-LOGIN-02, UI-NOTE-01, UI-ADMIN-02, SEC-AUTH-03, API-ADM-05, API-REQ-REG-01)
   - ปรับจำนวน Test Cases รวมเป็น 51 เคสตรงกันทุกจุด และแก้ MIG-API-01 requirement reference

5. reviewer.md & ai-use.md:
   - อัปเดต Peer Review Record สรุปคอมเมนต์และคำตอบ รวมถึง AI Usage Log เรียบร้อย

อัปเดตไฟล์ขึ้นกิ่ง feature/15-doc-spec-tests ใน PR #51 เรียบร้อยแล้ว รบกวนช่วยตรวจทานและกด Approve / Merge เข้า lab3-staging ได้เลย ขอบคุณนะ"

---

### Reviewer follow-up comment I received (PR #51):
> เช็กตัวอื่นที่ให้แก้แล้วนะคะ แก้ได้ครบหมดเลยแต่ยังเหลืออีกนิดนึง รบกวนแก้ heading ใน `tests.md` §2.1 จาก **31 → 33 Test Cases** ด้วยนะคะ เพราะในตารางมีทั้งหมด 33 แถว ดังนั้นจำนวนรวมควรเป็น **51 Test Cases** ให้ตรงกับจำนวนที่ระบุไว้ค่ะ

### How I responded (PR #51):
"แก้ไขเรียบร้อยแล้ว อัปเดต Heading ใน tests.md §2.1 จาก 31 → 33 Test Cases เรียบร้อยแล้ว ทำให้จำนวนรวมทุกหมวดหมู่อยู่ที่ 51 Test Cases ตรงกันทั้งหมด 100% แล้ว

ทำการ push ขึ้นกิ่ง feature/15-doc-spec-tests สำหรับ PR #51 เรียบร้อยแล้ว รบกวนช่วยตรวจทานและกด Approve / Merge บน GitHub ได้เลย ขอบคุณมากนะ"

---

### Reviewer comment I received (PR #52):
> ## P1 — ควรแก้ก่อน Approve
> 
> ### 1. ยังไม่มี Migration File สำหรับย้ายข้อมูล `RequesterUser → User`
> ตอนนี้ใน `server/prisma/migrations/` ยังมีแค่ migration จาก Lab 2 และยังไม่มี migration สำหรับ Lab 3 ค่ะ
> ถ้ารัน:
> ```text
> npx prisma migrate dev --name init_lab3
> ```
> บน DB ที่มีข้อมูลจาก Lab 2 อยู่ อาจเกิดปัญหาได้ เช่น
> * Prisma อาจสร้าง migration ที่ลบตาราง `RequesterUser` โดยไม่ได้ย้ายข้อมูลเดิมไป `User` ทำให้ข้อมูล Lab 2 หาย ซึ่งไม่ตรงกับ BR-08 / spec §7
> * Ticket เดิมที่มีข้อมูลอยู่แล้วจะต้องเพิ่ม `itPriority` ซึ่งเป็น `NOT NULL` แต่ไม่มีค่า default ทำให้ migration อาจ fail ตอนรันค่ะ
> รบกวนเพิ่ม migration หรือ SQL script สำหรับย้ายข้อมูลจริง โดยควรมีขั้นตอนประมาณนี้ค่ะ:
> `RequesterUser → User` พร้อมเก็บ ID เดิม → ตั้ง `passwordHash` และ `mustChangePassword=true` → เติมข้อมูลใหม่ใน Ticket (`itPriority`, `assignedStaffId`, `isRequesterResolved`) → แก้ FK → แล้วค่อยลบตารางเก่า
> 
> ---
> 
> ### 2. `seed.ts` ใช้ `bcryptjs` แต่ `package.json` มีแค่ `bcrypt`
> ใน `server/prisma/seed.ts` มี:
> ```text
> import bcrypt from "bcryptjs"
> ```
> แต่ใน `package.json` มี dependency เป็น `bcrypt` และไม่มี `bcryptjs` ค่ะ
> ดังนั้นตอนรัน:
> ```text
> npx prisma db seed
> ```
> อาจเจอ `Cannot find module 'bcryptjs'`
> รบกวนเลือกใช้ `bcrypt` หรือ `bcryptjs` ให้ตรงกันทั้ง `seed.ts` และ `package.json` ค่ะ
> 
> ---
> 
> ## P2 — ควรแก้ให้ชัดเจน
> 
> ### 3. `MIG-API-01` ยังไม่ได้ทดสอบการย้ายข้อมูล Lab 2 จริง ๆ
> Test ชื่อ **“Lab 2 Data Migration Integrity”** แต่ตอนนี้เช็กแค่ข้อมูลหลัง seed เช่น จำนวน user, password hash และ category ค่ะ
> ยังไม่ได้เช็กว่า **Ticket และ Attachment เดิมจาก Lab 2 ยังอยู่และเชื่อมกับเจ้าของเดิมถูกต้องหรือไม่**
> แนะนำให้เพิ่ม assertion ตรงนี้ด้วยค่ะ เพราะเป็นส่วนสำคัญของ FR-08 เรื่องการรักษาข้อมูลเดิมจาก Lab 2
> 
> ---
> 
> ### 4. BR-13 เรื่อง email ต้อง unique แบบไม่สนตัวพิมพ์เล็ก/ใหญ่ ยังไม่ถูก enforce ใน schema
> ตอนนี้ `User.email @unique` อย่างเดียวอาจทำให้:
> ```text
> jennifer@x.com
> Jennifer@X.com
> ```
> ถูกมองว่าเป็นคนละค่าในระดับ database ได้ค่ะ
> รบกวนเพิ่มวิธีตรวจสอบให้ email unique แบบ **case-insensitive** ตาม BR-13 ด้วยค่ะ
> 
> ---
> 
> ### 5. ยังไม่มีวิธีจัดการ Ticket เก่าตอนเพิ่ม field ใหม่
> ตอนนี้ seed มีการเตรียมข้อมูลสำหรับ sample ticket ใหม่ แต่ยังไม่เห็นวิธี backfill Ticket ที่มีอยู่แล้วจาก Lab 2 ค่ะ
> ควรระบุหรือทำ migration สำหรับข้อมูลเดิมให้ชัดเจนว่า:
> * `itPriority` ใช้ค่าเดียวกับ `requestedPriority`
> * `assignedStaffId` เริ่มต้นเป็น `null`
> * `isRequesterResolved` เริ่มต้นเป็น `false`
> เพื่อให้ Ticket เดิมยังใช้งานต่อได้หลัง migration ค่ะ
> 
> ---
> โดยรวม **Schema ที่เพิ่มมา เช่น enum, `mustChangePassword`, และการตั้ง `itPriority` จาก `requestedPriority` ตรงกับ spec แล้วค่ะ** 
> แต่จุดสำคัญของ PR นี้คือ **การย้ายข้อมูล User จาก Lab 2 และการทำ Seed Data** ซึ่งตอนนี้ยังขาด migration ที่ย้ายข้อมูลจริงค่ะ
> ก่อน Approve อยากให้เพิ่ม migration สำหรับย้ายข้อมูลจาก `RequesterUser → User` และลองรัน:
> ```text
> npx prisma migrate dev
> npx prisma db seed
> ```
> บน DB ที่มีข้อมูลจาก Lab 2 อยู่จริง แล้วตรวจสอบว่าข้อมูลเดิมยังอยู่ครบและใช้งานได้ค่ะ

### How I responded (PR #52):
"ขอบคุณสำหรับการตรวจทาน Peer Review อย่างละเอียด ได้ทำการแก้ไขและเพิ่ม Migration Script สำหรับย้ายข้อมูล Lab 2 ใน PR #52 เรียบร้อยแล้ว ทั้งหมด 5 ประเด็น:

1. เพิ่ม Migration File สำหรับย้ายข้อมูล (`20260914000000_init_lab3/migration.sql`):
   - ย้ายข้อมูลจาก `RequesterUser` ไปยัง `User` โดยรักษา ID เดิม, แปลง email เป็นตัวพิมพ์เล็ก (LOWER), กำหนด `role='REQUESTER'`, `passwordHash` เริ่มต้น และตั้ง `mustChangePassword=true`
   - Backfill ข้อมูลตั๋วเดิม: ตั้ง `itPriority = requestedPriority::"TicketPriority"`, `assignedStaffId = NULL`, และ `isRequesterResolved = false`
   - อัปเดต Sequence (`User_id_seq`) เพื่อป้องกัน ID ชนในการสร้างผู้ใช้ใหม่
   - ปรับ Foreign Keys และทำการ DROP TABLE `RequesterUser` อย่างปลอดภัย

2. ปรับการใช้งาน `bcryptjs` ใน `seed.ts` และ `package.json`:
   - ปรับ `package.json` ให้ใช้ `bcryptjs` และ `@types/bcryptjs` อย่างเป็นเอกภาพ ตรงตาม `seed.ts` และระบบทดสอบ

3. ปรับปรุง `MIG-API-01` ใน `migration.api.test.ts`:
   - เพิ่ม assertion ตรวจสอบความสมบูรณ์ของ Ticket และ Attachment เดิมจาก Lab 2 ว่าคงอยู่และเชื่อมโยงกับ `requesterId` / user ID เดิมถูกต้องครบถ้วน

4. บังคับใช้อีเมล Case-Insensitive Uniqueness (BR-13):
   - บังคับแปลง `LOWER(email)` ในระดับ Migration SQL, Prisma Seed, Application API logic และ Unique Index

5. Backfill Ticket fields สำหรับข้อมูลเดิมจาก Lab 2:
   - ทำการย้ายค่า `requestedPriority` ไปยัง `itPriority` และตั้งค่า default สำหรับ field ใหม่ของ Lab 3 บนตั๋วเดิมทั้งหมดใน SQL migration

ทำการ push โค้ดและ migration file ขึ้นกิ่ง `feature/16-db-schema-seed` สำหรับ PR #52 เรียบร้อยแล้ว รบกวนช่วยตรวจทานและกด Approve / Merge บน GitHub ได้เลย ขอบคุณมากนะ"





