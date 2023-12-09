import { useEffect } from "react";
import { supabase } from "../supabase/supabase";
import { useFlashStore } from "../helpers/zustand";

export default function useAuthListener() {
  const setSessionUser = useFlashStore((state) => state.setSessionUser);
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Supabase auth event", event, session);
        setSessionUser(session?.user ?? null);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);
}
