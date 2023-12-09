import React from "react";
import MapView, { PROVIDER_GOOGLE, Marker, Heatmap } from "react-native-maps";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import FactText from "../components/FactText";
import { CUSTOM_MAP_STYLE } from "../helpers/constants";

const markers = [
  {
    latitude: 45.65,
    longitude: -78.9,
    title: "Foo Place",
    subtitle: "1234 Foo Drive",
  },
];

export default function App() {
  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        customMapStyle={CUSTOM_MAP_STYLE}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: 37.78825,
          longitude: -122.4324,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        <Marker
          coordinate={{ latitude: 37.78825, longitude: -122.4324 }}
          //pinColor={"purple"} // any color
          //title={"title"}
          //description={"description"}
        >
          <FactText fontSize={36} text="Hello everyone" />
          {/* <Text
            style={{
              fontSize: 26,
              color: "white",
              textShadowColor: "black",
              textShadowRadius: 5,
            }}
          >
            Quartier sympa
          </Text> */}
        </Marker>
        {/* <Marker
          coordinate={{ latitude: 37.78821, longitude: -122.4324 }}
          //pinColor={"purple"} // any color
          //title={"title"}
          //description={"description"}
        >
          <FactText fontSize={22}/> 
          <Text
            style={{
              fontSize: 20,
              color: "white",
              textShadowColor: "black",
              textShadowRadius: 5,
            }}
          >
            ça craint de zinzin
          </Text>
          </Marker>*/}
        <Heatmap
          opacity={0.6}
          radius={60}
          gradient={{
            colors: ["transparent", "#0FACFD", "#FFFC01", "#F33C58"],
            startPoints: [0.0, 0.2, 0.6, 1.0],
            colorMapSize: 256,
          }}
          points={[
            {
              latitude: 37.78825,
              longitude: -122.4324,
            },
            {
              latitude: 37.78825,
              longitude: -122.4424,
            },
            {
              latitude: 37.78825,
              longitude: -122.4334,
            },
          ]}
        />
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "grey",
  },
  map: {
    width: "100%",
    height: "100%",
  },
});

const customMapStyle = [
  {
    elementType: "labels",
    stylers: [
      {
        visibility: "off",
      },
    ],
  },
  {
    featureType: "administrative.land_parcel",
    stylers: [
      {
        visibility: "off",
      },
    ],
  },
  {
    featureType: "administrative.neighborhood",
    stylers: [
      {
        visibility: "off",
      },
    ],
  },
];
