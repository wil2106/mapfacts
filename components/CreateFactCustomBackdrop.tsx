import { type BottomSheetBackdropProps } from "@gorhom/bottom-sheet";
import { Input, Text, useTheme } from "@rneui/themed";
import React, { useMemo } from "react";
import { View } from "react-native";
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
} from "react-native-reanimated";

export default function CreateFactCustomBackdrop({
  animatedIndex,
  style,
}: BottomSheetBackdropProps) {
  const {theme} = useTheme();
  // animated variables
  const containerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      animatedIndex.value + 1,
      [0.0, 0.5],
      [0.0, 0.5],
      Extrapolate.CLAMP
    ),
    backgroundColor: "#000",
    width: "100%",
    height: "100%",
  }));

  // styles
  const containerStyle = useMemo(
    () => [
      style,
      {
        backgroundColor: "#000",
      },
      containerAnimatedStyle,
    ],
    [style, containerAnimatedStyle]
  );

  return (
    <View style={[style]} pointerEvents="box-none">
      <Animated.View style={containerAnimatedStyle} pointerEvents="box-none"/>
      <View style={{position: "absolute", width: "100%", height: "100%", justifyContent: "center", alignItems: "center"}} pointerEvents="box-none">
        <Input
          inputStyle={{ backgroundColor: "transparent", color: "white", textAlign: "center", fontSize: 22, fontFamily: "Fredoka_SemiBold" }}
          style={{ backgroundColor: "transparent" }}
          containerStyle={{ backgroundColor: "transparent" }}
          inputContainerStyle={{ backgroundColor: "transparent" }}
          placeholder="A useful/interesting fact"
          placeholderTextColor="#ffffff70"
          autoFocus
        />
      </View>
    </View>
  );
}
