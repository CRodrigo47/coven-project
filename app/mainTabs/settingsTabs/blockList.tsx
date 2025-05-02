import { useState, useCallback, useEffect } from "react";
import { View, FlatList, StyleSheet, Text, ActivityIndicator } from "react-native";
import { useFocusEffect, usePathname, useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";
import UserInterface from "@/app/interfaces/userInterface";
import useGlobalStore from "@/context/useStore";
import { COLORS } from "@/constants/COLORS";
import { getTypography } from "@/constants/TYPOGRAPHY";
import UserListItem from "@/components/UserListItem";

export default function BlockList() {
  const router = useRouter();
  const pathname = usePathname();
  const [blockedUsers, setBlockedUsers] = useState<UserInterface[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const setSelectedUser = useGlobalStore((state: any) => state.setSelectedUser);
  const authUserId = useGlobalStore((state: any) => state.authUserId);
  const fetchAuthUserId = useGlobalStore((state: any) => state.fetchAuthUserId);

  useEffect(() => {
    if (!authUserId) {
      fetchAuthUserId();
    }
  }, [authUserId, fetchAuthUserId]);

  const fetchBlockedUsers = useCallback(async () => {
    let currentUserId = authUserId;
    if (!currentUserId) {
      currentUserId = await fetchAuthUserId();
      if (!currentUserId) {
        setError("No se pudo obtener el usuario autenticado");
        setIsLoading(false);
        return;
      }
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const { data: blockRelations, error: blocksError } = await supabase
        .from("_Block-list_")
        .select("block_id")
        .eq("user_id", currentUserId);

      if (blocksError) throw blocksError;

      if (blockRelations && blockRelations.length > 0) {
        const blockedIds = blockRelations.map(relation => relation.block_id);
        
        const { data: blockedData, error: usersError } = await supabase
          .from("User")
          .select("*")
          .in("id", blockedIds);
          
        if (usersError) throw usersError;
        
        setBlockedUsers(blockedData as UserInterface[]);
      } else {
        setBlockedUsers([]);
      }
    } catch (err: any) {
      console.error("Error fetching blocked users:", err);
      setError(err.message || "Failed to load blocked users");
    } finally {
      setIsLoading(false);
    }
  }, [authUserId, fetchAuthUserId]);

  useFocusEffect(
    useCallback(() => {
      fetchBlockedUsers();
    }, [fetchBlockedUsers])
  );

  const handleUserSelect = (user: UserInterface) => {
    setSelectedUser(user);
    if (pathname.includes("mainTabs")) {
      router.push(`/${user.user_name}`);
    } else {
      router.replace(`/${user.user_name}`);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={[getTypography("bodyLarge", "light"), styles.errorText]}>
          {error}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {blockedUsers.length > 0 ? (
        <FlatList
          data={blockedUsers}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <UserListItem user={item} onPress={handleUserSelect} />
          )}
          style={styles.list}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={[getTypography("bodyLarge", "light"), styles.emptyText]}>
            You have no users blocked
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fcf5d7",
    paddingVertical: 10,
  },
  list: {
    width: "100%",
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    textAlign: "center"
  },
  errorText: {
    textAlign: "center",
    color: COLORS.danger,
  },
});