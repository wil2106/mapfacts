import { Button, Text, useTheme } from "@rneui/themed";
import Container from "../../../components/Container";
import { AppState, Linking, View } from "react-native";
import i18n from "../../../helpers/i18n";
import * as Notifications from "expo-notifications";
import { useEffect, useRef, useState } from "react";
import { router } from "expo-router";
import Constants from "expo-constants";
import { supabase } from "../../../supabase/supabase";
import { useFlashStore, usePersistStore } from "../../../helpers/zustand";

export default function PushNotificationsPerm() {
  const appState = useRef(AppState.currentState);
  const sessionUser = useFlashStore((state) => state.sessionUser);
  const setPushNotificationPermRequested = usePersistStore(
    (state) => state.setPushNotificationPermRequested
  );
  const { theme } = useTheme();
  const [state, setState] = useState<{
    loading: boolean;
  }>({
    loading: false,
  });

  useEffect(() => {
    setTimeout(async () => {
      requestPerm(false);
    }, 2000);
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        requestPerm(false);
      }

      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const onAllow = async () => {
    requestPerm(true);
  };

  const onSkip = () => {
    setPushNotificationPermRequested(true);
    router.replace("/app/home");
  };

  const requestPerm = async (openSettings: boolean) => {
    console.log("Request notifications perm");
    setState((prev) => ({ ...prev, loading: true }));
    try {
      if (!sessionUser?.id) {
        throw new Error("Session user missing");
      }
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") {
        if (openSettings) {
          Linking.openSettings();
        }
        return;
      }
      if (!Constants.expoConfig?.extra?.eas.projectId) {
        throw new Error("Missing projectId");
      }
      const pushToken = await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig.extra.eas.projectId,
      });

      const { error } = await supabase
        .from("User")
        .update({ pushToken: pushToken.data })
        .eq("id", sessionUser.id);

      if (error) {
        throw new Error("Somthing went wrong while updating user's push token");
      }

      setPushNotificationPermRequested(true);

      await new Promise(resolve => setTimeout(resolve, 1000));

      router.replace("/app/home");
    } catch (err) {
      console.error(err);
      alert(i18n.t("default_error_message"));
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  return (
    <Container>
      <Text
        style={{
          fontSize: 24,
          fontFamily: "Fredoka_SemiBold",
          textAlign: "center",
          color: theme.colors.primary,
        }}
      >
        {i18n.t("push_notifications_perm.title")}
      </Text>
      <Text style={{ color: theme.colors.grey0, textAlign: "center" }}>
        {i18n.t("push_notifications_perm.message")}
      </Text>
      <View style={{ flex: 1 }} />
      <Button
        onPress={onAllow}
        loading={state.loading}
        disabled={state.loading}
      >
        {i18n.t("push_notifications_perm.yes")}
      </Button>
      <Button
        onPress={onSkip}
        type="clear"
        titleStyle={{ color: theme.colors.grey2, fontFamily: "Fredoka_Medium" }}
        disabled={state.loading}
      >
        {i18n.t("push_notifications_perm.no")}
      </Button>
    </Container>
  );
}
