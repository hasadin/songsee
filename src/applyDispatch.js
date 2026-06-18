// รับพิกัดจาก repository_dispatch (มือถือยิงมา) แล้วเขียนลง location.json
// ใช้ค่าจาก env: LAT, LNG, ADDRESS (มาจาก client_payload ใน workflow)
import { writeLocation } from "./location.js";

const latitude = Number(process.env.LAT);
const longitude = Number(process.env.LNG);
const address = process.env.ADDRESS || undefined;

if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
  console.error("❌ payload ไม่มี lat/lng ที่ถูกต้อง:", {
    LAT: process.env.LAT,
    LNG: process.env.LNG,
  });
  process.exit(1);
}

const saved = await writeLocation({ latitude, longitude, address });
console.log("✅ อัปเดตตำแหน่งล่าสุดจากมือถือแล้ว:");
console.log(JSON.stringify(saved, null, 2));
