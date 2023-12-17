import {
  ActivityIndicator,
  Linking,
  SafeAreaView,
  SafeAreaViewBase,
  Text,
  View,
} from "react-native";
import {
  BottomSheetModal,
  BottomSheetModalProvider,
} from "@gorhom/bottom-sheet";
import { supabase } from "../../../supabase/supabase";
import { useFlashStore, usePersistStore } from "../../../helpers/zustand";
import { createRef, useEffect, useMemo, useRef, useState } from "react";
import { Stack, router } from "expo-router";
import * as Location from "expo-location";
import MapView, {
  Circle,
  Details,
  Heatmap,
  Marker,
  PROVIDER_GOOGLE,
  Polygon,
  Region,
} from "react-native-maps";
import {
  BASE_LATITUDE_DELTA,
  BASE_LONGITUDE_DELTA,
  CUSTOM_MAP_STYLE,
} from "../../../helpers/constants";
import { Badge, Button, Icon, useTheme } from "@rneui/themed";
import i18n from "../../../helpers/i18n";
import { FactType } from "../../../types";
import {
  getFontSize,
  getMinScore,
  getNewKnownArea,
  getRegion,
  getUnknownArea,
} from "../../../helpers/utils";
import _ from "lodash";
import * as turf from "@turf/turf";
import { StatusBar } from "expo-status-bar";
import { useLocalSearchParams } from "expo-router";
import { HandledError } from "../../../helpers/error";
import Fact from "../../../components/Fact";
import CreateFactEditor from "../../../components/CreateFactEditor";
import CustomHeatmap from "../../../components/CustomHeatMap";
import FactLabel from "../../../components/FactLabel";
import RadarButton from "../../../components/RadarButton";

const DEBUG_MODE = false;

export default function Index() {
  const { theme } = useTheme();
  const viewFactBottomSheetRef = useRef<BottomSheetModal>(null);
  const knownAreaRef = useRef<turf.helpers.Feature<
    turf.helpers.Polygon | turf.helpers.MultiPolygon,
    turf.helpers.Properties
  > | null>(null);
  const [state, setState] = useState<{
    centerLoading: boolean;
    factsLoading: boolean;
    minScore: number;
    createMode: boolean;
    debugKnownArea: turf.helpers.Feature<
      turf.helpers.Polygon | turf.helpers.MultiPolygon,
      turf.helpers.Properties
    > | null;
    debugUnknownArea: turf.helpers.Feature<
      turf.helpers.Polygon | turf.helpers.MultiPolygon,
      turf.helpers.Properties
    > | null;
  }>({
    centerLoading: false,
    factsLoading: false,
    minScore: 100,
    createMode: false,
    debugKnownArea: null,
    debugUnknownArea: null,
  });

  const { factId } = useLocalSearchParams();
  const mapRef = useRef<MapView>(null);
  const pushNotificationPermRequested = usePersistStore(
    (state) => state.pushNotificationPermRequested
  );
  const region = usePersistStore((state) => state.region);
  const locationEnabled = useFlashStore((state) => state.locationEnabled);
  const setLocationEnabled = useFlashStore((state) => state.setLocationEnabled);
  const teleport = useFlashStore((state) => state.teleport);
  const setRegion = usePersistStore((state) => state.setRegion);
  const selectedFact = useFlashStore((state) => state.selectedFact);
  const setSelectedFact = useFlashStore((state) => state.setSelectedFact);
  const mapFacts = useFlashStore((state) => state.mapFacts);
  const createFactRadius = useFlashStore((state) => state.createFactRadius);
  const sessionUser = useFlashStore((state) => state.sessionUser);
  const addMapFacts = useFlashStore((state) => state.addMapFacts);
  const user = useFlashStore((state) => state.user);
  const pushNotificationsEnabled = useFlashStore((state) => state.pushNotificationsEnabled);

  useEffect(() => {
    if (!pushNotificationPermRequested) {
      return router.replace("/app/home/push-notifications-perm");
    }
    const parsedFactId = parseInt(factId as string);
    if (isNaN(parsedFactId)) {
      //getPositionAndCenter(false);
    } else {
      getFactAndCenter(parsedFactId);
    }
  }, []);

  useEffect(() => {
    if (teleport !== null && mapRef.current) {
      mapRef.current.animateToRegion(teleport, 1000);
    }
  }, [teleport]);

  useEffect(() => {
    if (
      selectedFact !== null &&
      viewFactBottomSheetRef.current &&
      mapRef.current
    ) {
      const newRegion = getRegion(
        selectedFact.latitude,
        selectedFact.longitude,
        selectedFact.radiusm
      );
      mapRef.current.animateToRegion(newRegion, 1000);
      viewFactBottomSheetRef.current?.present();
    }
  }, [selectedFact]);

  const onRegionChangeComplete = async (
    newRegion: Region,
    details: Details
  ) => {
    setRegion(newRegion);
    try {
      if (!sessionUser?.id) {
        throw new Error("User id missing");
      }
      setState((prev) => ({ ...prev, factsLoading: true }));
      const minLatitude = newRegion.latitude - newRegion.latitudeDelta / 2;
      const minLongitude = newRegion.longitude - newRegion.longitudeDelta / 2;
      const maxLatitude = newRegion.latitude + newRegion.latitudeDelta / 2;
      const maxLongitude = newRegion.longitude + newRegion.longitudeDelta / 2;

      const cameraArea = turf.polygon([
        [
          [maxLongitude, minLatitude],
          [maxLongitude, maxLatitude],
          [minLongitude, maxLatitude],
          [minLongitude, minLatitude],
          [maxLongitude, minLatitude],
        ],
      ]);
      const unknownArea = getUnknownArea(cameraArea, knownAreaRef.current);
      if (unknownArea?.geometry) {
        const { data, error } = await supabase.rpc("facts_in_area", {
          user_id: sessionUser.id,
          polygons: unknownArea.geometry,
        });
        console.log("NEW", data);
        addMapFacts(data);
        const knownArea = getNewKnownArea(cameraArea, knownAreaRef.current);
        knownAreaRef.current = knownArea;
        if (__DEV__ && DEBUG_MODE) {
          setState((prev) => ({ ...prev, knownArea, unknownArea }));
        }
      }
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

  const getPositionAndCenter = async (openSettings: boolean) => {
    setState((prev) => ({ ...prev, centerLoading: true }));
    let { status } = await Location.getForegroundPermissionsAsync();
    if (status !== "granted") {
      setLocationEnabled(false);
      if (openSettings) {
        Linking.openSettings();
      }
      setState((prev) => ({ ...prev, centerLoading: false }));
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
      latitudeDelta: BASE_LATITUDE_DELTA,
      longitudeDelta: BASE_LONGITUDE_DELTA,
    };
    if (mapRef.current) {
      mapRef.current.animateToRegion(currentRegion, 1000);
    }
    setState((prev) => ({ ...prev, centerLoading: false }));
  };

  const getFactAndCenter = async (factId: number) => {
    try {
      const { data, error } = await supabase.rpc("fact", {
        fact_id: factId,
      });
      if (error) {
        throw error;
      }
      if (!data || data.length === 0) {
        throw new HandledError(i18n.t("fact_not_found"));
      }
      setSelectedFact(data[0]);
    } catch (err) {
      if (err instanceof HandledError) {
        alert(err.message);
      } else {
        console.error(err);
        alert(i18n.t("default_error_message"));
      }
    }
  };

  const onDismissSelectedFact = () => {
    viewFactBottomSheetRef.current?.close();
    setSelectedFact(null);
  };

  const onCenter = (fact: FactType) => {
    if (!mapRef.current) {
      return;
    }
    const newRegion = getRegion(fact.latitude, fact.longitude, fact.radiusm);
    mapRef.current.animateToRegion(newRegion, 1000);
  };

  return (
    <View style={{ flex: 1, position: "relative" }}>
      <Stack.Screen options={{ headerShown: false }} />
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
        rotateEnabled={false}
        pitchEnabled={false}
      >
        {mapFacts.map((fact) => (
          <Marker
            key={fact.id}
            coordinate={{ latitude: fact.latitude, longitude: fact.longitude }}
            rotation={fact.angled}
            opacity={
              selectedFact !== null
                ? selectedFact.id === fact.id
                  ? 1
                  : 0
                : fact.score >= state.minScore
                ? 1
                : 0
            }
            onPress={() => {
              if (fact.score >= state.minScore) {
                setSelectedFact(fact);
              }
            }}
          >
            <FactLabel fact={fact} />
          </Marker>
        ))}
        {!selectedFact && <CustomHeatmap mapFacts={mapFacts} />}
        {selectedFact && (
          <Circle
            center={{
              latitude: selectedFact.latitude,
              longitude: selectedFact.longitude,
            }}
            radius={selectedFact.radiusm}
            strokeColor={theme.colors.primary}
            fillColor="#0BA8F720"
            strokeWidth={2}
          />
        )}
        {state.createMode && (
          <Circle
            center={{
              latitude: region.latitude,
              longitude: region.longitude,
            }}
            radius={createFactRadius}
            strokeColor={theme.colors.primary}
            fillColor="#0BA8F720"
            strokeWidth={2}
          />
        )}
        {__DEV__ &&
          DEBUG_MODE &&
          state.debugKnownArea?.geometry.coordinates.map((polygon, index) => {
            return (
              <Polygon
                key={`known-area-polys-${index}`}
                coordinates={polygon.map((coords) => ({
                  latitude: coords[1] as number,
                  longitude: coords[0] as number,
                }))}
                strokeColor="#00F"
                fillColor="rgba(0,0,255,0.5)"
                strokeWidth={1}
              />
            );
          })}
        {__DEV__ &&
          DEBUG_MODE &&
          state.debugUnknownArea?.geometry.coordinates.map((polygon, index) => {
            return (
              <Polygon
                key={`unknown-area-polys-${index}`}
                coordinates={polygon.map((coords) => ({
                  latitude: coords[1] as number,
                  longitude: coords[0] as number,
                }))}
                strokeColor="#0F0"
                fillColor="rgba(0,255,0,0.5)"
                strokeWidth={1}
              />
            );
          })}
      </MapView>
      {!state.createMode && (
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
              {state.centerLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Icon
                    raised
                    name="location-arrow"
                    type="font-awesome"
                    onPress={() => getPositionAndCenter(true)}
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
                      containerStyle={{
                        position: "absolute",
                        top: 0,
                        right: 0,
                      }}
                      badgeStyle={{ borderWidth: 0 }}
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
              onPress={() => {
                setState((prev) => ({ ...prev, createMode: true }));
              }}
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
              onPress={() => {
                onDismissSelectedFact();
                router.push("/app/home/account");
              }}
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
                onPress={() => {
                  onDismissSelectedFact();
                  router.push("/app/home/search");
                }}
                size={20}
              />
              <RadarButton
                enabled={!!user?.radarEnabled}
                onPress={() => {
                  onDismissSelectedFact();
                  router.push("/app/home/radar-settings");
                }}
              />
            </View>
          </View>
        </SafeAreaView>
      )}
      <BottomSheetModal
        ref={viewFactBottomSheetRef}
        index={0}
        snapPoints={["30%"]}
        enablePanDownToClose={true}
        onDismiss={onDismissSelectedFact}
        backgroundStyle={{ backgroundColor: theme.colors.background }}
        handleIndicatorStyle={{ backgroundColor: theme.colors.grey2 }}
      >
        {selectedFact && (
          <Fact
            fact={selectedFact}
            onClose={onDismissSelectedFact}
            onCenter={() => onCenter(selectedFact)}
          />
        )}
      </BottomSheetModal>
      <CreateFactEditor
        open={state.createMode}
        onClose={() => setState((prev) => ({ ...prev, createMode: false }))}
      />
    </View>
  );
}
