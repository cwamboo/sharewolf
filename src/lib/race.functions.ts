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
    z
      .object({ seller: nameSchema, customerId: z.string().uuid(), amount: z.number().positive().max(1_000_000) })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const db = await admin();
    const id = await sellerId(data.seller);
    const customer = await db.from("customers").select("name").eq("id", data.customerId).single();
    if (customer.error) throw customer.error;
    const { error } = await db.from("orders").insert({
      seller_id: id,
      customer_id: data.customerId,
      customer_name: customer.data.name,
      amount: data.amount,
    });
    if (error) throw error;
    return { ok: true };
  });

/** Customer list management (the scoreboard is built from these). */
export const addCustomer = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z.object({ name: nameSchema, siteId: z.string().uuid().nullable().optional() }).parse(data),
  )
  .handler(async ({ data }) => {
    const db = await admin();
    const clean = normalize(data.name);
    const { error } = await db
      .from("customers")
      .upsert(
        { name: clean, name_key: clean.toLowerCase(), site_id: data.siteId ?? null },
        { onConflict: "name_key" },
      );
    if (error) throw error;
    return { ok: true };
  });

export const renameCustomer = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid(), name: nameSchema }).parse(data))
  .handler(async ({ data }) => {
    const db = await admin();
    const clean = normalize(data.name);
    const { error } = await db
      .from("customers")
      .update({ name: clean, name_key: clean.toLowerCase() })
      .eq("id", data.id);
    if (error) throw error;
    const synced = await db.from("orders").update({ customer_name: clean }).eq("customer_id", data.id);
    if (synced.error) throw synced.error;
    return { ok: true };
  });

/** Site management — customers are attached to a site. */
export const addSite = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ name: nameSchema }).parse(data))
  .handler(async ({ data }) => {
    const db = await admin();
    const clean = normalize(data.name);
    const { error } = await db
      .from("sites")
      .upsert({ name: clean, name_key: clean.toLowerCase() }, { onConflict: "name_key" });
    if (error) throw error;
    return { ok: true };
  });

export const renameSite = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid(), name: nameSchema }).parse(data))
  .handler(async ({ data }) => {
    const db = await admin();
    const clean = normalize(data.name);
    const { error } = await db
      .from("sites")
      .update({ name: clean, name_key: clean.toLowerCase() })
      .eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

export const removeSite = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data }) => {
    const db = await admin();
    const { error } = await db.from("sites").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

export const setCustomerSite = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z.object({ id: z.string().uuid(), siteId: z.string().uuid().nullable() }).parse(data),
  )
  .handler(async ({ data }) => {
    const db = await admin();
    const { error } = await db.from("customers").update({ site_id: data.siteId }).eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

export const removeCustomer = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data }) => {
    const db = await admin();
    const { error } = await db.from("customers").delete().eq("id", data.id);
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
  const customerIds = new Map<string, string>();
  for (const [, customer] of demo) {
    if (customerIds.has(customer)) continue;
    const key = customer.toLowerCase();
    const up = await db
      .from("customers")
      .upsert({ name: customer, name_key: key }, { onConflict: "name_key" })
      .select("id")
      .single();
    if (up.error) throw up.error;
    customerIds.set(customer, up.data.id);
  }
  const rows = demo.map(([seller, customer, amount, minAgo]) => ({
    seller_id: ids.get(seller)!,
    customer_id: customerIds.get(customer)!,
    customer_name: customer,
    amount,
    created_at: new Date(now - minAgo * 60_000).toISOString(),
  }));
  const { error } = await db.from("orders").insert(rows);
  if (error) throw error;
  return { ok: true };
});
