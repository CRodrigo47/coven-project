import { Stack } from "expo-router";

export default function CovenLayout() {
  return (
    <Stack screenOptions={{headerShown: false}}>
      <Stack.Screen name="index" options={{ title: "Coven" }} />
    </Stack>
  );
}
