import type { Racer } from "@/lib/race-store";

const first = (r?: Racer) => r?.name.split(" ")[0] ?? "—";

export function Podium({ racers }: { racers: Racer[] }) {
  const [g, s, b] = racers;
  return (
    <section className="card-arcade p-5">
      <h2 className="mb-3 font-display text-lg font-bold">Podium</h2>
      <div className="flex items-end justify-center gap-2">
        <div className="flex flex-1 flex-col items-center">
          <span className="text-2xl">2nd</span>
          <div className="mt-1 flex h-20 w-full items-end justify-center rounded-t-xl border-4 border-ink bg-mint pb-2 text-xs font-bold text-cream">
            {first(s)}
          </div>
        </div>
        <div className="flex flex-1 flex-col items-center">
          <span className="text-2xl">1st</span>
          <div className="mt-1 flex h-28 w-full items-end justify-center rounded-t-xl border-4 border-ink bg-coral pb-2 text-xs font-bold text-cream">
            {first(g)}
          </div>
        </div>
        <div className="flex flex-1 flex-col items-center">
          <span className="text-2xl">3rd</span>
          <div className="mt-1 flex h-16 w-full items-end justify-center rounded-t-xl border-4 border-ink bg-grape pb-2 text-xs font-bold text-cream">
            {first(b)}
          </div>
        </div>
      </div>
    </section>
  );
}
