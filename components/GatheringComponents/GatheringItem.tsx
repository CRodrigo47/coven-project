import GatheringInterface from "@/app/interfaces/gatheringInterface";
import useGlobalStore from "@/context/useStore";
import { useRouter, usePathname } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function GatheringItem({ item }: { item: GatheringInterface }) {
  const router = useRouter();
  const pathname = usePathname();
  const setSelectedGathering = useGlobalStore((state: any) => state.setSelectedGathering);

  const moveToDetail = () => {
    setSelectedGathering(item);
    
    if (pathname.includes("gatheringTabs")) {
      router.navigate("/mainTabs/gatheringTabs/gatheringDetail");
    } else if (pathname.includes("covenTabs")) {
      router.navigate("/mainTabs/covenTabs/gatheringDetail");
    }
  };

  return (
    <TouchableOpacity onPress={moveToDetail}>
      <View style={styles.gatheringInfo}>
        <View className="w-1/2 ps-4">
          <Text>{item.name}</Text>
        </View>
        <View className="w-1/2 pe-4 py-2" style={styles.rightSection}>
          <Text className="text-center">{item.time.substring(0,5)}</Text>
          <Text>{item.date}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  gatheringInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1
  },
  rightSection: {
    alignItems: "flex-end",
  }
});