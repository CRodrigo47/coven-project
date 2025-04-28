import { COLORS } from "@/constants/COLORS";
import { getTypography } from "@/constants/TYPOGRAPHY";
import useGlobalStore from "@/context/useStore";
import { supabase } from "@/lib/supabase";
import { useRouter, usePathname } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function CreateCovenButton() {
    const router = useRouter();
    const pathname = usePathname();
    const [isOwner, setIsOwner] = useState(false);
    const selectedCoven = useGlobalStore((state: any) => state.selectedCoven);
    const authUserId = useGlobalStore((state: any) => state.authUserId);
    const fetchAuthUserId = useGlobalStore((state: any) => state.fetchAuthUserId);
  
  
    useEffect(() => {
      if (!authUserId) {
        fetchAuthUserId();
      }
    }, [authUserId, fetchAuthUserId]);
    
    const isDetailPage = pathname === "/mainTabs/covenTabs/covenDetail";
    const buttonText = isDetailPage ? "Update Coven" : "Create Coven";


    useEffect(() => {
        if (isDetailPage && selectedCoven && authUserId) {
            setIsOwner(selectedCoven.created_by === authUserId);
        } else if (!isDetailPage) {
            // Always show create button on non-detail pages
            setIsOwner(true);
        }
    }, [isDetailPage, selectedCoven, authUserId]);

    if (isDetailPage && !isOwner) {
        return null;
    }
    
    const handlePress = () => {
        router.navigate({
            pathname: "/mainTabs/covenTabs/createCoven",
            params: { from: pathname }
        });
    };

    return (
        <View style={[
            styles.container,
            isDetailPage ? styles.updateContainer : null
        ]}>
            <TouchableOpacity onPress={handlePress}>
                <View style={[
                    styles.buttonBox,
                ]}>
                    <Text className="text-center p-2" style={getTypography("labelLarge", "light")}>
                        {buttonText}
                    </Text>
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
    updateContainer: {
        alignItems: "flex-start",
        paddingLeft: 30,
        right: 'auto'
    },
    buttonBox: {
        borderWidth: 1,
        borderRadius: 15,
        width: 80,
        backgroundColor: COLORS.secondary
    },
});