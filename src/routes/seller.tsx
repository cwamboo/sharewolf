import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
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
    void addOrder(seller, customer, Math.round(value * 100) / 100).catch(() =>
      alert("Could not save the order. Please check your connection and try again."),
    );
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
        <section className="telemetry-panel race-stripe p-5 text-cream">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-mint">Driver profile</p>
              <h1 className="font-display text-2xl uppercase">{seller}</h1>
            </div>
            <span className="pill border-mint/30 bg-mint/10 text-cream">{rank > 0 ? `P${rank}` : "GRID READY"}</span>
          </div>
          <div className="mt-5 flex items-end justify-between">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-mint">Order volume</p>
              <p className="font-display text-4xl leading-none text-coral sm:text-5xl">{formatMoney(total)}</p>
            </div>
            <p className="text-xs font-bold text-cream/60">
              {mine.length} order{mine.length === 1 ? "" : "s"}
            </p>
          </div>
        </section>

        <form onSubmit={submit} className="card-arcade mt-6 p-5">
          <h2 className="font-display text-lg uppercase">Confirm order</h2>
          <p className="text-xs font-semibold text-mint">Customer first name and the amount. Nothing else.</p>

          <label className="mt-4 block">
            <span className="text-[11px] font-extrabold uppercase tracking-[0.15em] text-mint">Customer</span>
            <input
              ref={customerRef}
              type="text"
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
              placeholder="e.g. Amina B."
              autoComplete="off"
              required
              className="mt-1 h-12 w-full border border-mint/25 bg-mint/5 px-4 text-base font-bold text-cream placeholder:text-mint focus:border-coral focus:outline-none"
            />
          </label>

          <label className="mt-3 block">
            <span className="text-[11px] font-extrabold uppercase tracking-[0.15em] text-mint">Amount</span>
            <div className="mt-1 flex h-16 items-center gap-2 border border-mint/25 bg-mint/5 px-4 focus-within:border-coral">
              <span className="font-display text-3xl text-coral">€</span>
              <input
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                required
                className="w-full bg-transparent font-display text-3xl tabular-nums text-cream placeholder:text-mint focus:outline-none"
              />
            </div>
          </label>

          <Button type="submit" className="mt-4 h-14 w-full -skew-x-3 rounded-none bg-coral font-display text-base uppercase text-cream shadow-none hover:bg-coral/90">
            <span className="skew-x-3">{flash ? `+${formatMoney(flash)} logged` : "Log order"}</span>
          </Button>
        </form>

        <section className="card-arcade mt-6 p-5">
          <h2 className="mb-3 font-display text-lg uppercase">My orders</h2>
          {mine.length === 0 ? (
            <p className="py-4 text-center text-sm font-bold text-mint">Your first order goes here.</p>
          ) : (
            <ul className="space-y-2">
              {mine.map((o) => (
                <li
                  key={o.id}
                   className="flex animate-fade-in items-center gap-3 border-b border-mint/15 bg-mint/5 px-3 py-2"
                >
                  <span className="text-[11px] font-bold text-mint">
                    {new Date(o.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm font-bold">{o.customer}</span>
                  <span className="font-display text-sm font-bold text-coral">+{formatMoney(o.amount)}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Remove order"
                    onClick={() => {
                      if (confirm(`Remove the ${formatMoney(o.amount)} order for ${o.customer}?`)) removeOrder(o.id);
                    }}
                    className="size-7 rounded-none text-mint hover:bg-coral/15 hover:text-coral"
                  >
                    ×
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            setSeller(null);
            navigate({ to: "/" });
          }}
          className="mx-auto mt-6 flex text-xs font-bold text-mint hover:bg-mint/10 hover:text-cream"
        >
          Leave (your orders stay saved under your name)
        </Button>
      </main>
    </div>
  );
}
