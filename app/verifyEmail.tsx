import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

export default function VerifyEmail() {
  const router = useRouter();

  return (
    <View
      className="h-full"
      style={{ backgroundColor: "#fcf5d7", alignItems: "center" }}
    >
      <Text>verifica tu email ompare</Text>
      <Pressable onPress={() => router.push("/mainTabs/gatheringTabs")}>
        <Text className="p-3 mt-3 bg-red-500 d-block w-36 text-center">
          pa los gatherings
        </Text>
      </Pressable>
    </View>
  );
}
