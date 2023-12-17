import { Icon, useTheme } from "@rneui/themed";
import { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  cancelAnimation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

const MAX_SIZE = 80;

export default function RadarButton({
  enabled,
  onPress,
}: {
  enabled: boolean;
  onPress: () => void;
}) {
  const { theme } = useTheme();
  const size = useSharedValue(0);
  const pulseAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(
        size.value,
        [0, MAX_SIZE],
        [1, 0],
      ),
      height: size.value,
      width: size.value,
      position: "absolute",
      borderRadius: 1000,
      backgroundColor: "#0BA8F750"
    };
  });

  useEffect(() => {
    if (enabled) {
      size.value = withRepeat(withTiming(MAX_SIZE, { duration: 2000 }), -1);
    } else {
      cancelAnimation(size);
    }
  }, [enabled]);

  return (
    <View style={{ justifyContent: "center", alignItems: "center" }}>
      <Animated.View style={pulseAnimatedStyle} />
      <Icon
        containerStyle={{
          marginHorizontal: 0,
          marginVertical: 0,
        }}
        iconStyle={{
          color: enabled ? theme.colors.primary : "white",
        }}
        name="radar"
        type="material-community"
        reverse
        color="rgba(0, 0, 0, 0.3)"
        onPress={onPress}
        size={20}
      />
    </View>
  );
}
