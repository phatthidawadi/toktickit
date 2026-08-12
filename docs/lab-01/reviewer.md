# Lab 1 — Peer Review Record

**Author:** phatthidawadi — GitHub: @phatthidawadi
**Peer reviewer:** <partner name> — <student id> — GitHub: @<username>

## Pull Requests I authored (reviewed by my partner)
| PR | Branch | Reviewer verdict |
|----|--------|------------------|
| [PR #7](https://github.com/phatthidawadi/toktickit/pull/7) | `feature/1-project-foundation` | Approved with comments |
| [PR #11](https://github.com/phatthidawadi/toktickit/pull/11) | `feature/2-health-check` | Approved with comments |

### Reviewer comment I received (PR #7):
"บิวทำ project foundation ได้ค่อนข้างเป็นระบบเลย โครงสร้างโปรเจกต์และการแยก branch ทำให้เห็นขอบเขตของงานชัดเจนดี 👍 โดยรวมโอเคและสามารถต่อยอดในส่วนของ feature อื่น ๆ ได้ง่ายขึ้น ถ้ามีโอกาสอยากให้เพิ่มรายละเอียดใน README เกี่ยวกับวิธี setup และการ run project อีกนิด จะช่วยให้คนอื่นในทีม clone แล้วเริ่มทำงานต่อได้ง่ายขึ้น"

### How I responded (PR #7):
"ขอบคุณสำหรับคำแนะนำครับ! ได้ทำการเพิ่มรายละเอียดวิธีการ Setup โปรเจกต์, การตั้งค่า Environment Variables, การเชื่อมต่อ Database และวิธี Run โปรเจกต์อย่างละเอียดลงใน README.md เรียบร้อยแล้วครับ เพื่อให้คนอื่นในทีมทำงานต่อได้ง่ายขึ้นครับ"

### Reviewer comment I received (PR #11):
"โค้ดดูเรียบง่ายและตรงประเด็นมากกก! ฝากเช็ก 2 จุดสั้นๆ ก่อน Merge : คืนค่า HTTP Status 200 พร้อม JSON สั้นๆ (เช่น { "status": "ok" }) ตรงตาม Spec ใช่ไหม, มีการใส่ Cache-Control: no-cache เพื่อให้ตัว Monitor ดึงค่า Real-time เสมอหรือยัง"

### How I responded (PR #11):
"ขอบคุณที่ช่วยเช็คครับ! โค้ดส่ง JSON { "status": "ok", "service": "TokTickIT API" } ตาม spec แล้วครับ และได้เพิ่ม `res.setHeader("Cache-Control", "no-cache");` เพื่อให้มั่นใจว่า Monitor จะดึงค่าใหม่ล่าสุดเสมอเรียบร้อยแล้วครับ"

## Pull Requests I reviewed for my partner
### My comment:
"Pending peer review."

### Partner's response:
"Pending partner response."
