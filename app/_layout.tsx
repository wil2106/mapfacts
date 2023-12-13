import { useFonts } from "expo-font";
import { Slot, SplashScreen, Stack, router, usePathname } from "expo-router";
import { useEffect } from "react";
import useAuthListener from "../hooks/useAuthStateListener";
import { ThemeProvider, useTheme } from "@rneui/themed";
import theme from "../helpers/theme";
import { StatusBar } from "expo-status-bar";
import { Linking } from "react-native";
import useDeeplinkListener from "../hooks/useDeeplinkListener";
import * as Notifications from "expo-notifications";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { setDefaultOptions } from "date-fns";
import { enUS, fr } from "date-fns/locale";
import i18n from "../helpers/i18n";
import Toast from "react-native-toast-message";

setDefaultOptions({ locale: i18n.locale === "fr" ? fr : enUS });

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Fredoka_Bold: require("../assets/fonts/Fredoka-Bold.ttf"),
    Fredoka_Light: require("../assets/fonts/Fredoka-Light.ttf"),
    Fredoka_Medium: require("../assets/fonts/Fredoka-Medium.ttf"),
    Fredoka_Regular: require("../assets/fonts/Fredoka-Regular.ttf"),
    Fredoka_SemiBold: require("../assets/fonts/Fredoka-SemiBold.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  useAuthListener();
  useDeeplinkListener();

  return (
    <>
      <ThemeProvider theme={theme}>
        <BottomSheetModalProvider>
          <StatusBar style="dark" />
          <Slot />
        </BottomSheetModalProvider>
      </ThemeProvider>
      <Toast />
    </>
  );
}
