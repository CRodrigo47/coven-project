import GatheringInterface from "@/app/interfaces/gatheringInterface";
import { COLORS } from "@/constants/COLORS";
import { getTypography } from "@/constants/TYPOGRAPHY";
import useGlobalStore, { useCovenUIStore } from "@/context/useStore";
import { useRouter, usePathname } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useState, useEffect } from "react";

export default function GatheringItem({ item }: { item: GatheringInterface }) {
  const router = useRouter();
  const pathname = usePathname();
  const setSelectedGathering = useGlobalStore(
    (state: any) => state.setSelectedGathering
  );
  const [localHeight, setLocalHeight] = useState(0);
  const { maxCovenItemHeight, updateMaxHeight } = useCovenUIStore();

  const moveToDetail = () => {
    setSelectedGathering(item);

    if (pathname.includes("gatheringTabs")) {
      router.navigate("/mainTabs/gatheringTabs/gatheringDetail");
    } else if (pathname.includes("covenTabs")) {
      router.navigate("/mainTabs/covenTabs/gatheringDetail");
    }
  };

  const timeString = item.time && typeof item.time === "string";

  const handleLayout = (event: any) => {
    const { height } = event.nativeEvent.layout;
    setLocalHeight(height);
    updateMaxHeight(height);
  };

  useEffect(() => {
    if (localHeight > 0) {
      updateMaxHeight(localHeight);
    }
  }, [localHeight]);

  return (
    <TouchableOpacity onPress={moveToDetail}>
      <View 
        style={[styles.gatheringInfo, { height: maxCovenItemHeight }]}
        onLayout={handleLayout}
      >
        <View style={styles.leftSection}>
          <Text 
            style={[getTypography("bodyLarge", "light"), styles.gatheringName]}
            numberOfLines={2}
          >
            {item.name}
          </Text>
        </View>
        <View style={styles.rightSection}>
          <Text style={[getTypography("bodyMedium", "light"), styles.timeText]}>
            {timeString ? item.time.substring(0, 5) : "No time"}
          </Text>
          <Text style={[getTypography("bodyMedium", "light"), styles.dateText]}>
            {item.date}
          </Text>
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
    minHeight: 60,
    marginVertical: 4,
    width: "90%",
    alignSelf: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  leftSection: {
    flex: 1,
    justifyContent: 'center',
    paddingRight: 10,
  },
  rightSection: {
    width: "40%",
    alignItems: "flex-end",
  },
  gatheringName: {
    flexShrink: 1,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  timeText: {
    textAlign: 'right',
    marginBottom: 4,
  },
  dateText: {
    textAlign: 'right',
  },
});