import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { SiteHeader } from "@/components/race/SiteHeader";
import { computeRacers, formatMoney, useOrders, useSites } from "@/lib/race-store";

export const Route = createFileRoute("/breakdown")({
  head: () => ({
    meta: [
      { title: "Score Breakdown — SprintRace" },
      { name: "description", content: "Live score breakdown per customer and per seller in the SprintRace seller grand prix." },
      { property: "og:title", content: "Score Breakdown — SprintRace" },
      { property: "og:description", content: "Live score breakdown per customer and per seller in the SprintRace seller grand prix." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: BreakdownPage,
});

function BreakdownPage() {
  const { orders, ready } = useOrders();
  const { sites } = useSites();

  const racers = useMemo(() => computeRacers(orders), [orders]);
  const grandTotal = racers.reduce((s, r) => s + r.total, 0);

  // Per customer → per seller contribution
  const breakdown = useMemo(() => {
    return racers.map((r) => {
      const mine = orders.filter((o) => o.customer === r.name);
      const bySeller = new Map<string, { total: number; count: number }>();
      for (const o of mine) {
        const s = bySeller.get(o.seller) ?? { total: 0, count: 0 };
        s.total += o.amount;
        s.count += 1;
        bySeller.set(o.seller, s);
      }
      const sellers = [...bySeller.entries()]
        .map(([name, v]) => ({ name, ...v }))
        .sort((a, b) => b.total - a.total);
      return { ...r, sellers };
    });
  }, [racers, orders]);

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.3em] text-coral">Live championship</p>
            <h1 className="font-display text-2xl uppercase sm:text-3xl">Score breakdown</h1>
          </div>
          <Link
            to="/"
            className="-skew-x-6 border border-mint/25 bg-mint/5 px-4 py-2 text-xs font-bold uppercase text-cream transition-colors hover:bg-coral"
          >
            ← Back to race
          </Link>
        </div>

        <p className="mb-6 text-xs font-bold uppercase tracking-widest text-mint">
          {racers.length} customer{racers.length === 1 ? "" : "s"} · {formatMoney(grandTotal)} total
        </p>

        {!ready ? (
          <p className="py-10 text-center text-sm font-bold text-mint">Loading telemetry…</p>
        ) : breakdown.length === 0 ? (
          <p className="py-10 text-center text-sm font-bold text-mint">No orders logged yet.</p>
        ) : (
          <div className="space-y-4">
            {breakdown.map((r, i) => (
              <section key={r.name} className="border border-mint/15 bg-ink/60">
                <header className="flex flex-wrap items-center gap-3 border-b border-mint/15 bg-mint/5 px-4 py-3">
                  <span className="grid size-8 place-items-center bg-coral font-display text-sm text-cream">
                    P{i + 1}
                  </span>
                  <h2 className="font-display text-base uppercase">
                    {r.name}
                    {sites.find((s) => s.id === r.siteId)?.name && (
                      <span className="ml-2 text-[10px] font-bold not-italic tracking-[0.14em] text-mint/70">
                        {sites.find((s) => s.id === r.siteId)?.name}
                      </span>
                    )}
                  </h2>
                  <span className="ml-auto font-display text-lg text-coral">{formatMoney(r.total)}</span>
                  <span className="text-xs font-bold uppercase text-mint">
                    {r.orders} order{r.orders === 1 ? "" : "s"}
                  </span>
                </header>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-[10px] font-extrabold uppercase tracking-[0.2em] text-mint">
                      <th className="px-4 py-2">Seller</th>
                      <th className="px-4 py-2 text-right">Orders</th>
                      <th className="px-4 py-2 text-right">Contribution</th>
                      <th className="hidden w-1/3 px-4 py-2 sm:table-cell">Share</th>
                    </tr>
                  </thead>
                  <tbody>
                    {r.sellers.map((s) => {
                      const pct = r.total > 0 ? (s.total / r.total) * 100 : 0;
                      return (
                        <tr key={s.name} className="border-t border-mint/10">
                          <td className="px-4 py-2 font-bold">{s.name}</td>
                          <td className="px-4 py-2 text-right tabular-nums">{s.count}</td>
                          <td className="px-4 py-2 text-right font-bold tabular-nums text-cream">
                            {formatMoney(s.total)}
                          </td>
                          <td className="hidden px-4 py-2 sm:table-cell">
                            <div className="h-2 w-full bg-mint/10">
                              <div className="h-full bg-coral" style={{ width: `${pct}%` }} />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </section>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
