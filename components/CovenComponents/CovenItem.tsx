import { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";
import CovenInterface from "@/app/interfaces/covenInterface";
import useGlobalStore from "@/context/useStore";
import { COLORS } from "@/constants/COLORS";
import { getTypography } from "@/constants/TYPOGRAPHY";

export default function CovenItem({ item }: { item: CovenInterface }) {
  const router = useRouter();
  const setSelectedCoven = useGlobalStore(
    (state: any) => state.setSelectedCoven
  );
  const [membersCount, setMembersCount] = useState<number | null>(null);
  const [nextGathering, setNextGathering] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Ejecutar ambas consultas en paralelo
      const [membersResult, gatheringResult] = await Promise.all([
        supabase
          .from("_Members_")
          .select("*", { count: "exact", head: true })
          .eq("coven_id", item.id),

        supabase
          .from("Gathering")
          .select("date, time, name")
          .eq("coven_id", item.id)
          .gte("date", new Date().toISOString().split("T")[0])
          .order("date", { ascending: true })
          .order("time", { ascending: true })
          .limit(1),
      ]);

      // Procesar miembros
      if (membersResult.error) throw membersResult.error;
      setMembersCount(membersResult.count || 0);

      // Procesar gathering
      if (gatheringResult.error) throw gatheringResult.error;
      if (gatheringResult.data && gatheringResult.data.length > 0) {
          const gathering = gatheringResult.data[0];
          try {
              // Verificamos que tanto date como time existan y sean válidos
              if (gathering.date) {
                  const formattedDate = new Date(gathering.date).toLocaleDateString();
                  // Si time existe y es string, extraemos los primeros 5 caracteres, si no, dejamos vacío
                  const timeString = (gathering.time && typeof gathering.time === 'string') 
                      ? gathering.time.substring(0, 5) 
                      : "";
                  
                  setNextGathering(timeString ? `${formattedDate} ${timeString}` : formattedDate);
              } else {
                  setNextGathering("Date unavailable");
              }
          } catch (error) {
              console.error('Error formatting gathering data:', error);
              setNextGathering("Date format error");
          }
      } else {
        setNextGathering(null);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setMembersCount(0);
      setNextGathering(null);
    } finally {
      setIsLoading(false);
    }
  }, [item.id]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
      return () => {};
    }, [fetchData])
  );

  const moveToDetail = async () => {
    await setSelectedCoven(item); // Esperar a que se actualice el estado
    router.navigate("/mainTabs/covenTabs/covenDetail"); // Usar navigate en lugar de push
  };

  return (
    <TouchableOpacity onPress={moveToDetail}>
      <View style={styles.covenInfo}>
        <View className="ps-4">
          <Text style={getTypography("bodyLarge", "light")}>{item.name}</Text>
        </View>
        <View className="pe-4 py-2" style={styles.rightSection}>
          {isLoading ? (
            <ActivityIndicator size="small" color={COLORS.primary} />
          ) : (
            <>
              <Text className="text-center">{membersCount} members</Text>
              {nextGathering ? (
                <Text>{nextGathering}</Text>
              ) : (
                <Text>No upcoming gatherings</Text>
              )}
            </>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  covenInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 10,
    borderColor: COLORS.primaryDark,
    backgroundColor: COLORS.secondary,
    height: 60,
    marginBlock: 2,
    width: "90%",
    alignSelf: "center",
  },
  rightSection: {
    alignItems: "flex-end",
  },
});
