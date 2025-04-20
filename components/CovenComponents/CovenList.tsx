import CovenInterface from "@/app/interfaces/covenInterface";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/providers/AuthProvider";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { FlatList } from "react-native";
import CovenItem from "./CovenItem";
import CreateCovenButton from "./CreateCovenButton";

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
  const { session } = useAuth();

  useFocusEffect(
    useCallback(() => {
      const fetchCovens = async () => {
        const userCoven = await fetchUserCoven(session?.user.id);
        setAllCoven(userCoven);
      };
      fetchCovens();
    }, [session?.user.id])
  );

  return (
    <>
      <FlatList
        data={allCoven}
        renderItem={({ item }) => <CovenItem item={item} />}
        keyExtractor={(item) => item.id.toString()}
      />
      <CreateCovenButton/>
    </>
  );
}
