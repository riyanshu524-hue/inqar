import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://wstsetvbaajmtmwowezq.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndzdHNldHZiYWFqbXRtd293ZXpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2ODc0OTYsImV4cCI6MjA5NzI2MzQ5Nn0.Gg5CCACZOw4K7V9wiWChJVbG-M_jWs8VMVbzTNaprys";

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  try {
    // Try to get one user to see what columns exist
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .limit(1);

    if (error) {
      console.error("Error fetching users:", error);
      return;
    }

    if (data && data.length > 0) {
      console.log("Existing user columns:", Object.keys(data[0]));
      console.log("Sample user:", JSON.stringify(data[0], null, 2));
    } else {
      console.log("No users found in table. Trying to insert test user...");
      const { data: inserted, error: insertError } = await supabase
        .from("users")
        .insert([{ email: "test@example.com", name: "Test" }])
        .select();
      if (insertError) {
        console.error("Insert error:", insertError);
      } else {
        console.log("Inserted user columns:", Object.keys(inserted[0]));
      }
    }
  } catch (err) {
    console.error("Exception:", err);
  }
}

checkSchema();
