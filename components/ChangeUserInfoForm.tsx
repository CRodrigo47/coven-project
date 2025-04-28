import React, { useState, useEffect } from "react";
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
import useGlobalStore from "@/context/useStore";
import { useRouter } from "expo-router";

const userSchema = yup.object({
  // email removed as requested
  // name field removed as requested
  // last_name removed as requested
  user_name: yup
    .string()
    .required("Username is required")
    .min(3, "Minimum 3 characters"),
  // user_icon field commented out for future implementation
  // user_icon: yup.string().nullable().default(null),
  phone_number: yup
    .string()
    .matches(/^[0-9]*$/, "Numbers only")
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
  // Password fields removed as requested
});

type UserFormData = yup.InferType<typeof userSchema>;

export default function ChangeUserInfoForm() {
  const router = useRouter();
  const authUserId = useGlobalStore((state: any) => state.authUserId);
  const fetchAuthUserId = useGlobalStore((state: any) => state.fetchAuthUserId);
  
  // Image state commented out for future implementation
  // const [imageUri, setImageUri] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [interestsText, setInterestsText] = useState("");
  const [isLoadingUserData, setIsLoadingUserData] = useState(true);
  const [userNameError, setUserNameError] = useState("");
  const [originalUserName, setOriginalUserName] = useState("");
  // Password change state removed
  const [deletingAccount, setDeletingAccount] = useState(false);

  // Form control
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    reset,
    watch,
  } = useForm<UserFormData>({
    resolver: yupResolver(userSchema),
    defaultValues: {
      // email removed
      // name removed
      // last_name removed
      user_name: "",
      // user_icon removed
      phone_number: "",
      age: 0,
      interests: "",
      // Password fields removed
    },
  });

  // Watch username changes for validation
  const currentUserName = watch("user_name");

  // Get user ID from global store
  useEffect(() => {
    if (!authUserId) {
      fetchAuthUserId();
    }
  }, [authUserId, fetchAuthUserId]);

  // Check if username is unique when it changes
  useEffect(() => {
    const checkUserNameUnique = async () => {
      if (!currentUserName || currentUserName === originalUserName || currentUserName.length < 3) {
        setUserNameError("");
        return;
      }

      try {
        const { data, error } = await supabase
          .from("User")
          .select("id")
          .eq("user_name", currentUserName)
          .neq("id", authUserId);

        if (error) throw error;

        if (data && data.length > 0) {
          setUserNameError("Username already taken");
        } else {
          setUserNameError("");
        }
      } catch (error) {
        console.error("Error checking username:", error);
      }
    };

    const timer = setTimeout(() => {
      checkUserNameUnique();
    }, 500); // Debounce to avoid too many requests

    return () => clearTimeout(timer);
  }, [currentUserName, authUserId, originalUserName]);

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      if (!authUserId) return;

      try {
        setIsLoadingUserData(true);
        const { data, error } = await supabase
          .from("User")
          .select("*")
          .eq("id", authUserId)
          .single();

        if (error) throw error;
        if (!data) throw new Error("User not found");

        // Set form values (including user_name but not email or last_name)
        reset({
          // email: data.email || "", // Removed
          // name: data.name || "", // Removed
          // last_name: data.last_name || "", // Removed
          user_name: data.user_name || "",
          // user_icon: data.user_icon || null, // Removed
          phone_number: data.phone_number || "",
          age: data.age || 0,
          interests: "",
          // Password fields removed
        });

        // Store original username for comparison
        setOriginalUserName(data.user_name || "");

        // Set interests text
        if (data.interests && Array.isArray(data.interests)) {
          const interestsString = data.interests.join(", ");
          setInterestsText(interestsString);
          setValue("interests", interestsString);
        }

        // Image setting commented out for future implementation
        /* 
        if (data.user_icon) {
          setImageUri(data.user_icon);
        }
        */
      } catch (error) {
        console.error("Error fetching user data:", error);
        Alert.alert("Error", "Failed to load user data");
      } finally {
        setIsLoadingUserData(false);
      }
    };

    fetchUserData();
  }, [authUserId, reset, setValue]);

  // Handle interests text change
  const handleInterestsChange = (text: string) => {
    setInterestsText(text);
    setValue("interests", text, { shouldValidate: true });
  };

  // Handle age change
  const handleAgeChange = (text: string) => {
    const numericValue = text.replace(/[^0-9]/g, "");
    setValue("age", numericValue === "" ? 0 : Number(numericValue), {
      shouldValidate: true,
    });
  };

  // Upload profile image function commented out for future implementation
  /*
  const uploadImage = async (uri: string, userId: string) => {
    try {
      let blob;
      if (uri.startsWith('file://') || uri.startsWith('content://')) {
        const response = await fetch(uri);
        blob = await response.blob();
      } else if (uri.startsWith('data:')) {
        const response = await fetch(uri);
        blob = await response.blob();
      } else {
        throw new Error('Unsupported image format');
      }
  
      const fileExt = uri.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `user_avatars/${userId}/avatar.${fileExt}`;
      const mimeType = `image/${fileExt === 'png' ? 'png' : 'jpeg'}`;
  
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, blob, {
          contentType: mimeType,
          upsert: true,
          cacheControl: '3600'
        });
  
      if (uploadError) throw uploadError;
  
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);
  
      if (!publicUrl) throw new Error('Could not get public URL');
  
      return publicUrl;
    } catch (error) {
      console.log('Image upload error:', error);
      throw error;
    }
  };
  */

  // Handle form submission
  const handleUpdateUser = async (formData: UserFormData) => {
    // First check if username is unique
    if (userNameError) {
      Alert.alert("Error", "Please fix the errors before submitting");
      return;
    }

    try {
      setLoading(true);
      
      if (!authUserId) {
        throw new Error("User ID not found");
      }
      
      // Prepare user data update (including user_name but not email or last_name)
      const updateData: any = {
        // name: formData.name, // Removed
        // last_name: formData.last_name, // Removed
        user_name: formData.user_name,
        phone_number: formData.phone_number || "",
        age: formData.age
      };
      
      // Process interests
      if (formData.interests) {
        updateData.interests = formData.interests
          .split(',')
          .map(i => i.trim())
          .filter(i => i !== "");
      } else {
        updateData.interests = [];
      }

      // Image processing commented out for future implementation
      /*
      if (imageUri) {
        try {
          updateData.user_icon = await uploadImage(imageUri, authUserId);
        } catch (uploadError) {
          console.warn("Image upload failed:", uploadError);
        }
      }
      */

      // Update user profile in the database
      const { error: updateError } = await supabase
        .from('User')
        .update(updateData)
        .eq('id', authUserId);

      if (updateError) throw updateError;

      // Email update logic removed

      Alert.alert("Success", "Your profile has been updated");
    } catch (error) {
      console.error("Error updating user:", error);
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to update profile"
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle account deletion
// Handle account deletion
const handleDeleteAccount = async () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setDeletingAccount(true);
              
              // Paso 1: Eliminar el usuario de la tabla User personalizada
              const { error: userDeleteError } = await supabase
                .from("User")
                .delete()
                .eq("id", authUserId);
                
              if (userDeleteError) throw userDeleteError;
              
              // Paso 2: Usar la función de Supabase para eliminar el usuario de autenticación
              // en lugar de usar la función admin que requiere permisos especiales
              const { error: authError } = await supabase.rpc('delete_user');
              
              if (authError) throw authError;
              
              // Paso 3: Cerrar sesión
              await supabase.auth.signOut();
              
              // Paso 5: Navegar a la página de inicio o login
              // Usar replace para evitar volver atrás con el botón de regreso
              router.replace("/mainTabs/logOut");
              
            } catch (error) {
              let errorMessage = "Failed to delete account";
              
              if (error instanceof Error) {
                errorMessage = error.message;
              }
              
              Alert.alert("Error", errorMessage);
              console.error("Delete account error:", error);
            } finally {
              setDeletingAccount(false);
            }
          }
        }
      ]
    );
  };

  if (isLoadingUserData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading your profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>Edit Your Profile</Text>

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
        {errors.user_name && <Text style={styles.errorText}>{errors.user_name.message}</Text>}
        {userNameError && <Text style={styles.errorText}>{userNameError}</Text>}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Phone</Text>
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
        {errors.phone_number && <Text style={styles.errorText}>{errors.phone_number.message}</Text>}
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
        {errors.age && <Text style={styles.errorText}>{errors.age.message}</Text>}
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

      {/* Password Change Section removed */}

      <View style={styles.submitButton}>
        {loading ? (
          <ActivityIndicator size="small" color={COLORS.primary} />
        ) : (
          <Button
            title="Update Profile"
            onPress={handleSubmit(handleUpdateUser)}
            disabled={isSubmitting || !!userNameError}
            color={COLORS.primary}
          />
        )}
      </View>

      <View style={styles.deleteButton}>
        {deletingAccount ? (
          <ActivityIndicator size="small" color={COLORS.danger} />
        ) : (
          <Button
            title="Delete Account"
            onPress={handleDeleteAccount}
            disabled={deletingAccount}
            color={COLORS.danger}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.primary,
    fontFamily: FONTS.medium,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
    fontFamily: FONTS.semiBold,
    color: COLORS.primary,
  },
  inputGroup: {
    marginBottom: 12,
  },
  label: {
    marginBottom: 4,
    fontSize: 14,
    color: '#444',
    fontFamily: FONTS.medium
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 10,
    fontSize: 14,
    backgroundColor: '#fff',
    fontFamily: FONTS.medium,
    height: 40,
  },
  errorText: {
    color: '#dc2626',
    marginTop: 4,
    fontSize: 12,
    fontFamily: FONTS.medium
  },
  submitButton: {
    marginTop: 20,
    borderRadius: 6,
    overflow: 'hidden',
  },
  deleteButton: {
    marginTop: 15,
    borderRadius: 6,
    overflow: 'hidden',
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: 10
  },
});