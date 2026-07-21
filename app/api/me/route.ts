import { NextResponse } from "next/server";
import { getOrCreateUid, getUser } from "@/lib/db";

export async function GET() {
  const uid = await getOrCreateUid();
  const user = await getUser(uid);
  return NextResponse.json({
    email: user?.email ?? null,
    verified: user?.verified ?? false,
  });
}
