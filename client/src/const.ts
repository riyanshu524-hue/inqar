export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Generate Supabase login URL at runtime
export const getLoginUrl = () => {
  // Supabase URL is automatically injected as VITE_SUPABASE_URL
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const redirectUri = `${window.location.origin}/api/auth/callback`;
  
  if (!supabaseUrl) {
    console.warn("Supabase URL not configured, redirecting to home");
    return "/";
  }
  
  try {
    // Supabase OAuth URL format: https://<project-id>.supabase.co/auth/v1/authorize
    const url = new URL(`${supabaseUrl}/auth/v1/authorize`);
    url.searchParams.set("provider", "google");
    url.searchParams.set("redirect_to", redirectUri);
    
    return url.toString();
  } catch (error) {
    console.error("Error creating login URL:", error);
    return "/";
  }
};
