import { useState, useCallback, useEffect } from "react";
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
import useGlobalStore, { useCovenUIStore } from "@/context/useStore";
import { COLORS } from "@/constants/COLORS";
import { getTypography } from "@/constants/TYPOGRAPHY";

export default function CovenItem({ item }: { item: CovenInterface }) {
  const router = useRouter();
  const setSelectedCoven = useGlobalStore((state: any) => state.setSelectedCoven);
  const [membersCount, setMembersCount] = useState<number | null>(null);
  const [nextGathering, setNextGathering] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [localHeight, setLocalHeight] = useState(0);
  const { maxCovenItemHeight, updateMaxHeight } = useCovenUIStore();

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
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

      if (membersResult.error) throw membersResult.error;
      setMembersCount(membersResult.count || 0);

      if (gatheringResult.error) throw gatheringResult.error;
      if (gatheringResult.data?.length > 0) {
        const gathering = gatheringResult.data[0];
        try {
          if (gathering.date) {
            const formattedDate = new Date(gathering.date).toLocaleDateString();
            const timeString = gathering.time?.substring(0, 5) || "";
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
    }, [fetchData])
  );

  const moveToDetail = async () => {
    await setSelectedCoven(item);
    router.navigate("/mainTabs/covenTabs/covenDetail");
  };

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
        style={[styles.covenInfo, { height: maxCovenItemHeight }]}
        onLayout={handleLayout}
      >
        <View style={styles.leftSection}>
          <Text 
            style={[getTypography("bodyLarge", "light"), styles.covenName]}
            numberOfLines={2}
          >
            {item.name}
          </Text>
        </View>
        
        <View style={styles.rightSection}>
          {isLoading ? (
            <ActivityIndicator size="small" color={COLORS.primary} />
          ) : (
            <>
              <Text style={[getTypography("bodyMedium", "light"), styles.membersText]}>
                {membersCount} members
              </Text>
              <Text style={[getTypography("bodyMedium", "light"), styles.gatheringText]}>
                {nextGathering || "No upcoming gatherings"}
              </Text>
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
    minHeight: 80,
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
  covenName: {
    flexShrink: 1,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  membersText: {
    textAlign: 'right',
    marginBottom: 4,
  },
  gatheringText: {
    textAlign: 'right',
  },
});