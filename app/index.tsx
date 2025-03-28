import { Button, Text, View } from "react-native";
import "../global.css";
import { Link, useRouter } from "expo-router";
import { Logo } from "@/constants/covenIcons";

export default function LogIn() {
  const router = useRouter();

  return (
    <View
      className="h-full"
      style={{
        flex: 1,
        alignItems: "center",
        backgroundColor: "#fcf5d7",
      }}
    >
      <View className="mt-32">
        <Logo></Logo>
      </View>
      <View className="mt-32">
        <Text>Aqui irá login</Text>
      </View>
      <View className="mt-32">
        <Button
          title="Log In"
          onPress={() => router.navigate("/mainTabs/gatheringTabs")}
        />
        <View>
          <Text>Aun no tienes cuenta?</Text>
          <Link href="/createAccount" className="color-blue-600 p-1">
            Crea una
          </Link>
        </View>
      </View>
    </View>
  );
}
