import { User } from "@supabase/supabase-js";
import { create } from "zustand";
import { FactType, UserType } from "../types";
import { devtools, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Region } from "react-native-maps";
import { BASE_LATITUDE_DELTA, BASE_LONGITUDE_DELTA } from "./constants";

type UserFactsStatus = "idle" | "init-loading" | "next-loading" | "end";
type UserFactsSort = "date" | "popularity";

interface UserFacts {
  list: FactType[];
  status: UserFactsStatus;
  sort: UserFactsSort;
}

interface FlashState {
  sessionUser?: User | null;
  setSessionUser: (value: User | null) => void;
  user: UserType | null;
  setUser: (value: UserType | null) => void;
  toggleUserNotifications: () => void;
  locationEnabled: boolean;
  setLocationEnabled: (value: boolean) => void;
  pushNotificationsEnabled: boolean;
  setPushNotificationsEnabled: (value: boolean) => void;
  teleport: Region | null;
  setTeleport: (value: Region) => void;
  selectedFact: FactType | null;
  setSelectedFact: (value: FactType | null) => void;
  userFacts: UserFacts;
  setUserFactsList: (value: FactType[]) => void;
  addUserFact: (value: FactType) => void;
  setUserFactsStatus: (value: UserFactsStatus) => void;
  setUserFactsSort: (value: UserFactsSort) => void;
  createFactRadius: number;
  setCreateFactRadius: (value: number) => void;
  createFactRotation: number;
  setCreateFactRotation: (value: number) => void;
  createFactText: string;
  setCreateFactText: (value: string) => void;
  mapFacts: FactType[];
  setMapFacts: (value: FactType[]) => void;
  addMapFact: (value: FactType) => void;
  addMapFacts: (value: FactType[]) => void;
  reset: () => void;
}

interface PersistState {
  pushNotificationPermRequested: boolean;
  setPushNotificationPermRequested: (value: boolean) => void;
  region: Region;
  setRegion: (value: Region) => void;
}

const initialState: any = {
  sessionUser: null,
  user: null,
  locationEnabled: false,
  pushNotificationsEnabled: false,
  teleport: null,
  selectedFact: null,
  userFacts: {
    list: [],
    status: "idle",
    sort: "date",
  },
  createFactRadius: 100,
  createFactRotation: 100,
  createFactText: "",
  mapFacts: [],
}

export const useFlashStore = create<FlashState>((set) => ({
  sessionUser: initialState.sessionUser,
  setSessionUser: (value) => set((state) => ({ ...state, sessionUser: value })),
  user: initialState.user,
  setUser: (value) => set((state) => ({ ...state, user: value })),
  // @ts-ignore
  toggleUserNotifications: () => set((state) => ({ ...state, user: {...state.user, notificationsEnabled: !state.user.notificationsEnabled }})),
  locationEnabled: initialState.locationEnabled,
  setLocationEnabled: (value) => set((state) => ({ locationEnabled: value })),
  pushNotificationsEnabled: initialState.pushNotificationsEnabled,
  setPushNotificationsEnabled: (value) =>
    set((state) => ({ pushNotificationsEnabled: value })),
  teleport: initialState.teleport,
  setTeleport: (value) => set((state) => ({ teleport: value })),
  selectedFact: initialState.selectedFact,
  setSelectedFact: (value) => set((state) => ({ selectedFact: value })),
  userFacts: initialState.userFacts,
  setUserFactsList: (value) =>
    set((state) => ({ userFacts: { ...state.userFacts, list: value } })),
  addUserFact: (value) =>
    set((state) => {
      return {
        userFacts: { ...state.userFacts, list: [], status: "idle" },
      };
    }),
  setUserFactsStatus: (value) =>
    set((state) => ({ userFacts: { ...state.userFacts, status: value } })),
  setUserFactsSort: (value) =>
    set((state) => ({ userFacts: { ...state.userFacts, sort: value } })),
  createFactRadius: initialState.createFactRadius,
  setCreateFactRadius: (value) => set((state) => ({ createFactRadius: value })),
  createFactRotation: initialState.createFactRotation,
  setCreateFactRotation: (value) =>
    set((state) => ({ createFactRotation: value })),
  createFactText: initialState.createFactText,
  setCreateFactText: (value) => set((state) => ({ createFactText: value })),
  mapFacts: initialState.mapFacts,
  setMapFacts: (value) => set((state) => ({ mapFacts: value })),
  addMapFact: (value) =>
    set((state) => ({ mapFacts: [...state.mapFacts, value] })),
  addMapFacts: (value) =>
    set((state) => ({ mapFacts: [...state.mapFacts, ...value] })),
  reset: () => set((state) => ({...state, ...initialState})),
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
          latitudeDelta: BASE_LATITUDE_DELTA,
          longitudeDelta: BASE_LONGITUDE_DELTA,
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
