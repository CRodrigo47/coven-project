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
import { useRouter } from "expo-router";

const gatheringSchema = yup.object({
  name: yup.string().required("Gathering name is required"),
  location_name: yup.string().required("Location name is required"),
  date: yup
    .date()
    .required("Date is required")
    .typeError("Please enter a valid date in YYYY-MM-DD format"),
  time: yup
    .string()
    .matches(
      /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
      "Please enter a valid time (HH:MM)"
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
  const [userId, setUserId] = useState<string | null>(null);
  const selectedCoven = useGlobalStore((state: any) => state.selectedCoven);
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

  useEffect(() => {
    const checkCovenPublicStatus = async () => {
      if (!selectedCoven?.id) return;

      try {
        const { data, error } = await supabase
          .from("Coven")
          .select("is_public")
          .eq("id", selectedCoven.id)
          .single();

        if (error) throw error;
        setIsPublicCoven(data?.is_public || false);
      } catch (error) {
        console.error("Error checking coven status:", error);
      }
    };

    checkCovenPublicStatus();
  }, [selectedCoven]);

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Permission denied", "Location permission is required");
          return;
        }

        setLoadingLocation(true);
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
      } catch (error) {
        console.error("Location error:", error);
        Alert.alert("Error", "Could not get your location");
      } finally {
        setLoadingLocation(false);
      }
    })();
  }, []);

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) setUserId(user.id);
      } catch (err) {
        console.error("Error getting user ID:", err);
      }
    };
    fetchUserId();
  }, []);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    trigger,
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
      if (!userId) throw new Error("Could not get user ID");
      if (!coordinates) throw new Error("Location not selected");

      const formattedDate = new Date(formData.date).toISOString();

      const gatheringData = {
        ...formData,
        date: formattedDate,
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        created_at: new Date().toISOString(),
        created_by: userId,
        coven_id: selectedCoven.id,
      };

      const { data, error } = await supabase
        .from("Gathering")
        .insert([gatheringData])
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error("No data returned from insert");

      setSelectedGathering(data);

      router.push("/mainTabs/covenTabs/gatheringDetail");

      Alert.alert("Success", "Gathering created successfully");
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to create gathering");
      console.error("Error:", error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
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
        <Text style={styles.label}>Date* (YYYY-MM-DD)</Text>
        <Controller
          control={control}
          name="date"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              value={dateInput}
              onChangeText={(text) => {
                setDateInput(text);
                // Basic auto-formatting
                if (text.length === 4 && !text.includes("-")) {
                  setDateInput(text + "-");
                } else if (text.length === 7 && text.split("-").length === 2) {
                  setDateInput(text + "-");
                }
              }}
              onBlur={() => {
                const date = new Date(dateInput);
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
        <Text style={styles.label}>Transportation</Text>
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
            title="Create Gathering"
            onPress={handleSubmit(onSubmit)}
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
    padding: 16,
    paddingBottom: 30,
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
    overflow: 'hidden',
    marginVertical: 12,
    borderWidth: 1
  },
  map: {
    width: '100%',
    height: '100%',
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
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
});
