import { View } from "react-native";
import RegisterForm from "@/components/sign-upForm";

export default function CreateAccount() {


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
      <RegisterForm />
      </View>
    </View>
  );
}
