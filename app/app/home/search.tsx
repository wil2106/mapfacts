import { Button, Icon, SearchBar, useTheme } from "@rneui/themed";
import Container from "../../../components/Container";
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  ScrollView,
  View,
} from "react-native";
import { router } from "expo-router";
import { useRef, useState } from "react";
import PlaceItem from "../../../components/PlaceItem";
import axios from "axios";
import Constants from "expo-constants";
import i18n from "../../../helpers/i18n";
import { useFlashStore } from "../../../helpers/zustand";
import { PlaceType } from "../../../types";
import { StatusBar } from "expo-status-bar";
import { BASE_LATITUDE_DELTA, BASE_LONGITUDE_DELTA } from "../../../helpers/constants";

const places = [{ title: "Annecy" }, { title: "Paris" }, { title: "Lyon" }];

export default function Search() {
  const { theme } = useTheme();
  const setTeleport = useFlashStore((state) => state.setTeleport);
  const setSelectedFact = useFlashStore((state) => state.setSelectedFact);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const [state, setState] = useState<{
    search: string;
    loading: boolean;
    candidates: PlaceType[];
  }>({
    search: "",
    loading: false,
    candidates: [],
  });
  const onChangeSearch = (text: string) => {
    setState((prev) => ({ ...prev, search: text }));
    if (
      !Constants?.expoConfig?.extra?.googlePlacesApiKey ||
      !Constants?.expoConfig?.ios?.bundleIdentifier
    ) {
      throw new Error("No googlePlacesApiKey");
    }
    clearTimeout(timeoutRef.current);
    if (text.length === 0) {
      return;
    }
    timeoutRef.current = setTimeout(async () => {
      try {
        setState((prev) => ({ ...prev, loading: true }));
        const res = await axios.get(
          `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(
            text.trim()
          )}&inputtype=textquery&fields=name,geometry,formatted_address&key=${
            Constants!.expoConfig!.extra!.googlePlacesApiKey
          }`,
          {
            headers: {
              "Content-Type": "application/json",
              "X-Goog-Api-Key":
                Constants!.expoConfig!.extra!.googlePlacesApiKey,
              "X-Ios-Bundle-Identifier":
                Constants!.expoConfig!.ios!.bundleIdentifier,
            },
          }
        );

        if (!res.data?.candidates) {
          throw new Error("No candidates");
        }

        let newCandidates: PlaceType[] = [];
        for (let i = 0; i < res.data.candidates.length; i++) {
          const candidate = res.data.candidates[i];
          if (
            !candidate?.formatted_address ||
            !candidate?.geometry?.location?.lat ||
            !candidate?.geometry?.location?.lng ||
            !candidate?.name
          ) {
            continue;
          }
          newCandidates.push({
            formattedAddress: candidate.formatted_address,
            latitude: candidate.geometry.location.lat,
            longitude: candidate.geometry.location.lng,
            name: candidate.name,
          });
        }
        setState((prev) => ({ ...prev, candidates: newCandidates }));
      } catch (err) {
        console.error(JSON.stringify(err));
        alert(i18n.t("default_error_message"));
      } finally {
        setState((prev) => ({ ...prev, loading: false }));
      }
    }, 500);
  };

  const onSelect = (place: PlaceType) => {
    router.back();
    setSelectedFact(null);
    setTimeout(() => {
      setTeleport({
        latitude: place.latitude,
        longitude: place.longitude,
        latitudeDelta: BASE_LATITUDE_DELTA,
        longitudeDelta: BASE_LONGITUDE_DELTA,
      });
    }, 1000);
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar style="dark" />
      <View style={{ flex: 1, gap: 10 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            paddingHorizontal: 16,
          }}
        >
          <SearchBar
            placeholder="Rechercher"
            onChangeText={onChangeSearch}
            value={state.search}
            containerStyle={{ flex: 1 }}
            autoFocus
          />
          <Button
            onPress={() => router.back()}
            type="clear"
            titleStyle={{
              color: theme.colors.black,
              fontFamily: "Fredoka_SemiBold",
            }}
            buttonStyle={{ paddingHorizontal: 0 }}
          >
            Annuler
          </Button>
        </View>
        <FlatList
          keyboardShouldPersistTaps='handled'
          ListHeaderComponent={
            state.loading ? (
              <View style={{ paddingVertical: 6 }}>
                <ActivityIndicator />
              </View>
            ) : (
              <></>
            )
          }
          contentContainerStyle={{ paddingHorizontal: 16 }}
          keyExtractor={(item, index) => index.toString()}
          data={state.candidates}
          renderItem={({ item, index }) => (
            <PlaceItem
              onPress={() => onSelect(item)}
              place={item}
              first={index === 0}
              last={index === state.candidates.length - 1}
            />
          )}
        />
      </View>
    </SafeAreaView>
  );
}
