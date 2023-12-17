import { Badge, Icon, Text, useTheme } from "@rneui/themed";
import { View } from "react-native";
import { FactType } from "../types";
import { getFontSize, isTrending } from "../helpers/utils";

export default function FactLabel({ fact }: { fact: FactType }) {
  const { theme } = useTheme();
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 10,
        paddingVertical: 10,
      }}
    >
      <Text
        style={{
          textAlign: "center",
          color: fact.color,
          fontFamily: "Fredoka_SemiBold",
          fontSize: getFontSize(fact.score),
          shadowColor: theme.colors.black,
          shadowOffset: {
            width: 1,
            height: 2,
          },
          shadowOpacity: 1,
          shadowRadius: 0,
        }}
      >
        {fact.text}
      </Text>
      {isTrending(fact) && (
        <Badge
          value={
            <Icon
              containerStyle={{ marginHorizontal: 0 }}
              name="trending-up"
              type="material-community"
              size={12}
              color="white"
            />
          }
          badgeStyle={{
            backgroundColor: theme.colors.secondary,
            borderWidth: 0,
          }}
          containerStyle={{ position: "absolute", top: 0, right: 0 }}
        />
      )}
    </View>
  );
}
