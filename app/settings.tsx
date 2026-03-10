import { ScrollView, Text, View, Pressable, TextInput, Alert } from "react-native";
import { useMesh } from "@/lib/mesh-context";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useCallback, useState } from "react";
import { router } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as Clipboard from "expo-clipboard";

export default function SettingsScreen() {
  const colors = useColors();
  const { displayName, setDisplayName, userId, userPublicKey, meshNetwork } = useMesh();
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(displayName);

  const handleSaveName = useCallback(async () => {
    if (editedName.trim()) {
      await setDisplayName(editedName.trim());
      setIsEditingName(false);
    }
  }, [editedName, setDisplayName]);

  const handleCopyPublicKey = useCallback(async () => {
    await Clipboard.setStringAsync(userPublicKey);
    Alert.alert("Copied", "Public key copied to clipboard");
  }, [userPublicKey]);

  const handleCopyUserId = useCallback(async () => {
    await Clipboard.setStringAsync(userId);
    Alert.alert("Copied", "User ID copied to clipboard");
  }, [userId]);

  const networkStats = meshNetwork?.getNetworkStats();

  return (
    <ScreenContainer className="flex-1 bg-background">
      <ScrollView>
        {/* Header */}
        <View className="px-6 py-4 border-b" style={{ borderBottomColor: colors.border }}>
          <Pressable onPress={() => router.back()} className="mb-2">
            <MaterialIcons name="arrow-back" size={24} color={colors.foreground} />
          </Pressable>
          <Text className="text-2xl font-bold text-foreground">Settings</Text>
        </View>

        {/* User Profile Section */}
        <View className="px-6 py-6 border-b" style={{ borderBottomColor: colors.border }}>
          <Text className="text-lg font-semibold text-foreground mb-4">Profile</Text>

          {/* Display Name */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-muted mb-2">Display Name</Text>
            {isEditingName ? (
              <View className="flex-row gap-2">
                <TextInput
                  value={editedName}
                  onChangeText={setEditedName}
                  placeholder="Enter your name"
                  placeholderTextColor={colors.muted}
                  className="flex-1 px-3 py-2 rounded-lg border text-foreground"
                  style={{
                    borderColor: colors.border,
                    backgroundColor: colors.surface,
                    color: colors.foreground,
                  }}
                />
                <Pressable
                  onPress={handleSaveName}
                  className="px-4 py-2 rounded-lg"
                  style={{ backgroundColor: colors.primary }}
                >
                  <Text className="text-white font-semibold">Save</Text>
                </Pressable>
              </View>
            ) : (
              <Pressable
                onPress={() => setIsEditingName(true)}
                className="flex-row items-center justify-between px-3 py-2 rounded-lg border"
                style={{
                  borderColor: colors.border,
                  backgroundColor: colors.surface,
                }}
              >
                <Text className="text-foreground">{displayName}</Text>
                <MaterialIcons name="edit" size={18} color={colors.muted} />
              </Pressable>
            )}
          </View>

          {/* User ID */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-muted mb-2">User ID</Text>
            <Pressable
              onPress={handleCopyUserId}
              className="flex-row items-center justify-between px-3 py-2 rounded-lg border"
              style={{
                borderColor: colors.border,
                backgroundColor: colors.surface,
              }}
            >
              <Text className="text-foreground font-mono">{userId}</Text>
              <MaterialIcons name="content-copy" size={18} color={colors.muted} />
            </Pressable>
          </View>

          {/* Public Key */}
          <View>
            <Text className="text-sm font-medium text-muted mb-2">Public Key (first 32 chars)</Text>
            <Pressable
              onPress={handleCopyPublicKey}
              className="flex-row items-center justify-between px-3 py-2 rounded-lg border"
              style={{
                borderColor: colors.border,
                backgroundColor: colors.surface,
              }}
            >
              <Text className="text-foreground font-mono text-xs">
                {userPublicKey.substring(0, 32)}...
              </Text>
              <MaterialIcons name="content-copy" size={18} color={colors.muted} />
            </Pressable>
          </View>
        </View>

        {/* Network Section */}
        <View className="px-6 py-6 border-b" style={{ borderBottomColor: colors.border }}>
          <Text className="text-lg font-semibold text-foreground mb-4">Mesh Network</Text>

          <View className="gap-3">
            <View className="flex-row items-center justify-between px-3 py-2 rounded-lg" style={{ backgroundColor: colors.surface }}>
              <View className="flex-row items-center gap-2">
                <MaterialIcons name="people" size={20} color={colors.primary} />
                <Text className="text-sm text-muted">Total Nodes</Text>
              </View>
              <Text className="text-base font-semibold text-foreground">
                {networkStats?.totalNodes || 0}
              </Text>
            </View>

            <View className="flex-row items-center justify-between px-3 py-2 rounded-lg" style={{ backgroundColor: colors.surface }}>
              <View className="flex-row items-center gap-2">
                <MaterialIcons name="signal-cellular-connected-no-internet-0-bar" size={20} color={colors.primary} />
                <Text className="text-sm text-muted">Direct Neighbors</Text>
              </View>
              <Text className="text-base font-semibold text-foreground">
                {networkStats?.directNeighbors || 0}
              </Text>
            </View>

            <View className="flex-row items-center justify-between px-3 py-2 rounded-lg" style={{ backgroundColor: colors.surface }}>
              <View className="flex-row items-center gap-2">
                <MaterialIcons name="storage" size={20} color={colors.primary} />
                <Text className="text-sm text-muted">Cached Messages</Text>
              </View>
              <Text className="text-base font-semibold text-foreground">
                {networkStats?.cachedMessages || 0}
              </Text>
            </View>
          </View>
        </View>

        {/* About Section */}
        <View className="px-6 py-6">
          <Text className="text-lg font-semibold text-foreground mb-4">About</Text>

          <View className="gap-3">
            <View className="flex-row items-center justify-between px-3 py-2 rounded-lg" style={{ backgroundColor: colors.surface }}>
              <Text className="text-sm text-muted">Version</Text>
              <Text className="text-sm font-semibold text-foreground">1.0.0</Text>
            </View>

            <View className="px-3 py-3 rounded-lg" style={{ backgroundColor: colors.surface }}>
              <Text className="text-xs text-muted leading-relaxed">
                Mesh Messenger is a peer-to-peer messaging app that uses Bluetooth to create a mesh network. All messages are encrypted end-to-end.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
