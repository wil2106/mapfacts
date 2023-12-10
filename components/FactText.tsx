import { TouchableOpacity } from "react-native";
import Svg, { Text } from "react-native-svg";

export default function Fact({
  fontSize,
  text,
}: {
  fontSize: number;
  text: string;
}) {
  const width = (fontSize * 198.62) / 30;
  const height = (fontSize * 24.8) / 30;
  return (
    <TouchableOpacity>
      <Svg height="60" width="200">
        <Text
          fill="white"
          fontSize={fontSize}
          fontWeight="bold"
          x="100"
          y="20"
          textAnchor="middle"
          fontFamily="LondrinaShadow_Regular"
        >
          {text}
        </Text>
      </Svg>
    </TouchableOpacity>
  );
}
