import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, createItem, getOrCreateUid, listItems, NewItemInput } from "@/lib/db";

export async function GET() {
  const uid = await getOrCreateUid();
  const items = await listItems(uid);
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const uid = await getOrCreateUid();
  const body = (await req.json()) as NewItemInput;

  if (!body.name?.trim()) {
    return NextResponse.json({ error: "invalid item" }, { status: 400 });
  }

  // Generous cap per session so normal use is unaffected, but scripted
  // flooding of the database is blocked.
  const ok = await checkRateLimit(`items:create:${uid}`, 50, 60);
  if (!ok) {
    return NextResponse.json(
      { error: "too many requests, please try again later" },
      { status: 429 }
    );
  }

  const item = await createItem(uid, body);
  return NextResponse.json(item, { status: 201 });
}
