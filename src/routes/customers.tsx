import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/race/SiteHeader";
import { computeRacers, formatMoney, useCustomers, useOrders, useSites } from "@/lib/race-store";

export const Route = createFileRoute("/customers")({
  head: () => ({
    meta: [
      { title: "Customer list — SprintRace" },
      { name: "description", content: "Manage the fixed list of customers and sites competing in the live order race." },
      { property: "og:title", content: "Customer list — SprintRace" },
      { property: "og:description", content: "Manage the fixed list of customers and sites competing in the live order race." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CustomersPage,
});

function CustomersPage() {
  const { customers, ready, addCustomer, renameCustomer, removeCustomer, setCustomerSite } = useCustomers();
  const { sites, addSite, renameSite, removeSite } = useSites();
  const { orders } = useOrders();
  const [name, setName] = useState("");
  const [newSiteId, setNewSiteId] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [siteName, setSiteName] = useState("");
  const [editingSite, setEditingSite] = useState<string | null>(null);
  const [siteDraft, setSiteDraft] = useState("");

  const totals = useMemo(() => {
    const map = new Map<string, { total: number; orders: number }>();
    for (const r of computeRacers(orders)) map.set(r.name.toLowerCase(), { total: r.total, orders: r.orders });
    return map;
  }, [orders]);

  const siteCount = useMemo(() => {
    const map = new Map<string, number>();
    for (const c of customers) if (c.siteId) map.set(c.siteId, (map.get(c.siteId) ?? 0) + 1);
    return map;
  }, [customers]);

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    void addCustomer(name, newSiteId || null).catch(() => alert("Could not add this customer."));
    setName("");
  };

  const addSiteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!siteName.trim()) return;
    void addSite(siteName).catch(() => alert("Could not add this site."));
    setSiteName("");
  };

  const inputClass =
    "h-11 w-full border border-mint/25 bg-mint/5 px-3 text-sm font-bold text-cream placeholder:text-mint focus:border-coral focus:outline-none";

  return (
    <div className="min-h-screen pb-10">
      <SiteHeader
        right={
          <Link to="/" className="pill bg-card">
            Dashboard
          </Link>
        }
      />

      <main className="mx-auto max-w-2xl px-4 py-6">
        <div className="mb-4">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-coral">Entry list</p>
          <h1 className="font-display text-3xl uppercase">Customers &amp; sites</h1>
          <p className="mt-1 text-xs font-semibold text-mint">
            Sellers pick from this list when logging an order. The race is scored per customer, and can be filtered by site.
          </p>
        </div>

        <section className="telemetry-panel mb-6 p-4">
          <h2 className="mb-3 font-display text-sm uppercase">Sites</h2>
          <form onSubmit={addSiteSubmit} className="flex gap-2">
            <input
              type="text"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              placeholder="New site name"
              autoComplete="off"
              maxLength={60}
              className={inputClass}
            />
            <Button
              type="submit"
              className="h-11 shrink-0 -skew-x-6 rounded-none bg-coral px-5 font-display text-xs uppercase text-cream shadow-none hover:bg-coral/90"
            >
              <span className="skew-x-6">Add site</span>
            </Button>
          </form>

          {sites.length === 0 ? (
            <p className="py-5 text-center text-sm font-bold text-mint">No sites yet. Add the first one above.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {sites.map((s) => (
                <li key={s.id} className="flex items-center gap-2 border-b border-mint/15 bg-mint/5 px-3 py-2">
                  {editingSite === s.id ? (
                    <>
                      <input
                        type="text"
                        value={siteDraft}
                        onChange={(e) => setSiteDraft(e.target.value)}
                        maxLength={60}
                        className="h-9 min-w-0 flex-1 border border-mint/25 bg-ink px-2 text-sm font-bold text-cream focus:border-coral focus:outline-none"
                      />
                      <Button
                        type="button"
                        onClick={() => {
                          if (!siteDraft.trim()) return;
                          void renameSite(s.id, siteDraft).catch(() => alert("Could not rename this site."));
                          setEditingSite(null);
                        }}
                        className="h-9 rounded-none bg-coral px-3 text-xs uppercase text-cream shadow-none hover:bg-coral/90"
                      >
                        Save
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setEditingSite(null)}
                        className="h-9 rounded-none px-2 text-xs text-mint hover:bg-mint/10 hover:text-cream"
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <>
                      <span className="min-w-0 flex-1 truncate text-sm font-bold">{s.name}</span>
                      <span className="text-[11px] font-semibold text-mint">{siteCount.get(s.id) ?? 0} cust.</span>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => {
                          setEditingSite(s.id);
                          setSiteDraft(s.name);
                        }}
                        className="h-8 rounded-none px-2 text-xs text-mint hover:bg-mint/10 hover:text-cream"
                      >
                        Rename
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        aria-label={`Remove site ${s.name}`}
                        onClick={() => {
                          if (confirm(`Remove the site ${s.name}? Its customers stay, without a site.`))
                            void removeSite(s.id).catch(() => alert("Could not remove this site."));
                        }}
                        className="size-8 rounded-none text-mint hover:bg-coral/15 hover:text-coral"
                      >
                        ×
                      </Button>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        <form onSubmit={add} className="telemetry-panel flex flex-wrap gap-2 p-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="New customer name"
            autoComplete="off"
            maxLength={60}
            className={`${inputClass} min-w-[12rem] flex-1`}
          />
          <select
            value={newSiteId}
            onChange={(e) => setNewSiteId(e.target.value)}
            aria-label="Site for the new customer"
            className="h-11 border border-mint/25 bg-mint/5 px-3 text-sm font-bold text-cream focus:border-coral focus:outline-none"
          >
            <option value="">No site</option>
            {sites.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <Button
            type="submit"
            className="h-11 shrink-0 -skew-x-6 rounded-none bg-coral px-5 font-display text-xs uppercase text-cream shadow-none hover:bg-coral/90"
          >
            <span className="skew-x-6">Add</span>
          </Button>
        </form>

        <section className="telemetry-panel mt-4 p-4">
          <h2 className="mb-3 font-display text-sm uppercase">{customers.length} customer{customers.length === 1 ? "" : "s"}</h2>
          {!ready ? (
            <p className="py-6 text-center text-sm font-bold text-mint">Loading…</p>
          ) : customers.length === 0 ? (
            <p className="py-6 text-center text-sm font-bold text-mint">No customers yet. Add the first one above.</p>
          ) : (
            <ul className="space-y-2">
              {customers.map((c) => {
                const stat = totals.get(c.name.toLowerCase());
                return (
                  <li key={c.id} className="flex flex-wrap items-center gap-2 border-b border-mint/15 bg-mint/5 px-3 py-2">
                    {editing === c.id ? (
                      <>
                        <input
                          type="text"
                          value={draft}
                          onChange={(e) => setDraft(e.target.value)}
                          maxLength={60}
                          className="h-9 min-w-0 flex-1 border border-mint/25 bg-ink px-2 text-sm font-bold text-cream focus:border-coral focus:outline-none"
                        />
                        <Button
                          type="button"
                          onClick={() => {
                            if (!draft.trim()) return;
                            void renameCustomer(c.id, draft).catch(() => alert("Could not rename this customer."));
                            setEditing(null);
                          }}
                          className="h-9 rounded-none bg-coral px-3 text-xs uppercase text-cream shadow-none hover:bg-coral/90"
                        >
                          Save
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => setEditing(null)}
                          className="h-9 rounded-none px-2 text-xs text-mint hover:bg-mint/10 hover:text-cream"
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <>
                        <span className="min-w-0 flex-1 truncate text-sm font-bold">{c.name}</span>
                        <select
                          value={c.siteId ?? ""}
                          onChange={(e) =>
                            void setCustomerSite(c.id, e.target.value || null).catch(() =>
                              alert("Could not change the site."),
                            )
                          }
                          aria-label={`Site of ${c.name}`}
                          className="h-8 max-w-[9rem] border border-mint/25 bg-ink px-2 text-xs font-bold text-cream focus:border-coral focus:outline-none"
                        >
                          <option value="">No site</option>
                          {sites.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name}
                            </option>
                          ))}
                        </select>
                        <span className="text-xs font-bold tabular-nums text-coral">
                          {formatMoney(stat?.total ?? 0)}
                        </span>
                        <span className="text-[11px] font-semibold text-mint">{stat?.orders ?? 0} ord.</span>
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => {
                            setEditing(c.id);
                            setDraft(c.name);
                          }}
                          className="h-8 rounded-none px-2 text-xs text-mint hover:bg-mint/10 hover:text-cream"
                        >
                          Rename
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          aria-label={`Remove ${c.name}`}
                          onClick={() => {
                            if (confirm(`Remove ${c.name} from the customer list?`))
                              void removeCustomer(c.id).catch(() => alert("Could not remove this customer."));
                          }}
                          className="size-8 rounded-none text-mint hover:bg-coral/15 hover:text-coral"
                        >
                          ×
                        </Button>
                      </>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
