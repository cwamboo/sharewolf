import { Link } from "@tanstack/react-router";

export function SiteHeader({ right }: { right?: React.ReactNode }) {
  return (
    <header className="sticky top-0 z-20 border-b-4 border-ink bg-cream/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-5">
        <Link to="/" className="flex items-center gap-3">
          <div className="grid size-11 place-items-center rounded-2xl bg-coral text-2xl">🏁</div>
          <div className="leading-tight">
            <p className="font-display text-lg font-bold">
              Sprint<span className="text-coral">Race</span>
            </p>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-ink/50">Live seller leaderboard</p>
          </div>
        </Link>
        <div className="flex items-center gap-2">{right}</div>
      </div>
    </header>
  );
}
