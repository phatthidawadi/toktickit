# Lab 2 — Peer Review Record

**Author:** phatthidawadi — GitHub: @phatthidawadi
**Peer reviewer:** chanya06 — GitHub: @chanya06

## Pull Requests I authored (reviewed by my partner)
| PR | Branch | Reviewer verdict |
|----|--------|------------------|
| [PR #23](https://github.com/phatthidawadi/toktickit/pull/23) | `feature/5-doc-spec` | Approved with comments |
| [PR #24](https://github.com/phatthidawadi/toktickit/pull/24) | `feature/6-api-spec-test-plan` | Approved |
| [PR #25](https://github.com/phatthidawadi/toktickit/pull/25) | `feature/7-db-schema-seed` | Approved |
| [PR #26](https://github.com/phatthidawadi/toktickit/pull/26) | `feature/8-requester-context` | Approved |
| [PR #27](https://github.com/phatthidawadi/toktickit/pull/27) | `feature/9-create-ticket-form` | Approved |
| [PR #28](https://github.com/phatthidawadi/toktickit/pull/28) | `feature/10-my-tickets-list` | Approved |
| [PR #29](https://github.com/phatthidawadi/toktickit/pull/29) | `feature/11-ticket-detail` | Approved |
| [PR #30](https://github.com/phatthidawadi/toktickit/pull/30) | `feature/12-attachment-lifecycle` | Approved |
| [PR #31](https://github.com/phatthidawadi/toktickit/pull/31) | `feature/13-e2e-staging` | Approved |
| [PR #33](https://github.com/phatthidawadi/toktickit/pull/33) | `feature/14-developer-guide` | Approved |

### Reviewer comment I received (PR #23):
"ทำส่วน Sprint 2 Engineering Specification และ UI Specification (Zen Green Theme) ได้สมบูรณ์และละเอียดมาก

คำแนะนำเพิ่มเติมเล็กน้อย:
- ในขั้นตอนพัฒนา API Issue ถัดไป อาจตกลงกันเรื่องการสร้างเลข Sequence XXXXXX ของ Ticket Number (TKT-YYYY-XXXXXX) ว่าเป็น 6-digit Zero-padded sequence เพื่อให้ generator ทำงานสอดคล้องกัน

ภาพรวมโครงสร้างเอกสารคลีนมาก ระบุ Data Model Prisma และ API Summary ไว้ครบถ้วน"

### How I responded (PR #23):
"ขอบคุณสำหรับรีวิวและคำแนะนำนะ ฉันได้อัปเดตข้อกำหนดใน Business Rule (BR-01) ในเอกสาร specification.md เพิ่มเติมแล้วนะ โดยระบุชัดเจนว่าส่วน XXXXXX ของ Ticket Number (TKT-YYYY-XXXXXX) จะเป็น 6-digit zero-padded sequence (ตัวอย่างเช่น TKT-2026-000001) เพื่อให้การพัฒนา Ticket Number Generator ใน Issue ถัดไปสอดคล้องกัน ฝากตรวจสอบให้อีกทีนะ"

### Reviewer comment I received (PR #24):
"REST API Specification (api-spec.md) และ Test Plan (tests.md) ของ Sprint 2 ได้สมบูรณ์และเป็นมืออาชีพมาก

จุดเด่นที่ประทับใจ:
1. REST API Contract (api-spec.md): ระบุรายละเอียดทั้ง 9 Endpoints ได้ชัดเจนมาก มีตัวอย่าง Request/Response JSON, Header x-requester-id, Query parameters (search, filter, sort, pagination) รวมถึงการคืนค่า HTTP Status Codes ที่เป็นมาตรฐาน (200, 201, 400, 403, 410 Gone)
2. Comprehensive Test Strategy (tests.md): ออกแบบการทดสอบไว้ครบถ้วนทั้ง 4 เลเยอร์ (Unit, Supertest API, Vitest UI Component, Playwright E2E) รวม 19 Test Scenarios
3. AC Traceability Matrix: ตารางสอบทานการครอบคลุมของ Requirement จับคู่ AC-01 ถึง AC-08 กับ Test IDs ได้ครบ 100% ทำให้มั่นใจว่าการทำ TDD ใน Issue ถัดๆ ไปจะตรงตามสเปก
4. Responsive & Color Verification: มี Checklist สำหรับทดสอบ Viewports (Desktop, Tablet, Mobile) และ Zen Green Design Tokens ชัดเจน"

### How I responded (PR #24):
"ขอบคุณมากนะสำหรับคำรีวิวและการตรวจสอบเอกสาร api-spec.md และ tests.md อย่างละเอียด ยินดีอย่างยิ่งที่โครงสร้าง REST API Contract ทั้ง 9 Endpoints และแผนการทดสอบทั้ง 4 เลเยอร์ รวมถึง AC Traceability Matrix มีความชัดเจนและครอบคลุม ผมจะนำข้อกำหนดและแผนการทดสอบทั้งหมดนี้ไปใช้เป็นหลักในการพัฒนาโค้ดและทำ TDD สำหรับ Issue ถัดๆ ไป"

### Reviewer comment I received (PR #25):
"Prisma Database Schema และ Seed Data Script สำหรับ Sprint 2 ได้สมบูรณ์และเรียบร้อยมาก

จุดเด่นที่ประทับใจ:
1. Schema Design & Integrity (schema.prisma): ออกแบบครบ 5 โมเดลตาม Spec (RequesterUser, Category, RelatedSystem, Ticket, Attachment) มีการตั้งค่า @unique บน ticketNumber และ compound unique [name, categoryId] อย่างถูกต้อง รวมถึงใช้ onDelete: Restrict เพื่อรักษาความสมบูรณ์ของข้อมูล และตั้งค่า @@index บนฟิลด์ค้นหาช่วยเพิ่มประสิทธิภาพ Query
2. Idempotent Seed Script (seed.ts): ออกแบบการ Seed ด้วย upsert และ findFirst รันซ้ำได้ปลอดภัยไม่เกิด duplicate key errors
3. Realistic Test Data: มีข้อมูล Requesters ทั้งแบบ Active (4 คน) และ Inactive (1 คน) ตรงตามข้อกำหนด BR-04 สำหรับนำไปใช้ทดสอบตัวเลือก Requester ในหน้าเว็บได้ทันที

โค้ดสะอาด เป็นระเบียบ และรัน Seed ผ่าน 100%"

### How I responded (PR #25):
"ขอบคุณมากนะสำหรับคำรีวิวและการตรวจสอบ Prisma Schema รวมถึง Seed Script อย่างละเอียด ยินดีอย่างยิ่งที่โครงสร้าง Schema การจัดการความสัมพันธ์ของข้อมูล และชุดข้อมูลตัวอย่างถูกต้องตรงตามข้อกำหนด BR-04 ฉันจะใช้โครงสร้างฐานข้อมูลและข้อมูลเริ่มต้นชุดนี้สำหรับการพัฒนา API และหน้าจอแสดงผลใน Issue ถัดๆ ไป"

### Reviewer comment I received (PR #26):
"Development Requester Selector สำหรับ Sprint 2 ได้สมบูรณ์และสวยงามมาก

จุดเด่นที่ประทับใจ:
1. Backend Integration (GET /api/requesters): ดึงข้อมูลเฉพาะ Active Requesters จาก PostgreSQL ตาม BR-04 ได้ถูกต้อง และเขียน Supertest ตรวจสอบการกรอง Inactive user (Alex Taylor) ออกจากผลลัพธ์ได้อย่างแม่นยำ
2. State & LocalStorage Persistence (RequesterContext.tsx): บริหารจัดการ React Context ได้สะอาด มีการบันทึกผู้ใช้ลงใน localStorage เพื่อจดจำ Context ข้ามการ Reload หน้าเว็บ และเปิด Modal เลือกผู้ใช้อัตโนมัติเมื่อยังไม่มีการเลือก
3. Zen Green UI Spec Compliance (Header.tsx & RequesterSelectorScreen.tsx): ถอดแบบหน้าจอจาก UI Spec 5.1 ได้เป๊ะมาก ทั้งโทนสี Primary Green (#006B3C), Notice banner Pale Green (#EAF6EF) "Authentication coming in Lab 3", Badge ชื่อผู้ใช้ใน Header และ Accessibility (htmlFor)
4. UI Test Coverage (RequesterSelector.test.tsx): เขียน Vitest + RTL Mock API ทดสอบ Component rendering ได้อย่างถูกต้องครบถ้วน

งานเรียบร้อย โค้ดคลีน และผ่านการทดสอบ 100%"

### How I responded (PR #26):
"ขอบคุณมากนะสำหรับคำรีวิวและการตรวจทานโค้ดในส่วน Development Requester Selector อย่างถี่ถ้วน ยินดีอย่างยิ่งที่การจัดการ Context, การบันทึก LocalStorage, การกรอง Active User ตาม BR-04 และหน้าตา UI ธีม Zen Green ตรงตาม UI Spec 5.1 ฉันจะนำ Requester Context และ Header Component ชุดนี้ไปใช้เชื่อมต่อกับการรับค่า header x-requester-id ในฟีเจอร์สร้างตั๋วและดูตั๋วสำหรับ Issue ถัดๆ ไป"

### Reviewer comment I received (PR #27):
"Create Ticket API & Form สำหรับ Sprint 2 ได้เรียบร้อยและครบถ้วนมาก

จุดเด่นที่ประทับใจ:
1. Ticket Number Generator (ticketNumber.ts): คืนค่าในรูปแบบ TKT-YYYY-XXXXXX พร้อม 6-digit zero-padding ตาม BR-01 เป๊ะๆ และมี Unit Test ทดสอบความถูกต้อง 100%
2. Robust Backend API (POST /api/tickets): มีระบบการตรวจเช็ก Header x-requester-id, การ Validate ความยาว Summary (5-100 ตัวอักษร) และ Description (10-1000 ตัวอักษร) ตาม BR-06, การเช็กความสัมพันธ์ระหว่าง Category กับ Related System รวมถึงการกำหนดค่าเริ่มต้น currentStatus = "NEW" (BR-02)
3. Supertest Integration Coverage (create-ticket.api.test.ts): ทดสอบการส่งข้อมูลตั๋วผ่าน API ได้รับ HTTP 201 Created และยืนยันรูปแบบ Regex /^TKT-\d{4}-\d{6}$/ ได้ถูกต้อง
4. Zen Green UI Form Compliance (CreateTicketForm.tsx): ตรงตาม UI Spec 5.2 มีดอกจันสีแดง (* สี #C5221F), Inline Validation Error Messages, ปุ่ม Busy State ขณะกำลังบันทึกข้อมูล และ Banner สีเขียว Pale Green (#EAF6EF) แสดง Ticket Number เมื่อสร้างสำเร็จ

งานสมบูรณ์แบบ โค้ดคลีน และผ่านการทดสอบ 100%"

### How I responded (PR #27):
"ขอบคุณมากสำหรับคำรีวิวและการตรวจทานฟีเจอร์ Create Ticket ทั้งในส่วน Backend API, Ticket Number Generator, Validation และ Frontend UI Form อย่างละเอียด ยินดีอย่างยิ่งที่รูปแบบ Ticket Number (TKT-YYYY-XXXXXX), การตรวจสอบเงื่อนไข BR-01, BR-02, BR-06 และองค์ประกอบหน้าฟอร์มตาม UI Spec 5.2 ถูกต้องครบถ้วน ฉันจะนำข้อมูลตั๋วที่ถูกสร้างขึ้นนี้ไปใช้เชื่อมต่อกับหน้า My Tickets และหน้า Ticket Detail สำหรับ Issue ถัดๆ ไป"

### Reviewer comment I received (PR #28):
"My Tickets List (API & Responsive UI) สำหรับ Sprint 2 ได้สมบูรณ์และเป็นระเบียบมาก

จุดเด่นที่ประทับใจ:
1. Requester Data Isolation (GET /api/tickets): บังคับตรวจเช็ก Header x-requester-id กรองเฉพาะตั๋วของผู้ใช้นั้นตรงตาม BR-03 & AC-03 ได้เด็ดขาด
2. Search, Filter & Pagination Logic: รองรับการค้นหา Keyword แบบ Case-insensitive บน Ticket Number และ Summary, การกรอง Category/Status/Priority, การเรียงลำดับ Date และส่งคืน Metadata แบบ Paginated อย่างถูกต้อง
3. Supertest Integration Coverage (my-tickets.api.test.ts): ยืนยันการคัดกรองข้อมูลเฉพาะผู้ใช้และการค้นหาผ่าน API ได้ผลลัพธ์ผ่าน 100%
4. Responsive Zen Green UI (MyTicketsView.tsx): ถอดแบบหน้าจอตาม UI Spec 5.3 และ AC-08 สวยงามมาก แสดงผลเป็น Data Table บน Desktop และแปลงเป็น Responsive Card View บน Mobile (< 768px) ป้องกัน Horizontal Scrolling ได้สมบูรณ์ พร้อม Status Badges ที่ชัดเจนอ่านง่าย

โค้ดคลีน ประสิทธิภาพดี และผ่านการทดสอบครบถ้วน"

### How I responded (PR #28):
"ขอบคุณมากสำหรับคำรีวิวและการตรวจทานฟีเจอร์ My Tickets List ทั้งในส่วน Backend API และ Responsive UI อย่างละเอียด ยินดีอย่างยิ่งที่ระบบการคัดกรองสิทธิ์ผู้ใช้ตาม BR-03/AC-03, การค้นหา/กรองข้อมูล/Pagination และการแสดงผล Responsive Card แบบไม่มี Horizontal Overflow บน Mobile ตาม UI Spec 5.3 & AC-08 ถูกต้องสมบูรณ์ ฉันจะนำหน้ารายการตั๋วนี้ไปเชื่อมต่อกับการกดคลิกดูรายละเอียดตั๋วแบบ Read-Only ใน Issue 11 ถัดไป"

### Reviewer comment I received (PR #29):
"Ticket Detail Read-Only View สำหรับ Sprint 2 ได้สมบูรณ์และปลอดภัยมาก

จุดเด่นที่ประทับใจ:
1. Strict Ownership Protection (GET /api/tickets/:id): ตรวจเช็ก Header x-requester-id คืนค่า 403 Forbidden หากพยายามเข้าถึงตั๋วของผู้ใช้อื่นตรงตาม BR-03 & AC-03 ได้เด็ดขาด
2. Supertest Integration Coverage (ticket-detail.api.test.ts): ทดสอบคลอบคลุมทั้งเคส 200 OK (เจ้าของตั๋วดูข้อมูลสำเร็จ), 403 Forbidden (บล็อกผู้ใช้อื่น) และ 404 Not Found (ตั๋วไม่มีในระบบ) ผลการเทสต์ผ่าน 100%
3. Zen Green Read-Only UI Spec Compliance (TicketDetailView.tsx): ถอดแบบจาก UI Spec 5.4 สวยงามมาก มี Banner สี Pale Green (#EAF6EF) "Read-Only Mode", ฟิลด์พื้นหลังสีเทา-เขียวอ่อน (#F0F4F2) แยกสถานะฟอร์มอ่านอย่างเดียวชัดเจน และปุ่ม "Back to My Tickets"
4. Error Handling UI: จัดการหน้าจอ Error State กรณี 403 Forbidden และ 404 Not Found ได้เป็นมิตรกับผู้ใช้งาน

โค้ดสะอาด ปลอดภัยตามหลัก Security & Spec-Driven Development"

### How I responded (PR #29):
"ขอบคุณมากนะสำหรับคำรีวิวและการตรวจทานฟีเจอร์ Ticket Detail ทั้งในด้าน Security Access Control, HTTP Status Codes และ Read-Only UI อย่างละเอียด ยินดีอย่างยิ่งที่ระบบการคัดกรองสิทธิ์ตาม BR-03/AC-03 (403 Forbidden), การจัดการเคส 404 Not Found และรูปแบบการแสดงผลแบบ Read-Only ตาม UI Spec 5.4 ถูกต้องสมบูรณ์ ฉันจะนำฟีเจอร์รายละเอียดตั๋วนี้ไปต่อยอดกับระบบการจัดการไฟล์แนบ (Attachment Lifecycle) ใน Issue 12 ถัดไป"

### Reviewer comment I received (PR #30):
"Attachment Lifecycle (Upload, Download, Soft Removal) สำหรับ Sprint 2 ได้สมบูรณ์และเป็นมาตรฐานสูงมาก

จุดเด่นที่ประทับใจ:
1. Strict File Upload Validation: ใช้ Multer ควบคุมขนาดไฟล์ไม่เกิน 5MB (AC-05) และกรองไฟล์อันตราย (.exe, .bat, .cmd, .sh) คืนค่า 400 Bad Request ตาม AC-04 อย่างถูกต้อง
2. Soft Removal & 410 Gone Status: ออกแบบกระบวนการ Soft Delete (isRemoved: true, removedReason, removedAt) ได้สมบูรณ์แบบ และคืนค่า HTTP 410 Gone เมื่อพยายามดาวน์โหลดไฟล์ที่ถูกลบไปแล้วตรงตาม BR-07 & AC-06
3. Supertest Integration Coverage (attachments.api.test.ts): ทดสอบคลอบคลุมทั้งการ Upload 201 Created, การบล็อกไฟล์ .exe 400 Bad Request และการดาวน์โหลดไฟล์ที่ Soft-removed ได้รับ 410 Gone ผ่าน 100%
4. Zen Green UI & Removal Reason Modal Dialog: มี Modal บังคับกรอกเหตุผลในการลบไฟล์ และแยกตารางไฟล์ที่ถูก Soft-removed พร้อม Badge "Download Disabled (410 Gone)" ชัดเจนอ่านง่ายตาม UI Spec 5.4

โค้ดปลอดภัย ครบถ้วนตาม Requirement และผ่านการทดสอบ 100%"

### How I responded (PR #30):
"ขอบคุณมากครับสำหรับคำรีวิวและการตรวจทานฟีเจอร์ Attachment Lifecycle ทั้งในด้าน Security Validation, Soft Delete และ HTTP 410 Gone Status Code อย่างถี่ถ้วน ยินดีอย่างยิ่งที่การปฏิเสธไฟล์อันตราย (.exe) ตาม AC-04, การจำกัดขนาดไฟล์ไม่เกิน 5MB ตาม AC-05, กระบวนการบันทึกเหตุผล Soft Removal และการแสดงผลบนหน้าจอตาม UI Spec 5.4 ถูกต้องครบถ้วน ฉันจะนำโค้ดไปสู่ขั้นตอนการทดสอบ E2E Testing และ Staging Integration ใน Issue 13 ถัดไป"

### Reviewer comment I received (PR #31):
"E2E Testing, Quality Assurance Summary (reviewer.md) และ AI Usage Log (ai-use.md) ส่งท้าย Sprint 2 ได้สมบูรณ์และเป็นระเบียบมาก

จุดเด่นที่ประทับใจ:
1. Automated E2E User Journey (E2EUserJourney.test.tsx): เขียน Vitest + RTL ทดสอบ User Flow ตั้งแต่การเลือก Requester, แสดงชื่อบน Header, นำทางสร้างตั๋ว, กรอกฟอร์ม จนถึงการสร้างตั๋วและรับ Ticket Number (TKT-2026-000101) ผ่าน 100%
2. QA Verification Matrix & Review Log (reviewer.md): สรุปตารางการทดสอบ AC-01 ถึง AC-08, ประวัติการรีวิว PR #23 - PR #30, สถิติทดสอบ 25 Test Scenarios ใน 15 ไฟล์ และเช็กลิสต์ Definition of Done ไว้อย่างสมบูรณ์
3. AI Usage Audit Trail (ai-use.md): บันทึกการใช้งาน AI, Prompt History, และขั้นตอนการตรวจสอบความปลอดภัยของ Human Auditor ไว้อย่างละเอียดและโปร่งใส

งานเรียบร้อย เอกสารครบถ้วนตาม Definition of Done ของวิชา"

### How I responded (PR #31):
"ขอบคุณมากสำหรับคำรีวิวและการตรวจทานสรุปภาพรวมทั้งหมดของ Sprint 2 ยินดีอย่างยิ่งที่ผลการทดสอบ E2E User Journey, เอกสาร QA Summary (reviewer.md) และ AI Audit Trail (ai-use.md) ครบถ้วนตามมาตรฐานและ Definition of Done ของรายวิชา หลังจากเพื่อนกด Approve และ Merge PR #31 แล้ว ฉันจะทำการรวม branch lab2-staging เข้าสู่ main เพื่อเสร็จสิ้น Sprint 2 (Lab 2) อย่างสมบูรณ์ ขอบคุณสำหรับคำรีวิวและความช่วยเหลือตลอดทั้ง Sprint"

### Reviewer comment I received (PR #33):
"Sprint 2 Documentation Housekeeping, Alignment, and Final Verification สำหรับ Issue 14 ได้จัดเรียงเอกสารทั้ง 6 ไฟล์ใน docs/lab-02/ ได้อย่างสมบูรณ์ ถูกต้องตามข้อกำหนด และเป็นมาตรฐานเดียวกับ lab-01"

### How I responded (PR #33):
"ขอบคุณมากครับสำหรับคำรีวิวและการตรวจทานเอกสารใน docs/lab-02/ ทั้ง 6 ไฟล์ ได้แก่ specification.md, ui-spec.md, api-spec.md, tests.md, reviewer.md และ ai-use.md ซึ่งบัดนี้ได้ซิงค์ข้อมูลกับ implementation และ test evidence จริงทั้งหมดแล้วครับ"

## Pull Requests I reviewed for my partner
| PR | Branch | Reviewer verdict |
|----|--------|------------------|
| [chanya06/toktickit#24](https://github.com/phatthidawadi/toktickit/pull/24) | `feature/6-api-spec-test-plan` | Approved |

### My comment (PR #24 for partner):
"ตรวจสอบ PR Feature 6: API Specification and Test Plan ของเพื่อนเรียบร้อยแล้ว รายละเอียด REST API Contract ทั้ง 9 Endpoints และ Test Scenarios ครบถ้วน สมบูรณ์ พร้อมสำหรับก้าวถัดไปครับ"

### Partner's response (PR #24 for partner):
"ขอบคุณสำหรับการตรวจทานและ Approve PR ครับ จะเริ่มดำเนินการในฟีเจอร์ถัดไปตามแผนครับ"
