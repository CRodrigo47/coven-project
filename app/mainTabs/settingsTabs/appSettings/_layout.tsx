import { Stack } from "expo-router";

export default function AppSettingsLayout() {
  return (
    <Stack screenOptions={{headerShown: false}}>
      <Stack.Screen name="index" options={{ title: "AppSettings"}} />
    </Stack>
  );
}
