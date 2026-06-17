import { describe, it, expect } from "vitest";

describe("Supabase Configuration", () => {
  it("should have valid Supabase environment variables", () => {
    expect(process.env.SUPABASE_URL).toBeDefined();
    expect(process.env.SUPABASE_URL).toContain("supabase.co");
    expect(process.env.SUPABASE_ANON_KEY).toBeDefined();
    expect(process.env.SUPABASE_SERVICE_ROLE_KEY).toBeDefined();
  });

  it("should validate Supabase URL format", () => {
    const url = process.env.SUPABASE_URL;
    expect(url).toMatch(/^https:\/\/[a-z0-9]+\.supabase\.co$/);
  });

  it("should have valid JWT tokens", () => {
    const anonKey = process.env.SUPABASE_ANON_KEY;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    // JWT tokens have 3 parts separated by dots
    expect(anonKey?.split(".").length).toBe(3);
    expect(serviceKey?.split(".").length).toBe(3);
  });

  it("should decode JWT tokens correctly", () => {
    const anonKey = process.env.SUPABASE_ANON_KEY;
    if (!anonKey) return;

    const parts = anonKey.split(".");
    const payload = JSON.parse(Buffer.from(parts[1], "base64").toString());
    
    expect(payload.role).toBe("anon");
    expect(payload.iss).toBe("supabase");
  });

  it("should have service role key with correct role", () => {
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceKey) return;

    const parts = serviceKey.split(".");
    const payload = JSON.parse(Buffer.from(parts[1], "base64").toString());
    
    expect(payload.role).toBe("service_role");
    expect(payload.iss).toBe("supabase");
  });
});
