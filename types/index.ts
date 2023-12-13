import { Database } from "./supabase";

export type UserType = Database["public"]["Tables"]["User"]["Row"];

export interface PlaceType {
  formattedAddress: string;
  latitude: number;
  longitude: number;
  name: string;
}

export interface FactType {
  angled: number;
  createdat: string;
  id: number;
  latitude: number;
  longitude: number;
  radiusm: number;
  text: string;
  score: number;
  color: string;
  authorid: string;
  votecount: number;
  uservote: number | null;
}
