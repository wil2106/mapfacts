import { Redirect, Stack, router } from "expo-router";
import { Icon, Text, useTheme } from "@rneui/themed";
import i18n from "../../helpers/i18n";

export default function OnboardingLayout() {
  const { theme } = useTheme();
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.background,
        },
        headerTitle: (props) => <Text style={{fontSize: 16, fontFamily: "Fredoka_SemiBold"}}>{props.children}</Text>,
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
      <Stack.Screen name="index" options={{title: ""}}/>
      <Stack.Screen name="sign-in" options={{title: i18n.t("sign_in.title"), headerTitleStyle: {color: theme.colors.black}}}/>
    </Stack>
  );
}
