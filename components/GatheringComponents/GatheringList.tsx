import { supabase } from "@/lib/supabase";
import { useAuth } from "@/providers/AuthProvider";
import { useCallback, useState } from "react";
import { FlatList } from "react-native";
import GatheringItem from "./GatheringItem";
import GatheringInterface from "@/app/interfaces/gatheringInterface";
import { useFocusEffect } from "expo-router";

const fetchUserGatherings = async (userId: string | undefined): Promise<GatheringInterface[]> => {
  const { data, error } = await supabase
    .from('Guest')
    .select(`
      gathering_id (*)
    `)
    .eq('user_id', userId);

  if (error) {
    console.error('Error:', error);
    return [];
  }

  return data.map((guest) => guest.gathering_id as GatheringInterface);
};

export default function GatheringList() {
  const [allGatherings, setAllGatherings] = useState<GatheringInterface[]>([]);
  const { session } = useAuth();

  useFocusEffect(useCallback(() => {
    const fetchGatherings = async () => {
      const userGatherings = await fetchUserGatherings(session?.user.id);
      setAllGatherings(userGatherings);
    };
    fetchGatherings();
  }, [session?.user.id]))

  return (
    <FlatList 
      data={allGatherings} 
      renderItem={({ item }) => <GatheringItem item={item} />} 
      keyExtractor={(item) => item.id.toString()}
    />
  );
}