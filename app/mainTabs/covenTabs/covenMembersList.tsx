import { useState, useCallback, useEffect } from "react";
import { View, FlatList, StyleSheet, Text, ActivityIndicator } from "react-native";
import { useFocusEffect, usePathname, useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";
import UserInterface from "@/app/interfaces/userInterface";
import useGlobalStore from "@/context/useStore";
import { COLORS } from "@/constants/COLORS";
import { getTypography } from "@/constants/TYPOGRAPHY";
import UserListItem from "@/components/UserListItem";

export default function CovenMembersList() {
  const router = useRouter();
  const pathname = usePathname();
  const [members, setMembers] = useState<UserInterface[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const setSelectedUser = useGlobalStore((state: any) => state.setSelectedUser);
  const selectedCoven = useGlobalStore((state: any) => state.selectedCoven);

  const fetchMembers = useCallback(async () => {
    if (!selectedCoven || !selectedCoven.id) {
      setError("No se ha seleccionado ningún Coven");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      // Consulta para obtener los user_id de los miembros del Coven seleccionado
      const { data: memberRelations, error: membersError } = await supabase
        .from("_Members_")
        .select("user_id")
        .eq("coven_id", selectedCoven.id);

      if (membersError) throw membersError;

      if (memberRelations && memberRelations.length > 0) {
        const memberIds = memberRelations.map(relation => relation.user_id);
        
        // Consulta para obtener los datos completos de los usuarios
        const { data: membersData, error: usersError } = await supabase
          .from("User")
          .select("*")
          .in("id", memberIds);
          
        if (usersError) throw usersError;
        
        setMembers(membersData as UserInterface[]);
      } else {
        setMembers([]);
      }
    } catch (err: any) {
      console.error("Error fetching coven members:", err);
      setError(err.message || "Error al cargar los miembros del Coven");
    } finally {
      setIsLoading(false);
    }
  }, [selectedCoven]);

  useFocusEffect(
    useCallback(() => {
      fetchMembers();
    }, [fetchMembers])
  );

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers, selectedCoven]);

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
      {members.length > 0 ? (
        <FlatList
          data={members}
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
            Este Coven no tiene miembros
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
    textAlign: "center",
  },
  errorText: {
    textAlign: "center",
    color: COLORS.danger,
  },
});