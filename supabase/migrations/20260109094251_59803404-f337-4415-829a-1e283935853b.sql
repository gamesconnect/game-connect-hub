-- First, add missing columns to the events table
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS gallery jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS additional_info jsonb DEFAULT NULL,
ADD COLUMN IF NOT EXISTS schedule text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS requirements jsonb DEFAULT NULL,
ADD COLUMN IF NOT EXISTS includes jsonb DEFAULT NULL,
ADD COLUMN IF NOT EXISTS organizer text DEFAULT NULL;

-- Delete all existing sample events
DELETE FROM public.events;