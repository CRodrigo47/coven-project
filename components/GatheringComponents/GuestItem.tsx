import { GuestWithUserIcon } from "@/app/interfaces/guestInterface";
import useGlobalStore from "@/context/useStore";
import { supabase } from "@/lib/supabase";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Text, TouchableOpacity, View, StyleSheet, Modal, TextInput, Alert, ScrollView } from "react-native";
import { COLORS } from "@/constants/COLORS";
import { FONTS } from "@/constants/FONTS";
import { Ionicons } from "@expo/vector-icons";

export default function GuestItem({ item, onGuestUpdate }: { 
    item: GuestWithUserIcon,
    onGuestUpdate?: () => void
}) {
    const router = useRouter();
    const setSelectedUser = useGlobalStore((state: any) => state.setSelectedUser);
    const selectedGathering = useGlobalStore((state: any) => state.selectedGathering);
    

    const [infoModalVisible, setInfoModalVisible] = useState(false);
    const [expenseModalVisible, setExpenseModalVisible] = useState(false);
    const [statusModalVisible, setStatusModalVisible] = useState(false);
    

    const [isCurrentUser, setIsCurrentUser] = useState(false);
    const authUserId = useGlobalStore((state: any) => state.authUserId);
    const fetchAuthUserId = useGlobalStore((state: any) => state.fetchAuthUserId);
  
  
    useEffect(() => {
      if (!authUserId) {
        fetchAuthUserId();
      }
    }, [authUserId, fetchAuthUserId]);
    

    const [newExpenseAmount, setNewExpenseAmount] = useState("");
    const [guestList, setGuestList] = useState<GuestWithUserIcon[]>([]);
    const [selectedGuests, setSelectedGuests] = useState<{[key: string]: boolean}>({});
    
    const [localExpense, setLocalExpense] = useState<number | null | undefined>(item.expenses);
    
    const [userRemarks, setUserRemarks] = useState<string | null | undefined>(item.remarks);
    
    const [localArrivingStatus, setLocalArrivingStatus] = useState<string>(item.arriving_status);
    

    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    setIsCurrentUser(user.id === item.user_id);
                }
            } catch (error) {
                console.error("Error fetching current user:", error);
            }
        };
        fetchCurrentUser();
    }, [item.user_id]);

    useEffect(() => {
        setLocalExpense(item.expenses);
    }, [item.expenses]);
    
    useEffect(() => {
        const fetchAllGuests = async () => {
            if (!selectedGathering?.id) return;
            
            try {
                const { data, error } = await supabase
                    .from("Guest")
                    .select(`
                        *,
                        user:user_id (
                            user_icon,
                            user_name
                        )
                    `)
                    .eq("gathering_id", selectedGathering.id);
                    
                if (error) throw error;
                
                setGuestList(data || []);
                
                const initialSelection = {};
                data?.forEach(guest => {
                    initialSelection[guest.user_id] = true;
                });
                setSelectedGuests(initialSelection);
                
            } catch (error) {
                console.error("Error fetching guests:", error);
            }
        };
        
        if (isCurrentUser && expenseModalVisible) {
            fetchAllGuests();
        }
    }, [selectedGathering?.id, isCurrentUser, expenseModalVisible]);

    const moveToUserDetail = async () => {
        const { data, error } = await supabase
            .from('User')
            .select('*')
            .eq('id', item.user_id)
            .single();

        if (error) {
            console.error("Error fetching User: " + error.message);
            return;
        }
        
        setSelectedUser(data);
        router.navigate("/" + data.user_name);
    };

    // Get icon based on arriving status
    const getArrivingStatusIcon = () => {
        switch (localArrivingStatus) {
            case "Soon":
                return <Ionicons 
                    name="time-outline" 
                    size={22} 
                    color={isCurrentUser ? COLORS.secondary : COLORS.primary} 
                />;
            case "Late":
                return <Ionicons name="hourglass-outline" size={22} color={COLORS.danger} />;
            case "On time":
                return <Ionicons name="checkmark-circle-outline" size={22} color={COLORS.success} />;
            default:
                return <Ionicons name="checkmark-circle-outline" size={22} color={COLORS.success} />;
        }
    };
    
    // Format the expenses with the appropriate sign
    const formatExpenses = (value: number | null | undefined) => {
        if (value === null || value === undefined) return '0€';
        
        // Format with the appropriate sign
        return `${value > 0 ? '+' : ''}${value}€`;
    };
    
    const saveRemarks = async () => {
        if (!isCurrentUser || !authUserId) return;
        
        try {
            const { error } = await supabase
                .from("Guest")
                .update({ remarks: userRemarks })
                .eq("user_id", authUserId)
                .eq("gathering_id", selectedGathering.id);
                
            if (error) throw error;
            
            setInfoModalVisible(false);
        } catch (error) {
            console.error("Error updating remarks:", error);
            Alert.alert("Error", "Failed to update remarks");
        }
    };
    
    // Handle adding expense and distributing it
    const handleAddExpense = async () => {
        if (!isCurrentUser || !authUserId || !newExpenseAmount) return;
        
        const amount = parseFloat(newExpenseAmount);
        if (isNaN(amount) || amount <= 0) {
            Alert.alert("Invalid Amount", "Please enter a valid expense amount");
            return;
        }
        
        const selectedUserIds = Object.keys(selectedGuests).filter(userId => selectedGuests[userId]);
        
        // Check if at least one user is selected
        if (selectedUserIds.length === 0) {
            Alert.alert("No Users Selected", "Please select at least one user to share the expense");
            return;
        }
        
        // Calculate share per person
        const sharePerPerson = amount / selectedUserIds.length;
        
        try {
            // First, check if the current user is among the consumers
            const currentUserIsConsumer = selectedGuests[authUserId] || false;
            
            // Update database for all selected users (they get negative values)
            for (const userId of selectedUserIds) {
                // Skip the current user as we'll handle them separately
                if (userId === authUserId && currentUserIsConsumer) continue;
                
                const targetGuest = guestList.find(g => g.user_id === userId);
                
                const { error } = await supabase
                    .from("Guest")
                    .update({ 
                        expenses: (targetGuest?.expenses || 0) - sharePerPerson 
                    })
                    .eq("user_id", userId)
                    .eq("gathering_id", selectedGathering.id);
                    
                if (error) {
                    console.error(`Error updating guest ${userId}:`, error);
                    throw error;
                }
            }
            
            // Calculate the new expense for the payer:
            // If they also consumed, they pay the total minus their own share
            let newExpenseValue;
            if (currentUserIsConsumer) {
                // They paid the bill but also consumed, so they get: 
                // amount (what they paid) - sharePerPerson (what they consumed)
                newExpenseValue = (localExpense || 0) + amount - sharePerPerson;
            } else {
                // They just paid and didn't consume, so they get the full amount
                newExpenseValue = (localExpense || 0) + amount;
            }
            
            setLocalExpense(newExpenseValue);
            
            const { error: currentUserError } = await supabase
                .from("Guest")
                .update({ 
                    expenses: newExpenseValue 
                })
                .eq("user_id", authUserId)
                .eq("gathering_id", selectedGathering.id);
                
            if (currentUserError) throw currentUserError;
            
            setExpenseModalVisible(false);
            setNewExpenseAmount("");
            
            if (onGuestUpdate) {
                onGuestUpdate();
            }
            
            Alert.alert("Success", "Expense added and distributed successfully");
            
        } catch (error) {
            console.error("Error adding expense:", error);
            Alert.alert("Error", "Failed to add expense");
        }
    };
    
    const updateArrivingStatus = async (status: string) => {
        if (!isCurrentUser || !authUserId) return;
        
        try {
            setLocalArrivingStatus(status);
            
            const { error } = await supabase
                .from("Guest")
                .update({ arriving_status: status })
                .eq("user_id", authUserId)
                .eq("gathering_id", selectedGathering.id);
                
            if (error) throw error;
            
            setStatusModalVisible(false);
            
        } catch (error) {
            console.error("Error updating status:", error);
            Alert.alert("Error", "Failed to update arrival status");
            setLocalArrivingStatus(item.arriving_status);
        }
    };
    
    return (
        <View style={styles.container}>
            <TouchableOpacity 
                style={[
                    styles.guestContainer, 
                    isCurrentUser && styles.currentUserContainer
                ]} 
                onPress={moveToUserDetail}
            >
                <View style={styles.userInfoContainer}>
                    <Text style={[
                        styles.userName,
                        isCurrentUser && styles.currentUserText
                    ]}>
                        {item.user.user_name}
                    </Text>
                </View>
                
                <TouchableOpacity 
                    style={styles.expensesContainer}
                    onPress={() => isCurrentUser && setExpenseModalVisible(true)}
                >
                    <Text style={[
                        styles.expenses,
                        isCurrentUser && styles.currentUserText,
                        (localExpense || 0) > 0 && styles.positiveExpense,
                        (localExpense || 0) < 0 && styles.negativeExpense
                    ]}>
                        {formatExpenses(localExpense)}
                    </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                    style={styles.statusContainer}
                    onPress={() => isCurrentUser && setStatusModalVisible(true)}
                >
                    {getArrivingStatusIcon()}
                </TouchableOpacity>
                
                <TouchableOpacity 
                    style={styles.infoButton}
                    onPress={() => setInfoModalVisible(true)}
                >
                    <Ionicons 
                        name="information-circle-outline" 
                        size={24} 
                        color={
                            isCurrentUser 
                                ? "white" 
                                : (item.remarks ? COLORS.primaryDark : 'transparent')
                        } 
                    />
                </TouchableOpacity>
            </TouchableOpacity>

            {/* Remarks Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={infoModalVisible}
                onRequestClose={() => setInfoModalVisible(false)}
            >
                <TouchableOpacity 
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => {
                        if (isCurrentUser) {
                            saveRemarks();
                        } else {
                            setInfoModalVisible(false);
                        }
                    }}
                >
                    <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
                        {isCurrentUser ? (
                            <>
                                <Text style={styles.modalTitle}>Your Remarks</Text>
                                <TextInput
                                    style={styles.textInput}
                                    multiline
                                    numberOfLines={4}
                                    placeholder="Add your remarks here..."
                                    value={userRemarks || ""}
                                    onChangeText={setUserRemarks}
                                />
                                <View style={styles.modalButtons}>
                                    <TouchableOpacity
                                        style={styles.cancelButton}
                                        onPress={() => {
                                            setUserRemarks(item.remarks);
                                            setInfoModalVisible(false);
                                        }}
                                    >
                                        <Text style={styles.buttonText}>Cancel</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.confirmButton}
                                        onPress={saveRemarks}
                                    >
                                        <Text style={styles.buttonText}>Save</Text>
                                    </TouchableOpacity>
                                </View>
                            </>
                        ) : (
                            <Text style={styles.remarks}>
                                {item.remarks || "No additional information provided."}
                            </Text>
                        )}
                    </View>
                </TouchableOpacity>
            </Modal>
            
            {/* Expense Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={expenseModalVisible && isCurrentUser}
                onRequestClose={() => setExpenseModalVisible(false)}
            >
                <TouchableOpacity 
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setExpenseModalVisible(false)}
                >
                    <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
                        <Text style={styles.modalTitle}>Add Expense</Text>
                        
                        <TextInput
                            style={styles.amountInput}
                            placeholder="Enter amount (€)"
                            keyboardType="numeric"
                            value={newExpenseAmount}
                            onChangeText={setNewExpenseAmount}
                        />
                        
                        <Text style={styles.sectionTitle}>Who consumed:</Text>
                        
                        <ScrollView style={styles.guestSelectionList}>
                            {guestList.map((guest) => (
                                <TouchableOpacity
                                    key={guest.user_id}
                                    style={[
                                        styles.guestSelectionItem,
                                        selectedGuests[guest.user_id] && styles.selectedGuestItem
                                    ]}
                                    onPress={() => {
                                        setSelectedGuests({
                                            ...selectedGuests,
                                            [guest.user_id]: !selectedGuests[guest.user_id]
                                        });
                                    }}
                                >
                                    <Text 
                                        style={[
                                            styles.guestSelectionText,
                                            selectedGuests[guest.user_id] && styles.selectedGuestText
                                        ]}
                                    >
                                        {guest.user.user_name}
                                    </Text>
                                    {selectedGuests[guest.user_id] && (
                                        <Ionicons name="checkmark" size={20} color={COLORS.background} />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                        
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={() => setExpenseModalVisible(false)}
                            >
                                <Text style={styles.buttonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.confirmButton}
                                onPress={handleAddExpense}
                            >
                                <Text style={styles.buttonText}>Add</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>
            
            {/* Status Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={statusModalVisible && isCurrentUser}
                onRequestClose={() => setStatusModalVisible(false)}
            >
                <TouchableOpacity 
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setStatusModalVisible(false)}
                >
                    <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
                        <Text style={styles.modalTitle}>Update Arrival Status</Text>
                        
                        <View style={styles.statusOptions}>
                            {["Soon", "On time", "Late"].map((status) => (
                                <TouchableOpacity
                                    key={status}
                                    style={[
                                        styles.statusOption,
                                        localArrivingStatus === status && styles.selectedStatus
                                    ]}
                                    onPress={() => updateArrivingStatus(status)}
                                >
                                    <Text style={[
                                        styles.statusText,
                                        localArrivingStatus === status && styles.selectedStatusText
                                    ]}>
                                        {status}
                                    </Text>
                                    {getStatusIcon(status, isCurrentUser)}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}

const getStatusIcon = (status: string, isCurrentUser: boolean) => {
    switch (status) {
        case "Soon":
            return <Ionicons name="time-outline" size={22} color={isCurrentUser ? COLORS.secondary : COLORS.primary} />;
        case "Late":
            return <Ionicons name="hourglass-outline" size={22} color={COLORS.danger} />;
        case "On time":
            return <Ionicons name="checkmark-circle-outline" size={22} color={COLORS.success} />;
        default:
            return null;
    }
};

const styles = StyleSheet.create({
    container: {
        marginVertical: 4,
    },
    guestContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: COLORS.secondary,
        borderRadius: 10,
        padding: 12,
        borderWidth: 1,
        height: 60,
    },
    currentUserContainer: {
        backgroundColor: COLORS.primary,
    },
    userInfoContainer: {
        flex: 3,
        paddingRight: 8,
    },
    userName: {
        fontFamily: FONTS.medium,
        fontSize: 16,
    },
    currentUserText: {
        color: "white",
    },
    expensesContainer: {
        flex: 1,
        alignItems: "center",
    },
    expenses: {
        fontFamily: FONTS.regular,
        fontSize: 15,
    },
    positiveExpense: {
        color: COLORS.success,
    },
    negativeExpense: {
        color: COLORS.danger,
    },
    noExpenses: {
        fontFamily: FONTS.regular,
        fontSize: 16
    },
    statusContainer: {
        marginHorizontal: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    infoButton: {
        paddingHorizontal: 4,
    },
    // Modal styles
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
        maxWidth: 400,
        width: "90%",
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
    sectionTitle: {
        fontFamily: FONTS.semiBold,
        fontSize: 16,
        marginBottom: 8,
        marginTop: 8,
    },
    textInput: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 10,
        fontFamily: FONTS.regular,
        fontSize: 14,
        minHeight: 100,
        textAlignVertical: 'top',
        marginBottom: 16,
    },
    amountInput: {
        borderWidth: 1,
        borderRadius: 8, 
        padding: 10,
        fontFamily: FONTS.regular,
        fontSize: 16,
        marginBottom: 8,
    },
    guestSelectionList: {
        maxHeight: 200,
        marginBottom: 16,
    },
    guestSelectionItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 12,
        borderWidth: 1,
        borderRadius: 8,
        marginVertical: 4,
    },
    selectedGuestItem: {
        backgroundColor: COLORS.primary,
    },
    guestSelectionText: {
        fontFamily: FONTS.medium,
    },
    selectedGuestText: {
        color: "white",
    },
    remarks: {
        fontFamily: FONTS.semiBold,
        fontSize: 14,
        lineHeight: 20,
        padding: 12,
        borderRadius: 8,
        textAlign: "center",
    },
    modalButtons: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    cancelButton: {
        flex: 1,
        padding: 10,
        borderRadius: 8,
        borderWidth: 1,
        marginRight: 8,
        alignItems: "center",
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
    buttonText: {
        fontFamily: FONTS.medium,
    },
    statusOptions: {
        marginVertical: 10,
    },
    statusOption: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 12,
        borderWidth: 1,
        borderRadius: 8,
        marginVertical: 6,
    },
    selectedStatus: {
        backgroundColor: COLORS.primary,
    },
    statusText: {
        fontFamily: FONTS.regular,
        fontSize: 16,
    },
    selectedStatusText: {
        color: "white",
        fontFamily: FONTS.medium,
    },
});