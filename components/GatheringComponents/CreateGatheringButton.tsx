import { COLORS } from "@/constants/COLORS";
import { usePathname, useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native"; // Ajusta la ruta según tu estructura
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase"; // Ajusta la ruta según tu estructura
import useGlobalStore from "@/context/useStore";

export default function CreateGatheringButton() {
    const router = useRouter();
    const selectedGathering = useGlobalStore((state: any) => state.selectedGathering);
    const [userId, setUserId] = useState<string | null>(null);
    const pathname = usePathname()

    useEffect(() => {
        const fetchUserId = async () => {
            try {
                const {
                    data: { user },
                } = await supabase.auth.getUser();
                if (user) setUserId(user.id);
            } catch (err) {
                console.error("Error getting user ID:", err);
            }
        };
        fetchUserId();
    }, []);

    const moveToCreate = () => {
        if(pathname.includes("/mainTabs/covenTabs")){
            router.navigate("/mainTabs/covenTabs/createGathering")
        }else{
            router.navigate("/mainTabs/gatheringTabs/createGathering")
        }
    }

    if (selectedGathering && selectedGathering.created_by !== userId) {
        return null;
    }

    const isEditing = selectedGathering && selectedGathering.created_by === userId;
    const buttonText = isEditing ? "Edit Gathering" : "Create Gathering";

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={() => moveToCreate()}>
                <View style={styles.buttonBox}>
                    <Text className="text-center p-2">{buttonText}</Text>
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
        width: 130,
        backgroundColor: COLORS.secondary,
    },
});