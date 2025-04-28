import React, { useState } from "react";
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { supabase } from "../lib/supabase";
import { useRouter } from "expo-router";
import { getTypography } from "@/constants/TYPOGRAPHY";
import { COLORS } from "@/constants/COLORS";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    try {
      setLoading(true);
      
      // Limpiar cualquier sesión existente primero
      await supabase.auth.signOut();
      
      // Intentar iniciar sesión
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
  
      if (error) throw error;
      
      // No necesitas esperar artificialmente ni volver a comprobar la sesión
      if (data.session) {
        router.replace('/mainTabs/gatheringTabs');
      } else {
        throw new Error('No se pudo obtener la sesión después del inicio de sesión');
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
        "Enter your email",
        "We need your email to send the recovery link"
      );
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: "http://localhost:8081/",
      });

      if (error) throw error;

      Alert.alert(
        "Link sent",
        "We've sent a password reset link to your email"
      );
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <View style={styles.formContainer}>
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#999"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={[styles.input, {marginBottom: 2}]}
        placeholder="Password"
        placeholderTextColor="#999"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
      ) : (
        <>
          <Pressable onPress={handlePasswordReset} style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Forgot your password?</Text>
          </Pressable>
          <Pressable onPress={handleLogin} style={styles.loginButton}>
            <Text style={styles.loginButtonText}>Log In</Text>
          </Pressable>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  formContainer: {
    width: 256,
    paddingBottom: 20,
  },
  input: {
    height: 44,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    marginBottom: 16,
    backgroundColor: "#fff",
    ...getTypography("bodyMedium", "light"),
  },
  forgotPassword: {
    paddingVertical: 10,
  },
  forgotPasswordText: {
    color: COLORS.primary,
    textAlign: "center",
    ...getTypography("bodyMedium", "light"),
  },
  loginButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 6,
    paddingVertical: 12,
    marginTop: 8,
  },
  loginButtonText: {
    color: "#fff",
    textAlign: "center",
    ...getTypography("bodyMedium", "dark"),
  },
  loader: {
    marginVertical: 24,
  },
});