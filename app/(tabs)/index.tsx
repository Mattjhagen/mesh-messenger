import { ScrollView, Text, View, Pressable, FlatList } from "react-native";
import { useMesh } from "@/lib/mesh-context";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useCallback } from "react";
import { router } from "expo-router";
import { useRouter } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

export default function HomeScreen() {
  const colors = useColors();
  const { conversations, displayName, userId } = useMesh();
  const conversationList = Array.from(conversations.values());

  const handleNewChat = useCallback(() => {
    router.push("/new-chat");
  }, [router]);

  const handleConversationPress = useCallback((conversationId: string) => {
    router.push(`/chat/${conversationId}`);
  }, [router]);

  const renderConversation = useCallback(
    ({ item }: { item: any }) => (
      <Pressable
        onPress={() => handleConversationPress(item.id)}
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
            <Text className="text-base font-semibold text-foreground">{item.userName}</Text>
            <Text className="text-sm text-muted mt-1 line-clamp-1">
              {item.lastMessage?.content || "No messages yet"}
            </Text>
          </View>
          {item.unreadCount > 0 && (
            <View
              className="ml-2 px-2 py-1 rounded-full"
              style={{ backgroundColor: colors.primary }}
            >
              <Text className="text-xs font-semibold text-white">{item.unreadCount}</Text>
            </View>
          )}
        </View>
      </Pressable>
    ),
    [colors, handleConversationPress]
  );

  return (
    <ScreenContainer className="flex-1 bg-background">
      {/* Header */}
      <View className="px-6 py-4 border-b flex-row items-center justify-between" style={{ borderBottomColor: colors.border }}>
        <View className="flex-1">
          <Text className="text-3xl font-bold text-foreground">Mesh Messenger</Text>
          <Text className="text-sm text-muted mt-1">User ID: {userId}</Text>
        </View>
        <Pressable onPress={() => router.push("/settings")} className="p-2">
          <MaterialIcons name="settings" size={24} color={colors.foreground} />
        </Pressable>
      </View>

      {/* Content */}
      {conversationList.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <MaterialIcons name="mail-outline" size={64} color={colors.muted} />
          <Text className="text-lg font-semibold text-foreground mt-4">No Conversations</Text>
          <Text className="text-sm text-muted text-center mt-2">
            Start a new conversation by tapping the + button below
          </Text>
        </View>
      ) : (
        <FlatList
          data={conversationList}
          renderItem={renderConversation}
          keyExtractor={(item) => item.id}
          scrollEnabled={true}
          contentContainerStyle={{ paddingVertical: 8 }}
        />
      )}

      {/* Floating Action Button */}
      <Pressable
        onPress={handleNewChat}
        style={({ pressed }) => [
          {
            position: "absolute",
            bottom: 24,
            right: 24,
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: colors.primary,
            justifyContent: "center",
            alignItems: "center",
            elevation: 8,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            transform: [{ scale: pressed ? 0.95 : 1 }],
          },
        ]}
      >
        <MaterialIcons name="add" size={28} color="white" />
      </Pressable>
    </ScreenContainer>
  );
}
