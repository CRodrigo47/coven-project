import { Stack } from "expo-router";

export default function GatheringLayout() {
  return (
    <Stack screenOptions={{headerShown: false}}>
      <Stack.Screen name="index" options={{ title: "Gathering"}} />
    </Stack>
  );
}
