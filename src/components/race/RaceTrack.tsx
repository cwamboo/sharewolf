import { colorFor, formatMoney, type Racer } from "@/lib/race-store";

const BAR: Record<string, string> = {
  coral: "bg-coral",
  mint: "bg-mint",
  grape: "bg-grape",
  sun: "bg-sun",
};
const TEXT: Record<string, string> = {
  coral: "text-coral",
  mint: "text-mint",
  grape: "text-grape",
  sun: "text-ink/70",
};
const VEHICLES = ["🏆", "🚀", "🐎", "🐢", "🚲", "🛴", "🐌", "🦆"];

export function RaceTrack({ racers, highlight }: { racers: Racer[]; highlight?: string }) {
  const max = Math.max(...racers.map((r) => r.total), 1);

  return (
    <section className="card-arcade p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-lg font-bold">Race track</h2>
        <span className="text-xs font-bold text-ink/40">distance = total amount</span>
      </div>

      {racers.length === 0 ? (
        <p className="py-10 text-center text-sm font-bold text-ink/50">
          No racers yet. Sellers join with their name and log their first order to appear here.
        </p>
      ) : (
        <div className="space-y-5">
          {racers.map((r, i) => {
            const color = colorFor(r.name);
            const pct = Math.max(8, Math.round((r.total / max) * 100));
            const me = highlight && r.name.toLowerCase() === highlight.toLowerCase();
            return (
              <div key={r.name} className="animate-fade-in">
                <div className="mb-1.5 flex items-end justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="grid size-7 shrink-0 place-items-center rounded-full bg-sun text-sm font-bold">
                      {i + 1}
                    </span>
                    <span className="truncate font-display text-base font-bold">
                      {r.name}
                      {me && <span className="ml-2 text-xs text-coral">you</span>}
                    </span>
                  </div>
                  <span className={`font-display text-lg font-bold ${TEXT[color]}`}>{formatMoney(r.total)}</span>
                </div>
                <div className="h-9 w-full overflow-hidden rounded-full border-2 border-ink/10 bg-ink/5">
                  <div
                    className={`flex h-full items-center justify-end rounded-full pr-3 transition-[width] duration-700 ease-out ${BAR[color]}`}
                    style={{ width: `${pct}%` }}
                  >
                    <span key={r.total} className="animate-racer-pop text-lg">
                      {VEHICLES[Math.min(i, VEHICLES.length - 1)]}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
