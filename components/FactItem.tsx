import { Avatar, Button, ListItem, Text, useTheme } from "@rneui/themed";

export default function FactItem({
  first,
  last,
  text,
  score,
  isHot,
  onPress,
  onDelete,
}: {
  first?: boolean;
  last?: boolean;
  text: string;
  score: number;
  isHot?: boolean;
  onPress?: () => void;
  onDelete?: () => void;
}) {
  const { theme } = useTheme();
  return (
    <ListItem bottomDivider={!last} onPress={onPress} first={first} last={last}>
      <ListItem.Content>
        <Text style={{ fontFamily: "Fredoka_Medium" }} numberOfLines={1}>
          {text}
        </Text>
      </ListItem.Content>
      <Text
        style={{
          fontFamily: "Fredoka_Regular",
          color: score >= 0 ? theme.colors.primary : theme.colors.tertiary,
        }}
      >
        {score > 0 ? "+" : ""}
        {score}
      </Text>
      {isHot && <Text>🔥</Text>}
      <ListItem.Chevron />
    </ListItem>
  );
}
