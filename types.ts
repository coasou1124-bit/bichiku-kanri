export type ExpiryType = "best_before" | "use_by";
export type AlertLead = number; // 警告を出し始める日数（期限の何日前から）

export interface StockItem {
  id: string;
  name: string;
  category: string;
  location: string;
  quantity: number;
  unit: string;
  expiryType: ExpiryType | null;
  expiryDate: string | null; // ISO date (YYYY-MM-DD), null = 期限なし
  alertLead: AlertLead | null;
}

export const CATEGORY_PRESETS = [
  "非常食",
  "飲料水",
  "医薬品",
  "衛生用品",
  "燃料",
  "その他",
] as const;

export const LOCATION_PRESETS = [
  "玄関収納",
  "リビング",
  "キッチン",
  "クローゼット",
  "車",
  "非常持ち出しリュックA",
  "非常持ち出しリュックB",
] as const;

export const ALERT_LEAD_PRESETS: { label: string; days: number }[] = [
  { label: "3ヶ月前から", days: 90 },
  { label: "1ヶ月前から", days: 30 },
  { label: "2週間前から", days: 14 },
  { label: "1週間前から", days: 7 },
  { label: "3日前から", days: 3 },
];
