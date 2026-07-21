import { NextRequest, NextResponse } from "next/server";
import { listVerifiedUsersWithItems, markNotified } from "@/lib/db";
import { getUrgency } from "@/lib/urgency";
import { sendDigestEmail } from "@/lib/mailer";

export const maxDuration = 60;

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const users = await listVerifiedUsersWithItems();
  let emailsSent = 0;

  for (const user of users) {
    const dueItems = user.items.filter((item) => {
      const urgency = getUrgency(item);
      if (urgency.level !== "danger" && urgency.level !== "overdue") return false;
      if (!item.lastNotifiedAt) return true;
      return Date.now() - new Date(item.lastNotifiedAt).getTime() >= WEEK_MS;
    });

    if (dueItems.length === 0) continue;

    await sendDigestEmail(user.email, dueItems);
    await markNotified(dueItems.map((item) => item.id));
    emailsSent += 1;
  }

  return NextResponse.json({ ok: true, emailsSent });
}
