export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

export const getLoginUrl = () => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("Supabase credentials not configured");
    return "/";
  }

  try {
    // Build the OAuth URL directly without creating Supabase client
    const redirectUri = `${window.location.origin}/api/auth/callback`;
    const params = new URLSearchParams({
      client_id: supabaseKey,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "openid profile email",
      provider: "google",
    });

    const url = `${supabaseUrl}/auth/v1/authorize?${params.toString()}`;
    return url;
  } catch (error) {
    console.error("Login URL error:", error);
    return "/";
  }
};
