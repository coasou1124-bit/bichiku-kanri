import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getOrCreateUid, setUserEmail } from "@/lib/db";
import { sendVerificationEmail } from "@/lib/mailer";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getClientIp(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

export async function POST(req: NextRequest) {
  const uid = await getOrCreateUid();
  const { email } = (await req.json()) as { email?: string };

  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "invalid email" }, { status: 400 });
  }

  // Same session: at most 1 (re)send per minute.
  const uidOk = await checkRateLimit(`subscribe:uid:${uid}`, 1, 1);
  // Same IP: at most 5 sends per hour, even across cleared cookies.
  const ipOk = await checkRateLimit(`subscribe:ip:${getClientIp(req)}`, 5, 60);

  if (!uidOk || !ipOk) {
    return NextResponse.json(
      { error: "too many requests, please try again later" },
      { status: 429 }
    );
  }

  const token = randomUUID();
  await setUserEmail(uid, email, token);
  await sendVerificationEmail(email, token);

  return NextResponse.json({ ok: true });
}
