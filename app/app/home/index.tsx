import {
  ActivityIndicator,
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
import MapView, {
  Details,
  Heatmap,
  Marker,
  PROVIDER_GOOGLE,
  Region,
} from "react-native-maps";
import { CUSTOM_MAP_STYLE } from "../../../helpers/constants";
import { Badge, Icon, useTheme } from "@rneui/themed";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import i18n from "../../../helpers/i18n";
import { FactType } from "../../../types";
import randomColor from "randomcolor";
import { getFontSize, getMinScore, getNewKnownArea, getUnknownArea } from "../../../helpers/utils";
import _ from "lodash";
import * as turf from "@turf/turf";
import { StatusBar } from "expo-status-bar";

export default function Index() {
  const { theme } = useTheme();
  const knownAreaRef = useRef<turf.helpers.Feature<turf.helpers.Polygon | turf.helpers.MultiPolygon, turf.helpers.Properties> | null>(null);
  const [state, setState] = useState<{
    recenterLoading: boolean;
    factsLoading: boolean;
    minScore: number;
    facts: FactType[];
  }>({
    recenterLoading: false,
    factsLoading: false,
    minScore: 100,
    facts: [
      {
        angled: 0,
        createdat: "2023-12-05T16:28:41.384",
        id: 1,
        latitude: 40.807416,
        longitude: -73.946823,
        radiusm: 1000,
        text: "Quartier sympa",
        score: 0,
        color: "#c1deff",
      },
      {
        angled: 0,
        createdat: "2023-12-05T16:28:41.384",
        id: 2,
        latitude: 40.807475,
        longitude: -73.94581,
        radiusm: 500,
        text: "Ça craint ici",
        score: 10,
        color: "#ed6fb8",
      },
      {
        angled: 0,
        createdat: "2023-12-05T16:28:41.384",
        id: 3,
        latitude: 40.80629,
        longitude: -73.945826,
        radiusm: 300,
        text: "Les gens sont aigris",
        score: 100,
        color: "#72ff8a",
      },
    ],
  });

  const mapRef = useRef<MapView>(null);
  const pushNotificationPermRequested = usePersistStore(
    (state) => state.pushNotificationPermRequested
  );
  const region = usePersistStore((state) => state.region);
  const locationEnabled = useFlashStore((state) => state.locationEnabled);
  const setLocationEnabled = useFlashStore((state) => state.setLocationEnabled);
  const teleport = useFlashStore((state) => state.teleport);
  const setRegion = usePersistStore((state) => state.setRegion);

  useEffect(() => {
    if (!pushNotificationPermRequested) {
      return router.replace("/app/home/push-notifications-perm");
    }
    getPositionAndRecenter(false);
  }, []);

  useEffect(() => {
    if (teleport !== null && mapRef.current) {
      mapRef.current.animateToRegion(teleport, 1000);
    }
  }, [teleport]);

  const onRegionChangeComplete = async (
    newRegion: Region,
    details: Details
  ) => {
    setRegion(newRegion);
    try {
      setState((prev) => ({ ...prev, factsLoading: true }));
      const minLatitude = newRegion.latitude - newRegion.latitudeDelta / 2;
      const minLongitude = newRegion.longitude - newRegion.longitudeDelta / 2;
      const maxLatitude = newRegion.latitude + newRegion.latitudeDelta / 2;
      const maxLongitude = newRegion.longitude + newRegion.longitudeDelta / 2;

      const cameraArea = turf.polygon([
        [
          [minLongitude, minLatitude],
          [minLongitude, maxLatitude],
          [maxLongitude, minLatitude],
          [maxLongitude, maxLatitude],
          [minLongitude, minLatitude],
        ],
      ]);
      const unknownArea = getUnknownArea(cameraArea, knownAreaRef.current)
      // const { data, error } = await supabase.rpc("facts_in_view", {
      //   min_lat: minLatitude,
      //   min_long: minLongitude,
      //   max_lat: maxLatitude,
      //   max_long: maxLongitude,
      // });
      // console.log(data);
      // setState((prev) => ({ ...prev, facts: data }));
      knownAreaRef.current = getNewKnownArea(cameraArea, knownAreaRef.current);
    } catch (err) {
      console.error(err);
      alert(i18n.t("default_error_message"));
    } finally {
      setState((prev) => ({ ...prev, factsLoading: false }));
    }
  };

  const onRegionChange = _.debounce(
    async (newRegion: Region, details: Details) => {
      const coords = await mapRef?.current?.getCamera();
      if (!coords?.zoom) {
        return;
      }
      setState((prev) => ({
        ...prev,
        minScore: getMinScore(coords.zoom as number),
      }));
    },
    500
  );

  const getPositionAndRecenter = async (openSettings: boolean) => {
    setState((prev) => ({ ...prev, recenterLoading: true }));
    let { status } = await Location.getForegroundPermissionsAsync();
    if (status !== "granted") {
      setLocationEnabled(false);
      if (openSettings) {
        Linking.openSettings();
      }
      setState((prev) => ({ ...prev, recenterLoading: false }));
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
    setState((prev) => ({ ...prev, recenterLoading: false }));
  };

  return (
    <View style={{ flex: 1, position: "relative" }}>
      <StatusBar style="light" />
      <MapView
        ref={mapRef}
        style={{ flex: 1 }}
        provider={PROVIDER_GOOGLE}
        initialRegion={region}
        onRegionChangeComplete={onRegionChangeComplete}
        onRegionChange={onRegionChange}
        minZoomLevel={12}
        customMapStyle={CUSTOM_MAP_STYLE}
      >
        {state.facts.map((fact) => (
          <Marker
            key={fact.id}
            coordinate={{ latitude: fact.latitude, longitude: fact.longitude }}
            rotation={fact.angled}
            opacity={fact.score >= state.minScore ? 1 : 0}
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
          </Marker>
        ))}
        <Heatmap
          opacity={0.8}
          radius={60}
          gradient={{
            colors: ["transparent", "#0FACFD", "#FFFC01", "#F33C58"],
            startPoints: [0.0, 0.2, 0.6, 1.0],
            colorMapSize: 256,
          }}
          points={state.facts.map((fact) => ({
            latitude: fact.latitude,
            longitude: fact.longitude,
          }))}
        />
      </MapView>
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
            {state.recenterLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
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
                      <Icon
                        name="alert"
                        type="ionicon"
                        color="white"
                        size={12}
                      />
                    }
                    containerStyle={{ position: "absolute", top: 0, right: 0 }}
                  />
                )}
              </>
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
          {state.factsLoading && (
            <ActivityIndicator
              color={theme.colors.white}
              size="large"
              style={{ position: "absolute", top: 5, alignSelf: "center" }}
            />
          )}
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
              iconStyle={{
                color: theme.colors.primary,
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