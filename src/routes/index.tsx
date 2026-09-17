import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { SiteHeader } from "@/components/race/SiteHeader";
import { RaceTrack } from "@/components/race/RaceTrack";
import { FreshOrders } from "@/components/race/FreshOrders";
import { Podium } from "@/components/race/Podium";
import { computeRacers, formatMoney, useOrders, useSellerSession } from "@/lib/race-store";

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
  const { orders, ready, loadDemo, resetRace } = useOrders();
  const { seller, setSeller } = useSellerSession();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const racers = useMemo(() => computeRacers(orders), [orders]);
  const total = racers.reduce((s, r) => s + r.total, 0);

  const join = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSeller(name);
    navigate({ to: "/seller" });
  };

  return (
    <div className="min-h-screen">
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

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-5">
        <section className="mb-7">
          <p className="text-xs font-extrabold uppercase tracking-[0.25em] text-grape">Live standings</p>
          <h1 className="mt-1 font-display text-5xl font-bold leading-[0.95] sm:text-7xl">
            The <span className="text-coral">Order</span> <span className="text-mint">Sprint</span>
          </h1>
          <p className="mt-3 max-w-md text-sm font-semibold text-ink/60">
            Sellers punch in confirmed orders. The bigger the total, the further they race ahead. First to the flag.
          </p>
        </section>

        <RaceTrack racers={racers} highlight={seller ?? undefined} />

        <div className="mt-6 grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <FreshOrders orders={orders} />
          </div>

          <div className="lg:col-span-2">
            <section className="rounded-[2rem] border-4 border-ink bg-ink p-5 text-cream shadow-hard-coral">
              <h2 className="font-display text-lg font-bold">Jump in the race</h2>
              <p className="mt-1 text-xs font-semibold text-cream/60">
                No password. Just your name — your score follows you back if you return.
              </p>
              {seller ? (
                <div className="mt-4 space-y-3">
                  <p className="text-sm font-bold">
                    Welcome back, <span className="text-sun">{seller}</span>
                  </p>
                  <Link
                    to="/seller"
                    className="block w-full rounded-2xl bg-coral py-3.5 text-center font-display text-base font-bold text-cream transition active:translate-y-0.5"
                  >
                    Continue racing →
                  </Link>
                  <button
                    type="button"
                    onClick={() => setSeller(null)}
                    className="w-full text-xs font-bold text-cream/50 underline-offset-2 hover:underline"
                  >
                    Not you? Switch seller
                  </button>
                </div>
              ) : (
                <form onSubmit={join}>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your seller name"
                    autoComplete="off"
                    className="mt-4 w-full rounded-2xl border-2 border-cream/20 bg-cream/10 px-4 py-3 text-sm font-bold text-cream placeholder:text-cream/40 focus:border-sun focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="mt-3 w-full rounded-2xl bg-coral py-3.5 font-display text-base font-bold text-cream transition active:translate-y-0.5"
                  >
                    Start racing →
                  </button>
                </form>
              )}
            </section>

            <div className="mt-6">
              <Podium racers={racers} />
            </div>
          </div>
        </div>

        {ready && (
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-xs font-bold text-ink/40">
            {orders.length === 0 ? (
              <button type="button" onClick={loadDemo} className="pill bg-card text-ink hover:bg-sun">
                Load demo racers
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  if (confirm("Reset the whole race? All orders will be removed.")) resetRace();
                }}
                className="pill bg-card text-ink hover:bg-coral hover:text-cream"
              >
                Reset race
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
