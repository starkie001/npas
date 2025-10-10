import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import fs from "fs/promises";
import path from "path";

const BOOKINGS_PATH = path.join(process.cwd(), "src/lib/dao/bookings.json");
const AVAILABILITY_PATH = path.join(process.cwd(), "src/lib/dao/obs-availability.json");
const SETTINGS_PATH = path.join(process.cwd(), "src/lib/dao/obs-availability-settings.json");

async function readJson(path) {
  try {
    const raw = await fs.readFile(path, "utf-8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function GET(req) {
  // /api/bookings/available-dates?groupSize=...&groupType=...
  const url = new URL(req.url);
  const groupSize = parseInt(url.searchParams.get("groupSize"), 10);
  const groupType = url.searchParams.get("groupType");
  if (!groupSize || !groupType) return Response.json({ dates: [] });

  // Load open nights
  const openData = await readJson(AVAILABILITY_PATH);
  const openDates = openData?.openDates || [];

  // Load requirements
  const settings = await readJson(SETTINGS_PATH);
  const requirements = settings?.requirements || [];

  // Load bookings
  const bookings = await readJson(BOOKINGS_PATH) || [];

  // For Member group type, all open nights are available except those already booked (pending/confirmed)
  let unavailableDates = bookings
    .filter(b => ["pending", "confirmed"].includes(b.status))
    .map(b => b.date);

  if (groupType === "Member") {
    const available = openDates.filter(d => !unavailableDates.includes(d));
    return Response.json({ dates: available });
  }

  // Find requirement row for group size
  const reqRow = requirements.find(r => groupSize >= r.groupMin && groupSize <= r.groupMax);
  if (!reqRow) return Response.json({ dates: [] });

  // For other group types, exclude dates already booked (pending/confirmed)
  const available = openDates.filter(d => !unavailableDates.includes(d));
  // TODO: Filter available by host/lead host availability
  return Response.json({ dates: available });
}
