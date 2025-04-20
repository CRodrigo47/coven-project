import { supabase } from "@/lib/supabase";
import { useRouter } from "expo-router";
import { useEffect } from "react";

export default function LogOut() {
  const router = useRouter();

  useEffect(() => {
    const handleLogOut = async () => {
      try {
        const { error } = await supabase.auth.signOut();

        if (error) {
          console.error("Error al cerrar sesión:", error.message);
          // Podrías redirigir a una página de error o mostrar un mensaje
          return;
        }

        router.replace("/auth/LogIn");
      } catch (error) {
        console.error("Error inesperado al cerrar sesión:", error);
      }
    };

    handleLogOut();

    return () => {
      // Limpieza si es necesaria
    };
  }, [router]); // Añadimos router como dependencia

  return null;
}
