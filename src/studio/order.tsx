export function moveItem<T>(list: T[], from: number, direction: -1 | 1): T[] {
  const to = from + direction;
  if (to < 0 || to >= list.length) return list;
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

export function OrderButtons({
  index,
  total,
  onMove,
  upLabel = "Omhoog",
  downLabel = "Omlaag",
}: {
  index: number;
  total: number;
  onMove: (direction: -1 | 1) => void;
  upLabel?: string;
  downLabel?: string;
}) {
  if (total < 2) return null;
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        disabled={index === 0}
        onClick={() => onMove(-1)}
        className="rounded-full px-2 py-1 font-body text-xs font-semibold text-brand-black ring-1 ring-brand-pink-light enabled:hover:bg-brand-pink-light disabled:opacity-30"
      >
        {upLabel}
      </button>
      <button
        type="button"
        disabled={index === total - 1}
        onClick={() => onMove(1)}
        className="rounded-full px-2 py-1 font-body text-xs font-semibold text-brand-black ring-1 ring-brand-pink-light enabled:hover:bg-brand-pink-light disabled:opacity-30"
      >
        {downLabel}
      </button>
    </div>
  );
}
