import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getOrCreateUid, setUserEmail } from "@/lib/db";
import { sendVerificationEmail } from "@/lib/mailer";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  const uid = await getOrCreateUid();
  const { email } = (await req.json()) as { email?: string };

  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "invalid email" }, { status: 400 });
  }

  const token = randomUUID();
  await setUserEmail(uid, email, token);
  await sendVerificationEmail(email, token);

  return NextResponse.json({ ok: true });
}
