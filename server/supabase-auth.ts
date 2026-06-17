import { supabaseAdmin } from "./supabase-client";
import type { User as SupabaseUser } from "@supabase/supabase-js";

/**
 * Sync user from Supabase Auth to INQAR users table
 */
export async function syncSupabaseUserToDatabase(
  supabaseUser: SupabaseUser
) {
  if (!supabaseUser.id || !supabaseUser.email) {
    throw new Error("User must have id and email");
  }

  const userData = {
    open_id: supabaseUser.id,
    email: supabaseUser.email,
    username: supabaseUser.user_metadata?.username || supabaseUser.email?.split("@")[0] || "user",
    name: supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name,
    avatar_url: supabaseUser.user_metadata?.avatar_url,
    is_private: false,
    login_method: "google",
  };

  try {
    // Insert or update user in INQAR users table
    const { data, error } = await supabaseAdmin
      .from("users")
      .upsert(
        {
          ...userData,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "open_id",
        }
      )
      .select()
      .single();

    if (error) {
      console.error("Error syncing user to database:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Failed to sync Supabase user to database:", error);
    throw error;
  }
}

/**
 * Get user from INQAR database by Supabase ID
 */
export async function getUserBySupabaseId(supabaseId: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("open_id", supabaseId)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 is "no rows returned"
      console.error("Error fetching user:", error);
      throw error;
    }

    return data || null;
  } catch (error) {
    console.error("Failed to get user from database:", error);
    throw error;
  }
}

/**
 * Create Supabase auth session
 */
export async function createAuthSession(supabaseUser: SupabaseUser) {
  try {
    // Sync user to database
    const dbUser = await syncSupabaseUserToDatabase(supabaseUser);

    return {
      user: supabaseUser,
      dbUser,
      sessionToken: supabaseUser.id,
    };
  } catch (error) {
    console.error("Failed to create auth session:", error);
    throw error;
  }
}
