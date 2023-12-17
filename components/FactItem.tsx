import {
  Avatar,
  Button,
  Chip,
  Icon,
  ListItem,
  Text,
  useTheme,
} from "@rneui/themed";
import { FactType } from "../types";
import { isTrending } from "../helpers/utils";

export default function FactItem({
  first,
  last,
  fact,
  onPress,
  onDelete,
}: {
  first?: boolean;
  last?: boolean;
  fact: FactType;
  onPress?: () => void;
  onDelete?: () => void;
}) {
  const { theme } = useTheme();
  return (
    <ListItem bottomDivider={!last} onPress={onPress} first={first} last={last}>
      <ListItem.Content>
        <Text style={{ fontFamily: "Fredoka_Medium" }} numberOfLines={1}>
          {fact.text}
        </Text>
      </ListItem.Content>
      <Text
        style={{
          fontFamily: "Fredoka_Medium",
          color: fact.score >= 0 ? theme.colors.primary : theme.colors.tertiary,
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
      {isTrending(fact) && (
        <Icon
          name="trending-up"
          type="material-community"
          size={20}
          color={theme.colors.secondary}
        />
      )}
      <ListItem.Chevron />
    </ListItem>
  );
}
