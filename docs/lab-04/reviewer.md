# Lab 4 — Peer Review Record

**Author:** phatthidawadi — GitHub: @phatthidawadi  
**Peer reviewer:** chanya poolketkij — GitHub: @chanya06 (https://github.com/chanya06)

## Pull Requests I authored (reviewed by my partner)

| PR | Branch | Reviewer verdict |
|---|---|---|
| [PR #72](https://github.com/phatthidawadi/toktickit/pull/72) | `feature/26-doc-spec-tests` | Approved with comments |
| [PR #73](https://github.com/phatthidawadi/toktickit/pull/73) | `feature/27-actions-taken-foundation` | Approved with comments |

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

## Pull Requests I reviewed (authored by my partner)

| PR | Branch | My review verdict |
|---|---|---|
| [PR #72](https://github.com/chanya06/toktickit/pull/72) | `feature/29-spec-and-tests` | Pending Review |

---

### My review comment for partner's PR #72:
"Pending peer review."

### How partner responded (PR #72):
"Pending partner response."

### My approval review comment for partner's PR #72:
"Pending approval."
