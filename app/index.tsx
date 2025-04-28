import "../global.css";
import { useRouter } from "expo-router";
import { useAuth } from "@/providers/AuthProvider";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import { Linking } from "react-native";
import { useEffect } from "react";
import { useFonts } from "expo-font";
import {
  BeVietnamPro_300Light,
  BeVietnamPro_400Regular,
  BeVietnamPro_500Medium,
  BeVietnamPro_600SemiBold,
  BeVietnamPro_700Bold,
  BeVietnamPro_400Regular_Italic,
  BeVietnamPro_700Bold_Italic,
} from "@expo-google-fonts/be-vietnam-pro";
import { FONTS } from "../constants/FONTS";

export default function Index() {
  const [fontsLoaded] = useFonts({
    [FONTS.light]: BeVietnamPro_300Light,
    [FONTS.regular]: BeVietnamPro_400Regular,
    [FONTS.italic]: BeVietnamPro_400Regular_Italic,
    [FONTS.semiBold]: BeVietnamPro_600SemiBold,
    [FONTS.bold]: BeVietnamPro_700Bold,
    [FONTS.boldItalic]: BeVietnamPro_700Bold_Italic,
    [FONTS.medium]: BeVietnamPro_500Medium
  });

  const router = useRouter();
  const { session, loading } = useAuth();

  useEffect(() => {
    const subscription = Linking.addEventListener("url", ({ url }) => {
      // Manejo de deep linking
    });
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    // Solo redirigir cuando todo esté cargado
    if (!loading && fontsLoaded) {
      console.log("Index session check:", session);
      if (session) {
        router.replace("/mainTabs/gatheringTabs");
      } else {
        router.replace("/auth/LogIn");
      }
    }
  }, [session, loading, fontsLoaded]); // Añadimos fontsLoaded como dependencia

  // Mostrar loading si alguna de las condiciones no está lista
  if (loading || !fontsLoaded) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
