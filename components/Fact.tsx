import { Alert, View } from "react-native";
import { FactType } from "../types";
import { Button, Icon, Text, useTheme } from "@rneui/themed";
import { useState } from "react";
import { MenuView } from "@react-native-menu/menu";
import i18n from "../helpers/i18n";
import { useFlashStore } from "../helpers/zustand";
import { formatDistance } from "date-fns";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { supabase } from "../supabase/supabase";

export default function Fact({
  fact,
  onClose,
  onCenter,
  onDeleted,
  onDownvoted,
  onUpvoted
}: {
  fact: FactType;
  onClose: () => void;
  onCenter: () => void;
  onDeleted: () => void;
  onDownvoted: () => void;
  onUpvoted: () => void;
}) {
  const safeAreaInsets = useSafeAreaInsets();
  const { theme } = useTheme();
  const sessionUser = useFlashStore((state) => state.sessionUser);
  const [state, setState] = useState<{
    upvoteLoading: boolean;
    downvoteLoading: boolean;
  }>({
    upvoteLoading: false,
    downvoteLoading: false,
  });

  const onDelete = () => {
    Alert.alert("", i18n.t("fact.delete_dialog.title"), [
      {
        text: i18n.t("fact.delete_dialog.cancel"),
        style: "cancel",
      },
      {
        text: i18n.t("fact.delete_dialog.delete"),
        onPress: async () => {
          try {
            const { error } = await supabase
              .from('Fact')
              .delete()
              .eq('id', fact.id);
            if (error){
              throw error;
            }
            onDeleted();
            onClose();
            Toast.show({
              type: "success",
              text1: i18n.t("fact.delete_toast_text"),
            });
          } catch (err){
            console.error(err);
            alert(i18n.t("default_error_message"));
          }
        },
      },
    ]);
  };

  const onReport = () => {
    Alert.prompt("", i18n.t("fact.report_dialog.title"), [
      {
        text: i18n.t("fact.report_dialog.cancel"),
        style: "cancel",
      },
      {
        text: i18n.t("fact.report_dialog.delete"),
        onPress: async (reason) => {
          try {
            if (!sessionUser?.id){
              throw new Error("No user id");
            }
            const formattedReason = reason?.trim().substring(0, 50);
            const { error } = await supabase
              .from("Report")
              .insert({ reason: formattedReason ?? "", authorId: sessionUser.id, factId: fact.id });
            if (error){
              throw error;
            }
            Toast.show({
              type: "success",
              text1: i18n.t("fact.report_dialog_text"),
            });
          } catch (err){
            console.error(err);
            alert(i18n.t("default_error_message"));
          }
        },
      },
    ]);
  };

  const onDownvote = async () => {
    try {
      setState((prev) => ({...prev, downvoteLoading: true}));
      if (!sessionUser?.id){
        throw new Error("No user id");
      }
      if (fact.uservote === -1){
        const { error } = await supabase
        .from("Vote")
        .delete()
        .match({ authorId: sessionUser.id, factId: fact.id });
        
        if (error){
          throw error;
        }
      } else {
        const { error } = await supabase
        .from("Vote")
        .insert({ value: -1, authorId: sessionUser.id, factId: fact.id });

        if (error){
          throw error;
        }
      }
      onDownvoted();
    } catch (err){
      console.error(err);
      alert(i18n.t("default_error_message"));
    } finally {
      setState((prev) => ({...prev, downvoteLoading: false}));
    }
  };

  const onUpvote = async () => {
    try {
      setState((prev) => ({...prev, upvoteLoading: true}));
      if (!sessionUser?.id){
        throw new Error("No user id");
      }
      if (fact.uservote === 1){
        const { error } = await supabase
        .from("Vote")
        .delete()
        .match({ authorId: sessionUser.id, factId: fact.id });
        
        if (error){
          throw error;
        }
      } else {
        const { error } = await supabase
        .from("Vote")
        .insert({ value: 1, authorId: sessionUser.id, factId: fact.id });

        if (error){
          throw error;
        }
      }
      onUpvoted();
    } catch (err){
      console.error(err);
      alert(i18n.t("default_error_message"));
    } finally {
      setState((prev) => ({...prev, upvoteLoading: false}));
    }
  };

  return (
    <View
      style={{
        flex: 1,
        paddingHorizontal: 16,
        gap: 8,
        marginBottom: safeAreaInsets.bottom,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <Text
          style={{
            fontFamily: "Fredoka_SemiBold",
            fontSize: 18,
            flex: 1,
            marginTop: 6,
          }}
          numberOfLines={3}
        >
          {fact.text}
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <MenuView
            themeVariant="dark"
            onPressAction={({ nativeEvent }) => {
              switch (nativeEvent.event) {
                case "center":
                  onCenter();
                  break;
                case "report":
                  onReport();
                  break;
                case "delete":
                  onDelete();
                  break;
              }
            }}
            actions={[
              {
                id: "center",
                title: i18n.t("fact.recenter"),
                titleColor: theme.colors.black,
              },
              sessionUser?.id !== fact.authorid
                ? {
                    id: "report",
                    title: i18n.t("fact.report"),
                    attributes: {
                      destructive: true,
                    },
                  }
                : {
                    id: "delete",
                    title: i18n.t("fact.delete"),
                    attributes: {
                      destructive: true,
                    },
                  },
            ]}
          >
            <Icon
              containerStyle={{
                marginHorizontal: 0,
                marginVertical: 0,
              }}
              iconStyle={{
                color: theme.colors.black,
              }}
              name="dots-horizontal"
              type="material-community"
              reverse
              color={theme.colors.grey3}
              size={20}
            />
          </MenuView>
          <Icon
            containerStyle={{
              marginHorizontal: 0,
              marginVertical: 0,
            }}
            iconStyle={{
              color: theme.colors.black,
            }}
            name="times"
            type="font-awesome"
            reverse
            color={theme.colors.grey3}
            size={20}
            onPress={onClose}
          />
        </View>
      </View>
      <Text style={{ color: theme.colors.grey0 }}>
        {`${i18n.t("fact.posted")} `}
        {formatDistance(new Date(fact.createdat), new Date(), {
          addSuffix: true,
        })}
      </Text>
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Text
            style={{
              fontFamily: "Fredoka_Medium",
              color:
                fact.score >= 0 ? theme.colors.primary : theme.colors.tertiary,
              fontSize: 26,
            }}
          >
            {fact.score > 0 ? "+" : ""}
            {fact.score}
          </Text>
          <Text
            style={{
              fontFamily: "Fredoka_Regular",
              color: theme.colors.grey0,
            }}
          >
            {`(${fact.votecount})`}
          </Text>
        </View>
      </View>
      {sessionUser?.id !== fact.authorid && (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Button
            onPress={onDownvote}
            icon={{
              name: "thumb-down",
              type: "material-community",
              size: 16,
              color: fact.uservote === -1 ? "white" : theme.colors.black,
            }}
            containerStyle={{ flex: 1 }}
            buttonStyle={{
              backgroundColor:
                fact.uservote === -1
                  ? theme.colors.tertiary
                  : theme.colors.grey3,
            }}
            titleStyle={{
              color: fact.uservote === -1 ? "white" : theme.colors.black,
              fontSize: 16,
            }}
            loading={state.downvoteLoading}
            disabled={state.downvoteLoading || state.upvoteLoading}
          >
            {i18n.t("fact.downvote")}
          </Button>
          <Button
            onPress={onUpvote}
            icon={{
              name: "thumb-up",
              type: "material-community",
              size: 16,
              color: fact.uservote === 1 ? "white" : theme.colors.black,
            }}
            containerStyle={{ flex: 1 }}
            buttonStyle={{
              backgroundColor:
                fact.uservote === 1 ? theme.colors.primary : theme.colors.grey3,
            }}
            titleStyle={{
              color: fact.uservote === 1 ? "white" : theme.colors.black,
              fontSize: 16,
            }}
            loading={state.upvoteLoading}
            disabled={state.downvoteLoading || state.upvoteLoading}
          >
            {i18n.t("fact.upvote")}
          </Button>
        </View>
      )}
    </View>
  );
}
