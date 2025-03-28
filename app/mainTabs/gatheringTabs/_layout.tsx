import { Stack } from "expo-router";

export default function GatheringLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Gathering" }} />
    </Stack>
  );
}
