interface LocationFilterProps {
  locations: string[];
  selected: string | null;
  onSelect: (location: string | null) => void;
}

export default function LocationFilter({
  locations,
  selected,
  onSelect,
}: LocationFilterProps) {
  if (locations.length < 2) return null;

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
      {locations.map((location) => (
        <button
          key={location}
          onClick={() => onSelect(location)}
          className={`rounded-full px-3 py-1 text-sm font-medium ${
            selected === location
              ? "bg-blue-600 text-white"
              : "bg-black/5 text-black/60 dark:bg-white/10 dark:text-white/60"
          }`}
        >
          {location}
        </button>
      ))}
    </div>
  );
}
