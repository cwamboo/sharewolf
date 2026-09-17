import { Link } from "@tanstack/react-router";

export function SiteHeader({ right }: { right?: React.ReactNode }) {
  return (
    <header className="sticky top-0 z-20 border-b border-mint/20 bg-ink/95 text-cream backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-5">
        <Link to="/" className="flex items-center gap-3">
          <div className="grid size-10 place-items-center bg-coral font-display text-sm italic">SR</div>
          <div className="leading-tight">
            <p className="font-display text-lg font-bold">
              SPRINT<span className="text-coral">RACE</span>
            </p>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-mint">Seller Grand Prix</p>
          </div>
        </Link>
        <div className="flex items-center gap-2">{right}</div>
      </div>
    </header>
  );
}
