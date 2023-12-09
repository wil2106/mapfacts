import { Redirect, Stack, router } from "expo-router";
import { Button, Icon, Text, useTheme } from "@rneui/themed";
import { useFlashStore } from "../../../helpers/zustand";
import { ActivityIndicator, Linking, View } from "react-native";
import i18n from "../../../helpers/i18n";
import { SUPPORT_URL } from "../../../helpers/constants";

export default function OnboardingLayout() {
  const sessionUser = useFlashStore((state) => state.sessionUser);
  const { theme } = useTheme();
  if (sessionUser) {
    return <Redirect href="/app/home" />;
  }

  const onOpenSupport = () => {
    Linking.openURL(SUPPORT_URL);
  };

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
      <Stack.Screen name="index" options={{ title: "" }} />
      <Stack.Screen
        name="sign-in"
        options={{
          title: i18n.t("sign_in.title"),
          headerTitleStyle: { color: theme.colors.black },
          headerRight: (props) => (
            <Button
              onPress={onOpenSupport}
              type="clear"
              titleStyle={{ fontSize: 14, fontFamily: "Fredoka_Medium", color: theme.colors.grey1}}
              buttonStyle={{ paddingHorizontal: 0 }}
            >
              {i18n.t("help")}
            </Button>
          ),
        }}
      />
    </Stack>
  );
}
