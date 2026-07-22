import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getOrCreateUid, setUserEmail } from "@/lib/db";
import { sendVerificationEmail } from "@/lib/mailer";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getClientIp(req: NextRequest): string {
  // x-forwarded-for can be seeded by the client itself (e.g. "1.2.3.4, <real ip>"),
  // so a spoofed value would land first in the list. Vercel's edge always appends
  // the true peer IP as the last hop, so prefer that over trusting entry [0].
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const parts = forwardedFor.split(",").map((p) => p.trim());
    return parts[parts.length - 1] || "unknown";
  }
  return req.headers.get("x-real-ip") || "unknown";
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
