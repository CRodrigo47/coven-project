import { Button, Text, View } from "react-native";
import { useRouter } from "expo-router";

export default function CreateAccount() {
  const router = useRouter();

  return (
    <View
      className="h-full"
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#fcf5d7",
      }}
    >
      <View>
        <Text>Formulario de crear cuenta (aun no está implementado jiji)</Text>
      </View>
      <View>
        <Button
          title="Create Account"
          onPress={() => router.navigate("/verifyEmail")}
        />
      </View>
    </View>
  );
}
