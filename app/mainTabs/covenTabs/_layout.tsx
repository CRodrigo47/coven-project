import { Stack } from "expo-router";

export default function CovenLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Coven" }} />
    </Stack>
  );
}
