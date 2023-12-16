import { Heatmap } from "react-native-maps";
import { FactType } from "../types";
import { useMemo } from "react";
import * as turf from "@turf/turf";

const RADIUS = 60;

export default function CustomHeatmap({mapFacts} : {mapFacts: FactType[]}) {
  const heatmapPoints = useMemo(() => {
    let theHeatmapPoints: {
      latitude: number;
      longitude: number;
      weight: number;
    }[] = [];
    // hack to display every point on the heatmap (no weight)
    for(let i = 0; i < mapFacts.length; i++){
      const from = turf.point([mapFacts[i].longitude, mapFacts[i].latitude]);
      let neighborsCount = 0;
      for (let a = 0; a < mapFacts.length; a++){
        if (mapFacts[a].id === mapFacts[i].id){
          continue;
        }
        const to = turf.point([mapFacts[a].longitude, mapFacts[a].latitude]);
        const distance = turf.distance(from, to, {units: 'meters'});
        if (distance <= RADIUS){
          neighborsCount++;
        }
      }
      theHeatmapPoints.push({
        longitude: mapFacts[i].longitude,
        latitude: mapFacts[i].latitude,
        weight: 1 / (neighborsCount + 1)
      });
    }
    return theHeatmapPoints;
  }, [mapFacts]);
  return (
    <Heatmap
      opacity={0.7}
      radius={RADIUS}
      gradient={{
        colors: ["transparent", "#0FACFD", "#FFFC01", "#F33C58"],
        startPoints: [0.0, 0.2, 0.6, 1.0],
        colorMapSize: 256,
      }}
      points={heatmapPoints}
    />
  );
}
