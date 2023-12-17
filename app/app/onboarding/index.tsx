import { router } from "expo-router";
import { Text, View } from "react-native";
import i18n from "../../../helpers/i18n";
import { Button, Image } from "@rneui/themed";
import Container from "../../../components/Container";

export default function Onboarding() {
  return (
    <Container>
      <View style={{flex: 1, justifyContent: "center", alignItems: "center", gap: 10}}>
        <Image
          style={{ width: 150, height: 150, borderRadius: 20}}
          source={require("../../../assets/images/icon.png")}
        />
        <Text style={{fontFamily: "Fredoka_SemiBold", fontSize: 22}}>MapFacts</Text>
      </View>
      <Button onPress={() => router.push("/app/onboarding/sign-in")}>
        {i18n.t("onboarding.action")}
      </Button>
    </Container>
  );
}
