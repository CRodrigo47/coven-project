import * as WebBrowser from "expo-web-browser";
import { makeRedirectUri } from "expo-auth-session";
import * as QueryParams from "expo-auth-session/build/QueryParams";
import { supabase } from "@/lib/supabase";
import { Button } from "react-native";
import * as Linking from "expo-linking";

WebBrowser.maybeCompleteAuthSession();

const redirectTo = makeRedirectUri();
console.log("redireccion: "+redirectTo)

const createSessionFromUrl = async (url: string) => {
  const { params, errorCode } = QueryParams.getQueryParams(url);

  if (errorCode) throw new Error(errorCode);
  const { access_token, refresh_token } = params;

  if (!access_token) return;
  
  const {data, error} = await supabase.auth.setSession({
    access_token,
    refresh_token
  });
  if(error) throw error;
  return data.session
}

const performOAuth = async () => {
  const {data, error} = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
      skipBrowserRedirect: true
    },
  });
  console.log(data, error)
  if (error){
    console.log(error)
    throw error
  } 
  const res = await WebBrowser.openAuthSessionAsync(
    data?.url ?? "",
    redirectTo
  );
  console.log(res)

  if(res.type === "success"){
    const {url} = res;
    await createSessionFromUrl(url)
  }
}

const sendMagicLink = async () => {
  const { error } = await supabase.auth.signInWithOtp({
    email: "christian3884@gmail.com",
    options: {
      emailRedirectTo: redirectTo,
    },
  });
  if (error) throw error;
};


export default function GoogleAuth() {
// Handle linking into app from email app.
const url = Linking.useURL();
if (url) createSessionFromUrl(url);
return (
  <>
    <Button onPress={performOAuth} title="Sign in with Google" />
  </>
);
}


// import { supabase } from "@/lib/supabase";
// import { useRouter } from "expo-router";
// import { useEffect } from "react";
// import { Platform, Pressable, Text, View } from "react-native";
// import * as Google from "expo-auth-session/providers/google"
// import {makeRedirectUri} from "expo-auth-session";

//  export default function GoogleAuth() {
//    const router = useRouter();


//    const [request, response, promptAsync] = Google.useAuthRequest({
//      clientId: "198888319682-6rs5u2q6j1e6crnlql2b42v9uot298rv.apps.googleusercontent.com",
//      androidClientId: "198888319682-mv3fbepkjh72i9f9cf39cc62t36hd11v.apps.googleusercontent.com",
//      redirectUri: "https://auth.expo.io/@crodrigo47/coven-project",
//      responseType: "id_token",
//      scopes: ["profile", "email"],
//    });
//    // Imprime información de depuración
//    useEffect(() => {
//      console.log("Plataforma:", Platform.OS);
//      console.log("URI de redirección:", request?.redirectUri);
//    }, [request]);
//    useEffect(() => {
//      if (response?.type === "success") {
//        console.log("Autenticación exitosa, respuesta:", response);
//        const { id_token } = response.params;
//        if (!id_token) {
//          console.error("No se recibió id_token en la respuesta");
//          return;
//        }
//        const authenticateUser = async () => {
//          try {
//            console.log("Iniciando autenticación con Supabase usando token");
//            const { data, error } = await supabase.auth.signInWithIdToken({
//              provider: "google",
//              token: id_token,
//            });
//            if (error) {
//              console.error("Error al autenticar con Supabase:", error.message);
//            } else {
//              console.log("¡Usuario autenticado correctamente!");
//              router.navigate(request?.redirectUri);
//            }
//          } catch (e) {
//            console.error("Excepción durante la autenticación:", e);
//          }
//        };
//        authenticateUser();
//      } else if (response) {
//        console.log("Tipo de respuesta:", response.type);
//        if (response.type === "error") {
//          console.error("Error de autenticación:", response.error);
//        }
//      }
//    }, [response]);
//    return (
//      <View>
//        <Pressable
//          disabled={!request}
//          onPress={() => {
//            console.log("Intentando autenticación en:", Platform.OS);
//            promptAsync();
//          }}
//        >
//          <Text
//            className="text-center border p-2 rounded-l color-white"
//            style={{ backgroundColor: "#6E4894" }}
//          >
//            Log In with Google
//          </Text>
//        </Pressable>
//      </View>
//    );
//  }