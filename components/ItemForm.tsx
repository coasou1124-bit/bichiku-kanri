"use client";

import { useState } from "react";
import {
  ALERT_LEAD_PRESETS,
  CATEGORY_PRESETS,
  ExpiryType,
  LOCATION_PRESETS,
  StockItem,
} from "@/types";

const PRESET_DAYS = ALERT_LEAD_PRESETS.map((p) => p.days);
const CUSTOM_VALUE = "custom";

interface ItemFormProps {
  initial?: StockItem;
  onSubmit: (item: StockItem) => void;
  onCancel: () => void;
}

function emptyItem(): StockItem {
  return {
    id: crypto.randomUUID(),
    name: "",
    category: CATEGORY_PRESETS[0],
    location: "",
    quantity: 1,
    unit: "個",
    expiryType: "best_before",
    expiryDate: "",
    alertLead: 30,
  };
}

export default function ItemForm({ initial, onSubmit, onCancel }: ItemFormProps) {
  const [form, setForm] = useState<StockItem>(initial ?? emptyItem());
  const [hasExpiry, setHasExpiry] = useState<boolean>(
    initial ? initial.expiryDate !== null : true
  );
  const [alertMode, setAlertMode] = useState<"preset" | "custom">(
    initial?.alertLead != null && !PRESET_DAYS.includes(initial.alertLead)
      ? "custom"
      : "preset"
  );

  function handleChange<K extends keyof StockItem>(key: K, value: StockItem[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleHasExpiryChange(checked: boolean) {
    setHasExpiry(checked);
    if (checked) {
      setForm((prev) => ({
        ...prev,
        expiryType: prev.expiryType ?? "best_before",
        alertLead: prev.alertLead ?? 30,
      }));
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    if (hasExpiry && !form.expiryDate) return;

    const submitValue: StockItem = hasExpiry
      ? form
      : { ...form, expiryType: null, expiryDate: null, alertLead: null };
    onSubmit(submitValue);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-black/20"
    >
      <div>
        <label className="mb-1 block text-sm font-medium">品名</label>
        <input
          required
          value={form.name}
          onChange={(e) => handleChange("name", e.target.value)}
          className="w-full rounded-lg border border-black/15 px-3 py-2 dark:border-white/20 dark:bg-transparent"
          placeholder="例：レトルトご飯"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium">カテゴリ</label>
          <input
            list="category-list"
            value={form.category}
            onChange={(e) => handleChange("category", e.target.value)}
            className="w-full rounded-lg border border-black/15 px-3 py-2 dark:border-white/20 dark:bg-transparent"
          />
          <datalist id="category-list">
            {CATEGORY_PRESETS.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">保管場所（カバン名としても利用可）</label>
          <input
            list="location-list"
            value={form.location}
            onChange={(e) => handleChange("location", e.target.value)}
            className="w-full rounded-lg border border-black/15 px-3 py-2 dark:border-white/20 dark:bg-transparent"
            placeholder="例：非常持ち出しリュックA"
          />
          <datalist id="location-list">
            {LOCATION_PRESETS.map((l) => (
              <option key={l} value={l} />
            ))}
          </datalist>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium">数量</label>
          <input
            type="number"
            min={0}
            required
            value={form.quantity}
            onChange={(e) => handleChange("quantity", Number(e.target.value))}
            className="w-full rounded-lg border border-black/15 px-3 py-2 dark:border-white/20 dark:bg-transparent"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">単位</label>
          <input
            value={form.unit}
            onChange={(e) => handleChange("unit", e.target.value)}
            className="w-full rounded-lg border border-black/15 px-3 py-2 dark:border-white/20 dark:bg-transparent"
            placeholder="個・本・kg など"
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={hasExpiry}
          onChange={(e) => handleHasExpiryChange(e.target.checked)}
          className="h-4 w-4"
        />
        期限あり（賞味期限・消費期限を設定する）
      </label>

      {hasExpiry && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium">期限の種類</label>
              <select
                value={form.expiryType ?? "best_before"}
                onChange={(e) => handleChange("expiryType", e.target.value as ExpiryType)}
                className="w-full rounded-lg border border-black/15 px-3 py-2 dark:border-white/20 dark:bg-transparent"
              >
                <option value="best_before">賞味期限</option>
                <option value="use_by">消費期限</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">期限日</label>
              <input
                type="date"
                required
                value={form.expiryDate ?? ""}
                onChange={(e) => handleChange("expiryDate", e.target.value)}
                className="w-full rounded-lg border border-black/15 px-3 py-2 dark:border-white/20 dark:bg-transparent"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              いつから警告を出すか
            </label>
            <select
              value={alertMode === "custom" ? CUSTOM_VALUE : (form.alertLead ?? 30)}
              onChange={(e) => {
                if (e.target.value === CUSTOM_VALUE) {
                  setAlertMode("custom");
                } else {
                  setAlertMode("preset");
                  handleChange("alertLead", Number(e.target.value));
                }
              }}
              className="w-full rounded-lg border border-black/15 px-3 py-2 dark:border-white/20 dark:bg-transparent"
            >
              {ALERT_LEAD_PRESETS.map((p) => (
                <option key={p.days} value={p.days}>
                  期限の{p.label}
                </option>
              ))}
              <option value={CUSTOM_VALUE}>自由入力</option>
            </select>
            {alertMode === "custom" && (
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  required
                  value={form.alertLead ?? 30}
                  onChange={(e) => handleChange("alertLead", Number(e.target.value))}
                  className="w-24 rounded-lg border border-black/15 px-3 py-2 dark:border-white/20 dark:bg-transparent"
                />
                <span className="text-sm">日前から</span>
              </div>
            )}
          </div>
        </>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg px-4 py-2 text-sm font-medium text-black/60 hover:bg-black/5 dark:text-white/60 dark:hover:bg-white/10"
        >
          キャンセル
        </button>
        <button
          type="submit"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          保存
        </button>
      </div>
    </form>
  );
}
