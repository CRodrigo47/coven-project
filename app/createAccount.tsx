import { Button, Text, View } from "react-native";
import { useRouter } from "expo-router";
import UserForm from "@/components/sign-upForm";

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
      <View className="w-full">
      <UserForm />
      </View>
      <View>
        <Button
          title="boton antiguo"
          onPress={() => router.navigate("/verifyEmail")}
        />
      </View>
    </View>
  );
}
