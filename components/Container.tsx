import { SafeAreaView, View } from "react-native";

export default function Container({ children }: { children: any }) {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View
        style={{ flex: 1, padding: 16, gap: 10 }}
      >
        {children}
      </View>
    </SafeAreaView>
  );
}
