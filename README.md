# songsee — ส่งโลเคชั่นเข้า LINE อัตโนมัติตอน 9 โมง 🌅📍

โปรแกรมเล็กๆ (Node.js, ไม่มี dependency) สำหรับส่ง **หมุดโลเคชั่น** เข้า LINE
ทุกวันเวลา **9 โมงเช้า** โดยอัตโนมัติด้วย **GitHub Actions** ผ่าน **LINE Messaging API**

เริ่มทดลองในแชทส่วนตัวก่อนได้ แล้วค่อยเปลี่ยนปลายทางเป็นกลุ่มทีหลัง

---

## ภาพรวมการทำงาน

```
 มือถือ (iOS Shortcuts / Tasker)            GitHub
 ─────────────────────────────             ──────────────────────────
 ดึง GPS ปัจจุบัน  ──►  อัปเดต location.json  ──►  ตอน 9 โมง GitHub Actions
                       (ผ่าน GitHub API)          อ่าน location.json
                                                  แล้วส่งเข้า LINE  ──► 📱
```

> **ทำไมต้องให้มือถืออัปเดตไฟล์?**
> GitHub Actions รันบนคลาวด์ มันแตะ GPS ในมือถือคุณตรงๆ ไม่ได้
> เลยให้มือถือ "ฝากตำแหน่งล่าสุด" ไว้ใน `location.json` ก่อน
> พอถึง 9 โมง ตัว Action ก็หยิบตำแหน่งล่าสุดนั้นไปส่ง

---

## 1) เตรียม LINE Messaging API (ฟรี)

> หมายเหตุ: LINE Notify ปิดบริการแล้ว (31 มี.ค. 2025) จึงใช้ Messaging API แทน

1. เข้า [LINE Developers Console](https://developers.line.biz/console/) → สร้าง **Provider**
2. สร้าง channel แบบ **Messaging API**
3. ในแท็บ **Messaging API** → ออก **Channel access token (long-lived)** เก็บไว้
4. เพิ่มบอทเป็นเพื่อน (สแกน QR ในหน้าเดียวกัน) เพื่อให้ส่งหาเราในแชทส่วนตัวได้
5. หา **ปลายทาง (`LINE_TARGET_ID`)**:
   - **แชทส่วนตัว** → ใช้ `userId` ของคุณ (ขึ้นต้น `U...`)
   - **กลุ่ม** → ใช้ `groupId` (ขึ้นต้น `C...`) โดยเชิญบอทเข้ากลุ่มก่อน
   - วิธีหา id ที่ง่ายสุดคือเปิด webhook ชั่วคราวแล้วดู event `source`
     หรือใช้ปุ่มทดสอบใน LINE Developers Console

---

## 2) ทดสอบในเครื่อง (ก่อนต่อ automation จริง)

```bash
# ตั้งค่า
cp .env.example .env      # แล้วเติม LINE_CHANNEL_ACCESS_TOKEN และ LINE_TARGET_ID

# ใส่พิกัดทดสอบ (lat, lng)
npm run update -- 13.7563 100.5018 "ทดสอบจากในเครื่อง"

# ส่งเข้า LINE
# (โหลด .env เข้า env ก่อน เช่นใช้ set -a; source .env; set +a)
set -a && source .env && set +a
npm run send
```

ถ้าได้หมุดโลเคชั่นเด้งเข้า LINE = ใช้งานได้แล้ว ✅

---

## 3) ตั้งให้รันอัตโนมัติทุก 9 โมง (GitHub Actions)

1. push โค้ดนี้ขึ้น GitHub repo ของคุณ
2. ไปที่ **Settings → Secrets and variables → Actions → New repository secret**
   เพิ่ม 2 ตัว:
   - `LINE_CHANNEL_ACCESS_TOKEN`
   - `LINE_TARGET_ID`
3. workflow `.github/workflows/send-location.yml` ตั้ง cron ไว้แล้วที่
   `0 2 * * *` (= 02:00 UTC = **09:00 เวลาไทย**)
4. กดทดสอบได้ที่แท็บ **Actions → ส่งโลเคชั่นเข้า LINE ตอน 9 โมง → Run workflow**

> เวลา cron ของ GitHub อาจคลาดเคลื่อนได้ไม่กี่นาที (โดยเฉพาะช่วงชั่วโมงยอดนิยม)
> ถ้าต้องการตรงเป๊ะมาก แนะนำใช้ scheduler บนเซิร์ฟเวอร์/เครื่องตัวเองแทน

---

## 4) ให้มือถืออัปเดตตำแหน่งล่าสุดอัตโนมัติ

เป้าหมาย: ให้มือถือเขียนทับ `location.json` ใน repo ด้วยพิกัดปัจจุบัน
(เช่น ตั้งให้ยิงตอนเช้าก่อน 9 โมง หรือทุกครั้งที่ออกจากบ้าน)

### iOS — Shortcuts

สร้าง Shortcut ที่ทำขั้นตอนนี้:

1. **Get Current Location**
2. ดึง `Latitude` และ `Longitude`
3. **Get Contents of URL** ไปยัง GitHub Contents API:
   - URL: `https://api.github.com/repos/<USER>/<REPO>/contents/location.json`
   - Method: `PUT`
   - Headers:
     - `Authorization: Bearer <GITHUB_TOKEN ที่มีสิทธิ์ contents:write>`
     - `Accept: application/vnd.github+json`
   - Body (JSON):
     ```json
     {
       "message": "update location",
       "content": "<base64 ของ JSON ตำแหน่ง>",
       "sha": "<sha ปัจจุบันของ location.json>"
     }
     ```
   > GitHub Contents API ต้องส่ง `content` เป็น **base64** และต้องแนบ `sha`
   > ของไฟล์เดิม (GET มาก่อน) — ใน Shortcuts ใช้ action "Base64 Encode" ได้

ตัวอย่าง JSON ที่ encode เป็น base64 (รูปแบบเดียวกับ `npm run update`):

```json
{ "latitude": 13.7563, "longitude": 100.5018, "title": "ตำแหน่งล่าสุด", "address": "13.7563, 100.5018", "updatedAt": "2026-06-18T01:30:00Z" }
```

### Android — Tasker / HTTP Shortcuts

ใช้ Tasker (หรือแอป "HTTP Shortcuts") ดึง `%LOC` แล้วยิง `PUT` แบบเดียวกัน

> 💡 อยากให้ง่ายกว่านี้ บอกได้ครับ — ผมทำ workflow `repository_dispatch`
> หรือ endpoint รับพิกัดจากมือถือแบบ POST ครั้งเดียวจบให้ได้

---

## โครงสร้างไฟล์

| ไฟล์ | หน้าที่ |
|------|--------|
| `src/sendLocation.js` | อ่านตำแหน่งล่าสุด แล้วส่งเข้า LINE (entry point) |
| `src/line.js` | ฟังก์ชันคุยกับ LINE Messaging API |
| `src/location.js` | อ่าน/เขียน `location.json` |
| `src/updateLocation.js` | CLI อัปเดตพิกัด (`npm run update -- <lat> <lng>`) |
| `location.json` | เก็บพิกัดล่าสุด (มือถืออัปเดตไฟล์นี้) |
| `.github/workflows/send-location.yml` | ตัวตั้งเวลา 9 โมง |

---

## ปรับแต่ง

- **เปลี่ยนเวลา**: แก้ `cron` ใน workflow (จำไว้ว่าเป็น UTC)
- **ส่งเข้ากลุ่มแทนแชทส่วนตัว**: เปลี่ยน `LINE_TARGET_ID` เป็น `groupId`
- **เปลี่ยนข้อความทักทาย**: แก้ `LOCATION_GREETING` ใน workflow หรือ `.env`
