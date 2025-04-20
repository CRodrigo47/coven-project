import { GuestWithUserIcon } from "@/app/interfaces/guestInterface";
import GuestItem from "@/components/GatheringComponents/GuestItem";
import useGlobalStore from "@/context/useStore";
import { supabase } from "@/lib/supabase";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { FlatList, Text, View } from "react-native";

const fetchGuestsWithUserIcons = async (gatheringId: string) => {
  const { data, error } = await supabase
    .from("Guest")
    .select(
      `
      *,
      user:user_id (
        user_icon,
        user_name
      )
    `
    )
    .eq("gathering_id", gatheringId);

  if (error) {
    console.error("Error fetching guests:", error.message);
    return [];
  }

  return data || [];
};

export default function GatheringDetail() {
  const selectedGathering = useGlobalStore(
    (state: any) => state.selectedGathering
  );
  const [guestList, setGuestList] = useState<GuestWithUserIcon[]>([]);

  useFocusEffect(
    useCallback(() => {
      if (!selectedGathering?.id) return;

      const fetchGuests = async () => {
        const fetchGuestList = await fetchGuestsWithUserIcons(
          selectedGathering.id
        );
        setGuestList(fetchGuestList);
      };

      fetchGuests();
    }, [selectedGathering?.id])
  );

  return (
    <View className="h-full" style={{ backgroundColor: "#fcf5d7" }}>
      <View className="border-b h-36">
        <Text>Página de detalle de un Gathering</Text>
        <Text>
          Gathering global: {selectedGathering?.name || "No seleccionado"}
        </Text>
      </View>
      <View className="h-full">
        <View className="h-10 border-b">
          <Text className="text-center">Guest List</Text>
        </View>
        <View>
          <FlatList
            data={guestList}
            renderItem={({ item }) => <GuestItem item={item} />}
            keyExtractor={(item) => item.user_id}
            ListEmptyComponent={<Text>No hay invitados aún</Text>}
          />
        </View>
      </View>
    </View>
  );
}
