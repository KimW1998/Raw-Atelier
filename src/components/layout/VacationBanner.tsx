import { Palmtree } from "lucide-react";
import { useVacation } from "@/lib/vacation";

export function VacationBanner() {
  const { enabled, title, message, until } = useVacation();
  if (!enabled) return null;

  return (
    <div className="fixed inset-x-0 top-[4.25rem] z-40 border-b border-brand-pink/40 bg-brand-pink-light px-4 py-3 text-center md:px-6">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-1 sm:flex-row sm:justify-center sm:gap-3">
        <Palmtree className="h-4 w-4 shrink-0 text-brand-rose" aria-hidden />
        <p className="font-body text-sm leading-relaxed text-brand-black">
          <span className="font-semibold">{title}</span>
          {until ? <span className="text-brand-black/70"> · {until}</span> : null}
          <span className="text-brand-black/80"> — {message}</span>
        </p>
      </div>
    </div>
  );
}
