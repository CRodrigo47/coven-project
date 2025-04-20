import "../global.css";
import { useRouter } from "expo-router";
import { useAuth } from "@/providers/AuthProvider";
import { ActivityIndicator, Linking } from "react-native";
import { useEffect } from "react";

export default function Index() {
  const router = useRouter();
  const { session, loading } = useAuth();

  useEffect(() => {
    const subscription = Linking.addEventListener('url', ({ url }) => {
    });
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (!loading) {
      console.log('Index session check:', session);
      if (session) {
        router.replace('/mainTabs/gatheringTabs');
      } else {
        router.replace('/auth/LogIn');
      }
    }
  }, [session, loading]);

  if (loading) {
    return <ActivityIndicator size="large" />;
  }

  return null;
}
