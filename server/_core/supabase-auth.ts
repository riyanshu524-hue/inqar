import { createClient } from "@supabase/supabase-js";
import type { Express, Request, Response } from "express";
import { ENV } from "./env";

const supabase = createClient(ENV.supabaseUrl, ENV.supabaseServiceRoleKey);

export function registerSupabaseAuthRoutes(app: Express) {
  // Get login URL for frontend
  app.get("/api/auth/login-url", (req: Request, res: Response) => {
    const redirectUrl = `${req.protocol}://${req.get("host")}/api/auth/callback`;
    res.json({ redirectUrl });
  });

  // Supabase callback handler
  app.get("/api/auth/callback", async (req: Request, res: Response) => {
    const code = req.query.code as string;
    const state = req.query.state as string;

    if (!code) {
      res.status(400).json({ error: "No authorization code" });
      return;
    }

    try {
      // Exchange code for session
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      if (error || !data.session) {
        console.error("[Supabase Auth] Exchange failed:", error);
        res.status(400).json({ error: "Authentication failed" });
        return;
      }

      const session = data.session;
      const user = session.user;

      // Store session in cookie
      res.cookie("sb-access-token", session.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      });

      res.cookie("sb-refresh-token", session.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      // Redirect to home or return to app
      res.redirect("/");
    } catch (error) {
      console.error("[Supabase Auth] Callback error:", error);
      res.status(500).json({ error: "Authentication failed" });
    }
  });

  // Logout
  app.post("/api/auth/logout", (req: Request, res: Response) => {
    res.clearCookie("sb-access-token");
    res.clearCookie("sb-refresh-token");
    res.json({ success: true });
  });

  // Get current user
  app.get("/api/auth/me", async (req: Request, res: Response) => {
    const accessToken = req.cookies["sb-access-token"];

    if (!accessToken) {
      res.json({ user: null });
      return;
    }

    try {
      const { data, error } = await supabase.auth.getUser(accessToken);

      if (error || !data.user) {
        res.json({ user: null });
        return;
      }

      res.json({ user: data.user });
    } catch (error) {
      console.error("[Supabase Auth] Get user error:", error);
      res.json({ user: null });
    }
  });
}

export { supabase };
