import { StockItem } from "@/types";
import { getUrgency, sortByUrgency } from "@/lib/urgency";

interface ItemListProps {
  items: StockItem[];
  onEdit: (item: StockItem) => void;
  onDelete: (id: string) => void;
}

const LEVEL_STYLES: Record<string, string> = {
  overdue: "border-red-400 bg-red-50 dark:border-red-800 dark:bg-red-950",
  danger: "border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950",
  warning: "border-yellow-300 bg-yellow-50 dark:border-yellow-700 dark:bg-yellow-950",
  ok: "border-black/10 bg-white dark:border-white/10 dark:bg-black/20",
};

const BADGE_STYLES: Record<string, string> = {
  overdue: "bg-red-600 text-white",
  danger: "bg-red-600 text-white",
  warning: "bg-yellow-500 text-black",
  ok: "bg-black/10 text-black/60 dark:bg-white/10 dark:text-white/60",
};

export default function ItemList({ items, onEdit, onDelete }: ItemListProps) {
  const sorted = sortByUrgency(items);

  if (sorted.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-black/50 dark:text-white/50">
        まだ備蓄品が登録されていません
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {sorted.map((item) => {
        const urgency = getUrgency(item);
        const badgeText =
          urgency.level === "overdue"
            ? "期限切れ"
            : urgency.level === "ok"
              ? `残り${urgency.daysLeft}日`
              : `${urgency.label}（残り${urgency.daysLeft}日）`;

        return (
          <li
            key={item.id}
            className={`rounded-xl border p-4 ${LEVEL_STYLES[urgency.level]}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-bold">{item.name}</p>
                <p className="text-sm text-black/60 dark:text-white/60">
                  {item.category} ・ {item.location || "保管場所未設定"}
                </p>
                <p className="mt-1 text-sm">
                  {item.quantity}
                  {item.unit} ・{" "}
                  {item.expiryType === "best_before" ? "賞味期限" : "消費期限"}:{" "}
                  {item.expiryDate}
                </p>
              </div>
              <span
                className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${BADGE_STYLES[urgency.level]}`}
              >
                {badgeText}
              </span>
            </div>
            <div className="mt-3 flex justify-end gap-2 text-sm">
              <button
                onClick={() => onEdit(item)}
                className="rounded-lg px-3 py-1 font-medium text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950"
              >
                編集
              </button>
              <button
                onClick={() => onDelete(item.id)}
                className="rounded-lg px-3 py-1 font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
              >
                削除
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
