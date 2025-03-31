import { supabase } from "@/lib/supabase";
import { useRoute } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { View, Text } from "react-native";

const ProfileViewer = () => {
  const route = useRoute(); // Accede al parámetro de la ruta dinámica
  const { username }: any = route.params;

  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (username) {
      const fetchData = async () => {
        try {
          const { data, error } = await supabase
            .from("User")
            .select("*")
            .eq("user_name", username)
            .single();

          if (error) throw error;

          console.log(data);

          setUserProfile(data);
        } catch (err: unknown) {
          if (err instanceof Error) {
            setError(err.message);
          } else {
            setError("Error desconocido");
          }
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }
  }, [username]);

  return (
    <View className="h-full" style={{ backgroundColor: "#fcf5d7" }}>
      <Text>Perfil de {userProfile?.name}</Text>
    </View>
  );
};

export default ProfileViewer;
