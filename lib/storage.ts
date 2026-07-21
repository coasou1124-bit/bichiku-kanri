import { StockItem } from "@/types";

const STORAGE_KEY = "bichiku-items";

export function getItems(): StockItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as StockItem[];
  } catch {
    return [];
  }
}

export function saveItems(items: StockItem[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function upsertItem(items: StockItem[], item: StockItem): StockItem[] {
  const exists = items.some((i) => i.id === item.id);
  const next = exists
    ? items.map((i) => (i.id === item.id ? item : i))
    : [...items, item];
  saveItems(next);
  return next;
}

export function deleteItem(items: StockItem[], id: string): StockItem[] {
  const next = items.filter((i) => i.id !== id);
  saveItems(next);
  return next;
}
