import useGlobalStore from "@/context/useStore";
import { View, Text, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ProfileViewer = () => {
  const selectedUser = useGlobalStore((state: any) => state.selectedUser);
  console.log("usuario: ", selectedUser);
  const insets = useSafeAreaInsets();

  return (
    <View className="h-full" style={{ backgroundColor: "#fcf5d7" }}>
      <View style={{marginTop: insets.top}}>
        <Text>Perfil de {selectedUser.name}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  hola: {
    marginTop: 30
  }
})

export default ProfileViewer;
