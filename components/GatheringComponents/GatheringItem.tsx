import GatheringInterface from "@/app/interfaces/gatheringInterface";
import { COLORS } from "@/constants/COLORS";
import { getTypography } from "@/constants/TYPOGRAPHY";
import useGlobalStore from "@/context/useStore";
import { useRouter, usePathname } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function GatheringItem({ item }: { item: GatheringInterface }) {
  const router = useRouter();
  const pathname = usePathname();
  const setSelectedGathering = useGlobalStore(
    (state: any) => state.setSelectedGathering
  );

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
          <Text style={getTypography("bodyLarge", "light")}>{item.name}</Text>
        </View>
        <View className="w-1/2 pe-4 py-2" style={styles.rightSection}>
          <Text className="text-center" style={getTypography("bodyMedium", "light")}>{item.time.substring(0, 5)}</Text>
          <Text style={getTypography("bodyMedium", "light")}>{item.date}</Text>
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
