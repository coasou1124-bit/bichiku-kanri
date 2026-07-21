import nodemailer from "nodemailer";
import { StockItem } from "@/types";
import { getUrgency } from "@/lib/urgency";

function getTransporter() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) {
    throw new Error("GMAIL_USER / GMAIL_APP_PASSWORD is not set");
  }
  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
}

function getAppUrl(): string {
  return process.env.APP_URL || "http://localhost:3000";
}

export async function sendVerificationEmail(email: string, token: string) {
  const transporter = getTransporter();
  const link = `${getAppUrl()}/api/verify?token=${token}`;
  await transporter.sendMail({
    from: `"備蓄管理" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: "【備蓄管理】メールアドレスの確認",
    text: `備蓄管理アプリのメール通知を有効にするには、以下のリンクをクリックしてください。\n\n${link}\n\n心当たりがない場合はこのメールを無視してください。`,
  });
}

export async function sendDigestEmail(email: string, items: StockItem[]) {
  const transporter = getTransporter();
  const lines = items
    .map((item) => {
      const urgency = getUrgency(item);
      const status =
        urgency.level === "overdue" ? "期限切れ" : `残り${urgency.daysLeft}日`;
      return `・${item.name}（${status}／${item.category}・${item.location || "保管場所未設定"}）`;
    })
    .join("\n");

  await transporter.sendMail({
    from: `"備蓄管理" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: `【備蓄管理】買い替えが必要な備蓄が${items.length}件あります`,
    text: `以下の備蓄品の期限が近づいています。買い替えをご検討ください。\n\n${lines}\n\n確認はこちら: ${getAppUrl()}`,
  });
}
