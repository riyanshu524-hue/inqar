import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { supabaseAdmin } from "../supabase-client";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    // Get user session from cookie
    const sessionCookie = opts.req.cookies?.["user-session"];

    if (sessionCookie) {
      // Fetch user from Supabase by ID
      const { data, error } = await supabaseAdmin
        .from("users")
        .select("*")
        .eq("id", sessionCookie)
        .single();

      if (!error && data) {
        user = data as User;
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
  };
}
