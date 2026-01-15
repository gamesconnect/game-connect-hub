-- Enable full replica identity for registrations table (required for realtime to send full row data)
ALTER TABLE public.registrations REPLICA IDENTITY FULL;