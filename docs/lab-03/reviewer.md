# Lab 3 — Peer Review Record

**Author:** phatthidawadi — GitHub: @phatthidawadi
**Peer reviewer:** jejaebubu — GitHub: @jejaebubu (https://github.com/jejaebubu)

## Pull Requests I authored (reviewed by my partner)

| PR | Branch | Reviewer verdict |
|---|---|---|
| [PR #51](https://github.com/phatthidawadi/toktickit/pull/51) | `feature/15-doc-spec-tests` | Pending |

---

### Reviewer comment I received (PR #51):
"โดยรวมเอกสารค่อนข้างละเอียดและโครงสร้างดีเลยค่ะ ข้อเสนอแนะ 15 ประเด็น:
P1: (1) specification.md §7 Ticket model requestedPriority/itPriority ใช้อีนัมและลบ default MEDIUM (2) tests.md AC Traceability Matrix เพิ่ม UI-LOGIN-02, UI-NOTE-01, UI-ADMIN-02 (3) tests.md / PR description ปรับจำนวน test case เป็น 51 เคสให้ตรงกัน (4) api-spec.md อธิบาย Stateless JWT logout & cookie clearing ให้ชัดเจน (5) specification.md DoD ปรับเป็น AC-01 to AC-21
P2: (6) api-spec.md เพิ่ม section Requester APIs compatibility (7) specification.md BR-10 ระบุ auto-transition IN_PROGRESS เมื่อ Requester ส่ง comment (8) api-spec.md priority_desc เรียงตาม itPriority descending (9) api-spec.md PATCH /api/admin/users/:id เพิ่ม 409 Conflict duplicate email (10) ui-spec.md เพิ่ม Requester Ticket Detail screen spec (11) specification.md Migration strategy เพิ่มรายละเอียดการย้ายข้อมูล RequesterUser
P3: (12) tests.md แก้ MIG-API-01 requirement ref (13) tests.md เพิ่ม SEC-AUTH-03, API-ADM-05, API-REQ-REG-01 (14) specification.md mustChangePassword default(true) (15) specification.md BR-10 อธิบาย auto-claim ชัดเจน"

### How I responded (PR #51):
"ขอบคุณมากสำหรับการตรวจทานเอกสารสเปกและแผนการทดสอบอย่างละเอียด ได้ดำเนินการแก้ไขและปรับปรุงทั้ง 15 ประเด็นในเอกสารเรียบร้อยแล้ว:
1. specification.md: กำหนด Prisma TicketPriority & TicketStatus enum, ปรับ mustChangePassword default เป็น true, อธิบาย auto-claim และ auto IN_PROGRESS status transition ใน BR-10, ขยาย migration strategy และปรับ DoD เป็น AC-01 to AC-21
2. api-spec.md: Clarify Stateless JWT cookie clearing บน Logout, ระบุ priority_desc เรียงตาม itPriority, เพิ่ม 409 Conflict สำหรับ duplicate email บน edit user และเพิ่ม Section 3 สำหรับ Requester APIs compatibility
3. ui-spec.md: เพิ่ม Section 3.6 สำหรับ Requester My Tickets & Ticket Detail Screen Specification
4. tests.md: เพิ่ม test IDs (UI-LOGIN-02, UI-NOTE-01, UI-ADMIN-02, SEC-AUTH-03, API-ADM-05, API-REQ-REG-01), ปรับจำนวนรวมเป็น 51 test cases และแก้ MIG-API-01 reference
พร้อมให้พาร์ทเนอร์ตรวจทานเพื่อ Approve และ Merge เข้า lab3-staging ถัดไปครับ"
