import { Text, View, Pressable, FlatList, TextInput, KeyboardAvoidingView, Platform } from "react-native";
import { useMesh } from "@/lib/mesh-context";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useCallback, useState, useMemo } from "react";
import { router, useLocalSearchParams } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

export default function ChatScreen() {
  const colors = useColors();
  const { id } = useLocalSearchParams();
  const { conversations, sendMessage, userId } = useMesh();
  const [messageText, setMessageText] = useState("");

  const conversation = useMemo(() => {
    return conversations.get(id as string);
  }, [conversations, id]);

  const orderedMessages = useMemo(() => {
    if (!conversation) return [];
    return [...conversation.messages].reverse();
  }, [conversation]);

  const handleSendMessage = useCallback(async () => {
    if (!messageText.trim() || !id) return;

    try {
      await sendMessage(id as string, messageText);
      setMessageText("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  }, [messageText, id, sendMessage]);

  const renderMessage = useCallback(
    ({ item }: { item: any }) => {
      const isOwn = item.senderId === userId;
      return (
        <View
          className={`flex-row ${isOwn ? "justify-end" : "justify-start"} px-4 py-2`}
        >
          <View
            className={`max-w-xs px-3 py-2 rounded-lg ${
              isOwn
                ? "bg-primary"
                : "bg-surface border"
            }`}
            style={!isOwn ? { borderColor: colors.border } : {}}
          >
            <Text
              className={`text-sm ${
                isOwn ? "text-white" : "text-foreground"
              }`}
            >
              {item.content}
            </Text>
            <Text
              className={`text-xs mt-1 ${
                isOwn ? "text-white opacity-70" : "text-muted"
              }`}
            >
              {new Date(item.timestamp).toLocaleTimeString()}
            </Text>
          </View>
        </View>
      );
    },
    [colors, userId]
  );

  if (!conversation) {
    return (
      <ScreenContainer className="flex-1 items-center justify-center">
        <Text className="text-foreground">Conversation not found</Text>
      </ScreenContainer>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <ScreenContainer className="flex-1 bg-background" edges={["top", "left", "right"]}>
        {/* Header */}
        <View className="px-4 py-3 border-b flex-row items-center" style={{ borderBottomColor: colors.border }}>
          <Pressable onPress={() => router.back()} className="mr-3">
            <MaterialIcons name="arrow-back" size={24} color={colors.foreground} />
          </Pressable>
          <View className="flex-1">
            <Text className="text-lg font-semibold text-foreground">
              {conversation.userName}
            </Text>
            <Text className="text-xs text-muted">
              {conversation.signalStrength} dBm
            </Text>
          </View>
        </View>

        {/* Messages List */}
        {conversation.messages.length === 0 ? (
          <View className="flex-1 items-center justify-center">
            <MaterialIcons name="mail-outline" size={48} color={colors.muted} />
            <Text className="text-sm text-muted mt-2">No messages yet</Text>
          </View>
        ) : (
          <FlatList
            data={orderedMessages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            inverted
            contentContainerStyle={{ paddingVertical: 8 }}
          />
        )}

        {/* Input Area */}
        <View
          className="px-4 py-3 border-t flex-row items-center gap-2"
          style={{ borderTopColor: colors.border }}
        >
          <TextInput
            placeholder="Type a message..."
            placeholderTextColor={colors.muted}
            value={messageText}
            onChangeText={setMessageText}
            multiline
            maxLength={500}
            className="flex-1 px-3 py-2 rounded-lg text-foreground"
            style={{
              backgroundColor: colors.surface,
              color: colors.foreground,
              borderWidth: 1,
              borderColor: colors.border,
              maxHeight: 100,
            }}
          />
          <Pressable
            onPress={handleSendMessage}
            disabled={!messageText.trim()}
            style={({ pressed }) => [
              {
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: messageText.trim() ? colors.primary : colors.muted,
                justifyContent: "center",
                alignItems: "center",
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <MaterialIcons name="send" size={20} color="white" />
          </Pressable>
        </View>
      </ScreenContainer>
    </KeyboardAvoidingView>
  );
}
