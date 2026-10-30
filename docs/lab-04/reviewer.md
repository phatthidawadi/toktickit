# Lab 4 — Peer Review Record

**Author:** phatthidawadi — GitHub: [@phatthidawadi](https://github.com/phatthidawadi)  
**Peer reviewer:** chanya poolketkij — GitHub: [@chanya06](https://github.com/chanya06) (https://github.com/chanya06)

---

## Pull Requests I authored (reviewed by my partner @chanya06)

| PR | Branch | Reviewer verdict | Status |
|---|---|---|---|
| [PR #72](https://github.com/phatthidawadi/toktickit/pull/72) | `feature/26-doc-spec-tests` | Approved with comments | Pending Merge |
| PR #73 (Planned) | `feature/27-actions-taken-foundation` | Planned | Pending |
| PR #74 (Planned) | `feature/28-actions-taken-ui` | Planned | Pending |
| PR #75 (Planned) | `feature/29-ticket-workflow` | Planned | Pending |
| PR #76 (Planned) | `feature/30-role-dashboards` | Planned | Pending |
| PR #77 (Planned) | `feature/31-e2e-tests` | Planned | Pending |
| PR #78 (Planned) | `feature/32-visual-hardening` | Planned | Pending |
| PR #79 (Planned) | `feature/33-release-integration` | Planned | Pending |
| PR #80 (Planned) | `lab4-staging` -> `main` | Planned | Pending |

---

## Detailed Peer Review Logs

### Review on PR #72 (`feature/26-doc-spec-tests`)

**Reviewer (@chanya06) Initial Feedback:**
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

**Author (@phatthidawadi) Response & Resolution:**
> ขอบคุณสำหรับคำแนะนำที่ละเอียดและตรงจุดมากครับ! ได้ดำเนินการแก้ไขและปรับความสอดคล้องทั้ง 4 ประเด็นเรียบร้อยแล้วครับ:
>
> 1. **ความชัดเจนของ Ticket Transition & Authorization:**
>    - กำหนดให้การเปลี่ยนสถานะตั๋วอย่างเป็นทางการ (Formal Status Transition) รวมถึง `RESOLVED -> CLOSED` และ `RESOLVED -> REOPENED` ดำเนินการโดย **`IT_STAFF` และ `ADMINISTRATOR` เท่านั้น** ผ่าน `PATCH /api/staff/tickets/:id/status` (Requesters ได้รับ HTTP 403 Forbidden)
>    - บทบาทของ Requester ต่อสถานะตั๋วมีเพียง:
>      - ยกเลิกตั๋วของตนเองเมื่ออยู่ในสถานะ `NEW`: `NEW -> CANCELLED` ผ่าน `PATCH /api/tickets/:id/cancel`
>      - ส่งความเห็นเชิงแนะนำผ่าน Toggle "Problem Appears Resolved" ผ่าน `PATCH /api/tickets/:id/resolve-ack` ซึ่งเป็นเพียง Advisory indicator (`isRequesterResolved = true`) แต่ไม่เปลี่ยนสถานะตั๋ว
>      - ระบบ auto-transition ตั๋วจาก `WAITING_FOR_REQUESTER -> IN_PROGRESS` อัตโนมัติเมื่อ Requester ตอบคอมเมนต์ (BR-09)
>    - ได้ปรับปรุง [specification.md](file:///c:/Users/Acer/Downloads/Lab1_Starter_Scaffold/toktickit/docs/lab-04/specification.md) (ตาราง 5.1, 5.2), [api-spec.md](file:///c:/Users/Acer/Downloads/Lab1_Starter_Scaffold/toktickit/docs/lab-04/api-spec.md) (§3.1), [ui-spec.md](file:///c:/Users/Acer/Downloads/Lab1_Starter_Scaffold/toktickit/docs/lab-04/ui-spec.md) (§3.5), และ [tests.md](file:///c:/Users/Acer/Downloads/Lab1_Starter_Scaffold/toktickit/docs/lab-04/tests.md) ให้ตรงกัน 100%
>
> 2. **กำหนด Optimistic Locking และ Version ให้เป็น Mandatory ชัดเจน:**
>    - กำหนดให้ทุก mutation บน Ticket (`/api/staff/tickets/:id/status`, `/api/tickets/:id/resolve-ack`, `/api/tickets/:id/cancel`) และ Action Taken (`/api/actions/:id`) ต้องส่ง `"version": <integer>` เป็น **Mandatory field** ใน Request body
>    - หาก `version` ไม่ตรงกับฐานข้อมูลจะถูก reject ด้วย HTTP `409 Conflict` (`CONCURRENCY_CONFLICT`)
>    - อัปเดต contracts, error schema และ test cases (`ACT-API-09`, `FLOW-API-06`, `FLOW-API-07`, `FLOW-API-08`) ครบถ้วน
>
> 3. **เพิ่ม Performance-Smoke Test Coverage:**
>    - เพิ่มหมวด Performance-Smoke Tests ใน `tests.md` (§2.4) ได้แก่:
>      - `PERF-SMK-01`: Dashboard queries benchmark (`/api/dashboard/requester`, `/api/dashboard/staff`) latency p95 < 200ms ภายใต้ฐานข้อมูล 100+ tickets
>      - `PERF-SMK-02`: Actions Taken query latency (`/api/tickets/:id/actions`) latency p95 < 150ms สำหรับ ticket ที่มี 20+ action lines
>      - `PERF-SMK-03`: Burst concurrency conflict throughput (10 concurrent requests) latency เฉลี่ย < 300ms
>    - เพิ่ม `AC-17 (Performance-Smoke Benchmarks)` ใน `specification.md` และแมปลงใน Traceability Matrix
>
> 4. **เพิ่มไฟล์ประกอบ Lab 4:**
>    - จัดทำไฟล์ `docs/lab-04/reviewer.md` และ `docs/lab-04/ai-use.md` เพิ่มเติมเข้ามาใน PR นี้ทันที ทำให้โครงสร้างโฟลเดอร์ `docs/lab-04/` ครบทั้ง 6 ไฟล์ตามเกณฑ์ Handout Section 12 ครับ
