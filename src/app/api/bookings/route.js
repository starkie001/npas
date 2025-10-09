export async function PATCH(req) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }
  const userId = String(session.user?.id);
  const url = new URL(req.url);
  const bookingId = url.searchParams.get("id");
  if (!bookingId) return new Response("Missing booking id", { status: 400 });
  let data = await readData();
  const idx = data.findIndex(b => b.id === bookingId);
  if (idx === -1) return new Response("Booking not found", { status: 404 });
  // Only allow if user is host, lead host, member, or admin
  const allowed = ["member", "leader", "admin"].includes(session.user?.role);
  if (!allowed) return new Response("Forbidden", { status: 403 });
  // Mark as confirmed for this user
  if (!data[idx].confirmed) data[idx].confirmed = [];
  if (!data[idx].confirmed.includes(userId)) data[idx].confirmed.push(userId);
  await writeData(data);
  return Response.json({ success: true });
}
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import fs from "fs/promises";
import path from "path";

const DATA_PATH = path.join(process.cwd(), "src/lib/dao/bookings.json");

async function readData() {
  try {
    const raw = await fs.readFile(DATA_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function writeData(data) {
  await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2));
}

export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }
  const userId = String(session.user?.id);
  const data = await readData();
  // Show bookings for this user, or all if admin
  const role = session.user?.role;
  let bookings;
  if (role === "admin") {
    bookings = data;
  } else {
    bookings = data.filter(b => b.userId === userId || (b.hosts && b.hosts.includes(userId)));
  }
  return Response.json(bookings);
}

export async function DELETE(req) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }
  const userId = String(session.user?.id);
  const url = new URL(req.url);
  const bookingId = url.searchParams.get("id");
  if (!bookingId) return new Response("Missing booking id", { status: 400 });
  let data = await readData();
  data = data.filter(b => b.id !== bookingId || (session.user.role !== "admin" && b.userId !== userId));
  await writeData(data);
  return Response.json({ success: true });
}
