import { useEffect } from "react";
import { useLocation } from "wouter";
import { Spinner } from "@/components/ui/spinner";

export default function AuthCallback() {
  const [, navigate] = useLocation();

  useEffect(() => {
    // Supabase will handle the OAuth callback automatically
    // Just redirect to home after a short delay
    const timer = setTimeout(() => {
      navigate("/");
    }, 1000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="flex flex-col items-center gap-4">
        <Spinner className="h-8 w-8" />
        <p className="text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  );
}
