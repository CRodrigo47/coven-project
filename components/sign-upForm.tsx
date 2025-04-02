import React, { useEffect, useState } from "react";
import {
  View,
  TextInput,
  Button,
  Text,
  ScrollView,
  Alert,
  StyleSheet,
  Image,
} from "react-native";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { supabase } from "../lib/supabase";
import ImagePickerComponent from "./imagePicker";

// 1. Primero define el esquema Yup
const userSchema = yup.object({
  name: yup.string().required("El nombre es obligatorio"),
  last_name: yup.string().required("El apellido es obligatorio"),
  user_name: yup
    .string()
    .required("El nombre de usuario es obligatorio")
    .min(3, "Mínimo 3 caracteres"),
  user_icon: yup.string().nullable().default(null),
  email: yup
    .string()
    .email("El email no es válido")
    .required("El email es obligatorio"),
  phone_number: yup
    .string()
    .matches(/^[0-9]+$/, "Solo números")
    .min(10, "Mínimo 10 dígitos")
    .default(""),
  age: yup
    .number()
    .transform((value) => (isNaN(value) ? null : value))
    .nullable()
    .required("La edad es obligatoria")
    .min(13, "Mínimo 13 años")
    .max(120, "Edad máxima 120 años"),
  gender: yup.string().required("Selecciona un género"),
  interests: yup.array().of(yup.string()).nullable().default([]),
});

// 2. Deriva el tipo del esquema
type UserFormData = yup.InferType<typeof userSchema>;

export default function UserForm() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<UserFormData>({
    resolver: yupResolver(userSchema),
    defaultValues: {
      name: "",
      last_name: "",
      user_name: "",
      user_icon: imageUri,
      email: "",
      phone_number: "",
      age: 0,
      gender: "",
      interests: [],
    },
  });

  useEffect(() => {
    setValue("user_icon", imageUri);
  }, [imageUri, setValue]);

  const handleAgeChange = (text: string) => {
    const numericValue = text.replace(/[^0-9]/g, "");
    setValue("age", numericValue === "" ? 0 : Number(numericValue), {
      shouldValidate: true,
    });
  };

  const handleInterestsChange = (text: string) => {
    const interestsArray = text
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item !== "");
    setValue("interests", interestsArray, { shouldValidate: true });
  };

  const uploadImage = async (uri: string) => {
    try {
      setUploading(true);
  
      // Convertir la URI de archivo a Blob (compatible con Android)
      let blob;
      try {
        // Para Android necesitamos este enfoque especial
        const response = await fetch(uri);
        blob = await response.blob();
      } catch (fetchError) {
        console.error('Error al convertir imagen a blob:', fetchError);
        throw new Error('No se pudo procesar la imagen seleccionada');
      }
  
      // Generar nombre único para el archivo
      const fileName = `user_icons/${Date.now()}-${Math.floor(Math.random() * 1000)}.jpg`;
      
      // Subir a Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, blob, {
          contentType: 'image/jpeg',
          upsert: false
        });
  
      if (uploadError) throw uploadError;
  
      // Obtener URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);
  
      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error(
        error instanceof Error 
          ? error.message 
          : 'Error al subir la imagen. Verifica tu conexión.'
      );
    } finally {
      setUploading(false);
    }
  };

  const onSubmit: SubmitHandler<UserFormData> = async (formData) => {
    try {
      let finalImageUrl = formData.user_icon;
  
      if (formData.user_icon && !formData.user_icon.startsWith('http')) {
        try {
          finalImageUrl = await uploadImage(formData.user_icon);
        } catch (uploadError) {
          Alert.alert(
            'Error al subir imagen',
            'No se pudo subir la imagen de perfil. Por favor, inténtalo de nuevo.'
          );
          return;
        }
      }
  
      const userData = {
        ...formData,
        user_icon: finalImageUrl,
        verified: false,
        created_at: new Date().toISOString(),
      };
  
      const { data, error } = await supabase
        .from("User")
        .insert([userData])
        .select();
  
      if (error) throw error;
  
      Alert.alert("Éxito", "Usuario creado correctamente");
    } catch (error) {
      let errorMessage = "Error al guardar";
      
      if (error instanceof Error) {
        errorMessage = error.message.includes('bucket')
          ? "Error de configuración: El bucket de imágenes no existe"
          : error.message;
      }
  
      Alert.alert("Error", errorMessage);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View>
        <ImagePickerComponent 
        onImageSelected={setImageUri}
        uploadToSupabase={false} />
      </View>

      {/* Campo Nombre */}
      <View style={styles.inputContainer}>
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.input}
              placeholder="Nombre"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
        />
        {errors.name && (
          <Text style={styles.errorText}>{errors.name.message}</Text>
        )}
      </View>

      {/* Campo Apellido */}
      <View style={styles.inputContainer}>
        <Controller
          control={control}
          name="last_name"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.input}
              placeholder="Apellido"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
        />
        {errors.last_name && (
          <Text style={styles.errorText}>{errors.last_name.message}</Text>
        )}
      </View>

      {/* Campo Nombre de Usuario */}
      <View style={styles.inputContainer}>
        <Controller
          control={control}
          name="user_name"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.input}
              placeholder="Nombre de usuario"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
        />
        {errors.user_name && (
          <Text style={styles.errorText}>{errors.user_name.message}</Text>
        )}
      </View>

      {/* Campo Email */}
      <View style={styles.inputContainer}>
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.input}
              placeholder="Email"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          )}
        />
        {errors.email && (
          <Text style={styles.errorText}>{errors.email.message}</Text>
        )}
      </View>

      {/* Campo Teléfono */}
      <View style={styles.inputContainer}>
        <Controller
          control={control}
          name="phone_number"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.input}
              placeholder="Teléfono"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              keyboardType="phone-pad"
            />
          )}
        />
        {errors.phone_number && (
          <Text style={styles.errorText}>{errors.phone_number.message}</Text>
        )}
      </View>

      {/* Campo Edad */}
      <View style={styles.inputContainer}>
        <Controller
          control={control}
          name="age"
          render={({ field: { onBlur, value } }) => (
            <TextInput
              style={styles.input}
              placeholder="Edad"
              onBlur={onBlur}
              onChangeText={handleAgeChange}
              value={value !== null ? String(value) : ""}
              keyboardType="numeric"
            />
          )}
        />
        {errors.age && (
          <Text style={styles.errorText}>{errors.age.message}</Text>
        )}
      </View>

      {/* Campo Género */}
      <View style={styles.inputContainer}>
        <Controller
          control={control}
          name="gender"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.input}
              placeholder="Género"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
        />
        {errors.gender && (
          <Text style={styles.errorText}>{errors.gender.message}</Text>
        )}
      </View>

      {/* Campo Intereses */}
      <View style={styles.inputContainer}>
        <Controller
          control={control}
          name="interests"
          render={({ field: { value } }) => (
            <TextInput
              style={styles.input}
              placeholder="Intereses (separados por comas)"
              onChangeText={handleInterestsChange}
              value={value ? value.join(", ") : ""}
            />
          )}
        />
      </View>

      <Button
        title={isSubmitting || uploading ? "Guardando..." : "Guardar Usuario"}
        onPress={handleSubmit(onSubmit)}
        disabled={isSubmitting || uploading}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  inputContainer: {
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    padding: 10,
    fontSize: 16,
  },
  errorText: {
    color: "red",
    marginTop: 5,
    fontSize: 14,
  },
});
