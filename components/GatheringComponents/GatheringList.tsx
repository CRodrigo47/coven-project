import { supabase } from "@/lib/supabase";
import { useAuth } from "@/providers/AuthProvider";
import { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, Text, View } from "react-native";
import GatheringItem from "./GatheringItem";
import GatheringInterface from "@/app/interfaces/gatheringInterface";
import { useFocusEffect } from "expo-router";
import { getTypography } from "@/constants/TYPOGRAPHY";
import { COLORS } from "@/constants/COLORS";

const fetchUserGatherings = async (
  userId: string | undefined
): Promise<GatheringInterface[]> => {
  const { data, error } = await supabase
    .from("Guest")
    .select(
      `
      gathering_id (*)
    `
    )
    .eq("user_id", userId);

  if (error) {
    console.error("Error:", error);
    return [];
  }

  return data.map((guest) => guest.gathering_id as GatheringInterface[]);
};

export default function GatheringList() {
  const [allGatherings, setAllGatherings] = useState<GatheringInterface[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { session } = useAuth();

  useFocusEffect(
    useCallback(() => {
      const fetchGatherings = async () => {
        setIsLoading(true);
        const userGatherings = await fetchUserGatherings(session?.user.id);
        

        const currentDate = new Date();
        const upcomingGatherings = userGatherings.filter(gathering => {
          const gatheringDate = new Date(gathering.date);
          return gatheringDate >= currentDate;
        });
        
        setAllGatherings(upcomingGatherings);
        setIsLoading(false);
      };
      fetchGatherings();
    }, [session?.user.id])
  );

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (allGatherings.length > 0) {
    return (
      <View style={{alignItems: "center"}}>
        <Text 
          style={[
            getTypography("titleLarge", "light"), 
            { marginLeft: 16, marginTop: 16, marginBottom: 8 }
          ]}
        >
          Your upcoming gatherings
        </Text>
        <FlatList
          style={{ marginTop: 10 }}
          data={allGatherings}
          renderItem={({ item }) => <GatheringItem item={item} />}
          keyExtractor={(item) => item.id.toString()}
        />
      </View>
    );
  }

  return (
    <View style={{justifyContent: "center", alignItems: "center"}} className="h-full">
      <Text style={getTypography("titleLarge", "light")}>
        You don't have any upcoming gatherings
      </Text>
    </View>
  );
}