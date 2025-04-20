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
import ImagePickerComponent from "./imagePicker";

const registerSchema = yup.object({
  email: yup
    .string()
    .email("El email no es válido")
    .required("El email es obligatorio"),
  password: yup
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .required("La contraseña es obligatoria"),
  name: yup.string().required("El nombre es obligatorio"),
  last_name: yup.string().required("El apellido es obligatorio"),
  user_name: yup
    .string()
    .required("El nombre de usuario es obligatorio")
    .min(3, "Mínimo 3 caracteres"),
  user_icon: yup.string().nullable().default(null),
  phone_number: yup
    .string()
    .matches(/^[0-9]+$/, "Solo números")
    .min(8, "Mínimo 8 dígitos")
    .default(""),
  age: yup
    .number()
    .transform((value) => (isNaN(value) ? null : value))
    .nullable()
    .required("La edad es obligatoria")
    .min(13, "Mínimo 13 años")
    .max(120, "Edad máxima 120 años"),
  interests: yup.array().of(yup.string()).nullable().default([]),
});

type RegisterFormData = yup.InferType<typeof registerSchema>;

export default function RegisterForm() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
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
      interests: [],
    },
  });

  //LA URI PARECE QUE ESTA PILLANDO LA URL QUE SUBE, NO LA DEL STORAGE, Y CREO QUE NECESITA LA DEL STORAGE.

  const uploadImage = async (uri: string, userId: string) => {
    try {
      // 1. Obtener el blob de la imagen
      let blob;
      if (uri.startsWith('file://') || uri.startsWith('content://')) {
        // Para URIs de archivos locales (React Native)
        const response = await fetch(uri);
        blob = await response.blob();
      } else if (uri.startsWith('data:')) {
        // Para base64
        const response = await fetch(uri);
        blob = await response.blob();
      } else {
        throw new Error('Formato de imagen no soportado');
      }
  
      // 2. Determinar extensión del archivo
      const fileExt = uri.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `user_avatars/${userId}/avatar.${fileExt}`;
      const mimeType = `image/${fileExt === 'png' ? 'png' : 'jpeg'}`;
  
      // 3. Subir a Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, blob, {
          contentType: mimeType,
          upsert: true,
          cacheControl: '3600'
        });
  
      if (uploadError) throw uploadError;
  
      // 4. Obtener URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);
  
      if (!publicUrl) throw new Error('No se pudo obtener URL pública');
  
      // 5. Actualizar usuario con la nueva URL
      const { error: updateError } = await supabase
        .from('User')
        .update({ user_icon: publicUrl })
        .eq('id', userId);
  
      if (updateError) throw updateError;
  
      return publicUrl;
    } catch (error) {
      console.log('Error en uploadImage:', error);
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
    const interestsArray = text
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item !== "");
    setValue("interests", interestsArray, { shouldValidate: true });
  };

  const handleRegister = async (formData: RegisterFormData) => {
    try {
      setLoading(true);
      
      // 1. Verificar unicidad del nombre de usuario
      const { data: usernameCheck } = await supabase
        .from('User')
        .select('user_name')
        .eq('user_name', formData.user_name)
        .maybeSingle();
  
      if (usernameCheck) {
        throw new Error('Este nombre de usuario ya está en uso');
      }
  
      // 2. Registrar en auth.users
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            last_name: formData.last_name,
            user_name: formData.user_name
          }
        }
      });
  
      if (authError) {
        if (authError.message.includes('User already registered')) {
          return handleExistingUser(formData);
        }
        throw authError;
      }
  
      if (!authData.user) throw new Error('No se pudo crear el usuario');
  
      // 3. Esperar 2 segundos para que la sesión se establezca
      await new Promise(resolve => setTimeout(resolve, 2000));
  
      // 4. Verificar si tenemos sesión
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.warn("Sesión no disponible aún, pero continuamos el proceso");
        // No lanzamos error aquí, continuamos igual
      }

      let userIconUrl = null;
      if (imageUri && authData.user.id) {
        try {
          userIconUrl = await uploadImage(imageUri, authData.user.id);
        } catch (uploadError) {
          // console.warn("Error subiendo imagen:", uploadError);                     //COMENTADO POR PROBLEMAS EN ANDROID
          // Continuamos sin imagen si falla
        }
      }
  
      // 5. Crear registro en la tabla User
      const { error: userError } = await supabase
        .from('User')
        .upsert({
          id: authData.user.id,
          email: formData.email,
          name: formData.name,
          last_name: formData.last_name,
          user_name: formData.user_name,
          user_icon: userIconUrl,
          phone_number: formData.phone_number,
          age: formData.age,
          interests: formData.interests,
        });
  
      // if (userError) {
      //   console.error("Error al crear usuario en tabla User:", userError);                                     //COMENTADO POR PROBLEMAS EN ANDROID
      //   // No lanzamos error aquí para no interrumpir el flujo de verificación
      // }
  
  
      setEmailSent(true);
      
    } catch (error) {
      console.error('Error completo:', error);
      // Mostramos error solo si no es el flujo normal de verificación
      if (!error.message.includes('Email not confirmed')) {
        Alert.alert(
          'Error',
          error instanceof Error ? error.message : 'Error desconocido al registrar'
        );
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handleExistingUser = async (formData: RegisterFormData) => {
    try {
      // 1. Intentar autenticar
      const { data: { user }, error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      });
  
      if (signInError) throw signInError;
      if (!user) throw new Error('Usuario no encontrado');
  
      // 2. Actualizar datos del usuario
      const updates = {
        name: formData.name,
        last_name: formData.last_name,
        user_name: formData.user_name,
        user_icon: formData.user_icon,
        phone_number: formData.phone_number,
        age: formData.age,
        interests: formData.interests,
        updated_at: new Date().toISOString()
      };
  
      // 3. Subir imagen si existe
      if (imageUri) {
        try {
          updates.user_icon = await uploadImage(imageUri, user.id);
        } catch (uploadError) {
          console.warn("No se pudo subir la imagen:", uploadError);
        }
      }
  
      // 4. Aplicar actualizaciones
      const { error: updateError } = await supabase
        .from('User')
        .update(updates)
        .eq('id', user.id);
  
      if (updateError) throw updateError;

      
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error al actualizar usuario existente');
    }
  };

  if (emailSent) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Verifica tu email</Text>
        <Text style={styles.message}>
          Hemos enviado un enlace de confirmación a tu correo electrónico. Por
          favor revisa tu bandeja de entrada y haz clic en el enlace para
          activar tu cuenta.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ImagePickerComponent
        onImageSelected={setImageUri}
        uploadToSupabase={false}
      />

      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="Email"
            autoCapitalize="none"
            keyboardType="email-address"
            value={value}
            onBlur={onBlur}
            onChangeText={onChange}
          />
        )}
      />
      {errors.email && <Text style={styles.error}>{errors.email.message}</Text>}

      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            secureTextEntry
            value={value}
            onBlur={onBlur}
            onChangeText={onChange}
          />
        )}
      />
      {errors.password && (
        <Text style={styles.error}>{errors.password.message}</Text>
      )}

      <Controller
        control={control}
        name="name"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="Nombre"
            value={value}
            onBlur={onBlur}
            onChangeText={onChange}
          />
        )}
      />
      {errors.name && <Text style={styles.error}>{errors.name.message}</Text>}

      <Controller
        control={control}
        name="last_name"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="Apellido"
            value={value}
            onBlur={onBlur}
            onChangeText={onChange}
          />
        )}
      />
      {errors.last_name && (
        <Text style={styles.error}>{errors.last_name.message}</Text>
      )}

      <Controller
        control={control}
        name="user_name"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="Nombre de usuario"
            autoCapitalize="none"
            value={value}
            onBlur={onBlur}
            onChangeText={onChange}
          />
        )}
      />
      {errors.user_name && (
        <Text style={styles.error}>{errors.user_name.message}</Text>
      )}

      <Controller
        control={control}
        name="phone_number"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="Teléfono"
            keyboardType="phone-pad"
            value={value}
            onBlur={onBlur}
            onChangeText={onChange}
          />
        )}
      />
      {errors.phone_number && (
        <Text style={styles.error}>{errors.phone_number.message}</Text>
      )}

      <Controller
        control={control}
        name="age"
        render={({ field: { value, onBlur } }) => (
          <TextInput
            style={styles.input}
            placeholder="Edad"
            keyboardType="numeric"
            value={value ? String(value) : ""}
            onBlur={onBlur}
            onChangeText={handleAgeChange}
          />
        )}
      />
      {errors.age && <Text style={styles.error}>{errors.age.message}</Text>}

      <Controller
        control={control}
        name="interests"
        render={({ field: { value } }) => (
          <TextInput
            style={styles.input}
            placeholder="Intereses (separados por comas)"
            value={value ? value.join(", ") : ""}
            onChangeText={handleInterestsChange}
          />
        )}
      />

      {loading ? (
        <ActivityIndicator size="large" style={styles.loader} />
      ) : (
        <Button
          title="Registrarse"
          onPress={handleSubmit(handleRegister)}
          disabled={loading}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  error: {
    color: "red",
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  message: {
    textAlign: "center",
    paddingHorizontal: 20,
  },
  loader: {
    marginVertical: 20,
  },
});
