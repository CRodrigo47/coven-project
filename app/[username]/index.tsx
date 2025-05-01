import { UserSearchModal } from "@/components/UserSearchModal";
import { COLORS } from "@/constants/COLORS";
import { FONTS } from "@/constants/FONTS";
import { getTypography } from "@/constants/TYPOGRAPHY";
import useGlobalStore from "@/context/useStore";
import { View, Text, StyleSheet, Image, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import AddFriendButton from "@/components/AddFriendButton";
import BlockUserButton from "@/components/BlockUserButton";
import { useEffect } from "react";

const ProfileViewer = () => {
  const selectedUser = useGlobalStore((state: any) => state.selectedUser);
  const authUserId = useGlobalStore((state: any) => state.authUserId);
  const fetchAuthUserId = useGlobalStore((state: any) => state.fetchAuthUserId);
  const insets = useSafeAreaInsets();
  const headerHeight = 60 + insets.top;

  useEffect(() => {
    if (!authUserId) {
      fetchAuthUserId();
    }
  }, [authUserId, fetchAuthUserId]);

  const isOwnProfile = selectedUser.id === authUserId;

  const formatRegistrationDate = (timestamptz: string) => {
    if (!timestamptz) return "Unknown";
    const date = new Date(timestamptz);
    return date.toLocaleDateString("en", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <>
      <View
        style={[
          styles.header,
          {
            height: headerHeight,
            paddingTop: insets.top,
          },
        ]}
      >
        <Text style={getTypography("titleLarge", "dark")}>Coven</Text>
        <UserSearchModal />
      </View>

      <ScrollView
        style={[
          styles.container,
          {
            paddingTop: headerHeight,
          },
        ]}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            {selectedUser.user_icon ? (
              <Image
                source={{ uri: selectedUser.user_icon }}
                style={styles.profileImage}
              />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <Ionicons name="person" size={60} color={COLORS.primaryDark} />
              </View>
            )}

            <Text style={styles.userName}>{selectedUser.user_name}</Text>
            
            {selectedUser.age && (
              <View style={styles.ageContainer}>
                <Text style={styles.ageText}>{selectedUser.age} years</Text>
              </View>
            )}
          </View>

          <View style={styles.infoSection}>
            <View style={styles.sectionHeader}>
              <Ionicons name="heart" size={20} color={COLORS.primaryDark} />
              <Text style={styles.sectionTitle}>Interests</Text>
            </View>
            
            {selectedUser.interests && selectedUser.interests.length > 0 ? (
              <View style={styles.interestsContainer}>
                {selectedUser.interests.map((interest: string, index: number) => (
                  <View key={index} style={styles.interestTag}>
                    <Text style={styles.interestText}>{interest}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.emptyText}>No interests listed</Text>
            )}
          </View>

          {!isOwnProfile && (
            <View style={styles.buttonContainer}>
              <AddFriendButton />
              <BlockUserButton />
            </View>
          )}
          
          <View style={styles.createdAtSection}>
          <Text style={styles.registrationDate}>
              Member since
            </Text>
            <Text style={styles.registrationDate}>
              {formatRegistrationDate(selectedUser.created_at)}
            </Text>
          </View>
        </View>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    backgroundColor: COLORS.primary,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.primaryDark,
    zIndex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "#fcf5d7",
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
    height: "100%"
  },
  profileCard: {
    borderRadius: 16,
    padding: 20,
    height: "100%"
  },
  profileHeader: {
    alignItems: "center",
    marginBottom: 24,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
    borderWidth: 3,
    borderColor: COLORS.primary,
  },
  profileImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.secondary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 3,
    borderColor: COLORS.primaryDark,
  },
  userName: {
    fontSize: 24,
    fontFamily: FONTS.bold,
    color: "#111827",
    marginBottom: 8,
  },
  ageContainer: {
    backgroundColor: COLORS.primaryDark,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  ageText: {
    color: "#ffffff",
    fontFamily: FONTS.medium,
    fontSize: 14,
  },
  infoSection: {
    marginBottom: 20,
    paddingBottom: 5,
    justifyContent: "center",
    textAlign: "center",
    alignItems: "center",
  },
  buttonContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-evenly"
  },
  createdAtSection: {
    position: "absolute",
    bottom: 40,
    right: 20
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: FONTS.semiBold,
    color: COLORS.primaryDark,
    marginLeft: 8,
  },
  interestsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
  },
  interestTag: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    margin: 4,
    borderWidth: 1
  },
  interestText: {
    color: "white",
    fontFamily: FONTS.medium,
    fontSize: 14,
    padding: 1
  },
  registrationDate: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    marginTop: 4,
  },
  emptyText: {
    fontFamily: FONTS.italic,
    color: "grey",
    fontSize: 16,
  },
});

export default ProfileViewer;