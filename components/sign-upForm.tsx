import React, { useState } from "react";
import {
  View,
  TextInput,
  Button,
  Text,
  ScrollView,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { supabase } from "../lib/supabase";
import { FONTS } from "@/constants/FONTS";
import { COLORS } from "@/constants/COLORS";

const registerSchema = yup.object({
  email: yup.string().email("Email is not valid").required("Email is required"),
  password: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .required("Password is required"),
  name: yup.string().required("Name is required"),
  last_name: yup.string().required("Last name is required"),
  user_name: yup
    .string()
    .required("Username is required")
    .min(3, "Minimum 3 characters"),
  user_icon: yup.string().nullable().default(null),
  phone_number: yup
    .string()
    .matches(/^[0-9]+$/, "Numbers only")
    .min(8, "Minimum 8 digits")
    .default(""),
  age: yup
    .number()
    .transform((value) => (isNaN(value) ? null : value))
    .nullable()
    .required("Age is required")
    .min(13, "Minimum 13 years")
    .max(120, "Maximum 120 years"),
  interests: yup.string().nullable().default(""),
});

type RegisterFormData = yup.InferType<typeof registerSchema>;

export default function RegisterForm() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [interestsText, setInterestsText] = useState("");

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<RegisterFormData>({
    resolver: yupResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      name: "",
      last_name: "",
      user_name: "",
      user_icon: null,
      phone_number: "",
      age: 0,
      interests: "",
    },
  });

  const uploadImage = async (uri: string, userId: string) => {
    try {
      let blob;
      if (uri.startsWith("file://") || uri.startsWith("content://")) {
        const response = await fetch(uri);
        blob = await response.blob();
      } else if (uri.startsWith("data:")) {
        const response = await fetch(uri);
        blob = await response.blob();
      } else {
        throw new Error("Unsupported image format");
      }

      const fileExt = uri.split(".").pop()?.toLowerCase() || "jpg";
      const fileName = `user_avatars/${userId}/avatar.${fileExt}`;
      const mimeType = `image/${fileExt === "png" ? "png" : "jpeg"}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, blob, {
          contentType: mimeType,
          upsert: true,
          cacheControl: "3600",
        });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(fileName);

      if (!publicUrl) throw new Error("Could not get public URL");

      const { error: updateError } = await supabase
        .from("User")
        .update({ user_icon: publicUrl })
        .eq("id", userId);

      if (updateError) throw updateError;

      return publicUrl;
    } catch (error) {
      console.log("Image upload error:", error);
      throw error;
    }
  };

  const handleAgeChange = (text: string) => {
    const numericValue = text.replace(/[^0-9]/g, "");
    setValue("age", numericValue === "" ? 0 : Number(numericValue), {
      shouldValidate: true,
    });
  };

  const handleInterestsChange = (text: string) => {
    setInterestsText(text);
    setValue("interests", text, { shouldValidate: true });
  };

  const handleRegister = async (formData: RegisterFormData) => {
    try {
      setLoading(true);

      // Comprobar si el nombre de usuario ya existe
      const { data: usernameCheck } = await supabase
        .from("User")
        .select("user_name")
        .eq("user_name", formData.user_name)
        .maybeSingle();

      if (usernameCheck) {
        throw new Error("Username already in use");
      }

      // Registrar el usuario en Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            last_name: formData.last_name,
            user_name: formData.user_name,
          },
        },
      });

      if (authError) {
        if (authError.message.includes("User already registered")) {
          return handleExistingUser(formData);
        }
        throw authError;
      }

      if (!authData.user) throw new Error("Failed to create user");

      // CAMBIO IMPORTANTE: Insertar el registro en la tabla User inmediatamente después del registro
      // sin esperar por la sesión
      const { error: userError } = await supabase.from("User").insert({
        id: authData.user.id,
        email: formData.email,
        name: formData.name,
        last_name: formData.last_name,
        user_name: formData.user_name,
        user_icon: null, // Dejamos la imagen como null por ahora
        phone_number: formData.phone_number,
        age: formData.age,
        interests: formData.interests
          ? formData.interests.split(",").map((i) => i.trim())
          : [],
      });

      if (userError) {
        console.error("Error creating user record:", userError);
        throw new Error(`Failed to create user record: ${userError.message}`);
      }

      // El correo ya se ha enviado automáticamente por Supabase Auth
      setEmailSent(true);
    } catch (error) {
      console.error("Error:", error);
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Registration error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleExistingUser = async (formData: RegisterFormData) => {
    try {
      const {
        data: { user },
        error: signInError,
      } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (signInError) throw signInError;
      if (!user) throw new Error("User not found");

      const updates = {
        name: formData.name,
        last_name: formData.last_name,
        user_name: formData.user_name,
        user_icon: formData.user_icon,
        phone_number: formData.phone_number,
        age: formData.age,
        interests: formData.interests
          ? formData.interests.split(",").map((i) => i.trim())
          : [],
        updated_at: new Date().toISOString(),
      };

      if (imageUri) {
        try {
          updates.user_icon = await uploadImage(imageUri, user.id);
        } catch (uploadError) {
          console.warn("Image upload failed:", uploadError);
        }
      }

      const { error: updateError } = await supabase
        .from("User")
        .update(updates)
        .eq("id", user.id);

      if (updateError) throw updateError;
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : "Error updating user"
      );
    }
  };

  if (emailSent) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Verify your email</Text>
        <Text style={styles.message}>
          We've sent a confirmation link to your email address. Please check
          your inbox and click the link to activate your account.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Email*</Text>
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.input}
              placeholder="your@email.com"
              autoCapitalize="none"
              keyboardType="email-address"
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
            />
          )}
        />
        {errors.email && (
          <Text style={styles.errorText}>{errors.email.message}</Text>
        )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Password*</Text>
        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.input}
              placeholder="Minimum 8 characters"
              secureTextEntry
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
            />
          )}
        />
        {errors.password && (
          <Text style={styles.errorText}>{errors.password.message}</Text>
        )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Name*</Text>
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.input}
              placeholder="Your name"
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
            />
          )}
        />
        {errors.name && (
          <Text style={styles.errorText}>{errors.name.message}</Text>
        )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Last name*</Text>
        <Controller
          control={control}
          name="last_name"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.input}
              placeholder="Your last name"
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
            />
          )}
        />
        {errors.last_name && (
          <Text style={styles.errorText}>{errors.last_name.message}</Text>
        )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Username*</Text>
        <Controller
          control={control}
          name="user_name"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.input}
              placeholder="Minimum 3 characters"
              autoCapitalize="none"
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
            />
          )}
        />
        {errors.user_name && (
          <Text style={styles.errorText}>{errors.user_name.message}</Text>
        )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Phone*</Text>
        <Controller
          control={control}
          name="phone_number"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.input}
              placeholder="Optional"
              keyboardType="phone-pad"
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
            />
          )}
        />
        {errors.phone_number && (
          <Text style={styles.errorText}>{errors.phone_number.message}</Text>
        )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Age*</Text>
        <Controller
          control={control}
          name="age"
          render={({ field: { value, onBlur } }) => (
            <TextInput
              style={styles.input}
              placeholder="Minimum 13 years"
              keyboardType="numeric"
              value={value ? String(value) : ""}
              onBlur={onBlur}
              onChangeText={handleAgeChange}
            />
          )}
        />
        {errors.age && (
          <Text style={styles.errorText}>{errors.age.message}</Text>
        )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Interests</Text>
        <Controller
          control={control}
          name="interests"
          render={({ field: { onBlur } }) => (
            <TextInput
              style={[styles.input, styles.multilineInput]}
              placeholder="Separate with commas (e.g. reading, sports, music)"
              value={interestsText}
              onBlur={onBlur}
              onChangeText={handleInterestsChange}
              multiline
              textAlignVertical="top"
            />
          )}
        />
      </View>

      <View style={styles.submitButton}>
        {loading ? (
          <ActivityIndicator size="small" color={COLORS.primary} />
        ) : (
          <Button
            title={isSubmitting ? "Registering..." : "Register"}
            onPress={handleSubmit(handleRegister)}
            disabled={isSubmitting}
            color={COLORS.primary}
          />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 15,
    paddingBottom: 30,
  },
  inputGroup: {
    marginBottom: 12,
  },
  label: {
    marginBottom: 4,
    fontSize: 14,
    color: "#444",
    fontFamily: FONTS.medium,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    padding: 10,
    fontSize: 14,
    backgroundColor: "#fff",
    fontFamily: FONTS.medium,
    height: 40,
  },
  errorText: {
    color: "#dc2626",
    marginTop: 4,
    fontSize: 12,
    fontFamily: FONTS.medium,
  },
  submitButton: {
    marginTop: 15,
    borderRadius: 6,
    overflow: "hidden",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
    fontFamily: FONTS.semiBold,
  },
  message: {
    textAlign: "center",
    paddingHorizontal: 15,
    fontFamily: FONTS.medium,
    fontSize: 14,
  },
  multilineInput: {
    height: 80,
    textAlignVertical: "top",
    paddingTop: 10,
  },
});
