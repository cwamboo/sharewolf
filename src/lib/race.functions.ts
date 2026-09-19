import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const nameSchema = z.string().trim().min(1).max(60);

const normalize = (s: string) => s.trim().replace(/\s+/g, " ");

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

async function sellerId(name: string) {
  const db = await admin();
  const clean = normalize(name);
  const key = clean.toLowerCase();
  const existing = await db.from("sellers").select("id").eq("name_key", key).maybeSingle();
  if (existing.error) throw existing.error;
  if (existing.data) return existing.data.id;
  const created = await db.from("sellers").insert({ name: clean, name_key: key }).select("id").single();
  if (created.error) throw created.error;
  return created.data.id;
}

/** Register (or find) a seller by name — Kahoot-style join. */
export const joinSeller = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ name: nameSchema }).parse(data))
  .handler(async ({ data }) => {
    await sellerId(data.name);
    return { name: normalize(data.name) };
  });

export const addOrder = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z.object({ seller: nameSchema, customer: nameSchema, amount: z.number().positive().max(1_000_000) }).parse(data),
  )
  .handler(async ({ data }) => {
    const db = await admin();
    const id = await sellerId(data.seller);
    const { error } = await db
      .from("orders")
      .insert({ seller_id: id, customer_name: normalize(data.customer), amount: data.amount });
    if (error) throw error;
    return { ok: true };
  });

export const removeOrder = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data }) => {
    const db = await admin();
    const { error } = await db.from("orders").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

export const resetRace = createServerFn({ method: "POST" }).handler(async () => {
  const db = await admin();
  const { error } = await db.from("orders").delete().not("id", "is", null);
  if (error) throw error;
  return { ok: true };
});

export const loadDemo = createServerFn({ method: "POST" }).handler(async () => {
  const db = await admin();
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
  const now = Date.now();
  const ids = new Map<string, string>();
  for (const [seller] of demo) {
    if (!ids.has(seller)) ids.set(seller, await sellerId(seller));
  }
  const rows = demo.map(([seller, customer, amount, minAgo]) => ({
    seller_id: ids.get(seller)!,
    customer_name: customer,
    amount,
    created_at: new Date(now - minAgo * 60_000).toISOString(),
  }));
  const { error } = await db.from("orders").insert(rows);
  if (error) throw error;
  return { ok: true };
});
