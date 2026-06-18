// LINE Messaging API helpers
// เอกสาร: https://developers.line.biz/en/reference/messaging-api/#send-push-message

const PUSH_ENDPOINT = "https://api.line.me/v2/bot/message/push";

/**
 * ส่ง push message ไปยังผู้ใช้/กลุ่ม ผ่าน LINE Messaging API
 *
 * @param {object} opts
 * @param {string} opts.accessToken  Channel access token (long-lived)
 * @param {string} opts.to           userId (แชทส่วนตัว) หรือ groupId (กลุ่ม)
 * @param {object[]} opts.messages   array ของ message objects (สูงสุด 5 ข้อความ)
 */
export async function pushMessages({ accessToken, to, messages }) {
  if (!accessToken) throw new Error("ไม่มี LINE_CHANNEL_ACCESS_TOKEN");
  if (!to) throw new Error("ไม่มี LINE_TARGET_ID (userId หรือ groupId)");

  const res = await fetch(PUSH_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ to, messages }),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`LINE API ตอบกลับ ${res.status}: ${detail}`);
  }

  return res;
}

/**
 * สร้าง location message object ตาม schema ของ LINE
 * https://developers.line.biz/en/reference/messaging-api/#location-message
 */
export function locationMessage({ title, address, latitude, longitude }) {
  return {
    type: "location",
    // LINE จำกัด title <= 100 ตัวอักษร, address <= 100 ตัวอักษร
    title: String(title ?? "ตำแหน่งล่าสุด").slice(0, 100),
    address: String(address ?? `${latitude}, ${longitude}`).slice(0, 100),
    latitude: Number(latitude),
    longitude: Number(longitude),
  };
}
