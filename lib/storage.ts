import { StockItem } from "@/types";

const LOCAL_KEY = "bichiku-items";

export async function getItems(): Promise<StockItem[]> {
  const res = await fetch("/api/items");
  if (!res.ok) return [];
  return res.json();
}

export async function createItem(item: Omit<StockItem, "id">): Promise<StockItem> {
  const res = await fetch("/api/items", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item),
  });
  return res.json();
}

export async function updateItem(
  id: string,
  item: Omit<StockItem, "id">
): Promise<StockItem> {
  const res = await fetch(`/api/items/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item),
  });
  return res.json();
}

export async function deleteItem(id: string): Promise<void> {
  await fetch(`/api/items/${id}`, { method: "DELETE" });
}

// 旧バージョン（localStorageのみ）からの一回限りの移行。
// 移行先のDBに書き込んだら、ローカルの下書きは消して二重管理を避ける。
export async function migrateLocalItemsIfNeeded(): Promise<void> {
  if (typeof window === "undefined") return;
  const raw = window.localStorage.getItem(LOCAL_KEY);
  if (!raw) return;

  try {
    const localItems = JSON.parse(raw) as StockItem[];
    for (const item of localItems) {
      await createItem(item);
    }
  } catch {
    // 壊れたデータは諦めて破棄する
  } finally {
    window.localStorage.removeItem(LOCAL_KEY);
  }
}
