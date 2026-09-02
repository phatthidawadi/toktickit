# Lab 2 — Peer Review Record

**Author:** phatthidawadi — GitHub: @phatthidawadi
**Peer reviewer:** chanya06 — GitHub: @chanya06

## Pull Requests I authored (reviewed by my partner)
| PR | Branch | Reviewer verdict |
|----|--------|------------------|
| [PR #23](https://github.com/phatthidawadi/toktickit/pull/23) | `feature/5-doc-spec` | Approved with comments |
| [PR #24](https://github.com/phatthidawadi/toktickit/pull/24) | `feature/6-api-spec-test-plan` | Approved with comments |
| [PR #25](https://github.com/phatthidawadi/toktickit/pull/25) | `feature/7-db-schema-seed` | Approved with comments |
| [PR #26](https://github.com/phatthidawadi/toktickit/pull/26) | `feature/8-requester-context` | Approved with comments |
| [PR #27](https://github.com/phatthidawadi/toktickit/pull/27) | `feature/9-create-ticket-form` | Approved with comments |
| [PR #28](https://github.com/phatthidawadi/toktickit/pull/28) | `feature/10-my-tickets-list` | Approved with comments |
| [PR #29](https://github.com/phatthidawadi/toktickit/pull/29) | `feature/11-ticket-detail` | Approved with comments |
| [PR #30](https://github.com/phatthidawadi/toktickit/pull/30) | `feature/12-attachment-lifecycle` | Approved with comments |
| [PR #31](https://github.com/phatthidawadi/toktickit/pull/31) | `feature/13-e2e-staging` | Approved with comments |
| [PR #33](https://github.com/phatthidawadi/toktickit/pull/33) | `feature/14-developer-guide` | Pending |

### Reviewer comment I received (PR #23):
"ทำส่วน Sprint 2 Engineering Specification และ UI Specification (Zen Green Theme) ได้สมบูรณ์และละเอียดมาก

คำแนะนำเพิ่มเติมเล็กน้อย:
- ในขั้นตอนพัฒนา API Issue ถัดไป อาจตกลงกันเรื่องการสร้างเลข Sequence XXXXXX ของ Ticket Number (TKT-YYYY-XXXXXX) ว่าเป็น 6-digit Zero-padded sequence เพื่อให้ generator ทำงานสอดคล้องกัน

ภาพรวมโครงสร้างเอกสารคลีนมาก ระบุ Data Model Prisma และ API Summary ไว้ครบถ้วน"

### How I responded (PR #23):
"ขอบคุณสำหรับรีวิวและคำแนะนำนะ ฉันได้อัปเดตข้อกำหนดใน Business Rule (BR-01) ในเอกสาร specification.md เพิ่มเติมแล้วนะ โดยระบุชัดเจนว่าส่วน XXXXXX ของ Ticket Number (TKT-YYYY-XXXXXX) จะเป็น 6-digit zero-padded sequence (ตัวอย่างเช่น TKT-2026-000001) เพื่อให้การพัฒนา Ticket Number Generator ใน Issue ถัดไปสอดคล้องกัน ฝากตรวจสอบใหีกทีนะ"

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
"Pending peer review."

### How I responded (PR #33):
"Pending peer response."

## Pull Requests I reviewed for my partner
| PR | Branch | Reviewer verdict |
|----|--------|------------------|
| [lmaybelgracel/TokTickit#23](https://github.com/lmaybelgracel/TokTickit/pull/23) | `feature/5-spec-doc` | Approved with comments |
| [lmaybelgracel/TokTickit#24](https://github.com/lmaybelgracel/TokTickit/pull/24) | `feature/6-ui-api-spec` | Approved with comments |
| [lmaybelgracel/TokTickit#25](https://github.com/lmaybelgracel/TokTickit/pull/25) | `feature/7-test-plan` | Approved with comments |
| [lmaybelgracel/TokTickit#26](https://github.com/lmaybelgracel/TokTickit/pull/26) | `feature/8-db-schema-seed` | Approved with comments |
| [lmaybelgracel/TokTickit#27](https://github.com/lmaybelgracel/TokTickit/pull/27) | `feature/9-requester-context` | Approved with comments |
| [lmaybelgracel/TokTickit#28](https://github.com/lmaybelgracel/TokTickit/pull/28) | `feature/10-create-ticket` | Approved with comments |
| [lmaybelgracel/TokTickit#29](https://github.com/lmaybelgracel/TokTickit/pull/29) | `feature/11-my-tickets` | Approved with comments |

### My comment (PR #23 for partner lmaybelgracel):
"ภาพรวมสเปกทำได้ดีมาก โครงสร้างตรงตาม Appendix A ของ Lab 2 Handout กำหนด Scope และ Zen Green Theme ได้ชัดเจนดีมาก

ขอเสนอแนะเพิ่มเติมเล็กน้อยเพื่อความสมบูรณ์ก่อนเริ่ม Implement:
1. [BR Strategy] เพิ่มความชัดเจนเรื่อง Transaction เมื่ออัปโหลดไฟล์ล้มเหลว
2. [BR Validation] กำหนดความยาวของ removalReason (3 - 250 ตัวอักษร)
3. [Data Schema] ระบุ Prisma Indexes (@@index([requesterId]))
4. [API Standard] ระบุ HTTP Header สำหรับ Requester Context (X-Development-Requester-Id)
5. [Acceptance Criteria] เพิ่ม AC สำหรับ No-results และ Error State (AC-08/AC-09)"

### Partner's response (PR #23 for partner lmaybelgracel):
"ขอบคุณมากสำหรับข้อเสนอแนะที่มีประโยชน์มากค่ะ ได้ทำการปรับปรุงเอกสาร docs/lab-02/specification.md และ push อัปเดตเข้า PR เรียบร้อยแล้ว รบกวนตรวจสอบอีกครั้งและช่วยกด Merge pull request เข้า lab2-staging ได้เลยค่ะ"

### My comment (PR #24 for partner lmaybelgracel):
"เอกสาร UI Specification และ API Contract ใน docs/lab-02/specification.md เขียนได้ครอบคลุมและชัดเจนดีมาก มีการกำหนดธีมสี Zen Green พร้อม Hex Code ชัดเจน และมี Endpoints ครอบคลุมการทำงานของ Requester ทั้งหมด รวมถึงการใช้ Header X-Development-Requester-Id สำหรับแยก Identity

ข้อเสนอแนะเพิ่มเติมเล็กน้อย:
1. ใน UI Spec อาจระบุสีของ Priority/Status Badge และ Visual State ของไฟล์ที่โดน Soft-remove เพิ่มเติม
2. ใน API Spec อยากเสนอให้ใส่ HTTP Status Codes (200, 201, 400, 403, 404, 410) และ Request Body สำหรับ DELETE /api/attachments/:id (removalReason) ให้ชัดเจนยิ่งขึ้น"

### Partner's response (PR #24 for partner lmaybelgracel):
"ขอบคุณมากสำหรับคำแนะนำและข้อเสนอแนะที่มีประโยชน์มากค่ะ ได้ทำการอัปเดตเอกสาร docs/lab-02/ui-spec.md และ push ขึ้น PR #24 เรียบร้อยแล้วค่ะ รบกวนตรวจสอบอีกครั้ง และช่วยกด Approve พร้อมกด Merge pull request เข้า lab2-staging ให้ด้วยนะคะ"

### My comment (PR #25 for partner lmaybelgracel):
"ได้ทำการรีวิวเอกสารแผนการทดสอบและตาราง Traceability Matrix สำหรับ Lab 2 เรียบร้อยแล้ว โดยรวมวางโครงสร้างและกำหนดขอบเขตการทดสอบได้ดีมาก ขอส่งสรุปผลการรีวิวและข้อแนะนำเพิ่มเติมดังนี้:

จุดที่ทำได้ดี:
1. Multi-layer Testing Architecture ครอบคลุม Supertest, Vitest และ Playwright
2. Security & Data Ownership Boundary ป้องกันการเข้าถึงข้อมูลข้ามตัวตน
3. Requirement Mapping เชื่อมโยง Test ID กับ FR และ AC ได้เป็นระบบ

ข้อแนะนำเพิ่มเติมสำหรับปรับปรุง:
1. เพิ่ม Test Cases สำหรับ Edge Cases & Business Rules (BR-06, BR-07, BR-11, AC-05, AC-06)
2. Form Data Retention on Error (BR-09, AC-09)
3. อัปเดต Test Evidence & File Paths ให้ถูกต้อง"

### Partner's response (PR #25 for partner lmaybelgracel):
"ขอบคุณสำหรับคำแนะนำและข้อเสนอแนะที่มีประโยชน์มากค่ะ ได้ทำการปรับปรุงเอกสาร docs/lab-02/tests.md และ push ขึ้น PR #25 เรียบร้อยแล้ว รบกวนตรวจสอบอีกครั้ง และช่วยกด Approve พร้อมกด Merge pull request เข้า lab2-staging ให้ด้วยนะคะ"

### My comment (PR #26 for partner lmaybelgracel):
"ดูภาพรวมของ PR #26 (Issue 8: Database Schema and Seed Data) แล้วทำได้ตรงตาม Specification ของ Lab 2 ครบถ้วนและเรียบร้อยมาก

จุดที่ชอบและออกแบบได้ดี:
1. schema.prisma: ออกแบบ Models ครบถ้วน มีการตั้งค่า Enums, Unique Constraints และสร้าง @@index สำหรับ Foreign Keys ต่างๆ ได้ครอบคลุม
2. Attachment Model: มี fields รองรับ Soft Removal (isRemoved, removedAt, removalReason) ตาม BR-07
3. seed.ts: ใช้งาน upsert สำหรับทุก Entity รัน Seed ซ้ำได้โดยไม่เกิดข้อมูลซ้ำ (Idempotency)

ข้อเสนอแนะเพิ่มเติมก่อน Merge:
- อย่าลืมสร้าง/ตรวจสอบไฟล์ Prisma Migration (npx prisma migrate dev) และ commit โฟลเดอร์ server/prisma/migrations/ ขึ้น Git"

### Partner's response (PR #26 for partner lmaybelgracel):
"ขอบคุณมากสำหรับข้อเสนอแนะ ได้ทำการสร้างไฟล์ Prisma Migration DDL สำหรับ Lab 2 ครอบคลุม Tables, Enums, Constraints และ Indexes ทั้งหมด พร้อมทั้ง commit ขึ้น PR #26 เรียบร้อยแล้วค่ะ"

### My comment (PR #27 for partner lmaybelgracel):
"ฟีเจอร์ Development Requester Context ทำได้ตรงตามข้อกำหนด FR-01, FR-02, FR-03, BR-03, AC-02 และ AC-07 การแสดงผลหน้า Requester Selector มี Banner แจ้งเตือนสภาวะ Context Test ชัดเจน UI สวยงามตาม Zen Green Design System

ข้อเสนอแนะเพิ่มเติมก่อน Merge:
1. ใน client/vite.config.ts ควรอัปเดต include เป็น ["src/__tests__/**/*.test.tsx", "tests/**/*.test.tsx"]
2. ใน client/src/App.tsx มี Typo property maxWdith ใน styles.headerInner แนะนำลบออก"

### Partner's response (PR #27 for partner lmaybelgracel):
"ขอบคุณสำหรับ Code Review มากๆ เลยนะคะ ได้ดำเนินการแก้ไขตามข้อเสนอแนะเพิ่มเติมเรียบร้อยแล้วค่ะ ทำการ push commit แก้ไขขึ้น PR เรียบร้อยแล้วนะคะ รบกวนตรวจสอบและ Approve เพื่อ Merge ได้เลยค่ะ ขอบคุณมากค่ะ"

### My comment (PR #28 for partner lmaybelgracel):
"ตรวจสอบโค้ดและผลการทดสอบของ Issue 10: Create Ticket Workflow and Reference Data APIs (#28) เรียบร้อยแล้ว:
1. Backend APIs: Implement GET /api/categories, GET /api/related-systems, และ POST /api/tickets ได้ตรงตาม specification
2. Frontend UI: หน้าจอ CreateTicket.tsx ตกแต่งได้สวยงามตาม Zen Green Theme
3. Automated Tests: รัน Vitest ทั้งฝั่ง Server และ Client ผ่าน 100%

ข้อเสนอแนะเล็กน้อย (Non-blocking):
- ใน POST /api/tickets อาจเพิ่มการเช็ก category.isActive === true และ relatedSystem.isActive === true เพื่อป้องกันการส่ง ID หมวดหมู่ที่ถูกปิดใช้งานเข้ามา"

### Partner's response (PR #28 for partner lmaybelgracel):
"ขอบคุณสำหรับ Code Review และคำแนะนำ ได้นำข้อเสนอแนะเพิ่มเติมมาปรับปรุงในระบบเรียบร้อยแล้วค่ะ โดยอัปเดต API POST /api/tickets ให้ตรวจสอบ category.isActive === true และ relatedSystem.isActive === true ก่อนสร้าง Ticket เรียบร้อยแล้วค่ะ"

### My comment (PR #29 for partner lmaybelgracel):
"ตรวจสอบ PR #29 เรียบร้อยแล้ว โค้ดตรงตามข้อกำหนดของ Issue 11 และสเปกใน api-spec.md และ ui-spec.md ครบถ้วน:
1. Backend (GET /api/tickets): รองรับ Header X-Development-Requester-Id, กรองข้อมูลแยกตาม Requester Context
2. Frontend UI: ออกแบบตาม Zen Green Theme แสดงผล Priority Badges และ Status Badge
3. Automated Tests: ผ่าน 100%

ข้อเสนอแนะเพิ่มเติม (Minor Recommendations):
1. Debounce สำหรับ Search Input (Client)
2. ขจัด Warning ใน Vitest UI Test (act(...) Warning)"

### Partner's response (PR #29 for partner lmaybelgracel):
"ขอบคุณสำหรับการตรวจทานและรีวิวอย่างละเอียดครับ จะนำข้อเสนอแนะเรื่อง Debounce และการขจัด act(...) Warning ไปปรับปรุงในระบบต่อไปครับ"
