import { COLORS } from "@/constants/COLORS";
import useGlobalStore from "@/context/useStore";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Alert, TouchableOpacity } from "react-native";

export default function BlockUserButton() {
  const selectedUser = useGlobalStore((state: any) => state.selectedUser);
  const [isBlocked, setIsBlocked] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const authUserId = useGlobalStore((state: any) => state.authUserId);
  const fetchAuthUserId = useGlobalStore((state: any) => state.fetchAuthUserId);


  useEffect(() => {
    if (!authUserId) {
      fetchAuthUserId();
    }
  }, [authUserId, fetchAuthUserId]);



  useEffect(() => {
    const checkBlocked = async () => {
      if (!selectedUser?.id || !authUserId) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("_Block-list_")
          .select("*")
          .eq("user_id", authUserId)
          .eq("block_id", selectedUser.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error("Error checking block status: ", error);
          setIsLoading(false);
          return;
        }
        
        setIsBlocked(!!data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error checking block status: ", error);
        setIsLoading(false);
      }
    };

    if (authUserId && selectedUser?.id) {
      checkBlocked();
    }
  }, [selectedUser, authUserId]);

  const handleBlockUser = async () => {
    if (!authUserId || !selectedUser?.id) return;
    
    const newRow = {
      user_id: authUserId,
      block_id: selectedUser.id,
    };

    try {
      const { data, error } = await supabase
        .from("_Block-list_")
        .insert([newRow])
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error("No data returned from insert");

      setIsBlocked(true);

      Alert.alert(`${selectedUser.user_name} has been blocked!`);
    } catch (error: any) {
      Alert.alert("Error", error?.message || "Failed to block user");
      console.error("Error: ", error);
    }
  };

  const handleUnblockUser = async () => {
    if (!authUserId || !selectedUser?.id) return;
    
    try {
      const { error } = await supabase
        .from("_Block-list_")
        .delete()
        .eq("user_id", authUserId)
        .eq("block_id", selectedUser.id);

      if (error) throw error;

      setIsBlocked(false);
      Alert.alert("User unblocked successfully");
    } catch (error: any) {
      Alert.alert("Error", error?.message || "Failed to unblock user");
      console.error("Error: ", error);
    }
  };

  if (isLoading) {
    return null;
  }

  if (isBlocked) {
    return (
      <TouchableOpacity onPress={handleUnblockUser}>
        <View style={styles.unblockButton}>
          <Text style={{textAlign: "center", color: "white"}}>Unblock User</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity onPress={handleBlockUser}>
      <View style={styles.blockButton}>
        <Text style={{textAlign: "center", color: "white"}}>Block User</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  blockButton: {
    width: 120,
    borderWidth: 1,
    borderRadius: 15,
    backgroundColor: COLORS.danger,
    padding: 8,
    marginVertical: 5,
  },
  unblockButton: {
    width: 120,
    borderWidth: 1,
    borderRadius: 15,
    backgroundColor: COLORS.primary,
    padding: 8,
    marginVertical: 5,
  }
});