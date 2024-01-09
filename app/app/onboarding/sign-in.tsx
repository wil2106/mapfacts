import { Linking, View } from "react-native";
import Container from "../../../components/Container";
import { Button, Input, Text, useTheme } from "@rneui/themed";
import { router } from "expo-router";
import i18n from "../../../helpers/i18n";
import { useEffect, useRef, useState } from "react";
import { supabase } from "../../../supabase/supabase";
import * as Haptics from "expo-haptics";
import validator from "validator";
import { HandledError } from "../../../helpers/error";
import { openInbox } from "react-native-email-link";
import KeyboardAwareContainer from "../../../components/KeyboardAwareContainer";
import { PRIVACY_POLICY_URL, TERMS_OF_SERVICE_URL, WEBSITE_URL } from "../../../helpers/constants";

interface State {
  email: string;
  errorMessage: string;
  loading: boolean;
  countdown: number;
  sent: boolean;
}

export default function Signin() {
  const countdownRef = useRef<number>(60);
  const countdownInterval = useRef<any>();
  const { theme } = useTheme();
  const [state, setState] = useState<State>({
    email: "",
    errorMessage: "",
    loading: false,
    countdown: 0,
    sent: false,
  });

  const onSubmit = async () => {
    setState((prev) => ({
      ...prev,
      loading: true,
      errorMessage: "",
      sent: false,
    }));
    const formattedEmail = state.email.trim();
    try {
      if (!validator.isEmail(formattedEmail)) {
        throw new HandledError(i18n.t("sign_in.invalid_email"));
      }
      const { error } = await supabase.auth.signInWithOtp({
        email: state.email,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: `${WEBSITE_URL}/app/onboarding/sign-in`,
        },
      });

      if (error) {
        throw error;
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      setState((prev) => ({ ...prev, countdown: 60, sent: true }));
      countdownInterval.current = setInterval(() => {
        if (countdownRef.current === 0) {
          countdownRef.current = 60;
          clearInterval(countdownInterval.current);
        }
        countdownRef.current -= 1;
        setState((prev) => ({ ...prev, countdown: prev.countdown - 1 }));
      }, 1000);
    } catch (err: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      if (err instanceof HandledError) {
        setState((prev) => ({ ...prev, errorMessage: err.message }));
      } else {
        console.error(err);
        setState((prev) => ({
          ...prev,
          errorMessage: i18n.t("default_error_message"),
        }));
      }
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  return (
    <KeyboardAwareContainer>
      <View style={{ flexDirection: "column", gap: 6 }}>
        <Text
          style={{
            textTransform: "uppercase",
            fontFamily: "Fredoka_SemiBold",
            fontSize: 12,
          }}
        >
          {i18n.t("sign_in.input_title")}
        </Text>
        <Input
          onChangeText={(email) => setState((prev) => ({ ...prev, email }))}
          placeholder={i18n.t("sign_in.input_placeholder")}
          keyboardType="email-address"
          autoFocus
          autoCapitalize="none"
          autoCorrect={false}
          spellCheck={false}
        />
        {state.errorMessage.length > 0 && (
          <Text
            style={{
              color: theme.colors.error,
              fontSize: 12,
              textAlign: "center",
            }}
          >
            {state.errorMessage}
          </Text>
        )}
        {state.sent && (
          <Text style={{ color: theme.colors.grey1, fontSize: 12 }}>
            {i18n.t("sign_in.message")}
          </Text>
        )}
      </View>
      <View style={{ flex: 1 }} />
      <View style={{flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 4}}>
        <Text style={{ color: theme.colors.grey1, fontSize: 12 }}>
          {i18n.t("sign_in.legal_part1")}
        </Text>
        <Text
          style={{ color: theme.colors.grey1, fontSize: 12, fontFamily: "Fredoka_SemiBold" }}
          onPress={() => {
            Linking.openURL(PRIVACY_POLICY_URL);
          }}
        >
          {i18n.t("sign_in.legal_part2")}
        </Text>
        <Text style={{ color: theme.colors.grey1, fontSize: 12 }}>
          {i18n.t("sign_in.legal_part3")}
        </Text>
        <Text
          style={{ color: theme.colors.grey1, fontSize: 12, fontFamily: "Fredoka_SemiBold" }}
          onPress={() => {
            Linking.openURL(TERMS_OF_SERVICE_URL);
          }}
        >
          {i18n.t("sign_in.legal_part4")}
        </Text>
      </View>
      {state.sent && (
        <Button onPress={() => openInbox()} color="secondary">
          {i18n.t("sign_in.open_mail_inbox")}
        </Button>
      )}
      <Button
        onPress={onSubmit}
        loading={state.loading}
        disabled={state.loading || state.countdown > 0}
      >
        {state.countdown > 0
          ? i18n.t("sign_in.resend_in", { countdown: state.countdown })
          : i18n.t("sign_in.send")}
      </Button>
    </KeyboardAwareContainer>
  );
}
