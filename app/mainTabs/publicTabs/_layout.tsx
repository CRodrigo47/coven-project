import { Stack } from "expo-router";

export default function PublicLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Public" }} />
    </Stack>
  );
}
