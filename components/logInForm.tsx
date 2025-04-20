import React, { useState } from "react";
import {
  View,
  TextInput,
  Button,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Pressable,
  Keyboard,
} from "react-native";
import { supabase } from "../lib/supabase";
import { useRouter } from "expo-router";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
  
      if (error) throw error;
  
      await new Promise(resolve => setTimeout(resolve, 1000));
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        router.replace('/mainTabs/gatheringTabs');
      } else {
        throw new Error('Session not found after login');
      }
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      Alert.alert(
        "Ingresa tu email",
        "Necesitamos tu email para enviar el enlace de recuperación"
      );
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: "http://localhost:8081/", // Para deep linking
      });

      if (error) throw error;

      Alert.alert(
        "Enlace enviado",
        "Te hemos enviado un enlace para restablecer tu contraseña a tu correo electrónico."
      );
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <View className="pt-20 w-64">
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        className="mb-4"
      />
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <>
        <Pressable onPress={handlePasswordReset}>
            <Text className="text-center pb-2" style={{color: "#6E4894"}}>
              ¿Olvidaste tu contraseña?
            </Text>
          </Pressable>
          <Pressable onPress={handleLogin}>
            <Text className="text-center border mt-2 py-2 rounded-l color-white" style={{backgroundColor: "#6E4894"}}>Iniciar sesion</Text>
          </Pressable>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
});
