import GatheringList from "@/components/GatheringComponents/GatheringList";
import { COLORS } from "@/constants/COLORS";
import {  View } from "react-native";

export default function Gatherings() {
  return (
    <View className="h-full" style={{ backgroundColor: COLORS.background }}>
      <GatheringList></GatheringList>
    </View>
  );
}
