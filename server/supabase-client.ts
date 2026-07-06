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

export async function createUserInSupabase(data: {
  email: string;
  name: string;
  username: string;
  passwordHash: string;
}) {
  try {
    const { data: user, error } = await supabaseAdmin
      .from("users")
      .insert([
        {
          email: data.email,
          name: data.name,
          username: data.username,
          passwordHash: data.passwordHash,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("[Supabase] Error creating user:", error);
      return null;
    }

    return user;
  } catch (error) {
    console.error("[Supabase] Exception creating user:", error);
    return null;
  }
}

export async function getUserFromSupabase(email: string) {
  try {
    const { data: user, error } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 = no rows found
      console.error("[Supabase] Error fetching user:", error);
    }

    return user || null;
  } catch (error) {
    console.error("[Supabase] Exception fetching user:", error);
    return null;
  }
}
