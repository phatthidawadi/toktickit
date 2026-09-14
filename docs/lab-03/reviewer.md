# Lab 3 — Peer Review Record

**Author:** phatthidawadi — GitHub: @phatthidawadi
**Peer reviewer:** jejaebubu — GitHub: @jejaebubu (https://github.com/jejaebubu)

## Pull Requests I authored (reviewed by my partner)

| PR | Branch | Reviewer verdict |
|---|---|---|
| [PR #51](https://github.com/phatthidawadi/toktickit/pull/51) | `feature/15-doc-spec-tests` | Pending |

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
"ขอบคุณมากสำหรับการตรวจทานอย่างละเอียดและคำแนะนำที่มีประโยชน์มากครับ ผมได้ดำเนินการแก้ไขและปรับปรุงตามที่แจ้งครบทั้ง 15 ข้อในเอกสารทุกฉบับเรียบร้อยแล้ว:

1. **specification.md (§7 Ticket Model & Enums)**: ได้เพิ่ม Prisma `enum TicketPriority` (`LOW`, `MEDIUM`, `HIGH`, `URGENT`) และ `enum TicketStatus` โดยปรับประเภทของ `requestedPriority` และ `itPriority` ให้ใช้ Enum และลบ `@default("MEDIUM")` ออกจาก `itPriority` แล้วกำหนดใน BR-09 ให้ `itPriority` ถูกคัดลอกจาก `requestedPriority` ใน application code เมื่อสร้างตั๋ว
2. **tests.md (AC Traceability Matrix)**: ได้เพิ่มรายการ test ID `UI-LOGIN-02`, `UI-NOTE-01`, และ `UI-ADMIN-02` ลงใน §2.2 และอัปเดตตาราง AC Traceability ให้ตรงกับ test ID ที่มีจริงครบถ้วน
3. **tests.md / PR description (จำนวน Test Cases)**: ได้ปรับปรุงและเพิ่ม Test Cases ให้ครอบคลุมครบ **51 Test Cases** (Unit: 3, API: 28, UI Component: 10, Style: 3, Responsive: 2, E2E: 3) พร้อมอัปเดตตัวเลขใน `tests.md`, `ai-use.md` และ PR description ให้ตรงกันทุกจุด
4. **api-spec.md (Stateless JWT Logout Mechanism)**: ได้เพิ่มคำอธิบายใน Section 1 ว่าเมื่อขอล็อกเอาต์ผ่าน `POST /api/auth/logout` เซิร์ฟเวอร์จะส่ง Response Header `Set-Cookie: toktickit_session=; Max-Age=0` เพื่อลบ Cookie ฝั่ง Client ทันที และเนื่องจาก JWT มีอายุ 8 ชั่วโมง (Stateless) การลบ Cookie จะทำให้คำขอถัดไปไม่มี Cookie ถูกส่งมา เซิร์ฟเวอร์จึงปฏิเสธเป็น 401 Unauthorized
5. **specification.md (Definition of Done)**: ได้ปรับปรุงขอบเขต Acceptance Criteria ใน DoD จาก `AC-01 to AC-20` เป็น `AC-01 to AC-21`
6. **api-spec.md (Requester APIs Compatibility)**: ได้เพิ่ม Section 3 "Lab 2 Requester API Compatibility & Session Authentication Upgrade" ระบุการรองรับ API เดิมจาก Lab 2 (Create Ticket, My Tickets, Ticket Detail, Attachments) โดยอัปเกรดการระบุตัวตนมาใช้ `toktickit_session` cookie
7. **specification.md (BR-10 Requester Comment Status Transition)**: ได้ระบุใน BR-10 และ `api-spec.md` ว่าเมื่อ Requester ส่ง Public Comment ในตั๋วสถานะ `WAITING_FOR_REQUESTER` ระบบจะปรับสถานะตั๋วเป็น `IN_PROGRESS` ให้อัตโนมัติ (พร้อมเพิ่ม test case `API-COMM-03`)
8. **api-spec.md (`priority_desc` Sorting)**: ได้ระบุใน query parameter `sort` ว่า `priority_desc` จะเรียงตาม `itPriority` จากสูงไปต่ำ (`URGENT` > `HIGH` > `MEDIUM` > `LOW`) และใช้ `requestedPriority` เป็น fallback
9. **api-spec.md (Edit User 409 Conflict)**: ได้เพิ่ม `409 Conflict` ใน `PATCH /api/admin/users/:id` สำหรับกรณีแก้ไขอีเมลแล้วซ้ำกับผู้ใช้อื่น
10. **ui-spec.md (Requester Screen Specs)**: ได้เพิ่ม Section 3.6 สำหรับ Requester My Tickets List และ Ticket Detail Screen Specification
11. **specification.md (Data Migration Strategy)**: ได้ขยายรายละเอียดขั้นตอน Data Migration คัดลอกข้อมูลจาก `RequesterUser` ไปยัง `User` (id, name, email, dates), กำหนด `role = REQUESTER`, `isActive = true`, `mustChangePassword = true`, และ backfill `passwordHash` ด้วย bcrypt hash ของ `Password123!` โดยรักษา Foreign Key `Ticket.requesterId` ให้สมบูรณ์
12. **tests.md (MIG-API-01 Reference)**: ได้แก้ไข requirement reference ของ `MIG-API-01` เป็น `FR-08, BR-01, BR-02`
13. **tests.md (เพิ่ม Test Cases)**: ได้เพิ่ม `SEC-AUTH-03` (Invalid Login Attempts & Brute Force), `API-ADM-05` (Edit User Duplicate Email), และ `API-REQ-REG-01` (Requester Ticket Creation Regression)
14. **specification.md (`mustChangePassword` Default)**: ได้ปรับ Prisma Schema ให้ `mustChangePassword` เป็น `@default(true)` ตรงตาม Assumption #4
15. **specification.md (BR-10 Auto-claim)**: ได้ระบุใน BR-10 ว่าเมื่อ IT Staff เปลี่ยนสถานะตั๋วจาก `NEW` เป็น `OPEN` หรือ `IN_PROGRESS` โดยที่ตั๋วยังไม่มีผู้รับผิดชอบ (`assignedStaffId = null`) ระบบจะทำการกำหนด `assignedStaffId` เป็น ID ของ IT Staff ท่านนั้นให้อัตโนมัติ (Auto-claim)

อัปเดตไฟล์ทั้งหมดและดันขึ้นกิ่ง `feature/15-doc-spec-tests` สำหรับ PR #51 แล้วครับ พร้อมให้พาร์ทเนอร์ตรวจทานและ Approve / Merge ครับ"

