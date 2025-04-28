import useGlobalStore from "@/context/useStore";
import { supabase } from "@/lib/supabase";
import { useRouter } from "expo-router";
import { useEffect } from "react";

export default function LogOut() {
  const router = useRouter();
  const resetAuthId = useGlobalStore((state: any) => state.resetAuthId)

  useEffect(() => {
    const handleLogOut = async () => {
      try {
        const { error } = await supabase.auth.signOut();

        if (error) {
          console.error("Error al cerrar sesión:", error.message);
          return;
        }

        router.replace("/auth/LogIn");
      } catch (error) {
        console.error("Error inesperado al cerrar sesión:", error);
      }
    };
    resetAuthId();

    handleLogOut();

    return () => {
    };
  }, [router]);

  return null;
}
