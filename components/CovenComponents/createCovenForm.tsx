import { supabase } from "@/lib/supabase";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import {
  Alert,
  Button,
  ScrollView,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import * as yup from "yup";
import ImagePickerComponent from "../imagePicker";

const covenSchema = yup.object({
  name: yup.string().required("El nombre del Coven es obligatorio"),
  coven_icon: yup.string().nullable().default(null),
  description: yup.string().nullable().default(""),
  is_public: yup.bool().default(false),
});

type CovenFormData = yup.InferType<typeof covenSchema>;

export default function CreateCovenForm() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const toggleSwitch = () => setIsEnabled((previousState) => !previousState);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<CovenFormData>({
    resolver: yupResolver(covenSchema),
    defaultValues: {
      name: "",
      coven_icon: imageUri,
      description: "",
      is_public: false,
    },
  });

  // Obtener el ID del usuario autenticado
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserId(user.id);
        }
      } catch (err) {
        console.error("Error al obtener ID del usuario:", err);
      }
    };

    fetchUserId();
  }, []);

  useEffect(() => {
    setValue("coven_icon", imageUri);
  }, [imageUri, setValue]);

  const uploadImage = async (uri: string) => {
    try {
      setUploading(true);

      let blob;
      try {
        const response = await fetch(uri);
        blob = await response.blob();
      } catch (fetchError) {
        console.error("Error al convertir imagen a blob: ", fetchError);
        throw new Error("No se pudo procesar la imagen seleccionada");
      }

      const fileName =
        "coven_icons/" +
        (Date.now() - Math.floor(Math.random() * 1000)) +
        ".jpg";

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, blob, {
          contentType: "image/jpeg",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error("Error uploading image: ", error);
      throw new Error(
        error instanceof Error
          ? error.message
          : "Error al subir la imagen. Verifica tu conexión."
      );
    } finally {
      setUploading(false);
    }
  };

  const onSubmit: SubmitHandler<CovenFormData> = async (formData) => {
    try {
      // if (!userId) {
      //   throw new Error("No se pudo obtener el ID del usuario");
      // }

      // let finalImageUrl = formData.coven_icon;

      // if (formData.coven_icon && !formData.coven_icon.startsWith('http')) {
      //   try {
      //     finalImageUrl = await uploadImage(formData.coven_icon);
      //   } catch (uploadError) {
      //     Alert.alert(
      //       'Error al subir imagen',
      //       'No se pudo subir la imagen de perfil. Por favor, inténtalo de nuevo'
      //     );
      //     return;
      //   }
      // }

      const covenData = {
        ...formData,
        // coven_icon: finalImageUrl,
        created_at: new Date().toISOString(),
        created_by: userId, // Usamos directamente el UUID del usuario
        is_public: isEnabled
      };

      const { data, error } = await supabase
        .from("Coven")
        .insert([covenData])
        .select();

      if (error) throw error;

      Alert.alert("Éxito", "Coven creado correctamente");
    } catch (error) {
      let errorMessage = "Error al guardar el Coven";

      if (error instanceof Error) {
        errorMessage = error.message.includes('bucket')
          ? "Error de configuración: El bucket de imágenes no existe"
          : error.message;
      }

      Alert.alert("Error", errorMessage);
      console.error("Error detallado:", error);
    }
  };

  return (
    <ScrollView>
      <View>
        <ImagePickerComponent
          onImageSelected={setImageUri}
          uploadToSupabase={false}
        />
      </View>

      <View>
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              placeholder="Coven Name"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
        />
        {errors.name && <Text>{errors.name.message}</Text>}
      </View>

      <View>
        <Controller
          control={control}
          name="description"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              placeholder="Description"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value !== null ? value : ""}
            />
          )}
        />
        {errors.description && <Text>{errors.description.message}</Text>}
      </View>

      <View>
        <Controller
          control={control}
          name="is_public"
          render={() => (
            <>
              <Text>Private - Public</Text>
              <Switch onValueChange={toggleSwitch} value={isEnabled} />
            </>
          )}
        />
        {errors.name && <Text>{errors.name.message}</Text>}
      </View>

      <Button
        title={isSubmitting || uploading ? "Guardando..." : "Crear Coven"}
        onPress={handleSubmit(onSubmit)}
        disabled={isSubmitting || uploading}
      />
    </ScrollView>
  );
}