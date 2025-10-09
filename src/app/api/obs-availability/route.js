import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "src", "lib", "dao", "obs-availability.json");

export async function GET() {
  try {
    let openDates = [];
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, "utf-8");
      openDates = JSON.parse(raw).openDates || [];
    }
    return NextResponse.json({ openDates });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { openDates } = await req.json();
    fs.writeFileSync(DATA_FILE, JSON.stringify({ openDates }, null, 2));
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}