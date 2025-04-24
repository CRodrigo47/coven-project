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
  StyleSheet,
} from "react-native";
import * as yup from "yup";
import ImagePickerComponent from "../imagePicker";
import { COLORS } from "@/constants/COLORS";
import { FONTS } from "@/constants/FONTS";

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

  const onSubmit: SubmitHandler<CovenFormData> = async (formData) => {
    try {
      const covenData = {
        ...formData,
        created_at: new Date().toISOString(),
        created_by: userId,
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
    <ScrollView contentContainerStyle={styles.container}>
      {/* <View style={styles.section}>
        <Text style={styles.sectionTitle}>Imagen del Coven</Text>
        <ImagePickerComponent
          onImageSelected={setImageUri}
          uploadToSupabase={false}
        />
      </View> */}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Coven Information</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Coven's name*</Text>
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={styles.input}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
            )}
          />
          {errors.name && <Text style={styles.errorText}>{errors.name.message}</Text>}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description</Text>
          <Controller
            control={control}
            name="description"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[styles.input, styles.multilineInput]}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value !== null ? value : ""}
                multiline
                numberOfLines={4}
              />
            )}
          />
          {errors.description && <Text style={styles.errorText}>{errors.description.message}</Text>}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Privacy</Text>
        <View style={styles.switchContainer}>
          <Text style={styles.label}>Private / Public</Text>
          <Controller
            control={control}
            name="is_public"
            render={() => (
              <Switch 
                onValueChange={toggleSwitch} 
                value={isEnabled}
                trackColor={{ false: "#767577", true: COLORS.primaryDark }}
                thumbColor={isEnabled ? COLORS.primary : "#f4f3f4"}
              />
            )}
          />
        </View>
        <Text style={styles.hintText}>
          {isEnabled 
            ? "People can look for your Coven and ask you for an invitation." 
            : "Only invited members will join your Coven"}
        </Text>
      </View>

      {/* Botón de envío */}
      <View style={styles.submitButton}>
        <Button
          title={isSubmitting || uploading ? "Saving..." : "Create Coven"}
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting || uploading}
          color={COLORS.primary}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 30,
    backgroundColor: 'transparent',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#333',
    paddingBottom: 8,
    fontFamily: FONTS.semiBold
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    marginBottom: 8,
    fontSize: 16,
    color: '#444',
    fontFamily: FONTS.medium
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    fontFamily: FONTS.medium
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  errorText: {
    color: '#dc2626',
    marginTop: 5,
    fontSize: 14,
    fontFamily: FONTS.medium
  },
  hintText: {
    color: '#666',
    fontSize: 14,
    fontStyle: 'italic',
    fontFamily: FONTS.italic
  },
  submitButton: {
    marginTop: 20,
    borderRadius: 8,
    overflow: 'hidden',
  },
});