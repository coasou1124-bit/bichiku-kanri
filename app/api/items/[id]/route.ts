import { NextRequest, NextResponse } from "next/server";
import { deleteItem, getOrCreateUid, NewItemInput, updateItem } from "@/lib/db";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const uid = await getOrCreateUid();
  const body = (await req.json()) as NewItemInput;

  if (!body.name?.trim()) {
    return NextResponse.json({ error: "invalid item" }, { status: 400 });
  }

  const item = await updateItem(uid, id, body);
  if (!item) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return NextResponse.json(item);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const uid = await getOrCreateUid();
  await deleteItem(uid, id);
  return NextResponse.json({ ok: true });
}
