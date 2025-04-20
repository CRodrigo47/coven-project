import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { UserSearchModal } from "@/components/UserSearchModal";

export default function MainTabsLayout() {
  const insets = useSafeAreaInsets();
  const headerHeight = 60 + insets.top;

  return (
    <View style={{ flex: 1 }}>
      {/* Header fijo fuera de los Tabs */}
      <View style={{
        position: 'absolute', // Usamos posición absoluta
        top: 0,
        left: 0,
        right: 0,
        height: headerHeight,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingTop: insets.top,
        backgroundColor: "#8C5ABE",
        borderBottomWidth: 1,
        zIndex: 1
      }}>
        <Text style={{ fontSize: 20, fontWeight: "bold", color: "white" }}>
          Coven
        </Text>
        <UserSearchModal />
      </View>
      <View style={{ 
        flex: 1, 
        paddingTop: headerHeight, // Empuja todo el contenido hacia abajo
        backgroundColor: '#ffffff' // Color de fondo para el área de contenido
      }}>
      {/* Tabs con espacio para el header */}
      <Tabs
          screenOptions={{
            animation: "shift",
            headerShown: false, // Asegúrate de que el header nativo esté oculto
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
              title: "",
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
              title: "",
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
              title: "",
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
              title: "",
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
