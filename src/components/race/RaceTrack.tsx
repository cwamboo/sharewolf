import { colorFor, formatMoney, type Racer } from "@/lib/race-store";

const BAR: Record<string, string> = {
  coral: "bg-coral",
  mint: "bg-mint",
  grape: "bg-grape",
  sun: "bg-sun",
};
const TEXT: Record<string, string> = {
  coral: "text-coral",
  mint: "text-cream",
  grape: "text-sun",
  sun: "text-cream",
};
export function RaceTrack({ racers, highlight, className }: { racers: Racer[]; highlight?: string | undefined; className?: string }) {
  const max = Math.max(...racers.map((r) => r.total), 1);

  return (
    <section className={`flex min-h-0 flex-col p-1 ${className ?? ""}`}>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-sm uppercase">Track progress</h2>
        <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-mint">Distance = order volume</span>
      </div>

      {racers.length === 0 ? (
        <p className="border border-mint/20 py-10 text-center text-sm font-bold text-mint">
          No customers on track yet. Sellers log an order for a customer to move them forward.
        </p>
      ) : (
        <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1 lg:space-y-3">
          {racers.map((r, i) => {
            const color = colorFor(r.name);
            const pct = Math.max(8, Math.round((r.total / max) * 100));
            const me = highlight && r.name.toLowerCase() === highlight.toLowerCase();
            return (
              <div key={r.name} className="race-stripe animate-fade-in border border-mint/10 px-3 py-2">
                <div className="mb-2 flex items-end justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className={`grid h-8 w-12 shrink-0 place-items-center font-display text-xs italic ${i === 0 ? "bg-coral text-cream" : "bg-mint text-ink"}`}>
                      P{i + 1}
                    </span>
                    <span className="truncate text-sm font-bold uppercase italic">
                      {r.name}
                      {me && <span className="ml-2 text-[10px] not-italic text-coral">YOU</span>}
                    </span>
                  </div>
                  <span className={`font-display text-lg font-bold ${TEXT[color]}`}>{formatMoney(r.total)}</span>
                </div>
                <div className="h-3 w-full -skew-x-12 overflow-hidden border border-mint/20 bg-ink">
                  <div
                    className={`h-full transition-[width] duration-700 ease-out ${BAR[color]}`}
                    style={{ width: `${pct}%` }}
                  >
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
