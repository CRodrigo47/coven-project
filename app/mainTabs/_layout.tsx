import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { UserSearchModal } from "@/components/UserSearchModal";
import { COLORS } from "@/constants/COLORS";
import { getTypography } from "@/constants/TYPOGRAPHY";

export default function MainTabsLayout() {
  const insets = useSafeAreaInsets();
  const headerHeight = 60 + insets.top;

  return (
    <View style={{ flex: 1 }}>
      <View style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: headerHeight,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingTop: insets.top,
        backgroundColor: COLORS.primary,
        borderBottomWidth: 1,
        zIndex: 1
      }}>
        <Text style={getTypography("titleLarge", "dark")}>
          Coven
        </Text>
        <UserSearchModal />
      </View>
      <View style={{ 
        flex: 1, 
        paddingTop: headerHeight,
        backgroundColor: '#ffffff'
      }}>
      <Tabs
          screenOptions={{
            animation: "shift",
            headerShown: false,
            tabBarShowLabel: false,
            tabBarStyle: {
              backgroundColor: "#8C5ABE",
            },
            tabBarItemStyle: {
              paddingVertical: 5,
              borderTopWidth: 1,
            }
          }}
        >
          <Tabs.Screen
            name="gatheringTabs"
            options={{
              title: "gatheringTabs",
              popToTopOnBlur: true,
              tabBarIcon: ({ focused }) => (
                <Ionicons
                  name={"book"}
                  color={focused ? "white" : "black"}
                  size={24}
                />
              ),
            }}
          />
          <Tabs.Screen
            name="covenTabs"
            options={{
              title: "covenTabs",
              popToTopOnBlur: true,
              tabBarIcon: ({ focused }) => (
                <Ionicons
                  name={"people"}
                  color={focused ? "white" : "black"}
                  size={24}
                />
              ),
            }}
          />
          <Tabs.Screen
            name="publicTabs"
            options={{
              title: "publicTabs",
              popToTopOnBlur: true,
              tabBarIcon: ({ focused }) => (
                <Ionicons
                  name={"planet"}
                  color={focused ? "white" : "black"}
                  size={24}
                />
              ),
            }}
          />
          <Tabs.Screen
            name="settingsTabs"
            options={{
              title: "settingsTabs",
              popToTopOnBlur: true,
              tabBarIcon: ({ focused }) => (
                <Ionicons
                  name={"settings"}
                  color={focused ? "white" : "black"}
                  size={24}
                />
              ),
            }}
          />
          <Tabs.Screen
            name="logOut"
            options={{
              title: "logOut",
              tabBarIcon: ({ focused }) => (
                <Ionicons
                  name={"log-out"}
                  color={focused ? "white" : "black"}
                  size={24}
                />
              ),
            }}
          />
          <Tabs.Screen
            name="inviteQR"
            options={{
              href: null,
            }}
          />
        </Tabs>
        </View>
      </View>
  );
}
