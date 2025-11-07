import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import type { Session } from "@supabase/supabase-js";

const Layout = () => {
  const [session, setSession] = useState<Session | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) {
        navigate("/login");
      }
    });

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

  if (!session) {
    return null; // Or a loading spinner
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