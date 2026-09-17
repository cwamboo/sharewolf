import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";

import { SiteHeader } from "@/components/race/SiteHeader";
import { computeRacers, formatMoney, isSameSeller, useOrders, useSellerSession } from "@/lib/race-store";

export const Route = createFileRoute("/seller")({
  head: () => ({
    meta: [
      { title: "Log an order — SprintRace" },
      { name: "description", content: "Seller view: log confirmed orders and watch your total climb the live race." },
      { property: "og:title", content: "Log an order — SprintRace" },
      { property: "og:description", content: "Seller view: log confirmed orders and watch your total climb the live race." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SellerPage,
});

function SellerPage() {
  const { seller, ready, setSeller } = useSellerSession();
  const { orders, addOrder, removeOrder } = useOrders();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState("");
  const [amount, setAmount] = useState("");
  const [flash, setFlash] = useState<number | null>(null);
  const customerRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (ready && !seller) navigate({ to: "/" });
  }, [ready, seller, navigate]);

  const mine = useMemo(
    () => (seller ? orders.filter((o) => isSameSeller(o.seller, seller)).sort((a, b) => b.at - a.at) : []),
    [orders, seller],
  );
  const total = mine.reduce((s, o) => s + o.amount, 0);
  const racers = useMemo(() => computeRacers(orders), [orders]);
  const rank = seller ? racers.findIndex((r) => isSameSeller(r.name, seller)) + 1 : 0;

  if (!seller) return null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = Number(amount.replace(",", "."));
    if (!customer.trim() || !Number.isFinite(value) || value <= 0) return;
    addOrder(seller, customer, Math.round(value * 100) / 100);
    setFlash(value);
    setCustomer("");
    setAmount("");
    customerRef.current?.focus();
    setTimeout(() => setFlash(null), 1800);
  };

  return (
    <div className="min-h-screen pb-10">
      <SiteHeader
        right={
          <Link to="/" className="pill bg-card">
            Dashboard
          </Link>
        }
      />

      <main className="mx-auto max-w-md px-4 py-6">
        <section className="rounded-[2rem] border-4 border-ink bg-ink p-5 text-cream shadow-hard-coral">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-cream/50">Racing as</p>
              <h1 className="font-display text-2xl font-bold">{seller}</h1>
            </div>
            <span className="pill border-cream/30 bg-cream/10 text-cream">{rank > 0 ? `#${rank}` : "not started"}</span>
          </div>
          <div className="mt-5 flex items-end justify-between">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-cream/50">My total</p>
              <p className="font-display text-5xl font-bold leading-none text-sun">{formatMoney(total)}</p>
            </div>
            <p className="text-xs font-bold text-cream/60">
              {mine.length} order{mine.length === 1 ? "" : "s"}
            </p>
          </div>
        </section>

        <form onSubmit={submit} className="card-arcade mt-6 p-5">
          <h2 className="font-display text-lg font-bold">Order confirmed?</h2>
          <p className="text-xs font-semibold text-ink/50">Customer first name and the amount. Nothing else.</p>

          <label className="mt-4 block">
            <span className="text-[11px] font-extrabold uppercase tracking-[0.15em] text-ink/50">Customer</span>
            <input
              ref={customerRef}
              type="text"
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
              placeholder="e.g. Amina B."
              autoComplete="off"
              required
              className="mt-1 h-12 w-full rounded-2xl border-2 border-ink/15 bg-cream px-4 text-base font-bold focus:border-ink focus:outline-none"
            />
          </label>

          <label className="mt-3 block">
            <span className="text-[11px] font-extrabold uppercase tracking-[0.15em] text-ink/50">Amount</span>
            <div className="mt-1 flex h-16 items-center gap-2 rounded-2xl border-2 border-ink/15 bg-cream px-4 focus-within:border-ink">
              <span className="font-display text-3xl font-bold text-coral">€</span>
              <input
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                required
                className="w-full bg-transparent font-display text-3xl font-bold tabular-nums focus:outline-none"
              />
            </div>
          </label>

          <button
            type="submit"
            className="mt-4 h-14 w-full rounded-2xl bg-coral font-display text-lg font-bold text-cream transition active:translate-y-0.5"
          >
            {flash ? `+${formatMoney(flash)} logged! 🎉` : "Log order 🏁"}
          </button>
        </form>

        <section className="card-arcade mt-6 p-5">
          <h2 className="mb-3 font-display text-lg font-bold">My orders</h2>
          {mine.length === 0 ? (
            <p className="py-4 text-center text-sm font-bold text-ink/40">Your first order goes here.</p>
          ) : (
            <ul className="space-y-2">
              {mine.map((o) => (
                <li
                  key={o.id}
                  className="flex animate-fade-in items-center gap-3 rounded-2xl border-2 border-ink/10 bg-cream px-3 py-2"
                >
                  <span className="text-[11px] font-bold text-ink/40">
                    {new Date(o.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm font-bold">{o.customer}</span>
                  <span className="font-display text-sm font-bold text-coral">+{formatMoney(o.amount)}</span>
                  <button
                    type="button"
                    aria-label="Remove order"
                    onClick={() => {
                      if (confirm(`Remove the ${formatMoney(o.amount)} order for ${o.customer}?`)) removeOrder(o.id);
                    }}
                    className="grid size-7 place-items-center rounded-full text-ink/30 hover:bg-coral/15 hover:text-coral"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <button
          type="button"
          onClick={() => {
            setSeller(null);
            navigate({ to: "/" });
          }}
          className="mx-auto mt-6 block text-xs font-bold text-ink/40 underline-offset-2 hover:underline"
        >
          Leave (your orders stay saved under your name)
        </button>
      </main>
    </div>
  );
}
