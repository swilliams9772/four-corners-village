import * as React from "react";
import { Redirect, Tabs } from "expo-router";
import { Compass, Tv, Flame, Sparkles, User } from "lucide-react-native";
import { BlurView } from "expo-blur";
import { Platform, View } from "react-native";
import { useAuth } from "@/lib/auth-context";

export default function AppLayout() {
  const { session, loading } = useAuth();
  if (loading) return null;
  if (!session) return <Redirect href="/(auth)/welcome" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarLabelStyle: {
          fontFamily: "Geist_500Medium",
          fontSize: 11,
          letterSpacing: 0.5,
        },
        tabBarActiveTintColor: "#FBC02C",
        tabBarInactiveTintColor: "#7C7B85",
        tabBarStyle: {
          position: "absolute",
          backgroundColor: Platform.OS === "ios" ? "transparent" : "#0B0B12",
          borderTopColor: "rgba(241, 232, 211, 0.10)",
          height: 84,
          paddingTop: 8,
        },
        tabBarBackground: () =>
          Platform.OS === "ios" ? (
            <BlurView
              tint="dark"
              intensity={60}
              style={{ position: "absolute", inset: 0, backgroundColor: "rgba(11,11,18,0.6)" }}
            />
          ) : (
            <View style={{ position: "absolute", inset: 0, backgroundColor: "#0B0B12" }} />
          ),
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => <Compass color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="tv"
        options={{
          title: "Vintage TV",
          tabBarIcon: ({ color, size }) => <Tv color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="altar"
        options={{
          title: "Altar",
          tabBarIcon: ({ color, size }) => <Flame color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="oracle"
        options={{
          title: "Oracle",
          tabBarIcon: ({ color, size }) => <Sparkles color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: "You",
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
