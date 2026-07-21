import { NextRequest, NextResponse } from "next/server";
import { verifyUserByToken } from "@/lib/db";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  const base = req.nextUrl.origin;

  if (!token) {
    return NextResponse.redirect(`${base}/?verified=0`);
  }

  const user = await verifyUserByToken(token);
  return NextResponse.redirect(`${base}/?verified=${user ? "1" : "0"}`);
}
