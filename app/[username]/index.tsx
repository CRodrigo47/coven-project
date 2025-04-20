import useGlobalStore from "@/context/useStore";
import { View, Text, StyleSheet } from "react-native";

const ProfileViewer = () => {
  const selectedUser = useGlobalStore((state: any) => state.selectedUser);
  console.log("usuario: ", selectedUser);

  return (
    <View className="h-full" style={{ backgroundColor: "#fcf5d7" }}>
      <View style={styles.hola}>
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
