import { COLORS } from "@/constants/COLORS";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function CovenMembersButton() {
    const router = useRouter();

    const handleNavigate = () => {
        console.log("Button pressed, navigating to members list");
        router.push("/mainTabs/covenTabs/covenMembersList");
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity 
                onPress={handleNavigate} 
                style={styles.touchable}
                activeOpacity={0.7}
            >
                <View style={styles.buttonBox}>
                    <Ionicons name="people" size={18} color={COLORS.primaryDark} />
                </View>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        top: 4,
        right: 20,
        zIndex: 10,
    },
    touchable: {
        width: 40,
        height: 40,
    },
    buttonBox: {
        width: "100%",
        height: "100%",
        borderWidth: 1,
        borderRadius: 20,
        backgroundColor: COLORS.secondary,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    buttonText: {
        marginLeft: 5,
        textAlign: "center"
    }
});