import * as turf from "@turf/turf";
import { Region } from "react-native-maps";

export const getFontSize = (score: number) => {
  if (score < 0) {
    return 14;
  }
  return Math.min(Math.round(Math.sqrt(score) + 14), 30);
};

export const getMinScore = (zoomLevel: number) => {
  return -(100 / 18) * zoomLevel + 100;
};

export const getUnknownArea = (cameraArea: turf.helpers.Feature<turf.helpers.Polygon, turf.helpers.Properties>, knownArea: turf.helpers.Feature<turf.helpers.Polygon | turf.helpers.MultiPolygon, turf.helpers.Properties> | null) => {
  if (!knownArea){
    return cameraArea;
  }
  if (turf.booleanWithin(cameraArea, knownArea)){
    return null;
  }
  const difference = turf.difference(cameraArea, knownArea);
  if(!difference){
    return cameraArea;
  }
  return difference;
}

export const getNewKnownArea = (cameraArea: turf.helpers.Feature<turf.helpers.Polygon, turf.helpers.Properties>, knownArea: turf.helpers.Feature<turf.helpers.Polygon | turf.helpers.MultiPolygon, turf.helpers.Properties> | null) => {
  if (!knownArea){
    return cameraArea;
  }
  return turf.union(cameraArea, knownArea);
}

export const getRegion = (
  centerLatitude: number,
  centerLongitude: number,
  radiusM: number
): Region => {
  // Earth's radius in meters
  const earthRadius = 6371000;

  // Convert radius from meters to degrees
  const latDelta = (radiusM * 2 / earthRadius) * (180 / Math.PI);
  const lonDelta =
    (radiusM * 2 / earthRadius) * (180 / Math.PI) * (1 / Math.cos((centerLatitude * Math.PI) / 180));

  const region: Region = {
    latitude: centerLatitude,
    longitude: centerLongitude,
    latitudeDelta: latDelta,
    longitudeDelta: lonDelta,
  };

  return region;
}