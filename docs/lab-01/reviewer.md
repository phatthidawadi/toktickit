# Lab 1 — Peer Review Record

**Author:** phatthidawadi — GitHub: @phatthidawadi
**Peer reviewer:** <partner name> — <student id> — GitHub: @<username>

## Pull Requests I authored (reviewed by my partner)
| PR | Branch | Reviewer verdict |
|----|--------|------------------|
| [PR #7](https://github.com/phatthidawadi/toktickit/pull/7) | `feature/1-project-foundation` | Approved with comments |
| [PR #11](https://github.com/phatthidawadi/toktickit/pull/11) | `feature/2-health-check` | Approved with comments |
| [PR #12](https://github.com/phatthidawadi/toktickit/pull/12) | `feature/3-category-seed` | Approved with comments |

### Reviewer comment I received (PR #7):
"บิวทำ project foundation ได้ค่อนข้างเป็นระบบเลย โครงสร้างโปรเจกต์และการแยก branch ทำให้เห็นขอบเขตของงานชัดเจนดี 👍 โดยรวมโอเคและสามารถต่อยอดในส่วนของ feature อื่น ๆ ได้ง่ายขึ้น ถ้ามีโอกาสอยากให้เพิ่มรายละเอียดใน README เกี่ยวกับวิธี setup และการ run project อีกนิด จะช่วยให้คนอื่นในทีม clone แล้วเริ่มทำงานต่อได้ง่ายขึ้น"

### How I responded (PR #7):
"ขอบคุณสำหรับคำแนะนำครับ! ได้ทำการเพิ่มรายละเอียดวิธีการ Setup โปรเจกต์, การตั้งค่า Environment Variables, การเชื่อมต่อ Database และวิธี Run โปรเจกต์อย่างละเอียดลงใน README.md เรียบร้อยแล้วครับ เพื่อให้คนอื่นในทีมทำงานต่อได้ง่ายขึ้นครับ"

### Reviewer comment I received (PR #11):
"โค้ดดูเรียบง่ายและตรงประเด็นมากกก! ฝากเช็ก 2 จุดสั้นๆ ก่อน Merge : คืนค่า HTTP Status 200 พร้อม JSON สั้นๆ (เช่น { "status": "ok" }) ตรงตาม Spec ใช่ไหม, มีการใส่ Cache-Control: no-cache เพื่อให้ตัว Monitor ดึงค่า Real-time เสมอหรือยัง"

"บิวทำส่วน API Health Check ได้ตรงตาม requirement และแก้จาก stub ที่ return 501 มาเป็น HTTP 200 พร้อม response { status: "ok", service: "TokTickIT API" } ได้ชัดเจนดี อีกจุดที่ชอบคือมีการอัปเดต test evidence และ documentation ควบคู่ไปกับ implementation ทำให้เห็นว่าไม่ได้โฟกัสแค่เขียนโค้ด แต่มีการตรวจสอบผลลัพธ์ของ feature ด้วย โดยเฉพาะการบันทึกผลจาก Supertest ว่า health check ผ่านแล้ว ส่วนที่อยากแนะนำเพิ่มเติมคือใน docs/lab-01/tests.md ตอนนี้ส่วนของ Issue 4 ยังมีข้อความ Paste your passing terminal output / screenshot below. และ test ของ /api/categories ยังไม่ได้ใส่ Result ทำให้ documentation ดูเหมือนยังไม่สมบูรณ์ ถึงแม้ส่วนที่ทำใน PR นี้จะเป็น Issue 2 ก็ตาม ถ้าเคลียร์ placeholder หรือระบุให้ชัดว่า test ไหนเป็นของ PR นี้ จะช่วยให้ reviewer แยก test evidence ของแต่ละ issue ได้ง่ายขึ้น โดยรวม implementation ค่อนข้าง clean และ scope ของ PR ชัดเจนมาก การเพิ่ม test evidence กับ reflection ทำให้เห็นกระบวนการทำงานและการตรวจสอบงานได้ดี ถ้าเก็บรายละเอียดใน documentation ให้เรียบร้อยอีกนิด งานจะดู complete และพร้อม merge มากขึ้นครับ"

"โดยรวมการทำ Health Check และการเขียน test มาถูกทางแล้วจ้าบิว แต่มีจุดที่ต้องแก้ก่อน Merge คือใน server/src/app.ts endpoint /api/health ยังมีการส่ง response ทั้ง 501 และ 200 ใน endpoint เดียวกัน ซึ่งควรเหลือเฉพาะ response 200 ตาม Acceptance Criteria แล้วก็ใน tests.md ระบุว่า Health Check test ผ่านแล้ว แนะนำให้รัน test ใหม่หลังแก้ app.ts และอัปเดต test evidence ให้ตรงกับ code ล่าสุดด้วยก้จะเริ่ดเลย"

### How I responded (PR #11):
"ขอบคุณที่ช่วยเช็คครับ! โค้ดส่ง JSON ตาม spec แล้วครับ และได้เพิ่ม `res.setHeader("Cache-Control", "no-cache");` เข้าไปแล้วครับ นอกจากนี้ยังได้ปรับปรุงไฟล์ `tests.md` โดยลบ placeholder ของ Issue 4 ออกชั่วคราวและระบุว่าเป็น Pending เพื่อไม่ให้สับสนกับ Test Evidence ของ Issue 2 เรียบร้อยแล้วครับ ขอบคุณสำหรับคำแนะนำเรื่อง documentation มากครับ!"

"ขอบคุณสำหรับการตรวจสอบอย่างละเอียดอีกครั้งครับ! จากการตรวจสอบไฟล์ `app.ts` ใน commit ล่าสุด พบว่าได้ลบ stub 501 ออกไปแล้วเหลือเพียง 200 ตาม acceptance criteria เรียบร้อยครับ ทั้งนี้ได้ทำการรัน Test ใหม่อีกครั้งเพื่อยืนยัน และได้อัปเดต Test Evidence ล่าสุดลงใน `tests.md` ให้เรียบร้อยแล้วครับ"

### Reviewer comment I received (PR #12):
"บิวทำ Category Model และ Seed ได้ตรง requirement ดี โดยใช้ `name @unique` และ `upsert` ทำให้สามารถ seed ซ้ำได้โดยไม่เกิด category ซ้ำ ถือว่าออกแบบได้เหมาะกับงานนี้ มีจุดที่แนะนำให้แก้ก่อน merge คือยังมี TODO/comment เก่าค้างใน `schema.prisma` และ `seed.ts` รวมถึง `console.log("TODO: implement the category seed.")` ทั้งที่ implementation เสร็จแล้ว ควรลบออกให้ code สะอาดขึ้น และใน `ai_use.md` ยังมี placeholder กับจำนวน prompt ที่ยังไม่ครบตามหัวข้อ 6–10 ข้อ ถ้าเติมส่วนนี้ให้ครบ งานจะดู complete และพร้อม merge มากขึ้น"

### How I responded (PR #12):
"ขอบคุณมากครับ! ผมได้ทำการลบ comment แนะนำและบรรทัด TODO ออกจากไฟล์ `schema.prisma` และ `seed.ts` จนคลีนเรียบร้อยแล้วครับ รวมถึงได้เพิ่มประวัติ Prompt ของ AI ในไฟล์ `ai_use.md` ให้ครบถ้วนไม่มี placeholder เหลือแล้วครับ"

## Pull Requests I reviewed for my partner
### My comment:
"Pending peer review."

### Partner's response:
"Pending partner response."
