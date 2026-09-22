CREATE TABLE public.sites (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  name_key text NOT NULL UNIQUE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.sites TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sites TO authenticated;
GRANT ALL ON public.sites TO service_role;

ALTER TABLE public.sites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view sites" ON public.sites FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can add sites" ON public.sites FOR INSERT TO anon, authenticated WITH CHECK (char_length(name) >= 1 AND char_length(name) <= 60 AND name_key = lower(name));
CREATE POLICY "Anyone can rename sites" ON public.sites FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (char_length(name) >= 1 AND char_length(name) <= 60 AND name_key = lower(name));
CREATE POLICY "Anyone can remove sites" ON public.sites FOR DELETE TO anon, authenticated USING (true);

CREATE TRIGGER update_sites_updated_at BEFORE UPDATE ON public.sites FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.sites (name, name_key) VALUES ('Default site', 'default site');

ALTER TABLE public.customers ADD COLUMN site_id uuid REFERENCES public.sites(id) ON DELETE SET NULL;
CREATE INDEX idx_customers_site_id ON public.customers(site_id);

UPDATE public.customers SET site_id = (SELECT id FROM public.sites WHERE name_key = 'default site');

ALTER TABLE public.sites REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.sites;