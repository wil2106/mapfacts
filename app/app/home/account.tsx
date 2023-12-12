import { Button, Icon, Text, useTheme } from "@rneui/themed";
import { Stack, router } from "expo-router";
import { useFlashStore } from "../../../helpers/zustand";
import {
  ActivityIndicator,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  RefreshControl,
  SafeAreaView,
} from "react-native";
import { View } from "react-native";
import { FactType } from "../../../types";
import randomColor from "randomcolor";
import FactItem from "../../../components/FactItem";
import { MenuView } from "@react-native-menu/menu";
import i18n from "../../../helpers/i18n";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { supabase } from "../../../supabase/supabase";
import { StatusBar } from "expo-status-bar";

export default function Account() {
  const initialRenderDoneRef = useRef(false);
  //const inBottomArea = useRef(false);
  const sessionUser = useFlashStore((state) => state.sessionUser);
  const userFacts = useFlashStore((state) => state.userFacts);
  const setUserFactsList = useFlashStore((state) => state.setUserFactsList);
  const setUserFactsStatus = useFlashStore((state) => state.setUserFactsStatus);
  const setUserFactsSort = useFlashStore((state) => state.setUserFactsSort);
  const setTeleport = useFlashStore((state) => state.setTeleport);
  const { theme } = useTheme();

  useEffect(() => {
    if (userFacts.status !== "end" && userFacts.list.length === 0) {
      fetchUserFacts(true);
    }
    initialRenderDoneRef.current = true;
  }, []);

  useEffect(() => {
    if (initialRenderDoneRef.current) {
      fetchUserFacts(true);
    }
  }, [userFacts.sort]);

  const fetchUserFacts = async (init: boolean) => {
    try {
      if (!sessionUser?.id) {
        throw new Error("No user id");
      }
      const FETCH_LIMIT = 15;
      setUserFactsStatus(init ? "init-loading" : "next-loading");
      let list: any[] = [];
      const lastFact = userFacts.list[userFacts.list.length - 1];
      if (userFacts.sort === "date") {
        const { data, error } = await supabase.rpc("user_facts_by_date", {
          user_id: sessionUser.id,
          last_date: init ? "2300-01-05T00:00:00.001Z" : lastFact?.createdat ?? "2300-01-05T00:00:00.001Z",
          take: FETCH_LIMIT,
        });
        if (error) {
          throw error;
        }
        list = data;
      } else if (userFacts.sort === "popularity") {
        const { data, error } = await supabase.rpc("user_facts_by_popularity", {
          user_id: sessionUser.id,
          last_score: init ? 1000000000 : lastFact?.score ?? 1000000000,
          take: FETCH_LIMIT,
        });
        if (error) {
          throw error;
        }
        list = data;
      }
      if (init){
        setUserFactsList(list);
      } else {
        setUserFactsList([...userFacts.list, ...list]);
      }
      if (list.length < FETCH_LIMIT) {
        setUserFactsStatus("end");
      } else {
        setUserFactsStatus("idle");
      }
    } catch (err) {
      console.error(err);
      alert(i18n.t("default_error_message"));
      setUserFactsStatus("idle");
    }
  };

  const onSelect = (fact: FactType) => {
    router.back();
    setTimeout(() => {
      setTeleport({
        latitude: fact.latitude,
        longitude: fact.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    }, 1000);
  }

  // const onScroll = ({nativeEvent}: NativeSyntheticEvent<NativeScrollEvent>) => {
  //   if (nativeEvent.contentSize.height <= 0){ 
  //     return;
  //   }
  //   const BOTTOM_AREA_HEIGHT = 20;
  //   if (!inBottomArea.current && nativeEvent.layoutMeasurement.height + nativeEvent.contentOffset.y >= nativeEvent.contentSize.height - BOTTOM_AREA_HEIGHT){
  //     //fetch next
  //     fetchUserFacts(false);
  //     inBottomArea.current = true;
  //   } else if (inBottomArea.current && nativeEvent.layoutMeasurement.height + nativeEvent.contentOffset.y < nativeEvent.contentSize.height - BOTTOM_AREA_HEIGHT){
  //     inBottomArea.current = false;
  //   }
  // };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar style="dark" />
      <View style={{ flex: 1, gap: 10 }}>
        <Stack.Screen
          options={{
            headerTitle: (props) => <Text>{sessionUser?.email}</Text>,
          }}
        />
        <View
          style={{
            flexDirection: "row",
            marginTop: 20,
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 16,
          }}
        >
          <Text style={{ fontFamily: "Fredoka_SemiBold", fontSize: 18 }}>
            Mes posts
          </Text>
          <MenuView
            themeVariant="light"
            onPressAction={({ nativeEvent }) => {
              setUserFactsSort(nativeEvent.event as any);
            }}
            actions={[
              {
                id: "date",
                title: "Sort by date",
                titleColor: theme.colors.black,
              },
              {
                id: "popularity",
                title: "Sort by popularity",
                titleColor: theme.colors.black,
              },
            ]}
          >
            <View
              style={{ flexDirection: "row", gap: 6, alignItems: "center" }}
            >
              <Text style={{ color: theme.colors.grey0 }}>
                {userFacts.sort === "date" ? "Date" : "Popularity"}
              </Text>
              <Icon
                name="sort-desc"
                type="octicon"
                onPress={() => {}}
                color={theme.colors.grey0}
                size={20}
              />
            </View>
          </MenuView>
        </View>
        <FlatList
          //onScroll={onScroll}
          scrollEventThrottle={400}
          refreshControl={
            <RefreshControl
              refreshing={userFacts.status === "init-loading"}
              onRefresh={() => fetchUserFacts(true)}
            />
          }
          contentContainerStyle={{ paddingHorizontal: 16 }}
          keyExtractor={(item, index) => index.toString()}
          data={userFacts.list}
          renderItem={({ item, index }) => (
            <FactItem
              onPress={() => onSelect(item)}
              text={item.text}
              score={item.score}
              first={index === 0}
              last={index === userFacts.list.length - 1}
            />
          )}
          ListFooterComponent={
            <View style={{marginVertical: 10}}>
              {userFacts.status === "idle" && (
                <Button title="Solid" onPress={() => fetchUserFacts(false)} type="clear" color={theme.colors.grey0}>
                  See more
                </Button>
              )}
              {userFacts.status === "next-loading" && (
                <ActivityIndicator size="small" style={{ marginTop: 10 }} />
              )}
              {userFacts.status === "end" && (
                <Text style={{alignSelf: "center", color: theme.colors.grey1}}>No more results</Text>
              )}
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}
