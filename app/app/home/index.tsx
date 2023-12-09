import {
  Linking,
  SafeAreaView,
  SafeAreaViewBase,
  Text,
  View,
} from "react-native";
import { supabase } from "../../../supabase/supabase";
import { useFlashStore, usePersistStore } from "../../../helpers/zustand";
import { createRef, useEffect, useRef, useState } from "react";
import { router } from "expo-router";
import * as Location from "expo-location";
import MapView, { Details, PROVIDER_GOOGLE, Region } from "react-native-maps";
import { CUSTOM_MAP_STYLE } from "../../../helpers/constants";
import { Badge, Icon, useTheme } from "@rneui/themed";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Index() {
  const { theme } = useTheme();
  const safeAreaInsets = useSafeAreaInsets();

  const mapRef = useRef<MapView>(null);
  const pushNotificationPermRequested = usePersistStore(
    (state) => state.pushNotificationPermRequested
  );
  const region = usePersistStore((state) => state.region);
  const locationEnabled = useFlashStore((state) => state.locationEnabled);
  const setLocationEnabled = useFlashStore((state) => state.setLocationEnabled);
  const setRegion = usePersistStore((state) => state.setRegion);
  useEffect(() => {
    if (!pushNotificationPermRequested) {
      return router.replace("/app/home/push-notifications-perm");
    }
    getPositionAndRecenter(false);
  }, []);

  const onRegionChange = (newRegion: Region, details: Details) => {
    console.log(newRegion);
    setRegion(newRegion);
  };

  const getPositionAndRecenter = async (openSettings: boolean) => {
    let { status } = await Location.getForegroundPermissionsAsync();
    if (status !== "granted") {
      setLocationEnabled(false);
      if (openSettings) {
        Linking.openSettings();
      }
      return;
    }
    setLocationEnabled(true);
    let location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
      distanceInterval: 5,
    });
    const currentRegion = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    };
    if (mapRef.current) {
      mapRef.current.animateToRegion(currentRegion, 1000);
    }
  };

  return (
    <View style={{ flex: 1, position: "relative" }}>
      <MapView
        ref={mapRef}
        style={{ flex: 1 }}
        customMapStyle={CUSTOM_MAP_STYLE}
        provider={PROVIDER_GOOGLE}
        initialRegion={region}
        onRegionChangeComplete={onRegionChange}
        minZoomLevel={12}
      ></MapView>
      <SafeAreaView
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          pointerEvents: "box-none",
        }}
      >
        <View style={{ flex: 1, pointerEvents: "box-none" }}>
          <View
            style={{
              position: "absolute",
              bottom: 0,
              alignSelf: "center",
            }}
          >
            <Icon
              raised
              name="location-arrow"
              type="font-awesome"
              onPress={() => getPositionAndRecenter(true)}
              size={20}
            />
            {!locationEnabled && (
              <Badge
                status="error"
                value={
                  <Icon name="alert" type="ionicon" color="white" size={12} />
                }
                containerStyle={{ position: "absolute", top: 0, right: 0 }}
              />
            )}
          </View>
          <Icon
            containerStyle={{
              position: "absolute",
              bottom: 0,
              right: 16,
              marginHorizontal: 0,
              marginVertical: 0,
            }}
            raised
            name="chat-plus"
            type="material-community"
            reverse
            color={theme.colors.primary}
            onPress={() => console.log("hello")}
          />
          <Icon
            containerStyle={{
              position: "absolute",
              top: 0,
              left: 16,
              marginHorizontal: 0,
              marginVertical: 0,
            }}
            name="user-alt"
            type="font-awesome-5"
            reverse
            color="rgba(0, 0, 0, 0.3)"
            onPress={() => router.push("/app/home/account")}
            size={20}
          />
          <View
            style={{
              position: "absolute",
              top: 0,
              right: 16,
              marginHorizontal: 0,
              marginVertical: 0,
              flexDirection: "column",
              gap: 10,
            }}
          >
            <Icon
              containerStyle={{
                marginHorizontal: 0,
                marginVertical: 0,
              }}
              name="search"
              type="font-awesome"
              reverse
              color="rgba(0, 0, 0, 0.3)"
              onPress={() => router.push("/app/home/search")}
              size={20}
            />
            <Icon
              containerStyle={{
                marginHorizontal: 0,
                marginVertical: 0,
              }}
              name="radar"
              type="material-community"
              reverse
              color="rgba(0, 0, 0, 0.3)"
              onPress={() => router.push("/app/home/radar-settings")}
              size={20}
            />
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}
