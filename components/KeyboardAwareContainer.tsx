import { KeyboardAvoidingView, Platform, SafeAreaView, View } from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";

export default function KeyboardAwareContainer({ children }: { children: any }) {
  const headerHeight = useHeaderHeight();
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        keyboardVerticalOffset={headerHeight + 10}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1, paddingHorizontal: 16, paddingVertical: 18, gap: 10 }}
      >
        {children}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
