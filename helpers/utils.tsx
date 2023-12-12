import * as turf from "@turf/turf";

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
    console.log("within");
    return null;
  }
  const difference = turf.difference(cameraArea, knownArea);
  if(!difference){
    console.log("no diff");
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