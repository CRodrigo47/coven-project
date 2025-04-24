import { COLORS } from "@/constants/COLORS";
import useGlobalStore from "@/context/useStore";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Alert, TouchableOpacity } from "react-native";

export default function AddFriendButton() {
  const [userId, setUserId] = useState<string | null>(null);
  const selectedUser = useGlobalStore((state: any) => state.selectedUser);
  const [alreadyFriend, setAlreadyFriend] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) setUserId(user.id);
      } catch (err) {
        console.error("Error getting user ID: ", err);
      }
    };
    fetchUserId();
  }, []);

  useEffect(() => {
    const checkFriend = async () => {
      if (!selectedUser?.id || !userId) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("_Friend-list_")
          .select("*")
          .eq("user_id", userId)
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

    if (userId && selectedUser?.id) {
      checkFriend();
    }
  }, [selectedUser, userId]);

  const handleAddFriend = async () => {
    if (!userId || !selectedUser?.id) return;
    
    const newRow = {
      user_id: userId,
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
    if (!userId || !selectedUser?.id) return;
    
    try {
      const { error } = await supabase
        .from("_Friend-list_")
        .delete()
        .eq("user_id", userId)
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