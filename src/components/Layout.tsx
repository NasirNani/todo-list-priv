import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import type { Session } from "@supabase/supabase-js";
import { Spinner } from "./Spinner";

const Layout = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // 1. Check initial session status
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsLoading(false); // Finished checking
      if (!session) {
        navigate("/login");
      }
    });

    // 2. Set up listener for future changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        navigate("/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  if (isLoading) {
    return <Spinner />;
  }

  if (!session) {
    // Fallback: If we finished loading and still have no session, we should have been redirected.
    return <Spinner />;
  }

  return (
    <div>
      <header className="p-4 flex justify-between items-center border-b">
        <h1 className="text-xl font-bold">Todo App</h1>
        <Button onClick={handleSignOut}>Sign Out</Button>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;