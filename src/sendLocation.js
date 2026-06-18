// จุดเริ่มต้นหลัก: อ่านตำแหน่งล่าสุด แล้วส่งเป็น location message เข้า LINE
// รันด้วย: npm run send
import { pushMessages, locationMessage } from "./line.js";
import { readLocation } from "./location.js";

async function main() {
  const accessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  const to = process.env.LINE_TARGET_ID;

  const loc = await readLocation();

  const messages = [];

  // ข้อความทักทาย (ปรับ/ลบได้ตามใจ)
  const greeting = process.env.LOCATION_GREETING;
  if (greeting) {
    messages.push({ type: "text", text: greeting });
  }

  messages.push(locationMessage(loc));

  await pushMessages({ accessToken, to, messages });

  const when = loc.updatedAt ? ` (อัปเดตเมื่อ ${loc.updatedAt})` : "";
  console.log(
    `✅ ส่งโลเคชั่นเข้า LINE แล้ว: ${loc.latitude}, ${loc.longitude}${when}`,
  );
}

main().catch((err) => {
  console.error("❌ ส่งไม่สำเร็จ:", err.message);
  process.exit(1);
});
