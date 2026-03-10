import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TimerSetupScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 items-center justify-center">
        <Text className="text-foreground text-2xl">Timer Setup</Text>
      </View>
    </SafeAreaView>
  );
}
