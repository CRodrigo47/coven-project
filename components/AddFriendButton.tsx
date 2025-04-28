import { COLORS } from "@/constants/COLORS";
import useGlobalStore from "@/context/useStore";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Alert, TouchableOpacity } from "react-native";

export default function AddFriendButton() {
  const selectedUser = useGlobalStore((state: any) => state.selectedUser);
  const [alreadyFriend, setAlreadyFriend] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const authUserId = useGlobalStore((state: any) => state.authUserId);
  const fetchAuthUserId = useGlobalStore((state: any) => state.fetchAuthUserId);


  useEffect(() => {
    if (!authUserId) {
      fetchAuthUserId();
    }
  }, [authUserId, fetchAuthUserId]);


  useEffect(() => {
    const checkFriend = async () => {
      if (!selectedUser?.id || !authUserId) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("_Friend-list_")
          .select("*")
          .eq("user_id", authUserId)
          .eq("friend_id", selectedUser.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error("Error checking friendship: ", error);
          setIsLoading(false);
          return;
        }
        
        setAlreadyFriend(!!data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error checking friendship: ", error);
        setIsLoading(false);
      }
    };

    if (authUserId && selectedUser?.id) {
      checkFriend();
    }
  }, [selectedUser, authUserId]);

  const handleAddFriend = async () => {
    if (!authUserId || !selectedUser?.id) return;
    
    const newRow = {
      user_id: authUserId,
      friend_id: selectedUser.id,
    };

    try {
      const { data, error } = await supabase
        .from("_Friend-list_")
        .insert([newRow])
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error("No data returned from insert");

      setAlreadyFriend(true);

    } catch (error: any) {
      Alert.alert("Error", error?.message || "Failed to add friend");
      console.error("Error: ", error);
    }
  };

  const handleUnfriend = async () => {
    if (!authUserId || !selectedUser?.id) return;
    
    try {
      const { error } = await supabase
        .from("_Friend-list_")
        .delete()
        .eq("user_id", authUserId)
        .eq("friend_id", selectedUser.id);

      if (error) throw error;

      setAlreadyFriend(false);
    } catch (error: any) {
      Alert.alert("Error", error?.message || "Failed to unfriend");
      console.error("Error: ", error);
    }
  };

  if (isLoading) {
    return null;
  }

  if (alreadyFriend) {
    return (
      <TouchableOpacity onPress={handleUnfriend}>
        <View style={styles.unfriendButton}>
          <Text style={{textAlign: "center", color: "white"}}>Unfriend User</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity onPress={handleAddFriend}>
      <View style={styles.addFriendButton}>
        <Text style={{textAlign: "center", color: "black"}}>Add Friend</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  addFriendButton: {
    width: 120,
    borderWidth: 1,
    borderRadius: 15,
    backgroundColor: COLORS.secondary,
    padding: 8,
    marginVertical: 5,
  },
  unfriendButton: {
    width: 120,
    borderWidth: 1,
    borderRadius: 15,
    backgroundColor: COLORS.primary,
    padding: 8,
    marginVertical: 5,
  }
});