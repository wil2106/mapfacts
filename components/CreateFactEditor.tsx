import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { Button, useTheme } from "@rneui/themed";
import { useEffect, useRef, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CreateFactCustomBackdrop from "./CreateFactCustomBackdrop";
import { Alert, View } from "react-native";
import i18n from "../helpers/i18n";
import { useFlashStore, usePersistStore } from "../helpers/zustand";
import { FactType } from "../types";
import randomColor from "randomcolor";
import { supabase } from "../supabase/supabase";
import * as Haptics from "expo-haptics";

export default function CreateFactEditor({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const sessionUser = useFlashStore((state) => state.sessionUser);
  const createFactRadius = useFlashStore((state) => state.createFactRadius);
  const createFactRotation = useFlashStore((state) => state.createFactRotation);
  const createFactText = useFlashStore((state) => state.createFactText);
  const addMapFact = useFlashStore((state) => state.addMapFact);
  const setSelectedFact = useFlashStore((state) => state.setSelectedFact);
  const addUserFact = useFlashStore((state) => state.addUserFact);
  const region = usePersistStore((state) => state.region);
  const createFactBottomSheetRef = useRef<BottomSheetModal>(null);
  const safeAreaInsets = useSafeAreaInsets();
  const { theme } = useTheme();
  const [state, setState] = useState<{
    loading: boolean;
  }>({
    loading: false,
  });
  useEffect(() => {
    if (open) {
      createFactBottomSheetRef.current?.present();
    } else {
      createFactBottomSheetRef.current?.close();
    }
  }, [open]);

  const onSubmit = async () => {
    setState((prev) => ({ ...prev, loading: true }));
    try {
      if (!sessionUser?.id) {
        throw new Error("User id missing");
      }
      const newFact = {
        angleD: createFactRotation,
        location: `POINT(${region.longitude} ${region.latitude})`,
        radiusM: createFactRadius,
        text: createFactText,
        color: randomColor({
          luminosity: "light",
        }),
        authorId: sessionUser.id,
      };

      const { error } = await supabase.from("Fact").insert(newFact);

      if (error) {
        throw error;
      }

      let tempFact: FactType = {
        angled: createFactRotation,
        createdat: new Date().toISOString(),
        id: -1,
        latitude: region.latitude,
        longitude: region.longitude,
        radiusm: createFactRadius,
        text: createFactText,
        score: 0,
        color: newFact.color,
        authorid: sessionUser.id,
        votecount: 0,
        uservote: null,
      };

      addMapFact(tempFact);

      addUserFact(tempFact);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      setTimeout(() => {
        setSelectedFact(tempFact);
      }, 1000);

      onClose();
    } catch (err) {
      console.error(err);
      alert(i18n.t("default_error_message"));
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  };
  return (
    <BottomSheetModal
      ref={createFactBottomSheetRef}
      index={0}
      snapPoints={["12%"]}
      enablePanDownToClose={false}
      onDismiss={() => {}}
      backgroundStyle={{ backgroundColor: theme.colors.background }}
      enableHandlePanningGesture={false}
      handleComponent={() => <></>}
      backdropComponent={CreateFactCustomBackdrop}
    >
      <View
        style={{
          flex: 1,
          paddingHorizontal: 16,
          gap: 8,
          marginBottom: safeAreaInsets.bottom,
        }}
      >
        <View style={{ flex: 1 }} />
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
          }}
        >
          <Button
            onPress={() => {
              onClose();
            }}
            containerStyle={{ flex: 1 }}
            buttonStyle={{
              backgroundColor: theme.colors.grey3,
            }}
            titleStyle={{
              color: theme.colors.black,
              fontSize: 16,
            }}
            disabled={state.loading}
          >
            {i18n.t("create_fact.cancel")}
          </Button>
          <Button
            onPress={onSubmit}
            containerStyle={{ flex: 1 }}
            buttonStyle={{
              backgroundColor: theme.colors.primary,
            }}
            titleStyle={{
              color: "white",
              fontSize: 16,
            }}
            loading={state.loading}
            disabled={createFactText.length < 3}
          >
            {i18n.t("create_fact.post")}
          </Button>
        </View>
      </View>
    </BottomSheetModal>
  );
}
