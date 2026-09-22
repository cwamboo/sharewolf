import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  addCustomer as addCustomerFn,
  addOrder as addOrderFn,
  addSite as addSiteFn,
  joinSeller as joinSellerFn,
  loadDemo as loadDemoFn,
  removeCustomer as removeCustomerFn,
  removeOrder as removeOrderFn,
  removeSite as removeSiteFn,
  renameCustomer as renameCustomerFn,
  renameSite as renameSiteFn,
  resetRace as resetRaceFn,
  setCustomerSite as setCustomerSiteFn,
} from "@/lib/race.functions";

export type Order = {
  id: string;
  seller: string;
  customer: string;
  customerId: string | null;
  siteId: string | null;
  amount: number;
  at: number;
};

export type Customer = { id: string; name: string; siteId: string | null };
export type Site = { id: string; name: string };

export type Racer = {
  name: string;
  total: number;
  orders: number;
  lastAt: number;
};

const SELLER_KEY = "sprintrace:seller";

export const RACER_COLORS = ["coral", "mint", "grape", "sun"] as const;
export type RacerColor = (typeof RACER_COLORS)[number];

export const normalizeName = (name: string) => name.trim().replace(/\s+/g, " ");
const keyOf = (name: string) => normalizeName(name).toLowerCase();

export function colorFor(name: string): RacerColor {
  let h = 0;
  for (const c of keyOf(name)) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return RACER_COLORS[h % RACER_COLORS.length] ?? "coral";
}

export const formatMoney = (n: number) =>
  `${new Intl.NumberFormat("fr-BE", { maximumFractionDigits: 0 }).format(n)} PTS`;

async function fetchOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from("orders")
    .select("id, customer_name, customer_id, amount, created_at, sellers(name), customers(site_id)")
    .order("created_at", { ascending: true })
    .limit(1000);
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id,
    seller: (row.sellers as { name: string } | null)?.name ?? "—",
    customer: row.customer_name,
    customerId: row.customer_id,
    siteId: (row.customers as { site_id: string | null } | null)?.site_id ?? null,
    amount: Number(row.amount),
    at: new Date(row.created_at).getTime(),
  }));
}

/** Scoreboard: totals per customer (sellers are only intermediaries). */
export function computeRacers(orders: Order[]): Racer[] {
  const map = new Map<string, Racer>();
  for (const o of orders) {
    const k = keyOf(o.customer);
    const r = map.get(k) ?? { name: normalizeName(o.customer), total: 0, orders: 0, lastAt: 0 };
    r.total += o.amount;
    r.orders += 1;
    r.lastAt = Math.max(r.lastAt, o.at);
    map.set(k, r);
  }
  return [...map.values()].sort((a, b) => b.total - a.total || a.lastAt - b.lastAt);
}

/** Live list of all orders, streamed from the database to every device. */
export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [ready, setReady] = useState(false);
  const pending = useRef(false);

  const refresh = useCallback(async () => {
    if (pending.current) return;
    pending.current = true;
    try {
      setOrders(await fetchOrders());
    } catch (e) {
      console.error("Failed to load orders", e);
    } finally {
      pending.current = false;
      setReady(true);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const channel = supabase
      .channel("sprintrace-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => void refresh())
      .on("postgres_changes", { event: "*", schema: "public", table: "sellers" }, () => void refresh())
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [refresh]);

  const addOrder = useCallback(
    async (seller: string, customerId: string, amount: number) => {
      await addOrderFn({ data: { seller, customerId, amount } });
      await refresh();
    },
    [refresh],
  );

  const removeOrder = useCallback(
    async (id: string) => {
      await removeOrderFn({ data: { id } });
      await refresh();
    },
    [refresh],
  );

  const resetRace = useCallback(async () => {
    await resetRaceFn();
    await refresh();
  }, [refresh]);

  const loadDemo = useCallback(async () => {
    await loadDemoFn();
    await refresh();
  }, [refresh]);

  return { orders, ready, addOrder, removeOrder, resetRace, loadDemo, refresh };
}

/** The seller name remembered on this device (Kahoot-style session). */
export function useSellerSession() {
  const [seller, setSellerState] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setSellerState(window.localStorage.getItem(SELLER_KEY));
    setReady(true);
  }, []);

  const setSeller = useCallback((name: string | null) => {
    if (name) {
      const clean = normalizeName(name);
      window.localStorage.setItem(SELLER_KEY, clean);
      setSellerState(clean);
      void joinSellerFn({ data: { name: clean } }).catch((e) => console.error("Failed to join", e));
    } else {
      window.localStorage.removeItem(SELLER_KEY);
      setSellerState(null);
    }
  }, []);

  return { seller, ready, setSeller };
}

export const isSameSeller = (a: string, b: string) => keyOf(a) === keyOf(b);

/** The fixed customer list, live from the database. */
export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    const { data, error } = await supabase.from("customers").select("id, name, site_id").order("name").limit(1000);
    if (error) console.error("Failed to load customers", error);
    else setCustomers((data ?? []).map((c) => ({ id: c.id, name: c.name, siteId: c.site_id })));
    setReady(true);
  }, []);

  useEffect(() => {
    void refresh();
    const channel = supabase
      .channel("sprintrace-customers")
      .on("postgres_changes", { event: "*", schema: "public", table: "customers" }, () => void refresh())
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [refresh]);

  const addCustomer = useCallback(
    async (name: string, siteId?: string | null) => {
      await addCustomerFn({ data: { name: normalizeName(name), siteId: siteId ?? null } });
      await refresh();
    },
    [refresh],
  );

  const setCustomerSite = useCallback(
    async (id: string, siteId: string | null) => {
      await setCustomerSiteFn({ data: { id, siteId } });
      await refresh();
    },
    [refresh],
  );

  const renameCustomer = useCallback(
    async (id: string, name: string) => {
      await renameCustomerFn({ data: { id, name: normalizeName(name) } });
      await refresh();
    },
    [refresh],
  );

  const removeCustomer = useCallback(
    async (id: string) => {
      await removeCustomerFn({ data: { id } });
      await refresh();
    },
    [refresh],
  );

  return { customers, ready, addCustomer, renameCustomer, removeCustomer, setCustomerSite, refresh };
}

/** The list of sites customers belong to, live from the database. */
export function useSites() {
  const [sites, setSites] = useState<Site[]>([]);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    const { data, error } = await supabase.from("sites").select("id, name").order("name").limit(1000);
    if (error) console.error("Failed to load sites", error);
    else setSites(data ?? []);
    setReady(true);
  }, []);

  useEffect(() => {
    void refresh();
    const channel = supabase
      .channel("sprintrace-sites")
      .on("postgres_changes", { event: "*", schema: "public", table: "sites" }, () => void refresh())
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [refresh]);

  const addSite = useCallback(
    async (name: string) => {
      await addSiteFn({ data: { name: normalizeName(name) } });
      await refresh();
    },
    [refresh],
  );

  const renameSite = useCallback(
    async (id: string, name: string) => {
      await renameSiteFn({ data: { id, name: normalizeName(name) } });
      await refresh();
    },
    [refresh],
  );

  const removeSite = useCallback(
    async (id: string) => {
      await removeSiteFn({ data: { id } });
      await refresh();
    },
    [refresh],
  );

  return { sites, ready, addSite, renameSite, removeSite, refresh };
}
