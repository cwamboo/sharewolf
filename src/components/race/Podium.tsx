import type { Racer } from "@/lib/race-store";

const first = (r?: Racer) => r?.name ?? "—";

export function Podium({ racers }: { racers: Racer[] }) {
  const [g, s, b] = racers;
  return (
    <section className="p-4">
      <h2 className="mb-3 font-display text-xs uppercase text-mint">Current podium</h2>
      <div className="flex items-end justify-center gap-2">
        <div className="flex flex-1 flex-col items-center">
          <span className="font-display text-xl text-mint">2</span>
          <div className="mt-1 flex h-16 w-full -skew-x-3 items-end justify-center border-t-4 border-mint bg-mint/20 pb-2 text-xs font-bold uppercase text-cream">
            {first(s)}
          </div>
        </div>
        <div className="flex flex-1 flex-col items-center">
          <span className="font-display text-3xl">1</span>
          <div className="mt-1 flex h-24 w-full -skew-x-3 items-end justify-center border-t-4 border-cream bg-coral pb-2 text-xs font-bold uppercase text-cream shadow-hard-coral">
            {first(g)}
          </div>
        </div>
        <div className="flex flex-1 flex-col items-center">
          <span className="font-display text-lg text-mint/60">3</span>
          <div className="mt-1 flex h-12 w-full skew-x-3 items-end justify-center border-t-4 border-mint/40 bg-mint/10 pb-2 text-xs font-bold uppercase text-cream">
            {first(b)}
          </div>
        </div>
      </div>
    </section>
  );
}
