"use client";

import { useEffect, useState } from "react";
import { StockItem } from "@/types";
import { deleteItem, getItems, upsertItem } from "@/lib/storage";
import SummaryBanner from "@/components/SummaryBanner";
import ItemList from "@/components/ItemList";
import ItemForm from "@/components/ItemForm";

export default function Home() {
  const [items, setItems] = useState<StockItem[]>([]);
  const [editing, setEditing] = useState<StockItem | undefined>(undefined);
  const [showForm, setShowForm] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // localStorage isn't available during SSR, so the initial items list
    // must be hydrated from the client-only effect rather than useState.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setItems(getItems());
    setLoaded(true);
  }, []);

  function handleAddClick() {
    setEditing(undefined);
    setShowForm(true);
  }

  function handleEdit(item: StockItem) {
    setEditing(item);
    setShowForm(true);
  }

  function handleSubmit(item: StockItem) {
    setItems(upsertItem(items, item));
    setShowForm(false);
    setEditing(undefined);
  }

  function handleDelete(id: string) {
    if (!window.confirm("この備蓄品を削除しますか？")) return;
    setItems(deleteItem(items, id));
  }

  function handleCancel() {
    setShowForm(false);
    setEditing(undefined);
  }

  return (
    <main className="mx-auto min-h-screen max-w-md space-y-4 p-4 pb-24">
      <h1 className="text-xl font-bold">🏠 備蓄管理</h1>

      {loaded && <SummaryBanner items={items} />}

      {showForm ? (
        <ItemForm initial={editing} onSubmit={handleSubmit} onCancel={handleCancel} />
      ) : (
        <button
          onClick={handleAddClick}
          className="w-full rounded-xl bg-blue-600 py-3 font-medium text-white hover:bg-blue-700"
        >
          ＋ 備蓄品を追加
        </button>
      )}

      {loaded ? (
        <ItemList items={items} onEdit={handleEdit} onDelete={handleDelete} />
      ) : (
        <p className="py-8 text-center text-sm text-black/50 dark:text-white/50">
          読み込み中...
        </p>
      )}
    </main>
  );
}
