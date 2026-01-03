import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

export default function RequireAuth() {
  const location = useLocation();
  const [checking, setChecking] = useState(true);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    let mounted = true;

    const check = async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setHasSession(!!data.session);
      setChecking(false);
    };

    check();

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setHasSession(!!session);
      setChecking(false);
    });

    return () => {
      mounted = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  if (checking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Checking session…</span>
        </div>
      </div>
    );
  }

  if (!hasSession) {
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
