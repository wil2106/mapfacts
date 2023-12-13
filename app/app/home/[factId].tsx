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
  Region,
} from "react-native-maps";
import {
  BASE_LATITUDE_DELTA,
  BASE_LONGITUDE_DELTA,
  CUSTOM_MAP_STYLE,
} from "../../../helpers/constants";
import { Badge, Icon, useTheme } from "@rneui/themed";
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

export default function Index() {
  const { theme } = useTheme();
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ["30%"], []);
  const knownAreaRef = useRef<turf.helpers.Feature<
    turf.helpers.Polygon | turf.helpers.MultiPolygon,
    turf.helpers.Properties
  > | null>(null);
  const [state, setState] = useState<{
    centerLoading: boolean;
    factsLoading: boolean;
    minScore: number;
    facts: FactType[];
  }>({
    centerLoading: false,
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
        votecount: 0,
        uservote: null,
        authorid: "zezez",
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
        votecount: 0,
        uservote: 1,
        authorid: "zezez",
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
        votecount: 0,
        uservote: -1,
        authorid: "2063ec2e-f13e-4b6b-a036-c82478bfceea",
      },
    ],
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
  const setUserFactsList = useFlashStore((state) => state.setUserFactsList);
  const userFacts = useFlashStore((state) => state.userFacts);

  useEffect(() => {
    if (!pushNotificationPermRequested) {
      return router.replace("/app/home/push-notifications-perm");
    }
    const parsedFactId = parseInt(factId as string);
    if (isNaN(parsedFactId)) {
      getPositionAndCenter(false);
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
    if (selectedFact !== null && bottomSheetRef.current && mapRef.current) {
      const newRegion = getRegion(
        selectedFact.latitude,
        selectedFact.longitude,
        selectedFact.radiusm
      );
      mapRef.current.animateToRegion(newRegion, 1000);
      bottomSheetRef.current?.present();
    }
  }, [selectedFact]);

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
      const unknownArea = getUnknownArea(cameraArea, knownAreaRef.current);
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
    bottomSheetRef.current?.close();
    setSelectedFact(null);
  };

  const onCenter = (fact: FactType) => {
    if (!mapRef.current) {
      return;
    }
    const newRegion = getRegion(fact.latitude, fact.longitude, fact.radiusm);
    mapRef.current.animateToRegion(newRegion, 1000);
  };

  const onFactDeleted = (factToDelete: FactType) => {
    // remove from local state
    setState((prev) => ({
      ...prev,
      facts: prev.facts.filter((fact) => fact.id !== factToDelete.id),
    }));
    setUserFactsList(
      userFacts.list.filter((fact) => fact.id !== factToDelete.id)
    );
  };

  const onFactDownvoted = (factToUpdate: FactType) => {
    // update in local state
    const getUpdatedFact = (fact: FactType) => {
      return {
        ...fact,
        score: fact.uservote === null ? fact.score - 1 : fact.uservote === 1 ? fact.score - 2 : fact.score + 1,
        votecount:
          fact.uservote === null ? fact.votecount + 1 : fact.uservote === 1 ? fact.votecount : fact.votecount - 1,
        uservote: fact.uservote === null || fact.uservote === 1 ? -1 : null,
      };
    };
    setState((prev) => ({
      ...prev,
      facts: prev.facts.map((fact) =>
        fact.id === factToUpdate.id ? getUpdatedFact(fact) : fact
      ),
    }));
    setUserFactsList(
      userFacts.list.map((fact) =>
        fact.id === factToUpdate.id ? getUpdatedFact(fact) : fact
      )
    );
    if (selectedFact) {
      setSelectedFact(getUpdatedFact(selectedFact));
    }
  };

  const onFactUpvoted = (factToUpdate: FactType) => {
    // update in local state
    const getUpdatedFact = (fact: FactType) => {
      return {
        ...fact,
        score: fact.uservote === null ? fact.score + 1 : fact.uservote === -1 ? fact.score + 2 : fact.score - 1,
        votecount:
          fact.uservote === null ? fact.votecount + 1 : fact.uservote === -1 ? fact.votecount : fact.votecount - 1,
        uservote: fact.uservote === null || fact.uservote === -1 ? 1 : null,
      };
    };
    setState((prev) => ({
      ...prev,
      facts: prev.facts.map((fact) =>
        fact.id === factToUpdate.id ? getUpdatedFact(fact) : fact
      ),
    }));
    setUserFactsList(
      userFacts.list.map((fact) =>
        fact.id === factToUpdate.id ? getUpdatedFact(fact) : fact
      )
    );
    if (selectedFact) {
      setSelectedFact(getUpdatedFact(selectedFact));
    }
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
      >
        {state.facts.map((fact) => (
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
        {!selectedFact && (
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
        )}
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
            onPress={() => {
              onDismissSelectedFact();
              router.push("/app/home/account")
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
                router.push("/app/home/search")
              }}
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
              onPress={() => {
                onDismissSelectedFact();
                router.push("/app/home/radar-settings")
              }}
              size={20}
            />
          </View>
        </View>
        <BottomSheetModal
          ref={bottomSheetRef}
          index={0}
          snapPoints={snapPoints}
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
              onDeleted={() => onFactDeleted(selectedFact)}
              onDownvoted={() => onFactDownvoted(selectedFact)}
              onUpvoted={() => onFactUpvoted(selectedFact)}
            />
          )}
        </BottomSheetModal>
      </SafeAreaView>
    </View>
  );
}
