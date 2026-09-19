import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  addOrder as addOrderFn,
  joinSeller as joinSellerFn,
  loadDemo as loadDemoFn,
  removeOrder as removeOrderFn,
  resetRace as resetRaceFn,
} from "@/lib/race.functions";

export type Order = {
  id: string;
  seller: string;
  customer: string;
  amount: number;
  at: number;
};

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
  new Intl.NumberFormat("fr-BE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

async function fetchOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from("orders")
    .select("id, customer_name, amount, created_at, sellers(name)")
    .order("created_at", { ascending: true })
    .limit(1000);
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id,
    seller: (row.sellers as { name: string } | null)?.name ?? "—",
    customer: row.customer_name,
    amount: Number(row.amount),
    at: new Date(row.created_at).getTime(),
  }));
}


export function computeRacers(orders: Order[]): Racer[] {
  const map = new Map<string, Racer>();
  for (const o of orders) {
    const k = keyOf(o.seller);
    const r = map.get(k) ?? { name: normalizeName(o.seller), total: 0, orders: 0, lastAt: 0 };
    r.total += o.amount;
    r.orders += 1;
    r.lastAt = Math.max(r.lastAt, o.at);
    map.set(k, r);
  }
  return [...map.values()].sort((a, b) => b.total - a.total || a.lastAt - b.lastAt);
}

/** Live list of all orders, synced across tabs on this device. */
export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sync = () => setOrders(readOrders());
    sync();
    setReady(true);
    window.addEventListener("storage", sync);
    window.addEventListener(EVENT, sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(EVENT, sync);
    };
  }, []);

  const addOrder = useCallback((seller: string, customer: string, amount: number) => {
    const order: Order = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      seller: normalizeName(seller),
      customer: normalizeName(customer),
      amount,
      at: Date.now(),
    };
    writeOrders([...readOrders(), order]);
    return order;
  }, []);

  const removeOrder = useCallback((id: string) => {
    writeOrders(readOrders().filter((o) => o.id !== id));
  }, []);

  const resetRace = useCallback(() => writeOrders([]), []);

  const loadDemo = useCallback(() => {
    const now = Date.now();
    const demo: [string, string, number, number][] = [
      ["Marco Riva", "Amina B.", 620, 2],
      ["Lena Kova", "Tom H.", 450, 5],
      ["Dario Font", "Ravi P.", 310, 9],
      ["Sofia Mar", "Nadia L.", 180, 14],
      ["Marco Riva", "Jules D.", 1400, 22],
      ["Lena Kova", "Elise V.", 990, 30],
      ["Marco Riva", "Karim S.", 2800, 41],
      ["Lena Kova", "Bram P.", 2500, 55],
      ["Dario Font", "Léa M.", 1840, 63],
      ["Sofia Mar", "Noor A.", 1200, 75],
    ];
    writeOrders(
      demo.map(([seller, customer, amount, minAgo], i) => ({
        id: `demo-${i}`,
        seller,
        customer,
        amount,
        at: now - minAgo * 60_000,
      })),
    );
  }, []);

  return { orders, ready, addOrder, removeOrder, resetRace, loadDemo };
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
    if (name) window.localStorage.setItem(SELLER_KEY, normalizeName(name));
    else window.localStorage.removeItem(SELLER_KEY);
    setSellerState(name ? normalizeName(name) : null);
  }, []);

  return { seller, ready, setSeller };
}

export const isSameSeller = (a: string, b: string) => keyOf(a) === keyOf(b);
