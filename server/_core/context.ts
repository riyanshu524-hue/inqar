import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { supabase } from "./supabase-auth";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
  supabaseUser: any | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;
  let supabaseUser: any | null = null;

  try {
    // Get Supabase access token from cookies
    const accessToken = opts.req.cookies["sb-access-token"];

    if (accessToken) {
      // Verify token with Supabase
      const { data, error } = await supabase.auth.getUser(accessToken);

      if (!error && data.user) {
        supabaseUser = data.user;
        // In a real app, you'd fetch the user from your database here
        // For now, we'll just use the Supabase user info
      }
    }
  } catch (error) {
    // Authentication is optional for public procedures.
    console.error("[Context] Auth error:", error);
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
    supabaseUser,
  };
}
