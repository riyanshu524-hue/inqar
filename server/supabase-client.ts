import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export type SupabaseClient = ReturnType<typeof createClient>;

export async function createUserInSupabase(data: {
  email: string;
  name: string;
  username: string;
  passwordHash: string;
}) {
  try {
    // Generate a unique open_id
    const openId = `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Try inserting with email, name, and open_id (required field)
    const { data: user, error } = await supabaseAdmin
      .from("users")
      .insert([
        {
          email: data.email,
          name: data.name,
          open_id: openId,
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
      console.error("[Supabase] Error getting user:", error);
      return null;
    }

    return user || null;
  } catch (error) {
    console.error("[Supabase] Exception getting user:", error);
    return null;
  }
}
