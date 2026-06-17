import { createClient } from "@supabase/supabase-js";
import { ENV } from "./_core/env";

// Supabase client for server-side operations with service role
export const supabaseAdmin = createClient(
  ENV.supabaseUrl,
  ENV.supabaseServiceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Supabase client for client-side operations (anon key)
export const supabaseClient = createClient(
  ENV.supabaseUrl,
  ENV.supabaseAnonKey
);

export type SupabaseClient = ReturnType<typeof createClient>;
