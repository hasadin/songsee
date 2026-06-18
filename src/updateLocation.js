// อัปเดตตำแหน่งล่าสุดลง location.json
// ใช้ตอนเทสในเครื่อง หรือเป็นตัวอย่างค่าที่มือถือควรส่งมา
//
// ตัวอย่าง:
//   npm run update -- 13.7563 100.5018
//   npm run update -- 13.7563 100.5018 "หน้าออฟฟิศ สีลม"
import { writeLocation } from "./location.js";

const [, , latArg, lngArg, ...rest] = process.argv;

if (latArg === undefined || lngArg === undefined) {
  console.error("วิธีใช้: npm run update -- <latitude> <longitude> [address]");
  process.exit(1);
}

const latitude = Number(latArg);
const longitude = Number(lngArg);

if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
  console.error("❌ latitude / longitude ต้องเป็นตัวเลข");
  process.exit(1);
}

const address = rest.join(" ") || undefined;

const saved = await writeLocation({ latitude, longitude, address });
console.log("✅ บันทึกตำแหน่งล่าสุดแล้ว:");
console.log(JSON.stringify(saved, null, 2));
