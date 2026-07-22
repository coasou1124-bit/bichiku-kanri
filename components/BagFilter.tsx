interface BagFilterProps {
  bags: string[];
  selected: string | null;
  onSelect: (bag: string | null) => void;
}

export default function BagFilter({ bags, selected, onSelect }: BagFilterProps) {
  if (bags.length < 2) return null;

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onSelect(null)}
        className={`rounded-full px-3 py-1 text-sm font-medium ${
          selected === null
            ? "bg-blue-600 text-white"
            : "bg-black/5 text-black/60 dark:bg-white/10 dark:text-white/60"
        }`}
      >
        すべて
      </button>
      {bags.map((bag) => (
        <button
          key={bag}
          onClick={() => onSelect(bag)}
          className={`rounded-full px-3 py-1 text-sm font-medium ${
            selected === bag
              ? "bg-blue-600 text-white"
              : "bg-black/5 text-black/60 dark:bg-white/10 dark:text-white/60"
          }`}
        >
          🎒{bag}
        </button>
      ))}
    </div>
  );
}
