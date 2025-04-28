import CovenList from "@/components/CovenComponents/CovenList";
import { COLORS } from "@/constants/COLORS";
import { View } from "react-native";

export default function YourCoven() {
  return (
    <View className="h-full" style={{ backgroundColor: COLORS.background }}>
      <CovenList></CovenList>
    </View>
  );
}
