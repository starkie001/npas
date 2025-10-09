import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "src", "lib", "dao", "obs-availability-settings.json");

export async function GET() {
  try {
    let settings = { bookingsActive: true, requirements: [] };
    if (fs.existsSync(DATA_FILE)) {
      settings = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
    }
    return NextResponse.json(settings);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    fs.writeFileSync(DATA_FILE, JSON.stringify(body, null, 2));
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
