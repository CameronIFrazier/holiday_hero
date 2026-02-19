import { Image, Text, TextInput, View } from "react-native";

export default function Post() {
  return (
    <View
      className="bg-white rounded-xl p-4 mb-4 shadow"
      style={{ borderColor: "var(--color-border)", borderWidth: 1 }}
    >
      {/* Post header */}
      <View className="flex-row items-center mb-2">
        <View className="w-10 h-10 bg-main rounded-full justify-center items-center mr-3">
          <Image
            src="https://metubebucketcf.s3.us-east-2.amazonaws.com/userpfp.jpg"
            className="w-8 h-8 rounded-full"
          ></Image>
        </View>
        <Text className="text-text font-semibold">User </Text>
      </View>

      {/* Post content */}
      <TextInput
        className="text-3xl text-black"
        placeholder="Title of Post"
      ></TextInput>

      {/* Post image */}
      <Image
        source={{
          uri: "https://via.placeholder.com/300x150.png?text=Post+",
        }}
        className="w-full h-40 rounded-lg"
      />

      {/* Post actions */}
      <View className="flex-row mt-3 justify-between">
        <Text className="text-accent font-semibold">Comment</Text>
        <Text className="text-accent font-semibold">Share</Text>
      </View>
    </View>
  );
}
