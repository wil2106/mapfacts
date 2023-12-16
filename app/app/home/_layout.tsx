import { Redirect, Stack, router } from "expo-router";
import { Icon, Text, useTheme } from "@rneui/themed";
import { useFlashStore, usePersistStore } from "../../../helpers/zustand";
import { ActivityIndicator, AppState, View } from "react-native";
import { useEffect, useRef } from "react";
import { supabase } from "../../../supabase/supabase";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import * as Location from "expo-location";

export default function AppLayout() {
  const sessionUser = useFlashStore((state) => state.sessionUser);
  const setUser = useFlashStore((state) => state.setUser);
  const setLocationEnabled = useFlashStore((state) => state.setLocationEnabled);
  const setPushNotificationsEnabled = useFlashStore(
    (state) => state.setPushNotificationsEnabled
  );
  const { theme } = useTheme();
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    checkPerms();
    const subscription = AppState.addEventListener(
      "change",
      async (nextAppState) => {
        if (
          appState.current.match(/inactive|background/) &&
          nextAppState === "active"
        ) {
          checkPerms();
        }

        appState.current = nextAppState;
      }
    );

    return () => {
      subscription.remove();
    };
  }, []);

  const checkPerms = async () => {
    let locationPerm = await Location.getForegroundPermissionsAsync();
    if (locationPerm.status === "granted") {
      setLocationEnabled(true);
    } else {
      setLocationEnabled(false);
    }
    let notificationPerm = await Notifications.getPermissionsAsync();
    if (notificationPerm.status === "granted") {
      setPushNotificationsEnabled(true);
    } else {
      setPushNotificationsEnabled(false);
    }
  };

  useEffect(() => {
    if (sessionUser) {
      (async () => {
        let pushToken: string | undefined;
        if (Constants?.expoConfig?.extra?.eas.projectId) {
          try {
            pushToken = (
              await Notifications.getExpoPushTokenAsync({
                projectId: Constants.expoConfig.extra.eas.projectId,
              })
            ).data;
          } catch (err) {
            console.warn(err);
          }
        }

        const { data, error } = await supabase
          .from("User")
          .upsert({
            id: sessionUser.id,
            lastLoginAt: new Date().toISOString(),
            ...(pushToken !== undefined ? { pushToken } : {}),
          })
          .select()
          .single();
        setUser(data);
      })();
    }
  }, [sessionUser]);

  if (sessionUser === undefined) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={theme.colors.black} />
      </View>
    );
  }

  if (sessionUser === null) {
    return <Redirect href="/app/onboarding" />;
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.background,
        },
        headerTitle: (props) => (
          <Text style={{ fontSize: 16, fontFamily: "Fredoka_SemiBold" }}>
            {props.children}
          </Text>
        ),
        contentStyle: { backgroundColor: theme.colors.background },
        headerShown: true,
        headerLeft: (props) =>
          props.canGoBack ? (
            <Icon
              name="chevron-left"
              type="octicon"
              onPress={() => router.back()}
              color={theme.colors.black}
            />
          ) : undefined,
      }}
    >
      <Stack.Screen name="push-notifications-perm" options={{ title: "" }} />
      <Stack.Screen name="radar-settings" options={{ title: "" }} />
      <Stack.Screen
        name="search"
        options={{ headerShown: false, animation: "fade" }}
      />
      <Stack.Screen name="settings" options={{ title: "" }} />
      <Stack.Screen
        name="account"
        options={{
          headerRight: (props) => (
            <Icon
              name="settings"
              type="material"
              onPress={() => router.push("/app/home/settings")}
              color={theme.colors.black}
              size={26}
            />
          ),
        }}
      />
    </Stack>
  );
}
