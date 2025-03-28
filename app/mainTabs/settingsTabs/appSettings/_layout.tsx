import { Stack } from "expo-router";

export default function AppSettingsLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "AppSettings" }} />
    </Stack>
  );
}
