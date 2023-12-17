import { useState } from "react";
import { RefreshControl, SafeAreaView, ScrollView } from "react-native";
import { useFlashStore } from "../../../helpers/zustand";
import { supabase } from "../../../supabase/supabase";
import i18n from "../../../helpers/i18n";
import { ListItem, Switch, Text } from "@rneui/themed";
import { MenuAction, MenuView } from "@react-native-menu/menu";

const MIN_UPVOTES_LIST = [2, 5, 10, 30, 50, 80, 100, 200, 300];
const COOLDOWN_LIST = [1, 2, 3, 5, 10, 20, 30, 60];

export default function RadarSettings() {
  const setUser = useFlashStore((state) => state.setUser);
  const sessionUser = useFlashStore((state) => state.sessionUser);
  const toggleUserRadarEnabled = useFlashStore(
    (state) => state.toggleUserRadarEnabled
  );
  const setUserRadarMinUpVotes = useFlashStore((state) => state.setUserRadarMinUpVotes);
  const setUserRadarCooldown = useFlashStore((state) => state.setUserRadarCooldown);
  const user = useFlashStore((state) => state.user);
  const [state, setState] = useState<{
    loading: boolean;
  }>({
    loading: false,
  });
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
  const onEnableChange = async () => {
    try {
      if (!sessionUser?.id) {
        throw new Error("User id missing");
      }
      const oldState = user?.radarEnabled;
      toggleUserRadarEnabled();

      const { error } = await supabase
        .from("User")
        .update({ radarEnabled: !oldState })
        .eq("id", sessionUser.id);

      if (error) {
        throw error;
      }
    } catch (err) {
      toggleUserRadarEnabled();
      console.error(err);
      alert(i18n.t("default_error_message"));
    }
  };

  const onMinUpVotesChange = async (value: number) => {
    const oldState = user?.radarMinUpvotes;
    try {
      if (!sessionUser?.id) {
        throw new Error("User id missing");
      }
      setUserRadarMinUpVotes(value);

      const { error } = await supabase
        .from("User")
        .update({ radarMinUpvotes: value })
        .eq("id", sessionUser.id);

      if (error) {
        throw error;
      }
    } catch (err) {
      setUserRadarMinUpVotes(oldState ?? 0);
      console.error(err);
      alert(i18n.t("default_error_message"));
    }
  };

  const onCooldownChange = async (value: number) => {
    const oldState = user?.radarCooldownS;
    try {
      if (!sessionUser?.id) {
        throw new Error("User id missing");
      }
      setUserRadarCooldown(value);

      const { error } = await supabase
        .from("User")
        .update({ radarCooldownS: value })
        .eq("id", sessionUser.id);

      if (error) {
        throw error;
      }
    } catch (err) {
      setUserRadarCooldown(oldState ?? 0);
      console.error(err);
      alert(i18n.t("default_error_message"));
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView
        style={{ flex: 1, padding: 16, gap: 10 }}
        refreshControl={
          <RefreshControl refreshing={state.loading} onRefresh={onRefresh} />
        }
      >
        <Text style={{ fontSize: 12, marginBottom: 20 }}>
          {i18n.t("radar_settings.info")}
        </Text>
        <ListItem bottomDivider first>
          <ListItem.Content>
            <Text style={{ fontFamily: "Fredoka_Medium" }}>
              {i18n.t("radar_settings.activation")}
            </Text>
          </ListItem.Content>
          <Switch value={user?.radarEnabled} onChange={onEnableChange} />
        </ListItem>
        <MenuView
          themeVariant="dark"
          onPressAction={({ nativeEvent }) => {
            const value = parseInt(nativeEvent.event);
            if (isNaN(value)){
              return;
            }
            onMinUpVotesChange(value);
          }}
          actions={MIN_UPVOTES_LIST.map((item) => ({
            id: item.toString(),
            title: item.toString(),
          }))}
        >
          <ListItem bottomDivider>
            <ListItem.Content>
              <Text style={{ fontFamily: "Fredoka_Medium" }}>
                {i18n.t("radar_settings.min_upvotes")}
              </Text>
            </ListItem.Content>
            <Text>{user?.radarMinUpvotes}</Text>
            <ListItem.Chevron />
          </ListItem>
        </MenuView>
        <MenuView
          themeVariant="dark"
          onPressAction={({ nativeEvent }) => {
            const value = parseInt(nativeEvent.event);
            if (isNaN(value)){
              return;
            }
            onCooldownChange(value * 60);
          }}
          actions={COOLDOWN_LIST.map((item) => ({
            id: item.toString(),
            title: `${item} min`,
          }))}
        >
          <ListItem bottomDivider last>
            <ListItem.Content>
              <Text style={{ fontFamily: "Fredoka_Medium" }}>
                {i18n.t("radar_settings.cooldown")}
              </Text>
            </ListItem.Content>
            <Text>{user?.radarCooldownS ? `${user.radarCooldownS / 60} min`: ""}</Text>
            <ListItem.Chevron />
          </ListItem>
        </MenuView>
      </ScrollView>
    </SafeAreaView>
  );
}
