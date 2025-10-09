import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import fs from "fs/promises";
import path from "path";

const DATA_PATH = path.join(process.cwd(), "src/lib/dao/hosting-availability.json");

async function readData() {
  try {
    const raw = await fs.readFile(DATA_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    return {};
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
  const data = await readData();
  const userId = String(session.user?.id);
  return Response.json(data[userId] || {});
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }
  const userId = String(session.user?.id);
  const body = await req.json();
  const data = await readData();
  data[userId] = {
    dates: body.dates,
    frequencyWeek: body.frequencyWeek,
    frequencyMonth: body.frequencyMonth,
    updated: new Date().toISOString(),
  };
  await writeData(data);
  return Response.json({ success: true });
}
