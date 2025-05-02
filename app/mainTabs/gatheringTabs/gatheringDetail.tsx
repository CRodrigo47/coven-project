import { GuestWithUserIcon } from "@/app/interfaces/guestInterface";
import GuestItem from "@/components/GatheringComponents/GuestItem";
import useGlobalStore from "@/context/useStore";
import { supabase } from "@/lib/supabase";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { FlatList, Text, View, StyleSheet, ScrollView } from "react-native";
import { COLORS } from "@/constants/COLORS";
import { FONTS } from "@/constants/FONTS";
import MapView, { Marker } from "react-native-maps";
import JoinGatheringButton from "@/components/GatheringComponents/JoinGatheringButton";
import CreateGatheringButton from "@/components/GatheringComponents/CreateGatheringButton";

const fetchGuestsWithUserIcons = async (gatheringId: string) => {
  const { data, error } = await supabase
    .from("Guest")
    .select(
      `
      *,
      user:user_id (
        user_icon,
        user_name
      )
    `
    )
    .eq("gathering_id", gatheringId);

  if (error) {
    console.error("Error fetching guests:", error.message);
    return [];
  }

  return data || [];
};

export default function GatheringDetail() {
  const selectedGathering = useGlobalStore(
    (state: any) => state.selectedGathering
  );
  const [guestList, setGuestList] = useState<GuestWithUserIcon[]>([]);

  const refreshGuestList = async () => {
    if (!selectedGathering?.id) return;
    
    const fetchGuestList = await fetchGuestsWithUserIcons(
      selectedGathering.id
    );
    setGuestList(fetchGuestList);
  };

  useFocusEffect(
    useCallback(() => {
      if (!selectedGathering?.id) return;
      
      refreshGuestList();
    }, [selectedGathering?.id])
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5);
  };

  const hasValidCoordinates = 
    selectedGathering?.latitude != null && 
    selectedGathering?.longitude != null;

  return (
    <>
    <ScrollView style={styles.container}
    contentContainerStyle={styles.scrollContainer}>
      <View style={styles.gatheringInfoContainer}>
        <Text style={styles.gatheringName}>
          {selectedGathering?.name || "No gathering selected"}
        </Text>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Location:</Text>
          <Text style={styles.detailValue}>
            {selectedGathering?.location_name}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Date:</Text>
          <Text style={styles.detailValue}>
            {selectedGathering?.date
              ? formatDate(selectedGathering.date)
              : "Not specified"}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Time:</Text>
          <Text style={styles.detailValue}>
            {formatTime(selectedGathering?.time) || "Not specified"}
          </Text>
        </View>

        {selectedGathering?.transport && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Transport:</Text>
            <Text style={styles.detailValue}>
              {selectedGathering.transport}
            </Text>
          </View>
        )}

        {selectedGathering?.cost && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Cost:</Text>
            <Text style={styles.detailValue}>{selectedGathering.cost}€</Text>
          </View>
        )}

        {hasValidCoordinates ? (
          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              region={{
                latitude: selectedGathering.latitude,
                longitude: selectedGathering.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              pitchEnabled={false}
              toolbarEnabled={false}
            >
              <Marker
                coordinate={{
                  latitude: selectedGathering.latitude,
                  longitude: selectedGathering.longitude,
                }}
                title={selectedGathering.location_name || "Meeting Point"}
              />
            </MapView>
          </View>
        ) : <Text style={styles.noMapText}>Location Map not added</Text>}

        <Text style={styles.description}>
          {selectedGathering?.description || "No description provided"}
        </Text>

        {/* Pass callback function to refresh guest list */}
        <JoinGatheringButton onGuestStatusChange={refreshGuestList} />

      </View>
      
      <Text style={styles.guestListTitle}>Guest List</Text>
      
      <View style={styles.guestListWrapper}>
        {guestList.length > 0 ? (
          guestList.map((item) => (
            <GuestItem 
              key={item.user_id} 
              item={item} 
              onGuestUpdate={refreshGuestList}
            />
          ))
        ) : (
          <Text style={styles.emptyListText}>No guests yet</Text>
        )}
      </View>
    </ScrollView>
    <CreateGatheringButton />
    </>
    
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContainer: {
    padding: 12,
    paddingBottom: 20,
  },
  gatheringInfoContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderBottomWidth: 2,
    borderColor: COLORS.primaryDark
  },
  gatheringName: {
    fontSize: 22,
    marginBottom: 12,
    color: "black",
    fontFamily: FONTS.bold,
    paddingBottom: 8,
    textAlign: "center"
  },
  detailRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  detailLabel: {
    marginRight: 8,
    color: COLORS.primaryDark,
    fontFamily: FONTS.semiBold,
    width: 80,
  },
  detailValue: {
    flex: 1,
    fontFamily: FONTS.regular,
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
  noMapText: {
    fontFamily: FONTS.semiBold,
    textAlign: "center",
    fontSize: 18,
    marginVertical: 20
  },
  description: {
    marginTop: 12,
    fontFamily: FONTS.regular,
    lineHeight: 20,
  },
  guestListTitle: {
    fontSize: 18,
    marginBottom: 12,
    color: "black",
    fontFamily: FONTS.bold,
    paddingBottom: 8,
    textAlign: "center"
  },
  guestListWrapper: {
    minHeight: 200,
  },
  emptyListText: {
    color: "black",
    fontFamily: FONTS.regular,
    textAlign: "center",
    marginVertical: 20
  },
});