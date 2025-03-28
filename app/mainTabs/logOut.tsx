import { useRouter } from "expo-router";
import { useEffect } from "react";

export default function logOut() {
  const router = useRouter();

  useEffect(() => {
    const logOut = async () => {
      router.replace("/");
    };

    logOut();
  }, []);

  return null;
}
