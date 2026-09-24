import type { Racer } from "@/lib/race-store";

const first = (r?: Racer) => r?.name ?? "—";

function Step({
  pos,
  name,
  height,
  face,
  cap,
  side,
  label,
}: {
  pos: number;
  name: string;
  height: string;
  face: string;
  cap: string;
  side: string;
  label: string;
}) {
  return (
    <div className="flex flex-1 flex-col items-center">
      <span className={label}>{pos}</span>
      <div className="relative mt-1 w-full">
        {/* top plate (perspective lip) */}
        <div
          className={`h-3 w-full ${cap}`}
          style={{ clipPath: "polygon(8% 0, 92% 0, 100% 100%, 0 100%)" }}
        />
        {/* front face */}
        <div className={`relative flex ${height} w-full items-end justify-center overflow-hidden pb-2 ${face}`}>
          <span className="absolute inset-y-0 right-0 w-3 bg-ink/35" aria-hidden />
          <span className={`absolute inset-x-0 top-0 h-px ${side}`} aria-hidden />
          <span className="relative px-2 text-center text-xs font-bold uppercase leading-tight text-cream">{name}</span>
        </div>
        {/* floor shadow */}
        <div className="mx-auto h-1.5 w-11/12 bg-ink/60 blur-sm" aria-hidden />
      </div>
    </div>
  );
}

export function Podium({ racers }: { racers: Racer[] }) {
  const [g, s, b] = racers;
  return (
    <section className="p-4">
      <h2 className="mb-3 font-display text-xs uppercase text-mint">Current podium</h2>
      <div className="flex items-end justify-center gap-2">
        <Step
          pos={2}
          name={first(s)}
          height="h-16"
          label="font-display text-xl text-mint"
          cap="bg-gradient-to-b from-cream/70 to-mint"
          face="bg-gradient-to-b from-mint/45 to-mint/15"
          side="bg-cream/50"
        />
        <Step
          pos={1}
          name={first(g)}
          height="h-24"
          label="font-display text-3xl"
          cap="bg-gradient-to-b from-cream to-coral"
          face="bg-gradient-to-b from-coral to-grape shadow-hard-coral"
          side="bg-cream/70"
        />
        <Step
          pos={3}
          name={first(b)}
          height="h-12"
          label="font-display text-lg text-mint/60"
          cap="bg-gradient-to-b from-mint/60 to-mint/30"
          face="bg-gradient-to-b from-mint/25 to-mint/5"
          side="bg-mint/40"
        />
      </div>
    </section>
  );
}
