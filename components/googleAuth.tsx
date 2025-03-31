import React, { useEffect } from "react";
import { Button, Platform, Text, View } from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { supabase } from "../lib/supabase";

WebBrowser.maybeCompleteAuthSession();

export default function GoogleAuth() {
  // Específico para Android, usa el ID correcto de tipo Android
  const androidClientId =
    "198888319682-mv3fbepkjh72i9f9cf39cc62t36hd11v.apps.googleusercontent.com";
  const webClientId =
    "198888319682-6rs5u2q6j1e6crnlql2b42v9uot298rv.apps.googleusercontent.com";

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: webClientId, // Para uso con Expo Go o el proxy de autenticación
    androidClientId: androidClientId,
    webClientId: webClientId,
    responseType: "id_token",
    scopes: ["profile", "email"],
  },);
  // Imprime información de depuración
  useEffect(() => {
    console.log("Plataforma:", Platform.OS);
    console.log("URI de redirección:", request?.redirectUri);
  }, [request]);

  useEffect(() => {
    if (response?.type === "success") {
      console.log("Autenticación exitosa, respuesta:", response);

      const { id_token } = response.params;

      if (!id_token) {
        console.error("No se recibió id_token en la respuesta");
        return;
      }

      const authenticateUser = async () => {
        try {
          console.log("Iniciando autenticación con Supabase usando token");

          const { data, error } = await supabase.auth.signInWithIdToken({
            provider: "google",
            token: id_token,
          });

          if (error) {
            console.error("Error al autenticar con Supabase:", error.message);
          } else {
            console.log("¡Usuario autenticado correctamente!");
          }
        } catch (e) {
          console.error("Excepción durante la autenticación:", e);
        }
      };

      authenticateUser();
    } else if (response) {
      console.log("Tipo de respuesta:", response.type);
      if (response.type === "error") {
        console.error("Error de autenticación:", response.error);
      }
    }
  }, [response]);

  return (
    <View style={{ padding: 20 }}>
      <Button
        title="Login with Google"
        disabled={!request}
        onPress={() => {
          console.log("Intentando autenticación en:", Platform.OS);
          promptAsync();
        }}
      />
      <Text style={{ marginTop: 10 }}>
        {Platform.OS === "android" ? "Android" : "Web"}
      </Text>
    </View>
  );
}
