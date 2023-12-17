import { Icon, ListItem, Switch, Text, useTheme } from "@rneui/themed";
import {
  Alert,
  Linking,
  Platform,
  SafeAreaView,
  ScrollView,
  Share,
} from "react-native";
import i18n from "../../../helpers/i18n";
import Constants from "expo-constants";
import { supabase } from "../../../supabase/supabase";
import { RefreshControl } from "react-native";
import { useState } from "react";
import { useFlashStore } from "../../../helpers/zustand";
import * as Notifications from "expo-notifications";
import {
  RATE_APP_ANDROID_URL,
  RATE_APP_IOS_URL,
  SHARE_APP_URL,
  SUPPORT_URL,
  WEBSITE_URL,
} from "../../../helpers/constants";
import { StatusBar } from "expo-status-bar";

export default function Settings() {
  const { theme } = useTheme();
  const sessionUser = useFlashStore((state) => state.sessionUser);
  const reset = useFlashStore((state) => state.reset);
  const pushNotificationsEnabled = useFlashStore(
    (state) => state.pushNotificationsEnabled
  );
  const setPushNotificationsEnabled = useFlashStore(
    (state) => state.setPushNotificationsEnabled
  );
  const user = useFlashStore((state) => state.user);
  const setUser = useFlashStore((state) => state.setUser);
  const toggleUserNotifications = useFlashStore(
    (state) => state.toggleUserNotifications
  );
  const [state, setState] = useState<{
    loading: boolean;
  }>({
    loading: false,
  });

  const onSignout = () => {
    Alert.alert("", i18n.t("settings.sign_out_dialog_text"), [
      {
        text: i18n.t("settings.cancel"),
        style: "cancel",
      },
      {
        text: i18n.t("settings.sign_out"),
        onPress: async () => {
          await supabase.auth.signOut();
          reset();
        },
        style: "destructive",
      },
    ]);
  };
  const onDeleteAccount = () => {
    Alert.alert("", i18n.t("settings.delete_account_dialog_text"), [
      {
        text: i18n.t("settings.cancel"),
        style: "cancel",
      },
      {
        text: i18n.t("settings.delete_account"),
        onPress: () => {},
        style: "destructive",
      },
    ]);
  };

  const onRefresh = async () => {
    try {
      if (!sessionUser?.id) {
        throw new Error("User id missing");
      }
      setState((prev) => ({ ...prev, loading: true }));

      const { data, error } = await supabase
        .from("User")
        .select()
        .eq("id", sessionUser.id)
        .single();

      if (error) {
        throw error;
      }

      setUser(data);
    } catch (err) {
      console.error(err);
      alert(i18n.t("default_error_message"));
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  const onChangeNotifications = async () => {
    try {
      if (!sessionUser?.id) {
        throw new Error("User id missing");
      }
      const oldState = user?.notificationsEnabled;
      toggleUserNotifications();

      const { error } = await supabase
        .from("User")
        .update({ notificationsEnabled: !oldState })
        .eq("id", sessionUser.id);

      if (error) {
        throw error;
      }
    } catch (err) {
      toggleUserNotifications();
      console.error(err);
      alert(i18n.t("default_error_message"));
    }
  };

  const onEnablePushNotifications = async () => {
    if (pushNotificationsEnabled) {
      return;
    }
    const pushNotificationPerm = await Notifications.getPermissionsAsync();
    if (pushNotificationPerm.status !== "granted") {
      setPushNotificationsEnabled(false);
      const { status } = await Notifications.requestPermissionsAsync();
      if (status === "granted") {
        setPushNotificationsEnabled(true);
      } else {
        Linking.openSettings();
        return;
      }
    } else {
      setPushNotificationsEnabled(true);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar style="dark" />
      <ScrollView
        style={{ flex: 1, padding: 16, gap: 10 }}
        refreshControl={
          <RefreshControl refreshing={state.loading} onRefresh={onRefresh} />
        }
      >
        <ListItem bottomDivider onPress={onEnablePushNotifications} first>
          {!pushNotificationsEnabled && (
            <Icon
              name="warning"
              type="ionicons"
              color={theme.colors.tertiary}
              size={22}
            />
          )}
          <ListItem.Content>
            <Text style={{ fontFamily: "Fredoka_Medium" }}>
              {i18n.t(
                pushNotificationsEnabled
                  ? "settings.notifications"
                  : "settings.missing_notifications_perm"
              )}
            </Text>
          </ListItem.Content>
          {pushNotificationsEnabled ? (
            <Switch
              value={user?.notificationsEnabled && pushNotificationsEnabled}
              onChange={onChangeNotifications}
            />
          ) : (
            <ListItem.Chevron />
          )}
        </ListItem>
        <ListItem bottomDivider onPress={() => Linking.openURL(SUPPORT_URL)}>
          <ListItem.Content>
            <Text style={{ fontFamily: "Fredoka_Medium" }} numberOfLines={1}>
              {i18n.t("settings.help")}
            </Text>
          </ListItem.Content>
          <ListItem.Chevron />
        </ListItem>
        <ListItem bottomDivider onPress={() => Linking.openURL(WEBSITE_URL)}>
          <ListItem.Content>
            <Text style={{ fontFamily: "Fredoka_Medium" }} numberOfLines={1}>
              {i18n.t("settings.website")}
            </Text>
          </ListItem.Content>
          <ListItem.Chevron />
        </ListItem>
        <ListItem
          bottomDivider
          onPress={() =>
            Linking.openURL(
              Platform.OS === "ios" ? RATE_APP_IOS_URL : RATE_APP_ANDROID_URL
            )
          }
        >
          <ListItem.Content>
            <Text style={{ fontFamily: "Fredoka_Medium" }} numberOfLines={1}>
              {i18n.t("settings.rate_us")}
            </Text>
          </ListItem.Content>
          <ListItem.Chevron />
        </ListItem>
        <ListItem
          bottomDivider
          onPress={() => {
            Share.share({
              url: SHARE_APP_URL,
            });
          }}
        >
          <ListItem.Content>
            <Text style={{ fontFamily: "Fredoka_Medium" }} numberOfLines={1}>
              {i18n.t("settings.share")}
            </Text>
          </ListItem.Content>
          <ListItem.Chevron />
        </ListItem>
        <ListItem bottomDivider onPress={() => {}}>
          <ListItem.Content>
            <Text style={{ fontFamily: "Fredoka_Medium" }} numberOfLines={1}>
              {i18n.t("settings.privacy_policy")}
            </Text>
          </ListItem.Content>
          <ListItem.Chevron />
        </ListItem>
        <ListItem bottomDivider onPress={() => {}}>
          <ListItem.Content>
            <Text style={{ fontFamily: "Fredoka_Medium" }} numberOfLines={1}>
              {i18n.t("settings.terms_of_service")}
            </Text>
          </ListItem.Content>
          <ListItem.Chevron />
        </ListItem>
        <ListItem bottomDivider onPress={onSignout}>
          <ListItem.Content>
            <Text style={{ fontFamily: "Fredoka_Medium" }} numberOfLines={1}>
              {i18n.t("settings.sign_out")}
            </Text>
          </ListItem.Content>
          <ListItem.Chevron />
        </ListItem>
        <ListItem onPress={onDeleteAccount} last>
          <ListItem.Content>
            <Text style={{ fontFamily: "Fredoka_Medium" }} numberOfLines={1}>
              {i18n.t("settings.delete_account")}
            </Text>
          </ListItem.Content>
          <ListItem.Chevron />
        </ListItem>
        <Text
          style={{
            color: theme.colors.grey0,
            textAlign: "center",
            marginTop: 20,
          }}
        >{`Mapfacts v${Constants?.expoConfig?.version}`}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}
