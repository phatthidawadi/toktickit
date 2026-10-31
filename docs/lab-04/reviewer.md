# Lab 4 — Peer Review Record

**Author:** phatthidawadi — GitHub: @phatthidawadi  
**Peer reviewer:** chanya poolketkij — GitHub: @chanya06 (https://github.com/chanya06)

## Pull Requests I authored (reviewed by my partner)

| PR | Branch | Reviewer verdict |
|---|---|---|
| [PR #72](https://github.com/phatthidawadi/toktickit/pull/72) | `feature/26-doc-spec-tests` | Approved with comments |
| [PR #73](https://github.com/phatthidawadi/toktickit/pull/73) | `feature/27-actions-taken-foundation` | Approved with comments |
| [PR #74](https://github.com/phatthidawadi/toktickit/pull/74) | `feature/28-actions-taken-ui` | Approved with comments |
| [PR #75](https://github.com/phatthidawadi/toktickit/pull/75) | `feature/29-ticket-workflow-and-resolution` | Approved with comments |
| [PR #76](https://github.com/phatthidawadi/toktickit/pull/76) | `feature/30-role-based-dashboards` | Approved with comments |
| [PR #77](https://github.com/phatthidawadi/toktickit/pull/77) | `feature/31-e2e-automated-testing-and-screenshots` | Approved with comments |
| [PR #78](https://github.com/phatthidawadi/toktickit/pull/78) | `feature/32-visual-style-accessibility-hardening` | Approved with comments |
| [PR #79](https://github.com/phatthidawadi/toktickit/pull/79) | `feature/33-doc-reviewer-ai-use` | Approved with comments |
| [PR #80](https://github.com/phatthidawadi/toktickit/pull/80) | `lab4-staging` -> `main` | Approved with comments |

---

### Reviewer comment I received (PR #72):
> โดยรวมเอกสารครอบคลุมโจทย์ Lab 4 ดี โดยเฉพาะ Actions Taken, dashboard, UI spec และ traceability ของ test plan
>
> มี 4 จุดที่อยากให้แก้ก่อน approve:
> 1. Ticket transition กับ authorization ยังไม่ตรงกัน
>    ใน specification.md ระบุว่า Requester สามารถเปลี่ยนสถานะ RESOLVED → CLOSED/REOPENED ได้ แต่ api-spec.md ระบุว่า endpoint เปลี่ยน status ใช้ได้เฉพาะ IT Staff/Admin และ UI เป็นแนวให้ Requester ดูข้อมูลอย่างเดียว
>    อยากให้เลือก behavior ที่ต้องการให้ชัด แล้วปรับ specification, API spec, UI spec และ tests ให้ตรงกัน
> 2. Optimistic locking ยังไม่ชัด
>    BR-10 บอกว่า mutation ทุกตัวต้องส่ง version แต่ API spec ของ status update เขียนว่า version optional และ resolve-ack / cancel ยังไม่มี version ใน request contract
>    ควรกำหนดให้ชัดว่า endpoint ไหนต้องใช้ version แล้วทำให้ request, response, error และ test สอดคล้องกัน
> 3. Test plan ยังขาด performance-smoke coverage
>    ตาม handout ต้องมี performance-smoke test แต่ใน tests.md ยังไม่เห็น test กลุ่มนี้
>    แนะนำเพิ่ม test สำหรับ dashboard query หรือ action list โดยมีเกณฑ์ตรวจสอบที่ชัดเจน
> 4. ไฟล์ประกอบ Lab 4 ยังไม่ครบ
>    Handout ระบุให้มี docs/lab-04/reviewer.md และ docs/lab-04/ai-use.md เพิ่มด้วย ตอนนี้ PR มีเฉพาะ 4 ไฟล์หลัก
>    ถ้าตั้งใจแยกไป PR ถัดไปก็ได้ แต่ควรวางแผนให้ครบก่อนส่งงาน

### How I responded (PR #72):
> ดำเนินการแก้ไขและปรับความสอดคล้องทั้ง 4 จุดเรียบร้อยแล้วใน commit 3d7531a:
>
> 1. **Ticket Transition & Authorization Alignment:**
>    - กำหนดให้การเปลี่ยนสถานะตั๋วอย่างเป็นทางการ (Formal Status Transition) รวมถึง `RESOLVED -> CLOSED` และ `RESOLVED -> REOPENED` ดำเนินการโดย **`IT_STAFF` และ `ADMINISTRATOR` เท่านั้น** ผ่าน `PATCH /api/staff/tickets/:id/status` (Requesters ได้รับ HTTP 403 Forbidden)
>    - บทบาทของ Requester ต่อสถานะตั๋วมีเพียง:
>      - ยกเลิกตั๋วของตนเองเมื่ออยู่ในสถานะ `NEW`: `NEW -> CANCELLED` ผ่าน `PATCH /api/tickets/:id/cancel`
>      - ส่งความเห็นเชิงแนะนำผ่าน Toggle "Problem Appears Resolved" ผ่าน `PATCH /api/tickets/:id/resolve-ack` ซึ่งเป็นเพียง Advisory indicator (`isRequesterResolved = true`) แต่ไม่เปลี่ยนสถานะตั๋ว
>      - ระบบ auto-transition ตั๋วจาก `WAITING_FOR_REQUESTER -> IN_PROGRESS` อัตโนมัติเมื่อ Requester ตอบคอมเมนต์ (BR-09)
>    - ปรับปรุงให้สอดคล้องกันครบทั้ง `specification.md` (ตาราง 5.1, 5.2), `api-spec.md` (§3.1), `ui-spec.md` (§3.5), และ `tests.md`
>
> 2. **Optimistic Locking & Mandatory Versioning:**
>    - กำหนดให้ทุก mutation บน Ticket (`/api/staff/tickets/:id/status`, `/api/tickets/:id/resolve-ack`, `/api/tickets/:id/cancel`) และ Action Taken (`/api/actions/:id`) ต้องส่ง `"version": <integer>` เป็น **Mandatory field** ใน Request body เสมอ
>    - หาก `version` ไม่ตรงกับฐานข้อมูลจะถูก reject ด้วย HTTP `409 Conflict` (`CONCURRENCY_CONFLICT`)
>    - อัปเดต contracts, error schema และ test cases (`ACT-API-09`, `FLOW-API-06`, `FLOW-API-07`, `FLOW-API-08`) ครบถ้วน
>
> 3. **Performance-Smoke Test Coverage:**
>    - เพิ่มหมวด Performance-Smoke Tests ใน `tests.md` (§2.4) ได้แก่:
>      - `PERF-SMK-01`: Dashboard queries benchmark (`/api/dashboard/requester`, `/api/dashboard/staff`) latency p95 < 200ms ภายใต้ฐานข้อมูล 100+ tickets
>      - `PERF-SMK-02`: Actions Taken query latency (`/api/tickets/:id/actions`) latency p95 < 150ms สำหรับ ticket ที่มี 20+ action lines
>      - `PERF-SMK-03`: Burst concurrency conflict throughput (10 concurrent requests) latency เฉลี่ย < 300ms
>    - เพิ่ม `AC-17 (Performance-Smoke Benchmarks)` ใน `specification.md` และแมปลงใน Traceability Matrix (100% covered)
>
> 4. **ไฟล์ประกอบ Lab 4:**
>    - ได้เพิ่มไฟล์ `docs/lab-04/reviewer.md` และ `docs/lab-04/ai-use.md` เข้ามาใน PR นี้เรียบร้อยแล้ว ทำให้โครงสร้างโฟลเดอร์ `docs/lab-04/` มีครบทั้ง 6 ไฟล์ตามเกณฑ์ Handout Section 12
>
> รบกวนตรวจสอบอีกครั้งนะ

---

### Reviewer round 2 comment I received (PR #72):
> ตรวจรอบล่าสุดแล้ว 4 ประเด็นหลักแก้ได้ดีขึ้นมาก โดยเฉพาะ mandatory versioning, performance-smoke tests และการเพิ่มไฟล์ประกอบ Lab 4  
>
> เหลือขอแก้อีก 3 จุดก่อน approve:
> 1. PATCH /api/tickets/:id/cancel ยังระบุสิทธิ์ไม่ตรงกันระหว่าง api-spec.md กับ specification.md ว่า Staff/Admin ใช้ได้หรือไม่
> 2. reviewer.md ระบุว่า PR #72 “Approved with comments” แล้ว แต่ตอนนี้ยังอยู่ระหว่างรีวิว ขอให้เปลี่ยนเป็น Changes requested หรือ Under review ก่อน
> 3. เพิ่ม Performance-Smoke Tests แล้ว แต่ tests.md และ ai-use.md ยังระบุว่ามีเพียง 8 coverage layers ควรอัปเดตเป็น 9 layers
> แก้ 3 จุดนี้แล้วส่งมาได้เลย

### How I responded (round 2, PR #72):
> ดำเนินการปรับปรุงแก้ไขทั้ง 3 จุดเรียบร้อยแล้วใน commit a50f408:
>
> 1. **ปรับสิทธิ์ `PATCH /api/tickets/:id/cancel` ให้ตรงกัน:**
>    - ปรับใน `api-spec.md` (§3.3) ให้ตรงกับ `specification.md` (BR-08, §8.2) และ `ui-spec.md` (§3.5) อย่างสมบูรณ์:
>      - `PATCH /api/tickets/:id/cancel` กำหนด Authorized Role เป็น **`REQUESTER` (owned ticket in `NEW` status only)** สำหรับการถอนตั๋วก่อน triage
>      - ระบุหมายเหตุชัดเจนว่า `IT_STAFF` และ `ADMINISTRATOR` ทำการ cancel ตั๋วผ่าน endpoint หลัก `PATCH /api/staff/tickets/:id/status` ด้วย payload `{ "status": "CANCELLED", "version": <int> }` ซึ่งรองรับการยกเลิกจากหลายสถานะ (`NEW`, `OPEN`, `IN_PROGRESS`, `WAITING_FOR_REQUESTER`) ตาม Transition Matrix
>
> 2. **อัปเดตสถานะใน `reviewer.md`:**
>    - ปรับสถานะของ PR #72 ในตารางเป็น **`Under review (Changes requested)`** และ Status เป็น **`Under Review`** ให้ตรงกับสถานะจริงในระหว่างรีวิว และเพิ่มบันทึก Round 2 logs เรียบร้อยครับ
>
> 3. **อัปเดต Coverage Layers เป็น 9 Layers ครบทุกจุด:**
>    - ใน `docs/lab-04/tests.md`:
>      - อัปเดต §1 เป็น **9 Coverage Layers** โดยเพิ่มข้อ *9. Performance-Smoke Tests: Latency benchmarks across dashboard aggregations (< 200ms), actions chronological queries (< 150ms), and burst concurrency conflict throughput under operational loads.*
>      - อัปเดตเกณฑ์ความครอบคลุมเป็น `FR-01` ถึง `FR-12`, `BR-01` ถึง `BR-16`, และ `AC-01` ถึง `AC-17`
>    - ใน `docs/lab-04/ai-use.md`:
>      - อัปเดตข้อความใน Prompt log และ Reflection ให้ระบุ 9 coverage layers สอดคล้องกันทั้งหมด
>
> ตอนนี้เนื้อหาครบถ้วนและสอดคล้องกัน 100% แล้ว รบกวนตรวจสอบอีกครั้ง

---

### Reviewer approval verdict (PR #72):
> ตรวจแล้ว 3 จุดที่เหลือแก้ครบและสอดคล้องกันแล้ว:
> - cancel endpoint จำกัดเฉพาะ Requester เจ้าของ ticket ที่สถานะ NEW; Staff/Admin ใช้ status endpoint หลัก
> - reviewer.md เปลี่ยนเป็น Under review (Changes requested) แล้ว
> - tests.md และ ai-use.md อัปเดตเป็น 9 coverage layers และครอบคลุม AC-17 แล้ว

---

### Reviewer comment I received (PR #73):
> ตรวจสอบโค้ดจริงของ PR #73 ครอบคลุม Prisma Schema, Migration SQL, Database Seed, REST APIs และ Automated Tests เทียบกับข้อกำหนด Lab 4 Handout และ engineering contract ใน `docs/lab-04/`:
>
> 1. **Data Model & Migration:**
>    - โมเดล `ActionTaken` มีฟิลด์ครบตาม Handout Section 4.1 (`actionDateTime`, `description`, `result`, `performedById`, `followUpRequired`, `followUpNote`, `attachmentNotes`, `assigneeId`, `status`)
>    - Foreign Keys ถูกต้อง: `ticket` (Cascade delete), `performedBy` (Restrict), `assignee` (SetNull)
>    - Migration `20261015000000_init_lab4_actions_taken` ปลอดภัย เป็น non-destructive มี `IF NOT EXISTS` ไม่กระทบข้อมูลเดิม
>
> 2. **Seed Data:**
>    - `server/prisma/seed.ts` มี sample tickets ครบทั้ง 3 กรณีตาม Handout §5.3:
>      - Ticket 1 (`TKT-2026-000001`): มี 2 actions (Completed 1, In Progress 1)
>      - Ticket 2 (`TKT-2026-000002`): Legacy ticket มี 0 actions
>      - Ticket 3 (`TKT-2026-000003`): Resolved ticket มี 1 action
>    - Seed logic ทำงานแบบ idempotent (`findFirst` check)
>
> 3. **REST APIs & Authorization:**
>    - `POST /api/tickets/:id/actions`: ป้องกัน Requester ด้วย 403, `performedById` ดึงจาก Session Token อัตโนมัติ, ตรวจสอบ assignee ต้องเป็น active IT Staff หรือ Admin
>    - `GET /api/tickets/:id/actions`: Requester ดูได้เฉพาะตั๋วที่ตนเองเป็นเจ้าของ (ดูของคนอื่นตอบ 403 `FORBIDDEN`), เรียงลำดับ `actionDateTime ASC, id ASC` สม่ำเสมอ
>    - `PATCH /api/actions/:id`: ตรวจสอบ version mismatch แล้วส่ง `409 CONCURRENCY_CONFLICT` ตาม BR-10
>
> 4. **Automated Tests:**
>    - `server/tests/lab-04/actions-taken.api.test.ts` มี 10 test cases (`ACT-API-01` ถึง `ACT-API-09` และ `MIG-API-01`) ยืนยันพฤติกรรมครบทุกเงื่อนไข
>
> **ข้อเสนอแนะเพิ่มเติม (Non-blocking):**
> - ใน `PATCH /api/actions/:id` สามารถปรับให้ version check เป็น atomic update ผ่าน `updateMany` ในระดับ database ได้
> - อัปเดตตารางใน `docs/lab-04/reviewer.md` ให้ใส่ลิงก์ `[PR #73]`

### How I responded (PR #73):
> ขอบคุณสำหรับคำแนะนำและการตรวจทานโค้ดอย่างละเอียดครับ ได้ดำเนินการปรับปรุงทั้ง 2 จุดตามข้อเสนอแนะเรียบร้อยแล้ว:
>
> 1. **Atomic Version Check ใน `PATCH /api/actions/:id`:**
>    - ปรับปรุงการอัปเดตข้อมูลให้ใช้ `prisma.actionTaken.updateMany` โดยกำหนดเงื่อนไข `where: { id: actionId, version }` และ `version: { increment: 1 }` โดยตรงในระดับฐานข้อมูล ทำให้การตรวจสอบและเพิ่มค่า version เกิดขึ้นแบบ Atomic Operation ป้องกัน Concurrency Race Condition ระหว่าง concurrent requests ได้ 100%
>
> 2. **อัปเดตตารางใน `reviewer.md`:**
>    - บันทึกลิงก์ `[PR #73]` และระบุผลการตรวจทานเป็น `Approved with comments` พร้อมบันทึกข้อคิดเห็นจากรีวิวและการตอบกลับอย่างครบถ้วน

---

### Reviewer approval verdict (PR #73):
> ### Re-review — PR #73 (Round 2) — 
> 
> ตรวจ head ล่าสุด commit `0412dc5` และยืนยันผลจากโค้ดจริงทุกจุดเรียบร้อยแล้วค่ะ จุดที่ให้ข้อเสนอแนะไว้ในรอบแรกแก้ไขได้ถูกต้อง รัดกุม และสมบูรณ์แบบมากค่ะ:
> 
> 1. ✅ **Atomic Optimistic Concurrency Update (`server/src/app.ts`)**:
>    - ปรับ `PATCH /api/actions/:id` มาใช้ `prisma.actionTaken.updateMany` โดยระบุเงื่อนไข `where: { id: actionId, version }` และ `version: { increment: 1 }`
>    - ตรวจจับ `updateResult.count === 0` ตอบกลับ `409 CONCURRENCY_CONFLICT` ทันที ทำให้การล็อกและตรวจสอบ version เป็น Atomic Operation ในระดับฐานข้อมูล PostgreSQL ป้องกัน Concurrency Race Condition ระหว่าง concurrent requests ได้ 100%
> 
> 2. ✅ **Peer Review Record Updated (`docs/lab-04/reviewer.md`)**:
>    - อัปเดตตารางสถานะของ `[PR #73]` เป็น **`Approved with comments`** เรียบร้อย
>    - บันทึกรายละเอียดข้อเสนอแนะจาก Reviewer และคำชี้แจงการแก้ไขจาก Author ครบถ้วนตามมาตรฐานกระบวนการของรายวิชา
> 
> 3. ✅ **Test Suite & Verification**:
>    - ชุดทดสอบ Actions Taken API (`ACT-API-01` ถึง `ACT-API-09` และ `MIG-API-01`) ผ่านครบ 10/10 tests
>    - ชุดทดสอบ Full Regression ฝั่ง Server ผ่าน 94/94 tests ครอบคลุม 19 test files และ Client Production Build ผ่านสมบูรณ์

---

### Reviewer comment I received (PR #74):
> ตรวจทานโค้ดจริงทั้งหมดใน branch `feature/28-actions-taken-ui` เทียบกับ **Lab 4 Handout (§4.3, §8.3)**, `specification.md`, `ui-spec.md` และ `tests.md` อย่างละเอียดเรียบร้อยแล้ว:
>
> 1. ✅ **Component Integration & Role-Based Visibility**:
>    - นำคอมโพเนนต์ `ActionsTakenSection` ไปฝังในทั้ง `StaffTicketDetail.tsx` (Staff/Admin) และ `TicketDetailView.tsx` (Requester) ได้อย่างถูกต้อง
>    - แยกสิทธิ์ชัดเจน: Requester เห็นประวัติการทำงานแบบ Read-only (ซ่อนปุ่มสร้างและแก้ไขทั้งหมด) ขณะที่ Staff/Admin มีปุ่ม `+ Record Action` และปุ่ม `Edit` ครบถ้วนตาม Handout §4.3
>
> 2. ✅ **Responsive Design & Dual Layout**:
>    - รองรับการแสดงผลแบบตารางบน Desktop/Tablet ($\ge$ 768px) และสลับเป็น Stacked Cards บน Mobile (< 768px) อัตโนมัติ ป้องกันปัญหาหน้าจอล้น (No horizontal scrolling)
>    - ปุ่มกดสำคัญผ่านเกณฑ์ Touch Target $\ge$ 44px และมี Visible Focus Ring (`2px solid #0B7A46`) ตามมาตรฐาน Zen Green Theme
>
> 3. ✅ **Validation & Dynamic UX**:
>    - ตรวจสอบฟิลด์บังคับ Description และ Result (1–2,000 ตัวอักษร) พร้อม Toggle กล่องข้อความ Follow-up Note สีเหลืองอำพัน (`#FEF3C7`) เฉพาะเมื่อต้องการงานติดตามต่อ
>    - เชื่อมต่อ Dropdown ผู้รับผิดชอบกับ Endpoint `GET /api/staff/assignees` ที่กรองเฉพาะ active IT Staff/Admin อย่างรัดกุม
>
> 4. ✅ **Optimistic Concurrency Conflict Handling (HTTP 409)**:
>    - จัดการ Conflict ในระดับ UI ได้อย่างนุ่มนวล โดยแสดงแบนเนอร์แจ้งเตือนพร้อมปุ่ม `Reload Latest Data` เพื่อดึงเวอร์ชันล่าสุดมาให้แก้ไขใหม่โดยไม่ทำลายข้อมูลที่ผู้ใช้พิมพ์ค้างไว้
>
> 5. ✅ **Automated Tests**:
>    - ชุดทดสอบ `client/tests/lab-04/ActionsTaken.test.tsx` ครอบคลุมครบทั้ง 5 เคส (`UI-ACT-01` ถึง `UI-ACT-05`) ผ่าน 100%
>
> **ข้อเสนอแนะเพิ่มเติม (Non-blocking):**
> - ใน `docs/lab-04/api-spec.md` แนะนำเพิ่มการบันทึก Endpoint ใหม่ `GET /api/staff/assignees` ที่เพิ่มเข้ามาใน PR นี้ เพื่อให้เอกสารสัญญาตรงกับโค้ดจริง
> - สามารถพิจารณาเพิ่ม Keyboard Event Listener ดักจับปุ่ม `Escape` สำหรับการปิด Modal เพื่อเพิ่มความสะดวกในการใช้งานผ่านคีย์บอร์ด

### How I responded (PR #74):
> ขอบคุณสำหรับข้อเสนอแนะและการตรวจทานโค้ดอย่างละเอียดครับ ได้ดำเนินการปรับปรุงและตอบสนองทั้ง 2 ข้อเรียบร้อยแล้ว:
>
> 1. **บันทึกเอกสาร API Spec (`GET /api/staff/assignees`):**
>    - เพิ่มการบันทึก Endpoint `GET /api/staff/assignees` ใน `docs/lab-04/api-spec.md` (หัวข้อ 2.4 List Eligible Staff Assignees) พร้อมรายละเอียด Authorized Roles (`IT_STAFF`, `ADMINISTRATOR`), Request Headers และตัวอย่าง JSON Response ของเจ้าหน้าที่ที่พร้อมรับงานอย่างสมบูรณ์
>
> 2. **เพิ่ม Keyboard Event Listener ปิด Modal ด้วยปุ่ม `Escape`:**
>    - เพิ่ม `useEffect` ดักจับ `keydown` Event บน window เพื่อตรวจสอบ `e.key === "Escape"` เมื่อเปิด Record Modal หรือ Edit Modal อยู่ ให้เรียกสั่งปิด `closeModals()` พร้อม Clean-up Event Listener อย่างถูกต้องตามมาตรฐาน WCAG 2.1 AA Keyboard Accessibility
>
> ได้รันชุดทดสอบ Client Tests ผ่าน 5/5 tests และ Client Production Build ผ่าน 100% เรียบร้อยครับ

---

### Reviewer approval verdict (PR #74):
> ### Review — PR #74: Actions Taken UI (Issue #28)
> 
> ตรวจโค้ดจริงบน branch `feature/28-actions-taken-ui` รวมทั้ง commit `a4fc2d7` ล่าสุดเรียบร้อยแล้วค่ะ:
> 
> - ✅ **Actions Taken UI**: คอมโพเนนต์ `ActionsTakenSection` เชื่อมต่อกับหน้ารายละเอียดตั๋วทั้ง 2 ฝั่งถูกต้อง (Requester เป็น Read-only, Staff/Admin บันทึกและแก้ไขได้)
> - ✅ **Responsive & Theme**: แสดงผลแบบ Table บนจอใหญ่ และปรับเป็น Stacked Cards บนจอมือถือ (< 768px) ป้องกันหน้าจอล้น สไตล์และสีตรงตาม Zen Green Theme
> - ✅ **Optimistic Locking**: จัดการ 409 Conflict ได้นุ่มนวล มีปุ่ม Reload ข้อมูลล่าสุดโดยไม่ทำลายข้อมูลที่กรอกค้างไว้
> - ✅ **Accessibility & Contract**: มีการดักปุ่ม `Escape` เพื่อปิด Modal ครบถ้วน และเอกสาร `docs/lab-04/api-spec.md` บันทึก endpoint `GET /api/staff/assignees` ครบถ้วนแล้ว
> - ✅ **Tests**: ชุดทดสอบ `client/tests/lab-04/ActionsTaken.test.tsx` ผ่านครบ 5/5 tests

---

### Reviewer comment I received (PR #75):
> ตรวจทานโค้ดจริงบน branch `feature/29-ticket-workflow-and-resolution` เทียบกับ **Lab 4 Handout (§4.5, §8.4)** และ **Specification (§5.1)** แล้ว ภาพรวมการทำ Resolution Gate, Optimistic Locking และหน้าบ้านทำมาได้ดีมาก
>
> แต่พบ **1 จุดที่เป็น Spec Deviation ที่ฝั่ง Backend** ที่อยากให้ปรับแก้ให้ตรงกันก่อน:
>
> **`server/src/utils/workflow.ts` (L3, L7) ยังมี Transition ที่ไม่อนุญาตตามสเปกค้างอยู่:**
> - ใน `specification.md` §5.1 และใน `StaffTicketDetail.tsx`:
>   - `OPEN` สามารถเปลี่ยนได้แค่ `["IN_PROGRESS", "WAITING_FOR_REQUESTER", "CANCELLED"]` เท่านั้น (ไม่อนุญาตให้ข้ามไป `RESOLVED` โดยตรงตามหลัก Resolution Gate)
>   - `REOPENED` สามารถเปลี่ยนได้แค่ `["IN_PROGRESS"]` เท่านั้น
> - แต่ใน `server/src/utils/workflow.ts` ตอนนั้นยังเป็น:
>   - `OPEN: { to: ["IN_PROGRESS", "WAITING_FOR_REQUESTER", "RESOLVED", "CANCELLED"] }`
>   - `REOPENED: { to: ["IN_PROGRESS", "RESOLVED", "CANCELLED"] }`
>   ทำให้ถ้ามีการยิง API ตรง Backend จะยังยอมให้ `OPEN -> RESOLVED` ได้อยู่
>
> **จุดแนะนำเพิ่มเติม (Non-blocking):**
> - ใน `TicketDetailView.tsx` สามารถเพิ่ม Escape key handler สำหรับปิด Cancel Confirmation Modal ได้

### How I responded (PR #75):
> ดำเนินการแก้ไขทั้ง 2 จุดเรียบร้อยแล้วใน commit `b4d2b57`:
>
> 1. **แก้ Transition Matrix ใน `server/src/utils/workflow.ts` ให้ตรงกับ specification.md §5.1:**
>    - ปรับ `OPEN` ให้มี `to` เป็น `["IN_PROGRESS", "WAITING_FOR_REQUESTER", "CANCELLED"]` เท่านั้น โดยเอา `"RESOLVED"` ออก เพื่อบังคับให้ตั๋วต้องผ่านสถานะ `IN_PROGRESS` หรือ `WAITING_FOR_REQUESTER` ก่อนจะถึง `RESOLVED` ได้ ตามหลัก Resolution Gate
>    - ปรับ `REOPENED` ให้มี `to` เป็น `["IN_PROGRESS"]` เท่านั้น โดยเอา `"RESOLVED"` และ `"CANCELLED"` ออก ทำให้ตั๋วที่ถูก Reopen ต้องกลับไปอยู่สถานะ `IN_PROGRESS` เสมอ
>    - ตอนนี้ workflow.ts, StaffTicketDetail.tsx และ specification.md §5.1 สอดคล้องกัน 100% ป้องกัน `OPEN -> RESOLVED` Bypass ได้ทั้งในระดับ API และ UI
>    - ชุดทดสอบ `ticket-workflow.api.test.ts` ผ่านครบ 10/10 tests
>
> 2. **เพิ่ม Escape Key Handler ใน `TicketDetailView.tsx`:**
>    - เพิ่ม `useEffect` ดักจับ `keydown` Event บน window ตรวจสอบ `e.key === "Escape"` เมื่อ `showCancelModal` เป็น `true` และไม่อยู่ระหว่าง Cancelling เพื่อปิด Modal โดยเรียก `setShowCancelModal(false)` พร้อม Clean-up Event Listener อย่างถูกต้อง สอดคล้องกับ pattern เดียวกับ ActionsTakenSection.tsx

---

### Reviewer approval verdict (PR #75):
> ### Re-review — PR #75 (Round 2) —
>
> ตรวจ head ล่าสุด commit `b4d2b57` เรียบร้อยแล้วค่ะ จุดที่ขอให้แก้ไขได้รับการปรับปรุงอย่างถูกต้องและรวดเร็วมาก:
>
> - **Resolution Gate Strictly Enforced**: ปรับปรุง `server/src/utils/workflow.ts` ให้ตัด `RESOLVED` ออกจาก `OPEN` และตัด `RESOLVED`, `CANCELLED` ออกจาก `REOPENED` ทำให้ Transition Matrix สอดคล้องกับ `specification.md` §5.1 และ `StaffTicketDetail.tsx` ครบ 100% ปิดช่องโหว่การ bypass ข้ามขั้นตอนได้อย่างสมบูรณ์
> - **Keyboard Accessibility**: เพิ่ม `Escape` key event listener ใน `TicketDetailView.tsx` สำหรับปิด Cancel Confirmation Modal ช่วยให้การใช้งานผ่านคีย์บอร์ดสะดวกและตรงตามมาตรฐานสเปก
> - **Test Verification**: ยืนยันผลการทดสอบ Server Integration Tests (`ticket-workflow.api.test.ts`) ผ่านครบ 10/10 tests และ Client Component Tests ผ่านครบถ้วน

---


### PR #76 — Issue #30: Role-Based Dashboards (feature/30-role-based-dashboards)

### Reviewer comment I received (PR #76):
> ตรวจทานโค้ดบนสาขา `feature/30-role-based-dashboards` (commit `31e44a7`) เทียบกับข้อกำหนด Lab 4 Handout, `specification.md` (FR-08 ถึง FR-12, BR-11 ถึง BR-13), `api-spec.md` และ `tests.md` เรียบร้อยแล้ว
>
> **จุดที่ต้องแก้ไข (Request Changes ⛔):**
> 1. **การส่งต่อ Filter State จาก Dashboard ไปยัง Queue/Ticket Views (FR-11, AC-13):**
>    - ใน `client/src/App.tsx` ฟังก์ชัน Callback ของ Dashboard ทั้งสอง (`onNavigateToTickets`, `onNavigateToQueue`) มีการประกาศ parameter `_filter` ไว้ แต่ไม่ได้ส่งต่อไปยัง Component ลูก (`StaffTicketQueue` และ `MyTicketsView`) ทำให้เมื่อผู้ใช้คลิกการ์ดตัวชี้วัด เช่น "Unassigned" หรือ "Urgent Priority" หรือ "Waiting on You" ตัวหน้า Queue/Ticket View ปลายทางไม่ได้ถูก Pre-filter ตามการ์ดที่กดจริง
> 2. **โครงสร้าง Response ในเอกสาร `api-spec.md` ไม่ตรงกับการ Implement จริง (Spec Sync):**
>    - ใน `docs/lab-04/api-spec.md` (§4.1 และ §4.2) ยังระบุตัวอย่าง Response ของทั้ง Requester และ Staff Dashboard ในรูปแบบที่มี wrapper ซ้อนอยู่ (`metrics: { ... }`) และใช้ชื่อฟิลด์เก่า แต่ในโค้ดจริงเป็น Flat object ที่ root (`totalOpenTickets`, `unassignedTickets`, ฯลฯ) และใช้ชื่อฟิลด์ `myRecentTickets`
> 3. **ความสอดคล้องของนิยาม `myAssignedTickets` ในเอกสาร `api-spec.md`:**
>    - ใน `api-spec.md` §4.2 ระบุว่า `myAssignedTickets` นับเฉพาะสถานะ `NOT IN ('CLOSED', 'CANCELLED')` แต่ในโค้ดจริงใช้ `ACTIVE_STATUSES` (ไม่รวม `RESOLVED` ด้วย) อยากให้ปรับคำอธิบายให้ระบุเงื่อนไขให้ตรงกับที่โค้ดทำงานจริง
>
> **คำแนะนำเพิ่มเติม (Suggestions / Non-blocking 💡):**
> - ใน `server/src/app.ts` สำหรับ `GET /api/dashboard/staff` มีการดึง Ticket ทั้งหมดมาวนลูป group by ในหน่วยความจำ ในอนาคตหากมีตั๋วปริมาณมาก การใช้ Database Aggregation โดยตรงจะช่วยลด Memory Footprint ได้ดีขึ้น

### How I responded (PR #76):
> ดำเนินการปรับปรุงแก้ไขทั้ง 3 จุดเรียบร้อยแล้ว:
>
> 1. **เชื่อมต่อ Drill-Down Filtering ใน `client/src/App.tsx`, `StaffTicketQueue.tsx`, และ `MyTicketsView.tsx` (FR-11, AC-13):**
>    - เพิ่ม state `queueFilter` และ `ticketsFilter` ใน `App.tsx` เพื่อรับ filter key จากการคลิกการ์ดบน `StaffDashboard` และ `RequesterDashboard`
>    - ส่งต่อเป็น prop `initialFilter` ไปยัง `StaffTicketQueue` และ `MyTicketsView`
>    - เพิ่ม helper `resolveInitialFilters` ใน `StaffTicketQueue` เพื่อ map filter (`"unassigned"`, `"my-assigned"`, `"urgent"`, `"waiting"`) ไปยัง state ตัวกรอง (`assignedStaffId`, `itPriority`, `status`) ส่งผลให้คิวถูก Pre-filter ทันทีที่เปิดหน้า และเคลียร์ filter เมื่อคลิกเปลี่ยนแท็บจาก Header
>    - เพิ่ม helper `resolveMyTicketsFilter` ใน `MyTicketsView` เพื่อ map filter (`"waiting"`, `"resolved"`) เข้ากับ `selectedStatus` และเพิ่มตัวเลือกสถานะ (`OPEN`, `WAITING_FOR_REQUESTER`, `REOPENED`, `CANCELLED`) ใน status filter dropdown ให้ครบถ้วน
>
> 2. **ปรับปรุง Response Structure ใน `docs/lab-04/api-spec.md` (§4.1 และ §4.2) ให้ตรงกับ Implementation จริง:**
>    - ปรับ JSON Response ตัวอย่างของทั้ง Requester Dashboard (`GET /api/dashboard/requester`) และ Staff Dashboard (`GET /api/dashboard/staff`) ให้เป็น Flat root object โดยนำ wrapper `metrics: {}` ออก
>    - ปรับชื่อฟิลด์จาก `recentTickets` เป็น `myRecentTickets` พร้อมอธิบายโครงสร้างตั๋วที่คืนกลับมา
>    - อัปเดต Zero-State behavior ให้ตรงกับผลลัพธ์จริง (คืนค่าเคาน์เตอร์ 0 ทุกตัว และ `myRecentTickets: []`)
>
> 3. **ปรับแก้คำอธิบายการคำนวณ `myAssignedTickets` และ `ticketsByPriority` ใน `api-spec.md` §4.2:**
>    - ระบุชัดเจนว่านับเฉพาะ Active Workload สถานะ `IN ('NEW', 'OPEN', 'IN_PROGRESS', 'WAITING_FOR_REQUESTER', 'REOPENED')` (ตัด RESOLVED/CLOSED/CANCELLED ออก)
>    - ระบุเงื่อนไข `ticketsByPriority` ว่านับเฉพาะ active tickets เพื่อให้สอดคล้องกับพฤติกรรมจริงของระบบ
>
> 4. **การตรวจสอบและชุดทดสอบ:**
>    - Server Integration Tests (`dashboard.api.test.ts` และชุดทดสอบทั้งหมด 21 ไฟล์): ผ่านครบ **112/112 tests**
>    - Client Component Tests (`Dashboard.test.tsx`, `TicketWorkflow.test.tsx`, `ActionsTaken.test.tsx`): ผ่านครบ **13/13 tests**
>    - Client Build (`npm run build`): ผ่านฉลุย (TypeScript + Vite)

### Reviewer approval verdict (PR #76):
> **คำตัดสิน: Approved with comments ✅**
>
> ได้รับการตรวจทานซ้ำ (Re-review) หลังจากการปรับปรุงใน commit `b24c6df` และ `e0ff16c` ครบถ้วน:
> 1. เชื่อมต่อ Drill-Down Filtering ใน `App.tsx`, `StaffTicketQueue.tsx`, และ `MyTicketsView.tsx` ได้อย่างสมบูรณ์ รองรับการส่งต่อและรีเซ็ต filter state ตามการคลิกการ์ดตัวชี้วัด (AC-13, FR-11)
> 2. ปรับปรุงเอกสาร `docs/lab-04/api-spec.md` (§4.1 และ §4.2) ให้มีโครงสร้าง Flat JSON Response และชื่อฟิลด์ `myRecentTickets` สอดคล้องกับ Server implementation จริง
> 3. ปรับแก้นิยามการคำนวณ `myAssignedTickets` และ `ticketsByPriority` ให้ชัดเจนว่าประเมินเฉพาะ Active Tickets เท่านั้น
> 4. ยืนยันผลการทดสอบ Server Integration Tests (112/112 tests), Client Component Tests (13/13 tests) และ Client Production Build ผ่านครบถ้วน 100%
>
> อนุมัติการรวมโค้ด (Approved & Ready to Merge) เข้าสู่สาขา `lab4-staging` เรียบร้อยครับ

---

### Reviewer comment I received (PR #77):

> **คำตัดสิน: Changes Requested**
>
> จากการตรวจทานโค้ดในสาขา `feature/31-e2e-automated-testing-and-screenshots` (commit `d733c56`) พบจุดบกพร่องสำคัญที่ต้องขอให้ปรับปรุงก่อนอนุมัติ ดังนี้:
>
> 1. **[Critical] False Positive Test ใน `ticket-resolution.spec.ts` (E2E-02-B):**
>    - ในบรรทัด 219 มีการ Hardcode URL เรียก `/api/tickets/2/actions` แต่เนื่องจาก `POST /api/test/reset-db` ลบข้อมูลในตาราง Ticket โดยไม่รีเซ็ต SQLite autoincrement sequence ทำให้ ID ของตั๋ว `TKT-2026-000002` เปลี่ยนไปเป็นค่าอื่น
>    - โค้ดได้นำการทดสอบ 409 Concurrency Conflict ไปครอบไว้ใน `if (actionsData && actionsData.length > 0)` เมื่อ API คืนค่าว่าง ตัวเทสต์จึงข้ามการทดสอบ 409 และการ Assert แบนเนอร์แจ้งเตือนไปโดยสิ้นเชิง แต่เทสต์กลับรายงานผลว่าผ่าน (False Positive)
>    - ส่งผลให้รูปภาพ `03-concurrency-conflict-alert-chromium.png` ไม่ได้ถูกสร้างและขาดหายไปจากโฟลเดอร์ `artifacts/lab-04/screenshots/ticket-resolution/`
>    - **วิธีแก้:** ดึง `actionId` จาก attribute ของปุ่ม Edit บนหน้าจอโดยตรง (เช่น `edit-action-btn-${id}`), นำ `if (actionsData && actionsData.length > 0)` ออกเพื่อให้เทสต์ Fail หากไม่พบข้อมูล และรันสร้างรูปภาพ `03-concurrency-conflict-alert-*.png` Commit เข้ามาให้ครบถ้วน
>
> 2. **[Medium] หลีกเลี่ยง Conditional Assertions (`if`) ใน E2E Specs:**
>    - ใน `dashboards.spec.ts` (บรรทัด 66) มีการเขียน `if (await statusSelect.isVisible())` ครอบการ Assert ค่า Filter
>    - ใน `actions-taken-flow.spec.ts` (บรรทัด 206) มีการเขียน `if (await recordBtn.isVisible())` ครอบการตรวจ Touch target 44px
>    - **วิธีแก้:** ปรับเปลี่ยนจากการใช้ `if` เป็นการ Assert `await expect(...).toBeVisible()` โดยตรง เพื่อป้องกันการข้าม Assertion เงียบๆ เมื่อ Element ไม่แสดงผล

### How I responded (PR #77):

> ดำเนินการปรับปรุงแก้ไขทั้ง 2 จุดตามข้อเสนอแนะของ Reviewer เรียบร้อยแล้ว:
>
> 1. **แก้ไข False Positive และเพิ่มภาพ Screenshot 409 Concurrency Conflict (`ticket-resolution.spec.ts`):**
>    - สกัด `actionId` จาก attribute `id` ของปุ่ม Edit บนหน้าจอ (`edit-action-btn-${id}`) โดยตรง ทำให้ไม่ขึ้นกับ Ticket ID หรือ Autoincrement sequence
>    - นำ conditional wrapper `if (actionsData && actionsData.length > 0)` ออกทั้งหมด เพื่อให้มั่นใจว่าการจำลอง concurrent update และการตรวจสอบ HTTP 409 Concurrency Conflict (`#action-concurrency-conflict`) ถูกรันจริง 100% โดยไม่เกิด False Positive
>    - รันการทดสอบและสร้างไฟล์ภาพหลักฐาน `03-concurrency-conflict-alert-chromium.png` บันทึกเข้าโฟลเดอร์ `artifacts/lab-04/screenshots/ticket-resolution/` ครบถ้วน
>
> 2. **ยกเลิก Conditional Assertions (`if`) ในทุก E2E Spec files:**
>    - ใน `dashboards.spec.ts`: ปรับเป็น `await expect(statusSelect).toBeVisible()` และ `await expect(viewQueueBtn).toBeVisible()` โดยตรง ปราศจากการครอบด้วย `if`
>    - ใน `actions-taken-flow.spec.ts`: ปรับเป็น `await expect(recordBtn).toBeVisible()` ก่อนวัดขนาด Touch Target (>= 44px) ปราศจากการครอบด้วย `if`
>
> 3. **การตรวจสอบผลการทดสอบ (Verification):**
>    - ชุดทดสอบ Playwright E2E ทั้ง 8/8 tests บน Chromium ผ่าน 100%
>    - ชุดทดสอบ Vitest Server ทั้ง 115/115 tests ผ่าน 100%
>    - Client Production Build ผ่าน 0 errors

### Reviewer approval verdict (PR #77):

> ### คำตัดสินการตรวจทานรอบสุดท้าย (Final Review Verdict)
>
> ตรวจสอบการปรับปรุงแก้ไขใน commit `1978bb8` ครบถ้วนทุกจุดแล้ว:
>
> 1. **แก้ไข False Positive ใน Concurrency Conflict Test (AC-09, E2E-02-B):**
>    - มีการดึง `actionId` จากปุ่ม Edit บนหน้าจอโดยตรง ทำให้ไม่พึ่งพา Autoincrement sequence ของฐานข้อมูล
>    - นำเงื่อนไข `if` ที่ครอบการทดสอบออกทั้งหมด ทำให้กระบวนการจำลอง HTTP 409 Concurrency Conflict (`#action-concurrency-conflict`) ถูกรันจริงและ Assert ผลอย่างแม่นยำ
>    - เพิ่มไฟล์ภาพหลักฐาน `03-concurrency-conflict-alert-chromium.png` เข้าสู่ Repository เรียบร้อย
>
> 2. **ยกเลิก Conditional Assertions (`if`) ใน E2E Specs:**
>    - ใน `dashboards.spec.ts` และ `actions-taken-flow.spec.ts` มีการ Assert `toBeVisible()` นำหน้าโดยตรง ปราศจากการใช้ `if` ครอบ ทำให้ไม่มีการข้าม Assertion เงียบๆ อีกต่อไป
>
> 3. **ความสมบูรณ์ของการทดสอบและหลักฐาน:**
>    - ชุดทดสอบ Playwright E2E ทั้ง 8/8 tests, Performance-Smoke tests (PERF-SMK-01 ถึง 03) และ Server Vitest 115/115 tests ผ่านครบถ้วน 100%
>    - ภาพหลักฐาน Screenshot ครบทั้ง 12 ภาพครอบคลุม Desktop, Tablet, Mobile และ Concurrency Alert

---

### Reviewer comment I received (PR #78):

> ### Reviewer Comment (PR #78)
>
> **คำตัดสิน: Changes Requested**
>
> จากการตรวจทานโค้ดในสาขา `feature/32-visual-style-accessibility-hardening` (commit `d131ee7`) พบจุดบกพร่องสำคัญที่ต้องขอให้ปรับปรุงก่อนอนุมัติ ดังนี้:
>
> #### 1. [Medium] ข้อผิดพลาด TypeScript Compilation บน Server (`server/src/app.ts`):
> เมื่อรันการทดสอบ Type checking และ Build ฝั่ง Server ด้วย `npm --prefix server run build` (`tsc`) พบ Type Error 5 จุด ทำให้กระบวนการ Build ล้มเหลว (Exit Code 1):
> ใน `server/src/app.ts` (บรรทัด 2072, 2134, 2137, 2140) ตัวแปร `ACTIVE_STATUSES` และ `ALL_STATUSES` ถูกระบุเป็น `string[]` ทั่วไป ซึ่งไม่ตรงกับ Prisma enum `TicketStatus[]` ที่ Prisma Client กำหนดไว้สำหรับฟิลด์ `currentStatus`
> ใน `server/tests/lab-04/performance-smoke.test.ts` (บรรทัด 61) ค่า `currentStatus` ถูกส่งเป็น `string` ทั่วไป ทำให้เกิด Type Mismatch กับ `TicketStatus`
> **วิธีแก้:** นำเข้า `TicketStatus` จาก `@prisma/client` ใน `server/src/app.ts` และระบุ Type ให้ชัดเจน (`const ACTIVE_STATUSES: TicketStatus[] = ...`, `const ALL_STATUSES: TicketStatus[] = ...`) และ cast ค่าใน `performance-smoke.test.ts` ให้เป็น `TicketStatus` เพื่อให้ `npm --prefix server run build` ผ่าน 0 errors
>
> #### 2. [Low] ขาด Keyboard Focus Trap ใน Modal Dialogs (`ActionsTakenSection.tsx`):
> ใน `ActionsTakenSection.tsx` หน้าต่าง Modal ทั้ง Record Action (`#record-action-modal`) และ Edit Action (`#edit-action-modal`) มีการใส่ `role="dialog"`, `aria-modal="true"` และปุ่มปิด `Escape` ครบถ้วนแล้ว
> อย่างไรก็ตาม เมื่อผู้ใช้กดปุ่ม `Tab` บนคีย์บอร์ดผ่านปุ่มสุดท้ายภายใน Modal ("Save Action Taken" หรือ "Cancel") โฟกัสสามารถหลุดออกไปยัง Element บนหน้าเว็บด้านหลัง Modal ได้ ซึ่งขัดกับมาตรฐาน Accessible Modal Dialog (WCAG 2.4.3 Focus Order)
> **วิธีแก้:** เพิ่มการดักจับ Event `Tab` / `Shift + Tab` ภายใน Modal เพื่อให้ Focus วนลูปอยู่เฉพาะภายใน Interactive Elements ของ Modal Dialog เท่านั้น จนกว่าจะปิดหน้าต่าง

### How I responded (PR #78):

> ดำเนินการปรับปรุงแก้ไขทั้ง 2 จุดตามข้อเสนอแนะของ Reviewer เรียบร้อยแล้ว:
>
> 1. **แก้ไข TypeScript Compilation Errors ฝั่ง Server (`app.ts` และ `performance-smoke.test.ts`):**
>    - นำเข้า `TicketStatus` enum จาก `@prisma/client` ใน `server/src/app.ts`
>    - ประกาศ Type ชัดเจนให้กับ `ACTIVE_STATUSES: TicketStatus[]` และ `ALL_STATUSES: TicketStatus[]`
>    - Cast ค่า `currentStatus` ใน `server/tests/lab-04/performance-smoke.test.ts` ให้เป็น `TicketStatus`
>    - ยืนยันการรัน `npm --prefix server run build` (`tsc`) ผ่านสมบูรณ์ 0 errors
>
> 2. **เพิ่ม Accessible Keyboard Focus Trap ให้กับ Modal Dialogs (`ActionsTakenSection.tsx`):**
>    - เพิ่มการดักจับ Event `Tab` และ `Shift + Tab` ภายใน `useEffect` ของ `ActionsTakenSection.tsx`
>    - ควบคุมให้ Keyboard Focus วนลูปอยู่เฉพาะภายใน Focusable elements ของ Modal ที่เปิดอยู่ (`#record-action-modal` หรือ `#edit-action-modal`) ป้องกัน Focus หลุดออกไปนอก Modal ตามมาตรฐาน WCAG 2.4.3
>
> 3. **ผลการทดสอบและการ Build:**
>    - `npm --prefix server run build`: ผ่าน 0 errors (Exit code 0)
>    - `npm --prefix client run build`: ผ่าน 0 errors (Exit code 0)
>    - `npm test --prefix server`: ผ่าน 115/115 tests (22 test files)
>    - `npm test --prefix client`: ผ่าน 52/52 tests (22 test files)

### Reviewer approval verdict (PR #78):

> ### คำตัดสินการตรวจทานรอบสุดท้าย (Final Review Verdict)
>
> ตรวจสอบการปรับปรุงแก้ไขใน commit `6a5f03a` เรียบร้อยแล้ว ครบถ้วนตามมาตรฐานและข้อกำหนดทุกประการ:
>
> 1. **แก้ไข Server TypeScript Compilation (`app.ts` และ `performance-smoke.test.ts`):**
>    - มีการนำเข้าและระบุ Type ของ `TicketStatus` Prisma enum สำหรับ `ACTIVE_STATUSES` และ `ALL_STATUSES` อย่างชัดเจน
>    - คำสั่ง build ฝั่ง Server (`npm --prefix server run build`) ผ่านสมบูรณ์ 0 errors ปราศจาก Type Error
>
> 2. **เพิ่ม Accessible Modal Focus Trap (`ActionsTakenSection.tsx`):**
>    - มีการดักจับ Event `Tab` และ `Shift + Tab` เพื่อล็อก Keyboard Focus ให้อยู่เฉพาะภายใน Focusable elements ของ Modal Dialog ที่เปิดอยู่
>    - รองรับการวนลูป (Focus Loop) ระหว่าง element แรกและสุดท้ายอย่างถูกต้องตามเกณฑ์มาตรฐาน WCAG 2.4.3 Focus Order
>
> 3. **ความสมบูรณ์ของการทดสอบและหลักฐาน Visual Evidence:**
>    - ทั้ง Server Build และ Client Build ผ่านฉลุย 0 errors
>    - ชุดทดสอบทั้งหมด 115 Server tests, 52 Client tests และ 24 Playwright E2E tests ผ่านครบถ้วน 100%
>    - ภาพหลักฐาน Screenshot ครบทั้ง 36 ภาพครอบคลุม Chromium Desktop, Tablet และ Mobile ทุก Subsystems

### Reviewer approval verdict (PR #79):

> ### ผลการตรวจทาน Peer Review
>
> ### สรุปผลการตรวจทานเชิงลึก (Audit Findings)
>
> #### 1. เอกสารบันทึกการรีวิว (`docs/lab-04/reviewer.md`) — ครบถ้วนตามเกณฑ์ Handout §10 & Part 1
> - **ตารางสรุป PRs:** บันทึกและอัปเดตสถานะของ PR ทั้งหมดตั้งแต่ PR #72 ถึง #78 (ได้รับการ Approve พร้อมบันทึก Comment ตรวจรับจริงและการแก้ไข) และระบุ PR #79 เป็นขั้นตอน Final Release Integration ไว้อย่างถูกต้อง
> - **การแบ่งบทบาท:** มีการแยกส่วนระหว่าง **"Tasks Authored"** โดย @phatthidawadi และ **"Tasks Reviewed"** โดยคู่ Partner (@chanya06) ไว้อย่างชัดเจน ถูกต้องตามเกณฑ์การประเมิน Part 1
>
> #### 2. เอกสารบันทึกการใช้งาน AI (`docs/lab-04/ai-use.md`) — สมบูรณ์ตามเกณฑ์ Handout §10 & Part 4
> - **การระบุโมเดล:** ระบุเครื่องมือ LLM ที่ใช้งานจริงอย่างเป็นทางการ (`Gemini 3.8 Flash & Gemini 3.6 Flash via Antigravity`)
> - **Key Prompts ทั้ง 10 ข้อ:** ถอดคำว่า `*(Planned)*` ออกทั้งหมด และบันทึกคำสั่งสำคัญ 10 ข้อที่สะท้อนการตัดสินใจทางสถาปัตยกรรมและการแก้ไขปัญหาหน้างานจริง (เช่น การออกแบบ Schema และ Optimistic Concurrency 409, การบังคับ Status Matrix, การทำ Dynamic DOM Selector แก้ปัญหา SQLite autoincrement ใน E2E, และการใส่ Focus Trap)
> - **บทวิเคราะห์ (Reflection):** มีการถอดบทเรียนเปรียบเทียบระหว่าง **Spec-Agent** และ **Coding-Agent** อย่างลึกซึ้ง ครอบคลุมทั้งประเด็น Type Safety ของ Prisma enums, การดักจับ False Positives ในเทสต์ E2E และการรองรับ Accessibility ตามเกณฑ์ WCAG 2.4.3
>
> #### 3. โครงสร้างไฟล์ทดสอบตรงตามเกณฑ์ 100% (Handout §12 Minimum Structure)
> - ดำเนินการแยกไฟล์ทดสอบ Dashboard ออกเป็น 4 ไฟล์ย่อยตรงตามหน้า 9 ของ Handout:
>   - `server/tests/lab-04/requester-dashboard.api.test.ts` (DASH-API-01 ถึง 04)
>   - `server/tests/lab-04/staff-dashboard.api.test.ts` (DASH-API-05 ถึง 08)
>   - `client/tests/lab-04/RequesterDashboard.test.tsx` (UI-DASH-01 ถึง 03)
>   - `client/tests/lab-04/StaffDashboard.test.tsx` (UI-DASH-04 ถึง 05)
> - เพิ่มไฟล์ `artifacts/lab-04/.gitkeep` ตามข้อกำหนดโครงสร้างขั้นต่ำเรียบร้อย
>
> #### 4. คลังภาพหลักฐาน Visual Evidence (Handout §10 & §14)
> - โฟลเดอร์ `artifacts/lab-04/screenshots/` จัดเก็บภาพหลักฐานครบถ้วน **36 ภาพ** ครอบคลุมทั้ง 4 Subsystems บนทั้ง 3 Viewports (Desktop 1280x720, Tablet 768x1024, Mobile 375x667)
>
> #### 5. สุขภาพของระบบและการทดสอบทั้งหมด (Build & Test Health)
> - **Server Build (`tsc`):** ผ่านสมบูรณ์ 0 errors
> - **Client Build (`vite build`):** ผ่านสมบูรณ์ 0 errors
> - **Server Vitest Tests:** ผ่านครบ 115/115 tests (22 test suites)
> - **Client Vitest Tests:** ผ่านครบ 52/52 tests (22 test suites)
> - **Playwright E2E Tests:** ผ่านครบ 24/24 tests บนทุกเบราว์เซอร์และวิวพอร์ต

### Reviewer approval verdict (PR #80):

> ### Final Release Review: Approved for Production Merge! (PR #80)
>
> ---
>
> ### สรุปผลการตรวจสอบความพร้อมในการ Release (Final Release Audit)
>
> 1. **Staged Integration & Git Workflow (Part 1 - 10/10 คะแนน):**
>    - การผสานสาขามีความต่อเนื่อง สอดคล้องตามมาตรฐาน Feature Branch Workflow (PR #72 ถึง #79 ถูกตรวจสอบและรวมเข้าสู่ `lab4-staging` ตามลำดับ)
>    - เอกสาร `docs/lab-04/reviewer.md` บันทึกผลการตรวจทาน PRs ครบทั้ง 8 ฉบับ อยู่ในสถานะ **Approved with comments** ครบถ้วน 100% พร้อมบทบาท Authored / Reviewed ที่ชัดเจน
>    - การผสานโค้ดเข้าสู่ `main` เป็นแบบ **Clean Merge ปราศจาก Conflict ใดๆ (0 Conflicts)**
>
> 2. **Engineering Contracts & Traceability (Parts 2 & 3 - 15/15 คะแนน):**
>    - เอกสาร Spec (`specification.md`, `api-spec.md`, `ui-spec.md`, `tests.md`) มีความสอดคล้องตามหลัก Single Source of Truth
>    - โครงสร้างไฟล์ทดสอบเป็นไปตามข้อกำหนดขั้นต่ำใน Handout §12 ทุกประการ
>    - ชุดทดสอบทั้งหมดทำงานได้อย่างเสถียร (Idempotent):
>      - **Server Tests:** ผ่านครบ 115/115 tests (22 test suites)
>      - **Client Tests:** ผ่านครบ 52/52 tests (22 test suites)
>      - **Playwright E2E Tests:** ผ่านครบ 24/24 tests บนทั้ง 3 Viewports (Desktop, Tablet, Mobile)
>      - **TypeScript & Production Builds:** ทั้ง Server (`tsc`) และ Client (`vite build`) ผ่านสมบูรณ์ 0 errors
>
> 3. **AI Use Reflection & Hardening (Parts 4 & 9 - 10/10 คะแนน):**
>    - เอกสาร `docs/lab-04/ai-use.md` บันทึก Key Prompts 10 ข้อและบทวิเคราะห์เชิงวิศวกรรมไว้อย่างลึกซึ้ง
>    - เสริมความปลอดภัยและการเข้าถึง (Accessibility) ด้วย Modal Focus Trap ตามเกณฑ์ WCAG 2.4.3 และป้องกันการเกิด Stale Update ด้วย HTTP 409 Conflict
>
> 4. **Working Subsystems & Visual Evidence (Parts 5, 6, 7, 8 - 25/25 คะแนน):**
>    - ฟังก์ชัน Actions Taken, Role Dashboards, Drill-down Navigation และ Advisory Resolution Gate ทำงานได้อย่างถูกต้องสมบูรณ์
>    - จัดเก็บไฟล์ภาพหลักฐานครบถ้วนทั้ง 36 ภาพใน `artifacts/lab-04/screenshots/`

---

## Pull Requests I reviewed (authored by my partner)

**Partner I reviewed:** Patitaya Kaewwichain 67070505220 — GitHub: [@lmaybelgracel](https://github.com/lmaybelgracel) (https://github.com/lmaybelgracel/toktickit)

| PR | Branch | My review verdict |
|---|---|---|
| [PR #69](https://github.com/lmaybelgracel/TokTickit/pull/69) | `feature/27-sprint4-spec-and-tests` | Approved (Round 1: Changes Requested, Round 2: Approved) |
| [PR #70](https://github.com/lmaybelgracel/TokTickit/pull/70) | `feature/28-database-and-seed` | Approved (Round 1: Changes Requested, Round 2: Approved) |
| [PR #71](https://github.com/lmaybelgracel/TokTickit/pull/71) | `feature/29-actions-taken-api` | Approved (Round 1: Changes Requested, Round 2: Approved) |
| [PR #72](https://github.com/lmaybelgracel/TokTickit/pull/72) | `feature/30-actions-taken-ui` | Approved (Round 1: Changes Requested, Round 2: Approved) |
| [PR #73](https://github.com/lmaybelgracel/TokTickit/pull/73) | `feature/31-status-workflow-and-resolution` | Approved (Round 1: Changes Requested, Round 2: Approved) |
| [PR #74](https://github.com/lmaybelgracel/TokTickit/pull/74) | `feature/32-dashboards-api` | Approved (Round 1: Changes Requested, Round 2: Approved) |
| [PR #75](https://github.com/lmaybelgracel/TokTickit/pull/75) | `feature/33-staff-dashboard-ui` | Approved (Round 1: Changes Requested, Round 2: Changes Requested, Round 3: Approved) |
| [PR #76](https://github.com/lmaybelgracel/TokTickit/pull/76) | `feature/34-requester-dashboard-ui` | Approved (Round 1: Changes Requested, Round 2: Changes Requested, Round 3: Approved) |
| [PR #77](https://github.com/lmaybelgracel/TokTickit/pull/77) | `feature/35-e2e-automation-and-audit` | Approved (Round 1: Changes Requested, Round 2: Changes Requested, Round 3: Approved) |

---

### My review comment for partner's PR #69 (Issue 27):
> ### ผลการตรวจประเมิน Issue 27 - Sprint 4 Engineering Contract & Specification
> 
> จากการตรวจสอบเอกสารอย่างละเอียดใน PR #69 (Commit `8786e8b`) ยังมีจุดบกพร่องที่ต้องขอให้แก้ไขเพิ่มเติมก่อนจึงจะสามารถอนุมัติได้ ดังนี้:
> 
> 1. **[docs/lab-04/api-spec.md] การใช้ชื่อฟิลด์สถานะตั๋ว (`currentStatus` vs `status`):**
>    - ในตัวอย่าง JSON Response ของ Requester Dashboard (บรรทัด 148), Staff Queue Activity (บรรทัด 197) และ Status Transition (บรรทัด 240) ยังใช้ชื่อฟิลด์ว่า `"status"`
>    - เนื่องจากใน Prisma Schema และคอมโพเนนต์เดิมของ Lab 2 และ 3 (`api.ts`, `TicketDetail.tsx`, `StaffTicketQueue.tsx`) ใช้งานชื่อฟิลด์ว่า `currentStatus` 
>    - **สิ่งที่ต้องแก้:** รบกวนปรับชื่อฟิลด์ใน `api-spec.md` ให้เป็น `currentStatus` ให้ตรงกันทั้งระบบ เพื่อป้องกันไม่ให้เกิด Regression ในฝั่ง Client ครับ
> 
> 2. **[docs/lab-04/api-spec.md] การตรวจสอบกรณีขาด `knownUpdatedAt`:**
>    - ในหัวข้อ 1.1 และ 4.1 มีการระบุ `409 Conflict` ชัดเจน แต่ยังไม่ได้ระบุพฤติกรรมเมื่อ Client ไม่ได้แนบ `knownUpdatedAt` มาใน Body
>    - **สิ่งที่ต้องแก้:** ระบุให้ชัดเจนในสเปกว่า `knownUpdatedAt` เป็นฟิลด์ Mandatory หาก Client ไม่ส่งมาให้ปฏิเสธด้วย `422 Unprocessable Entity: knownUpdatedAt is required` เพื่อป้องกันการ Bypass Stale Update Check
> 
> 3. **[docs/lab-04/reviewer.md] สถานะการรีวิว:**
>    - อัปเดตบันทึกข้อเสนอแนะและสถานะใน `docs/lab-04/reviewer.md` ให้สะท้อนการทำงานของ PR #69
> 
> **คำตัดสิน: Request Changes** — รบกวนแก้ไข 3 จุดนี้และพุชคอมมิตใหม่

### How partner responded (PR #69):
> 1. **Ticket Status Field Name (`currentStatus` vs `status`):** Updated `docs/lab-04/api-spec.md` and `docs/lab-04/specification.md` to use `currentStatus` uniformly across all response payloads, request bodies, and calculation rules (`BR-12`, `BR-16`, `BR-17`), with backward-compatible alias parsing noted for controllers.
> 2. **Mandatory `knownUpdatedAt` Validation:** Explicitly specified in Section 1 and Section 4 of `docs/lab-04/api-spec.md` that `knownUpdatedAt` is a mandatory field for all ticket/action mutation payloads; omitting it returns HTTP `422 Unprocessable Entity: knownUpdatedAt is required`. Updated `specification.md` (`BR-13`, `AC-08`) and added test case `API-WORK-06` in `docs/lab-04/tests.md`.
> 3. **Reviewer Record Status:** Updated `docs/lab-04/reviewer.md` with Round 1 Changes Requested verdict, verbatim quotes, and detailed responses.

### My approval review comment for partner's PR #69:
> ### ผลการตรวจสอบรอบที่ 2 (Round 2 Peer Review Verification)
> 
> - **Commit ที่ตรวจสอบ:** `712f681`
> - **ผลการรันชุดทดสอบ Regression Labs 1–3:** **29/29 ไฟล์ผ่าน (204/204 เทสต์ ผ่านครบ 100%, ข้าม 0)**
> - **สถานะข้อค้นพบ:** ได้รับการแก้ไขที่ต้นเหตุครบถ้วนทุกข้อ (Zero remaining findings)
> 
> #### ผลการตรวจยืนยันในโค้ดและเอกสาร:
> 1. **[Resolved] Ticket Status Field Naming (`currentStatus`):** ใน `api-spec.md` และ `specification.md` ปรับเปลี่ยนมาใช้ `currentStatus` ตรงตาม Prisma Schema และโค้ดเดิมของ Client เรียบร้อย พร้อมระบุการรองรับ backward-compatible alias ป้องกันความเสี่ยงเรื่อง Regression ได้ 100%
> 2. **[Resolved] Mandatory `knownUpdatedAt` Validation (422):** ระบุข้อกำหนดบังคับส่ง `knownUpdatedAt` ในการทำ Mutation ชัดเจน หากไม่ส่งมาจะถูกปฏิเสธด้วย `422 Unprocessable Entity` พร้อมทั้งเพิ่มรหัสทดสอบ `API-WORK-06` ใน `tests.md` รองรับครบถ้วน
> 3. **[Resolved] Reviewer Record Tracking:** บันทึกข้อเสนอแนะรอบแรกและการตอบสนองใน `reviewer.md` อัปเดตครบถ้วน ตรงตามหลักฐานจริง
> 
> **คำตัดสิน: Approve** — เอกสารข้อกำหนด Sprint 4 ผ่านการตรวจสอบความถูกต้องและรัดกุมครบถ้วน ปราศจากข้อติดค้าง

---

### My review comment for partner's PR #70 (Issue 28):
> ### ผลการตรวจประเมิน Issue 28 - Database & Seed (Request Changes)
> 
> โครงสร้าง Prisma Schema, ไฟล์ Migration SQL และสคริปต์ Seed Data ทำออกมาได้ดีมากและผ่านการทดสอบ 215 เทสต์ครบ 100% โดยไม่มีข้อผิดพลาด
> 
> อย่างไรก็ตาม มีจุดที่ต้องขอให้แก้ไขในเอกสาร Test Plan ก่อนการอนุมัติ:
> 
> 1. **[docs/lab-04/tests.md] ความไม่สอดคล้องของเส้นทางไฟล์ทดสอบ (Traceability Mismatch):**
>    - ในตารางที่ 2 และตารางที่ 3 ของ `docs/lab-04/tests.md` ระบุว่าชุดทดสอบ `API-MIG-01` (AC-14: Idempotent database seed execution) จะอยู่ที่ไฟล์ `server/tests/lab-04/actions-taken.api.test.ts`
>    - แต่ไฟล์ทดสอบจริงที่ส่งมอบมาใน PR นี้ตั้งชื่อว่า `server/tests/lab-04/database-schema-seed.test.ts`
>    - **สิ่งที่ต้องแก้:** รบกวนอัปเดตพาธไฟล์ของ `API-MIG-01` ใน `docs/lab-04/tests.md` ให้เป็น `server/tests/lab-04/database-schema-seed.test.ts` เพื่อให้สอดคล้องกับไฟล์จริงในคลังโค้ดตามเกณฑ์การตรวจของ Handout Part 3
> 
> 2. **[docs/lab-04/reviewer.md] อัปเดตสถานะการรีวิว:**
>    - อัปเดตบันทึกประวัติการรีวิวของ Issue 28 / PR #70 ให้สะท้อนสถานะปัจจุบัน
> 
> **คำตัดสิน: Request Changes** — รบกวนปรับแก้พาธใน `tests.md` ให้ตรงกัน

### How partner responded (PR #70):
> 1. **Test File Path Mismatch for API-MIG-01:** Updated both Table 2 and Table 3 in `docs/lab-04/tests.md` to reference `server/tests/lab-04/database-schema-seed.test.ts` and marked status as `Passed`.
> 2. **Reviewer Log Update:** Recorded Round 1 Changes Requested verdict, verbatim review comments, and response actions in `docs/lab-04/reviewer.md`.

### My approval review comment for partner's PR #70:
> ### ผลการตรวจสอบซ้ำรอบที่ 2 (Round 2 Peer Review Verification)
> 
> - **Commit ที่ตรวจสอบ:** `dfe4a95`
> - **ผลการทดสอบอัตโนมัติทั้งระบบ:** **ผ่าน 30/30 ไฟล์ (215/215 เทสต์ ผ่านครบ 100%, ข้าม 0)**
> - **สถานะข้อค้นพบ:** ได้รับการแก้ไขที่ต้นเหตุครบถ้วนทุกข้อ (Zero remaining findings)
> 
> #### ผลการตรวจยืนยันในโค้ดและเอกสาร:
> 1. **[Resolved] Test Path Traceability Parity:** ใน `docs/lab-04/tests.md` ตารางที่ 2 และ 3 ได้อัปเดตพาธของ `API-MIG-01` เป็น `server/tests/lab-04/database-schema-seed.test.ts` ตรงกับไฟล์ที่ส่งมอบจริงในคลังโค้ด พร้อมระบุสถานะ `Passed` ครบถ้วน
> 2. **[Resolved] Reviewer Record Tracking:** บันทึกข้อเสนอแนะรอบแรกและการตอบสนองใน `docs/lab-04/reviewer.md` อัปเดตครบถ้วน ตรงตามหลักฐานจริง
> 
> **คำตัดสิน: Approve** — งานฐานข้อมูล โมเดล ActionTaken, Migration SQL และ Idempotent Seed Data สำหรับ Issue 28 ผ่านการตรวจสอบความถูกต้องและรัดกุมครบถ้วน

---

### My review comment for partner's PR #71 (Issue 29):
> ### ผลการตรวจประเมิน Issue 29 - Actions Taken Backend REST API (Request Changes)
> การ implement endpoint ทั้ง 3 ตัว (GET, POST, PATCH) พร้อม optimistic concurrency, inactive user guard, role-based authorization และ test suite 15 tests ทำออกมาได้ดีและครบถ้วนมาก
> 
> อย่างไรก็ตาม มีจุดที่ต้องขอให้แก้ไขก่อนการอนุมัติ:
> 
> 1. **[server/src/routes/actions.routes.ts] ขาดการตรวจ lower-bound ของ actionDateTime (BR-05 Violation):**
> - ตาม **BR-05** ใน docs/lab-04/specification.md ระบุว่า actionDateTime ที่ client ส่งมาต้องอยู่ **"between the ticket's createdAt timestamp and the current server timestamp"**
> - ปัจจุบัน POST handler และ PATCH handler ตรวจเฉพาะ upper-bound (future dates) เท่านั้น: if (parsed.getTime() > Date.now() + 60000) แต่ไม่มีการตรวจว่า parsed >= ticket.createdAt เลย
> - ทำให้สามารถส่ง actionDateTime: "1970-01-01T00:00:00Z" ผ่านได้โดยไม่มี error ทั้งที่วันดังกล่าวเกิดก่อน ticket จะถูกสร้าง
> - **สิ่งที่ต้องแก้:**
> - ใน POST handler: เพิ่ม createdAt: true ใน ticket select แล้วตรวจ parsed < ticket.createdAt → reject 422
> - ใน PATCH handler: ปัจจุบันไม่ได้ fetch ticket เลยในส่วน actionDateTime validation รบกวน fetch ticket มาเพื่อนำ createdAt มาใช้ตรวจ lower-bound ด้วย
> 
> 2. **[server/src/routes/actions.routes.ts] Dev-requester header fallback ยังคงอยู่ใน Lab 4 routes:**
> - ฟังก์ชัน requireAuthenticatedUser มีการ copy x-development-requester-id fallback มาจาก Lab 1–2 ไว้ด้วย
> - เนื่องจาก authenticateToken middleware ถูก mount ใน app.ts ก่อนแล้ว การมี header-based fallback ซ้ำใน Lab 4 routes ทำให้สามารถส่ง header นี้เพื่อ bypass JWT authentication และ impersonate requester ID ใดก็ได้โดยไม่ต้องมี token
> - **สิ่งที่ต้องแก้:** รบกวนลบ dev-header block ออกจาก requireAuthenticatedUser ให้เหลือเพียง if (req.user) check และ return 401 หากไม่มี user
> 
> 3. **[server/tests/lab-04/actions-taken.api.test.ts] ขาด test case สำหรับ actionDateTime ก่อน ticket.createdAt:**
> - Test suite ครอบคลุม future date ✅ แต่ยังขาด test ที่ตรวจ lower-bound ตาม BR-05
> - **สิ่งที่ต้องแก้:** รบกวนเพิ่ม test case ที่ส่ง actionDateTime: "1970-01-01T00:00:00.000Z" และ expect 422 Unprocessable Entity พร้อมกับการแก้ implementation ในข้อ 1 ครับ
> 
> **คำตัดสิน: Request Changes** — รบกวนแก้ไขทั้ง 3 จุดข้างต้น

### How partner responded (PR #71):
> 1. **Missing Lower-Bound Check for actionDateTime (BR-05):** Updated POST handler to include `createdAt: true` in ticket select and reject with HTTP 422 (`details: ["actionDateTime: Cannot be earlier than ticket creation date."]`) if `parsed < ticket.createdAt`. Updated PATCH handler to include `ticket: { select: { id: true, createdAt: true } }` on `existingAction` and reject with HTTP 422 if updated `actionDateTime < existingAction.ticket.createdAt`.
> 2. **Development Requester Header Fallback in Lab 4 Routes:** Completely removed the development header fallback block from `requireAuthenticatedUser`, strictly enforcing JWT verification through `req.user` and returning HTTP 401 Unauthorized for unauthenticated requests.
> 3. **Automated Tests for BR-05 Lower-Bound and Header Rejection:** Added automated tests in `server/tests/lab-04/actions-taken.api.test.ts` verifying that `POST` and `PATCH` reject timestamps earlier than `ticket.createdAt` with HTTP 422, and verifying that `x-development-requester-id` without token is rejected with HTTP 401 (expanding suite to 18/18 passing tests).

### My approval review comment for partner's PR #71:
> ### ผลการตรวจประเมินรอบที่ 2 (Re-review Round 2) 
> 
> ขอบคุณสำหรับการแก้ไขโค้ดและชุดทดสอบอย่างรวดเร็วและตรงจุดใน commit `4810a75` ได้ดำเนินการ Re-review ในระดับโค้ดจริงและรัน Full Regression Test Suite เรียบร้อยแล้ว มีผลการตรวจดังนี้:
> 
> 1. **การตรวจสอบ Lower-Bound ของ `actionDateTime` (BR-05):**
>    - ใน `server/src/routes/actions.routes.ts` ทั้ง `POST /api/tickets/:id/actions` และ `PATCH /api/actions/:id` มีการดึง `ticket.createdAt` มาเปรียบเทียบ หากระบุเวลาก่อนหน้าวันสร้างตั๋ว จะถูกปฏิเสธด้วย HTTP 422 Unprocessable Entity ตามสเปกอย่างถูกต้อง
> 2. **ความปลอดภัยของ Authentication Middleware:**
>    - นำโค้ดดัก `x-development-requester-id` ออกจาก `requireAuthenticatedUser` เรียบร้อยแล้ว ทำให้ไม่มีช่องโหว่ในการส่ง header จำลองผู้ใช้โดยไม่มี JWT Token อีกต่อไป
> 3. **ชุดการทดสอบอัตโนมัติ (Automated Tests):**
>    - เพิ่ม test cases ครอบคลุมทั้งกรณีส่งเวลา 1970 ใน create/update และกรณีส่ง dev header โดยไม่มี token ได้อย่างครบถ้วน (Actions Taken suite ผ่านครบ 18/18 เทสต์)
> 4. **การทดสอบความเข้ากันได้ย้อนหลัง (Regression Suite):**
>    - รัน Full Test Suite ทั้งระบบ: Server ผ่าน 19 ไฟล์ (181/181 เทสต์) และ Client ผ่าน 12 ไฟล์ (52/52 เทสต์) รวมทั้งสิ้น 233 เทสต์ผ่าน 100% โดยไม่มีข้อผิดพลาด
> 
> **คำตัดสิน: Approve** — งาน Actions Taken Backend REST API ของ Issue 29 มีคุณภาพ สมบูรณ์

---

### My review comment for partner's PR #72 (Issue 30):
> ### ผลการตรวจประเมิน Issue 30 - Actions Taken Frontend UI & Ticket Detail Integration
> 
> จากการตรวจสอบโค้ดและการทำงานอย่างละเอียดใน PR #72 (Branch feature/30-actions-taken-ui) ยังมีจุดบกพร่องที่ต้องขอให้แก้ไขเพิ่มเติมก่อนจึงจะสามารถอนุมัติได้ ดังนี้:
> 
> 1. [client/src/components/StaffTicketDetail.tsx] ขาดการส่ง Callback onActionRecorded (บรรทัด 459):
>    - มีการเรียกใช้ <ActionsTakenSection /> โดยส่งเพียง ticketId, ticketCreatedAt และ isStaffOrAdmin แต่ไม่ได้ส่ง onActionRecorded
>    - ในฝั่ง Backend เมื่อมีการบันทึก Action Taken ตัว Ticket แม่จะถูกอัปเดตค่า updatedAt ในฐานข้อมูลด้วยเสมอ
>    - การไม่ส่ง Callback ทำให้ StaffTicketDetail ไม่ได้รับแจ้งเตือนให้ดึงข้อมูลตั๋วใหม่ ส่งผลให้ค่า ticket.updatedAt ในเครื่อง Client ล้าสมัย หากเจ้าหน้าที่กดเปลี่ยนสถานะตั๋วหรือกด Resolve ตั๋วต่อทันที จะส่งผลให้คำขอล้มเหลวด้วยข้อผิดพลาด HTTP 409 Conflict (อ้างอิง BR-13)
>    - สิ่งที่ต้องแก้: ดึงฟังก์ชันโหลดข้อมูลตั๋วใน useEffect ออกมาเป็นฟังก์ชันแยก (เช่น loadTicketData) แล้วส่งต่อเป็น onActionRecorded={loadTicketData} ให้กับ <ActionsTakenSection />
> 
> 2. [client/src/components/ActionsTakenSection.tsx] พร็อพ ticketCreatedAt ไม่ได้ถูกนำไปใช้ และขาดข้อจำกัด min/max บนช่องวันที่ (บรรทัด 22, 230):
>    - มีการรับพร็อพ ticketCreatedAt เข้ามาในคอมโพเนนต์แต่ไม่ได้ถูกนำไปอ้างอิงเลย
>    - ตามข้อกำหนด Handout 4.1 และกฎ BR-05 วันเวลาที่ปฏิบัติงาน (actionDateTime) ต้องไม่เกิดขึ้นก่อนเวลาที่สร้างตั๋ว และต้องไม่เป็นเวลาในอนาคต
>    - ปัจจุบันช่อง <input id="action-datetime" type="datetime-local"> ไม่มีแอตทริบิวต์ min และ max ทำให้ผู้ใช้สามารถเลือกเวลาที่ผิดและกดปุ่ม Save Action ได้ โดยจะไปล้มเหลวที่ Backend (422) แทนที่จะบล็อกตั้งแต่หน้าจอ
>    - สิ่งที่ต้องแก้: นำ ticketCreatedAt มาแปลงเป็น Local ISO String เพื่อกำหนดเป็นค่า min และใช้วันที่ปัจจุบันเป็นค่า max บน input พร้อมเพิ่มการตรวจเช็กช่วงเวลาในเงื่อนไข isFormValid
> 
> 3. [client/src/components/ActionsTakenSection.tsx] ขาดการรองรับปุ่ม Escape เพื่อปิด Modal (บรรทัด 210):
>    - หน้าต่าง Modal มี role="dialog" และ aria-modal="true" เรียบร้อยแล้ว แต่ยังไม่สามารถกดยกเลิกหรือปิดด้วยปุ่ม Escape บนคีย์บอร์ดได้
>    - ตามมาตรฐาน Accessibility และ WCAG 2.1 AA ใน ui-spec.md หน้าต่าง Modal ควรปิดได้เมื่อกดปุ่ม Escape
>    - สิ่งที่ต้องแก้: เพิ่ม Event Listener ดักจับการกดปุ่ม Escape ใน useEffect ขณะที่ Modal กำลังเปิดอยู่เพื่อสั่งเรียก closeModal()
> 
> 4. [client/src/api.ts] ลบโค้ด Header จำลอง X-Development-Requester-Id ที่ตกค้าง (บรรทัด 733):
>    - ในฟังก์ชัน fetchTicketActions ยังมีเงื่อนไข Fallback ส่ง headers["X-Development-Requester-Id"] ตกค้างอยู่
>    - เนื่องจากใน PR #71 ที่ผ่านมา เส้นทาง /api/tickets/:id/actions ฝั่ง Server บังคับใช้ JWT Authentication เต็มรูปแบบแล้ว และไม่ได้ดึงค่าจาก Header นี้อีกต่อไป
>    - สิ่งที่ต้องแก้: ปรับฟังก์ชันใน api.ts ให้เรียกผ่าน Bearer Token เพียงอย่างเดียวเพื่อความกระชับและไม่ให้เกิดความสับสน
> 
> คำตัดสิน: Request Changes — รบกวนแก้ไขประเด็นข้างต้น (โดยเฉพาะข้อ 1 และ 2) แล้วพุชคอมมิตใหม่เพื่อตรวจสอบอีกครั้ง

### How partner responded (PR #72):
> 1. **Missing `onActionRecorded` Callback in StaffTicketDetail:** Extracted ticket loading into a reusable `loadTicketData` function and passed `onActionRecorded={loadTicketData}` to `<ActionsTakenSection />` in `StaffTicketDetail.tsx`.
> 2. **Unused `ticketCreatedAt` Prop & Missing Min/Max Date Bounds:** Converted `ticketCreatedAt` to local ISO format for `min` and current timestamp for `max`. Added date range validation in `isFormValid` and inline warning error messages to block form submission if the date is out of range.
> 3. **Missing Escape Key Modal Dismissal (WCAG 2.1 AA):** Added a `keydown` window event listener in `useEffect` when `isModalOpen` is active, closing the modal when Escape is pressed.
> 4. **Legacy `X-Development-Requester-Id` Header Fallback in `api.ts`:** Removed the header fallback, standardizing `fetchTicketActions` to use the `Authorization: Bearer ${authToken}` scheme.

### My approval review comment for partner's PR #72:
> ### ผลการตรวจประเมินรอบที่ 2 (Re-review Round 2)
> 
> ขอบคุณสำหรับการแก้ไขโค้ดและชุดทดสอบอย่างรวดเร็วและตรงจุดใน commit `d0f0fd2` ได้ดำเนินการ Re-review ในระดับโค้ดจริงและรัน Full Regression Test Suite เรียบร้อยแล้ว มีผลการตรวจดังนี้:
> 
> 1. **การส่ง Callback `onActionRecorded` เพื่อซิงค์ข้อมูลตั๋วแม่ (F-01):**
>    - ใน `client/src/components/StaffTicketDetail.tsx` มีการแยกฟังก์ชันดึงข้อมูลตั๋วออกมาเป็น `loadTicketData` และส่งผ่านพร็อพ `onActionRecorded={loadTicketData}` ให้กับ `<ActionsTakenSection />` อย่างถูกต้อง เมื่อมีการบันทึกหรือแก้ไขการปฏิบัติงาน ข้อมูลตั๋วแม่รวมถึง `ticket.updatedAt` ในหน้าจอจะได้รับการรีเฟรชทันที ป้องกันปัญหา HTTP 409 Conflict ในการเปลี่ยนสถานะหรือ Resolve ตั๋วต่อ
> 2. **การจำกัดขอบเขต `min` / `max` ของ `actionDateTime` ตามกฎ BR-05 (F-02):**
>    - ใน `client/src/components/ActionsTakenSection.tsx` มีการนำ `ticketCreatedAt` มาแปลงเป็น `minDateTime` และใช้เวลาปัจจุบันสำหรับ `maxDateTime` ผูกเข้ากับ `<input id="action-datetime" type="datetime-local">` พร้อมทั้งเพิ่มฟังก์ชัน `isDateTimeValid()` ในเงื่อนไข `isFormValid` และแสดงข้อความเตือนสีแดงแบบเรียลไทม์ ป้องกันการระบุวันเวลาย้อนหลังก่อนสร้างตั๋วหรือเวลาในอนาคตได้อย่างสมบูรณ์
> 3. **การรองรับปุ่ม `Escape` เพื่อปิด Modal ตามมาตรฐาน Accessibility (F-03):**
>    - เพิ่ม `useEffect` ดักจับคีย์บอร์ด Event `keydown` เพื่อตรวจสอบ `e.key === "Escape"` และสั่งเรียก `closeModal()` พร้อมฟังก์ชัน Clean-up Event Listener อย่างถูกต้อง สอดคล้องกับมาตรฐาน WCAG 2.1 AA
> 4. **การเก็บกวาด Header จำลองใน `api.ts` (F-04):**
>    - นำพารามิเตอร์ `requesterId` และเงื่อนไขส่ง `X-Development-Requester-Id` ออกจากฟังก์ชัน `fetchTicketActions` ใน `client/src/api.ts` เรียบร้อยแล้ว ทำให้การเรียกใช้งานส่งเฉพาะ `Authorization: Bearer <token>` ตามมาตรฐานความปลอดภัยของ Sprint 4
> 5. **ชุดการทดสอบอัตโนมัติและความเข้ากันได้ย้อนหลัง (Regression Suite):**
>    - ขยายชุดทดสอบใน `client/src/__tests__/lab-04/ActionsTaken.test.tsx` ครอบคลุมทั้งกรณี min/max วันที่, ปุ่ม Escape และการเรียก `onActionRecorded` callback (ผ่านครบ 9/9 เทสต์)
>    - รัน Full Test Suite ทั้งระบบ: Server ผ่าน 19 ไฟล์ (181/181 เทสต์) และ Client ผ่าน 13 ไฟล์ (61/61 เทสต์) รวมทั้งสิ้น 242 เทสต์ผ่าน 100% โดยไม่มีข้อผิดพลาดและไม่มีผลกระทบต่อของเดิม (Zero Regression)
> 
> **คำตัดสิน: Approve** — งาน Actions Taken Frontend UI & Ticket Detail Integration ของ Issue 30 มีคุณภาพ สมบูรณ์ ถูกต้องตามข้อกำหนด

---

### My review comment for partner's PR #73 (Issue 31):
> ### ผลการตรวจประเมิน Issue 31 - Ticket Status Workflow, Resolution Gate & Concurrency Conflict Handling
> 
> จากการตรวจสอบโค้ดและการทำงานใน PR #73 (Branch `feature/31-status-workflow-and-resolution`) ตัวฟีเจอร์หลักทั้ง Transition Matrix, Resolution Gate, 409 Conflict, Inactive User Guard และชุดทดสอบ 259 เคสทำออกมาได้ดีมากและผ่าน 100%
> 
> มีจุดที่อยากให้ปรับแก้เล็กน้อยในไฟล์ของ PR #73 ก่อน ดังนี้:
> 
> 1. **[client/src/components/StaffTicketDetail.tsx] อัปเดตรหัสกฎใน Resolve Modal (บรรทัด 670):**
>    - ข้อความคำอธิบายใน Modal ยังระบุว่า *"Per course business rule BR-20..."* ซึ่งเป็นรหัสเดิมของ Sprint 3
>    - ในเอกสารสเปกของ Sprint 4 (`docs/lab-04/specification.md`) กฎ Resolution Gate ถูกจัดลำดับเป็น **`BR-11`**
>    - **สิ่งที่ต้องแก้:** ปรับข้อความเป็น `BR-11` เพื่อความถูกต้องในการ Traceability กับเอกสาร Lab 4 ครับ
> 
> 2. **[server/src/routes/staff.routes.ts] ลำดับการตรวจสอบใน `PATCH /api/staff/tickets/:id/status` (บรรทัด 398–408):**
>    - ปัจจุบันโค้ดดักจับการห้ามเปลี่ยนสถานะเป็น `RESOLVED` ทำงานก่อนการตรวจสอบว่ามี `knownUpdatedAt` หรือไม่
>    - **สิ่งที่ต้องแก้:** สลับนำการตรวจเช็ก `knownUpdatedAt` ขึ้นมาไว้ก่อนการตรวจเช็กค่าสถานะ เพื่อให้ลำดับ Error Precedence สอดคล้องกับ `api-spec.md`
> 
> **คำตัดสิน: Request Changes** — รบกวนปรับแก้จุดข้างต้นเล็กน้อย

### How partner responded (PR #73):
> 1. **Business Rule Code in Resolve Modal:** Updated modal description text to explicitly reference `BR-11` conforming to `docs/lab-04/specification.md`.
> 2. **Validation Precedence in Status Mutation Endpoint:** Reordered endpoint validation logic so that the `knownUpdatedAt` presence check (returning 422 Unprocessable Entity) executes prior to target status examination, strictly aligning with `api-spec.md` error precedence.

### My approval review comment for partner's PR #73:
> ### ผลการตรวจประเมินรอบที่ 2 (Re-review Round 2)
> 
> ขอบคุณสำหรับการแก้ไขโค้ดและชุดทดสอบอย่างรวดเร็วและตรงจุดใน commit `cf7f558` ได้ดำเนินการ Re-review ในระดับโค้ดจริงและรัน Full Regression Test Suite เรียบร้อยแล้ว มีผลการตรวจดังนี้:
> 
> 1. **การอัปเดตรหัสข้อกำหนดใน Resolve Modal (F-01):**
>    - ใน `client/src/components/StaffTicketDetail.tsx` (บรรทัด 687) มีการปรับแก้ข้อความคำอธิบายใน Modal จาก `BR-20` เป็น **`BR-11`** เพื่อให้สอดคล้องกับเอกสารสเปกของ Sprint 4 (`docs/lab-04/specification.md`) อย่างถูกต้อง
> 2. **การปรับลำดับ Error Precedence ของ `knownUpdatedAt` ใน `PATCH /status` (F-02):**
>    - ใน `server/src/routes/staff.routes.ts` (บรรทัด 398–412) มีการสลับนำการตรวจสอบฟิลด์ `knownUpdatedAt` ขึ้นมาทำงานก่อนการตรวจสอบค่าสถานะ `RESOLVED` โดยหาก Client ไม่ได้แนบ Timestamp มาจะถูกปฏิเสธด้วย `422 Unprocessable Entity: knownUpdatedAt is required` เป็นลำดับแรก สอดคล้องกับข้อกำหนดใน `api-spec.md` (หัวข้อที่ 1) อย่างสมบูรณ์
> 3. **ชุดการทดสอบอัตโนมัติและความเข้ากันได้ย้อนหลัง (Regression Suite):**
>    - มีการอัปเดตชุดทดสอบ `staff-ticket-detail.api.test.ts` ให้แนบ `knownUpdatedAt` สอดคล้องกับลำดับการตรวจสอบใหม่ โดยไม่มีการข้ามเทสต์หรือลดทอนเงื่อนไข
>    - รัน Full Test Suite ทั้งระบบ: Server ผ่าน 20 ไฟล์ (192/192 เทสต์) และ Client ผ่าน 14 ไฟล์ (67/67 เทสต์) รวมทั้งสิ้น 259 เทสต์ผ่าน 100% โดยไม่มีข้อผิดพลาดและไม่มีผลกระทบต่อของเดิม (Zero Regression)
> 
> **คำตัดสิน: Approve** — งาน Ticket Status Workflow, Resolution Gate & Concurrency Conflict Handling ของ Issue 31 มีคุณภาพ สมบูรณ์ ถูกต้องตามข้อกำหนด

---

### My review comment for partner's PR #74 (Issue 32):
> ### ผลการตรวจประเมิน Issue 32 - Sprint 4 Role Dashboards Backend API & Authoritative Query Engine
> 
> จากการตรวจสอบโค้ดและชุดทดสอบอย่างละเอียดใน PR #74 (Commit `b62dde4`) ยังมีจุดบกพร่องที่ต้องขอให้แก้ไขเพิ่มเติมก่อนจึงจะสามารถอนุมัติได้ ดังนี้:
> 
> 1. **[server/src/routes/dashboard.routes.ts] การคำนวณ Priority Distribution ไม่กรองเฉพาะ Active Tickets ตามข้อกำหนด BR-17 (บรรทัด 221–232):**
>    - ใน `docs/lab-04/specification.md` ข้อกำหนด **BR-17** ระบุชัดเจนว่า `priorityCounts` ต้องเป็น *"Aggregate counts grouped by itPriority for all active tickets"*
>    - ในโค้ดปัจจุบันใช้ `prisma.ticket.groupBy` โดยไม่มีเงื่อนไข `where` ทำให้ตั๋วสถานะ Terminal (`CLOSED` และ `CANCELLED`) ถูกดึงมารวมด้วย ส่งผลให้สถิติตามลำดับความสำคัญของคิวงาน IT Staff คลาดเคลื่อนจากความเป็นจริง
>    - **สิ่งที่ต้องแก้:** เพิ่มเงื่อนไข `where: { currentStatus: { notIn: TERMINAL_STATUSES } }` ในการ query `priorityDistribution` เพื่อให้นับเฉพาะตั๋วที่ยังดำเนินการอยู่ (Active Tickets) ตรงตามข้อกำหนด BR-17 
> 
> 2. **[server/src/routes/dashboard.routes.ts & server/src/app.ts] การทำ Recursive Router Dispatching และการ Mutate `req.url` (บรรทัด 326–332):**
>    - ใน Endpoint `/admin` มีการเขียน `req.url = "/staff"` แล้วเรียก `dashboardRouter(req, res, next)` ซ้ำซ้อน ซึ่งทำให้ Middleware การยืนยันตัวตน (`requireAuth` และ `enforcePasswordChange`) ถูกเรียกทำงานซ้ำ 2 รอบ และเสี่ยงต่อการทำ Query Parameters สูญหาย
>    - **สิ่งที่ต้องแก้:** แยกการประมวลผลของ Staff Dashboard ออกมาเป็นฟังก์ชันอิสระ เช่น `handleStaffDashboard(req, res)` แล้วเรียกใช้ฟังก์ชันดังกล่าวโดยตรงจากทั้ง Route `/staff` และ `/admin` แทนการเขียนทับ `req.url` และวนเรียก Router ซ้ำ
> 
> 3. **[server/tests/lab-04/requester-dashboard.api.test.ts] ขาดชุดทดสอบ Security กรณี Requester ต้องเปลี่ยนรหัสผ่าน (`mustChangePassword`):**
>    - ใน `staff-dashboard.api.test.ts` (บรรทัด 73–85) มีการทดสอบกรณีผู้ใช้ติดสถานะ `mustChangePassword: true` แล้วถูกปฏิเสธด้วย `403 Forbidden` ไว้อย่างชัดเจน
>    - แต่ใน `requester-dashboard.api.test.ts` ยังไม่มี Test Case ตรวจสอบกรณี Requester ที่มีแฟล็ก `mustChangePassword: true`
>    - **สิ่งที่ต้องแก้:** เพิ่ม Test Case ใน `requester-dashboard.api.test.ts` เพื่อยืนยันว่า Requester ที่มีแฟล็ก `mustChangePassword: true` จะถูกปฏิเสธด้วย `403 Forbidden` เช่นเดียวกัน เพื่อให้ครอบคลุมเงื่อนไขความปลอดภัยตามมาตรฐานของระบบ
> 
> **คำตัดสิน: Request Changes** — รบกวนแก้ไข 3 จุดนี้และพุชคอมมิตใหม่

### How partner responded (PR #74):
> 1. **Priority Distribution Query Missing Active Tickets Filter (BR-17):** Added `where: { currentStatus: { notIn: TERMINAL_STATUSES } }` to the `itPriority` aggregation query in `handleStaffDashboard`, strictly limiting the distribution to active tickets per `BR-17`. Added automated assertion in `server/tests/lab-04/staff-dashboard.api.test.ts`.
> 2. **Recursive Router Dispatching and `req.url` Mutation:** Extracted `handleRequesterDashboard` and `handleStaffDashboard` as clean standalone handler functions. Mounted them directly on both primary routes and root aliases (`/api/requester/dashboard`, `/api/staff/dashboard`, `/api/admin/dashboard`) in `server/src/app.ts` with explicit middleware chain and zero URL mutations.
> 3. **Explicit Password Change Security Tests for Requester Dashboard:** Added dedicated test cases in `server/tests/lab-04/requester-dashboard.api.test.ts` verifying that requesters with `mustChangePassword: true` are rejected with HTTP 403 Forbidden on both `/api/dashboard/requester` and `/api/requester/dashboard`.

### My approval review comment for partner's PR #74:
> ### ผลการตรวจประเมินรอบที่ 2 (Re-review Round 2)
> 
> ขอบคุณสำหรับการแก้ไขโค้ดและชุดทดสอบอย่างรวดเร็วและตรงประเด็นใน commit `e46cee0`
> 
> ผลการ Re-review ในระดับโค้ดจริงและการรันชุดทดสอบยืนยันดังนี้:
> 1. **การกรอง Active Tickets ใน Priority Distribution (BR-17):** ได้รับการแก้ไขที่รากเหง้าโดยเพิ่มเงื่อนไข `where: { currentStatus: { notIn: TERMINAL_STATUSES } }` ใน `server/src/routes/dashboard.routes.ts` พร้อม assertion ตรวจสอบใน `staff-dashboard.api.test.ts` ครบถ้วน
> 2. **การแยก Dashboard Handlers และยกเลิก `req.url` Mutation:** สถาปัตยกรรมการ Routing ใน `app.ts` และ `dashboard.routes.ts` ได้รับการปรับปรุงเป็น Clean Handlers และเชื่อมต่อกับ Middleware Chain โดยตรง ปราศจากการเรียก Dispatch ซ้ำซ้อน
> 3. **ชุดทดสอบ Security สำหรับ Requester Password Change:** เพิ่ม Test Cases ใน `requester-dashboard.api.test.ts` ยืนยันการปฏิเสธด้วย HTTP 403 Forbidden ครอบคลุมทั้งเส้นทางหลักและ Alias
> 4. **ความเข้ากันได้ย้อนหลัง (Full Regression):** รันเทสต์ทั้งระบบผ่านครบ 274/274 tests (Server 207, Client 67) ปราศจากข้อผิดพลาด 100%
> 
> **Verdict: Approve** — งาน Role Dashboards Backend API & Authoritative Query Engine ของ Issue 32 มีคุณภาพสมบูรณ์ ถูกต้องตามข้อกำหนด

---

### My review comment for partner's PR #75 (Issue 33):
> ### ผลการตรวจประเมิน Issue 33 - Sprint 4 IT Staff & Administrator Dashboard UI
> 
> จากการตรวจสอบโค้ดและชุดทดสอบอย่างละเอียดใน PR #75 (Commit `dcd5138`) ยังมีจุดบกพร่องที่ทำให้การบิลด์ระบบล้มเหลว จึงต้องขอให้แก้ไขเพิ่มเติมก่อนที่จะสามารถอนุมัติได้ ดังนี้:
> 
> 1. **[client/src/components/StaffDashboard.tsx] TypeScript Compile Error จากการอ้างอิงฟิลด์ `recentTickets` (บรรทัด 152):**
>    - ใน `StaffDashboard.tsx` บรรทัด 152 มีการเขียน fallback:
>      ```typescript
>      const recentTickets: StaffDashboardTicket[] =
>        data.recentQueueActivity || data.recentQueueTickets || data.recentTickets || [];
>      ```
>    - ฟิลด์ `recentTickets` ไม่ได้ถูกประกาศไว้ใน Interface `StaffDashboardData` ใน `client/src/api.ts`
>    - ส่งผลให้คำสั่ง `npm --prefix client run build` ล้มเหลวทันที (`error TS2339: Property 'recentTickets' does not exist on type 'StaffDashboardData'`) ซึ่งขัดต่อเกณฑ์ Clean Build ตาม **AC-16**
>    - **สิ่งที่ต้องแก้:** นำ `|| data.recentTickets` ออกจากบรรทัด 152 ให้เหลือเฉพาะ `data.recentQueueActivity || data.recentQueueTickets || []` ให้ตรงตาม Type Signature ของ `StaffDashboardData` ครับ
> 
> 2. **[client/src/__tests__/lab-04/StaffDashboard.test.tsx] Type Signature Mismatch ในไฟล์ชุดทดสอบ (บรรทัด 42, 111, 339):**
>    - ใน `StaffDashboard.test.tsx` มีการระบุฟิลด์ที่ผิดจาก Interface 3 ตำแหน่ง:
>      - **บรรทัด 42:** มีการใส่ฟิลด์ `myActiveTickets: 3` ใน Object `mockDashboardData.metrics` ซึ่งไม่มีใน Type `StaffDashboardMetrics` (`api.ts` ใช้ชื่อ `myAssignedTickets`)
>      - **บรรทัด 111 และ 339:** มีการ Mock ฟังก์ชัน `refreshUser: vi.fn()` ใน `authContext.useAuth` ซึ่งไม่มีอยู่ใน Interface `AuthContextType` (`client/src/context/AuthContext.tsx`)
>    - ส่งผลให้เกิดข้อผิดพลาด `error TS2353: Object literal may only specify known properties` ทำให้ `tsc` คอมไพล์ไม่ผ่าน
>    - **สิ่งที่ต้องแก้:** ตัดฟิลด์ `myActiveTickets` ออกจาก `mockDashboardData.metrics` ในบรรทัด 42 และปรับ Mock Object ของ `useAuth` ในบรรทัด 111 และ 339 ให้ตรงตาม `AuthContextType` ครับ
> 
> 3. **[docs/lab-04/reviewer.md] สถานะการรีวิว:**
>    - อัปเดตบันทึกข้อเสนอแนะและสถานะใน `docs/lab-04/reviewer.md` ให้สะท้อนผลการตรวจประเมินรอบที่ 1 ของ PR #75
> 
> ---
> 
> **คำตัดสิน: Request Changes** — รบกวนแก้ไข 3 จุดนี้และพุชคอมมิตใหม่

### How partner responded (PR #75):
> 1. **Invalid `recentTickets` Property Causing TypeScript Build Failure:** Removed `|| data.recentTickets` from line 152, strictly retaining `data.recentQueueActivity || data.recentQueueTickets || []`. Clean build now compiles with 0 errors in under 1 second.
> 2. **Type Signature Mismatch in Test File (`StaffDashboard.test.tsx`):** Removed `myActiveTickets` from `mockDashboardData.metrics`, ensured `recentQueueActivity` mock tickets strictly conform to `StaffDashboardTicket`, and updated `useAuth` mock to implement the complete `AuthContextType` interface (`error`, `updatePassword`, `clearError`).
> 3. **Reviewer Tracking Record:** Recorded Round 1 Changes Requested verdict, verbatim quotes, and detailed responses in `docs/lab-04/reviewer.md`.

### My round 2 review comment for partner's PR #75:
> ### Second Reviewer Feedback — Request Changes
> 
> จากการ Re-review เชิงลึกใน PR #75 พบประเด็นด้าน Data Semantic และ Drill-Down Consistency ที่ต้องขอให้ปรับปรุงเพิ่มเติมก่อนอนุมัติ ดังนี้:
> 1. **[Drill-Down Mismatch] การเชื่อมโยงการ์ด "My Actions Recorded" (`StaffDashboard.tsx:L318`):**
>    - ตัวเลข `myActionsTakenCount` นับการกระทำที่ผู้ใช้เป็นผู้บันทึก (`performedById = caller.id`) แต่ Handler กลับส่ง `ownerFilter: "me"` ซึ่งไปกรองตั๋วที่ผู้ใช้เป็นเจ้าของตั๋วหลัก หากผู้ใช้ไปช่วยทำ Action บนตั๋วของคนอื่น (ตาม BR-02) ตั๋วเหล่านั้นจะไม่ปรากฏในคิว แนะนำให้พิจารณาการแสดงผลหรือจัดทำโหมดกรองสำหรับ My Actions ให้ถูกต้อง
> 2. **[Count Discrepancy] การ์ด "Urgent Tickets" ส่งผลให้ตัวเลขไม่ตรงกับตารางคิวงาน (`StaffDashboard.tsx:L348`):**
>    - Backend นับเฉพาะ Urgent ที่ยังไม่จบงาน (`notIn: RESOLVED, CLOSED, CANCELLED`) แต่การ์ดส่งเฉพาะ `{ itPriority: "URGENT" }` ทำให้คิวงานดึงตั๋ว Closed/Cancelled ขึ้นมาแสดงด้วย ส่งผลให้จำนวนตั๋วในคิวมากกว่าตัวเลขบนการ์ด ขัดต่อข้อกำหนด E2E-DASH-01 ("landing on queue matching count") แนะนำให้ปรับให้คิวงานแสดงเฉพาะตั๋ว Active เมื่อกดมาจาก Urgent Card
> 3. **[Navigation Flow] การกดย้อนกลับจากหน้ารายละเอียดตั๋ว (`App.tsx:L323`):**
>    - เมื่อคลิกดูตั๋วจาก Recent Queue Activity ในหน้า Dashboard เมื่อกด Back ใน `StaffTicketDetail` ระบบจะพาไปหน้า `staff-queue` แทนที่จะกลับมาที่ `staff-dashboard` แนะนำให้บันทึก View ต้นทางเพื่อพากลับมาหน้าเดิมได้อย่างถูกต้อง

### How partner responded (round 2, PR #75):
> 1. **Drill-Down Mismatch for "My Actions Recorded" Card:** Added `actionBy` query parameter to backend `GET /api/staff/tickets` querying `where.actionsTaken = { some: { performedById: req.user.id } }`. Added `actionBy?: string` to `FetchStaffTicketsParams` and `initialActionBy` prop to `StaffTicketQueue.tsx`. Added dedicated 4th ownership toggle button `My Actions` (`ownerFilter === "my-actions"`), and updated Dashboard Card 3 click handler to dispatch `onDrillDown?.({ ownerFilter: "my-actions", actionBy: "me" })`.
> 2. **Count Discrepancy for "Urgent Tickets" Card:** Added `status === "ACTIVE"` support to backend `GET /api/staff/tickets` querying `where.currentStatus = { notIn: [RESOLVED, CLOSED, CANCELLED] }`. Added `<option value="ACTIVE">Active (Non-terminal)</option>` to status select in `StaffTicketQueue.tsx`. Updated Dashboard Card 4 click handler to dispatch `onDrillDown?.({ itPriority: "URGENT", status: "ACTIVE" })`.
> 3. **Back Button Navigation Flow:** Added `previousStaffView` state tracking in `App.tsx`. Recorded `previousStaffView = "staff-dashboard"` on dashboard ticket click and `"staff-queue"` on queue ticket click. Restored exact originating view in `StaffTicketDetail.onBack`.

### My approval review comment for partner's PR #75:
> ### ผลการตรวจประเมินรอบที่ 2 (Re-review Round 2)
> 
> ขอบคุณสำหรับการแก้ไขปัญหาเชิงลึกใน commit `7454aa6` อย่างยอดเยี่ยมและตรงประเด็น
> 
> ผลการ Re-review ในระดับโค้ดจริงและการตรวจสอบระบบ:
> 1. **Clean Build ผ่านสมบูรณ์ (AC-16):** การตัด `data.recentTickets` ออกจาก `StaffDashboard.tsx` และปรับปรุง Type Signature ใน `StaffDashboard.test.tsx` ทำให้ `npm run build` (`tsc && vite build`) สำเร็จ 100% ปราศจากข้อผิดพลาด
> 2. **ความถูกต้องของ Drill-Down Filter (AC-11, BR-02, BR-17):**
>    - การ์ด "My Actions Recorded" รองรับการกรอง `actionBy=me` ผ่านความสัมพันธ์ของ Actions Taken อย่างแท้จริง ไม่จำกัดเฉพาะตั๋วที่ตนเองเป็นเจ้าของ
>    - การ์ด "Urgent Tickets" ส่งตัวกรอง `status=ACTIVE` ทำให้จำนวนตั๋วในคิวงานตรงกับตัวเลขบนการ์ดตามเกณฑ์ E2E-DASH-01
> 3. **Navigation Flow สมบูรณ์:** ระบบจดจำ View ต้นทางทำให้การกดย้อนกลับจากหน้ารายละเอียดตั๋วกลับสู่ Dashboard ได้อย่างถูกต้อง
> 4. **ความเข้ากันได้ย้อนหลัง (Full Regression):** รันเทสต์ทั้งระบบผ่านครบถ้วนทั้ง 292 tests (Server 207 tests, Client 85 tests) ปราศจากข้อผิดพลาด 100%
> 
> **Verdict: Approve**

---

### My review comment for partner's PR #76 (Issue 34):
> ### ผลการตรวจประเมิน Issue 34 - Sprint 4 Requester Dashboard Frontend UI
> 
> จากการตรวจสอบโค้ดและชุดทดสอบอย่างละเอียดใน PR #76 (Commit `9486edb`) พบว่าภาพรวมการออกแบบ UI, State Handling (Loading, Error, Empty State), Accessibility, และการเรียกใช้งาน API ตาม BR-16 ทำได้ดีมาก อย่างไรก็ตาม ยังมีจุดบกพร่องเรื่อง Drill-Down Navigation และตัวกรองสถานะที่ทำให้ตัวเลขบน Dashboard ไม่ตรงกับตารางรายการตั๋ว ซึ่งต้องขอให้แก้ไขเพิ่มเติมก่อนจึงจะสามารถอนุมัติได้ ดังนี้:
> 
> 1. **[client/src/components/RequesterDashboard.tsx & MyTickets.tsx] การ Drill-Down การ์ด "Resolved / Closed" ไม่แสดงตั๋วสถานะ CLOSED (AC-04, AC-11, BR-16):**
>    - **ปัญหา:** การ์ดสถิติที่ 3 คำนวณและแสดงผลตัวเลขรวมของตั๋วที่เสร็จสิ้น `metrics.resolvedOrClosed` (Backend รวมทั้ง `RESOLVED` และ `CLOSED`) แต่เมื่อผู้ใช้คลิกการ์ดนี้ ฟังก์ชัน `handleCardClick` ใน `RequesterDashboard.tsx` (บรรทัด 297) ส่งค่า `onNavigateMyTickets?.("resolved")` ไปยัง `MyTickets.tsx` ซึ่งฟังก์ชัน `mapStatusFilter` (บรรทัด 23) แปลงค่านั้นเป็น `selectedStatus = "RESOLVED"` เพียงสถานะเดียว
>    - **ผลกระทบ:** ตาราง `MyTickets` จะยิงคำขอ `GET /api/tickets?status=RESOLVED` และแสดงเฉพาะตั๋ว `RESOLVED` โดยไม่แสดงตั๋ว `CLOSED` ทำให้จำนวนรายการที่แสดงในตารางน้อยกว่าตัวเลขรวมบนการ์ด Dashboard (เช่น ถ้ามี Resolved 1 ใบ และ Closed 4 ใบ การ์ดจะแสดงเลข 5 แต่คลิกเข้ามาเห็นตั๋วเพียง 1 ใบ) ซึ่งขัดต่อข้อกำหนด **AC-11** ("landing on filtered queue matching count")
>    - **สิ่งที่ต้องแก้:**
>      - ปรับให้ `onNavigateMyTickets` ส่งพารามิเตอร์สถานะที่สื่อถึงทั้งสองสถานะ เช่น `"resolved_or_closed"` หรือรองรับการกรองแบบรวม
>      - ปรับ `mapStatusFilter` และตัวกรองใน `MyTickets.tsx` ให้สามารถเลือกแสดงผลกลุ่มตั๋วที่เสร็จสิ้นแล้วทั้งหมด (`RESOLVED` และ `CLOSED`) ได้อย่างถูกต้อง
> 
> 2. **[server/src/app.ts] ขยาย Endpoint `GET /api/tickets` ให้รองรับการกรองสถานะคู่ (`RESOLVED_OR_CLOSED`):**
>    - **ปัญหา:** ใน `server/src/app.ts` (บรรทัด 371–385) พารามิเตอร์ `status` ของ `GET /api/tickets` รองรับเพียงค่า `ACTIVE` หรือค่าเดี่ยวของ `TicketStatus` เท่านั้น หากส่งค่าอื่นเข้ามาจะติด `400 INVALID_QUERY`
>    - **สิ่งที่ต้องแก้:** เพิ่มการรองรับ query parameter เช่น `status=RESOLVED_OR_CLOSED` (หรือ `COMPLETED`) ใน `server/src/app.ts` โดยให้ query Prisma ด้วย `where.currentStatus = { in: [TicketStatus.RESOLVED, TicketStatus.CLOSED] }` เพื่อให้ Client ฝั่ง Requester สามารถ Drill-down ดูรายการตั๋วที่ตรงกับยอดรวมของการ์ดได้อย่างสมบูรณ์
> 
> 3. **[docs/lab-04/reviewer.md] สถานะการรีวิว:**
>    - บันทึกข้อเสนอแนะและอัปเดตผลการประเมินรอบที่ 1 สำหรับ Issue 34 / PR #76 ลงในตาราง Review History ใน `docs/lab-04/reviewer.md`
> 
> ---
> 
> **คำตัดสิน: Request Changes** — รบกวนแก้ไข 3 จุดนี้และพุชคอมมิตใหม่

### How partner responded (PR #76):
> 1. **Drill-Down on "Resolved / Closed" Card Mismatch (`RequesterDashboard.tsx` & `MyTickets.tsx`):** Updated Card 3 click handler in `RequesterDashboard.tsx` to dispatch `onNavigateMyTickets?.("resolved_or_closed")`. Updated `mapStatusFilter` in `MyTickets.tsx` to map `"resolved_or_closed"` (as well as `"resolved"` and `"completed"`) to `"RESOLVED_OR_CLOSED"`. Added `<option value="RESOLVED_OR_CLOSED">Resolved / Closed</option>` to the status select dropdown in `MyTickets.tsx`.
> 2. **Backend `GET /api/tickets` Support for Combined Status (`RESOLVED_OR_CLOSED`):** Added support for `status === "RESOLVED_OR_CLOSED"` (and alias `"COMPLETED"`) in `server/src/app.ts`, querying Prisma with `where.currentStatus = { in: [TicketStatus.RESOLVED, TicketStatus.CLOSED] }`.
> 3. **Reviewer Tracking Record:** Recorded Round 1 Changes Requested verdict, verbatim quotes, and detailed responses in `docs/lab-04/reviewer.md`.

### My round 2 review comment for partner's PR #76:
> ### ผลการตรวจประเมินรอบที่ 2 (Re-review Round 2) — Issue 34 / PR #76
> 
> ขอบคุณสำหรับการแก้ไขโค้ดและชุดทดสอบอย่างรวดเร็วใน commit `f090d53` ได้ดำเนินการ Re-review ในระดับโค้ดจริงและรัน Full Regression Test Suite เรียบร้อยแล้ว มีผลการตรวจดังนี้:
> 
> 1. **การ Drill-Down การ์ด "Resolved / Closed" ครอบคลุมทั้ง `RESOLVED` และ `CLOSED` แล้ว (F-01):**
>    - ใน `client/src/components/RequesterDashboard.tsx` บรรทัด 297 และ 302 ได้เปลี่ยน `onNavigateMyTickets?.("resolved")` เป็น `onNavigateMyTickets?.("resolved_or_closed")` ครบทั้ง `onClick` และ `onKeyDown` แล้ว
>    - ใน `client/src/components/MyTickets.tsx` บรรทัด 24 ฟังก์ชัน `mapStatusFilter` แมปค่า `"resolved_or_closed"` ไปเป็น `"RESOLVED_OR_CLOSED"` อย่างถูกต้อง พร้อมเพิ่ม `<option value="RESOLVED_OR_CLOSED">Resolved / Closed</option>` ใน Dropdown แล้ว
>    - ชุดทดสอบ `client/src/__tests__/lab-04/RequesterDashboard.test.tsx` บรรทัด 218 อัปเดต assertion เป็น `expect(handleNavigate).toHaveBeenCalledWith("resolved_or_closed")` ตรงกับการแก้ไข ✓
> 
> 2. **การรองรับ `RESOLVED_OR_CLOSED` ใน Backend API (F-02):**
>    - ใน `server/src/app.ts` บรรทัด 380–383 เพิ่ม branch `else if (upperStatus === "RESOLVED_OR_CLOSED" || upperStatus === "COMPLETED")` พร้อม Prisma filter `{ in: [TicketStatus.RESOLVED, TicketStatus.CLOSED] }` ตรงกับ logic ของ `dashboard.routes.ts` (L25–27) ✓
>    - **อย่างไรก็ตาม ยังไม่มี Server-side Integration Test ครอบคลุม branch ใหม่นี้เลย** ตรวจ `server/tests/` ทั้งหมดด้วย pattern `RESOLVED_OR_CLOSED` — ไม่พบผลลัพธ์ใด Test ที่มีอยู่ใน `RequesterDashboard.test.tsx` เป็นเพียง Client-side Mock ไม่ได้ยิง HTTP จริง หาก Prisma query มีข้อผิดพลาดในอนาคตจะไม่มี Test ตรวจจับได้ ขัดต่อ AC-11
> 
> 3. **บันทึกการรีวิวรอบที่ 1 ใน `reviewer.md` (F-03):**
>    - `docs/lab-04/reviewer.md` บันทึกคำวิจารณ์รอบที่ 1 แบบ verbatim พร้อม Response ของ author ครบ 3 ข้อเรียบร้อยแล้ว ✓
> 
> 4. **ประเด็นใหม่ที่พบจากการแก้ไข — alias "resolved" ขยายเป็น `RESOLVED_OR_CLOSED` โดยเงียบ:**
>    - `MyTickets.tsx` L24: `if (s === "resolved" || s === "resolved_or_closed" || s === "completed") return "RESOLVED_OR_CLOSED";`
>    - สตริง `"resolved"` ตัวเล็กตอนนี้ map ไปรวม `CLOSED` ด้วย Dropdown option ยังทำงานปกติ (ผ่าน `else` → `toUpperCase()`) จึงไม่มี Regression แต่ Deep-link URL `?status=resolved` หรือโค้ดในอนาคตที่ส่ง `"resolved"` อาจได้รับตั๋วมากกว่าที่คาดโดยไม่รู้ตัว รบกวนเพิ่ม comment อธิบาย intent หรือแยก alias ออกให้ชัดเจน
> 
> 5. **ชุดการทดสอบอัตโนมัติและความเข้ากันได้ย้อนหลัง (Regression Suite):**
>    - ตรวจสอบแล้วไม่มี `.skip`, `.only`, `xtest`, หรือ `xdescribe` ในทุกไฟล์ที่แก้ไข ✓
>    - รัน Full Test Suite ทั้งระบบ: Client ผ่าน 16 ไฟล์ (101/101 เทสต์) และ Server ผ่าน 22 ไฟล์ (207/207 เทสต์) รวมทั้งสิ้น **308 เทสต์ผ่าน 100%** Lab 1–3 Regression ผ่านครบ Zero Regression ✓
> 
> ---
> 
> **คำตัดสิน: Request Changes** — F-01 และ F-03 แก้ไขสมบูรณ์มีหลักฐานยืนยัน F-02 โค้ด Logic ถูกต้องแต่ขาด Server-side Integration Test (ข้อ 2) และพบ alias collision เล็กน้อย (ข้อ 4) รบกวนเพิ่ม Test 1 รายการและชี้แจง alias แล้วพุชคอมมิตใหม่

### How partner responded (round 2, PR #76):
> 1. **Server-side Integration Test for `RESOLVED_OR_CLOSED` in `GET /api/tickets` (F-02):** Added comprehensive server-side integration tests in `server/tests/lab-02/my-tickets.api.test.ts` and `server/tests/lab-04/requester-dashboard.api.test.ts` verifying that `GET /api/tickets?status=RESOLVED_OR_CLOSED` (and alias `COMPLETED`) queries Prisma with `{ in: [TicketStatus.RESOLVED, TicketStatus.CLOSED] }` and returns only resolved/closed tickets.
> 2. **Alias Collision Clarification in `MyTickets.tsx` (F-04):** Decoupled `s === "resolved"` so it strictly maps to single status `"RESOLVED"`, while `"resolved_or_closed"` and `"completed"` map to combined status `"RESOLVED_OR_CLOSED"`. Added explicit intent comments documenting the mapping behavior.
> 3. **Regression Suite:** Ran full regression suite across client (101 tests, 16 files) and server (209 tests, 22 files) totaling 310 tests passing 100% with clean production build.

### My approval review comment for partner's PR #76:
> ### ผลการตรวจประเมินรอบที่ 3 (Re-review Round 3) — Issue 34 / PR #76 (Commit `8f79375`)
> 
> ขอบคุณสำหรับการแก้ไขอย่างครบถ้วนและตรงประเด็นใน commit `8f79375` ได้ดำเนินการ Re-review ในระดับโค้ดจริงและรัน Full Regression Test Suite เรียบร้อยแล้ว มีผลการตรวจดังนี้:
> 
> 1. **เพิ่ม Server-side Integration Test สำหรับ `RESOLVED_OR_CLOSED` (NI-01 จากรอบที่ 2):**
>    - เพิ่ม Test case `API-05 / AC-11` ใน `server/tests/lab-02/my-tickets.api.test.ts` และ Test describe `"Requester Ticket Drill-Down API Parity (AC-11, BR-16)"` ใน `server/tests/lab-04/requester-dashboard.api.test.ts` ครบถ้วนแล้ว
>    - ทั้งสองชุดทดสอบใช้ Supertest ยิง HTTP จริงไปยัง `GET /api/tickets?status=RESOLVED_OR_CLOSED` และตรวจสอบ `capturedWhere.currentStatus` ว่าเท่ากับ `{ in: [TicketStatus.RESOLVED, TicketStatus.CLOSED] }` อย่างถูกต้อง
>    - ไม่มี `.skip`, `.only`, `xtest` หรือ `xdescribe` ในไฟล์ทดสอบใหม่ ✓
>    - หมายเหตุ: Test ยังไม่ได้ assert ว่าสถานะ `CANCELLED` ถูกตัดออก (ไม่อยู่ใน `in` list) อย่างชัดเจน แต่การตรวจสอบโค้ด `server/src/app.ts` L380–383 ยืนยันว่า `CANCELLED` ไม่ถูกรวมอยู่จริง เพียงแต่ถ้าต้องการ Test ที่สมบูรณ์ขึ้นในอนาคต อาจเพิ่ม negative assertion นี้ได้
> 
> 2. **แยก alias `"resolved"` ออกจากกลุ่ม `RESOLVED_OR_CLOSED` (NI-02 จากรอบที่ 2):**
>    - ฟังก์ชัน `mapStatusFilter` ใน `client/src/components/MyTickets.tsx` (L22–29) แก้ไขแล้ว โดยแยก `s === "resolved"` ออกเป็น branch ของตัวเอง → map ไปยัง `"RESOLVED"` เดี่ยว ๆ
>    - สงวน `"resolved_or_closed"` และ `"completed"` ไว้สำหรับ `"RESOLVED_OR_CLOSED"` เท่านั้น ป้องกันปัญหา Alias Collision สมบูรณ์
>    - เพิ่ม JSDoc comment ที่ L18–21 อธิบาย Intent ชัดเจนว่า `"resolved_or_closed"` ใช้สำหรับ Dashboard Card 3 (AC-11) โดยเฉพาะ ✓
> 
> 3. **ชุดการทดสอบอัตโนมัติและความเข้ากันได้ย้อนหลัง (Regression Suite):**
>    - ตรวจสอบแล้วไม่มี `.skip`, `.only`, `xtest`, หรือ `xdescribe` ในทุกไฟล์ที่แก้ไข ✓
>    - รัน Full Test Suite ทั้งระบบ: Client ผ่าน 16 ไฟล์ (101/101 เทสต์) และ Server ผ่าน 22 ไฟล์ (209/209 เทสต์) รวมทั้งสิ้น **310 เทสต์ผ่าน 100%** Lab 1–3 Regression ผ่านครบ Zero Regression ✓
> 
> ---
> 
> **คำตัดสิน: Approve** — ข้อค้นพบทั้งหมดจากรอบที่ 1 และรอบที่ 2 ได้รับการแก้ไขสมบูรณ์มีหลักฐานยืนยันในโค้ดจริง งาน Requester Dashboard Frontend UI ของ Issue 34 มีคุณภาพ ถูกต้องตามข้อกำหนด AC-11 และ BR-16 ครบถ้วน

---

### My review comment for partner's PR #77 (Issue 35):
> ### ผลการตรวจประเมิน Issue 35 - Sprint 4 End-to-End Automation, Responsive Visual Evidence & Accessibility Audit
> 
> จากการตรวจสอบโค้ดและผลการทดสอบอย่างละเอียดใน PR #77 (Commit `ab0bb01`) ครอบคลุมชุดทดสอบ Playwright E2E, การตรวจสอบ WCAG 2.1 AA Accessibility, Responsive Zero Horizontal Scrollbar Audit และการอัปเดต README.md พบว่าระบบทำงานได้อย่างถูกต้อง มีคุณภาพสูงมาก และรันชุดทดสอบผ่าน 100% ทั้งหมด อย่างไรก็ตาม ยังมีจุดบกพร่องด้าน Script และพาธการบันทึกภาพหลักฐานอัตโนมัติที่ต้องขอให้ปรับปรุงเพิ่มเติมก่อนจึงจะสามารถอนุมัติได้ ดังนี้:
> 
> 1. **[README.md:บรรทัด 188 & package.json] คำสั่ง `npm run test:full` ไม่มีอยู่ใน `package.json`:**
>    - ใน `README.md` หัวข้อ 3. Full Regression Suite (310 Tests Passing) ระบุให้รันคำสั่ง `npm run test:full` เพื่อรันทั้ง server และ client พร้อมกัน
>    - แต่ใน `package.json` (Root) มีเพียงคำสั่ง `"install:e2e"` และ `"test:e2e"` รวมถึงใน `client/package.json` และ `server/package.json` ก็ไม่มีสคริปต์ชื่อ `test:full`
>    - หากผู้ตรวจประเมินหรืออาจารย์ clone โค้ดมาแล้วรันคำสั่งตาม README จะเกิดข้อผิดพลาด `npm ERR! Missing script: "test:full"`
>    - **สิ่งที่ต้องแก้:** เพิ่ม script ใน Root `package.json` เช่น `"test:full": "npm --prefix server test && npm --prefix client test"` หรือปรับคำแนะนำใน `README.md` ให้ตรงกับคำสั่งที่ใช้งานได้จริง
> 
> 2. **[e2e/lab-04/visual-evidence.spec.ts] พาธบันทึกภาพหน้าจอของ Playwright ไม่ตรงกับโครงสร้างโฟลเดอร์ใน README และ Handout:**
>    - ใน `visual-evidence.spec.ts` (บรรทัด 139–163, 233–257, 325–333) กำหนดพาธเซฟภาพหน้าจอไปยัง `artifacts/lab-04/screenshots/dashboards/` และ `artifacts/lab-04/screenshots/actions/`
>    - แต่ตามโครงสร้างเอกสารใน `README.md` (บรรทัด 79–83) และที่ mirror เพิ่มเติมใน commit `19c5927` กำหนดให้จัดเก็บในโฟลเดอร์แยกตามหัวข้อ ได้แก่ `staff-dashboard/`, `requester-dashboard/`, และ `actions-taken/`
>    - ส่งผลให้เมื่อรันคำสั่ง `npx playwright test e2e/lab-04/visual-evidence.spec.ts` ในรอบถัดไป ภาพหน้าจอในโฟลเดอร์หลักจะไม่ได้รับการอัปเดตอัตโนมัติ และยังต้องคอยย้ายไฟล์ด้วยตนเอง
>    - **สิ่งที่ต้องแก้:** ปรับพาธเอาต์พุตใน `e2e/lab-04/visual-evidence.spec.ts` ให้บันทึกลงโฟลเดอร์ปลายทางที่ถูกต้องโดยตรง (`staff-dashboard/`, `requester-dashboard/`, และ `actions-taken/`) เพื่อให้เป็น Automated Pipeline สมบูรณ์
> 
> 3. **[docs/lab-04/reviewer.md] สถานะการรีวิว:**
>    - บันทึกข้อเสนอแนะและอัปเดตสถานะการประเมินของ Issue 35 / PR #77 ลงในตารางประวัติการรีวิวของ `docs/lab-04/reviewer.md`
> 
> **คำตัดสิน: Request Changes** — รบกวนแก้ไข 3 จุดนี้และพุชคอมมิตใหม่

### How partner responded (PR #77):
> 1. **Missing `test:full` Script in Root `package.json`:** Added `"test:server"`, `"test:client"`, `"test:full": "npm --prefix server test && npm --prefix client test"`, and `"build": "npm --prefix client run build"` into root `package.json`. Verified command runs both suites successfully (310/310 passing tests in 7.1s).
> 2. **Screenshot Save Paths in Playwright Spec:** Updated all output screenshot paths in `e2e/lab-04/visual-evidence.spec.ts` to save directly into `artifacts/lab-04/screenshots/staff-dashboard/`, `artifacts/lab-04/screenshots/requester-dashboard/`, and `artifacts/lab-04/screenshots/actions-taken/` automatically during test execution.
> 3. **Reviewer Tracking Record:** Recorded Round 1 review comments verbatim, updated summary table to `Changes Requested`, and detailed response actions in `docs/lab-04/reviewer.md`.

### My round 2 review comment for partner's PR #77:
> ### ข้อเสนอแนะเพิ่มเติม
> 
> จากการตรวจสอบความสมบูรณ์ของชุดทดสอบ E2E อย่างละเอียด พบจุดที่ต้องขอให้ปรับปรุงเพิ่มเติมก่อนอนุมัติ ดังนี้:
> 
> 1. **[False Positive Assertion ใน `dashboards.spec.ts`]:**
>    - ในบรรทัด 154–157 มีการเขียน `if (await ownerFilterSelect.isVisible())` โดยค้นหาจาก `<select>` แต่เนื่องจากใน `StaffTicketQueue.tsx` ตัวกรอง Ownership เป็นปุ่ม `<button>` ไม่ใช่ `<select>` ทำให้เงื่อนไขนี้เป็น `false` เสมอ และข้ามการ Assert ไปโดยสิ้นเชิง
>    - **สิ่งที่ต้องแก้:** ลบ `if` ออก และเปลี่ยนไปตรวจสอบปุ่ม Toggle เช่น:
>      `await expect(page.getByRole("button", { name: "Unassigned" })).toHaveClass(/staff-queue__toggle-btn--active/);`
> 
> 2. **[ขาดการ Assert Matching Count ใน `dashboards.spec.ts`]:**
>    - ตามสเปก `E2E-DASH-01` และ AC-11 กำหนดให้ทดสอบว่าคลิกการ์ดแล้วต้อง *"land on filtered queue matching count"* แต่ตัวเทสต์ยังไม่ได้ Assert ตรวจสอบจำนวนรายการในตารางคิวงานเลย
>    - **สิ่งที่ต้องแก้:** ปรับ Mock ตั๋วให้มี 2 ใบตรงกับตัวเลขบนการ์ด และเพิ่ม Assertion นับจำนวนแถวในตาราง
> 
> 3. **[README ระบุการทดสอบ 409 Conflict เกินจริงใน `ticket-resolution.spec.ts`]:**
>    - ใน `README.md` (บรรทัด 203) ระบุว่า `ticket-resolution.spec.ts` ครอบคลุม "409 Conflict handling on stale updates" แต่ในตัวเทสต์จริงมีเพียง Happy Path ของการ Resolve เท่านั้น
>    - **สิ่งที่ต้องแก้:** เพิ่มขั้นตอนการทดสอบกรณี 409 หรือปรับข้อความใน README ให้ตรงกับพฤติกรรมจริงของเทสต์
> 
> รบกวนปรับปรุง 3 จุดนี้เพื่อให้ Test Suite มีความน่าเชื่อถือสมบูรณ์ 100%

### How partner responded (round 2, PR #77):
> 1. **False-Positive Toggle Button Assertion (`dashboards.spec.ts`):** Removed conditional wrapper and asserted directly against button role: `await expect(page.getByRole("button", { name: "Unassigned" })).toHaveClass(/staff-queue__toggle-btn--active/)`.
> 2. **Missing Matching Count Parity Assertion (`dashboards.spec.ts`):** Updated mock to return 2 unassigned tickets when `ownerId=unassigned` and asserted `expect(page.locator(".staff-queue__table tbody tr")).toHaveCount(2)`, proving exact count parity with the unassigned metric card (`AC-11`).
> 3. **409 Conflict Handling Test in `ticket-resolution.spec.ts`:** Added dedicated automated test case `E2E-RES-02` in `ticket-resolution.spec.ts` simulating concurrent stale update, verifying that HTTP 409 Conflict triggers the conflict alert banner in the resolution modal dialog and requests fresh ticket data (`AC-08`).

### My approval review comment for partner's PR #77:
> ### คำตัดสินสุดท้าย (Final Verdict)
> 
> **คำตัดสิน: Approve**
> 
> **เหตุผล:** ข้อค้นพบและข้อสงสัยทั้งหมดจากรอบที่ 2 (REV2-01, REV2-02, REV2-03) ได้รับการแก้ไขที่ต้นเหตุอย่างครบถ้วนและประจักษ์ชัดในโค้ด:
> - ตัวกรอง Unassigned ได้รับการตรวจสอบบน Active Toggle Button จริง ปราศจาก False Positive
> - มีการ Assert ยืนยัน Matching Count Parity ตามข้อกำหนด `E2E-DASH-01` และ AC-11 ครบถ้วน
> - เพิ่มชุดทดสอบ E2E สำหรับ HTTP 409 Stale Update Concurrency Guard (AC-08) ตรงตามที่ระบุใน README อย่างแท้จริง
> - ชุดทดสอบทั้งหมด 310 Vitest tests และ 9 Playwright E2E tests ผ่าน 100% โค้ดมีคุณภาพและความน่าเชื่อถือสูงสุด
