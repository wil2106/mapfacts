import { Avatar, ListItem, Text } from "@rneui/themed";

export default function PlaceItem({
  first,
  last,
  title,
  subtitle,
  photoUrl,
  onPress,
}: {
  first?: boolean;
  last?: boolean;
  title: string;
  subtitle: string;
  photoUrl?: string;
  onPress?: () => void;
}) {
  return (
    <ListItem bottomDivider={!last} onPress={onPress} first={first} last={last}>
      {photoUrl !== undefined && <Avatar rounded source={{ uri: photoUrl }} />}
      <ListItem.Content>
        <Text style={{fontFamily: "Fredoka_Medium"}}>{title}</Text>
        <Text style={{fontFamily: "Fredoka_Regular", fontSize: 12}}>{subtitle}</Text>
      </ListItem.Content>
      <ListItem.Chevron />
    </ListItem>
  );
}
