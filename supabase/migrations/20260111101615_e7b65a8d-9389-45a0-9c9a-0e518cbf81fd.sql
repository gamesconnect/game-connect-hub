-- Create event pricing tiers table
CREATE TABLE public.event_pricing_tiers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL DEFAULT 0,
  description TEXT,
  spots INTEGER,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.event_pricing_tiers ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Pricing tiers are viewable by everyone"
ON public.event_pricing_tiers
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage pricing tiers"
ON public.event_pricing_tiers
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));