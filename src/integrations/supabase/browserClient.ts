// Browser-safe backend client with robust fallbacks.
// We intentionally avoid importing from the auto-generated client here because
// missing build-time env injection can crash the whole app (blank screen).

import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

// These are PUBLIC values (safe to ship in the frontend). They act as a fallback
// in case build-time env injection fails in some publish/preview environments.
const FALLBACK_PROJECT_ID = "evdmaqrarpphywizrwhf";
const FALLBACK_URL = `https://${FALLBACK_PROJECT_ID}.supabase.co`;
const FALLBACK_PUBLISHABLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2ZG1hcXJhcnBwaHl3aXpyd2hmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3MDAzMzEsImV4cCI6MjA4MzI3NjMzMX0.55zE2N138iZtRFCpqEG4qr4elHvxIXEt1JE3bxqydS4";

const env = import.meta.env as Record<string, string | undefined>;

const SUPABASE_URL =
  env.VITE_SUPABASE_URL ??
  (env.VITE_SUPABASE_PROJECT_ID
    ? `https://${env.VITE_SUPABASE_PROJECT_ID}.supabase.co`
    : undefined) ??
  FALLBACK_URL;

const SUPABASE_PUBLISHABLE_KEY =
  env.VITE_SUPABASE_PUBLISHABLE_KEY ?? env.VITE_SUPABASE_ANON_KEY ?? FALLBACK_PUBLISHABLE_KEY;

if (!env.VITE_SUPABASE_URL || !(env.VITE_SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_ANON_KEY)) {
  // Don't log secrets; just signal that env injection is missing.
  console.warn("[backend] Missing Vite env injection; using public fallbacks.", {
    hasUrl: !!env.VITE_SUPABASE_URL,
    hasKey: !!(env.VITE_SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_ANON_KEY),
  });
}

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});
