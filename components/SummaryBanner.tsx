import { StockItem } from "@/types";
import { getUrgency } from "@/lib/urgency";

export default function SummaryBanner({ items }: { items: StockItem[] }) {
  const urgent = items
    .map((item) => ({ item, urgency: getUrgency(item) }))
    .filter(({ urgency }) => urgency.level === "danger" || urgency.level === "overdue");

  if (urgent.length === 0) return null;

  return (
    <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100">
      <p className="font-bold">
        ⚠️ 買い替えが必要な備蓄が {urgent.length} 件あります
      </p>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
        {urgent.map(({ item, urgency }) => (
          <li key={item.id}>
            {item.name}（
            {urgency.level === "overdue"
              ? "期限切れ"
              : `残り${urgency.daysLeft}日`}
            ）
          </li>
        ))}
      </ul>
    </div>
  );
}
