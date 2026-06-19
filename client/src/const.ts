export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Generate Supabase login URL at runtime
export const getLoginUrl = () => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const redirectUri = `${window.location.origin}/api/auth/callback`;
  
  if (!supabaseUrl) {
    console.error("VITE_SUPABASE_URL is not set");
    return "/";
  }
  
  // Supabase OAuth URL format: https://<project-id>.supabase.co/auth/v1/authorize
  const url = new URL(`${supabaseUrl}/auth/v1/authorize`);
  url.searchParams.set("provider", "google");
  url.searchParams.set("redirect_to", redirectUri);
  
  return url.toString();
};
