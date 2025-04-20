import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function CreateCovenButton() {
    const router = useRouter();

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={() => router.navigate("/mainTabs/covenTabs/createCoven")}>
                <View style={styles.buttonBox}>
                    <Text className="text-center p-2">Create Coven</Text>
                </View>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        bottom: 20,
        left: 0,
        right: 0,
        alignItems: "center"
    },
    buttonBox: {
        borderWidth: 1,
        borderRadius: 15,
        backgroundColor: "#FFDF5F",
    },
});