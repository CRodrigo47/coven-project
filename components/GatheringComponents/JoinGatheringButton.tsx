import useGlobalStore from "@/context/useStore";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, View, TouchableOpacity, Modal, Switch, TextInput } from "react-native";
import { COLORS } from "@/constants/COLORS";
import { FONTS } from "@/constants/FONTS";

interface JoinGatheringButtonProps {
  onGuestStatusChange?: () => void;
}

export default function JoinGatheringButton({ onGuestStatusChange }: JoinGatheringButtonProps) {
  const selectedGathering = useGlobalStore(
    (state: any) => state.selectedGathering
  );
  const [alreadyJoined, setAlreadyJoined] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  const [joinModalVisible, setJoinModalVisible] = useState<boolean>(false);
  const [hasRemarks, setHasRemarks] = useState<boolean>(false);
  const [userRemarks, setUserRemarks] = useState<string | null>(null);
  const [arrivingStatus, setArrivingStatus] = useState<string>("On time");
  
  const [leaveModalVisible, setLeaveModalVisible] = useState<boolean>(false);

  const authUserId = useGlobalStore((state: any) => state.authUserId);
  const fetchAuthUserId = useGlobalStore((state: any) => state.fetchAuthUserId);


  useEffect(() => {
    if (!authUserId) {
      fetchAuthUserId();
    }
  }, [authUserId, fetchAuthUserId]);

  useEffect(() => {
    const checkFriend = async () => {
      if (!selectedGathering?.id || !authUserId) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("Guest")
          .select("*")
          .eq("user_id", authUserId)
          .eq("gathering_id", selectedGathering.id)
          .single();

        if (error && error.code !== "PGRST116") {
          console.error("Error checking friendship: ", error);
          setIsLoading(false);
          return;
        }

        setAlreadyJoined(!!data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error checking friendship: ", error);
        setIsLoading(false);
      }
    };

    if (authUserId && selectedGathering?.id) {
      checkFriend();
    }
  }, [selectedGathering, authUserId]);

  const handleJoinGathering = async () => {
    if (!authUserId || !selectedGathering?.id) return;

    const newRow = {
      user_id: authUserId,
      gathering_id: selectedGathering.id,
      expenses: 0,
      remarks: hasRemarks ? userRemarks : null,
      arriving_status: arrivingStatus,
    };

    try {
      const { data, error } = await supabase
        .from("Guest")
        .insert([newRow])
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error("No data returned from insert");

      setAlreadyJoined(true);
      setJoinModalVisible(false);
      
      if (onGuestStatusChange) {
        onGuestStatusChange();
      }
    } catch (error: any) {
      Alert.alert("Error", error?.message || "Failed to join the gathering");
      console.error("Error: ", error);
    }
  };

  const handleLeaveGathering = async () => {
    if (!authUserId || !selectedGathering?.id) return;

    try {
      const { error } = await supabase
        .from("Guest")
        .delete()
        .eq("user_id", authUserId)
        .eq("gathering_id", selectedGathering.id);

      if (error) throw error;

      setAlreadyJoined(false);
      setLeaveModalVisible(false);
      
      if (onGuestStatusChange) {
        onGuestStatusChange();
      }
    } catch (error: any) {
      Alert.alert("Error", error?.message || "Failed to leave the gathering");
      console.error("Error: ", error);
    }
  };

  const openJoinModal = () => {
    setArrivingStatus("On time");
    setHasRemarks(false);
    setUserRemarks(null);
    setJoinModalVisible(true);
  };

  const openLeaveModal = () => {
    setLeaveModalVisible(true);
  };

  if (isLoading) {
    return null;
  }

  return (
    <View>
      {/* Main Button */}
      {alreadyJoined ? (
        <TouchableOpacity onPress={openLeaveModal}>
          <View style={styles.leaveButton}>
            <Text style={styles.leaveButtonText}>Leave Gathering</Text>
          </View>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity onPress={openJoinModal}>
          <View style={styles.joinButton}>
            <Text style={styles.joinButtonText}>Join Gathering</Text>
          </View>
        </TouchableOpacity>
      )}

      {/* Join Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={joinModalVisible}
        onRequestClose={() => setJoinModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setJoinModalVisible(false)}
        >
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <Text style={styles.modalTitle}>Join Gathering</Text>
            
            {/* Remarks Section */}
            <View style={styles.optionContainer}>
              <Text style={styles.optionText}>Add remarks?</Text>
              <Switch
                value={hasRemarks}
                onValueChange={setHasRemarks}
                trackColor={{ false: "#767577", true: COLORS.primary }}
                thumbColor={hasRemarks ? COLORS.primary : "#f4f3f4"}
              />
            </View>
            
            {hasRemarks && (
              <TextInput
                style={styles.textInput}
                multiline
                numberOfLines={3}
                placeholder="Enter your remarks..."
                value={userRemarks || ""}
                onChangeText={setUserRemarks}
              />
            )}
            
            {/* Arriving Status Section */}
            <View style={styles.statusSection}>
              <Text style={styles.optionText}>Arriving Status:</Text>
              
              <View style={styles.statusOptions}>
                {["Soon", "On time", "Late"].map((status) => (
                  <TouchableOpacity 
                    key={status}
                    style={[
                      styles.statusOption,
                      arrivingStatus === status && styles.selectedStatus
                    ]}
                    onPress={() => setArrivingStatus(status)}
                  >
                    <Text style={[
                      styles.statusText,
                      arrivingStatus === status && styles.selectedStatusText
                    ]}>
                      {status}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            {/* Buttons */}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setJoinModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleJoinGathering}
              >
                <Text style={styles.confirmButtonText}>Join Gathering</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Leave Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={leaveModalVisible}
        onRequestClose={() => setLeaveModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setLeaveModalVisible(false)}
        >
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <Text style={styles.modalTitle}>Leave Gathering</Text>
            <Text style={styles.modalText}>
              Are you sure you want to leave this gathering?
            </Text>
            
            {/* Buttons */}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setLeaveModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.leaveConfirmButton}
                onPress={handleLeaveGathering}
              >
                <Text style={styles.leaveConfirmButtonText}>Leave</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  joinButton: {
    width: "100%",
    borderWidth: 1,
    borderRadius: 15,
    backgroundColor: COLORS.secondary,
    padding: 8,
    marginVertical: 5,
    marginTop: 20
  },
  joinButtonText: {
    textAlign: "center",
    color: "black",
    fontFamily: FONTS.medium,
  },
  leaveButton: {
    width: "100%",
    borderWidth: 1,
    borderRadius: 15,
    backgroundColor: COLORS.primary,
    padding: 8,
    marginVertical: 5,
  },
  leaveButtonText: {
    textAlign: "center",
    color: "white",
    fontFamily: FONTS.medium,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 20,
    width: "90%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    marginBottom: 16,
    textAlign: "center",
  },
  modalText: {
    fontFamily: FONTS.regular,
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  optionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  optionText: {
    fontFamily: FONTS.medium,
    fontSize: 16,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
    fontFamily: FONTS.regular,
    fontSize: 14,
  },
  statusSection: {
    marginBottom: 20,
  },
  statusOptions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  statusOption: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: "center",
  },
  selectedStatus: {
    backgroundColor: COLORS.primary,
    borderWidth: 1,
  },
  statusText: {
    fontFamily: FONTS.regular,
    fontSize: 14,
  },
  selectedStatusText: {
    color: "white",
    fontFamily: FONTS.medium,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  cancelButton: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 8,
    alignItems: "center",
  },
  cancelButtonText: {
    fontFamily: FONTS.medium,
  },
  confirmButton: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    backgroundColor: COLORS.secondary,
    borderWidth: 1,
    marginLeft: 8,
    alignItems: "center",
  },
  confirmButtonText: {
    fontFamily: FONTS.medium,
  },
  leaveConfirmButton: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: COLORS.primary,
    marginLeft: 8,
    alignItems: "center",
  },
  leaveConfirmButtonText: {
    fontFamily: FONTS.medium,
    color: "white",
  },
});