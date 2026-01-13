-- Fix the registrations RLS policy that exposes data when user_id IS NULL
DROP POLICY IF EXISTS "Users can view their own registrations" ON public.registrations;

-- Create a more secure policy that only allows viewing when authenticated AND user matches
CREATE POLICY "Users can view their own registrations"
ON public.registrations
FOR SELECT
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- Add checked_in field for tracking check-ins
ALTER TABLE public.registrations 
ADD COLUMN IF NOT EXISTS checked_in boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS checked_in_at timestamp with time zone;