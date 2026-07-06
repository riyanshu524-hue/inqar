import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://wstsetvbaajmtmwowezq.supabase.co";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceRoleKey) {
  console.error("SUPABASE_SERVICE_ROLE_KEY not set");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function checkSchema() {
  try {
    // Try to get table info
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .limit(1);

    if (error) {
      console.error("Error fetching users:", error);
      return;
    }

    if (data && data.length > 0) {
      console.log("✅ Existing user columns:", Object.keys(data[0]));
      console.log("Sample user:", JSON.stringify(data[0], null, 2));
    } else {
      console.log("No users in table yet. Table structure unknown.");
    }
  } catch (err) {
    console.error("Exception:", err);
  }
}

checkSchema();
