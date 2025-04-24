import CovenInterface from "@/app/interfaces/covenInterface";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/providers/AuthProvider";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, Text, View } from "react-native";
import CovenItem from "./CovenItem";
import CreateCovenButton from "./CreateCovenButton";
import { getTypography } from "@/constants/TYPOGRAPHY";
import { COLORS } from "@/constants/COLORS";

const fetchUserCoven = async (
  userId: string | undefined
): Promise<CovenInterface[]> => {
  const { data, error } = await supabase
    .from("_Members_")
    .select(
      `
        coven_id (*)
        `
    )
    .eq("user_id", userId);

  if (error) {
    console.error("Error: ", error);
    return [];
  }

  return data.map((coven) => coven.coven_id as CovenInterface);
};

export default function CovenList() {
  const [allCoven, setAllCoven] = useState<CovenInterface[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { session } = useAuth();

  useFocusEffect(
    useCallback(() => {
      const fetchCovens = async () => {
        setIsLoading(true);
        const userCoven = await fetchUserCoven(session?.user.id);
        setAllCoven(userCoven);
        setIsLoading(false);
      };
      fetchCovens();
    }, [session?.user.id])
  );

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (allCoven[0]) {
    return (
      <>
        <FlatList
        style={{marginTop: 10}}
          data={allCoven}
          renderItem={({ item }) => <CovenItem item={item} />}
          keyExtractor={(item) => item.id.toString()}
        />
        <CreateCovenButton />
      </>
    );
  }

  return (
    <>
      <View
        style={{ justifyContent: "center", alignItems: "center" }}
        className="h-full"
      >
        <Text style={getTypography("titleLarge", "light")}>
          You are not in any Coven
        </Text>
      </View>
      <CreateCovenButton />
    </>
  );
}