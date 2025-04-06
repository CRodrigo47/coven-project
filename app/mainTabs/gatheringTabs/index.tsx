import { supabase } from "@/lib/supabase";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Button, Text, View } from "react-native";

export default function Gatherings() {
  const router = useRouter();

  const [gatheringData, setGatheringData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data, error } = await supabase.from("Gathering").select("*");

        if (error) throw error;

        console.log(data);

        setGatheringData(data);
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
  }, []);

  if (loading) {
    return (
      <Text className="h-full" style={{ backgroundColor: "#fcf5d7" }}>
        Cargando...
      </Text>
    );
  }

  if (error) {
    return (
      <Text className="h-full" style={{ backgroundColor: "#fcf5d7" }}>
        Error: {error}
      </Text>
    );
  }

  return (
    <View className="h-full" style={{ backgroundColor: "#fcf5d7" }}>
      <Text>Ventana de Gatherings</Text>
      {/* Asegúrate de que gatheringData sea un array o una lista antes de renderizar */}
      <Text>{JSON.stringify(gatheringData[0].name)}</Text>

      <Button
        title="Detalle de gathering"
        onPress={() => router.push("/mainTabs/gatheringTabs/gatheringDetail")}
      />
      <Button
        title="Ir al perfil de Christian"
        onPress={() => router.push("/christian.admin")}
      />
    </View>
  );
}
