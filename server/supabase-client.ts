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
    // Generate unique open_id and username
    const openId = `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const generatedUsername = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const insertData = {
      email: data.email,
      name: data.name,
      open_id: openId,
      username: generatedUsername,
    };
    
    console.log("[Supabase] Attempting to insert user with data:", JSON.stringify(insertData));
    
    // Try inserting with email, name, open_id, and username (all required fields)
    // Use snake_case to match Supabase PostgreSQL schema
    const { data: user, error } = await supabaseAdmin
      .from("users")
      .insert([insertData])
      .select()
      .single();

    if (error) {
      console.error("[Supabase] Error creating user:", error);
      return null;
    }

    console.log("[Supabase] User created successfully:", user?.id);
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
