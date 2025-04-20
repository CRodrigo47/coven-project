import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <>
      <Stack screenOptions={{headerShown: false}}>
        <Stack.Screen name="mainTabs" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}
