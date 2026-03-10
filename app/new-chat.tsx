import { ScrollView, Text, View, Pressable, FlatList, TextInput } from "react-native";
import { useMesh } from "@/lib/mesh-context";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useCallback, useState } from "react";
import { router } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

export default function NewChatScreen() {
  const colors = useColors();
  const { nearbyUsers, startConversation } = useMesh();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredUsers = nearbyUsers.filter(
    (user) =>
      user.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUserPress = useCallback(
    async (userId: string, userName: string, publicKey: string) => {
      await startConversation(userId, userName, publicKey);
      router.back();
    },
    [startConversation]
  );

  const renderUser = useCallback(
    ({ item }: { item: any }) => (
      <Pressable
        onPress={() => handleUserPress(item.id, item.displayName, item.publicKey)}
        style={({ pressed }) => [
          {
            backgroundColor: colors.surface,
            paddingHorizontal: 16,
            paddingVertical: 12,
            marginHorizontal: 16,
            marginVertical: 4,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.border,
            opacity: pressed ? 0.7 : 1,
          },
        ]}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-base font-semibold text-foreground">{item.displayName}</Text>
            <Text className="text-xs text-muted mt-1">ID: {item.id}</Text>
          </View>
          <View className="flex-row items-center gap-2">
            <MaterialIcons name="signal-cellular-alt" size={16} color={colors.success} />
            <Text className="text-xs text-muted">{item.signalStrength} dBm</Text>
          </View>
        </View>
      </Pressable>
    ),
    [colors, handleUserPress]
  );

  return (
    <ScreenContainer className="flex-1 bg-background">
      {/* Header */}
      <View className="px-6 py-4 border-b" style={{ borderBottomColor: colors.border }}>
        <Pressable onPress={() => router.back()} className="mb-2">
          <MaterialIcons name="arrow-back" size={24} color={colors.foreground} />
        </Pressable>
        <Text className="text-2xl font-bold text-foreground">New Chat</Text>
        <Text className="text-sm text-muted mt-1">Discover nearby users</Text>
      </View>

      {/* Search Bar */}
      <View className="px-6 py-4">
        <View
          className="flex-row items-center px-3 py-2 rounded-lg border"
          style={{ borderColor: colors.border, backgroundColor: colors.surface }}
        >
          <MaterialIcons name="search" size={20} color={colors.muted} />
          <TextInput
            placeholder="Search by name or ID"
            placeholderTextColor={colors.muted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="flex-1 ml-2 text-foreground"
            style={{ color: colors.foreground }}
          />
        </View>
      </View>

      {/* Users List */}
      {filteredUsers.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <MaterialIcons name="people-outline" size={64} color={colors.muted} />
          <Text className="text-lg font-semibold text-foreground mt-4">
            {nearbyUsers.length === 0 ? "No Users Found" : "No Results"}
          </Text>
          <Text className="text-sm text-muted text-center mt-2">
            {nearbyUsers.length === 0
              ? "Make sure other users have the app installed and Bluetooth enabled nearby"
              : "Try a different search query"}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredUsers}
          renderItem={renderUser}
          keyExtractor={(item) => item.id}
          scrollEnabled={true}
          contentContainerStyle={{ paddingVertical: 8 }}
        />
      )}
    </ScreenContainer>
  );
}
