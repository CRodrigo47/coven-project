import useGlobalStore from "@/context/useStore";
import { supabase } from "@/lib/supabase";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { Alert, Button, ScrollView, Text, TextInput, View } from "react-native";
import * as yup from "yup";
import * as Location from "expo-location";
import MapView, { LatLng, Marker, Region } from "react-native-maps";

const gatheringSchema = yup.object({
  name: yup.string().required("Gatherings must have a name"),
  location_name: yup.string().required("Gatherings must have a location"),
  date: yup.date().required("A date must be picked for the gathering"),
  time: yup
    .string()
    .required("An arrival time must be picked for the gathering"),
  transport: yup.string().nullable().default(null),
  cost: yup.number().nullable().default(0),
  meal: yup.string().nullable().default(null),
  extra_info: yup.string().nullable().default(null),
  description: yup.string().required("Gathering must have a description"),
  tags: yup.array().of(yup.string()).nullable().default([]),
  advertisement: yup.string().nullable().default(null),
});

type GatheringFormData = yup.InferType<typeof gatheringSchema>;

export default function CreateGatheringForm() {
  const [userId, setUserId] = useState<string | null>(null);
  const selectedCoven = useGlobalStore((state: any) => state.selectedCoven);
  const [coordinates, setCoordinates] = useState<LatLng>({
    latitude: 0,
    longitude: 0,
  });
  const [initialRegion, setInitialRegion] = useState<Region>();

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Permiso de ubicación denegado");
        return;
      }

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
      
    })();
  }, []);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<GatheringFormData>({
    resolver: yupResolver(gatheringSchema),
    defaultValues: {
      name: "",
      location_name: "",
      date: new Date(),
      time: "",
      transport: "",
      cost: 0,
      meal: "",
      extra_info: "",
      description: "",
      tags: [""],
      advertisement: "",
    },
  });

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          setUserId(user.id);
        }
      } catch (err) {
        console.error("Error al obtener ID del usuario:", err);
      }
    };

    fetchUserId();
  }, []);

  const onSubmit: SubmitHandler<GatheringFormData> = async (formData) => {
    try {
      if (!userId) {
        throw new Error("No se pudo obtener el ID del usuario");
      }

      const gatheringData = {
        ...formData,
        created_at: new Date().toISOString(),
        created_by: userId,
        coven_id: selectedCoven.id,
      };

      const { data, error } = await supabase
        .from("Gathering")
        .insert([gatheringData])
        .select();

      if (error) throw error;

      Alert.alert("Success", "Gathering created successfully");
    } catch (error) {
      let errorMessage = "Error inserting a gathering";

      Alert.alert("Error", errorMessage);
      console.error("Error detallado: ", error);
    }
  };

  console.log(coordinates)
  return (
    <ScrollView>
      <View>
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              placeholder="Gathering Title"
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
          name="location_name"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              placeholder="Gathering Location"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
        />
        {errors.location_name && <Text>{errors.location_name.message}</Text>}
      </View>
      <MapView
        region={initialRegion}
        style={{ height: 200, width: "100%" }}
        onPress={(e) => setCoordinates(e.nativeEvent.coordinate)}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        <Marker coordinate={coordinates} />
      </MapView>

      <Button
        title={isSubmitting ? "Guardando..." : "Crear Coven"}
        onPress={handleSubmit(onSubmit)}
        disabled={isSubmitting}
      />
    </ScrollView>
  );
}
