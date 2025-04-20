import { Text, View } from "react-native";
import { Link } from "expo-router";
import { Logo } from "@/constants/covenIcons";
import GoogleAuth from "@/components/googleAuth";
import LoginForm from "@/components/logInForm";

export default function LogIn() {


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
      <LoginForm/>
      {/* <View className="m-2">
        <GoogleAuth />
      </View> */}
          <Text >Aun no tienes cuenta?</Text>
          <Link href="/createAccount" className="text-center py-2" style={{color: "#6E4894"}}>
            Crea una
          </Link>
      </View>
  );
}
