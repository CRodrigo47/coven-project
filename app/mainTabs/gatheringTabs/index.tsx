import GatheringList from "@/components/GatheringComponents/GatheringList";
import { useFocusEffect, useRouter } from "expo-router";
import { Button, View } from "react-native";

export default function Gatherings() {
  const router = useRouter();
  return (
    <View className="h-full" style={{ backgroundColor: "#fcf5d7" }}>
      <GatheringList></GatheringList>
    </View>
  );
}
