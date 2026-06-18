// อ่าน/เขียน ตำแหน่งล่าสุดที่เก็บไว้ในไฟล์ location.json
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
export const LOCATION_FILE = join(__dirname, "..", "location.json");

/**
 * อ่านตำแหน่งล่าสุดจาก location.json
 * ถ้ามี env DEFAULT_LAT / DEFAULT_LNG จะใช้ override (เผื่อยังไม่มีไฟล์)
 */
export async function readLocation() {
  let data = {};
  try {
    data = JSON.parse(await readFile(LOCATION_FILE, "utf8"));
  } catch (err) {
    if (err.code !== "ENOENT") throw err;
  }

  const latitude = pickNumber(process.env.DEFAULT_LAT, data.latitude);
  const longitude = pickNumber(process.env.DEFAULT_LNG, data.longitude);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    throw new Error(
      "ยังไม่มีพิกัด — กรุณาอัปเดต location.json (npm run update -- <lat> <lng>) " +
        "หรือกำหนด env DEFAULT_LAT / DEFAULT_LNG",
    );
  }

  return {
    latitude,
    longitude,
    title: process.env.LOCATION_TITLE || data.title || "ตำแหน่งล่าสุด",
    address:
      process.env.LOCATION_ADDRESS ||
      data.address ||
      `${latitude}, ${longitude}`,
    updatedAt: data.updatedAt || null,
  };
}

/** เขียนตำแหน่งล่าสุดลง location.json */
export async function writeLocation({ latitude, longitude, title, address }) {
  const payload = {
    latitude: Number(latitude),
    longitude: Number(longitude),
    title: title || "ตำแหน่งล่าสุด",
    address: address || `${latitude}, ${longitude}`,
    updatedAt: new Date().toISOString(),
  };
  await writeFile(LOCATION_FILE, JSON.stringify(payload, null, 2) + "\n");
  return payload;
}

function pickNumber(...candidates) {
  for (const c of candidates) {
    if (c === undefined || c === null || c === "") continue;
    const n = Number(c);
    if (Number.isFinite(n)) return n;
  }
  return NaN;
}
