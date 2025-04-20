import { Stack } from "expo-router";

export default function PublicLayout() {
  return (
    <Stack screenOptions={{headerShown: false}}>
      <Stack.Screen name="index" options={{ title: "Public"}} />
    </Stack>
  );
}
