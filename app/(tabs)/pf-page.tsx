import { ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function ProfileScreen() {
  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ padding: 20 }}
    >
      {/* Header */}
      <View className="items-center mb-6">
        {/* Avatar */}
        <View className="w-24 h-24 rounded-full bg-main justify-center items-center mb-4">
          <Text className="text-white font-bold text-xl">U</Text>
        </View>

        {/* Name */}
        <Text className="text-text text-2xl font-bold mb-1">User Name</Text>

        {/* Bio */}
        <Text className="text-subtext text-center text-sm mb-3">
          Just a simple bio about the user. Loves coding, coffee, and orange!
        </Text>

        {/* Edit Profile Button */}
        <TouchableOpacity className="bg-main px-6 py-2 rounded-full">
          <Text className="text-white font-semibold">Edit Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View className="flex-row justify-around mb-6">
        <View className="items-center">
          <Text className="text-text font-bold text-lg">42</Text>
          <Text className="text-subtext text-sm">Posts</Text>
        </View>
        <View className="items-center">
          <Text className="text-text font-bold text-lg">1.2k</Text>
          <Text className="text-subtext text-sm">Followers</Text>
        </View>
        <View className="items-center">
          <Text className="text-text font-bold text-lg">256</Text>
          <Text className="text-subtext text-sm">Following</Text>
        </View>
      </View>

      {/* Sample content / posts */}
      <View className="mb-6">
        <Text className="text-text font-semibold text-lg mb-3">
          Recent Posts
        </Text>
      </View>
    </ScrollView>
  );
}
