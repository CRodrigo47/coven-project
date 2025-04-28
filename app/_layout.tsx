import AuthProvider from "@/providers/AuthProvider";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {

  return (
    <>
      <AuthProvider>
        <StatusBar style="light" backgroundColor="#8C5ABE"/>
        <Stack 
          screenOptions={{ 
            headerShown: false,
            contentStyle: {
              backgroundColor: '#ffffff'
            }
          }}
        >
          <Stack.Screen 
            name="mainTabs" 
            options={{ 
              headerShown: false,
              animation: 'none' 
            }} 
          />
        </Stack>
      </AuthProvider>
    </>
  );
}