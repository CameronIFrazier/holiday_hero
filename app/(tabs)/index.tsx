import Post from "@/components/my-components/Post";
import { ScrollView, Text, View } from "react-native";
export default function FeedScreen() {
  return (
    <ScrollView
      className="flex-1 bg-background px-4 py-4"
      contentContainerStyle={{ paddingBottom: 20 }}
    >
      {/* Header */}
      <View className="mb-6">
        <Text className="text-2xl font-bold text-text">Your Feed</Text>
        <Text className="text-subtext text-sm mt-1">
          Stay updated with the latest posts
        </Text>
      </View>
      <Post></Post>
    </ScrollView>
  );
}
