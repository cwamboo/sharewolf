import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/race/SiteHeader";
import { RaceTrack } from "@/components/race/RaceTrack";
import { FreshOrders } from "@/components/race/FreshOrders";
import { Podium } from "@/components/race/Podium";
import { QrCode } from "@/components/race/QrCode";
import { computeRacers, formatMoney, useOrders, useSellerSession, useSites } from "@/lib/race-store";

const JOIN_URL = "https://televente-wolf.lovable.app/";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SprintRace — Live Seller Order Race" },
      { name: "description", content: "Live dashboard of the seller competition: every confirmed order pushes a racer further down the track." },
      { property: "og:title", content: "SprintRace — Live Seller Order Race" },
      { property: "og:description", content: "Live dashboard of the seller competition: every confirmed order pushes a racer further down the track." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { orders: allOrders, ready, loadDemo, resetRace } = useOrders();
  const { sites } = useSites();
  const { seller, setSeller } = useSellerSession();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [siteFilter, setSiteFilter] = useState("");
  const orders = useMemo(
    () => (siteFilter ? allOrders.filter((o) => o.siteId === siteFilter) : allOrders),
    [allOrders, siteFilter],
  );
  const racers = useMemo(() => computeRacers(orders), [orders]);
  const total = racers.reduce((s, r) => s + r.total, 0);

  const join = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSeller(name);
    navigate({ to: "/seller" });
  };

  return (
    <div className="flex min-h-screen flex-col lg:h-dvh lg:overflow-hidden">
      <SiteHeader
        right={
          <>
            <span className="pill hidden items-center gap-2 bg-sun sm:flex">
              <span className="size-2 animate-pulse rounded-full bg-coral" /> LIVE
            </span>
            <span className="pill bg-card">
              {racers.length} racer{racers.length === 1 ? "" : "s"} · {formatMoney(total)}
            </span>
          </>
        }
      />

      <main className="mx-auto grid w-full max-w-[110rem] flex-1 gap-4 px-4 py-4 md:grid-cols-12 lg:min-h-0 lg:overflow-hidden">
        <aside className="telemetry-panel flex flex-col p-4 md:col-span-4 lg:col-span-3 lg:min-h-0">
          <div className="mb-3 flex items-center gap-3">
            <span className="h-8 w-2 bg-coral" />
            <h2 className="font-display text-lg uppercase">Timing tower</h2>
          </div>
          <div className="mb-2 grid grid-cols-[2.5rem_1fr_auto] text-[9px] font-bold uppercase tracking-[0.16em] text-mint">
            <span>Pos</span><span>Customer</span><span>Volume</span>
          </div>
          <div className="min-h-0 flex-1 space-y-1 overflow-y-auto pr-1">
            {racers.length === 0 ? (
              <p className="border-y border-mint/15 py-8 text-center text-xs text-mint">Grid awaiting customers</p>
            ) : racers.map((r, i) => (
              <div key={r.name} className={`grid grid-cols-[2.5rem_1fr_auto] items-center border-b border-mint/15 px-2 py-2.5 ${i === 0 ? "border-l-4 border-l-coral bg-coral/10" : "bg-mint/5"}`}>
                <span className={`font-display text-sm ${i === 0 ? "text-coral" : "text-mint"}`}>P{i + 1}</span>
                <span className="truncate pr-2 text-xs font-bold uppercase">{r.name}</span>
                <span className="text-xs font-bold tabular-nums">{formatMoney(r.total)}</span>
              </div>
            ))}
          </div>

          <section className="mt-4 shrink-0 border-t border-mint/20 pt-4">
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-mint">Paddock entry</p>
            {seller ? (
              <div className="mt-3 space-y-2">
                <p className="text-sm font-semibold">Driver: <span className="text-coral">{seller}</span></p>
                <Link to="/seller" className="block -skew-x-6 bg-coral py-2.5 text-center font-display text-sm uppercase text-cream transition hover:skew-x-0">
                  <span className="inline-block skew-x-6">Enter pits →</span>
                </Link>
                <Button type="button" variant="ghost" onClick={() => setSeller(null)} className="h-auto w-full text-xs text-mint hover:bg-mint/10 hover:text-cream">
                  Switch seller
                </Button>
              </div>
            ) : (
              <form onSubmit={join} className="mt-3">
                <label className="sr-only" htmlFor="seller-name">Seller name</label>
                <input id="seller-name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Seller name" autoComplete="off" className="h-10 w-full border border-mint/25 bg-mint/5 px-3 text-sm font-bold text-cream placeholder:text-mint focus:border-coral focus:outline-none" />
                <Button type="submit" className="mt-2 h-10 w-full -skew-x-6 rounded-none bg-coral font-display text-xs uppercase text-cream shadow-none hover:bg-coral/90">
                  <span className="skew-x-6">Join the grid</span>
                </Button>
              </form>
            )}
          </section>
        </aside>

        <div className="flex min-w-0 flex-col gap-4 md:col-span-8 lg:col-span-6 lg:min-h-0">
          <section className="flex shrink-0 items-end justify-between gap-4 border-b-2 border-mint/20 pb-3">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-coral">Live championship</p>
              <h1 className="mt-1 truncate font-display text-3xl uppercase leading-none xl:text-4xl">Seller Grand Prix</h1>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <select
                value={siteFilter}
                onChange={(e) => setSiteFilter(e.target.value)}
                aria-label="Filter by site"
                className="h-9 border border-mint/25 bg-mint/5 px-2 text-[11px] font-bold uppercase tracking-[0.1em] text-cream focus:border-coral focus:outline-none"
              >
                <option value="">All sites</option>
                {sites.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              <span className="size-2 animate-pulse rounded-full bg-coral" />
              <span className="hidden text-[10px] font-bold uppercase tracking-[0.18em] text-mint xl:inline">Live telemetry</span>
            </div>
          </section>

          <Podium racers={racers} />
          <RaceTrack racers={racers} className="flex-1" />

          <div className="flex shrink-0 items-center justify-end gap-2">
            <Link to="/customers" className="pill border border-mint/25 bg-mint/5 text-xs uppercase text-cream hover:bg-coral">
              Manage customers
            </Link>
            {ready && (orders.length === 0 ? (
              <Button type="button" variant="outline" onClick={loadDemo} className="border-mint/25 bg-mint/5 text-xs uppercase text-cream hover:bg-coral hover:text-cream">Load demo grid</Button>
            ) : (
              <Button type="button" variant="outline" onClick={() => { if (confirm("Reset the whole race? All orders will be removed.")) resetRace(); }} className="border-mint/25 bg-mint/5 text-xs uppercase text-cream hover:bg-destructive hover:text-cream">Reset grid</Button>
            ))}
          </div>
        </div>

        <aside className="flex min-w-0 flex-col gap-4 md:col-span-12 lg:col-span-3 lg:min-h-0">
          <QrCode url={JOIN_URL} label="Scan to log your orders" />
          <FreshOrders orders={orders} className="flex-1" />
        </aside>
      </main>
    </div>
  );
}
