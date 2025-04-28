import useGlobalStore from "@/context/useStore";
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
  ActivityIndicator,
} from "react-native";
import * as yup from "yup";
// import ImagePickerComponent from "../imagePicker";
import { COLORS } from "@/constants/COLORS";
import { FONTS } from "@/constants/FONTS";
import { useRouter, useLocalSearchParams } from "expo-router";

const covenSchema = yup.object({
  name: yup.string().required("Coven name is required"),
  // coven_icon: yup.string().nullable().default(null),
  description: yup.string().nullable().default(""),
  is_public: yup.bool().default(false),
});

type CovenFormData = yup.InferType<typeof covenSchema>;

export default function CreateCovenForm() {
  const router = useRouter();
  const { from } = useLocalSearchParams();
  
  // const [imageUri, setImageUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [deletingCoven, setDeletingCoven] = useState(false);
  const authUserId = useGlobalStore((state: any) => state.authUserId);
  const fetchAuthUserId = useGlobalStore((state: any) => state.fetchAuthUserId);


  useEffect(() => {
    if (!authUserId) {
      fetchAuthUserId();
    }
  }, [authUserId, fetchAuthUserId]);
  
  // Get selected coven from global store - we'll still use it for the data
  // but we won't depend on it for determining the mode
  const selectedCoven = useGlobalStore((state: any) => state.selectedCoven);
  const setSelectedCoven = useGlobalStore((state: any) => state.setSelectedCoven);
  const resetSelections = useGlobalStore((state: any) => state.resetSelections)

  // Determine if we're in update mode based on the 'from' route parameter
  useEffect(() => {
    const isFromDetailPage = from === "/mainTabs/covenTabs/covenDetail";
    setIsUpdateMode(isFromDetailPage);
    
    // Only load data from selectedCoven when in update mode
    if (isFromDetailPage && selectedCoven) {
      setIsEnabled(selectedCoven.is_public || false);
      // setImageUri(selectedCoven.coven_icon || null);
    }
  }, [from, selectedCoven]);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    reset,
  } = useForm<CovenFormData>({
    resolver: yupResolver(covenSchema),
    defaultValues: {
      name: "",
      // coven_icon: imageUri,
      description: "",
      is_public: false,
    },
  });

  // Populate form when in update mode
  useEffect(() => {
    if (isUpdateMode && selectedCoven) {
      reset({
        name: selectedCoven.name || "",
        // coven_icon: selectedCoven.coven_icon || null,
        description: selectedCoven.description || "",
        is_public: selectedCoven.is_public || false,
      });
    }
  }, [isUpdateMode, selectedCoven, reset]);

  // useEffect(() => {
  //   setValue("coven_icon", imageUri);
  // }, [imageUri, setValue]);

  const toggleSwitch = () => {
    const newValue = !isEnabled;
    setIsEnabled(newValue);
    setValue("is_public", newValue);
  };

  const onSubmit: SubmitHandler<CovenFormData> = async (formData) => {
    try {

      if (!authUserId && !isUpdateMode) {
        throw new Error("Could not get user ID");
      }

      let data;
      let error;
      
      if (isUpdateMode && selectedCoven) {
        // Update existing coven
        const { data: updatedData, error: updateError } = await supabase
          .from("Coven")
          .update({
            ...formData,
            is_public: isEnabled,
          })
          .eq("id", selectedCoven.id)
          .select()
          .single();

        data = updatedData;
        error = updateError;

        if (!error) {
          Alert.alert("Success", "Coven updated successfully");
        }
      } else {
        // Create new coven
        const covenData = {
          ...formData,
          created_at: new Date().toISOString(),
          created_by: authUserId,
          is_public: isEnabled
        };

        const { data: newData, error: createError } = await supabase
          .from("Coven")
          .insert([covenData])
          .select()
          .single();

        data = newData;
        error = createError;

        if (!error) {
          // Insertar el usuario como miembro del nuevo Coven
          const { error: memberError } = await supabase
            .from("_Members_")
            .insert([
              { 
                user_id: authUserId, 
                coven_id: data.id
              }
            ]);

          if (memberError) throw memberError;

          Alert.alert("Success", "Coven created successfully");
        }
      }

      if (error) throw error;
      if (!data) throw new Error("No data returned from operation");

      setSelectedCoven(data);
      
      Alert.alert(
        "Success", 
        isUpdateMode ? "Coven updated successfully" : "Coven created successfully",
        [
          {
            text: "OK",
            onPress: () => {
              // Navegar solo después de que el usuario confirme la alerta
              if (isUpdateMode) {
                router.push("/mainTabs/covenTabs/covenDetail");
              } else {
                // Para crear un nuevo Coven, navegamos directamente al detalle después de un breve retraso
                setTimeout(() => {
                  router.replace("/mainTabs/covenTabs/covenDetail");
                }, 500);
              }
            }
          }
        ],
        { cancelable: false }
      );
    } catch (error) {
      let errorMessage = "Failed to save Coven";

      if (error instanceof Error) {
        errorMessage = error.message.includes('bucket')
          ? "Configuration error: Image bucket does not exist"
          : error.message;
      }

      Alert.alert("Error", errorMessage);
      console.error("Detailed error:", error);
    }
  };

  const handleDeleteCoven = async () => {
    if (!selectedCoven) return;
    
    // Show confirmation dialog
    Alert.alert(
      "Delete Coven",
      "Are you sure you want to delete this coven? This action cannot be undone.",
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
              setDeletingCoven(true);
              
              const { error } = await supabase
                .from("Coven")
                .delete()
                .eq("id", selectedCoven.id);
  
              if (error) throw error;
  
              // Limpiar completamente el estado global
              resetSelections(); // Usar la función resetSelections en lugar de solo setSelectedCoven(null)
              
              Alert.alert(
                "Success", 
                "Coven deleted successfully",
                [
                  {
                    text: "OK",
                    onPress: () => {
                      // Importante: necesitamos asegurarnos de que la navegación se resetea correctamente
                      router.navigate("/mainTabs/covenTabs/");
                    }
                  }
                ],
                { cancelable: false }
              );
            } catch (error) {
              let errorMessage = "Failed to delete Coven";
              
              if (error instanceof Error) {
                errorMessage = error.message;
              }
              
              Alert.alert("Error", errorMessage);
              console.error("Detailed error:", error);
            } finally {
              setDeletingCoven(false);
            }
          }
        }
      ]
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.formTitle}>
          {isUpdateMode ? "Update Coven" : "Create Coven"}
        </Text>
      </View>

      {/* <View style={styles.section}>
        <Text style={styles.sectionTitle}>Coven Image</Text>
        <ImagePickerComponent
          onImageSelected={setImageUri}
          uploadToSupabase={false}
          initialImage={imageUri}
        />
      </View> */}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Coven Information</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Coven Name*</Text>
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={styles.input}
                placeholder="Enter coven name"
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
                placeholder="Enter coven description"
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
        <Text style={styles.sectionTitle}>Privacy Settings</Text>
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

      <View style={styles.submitButton}>
        {isSubmitting || uploading ? (
          <ActivityIndicator size="small" color={COLORS.primary} />
        ) : (
          <Button
            title={isUpdateMode ? "Update Coven" : "Create Coven"}
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting || uploading}
            color={COLORS.primary}
          />
        )}
      </View>
      
      {isUpdateMode && (
        <View style={styles.deleteButton}>
          {deletingCoven ? (
            <ActivityIndicator size="small" color={COLORS.danger} />
          ) : (
            <Button
              title="Delete Coven"
              onPress={handleDeleteCoven}
              disabled={deletingCoven}
              color={COLORS.danger}
            />
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  headerContainer: {
    marginBottom: 20,
    alignItems: "center",
  },
  formTitle: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
  },
  section: {
    marginBottom: 25,
    backgroundColor: 'transparent',
  },
  sectionTitle: {
    fontSize: 18,
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
  deleteButton: {
    marginTop: 10,
    borderRadius: 8,
    overflow: 'hidden',
  }
});