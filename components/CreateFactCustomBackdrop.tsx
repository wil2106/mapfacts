import { type BottomSheetBackdropProps } from "@gorhom/bottom-sheet";
import { Icon, Input, Slider, Text, useTheme } from "@rneui/themed";
import React, { Children, useEffect, useMemo } from "react";
import { Dimensions, SafeAreaView, View } from "react-native";
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import i18n from "../helpers/i18n";
import { useFlashStore } from "../helpers/zustand";
import * as Haptics from "expo-haptics";

const windowHeight = Dimensions.get("window").height;

export default function CreateFactCustomBackdrop({
  animatedIndex,
  style,
}: BottomSheetBackdropProps) {
  const rotation = useSharedValue(0);
  const createFactRadius = useFlashStore((state) => state.createFactRadius);
  const createFactRotation = useFlashStore((state) => state.createFactRotation);
  const setCreateFactRadius = useFlashStore((state) => state.setCreateFactRadius);
  const setCreateFactRotation = useFlashStore((state) => state.setCreateFactRotation);
  const setCreateFactText = useFlashStore((state) => state.setCreateFactText);
  
  const { theme } = useTheme();

  useEffect(() => {
    setCreateFactText("");
    setCreateFactRadius(5);
    setCreateFactRotation(0);
  }, []);

  const backgroundAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      animatedIndex.value + 1,
      [0.0, 0.6],
      [0.0, 0.6],
      Extrapolate.CLAMP
    ),
    backgroundColor: "#000",
    width: "100%",
    height: "100%",
  }));

  const inputContainerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
    width: "100%",
  }));

  const onRadiusChange = (value: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setCreateFactRadius(value);
  }

  const onRotationChange = (value: number) => {
    rotation.value = value;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setCreateFactRotation(value);
  }

  const onFocusInput = () => {
    rotation.value = withSpring(0);
  }

  const onBlurInput = () => {
    rotation.value = withSpring(createFactRotation);
  }

  return (
    <View style={[style]} pointerEvents="box-none">
      <Animated.View style={backgroundAnimatedStyle} pointerEvents="box-none" />
      <SafeAreaView
        style={{
          position: "absolute",
          width: "100%",
          flexDirection: "column",
          top: 100,
          justifyContent: "center",
          gap: 6,
        }}
        pointerEvents="none"
      >
        <Text
          style={{ color: "white", textAlign: "center", marginHorizontal: 16 }}
        >
          {i18n.t("create_fact.message")}
        </Text>
        <Icon name="gesture-pinch" type="material-community" color="white" />
      </SafeAreaView>
      <View
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          justifyContent: "center",
          alignItems: "center",
        }}
        pointerEvents="box-none"
      >
        <Animated.View style={inputContainerAnimatedStyle}>
          <Input
            onChangeText={setCreateFactText}
            inputStyle={{
              backgroundColor: "transparent",
              color: "white",
              textAlign: "center",
              fontSize: 20,
              fontFamily: "Fredoka_SemiBold",
            }}
            inputContainerStyle={{
              backgroundColor: "transparent",
              paddingHorizontal: 0,
              paddingVertical: 0,
            }}
            placeholder={i18n.t("create_fact.placeholder")}
            placeholderTextColor="#ffffff90"
            autoFocus
            onFocus={onFocusInput}
            onBlur={onBlurInput}
          />
        </Animated.View>
      </View>
      <View
        style={{
          position: "absolute",
          width: "100%",
          flexDirection: "column",
          bottom: windowHeight * 0.12,
          justifyContent: "center",
          marginBottom: 20,
          paddingHorizontal: 16,
          gap: 6,
        }}
        pointerEvents="box-none"
      >
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={{ color: "white" }}>Radius</Text>
          <Text style={{ color: "white" }}>{`${createFactRadius}m`}</Text>
        </View>
        <Slider
          onValueChange={onRadiusChange}
          minimumValue={5}
          maximumValue={2000}
          step={1}
          thumbProps={{
            children: (
              <Icon
                name="drag-vertical"
                type="material-community"
                color={theme.colors.grey2}
                size={20}
              />
            ),
          }}
        />
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={{ color: "white" }}>Rotation</Text>
          <Text style={{ color: "white" }}>{`${createFactRotation}°`}</Text>
        </View>
        <Slider
          onValueChange={onRotationChange}
          minimumValue={0}
          maximumValue={360}
          step={1}
          thumbProps={{
            children: (
              <Icon
                name="drag-vertical"
                type="material-community"
                color={theme.colors.grey2}
                size={20}
              />
            ),
          }}
        />
      </View>
    </View>
  );
}
