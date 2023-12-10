import { User } from "@supabase/supabase-js";
import { create } from "zustand";
import { UserType } from "../types";
import { devtools, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Region } from "react-native-maps";

interface FlashState {
  sessionUser?: User | null;
  setSessionUser: (value: User | null) => void;
  user: UserType | null;
  setUser: (value: UserType | null) => void;
  locationEnabled: boolean;
  setLocationEnabled: (value: boolean) => void;
  teleport: Region | null;
  setTeleport: (value: Region) => void;
}

interface PersistState {
  pushNotificationPermRequested: boolean;
  setPushNotificationPermRequested: (value: boolean) => void;
  region: Region;
  setRegion: (value: Region) => void;
}

export const useFlashStore = create<FlashState>((set) => ({
  sessionUser: null,
  setSessionUser: (value) => set((state) => ({ ...state, sessionUser: value })),
  user: null,
  setUser: (value) => set((state) => ({ ...state, user: value })),
  locationEnabled: false,
  setLocationEnabled: (value) =>
    set((state) => ({ locationEnabled: value })),
  teleport: null,
  setTeleport: (value) => set((state) => ({ teleport: value })),
}));

export const usePersistStore = create<PersistState>()(
  devtools(
    persist(
      (set) => ({
        pushNotificationPermRequested: false,
        setPushNotificationPermRequested: (value) =>
          set((state) => ({ pushNotificationPermRequested: value })),
        region: {
          latitude: 37.78825,
          longitude: -122.4324,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        },
        setRegion: (value) => set((state) => ({ region: value })),
      }),
      {
        name: "mapfacts-storage",
        getStorage: () => AsyncStorage,
      }
    )
  )
);
