export interface UserType {
  createdAt: string
  id: string
  lastLoginAt: string
  lastRadarNotificationAt: string | null
  notificationsEnabled: boolean
  pushToken: string | null
  radarCooldownS: number
  radarEnabled: boolean
  radarMinUpvotes: number
}

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
  recentvotecount: number;
}
