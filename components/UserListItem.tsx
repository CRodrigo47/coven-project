import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants/COLORS";
import { getTypography } from "@/constants/TYPOGRAPHY";
import UserInterface from "@/app/interfaces/userInterface";

interface UserListItemProps {
  user: UserInterface;
  onPress: (user: UserInterface) => void;
}

export default function UserListItem({ user, onPress }: UserListItemProps) {
  return (
    <TouchableOpacity onPress={() => onPress(user)}>
      <View style={styles.userItem}>
        <View style={styles.leftSection}>
          {user.user_icon ? (
            <Image
              source={{ uri: user.user_icon }}
              style={styles.profileImage}
            />
          ) : (
            <View style={styles.profileImagePlaceholder}>
              <Ionicons name="person" size={36} color={COLORS.primaryDark} />
            </View>
          )}
        </View>
        
        <View style={styles.rightSection}>
          <Text 
            style={[getTypography("bodyLarge", "light"), styles.userName]}
            numberOfLines={1}
          >
            {user.user_name}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  userItem: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 10,
    borderColor: COLORS.primaryDark,
    backgroundColor: COLORS.secondary,
    minHeight: 80,
    marginVertical: 4,
    width: "90%",
    alignSelf: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  leftSection: {
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightSection: {
    flex: 1,
    justifyContent: 'center',
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  profileImagePlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    includeFontPadding: false,
    marginBottom: 4,
  }
});