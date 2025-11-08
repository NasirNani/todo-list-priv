import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { Outlet, useNavigate, Link } from "react-router-dom";
import { Button } from "./ui/button";
import type { Session } from "@supabase/supabase-js";
import { Spinner } from "./Spinner";
import { Users } from "lucide-react";

const Layout = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Actively fetch the session on component mount.
    // This is more reliable, especially on mobile web views.
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsLoading(false);
    });

    // Listen for auth state changes (login, logout, etc.)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    // Redirect to login if not loading and no session exists.
    if (!isLoading && !session) {
      navigate("/login");
    }
  }, [session, isLoading, navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  if (isLoading || !session) {
    return <Spinner />;
  }

  return (
    <div>
      <header className="p-4 flex justify-between items-center border-b">
        <Link to="/" className="text-xl font-bold">
          Todo App
        </Link>
        <div className="flex items-center space-x-4">
          <Link to="/friends">
            <Button variant="ghost" size="icon">
              <Users className="h-5 w-5" />
              <span className="sr-only">Friends</span>
            </Button>
          </Link>
          <Button onClick={handleSignOut}>Sign Out</Button>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;