import ChangeUserInfoForm from "@/components/ChangeUserInfoForm";
import { COLORS } from "@/constants/COLORS";
import { View } from "react-native";

export default function ChangeUserInfo() {
  return (
    <View className="h-full" style={{ backgroundColor: COLORS.background }}>
      <ChangeUserInfoForm />
    </View>
  );
}
