import { useEffect } from "react";
import { supabase } from "../supabase/supabase";
import { Linking } from "react-native";

export default function useDeeplinkListener() {
  useEffect(() => {
    const handleUrlRedirect = async (url: string | null) => {
      if (!url) return;
      console.log(url);

      // Extract the part after the '#'
      const fragment = url.split("#")[1];
      if (!fragment) return;

      // Convert the fragment into an object
      const params = new URLSearchParams(fragment);
      const access_token = params.get("access_token");
      const refresh_token = params.get("refresh_token");

      try {
        if (
          typeof access_token !== "string" ||
          typeof refresh_token !== "string"
        ) {
          throw new Error("No access token or refresh token");
        }

        await supabase.auth.setSession({
          access_token,
          refresh_token,
        });

      } catch (e) {
        //alert(i18n.t("deep_link_error"));
        console.error(e);
      }
    };

    Linking.getInitialURL().then((url) => {
      handleUrlRedirect(url);
    });

    const subscription = Linking.addEventListener("url", ({ url }) => {
      handleUrlRedirect(url);
    });

    return () => {
      subscription.remove();
    };
  }, []);
}
