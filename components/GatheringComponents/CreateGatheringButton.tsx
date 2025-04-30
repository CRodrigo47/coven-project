import { COLORS } from "@/constants/COLORS";
import { usePathname, useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native"; // Ajusta la ruta según tu estructura
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase"; // Ajusta la ruta según tu estructura
import useGlobalStore from "@/context/useStore";
import { getTypography } from "@/constants/TYPOGRAPHY";

export default function CreateGatheringButton() {
    const router = useRouter();
    const selectedGathering = useGlobalStore((state: any) => state.selectedGathering);
    const pathname = usePathname()
    const authUserId = useGlobalStore((state: any) => state.authUserId);
    const fetchAuthUserId = useGlobalStore((state: any) => state.fetchAuthUserId);
  
  
    useEffect(() => {
      if (!authUserId) {
        fetchAuthUserId();
      }
    }, [authUserId, fetchAuthUserId]);



    const moveToCreate = () => {
        if(pathname.includes("/mainTabs/covenTabs")){
            router.navigate("/mainTabs/covenTabs/createGathering")
        }else{
            router.navigate("/mainTabs/gatheringTabs/createGathering")
        }
    }

    if (selectedGathering && selectedGathering.created_by !== authUserId) {
        return null;
    }

    const isEditing = selectedGathering && selectedGathering.created_by === authUserId;
    const buttonText = isEditing ? "Edit Gathering" : "Create Gathering";

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={() => moveToCreate()}>
                <View style={styles.buttonBox}>
                    <Text className="text-center p-2" style={getTypography("labelLarge", "light")}>{buttonText}</Text>
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
        width: 90,
        backgroundColor: COLORS.secondary,
    },
});