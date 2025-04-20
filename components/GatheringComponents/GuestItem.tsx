import { GuestInterface, GuestWithUserIcon } from "@/app/interfaces/guestInterface";
import useGlobalStore from "@/context/useStore";
import { supabase } from "@/lib/supabase";
import { useRouter } from "expo-router";
import { Text, TouchableOpacity } from "react-native";

export default function GuestItem({ item }: { item: GuestWithUserIcon }) {
    const router = useRouter();
    const setSelectedUser = useGlobalStore((state: any) => state.setSelectedUser)

    const moveToUserDetail = async () => {
        const {data, error} = await supabase
            .from('User')
            .select('*')
            .eq('id', item.user_id)
            .single()

        if (error) {
            console.error("Error fetching User: " + error.message)
            return
        }
        
        setSelectedUser(data)
        router.navigate("/" + data.user_name)
    }
    
    return (
        <TouchableOpacity onPress={moveToUserDetail}>
            <Text>{item.user.user_name}</Text>
        </TouchableOpacity>
    )
}