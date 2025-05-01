import useGlobalStore from "@/context/useStore";
import { supabase } from "@/lib/supabase";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import {
  Alert,
  Button,
  ScrollView,
  Text,
  TextInput,
  View,
  StyleSheet,
  ActivityIndicator,
  Switch,
} from "react-native";
import * as yup from "yup";
import * as Location from "expo-location";
import MapView, { LatLng, Marker, Region } from "react-native-maps";
import { COLORS } from "@/constants/COLORS";
import { FONTS } from "@/constants/FONTS";
import { usePathname, useRouter } from "expo-router";

// Función auxiliar para convertir fecha de formato DD-MM-YYYY a formato YYYY-MM-DD
const convertToISODate = (spanishDate) => {
  if (!spanishDate || spanishDate.trim() === '') return null;
  
  const parts = spanishDate.split('-');
  if (parts.length !== 3) return null;
  
  const day = parts[0].padStart(2, '0');
  const month = parts[1].padStart(2, '0');
  const year = parts[2];
  
  return `${year}-${month}-${day}`;
};

// Función auxiliar para convertir fecha de formato YYYY-MM-DD a formato DD-MM-YYYY
const convertToSpanishFormat = (isoDate) => {
  if (!isoDate) return '';
  
  const date = new Date(isoDate);
  if (isNaN(date.getTime())) return '';
  
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  
  return `${day}-${month}-${year}`;
};

const gatheringSchema = yup.object({
  name: yup.string().required("Gathering name is required"),
  location_name: yup.string().required("Location name is required"),
  date: yup
    .date()
    .required("Date is required")
    .typeError("Please enter a valid date in DD-MM-YYYY format"),
  time: yup
  .string()
  .matches(
    /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/, // Solo HH:MM (00:00 a 23:59)
    "Please enter a valid time in HH:MM format (e.g., 14:30)"
  )
  .required("Time is required"),
  transport: yup.string().nullable().default(null),
  cost: yup.number().nullable().default(0),
  meal: yup.string().nullable().default(null),
  extra_info: yup.string().nullable().default(null),
  description: yup.string().required("Description is required"),
  tags: yup.array().of(yup.string()).nullable().default([]),
  advertisement: yup.string().nullable().default(null),
});

type GatheringFormData = yup.InferType<typeof gatheringSchema>;

export default function CreateGatheringForm() {
  const router = useRouter();
  const pathname = usePathname();
  const selectedCoven = useGlobalStore((state: any) => state.selectedCoven);
  const selectedGathering = useGlobalStore(
    (state: any) => state.selectedGathering
  );
  const setSelectedGathering = useGlobalStore(
    (state: any) => state.setSelectedGathering
  );
  const [coordinates, setCoordinates] = useState<LatLng>({
    latitude: 0,
    longitude: 0,
  });
  const [initialRegion, setInitialRegion] = useState<Region>();
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [hasCost, setHasCost] = useState(false);
  const [hasMeal, setHasMeal] = useState(false);
  const [hasExtraInfo, setHasExtraInfo] = useState(false);
  const [isPublicCoven, setIsPublicCoven] = useState(false);
  const [tagsText, setTagsText] = useState("");
  const [dateInput, setDateInput] = useState("");
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [covenId, setCovenId] = useState<string | null>(null);
  const [deletingGathering, setDeletingGathering] = useState(false);
  const authUserId = useGlobalStore((state: any) => state.authUserId);
  const fetchAuthUserId = useGlobalStore((state: any) => state.fetchAuthUserId);


  useEffect(() => {
    if (!authUserId) {
      fetchAuthUserId();
    }
  }, [authUserId, fetchAuthUserId]);

  // Determine if we're in update mode
  useEffect(() => {
    if (selectedGathering) {
      setIsUpdateMode(true);
      setCovenId(selectedGathering.coven_id);
    } else if (selectedCoven) {
      setCovenId(selectedCoven.id);
    }
  }, [selectedGathering, selectedCoven]);

  useEffect(() => {
    const checkCovenPublicStatus = async () => {
      if (!covenId) return;

      try {
        const { data, error } = await supabase
          .from("Coven")
          .select("is_public")
          .eq("id", covenId)
          .single();

        if (error) throw error;
        setIsPublicCoven(data?.is_public || false);
      } catch (error) {
        console.error("Error checking coven status:", error);
      }
    };

    checkCovenPublicStatus();
  }, [covenId]);

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Permission denied", "Location permission is required");
          return;
        }

        setLoadingLocation(true);

        // If we have a selected gathering, use its coordinates
        if (selectedGathering) {
          const gatheringCoords = {
            latitude: selectedGathering.latitude,
            longitude: selectedGathering.longitude,
          };

          setCoordinates(gatheringCoords);
          setInitialRegion({
            ...gatheringCoords,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          });
        } else {
          // Otherwise, use current location
          let location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
          });

          const userCoords = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          };

          setCoordinates(userCoords);
          setInitialRegion({
            ...userCoords,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          });
        }
      } catch (error) {
        console.error("Location error:", error);
        Alert.alert("Error", "Could not get your location");
      } finally {
        setLoadingLocation(false);
      }
    })();
  }, [selectedGathering]);


  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    trigger,
    reset,
  } = useForm<GatheringFormData>({
    resolver: yupResolver(gatheringSchema),
    defaultValues: {
      name: "",
      location_name: "",
      date: new Date(),
      time: "",
      transport: null,
      cost: null,
      meal: null,
      extra_info: null,
      description: "",
      tags: [],
      advertisement: null,
    },
  });

  // Populate form when in update mode
  useEffect(() => {
    if (selectedGathering) {
      // Format date from ISO string to Date object
      const gatheringDate = new Date(selectedGathering.date);
      
      // Convertir a formato español DD-MM-AAAA
      const spanishDateFormat = convertToSpanishFormat(selectedGathering.date);
      setDateInput(spanishDateFormat);

      // Extract time from the timestamp or use the time field if available
      let timeString = selectedGathering.time;
      if (!timeString && selectedGathering.date) {
        const date = new Date(selectedGathering.date);
        timeString = `${String(date.getHours()).padStart(2, "0")}:${String(
          date.getMinutes()
        ).padStart(2, "0")}`;
      } else if (timeString) {
        // Si timeString existe pero incluye segundos o zona horaria
        // Extrae solo horas y minutos
        timeString = timeString.split(":").slice(0, 2).join(":");
      }

      // Set form values
      reset({
        name: selectedGathering.name || "",
        location_name: selectedGathering.location_name || "",
        date: gatheringDate,
        time: timeString || "",
        transport: selectedGathering.transport || null,
        cost: selectedGathering.cost || null,
        meal: selectedGathering.meal || null,
        extra_info: selectedGathering.extra_info || null,
        description: selectedGathering.description || "",
        tags: selectedGathering.tags || [],
        advertisement: selectedGathering.advertisement || null,
      });

      // Set switch states
      setHasCost(!!selectedGathering.cost);
      setHasMeal(!!selectedGathering.meal);
      setHasExtraInfo(!!selectedGathering.extra_info);

      // Set tags text
      setTagsText(
        selectedGathering.tags ? selectedGathering.tags.join(", ") : ""
      );
    }
  }, [selectedGathering, reset]);

  const handleTagsChange = (text: string) => {
    setTagsText(text);
    const tagsArray = text
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item !== "");
    setValue("tags", tagsArray, { shouldValidate: true });
  };

  const onSubmit: SubmitHandler<GatheringFormData> = async (formData) => {
    try {
      if (!authUserId) throw new Error("Could not get user ID");
      if (!coordinates) throw new Error("Location not selected");
      if (!covenId) throw new Error("No coven selected");

      const formattedDate = new Date(formData.date).toISOString();
      const formattedTime = formData.time.split(':').slice(0, 2).join(':');

      const gatheringData = {
        ...formData,
        time: formattedTime,
        date: formattedDate,
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        coven_id: covenId,
      };

      let data;
      let error;

      if (isUpdateMode && selectedGathering) {
        // Update existing gathering
        const { data: updatedData, error: updateError } = await supabase
          .from("Gathering")
          .update(gatheringData)
          .eq("id", selectedGathering.id)
          .select()
          .single();

        data = updatedData;
        error = updateError;

        if (!error) {
          Alert.alert("Success", "Gathering updated successfully");
        }
      } else {
        // Create new gathering
        const { data: newData, error: createError } = await supabase
          .from("Gathering")
          .insert([
            {
              ...gatheringData,
              created_at: new Date().toISOString(),
              created_by: authUserId,
            },
          ])
          .select()
          .single();

        data = newData;
        error = createError;

        if (!error) {
          Alert.alert("Success", "Gathering created successfully");
        }
      }

      if (error) throw error;
      if (!data) throw new Error("No data returned from operation");

      setSelectedGathering(data);
      
      if (pathname.includes("/mainTabs/gatheringTabs")){
        router.push("/mainTabs/gatheringTabs/gatheringDetail")
      }else{
        router.push("/mainTabs/covenTabs/gatheringDetail");
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to save gathering");
      console.error("Error:", error);
    }
  };

  const handleDeleteGathering = async () => {
    if (!selectedGathering) return;

    // Show confirmation dialog
    Alert.alert(
      "Delete Gathering",
      "Are you sure you want to delete this gathering? This action cannot be undone.",
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
              setDeletingGathering(true);
              
              const { error } = await supabase
                .from("Gathering")
                .delete()
                .eq("id", selectedGathering.id);


              if (error) throw error;
              Alert.alert("Success", "Gathering deleted successfully");
              router.push("/mainTabs/covenTabs");
            } catch (error) {
              let errorMessage = "Failed to delete Gathering";
              
              if (error instanceof Error) {
                errorMessage = error.message;
              }
              
              Alert.alert("Error", errorMessage);
              console.error("Detailed error:", error);
            } finally {
              setDeletingGathering(false);
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
          {isUpdateMode ? "Update Gathering" : "Create Gathering"}
        </Text>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Gathering Name*</Text>
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.input}
              placeholder="Enter gathering name"
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

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Location Name*</Text>
        <Controller
          control={control}
          name="location_name"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.input}
              placeholder="Enter location name"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
        />
        {errors.location_name && (
          <Text style={styles.errorText}>{errors.location_name.message}</Text>
        )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Select Location on Map*</Text>
        {loadingLocation ? (
          <ActivityIndicator
            size="small"
            color={COLORS.primary}
            style={styles.mapLoading}
          />
        ) : (
          <View style={styles.mapContainer}>
            <MapView
              region={initialRegion}
              style={styles.map}
              onPress={(e) => setCoordinates(e.nativeEvent.coordinate)}
              showsUserLocation={true}
              showsMyLocationButton={true}
            >
              <Marker coordinate={coordinates} />
            </MapView>
          </View>
        )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Description*</Text>
        <Controller
          control={control}
          name="description"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[styles.input, styles.multilineInput]}
              placeholder="Enter gathering description"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              multiline
              numberOfLines={4}
            />
          )}
        />
        {errors.description && (
          <Text style={styles.errorText}>{errors.description.message}</Text>
        )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Date* (DD-MM-YYYY)</Text>
        <Controller
          control={control}
          name="date"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.input}
              placeholder="DD-MM-YYYY"
              value={dateInput}
              onChangeText={(text) => {
                setDateInput(text);
                // Auto-formato para estilo español DD-MM-AAAA
                if (text.length === 2 && !text.includes("-")) {
                  setDateInput(text + "-");
                } else if (text.length === 5 && text.split("-").length === 2) {
                  setDateInput(text + "-");
                }
              }}
              onBlur={() => {
                // Convertir del formato español al formato ISO para la validación
                const isoDate = convertToISODate(dateInput);
                const date = isoDate ? new Date(isoDate) : new Date("invalid");
                
                if (!isNaN(date.getTime())) {
                  setValue("date", date, { shouldValidate: true });
                } else {
                  setValue("date", new Date("invalid"), {
                    shouldValidate: true,
                  });
                }
                trigger("date");
                onBlur();
              }}
              keyboardType="numbers-and-punctuation"
            />
          )}
        />
        {errors.date && (
          <Text style={styles.errorText}>{errors.date.message}</Text>
        )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Time* (HH:MM)</Text>
        <Controller
          control={control}
          name="time"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.input}
              placeholder="HH:MM"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              keyboardType="numbers-and-punctuation"
            />
          )}
        />
        {errors.time && (
          <Text style={styles.errorText}>{errors.time.message}</Text>
        )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Transport</Text>
        <Controller
          control={control}
          name="transport"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.input}
              placeholder="Transport details (optional)"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value || ""}
            />
          )}
        />
      </View>

      <View style={styles.inputGroup}>
        <View style={styles.switchContainer}>
          <Text style={styles.label}>Will there be any costs?</Text>
          <Switch
            value={hasCost}
            onValueChange={(value) => {
              setHasCost(value);
              if (!value) setValue("cost", null);
            }}
            trackColor={{ false: "#767577", true: COLORS.primary }}
            thumbColor={hasCost ? COLORS.primary : "#f4f3f4"}
          />
        </View>
        {hasCost && (
          <Controller
            control={control}
            name="cost"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={styles.input}
                placeholder="Estimated cost"
                keyboardType="numeric"
                onBlur={onBlur}
                onChangeText={(text) => {
                  const num = parseFloat(text) || 0;
                  onChange(num);
                }}
                value={value ? value.toString() : ""}
              />
            )}
          />
        )}
      </View>

      <View style={styles.inputGroup}>
        <View style={styles.switchContainer}>
          <Text style={styles.label}>Will there be food?</Text>
          <Switch
            value={hasMeal}
            onValueChange={(value) => {
              setHasMeal(value);
              if (!value) setValue("meal", null);
            }}
            trackColor={{ false: "#767577", true: COLORS.primary }}
            thumbColor={hasMeal ? COLORS.primary : "#f4f3f4"}
          />
        </View>
        {hasMeal && (
          <Controller
            control={control}
            name="meal"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={styles.input}
                placeholder="Meal details"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value || ""}
              />
            )}
          />
        )}
      </View>

      <View style={styles.inputGroup}>
        <View style={styles.switchContainer}>
          <Text style={styles.label}>Additional information?</Text>
          <Switch
            value={hasExtraInfo}
            onValueChange={(value) => {
              setHasExtraInfo(value);
              if (!value) setValue("extra_info", null);
            }}
            trackColor={{ false: "#767577", true: COLORS.primary }}
            thumbColor={hasExtraInfo ? COLORS.primary : "#f4f3f4"}
          />
        </View>
        {hasExtraInfo && (
          <Controller
            control={control}
            name="extra_info"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[styles.input, styles.multilineInput]}
                placeholder="Any extra details"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value || ""}
                multiline
                numberOfLines={3}
              />
            )}
          />
        )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Tags</Text>
        <Controller
          control={control}
          name="tags"
          render={({ field: { onBlur } }) => (
            <TextInput
              style={[styles.input, styles.multilineInput]}
              placeholder="Separate with commas (e.g., hiking, picnic, nature)"
              onBlur={onBlur}
              onChangeText={handleTagsChange}
              value={tagsText}
              multiline
              numberOfLines={2}
            />
          )}
        />
      </View>

      {isPublicCoven && (
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Advertisement (optional)</Text>
          <Controller
            control={control}
            name="advertisement"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[styles.input, styles.multilineInput]}
                placeholder="Promotional message for public listing"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value || ""}
                multiline
                numberOfLines={3}
              />
            )}
          />
        </View>
      )}

      <View style={styles.submitButton}>
        {isSubmitting ? (
          <ActivityIndicator size="small" color={COLORS.primary} />
        ) : (
          <Button
            title={isUpdateMode ? "Update Gathering" : "Create Gathering"}
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            color={COLORS.primary}
          />
        )}
      </View>
      
      {isUpdateMode && (
        <View style={styles.deleteButton}>
          {deletingGathering ? (
            <ActivityIndicator size="small" color={COLORS.danger} />
          ) : (
            <Button
              title="Delete Gathering"
              onPress={handleDeleteGathering}
              disabled={deletingGathering}
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
    padding: 16,
    paddingBottom: 30,
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
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    fontSize: 14,
    color: "#444",
    fontFamily: FONTS.medium,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: "#fff",
    fontFamily: FONTS.medium,
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  mapContainer: {
    height: 200,
    borderRadius: 8,
    overflow: "hidden",
    marginVertical: 12,
    borderWidth: 1,
  },
  map: {
    width: "100%",
    height: "100%",
  },
  mapLoading: {
    height: 200,
    justifyContent: "center",
  },
  errorText: {
    color: "#dc2626",
    marginTop: 4,
    fontSize: 12,
    fontFamily: FONTS.medium,
  },
  submitButton: {
    marginTop: 16,
    borderRadius: 8,
    overflow: "hidden",
  },
  deleteButton: {
    marginTop: 10,
    borderRadius: 8,
    overflow: "hidden",
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
});