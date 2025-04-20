import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function InviteGatheringButton(){
    const router = useRouter();

    return(
        <TouchableOpacity onPress={() => router.navigate("/mainTabs/inviteQR")}>
            <View style={styles.buttonBox}>
                <Text className="text-center p-2">Invite Friend</Text>
            </View>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    buttonBox: {
        position: "absolute",
        bottom: 20,
        right: 15,
        borderWidth: 1,
        borderRadius: 15,
        backgroundColor: "#FFDF5F"
    }
})