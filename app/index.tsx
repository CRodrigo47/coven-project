import "../global.css";
import { useRouter } from "expo-router";
import { useAuth } from "@/providers/AuthProvider";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import { Linking } from "react-native";
import { useEffect } from "react";
import { useFonts } from 'expo-font';
import { 
  Montserrat_300Light,
  Montserrat_400Regular,
  Montserrat_400Regular_Italic,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
  Montserrat_700Bold_Italic
} from '@expo-google-fonts/montserrat';
import { FONTS } from '../constants/FONTS';

export default function Index() {
  const [fontsLoaded] = useFonts({
    [FONTS.light]: Montserrat_300Light,
    [FONTS.regular]: Montserrat_400Regular,
    [FONTS.italic]: Montserrat_400Regular_Italic,
    [FONTS.semiBold]: Montserrat_600SemiBold,
    [FONTS.bold]: Montserrat_700Bold,
    [FONTS.boldItalic]: Montserrat_700Bold_Italic
  });

  const router = useRouter();
  const { session, loading } = useAuth();

  useEffect(() => {
    const subscription = Linking.addEventListener('url', ({ url }) => {
      // Manejo de deep linking
    });
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    // Solo redirigir cuando todo esté cargado
    if (!loading && fontsLoaded) {
      console.log('Index session check:', session);
      if (session) {
        router.replace('/mainTabs/gatheringTabs');
      } else {
        router.replace('/auth/LogIn');
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
    justifyContent: 'center',
    alignItems: 'center'
  }
});