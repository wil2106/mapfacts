import { Avatar, ListItem, Text } from "@rneui/themed";
import { PlaceType } from "../types";

export default function PlaceItem({
  first,
  last,
  place,
  onPress,
}: {
  first?: boolean;
  last?: boolean;
  place: PlaceType;
  onPress?: () => void;
}) {
  return (
    <ListItem bottomDivider={!last} onPress={onPress} first={first} last={last}>
      {/* {place.photoUrl !== undefined && <Avatar rounded source={{ uri: photoUrl }} />} */}
      <ListItem.Content>
        <Text style={{fontFamily: "Fredoka_Medium"}}>{place.name}</Text>
        <Text style={{fontFamily: "Fredoka_Regular", fontSize: 12}}>{place.formattedAddress}</Text>
      </ListItem.Content>
      <ListItem.Chevron />
    </ListItem>
  );
}
