CREATE TABLE public.customers (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  name_key text NOT NULL UNIQUE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.customers TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.customers TO anon;
GRANT ALL ON public.customers TO service_role;

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view customers" ON public.customers FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can add customers" ON public.customers FOR INSERT TO anon, authenticated WITH CHECK (char_length(name) >= 1 AND char_length(name) <= 60 AND name_key = lower(name));
CREATE POLICY "Anyone can rename customers" ON public.customers FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (char_length(name) >= 1 AND char_length(name) <= 60 AND name_key = lower(name));
CREATE POLICY "Anyone can remove customers" ON public.customers FOR DELETE TO anon, authenticated USING (true);

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.orders ADD COLUMN customer_id uuid REFERENCES public.customers(id) ON DELETE SET NULL;
CREATE INDEX orders_customer_id_idx ON public.orders (customer_id);

ALTER TABLE public.customers REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.customers;