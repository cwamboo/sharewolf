import { colorFor, formatMoney, type Order } from "@/lib/race-store";

const AVATAR: Record<string, string> = {
  coral: "bg-coral/15 text-coral",
  mint: "bg-mint/15 text-mint",
  grape: "bg-grape/15 text-grape",
  sun: "bg-sun/30 text-ink",
};
const BADGE: Record<string, string> = {
  coral: "bg-coral text-cream",
  mint: "bg-mint text-cream",
  grape: "bg-grape text-cream",
  sun: "bg-sun text-ink",
};

export function FreshOrders({ orders, limit = 6 }: { orders: Order[]; limit?: number }) {
  const latest = [...orders].sort((a, b) => b.at - a.at).slice(0, limit);
  return (
    <section className="border border-mint/15 bg-ink/60 p-4">
      <h2 className="mb-4 border-l-2 border-coral pl-2 font-display text-xs uppercase">Comms feed / recent orders</h2>
      {latest.length === 0 ? (
        <p className="py-6 text-center text-sm font-bold text-mint">Waiting for the first confirmed order…</p>
      ) : (
        <div className="space-y-3">
          {latest.map((o) => {
            const c = colorFor(o.seller);
            return (
              <div
                key={o.id}
                className="flex animate-fade-in items-center gap-3 border-b border-mint/15 bg-card/40 p-3"
              >
                <span
                  className={`grid size-9 shrink-0 place-items-center font-display text-sm ${AVATAR[c]}`}
                >
                  {o.seller.charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold">
                    {o.seller} <span className="font-semibold text-ink/40">→</span> {o.customer}
                  </p>
                  <p className="text-[11px] font-semibold text-mint">
                    {new Date(o.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                <span className={`px-3 py-1 text-sm font-bold ${BADGE[c]}`}>+{formatMoney(o.amount)}</span>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
