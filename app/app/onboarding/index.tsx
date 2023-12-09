import { router } from "expo-router";
import { Text, View } from "react-native";
import i18n from "../../../helpers/i18n";
import { Button } from "@rneui/themed";
import Container from "../../../components/Container";

export default function Onboarding(){
  return (
    <Container>
      <View style={{flex: 1}} />
      <Button onPress={() => router.push("/app/onboarding/sign-in")}>{i18n.t("onboarding.action")}</Button>
    </Container>
  );
}