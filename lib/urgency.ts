import { StockItem } from "@/types";

export type UrgencyLevel = "overdue" | "danger" | "warning" | "ok" | "none";

export interface UrgencyInfo {
  level: UrgencyLevel;
  daysLeft: number;
  label: string;
}

function startOfToday(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export function getDaysLeft(expiryDate: string): number {
  const today = startOfToday();
  const expiry = new Date(expiryDate);
  const expiryStart = new Date(
    expiry.getFullYear(),
    expiry.getMonth(),
    expiry.getDate()
  );
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round((expiryStart.getTime() - today.getTime()) / msPerDay);
}

export function getUrgency(item: StockItem): UrgencyInfo {
  if (!item.expiryDate || item.alertLead == null) {
    return { level: "none", daysLeft: Infinity, label: "期限なし" };
  }

  const daysLeft = getDaysLeft(item.expiryDate);
  const { alertLead } = item;

  if (daysLeft < 0) {
    return { level: "overdue", daysLeft, label: "期限切れ" };
  }
  if (daysLeft <= alertLead) {
    return { level: "danger", daysLeft, label: "買い替えてください" };
  }
  if (daysLeft <= alertLead * 2) {
    return { level: "warning", daysLeft, label: "そろそろ確認" };
  }
  return { level: "ok", daysLeft, label: "" };
}

export function sortByUrgency(items: StockItem[]): StockItem[] {
  return [...items].sort((a, b) => {
    if (!a.expiryDate && !b.expiryDate) return a.name.localeCompare(b.name);
    if (!a.expiryDate) return 1;
    if (!b.expiryDate) return -1;
    return getDaysLeft(a.expiryDate) - getDaysLeft(b.expiryDate);
  });
}
