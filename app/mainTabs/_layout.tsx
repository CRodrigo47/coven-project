import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function MainTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "red",
        headerStyle: {
          backgroundColor: "black",
        },
        animation: "shift",
        headerShadowVisible: true,
        headerShown: false,
        headerTintColor: "white",
        tabBarStyle: {
          backgroundColor: "green",
        },
      }}
    >
      <Tabs.Screen
        name="gatheringTabs"
        options={{
          title: "",
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
            href: null
        }}
      />
    </Tabs>
  );
}
