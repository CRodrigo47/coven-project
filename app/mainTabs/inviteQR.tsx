import { COLORS } from "@/constants/COLORS";
import { FONTS } from "@/constants/FONTS";
import { supabase } from "@/lib/supabase";
import { useCallback, useEffect, useState } from "react";
import { View, StyleSheet, Text, Pressable, Modal, TouchableOpacity, Alert } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { AntDesign } from "@expo/vector-icons";
import useGlobalStore from "@/context/useStore";
import { useFocusEffect } from "expo-router";

export default function InviteQR() {
  const [friendList, setFriendList] = useState<{user_name: string, friend_id: string}[]>([]);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const selectedCoven = useGlobalStore((state: any) => state.selectedCoven)
  const authUserId = useGlobalStore((state: any) => state.authUserId);
  const fetchAuthUserId = useGlobalStore((state: any) => state.fetchAuthUserId);


  useEffect(() => {
    if (!authUserId) {
      fetchAuthUserId();
    }
  }, [authUserId, fetchAuthUserId]);



  useFocusEffect(useCallback(() => {
    const fetchFriends = async () => {
      if (!authUserId) return;
  
      try {
        const { data, error } = await supabase
          .from("_Friend-list_")
          .select(`
            friend_id,
            User:friend_id (user_name)
          `)
          .eq("user_id", authUserId);
  
        if (error) throw error;
  
        const formattedFriends = data?.map(item => ({
          user_name: item.User?.user_name,
          friend_id: item.friend_id
        })).filter(item => item.user_name) || [];
  
        console.log("Friends fetched:", formattedFriends);
        setFriendList(formattedFriends);
      } catch (error) {
        console.error("Error fetching friends with join:", error);
      }
    };
  
    fetchFriends();
  }, [authUserId]));

  const handleAddFriendToCoven = async (friendId: string) => {
    const newRow = {
      user_id: friendId,
      coven_id: selectedCoven.id
    }

    try{
      const { data, error} = await supabase
      .from("_Members_")
      .insert([newRow])
      .select()
      .single();

      if (error) throw error;
      if (!data) throw new Error("No data returned from insert")

      Alert.alert(`Friend added to ${selectedCoven.name}!`)
    }catch(error: any){
      Alert.alert("Error", error?.message || "Failed to add friend");
      console.error("Error: ", error)
    }

    setDropdownVisible(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.QRText}>Invite your friends by QR</Text>
      <View style={styles.QRContainer}>
        <QRCode value="https://github.com/CRodrigo47" size={200} />
      </View>
      <Text style={styles.QRText}>Or send them a link instead</Text>
      <Pressable>
        <Text style={styles.QRButton}>
          Copy link
        </Text>
      </Pressable>
      
      <Text style={styles.QRText}>You can also add them from your Friends List!</Text>
      

      <Pressable 
        style={styles.dropdownButton}
        onPress={() => setDropdownVisible(!dropdownVisible)}
      >
        <Text style={styles.dropdownButtonText}>Select a friend</Text>
        <AntDesign 
          name={dropdownVisible ? "up" : "down"} 
          size={16} 
          color={COLORS.black} 
        />
      </Pressable>
      <Modal
        visible={dropdownVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setDropdownVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setDropdownVisible(false)}
        >
          <View style={styles.dropdownContainer}>
            {friendList.length > 0 ? (
              friendList.map((friend, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.dropdownItem}
                  onPress={() => handleAddFriendToCoven(friend.friend_id)}
                >
                  <Text style={styles.dropdownItemText}>{friend.user_name}</Text>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.emptyText}>No friends available</Text>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 20,
  },
  QRContainer: {
    borderWidth: 5,
    padding: 2,
  },
  QRText: {
    fontFamily: FONTS.medium,
    fontSize: 16,
    paddingVertical: 4,
    marginVertical: 8,
    textAlign: 'center',
  },
  QRButton: {
    width: 100,
    backgroundColor: COLORS.primary,
    textAlign: "center",
    borderWidth: 1,
    paddingVertical: 6,
    borderRadius: 4,
    color: 'white',
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.black,
    marginTop: 10,
  },
  dropdownButtonText: {
    fontFamily: FONTS.medium,
    marginRight: 8,
    color: COLORS.black,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  dropdownContainer: {
    backgroundColor: COLORS.background,
    marginHorizontal: 20,
    marginBottom: 300,
    borderRadius: 8,
    maxHeight: 200,
    paddingVertical: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  dropdownItem: {
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  dropdownItemText: {
    fontFamily: FONTS.medium,
    fontSize: 16,
    textAlign: "center"
  },
  emptyText: {
    fontFamily: FONTS.medium,
    padding: 15,
    textAlign: 'center',
    color: '#666',
  },
});