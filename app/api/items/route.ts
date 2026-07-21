import { NextRequest, NextResponse } from "next/server";
import { createItem, getOrCreateUid, listItems, NewItemInput } from "@/lib/db";

export async function GET() {
  const uid = await getOrCreateUid();
  const items = await listItems(uid);
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const uid = await getOrCreateUid();
  const body = (await req.json()) as NewItemInput;

  if (!body.name?.trim() || !body.expiryDate) {
    return NextResponse.json({ error: "invalid item" }, { status: 400 });
  }

  const item = await createItem(uid, body);
  return NextResponse.json(item, { status: 201 });
}
