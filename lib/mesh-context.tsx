/**
 * React Context for Mesh Network state management
 */

import React, { createContext, useContext, useReducer, useCallback, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { generateKeyPair, getUserIdFromPublicKey, encryptMessage, decryptMessage } from "./crypto";
import { MeshNetwork, MeshNode, MeshMessage } from "./mesh-network";

export interface Conversation {
  id: string;
  userId: string;
  userName: string;
  publicKey: string;
  messages: MeshMessage[];
  lastMessage?: MeshMessage;
  unreadCount: number;
  signalStrength: number;
}

export interface MeshContextType {
  // User info
  userId: string;
  userPublicKey: string;
  userPrivateKey: string;
  displayName: string;
  setDisplayName: (name: string) => Promise<void>;

  // Network
  meshNetwork: MeshNetwork | null;
  nearbyUsers: MeshNode[];
  conversations: Map<string, Conversation>;

  // Actions
  startConversation: (userId: string, userName: string, publicKey: string) => Promise<void>;
  sendMessage: (conversationId: string, content: string) => Promise<void>;
  receiveMessage: (message: MeshMessage) => void;
  updateNearbyUsers: (users: MeshNode[]) => void;
}

const MeshContext = createContext<MeshContextType | undefined>(undefined);

interface MeshState {
  userId: string;
  userPublicKey: string;
  userPrivateKey: string;
  displayName: string;
  meshNetwork: MeshNetwork | null;
  nearbyUsers: MeshNode[];
  conversations: Map<string, Conversation>;
}

type MeshAction =
  | { type: "INIT"; payload: { userId: string; publicKey: string; privateKey: string; displayName: string } }
  | { type: "SET_DISPLAY_NAME"; payload: string }
  | { type: "SET_MESH_NETWORK"; payload: MeshNetwork }
  | { type: "UPDATE_NEARBY_USERS"; payload: MeshNode[] }
  | { type: "ADD_CONVERSATION"; payload: Conversation }
  | { type: "ADD_MESSAGE"; payload: { conversationId: string; message: MeshMessage } }
  | {
      type: "UPDATE_MESSAGE_STATUS";
      payload: {
        conversationId: string;
        messageId: string;
        status: MeshMessage["deliveryStatus"];
      };
    };

function meshReducer(state: MeshState, action: MeshAction): MeshState {
  switch (action.type) {
    case "INIT":
      return {
        ...state,
        userId: action.payload.userId,
        userPublicKey: action.payload.publicKey,
        userPrivateKey: action.payload.privateKey,
        displayName: action.payload.displayName,
      };

    case "SET_DISPLAY_NAME":
      return {
        ...state,
        displayName: action.payload,
      };

    case "SET_MESH_NETWORK":
      return {
        ...state,
        meshNetwork: action.payload,
      };

    case "UPDATE_NEARBY_USERS":
      return {
        ...state,
        nearbyUsers: action.payload,
      };

    case "ADD_CONVERSATION": {
      const newConversations = new Map(state.conversations);
      const existing = newConversations.get(action.payload.id);
      if (existing) {
        newConversations.set(action.payload.id, {
          ...existing,
          userName: action.payload.userName,
          publicKey: action.payload.publicKey,
          signalStrength: action.payload.signalStrength,
        });
      } else {
        newConversations.set(action.payload.id, action.payload);
      }
      return {
        ...state,
        conversations: newConversations,
      };
    }

    case "ADD_MESSAGE": {
      const newConversations = new Map(state.conversations);
      const conversation = newConversations.get(action.payload.conversationId);
      if (conversation) {
        const unreadDelta = action.payload.message.senderId !== state.userId ? 1 : 0;
        const updatedConversation: Conversation = {
          ...conversation,
          messages: [...conversation.messages, action.payload.message],
          lastMessage: action.payload.message,
          unreadCount: conversation.unreadCount + unreadDelta,
        };
        newConversations.set(action.payload.conversationId, updatedConversation);
      }
      return {
        ...state,
        conversations: newConversations,
      };
    }

    case "UPDATE_MESSAGE_STATUS": {
      const newConversations = new Map(state.conversations);
      const conversation = newConversations.get(action.payload.conversationId);
      if (conversation) {
        const updatedMessages = conversation.messages.map((message) =>
          message.id === action.payload.messageId
            ? { ...message, deliveryStatus: action.payload.status }
            : message
        );
        newConversations.set(action.payload.conversationId, {
          ...conversation,
          messages: updatedMessages,
          lastMessage:
            conversation.lastMessage?.id === action.payload.messageId
              ? {
                  ...conversation.lastMessage,
                  deliveryStatus: action.payload.status,
                }
              : conversation.lastMessage,
        });
      }
      return {
        ...state,
        conversations: newConversations,
      };
    }

    default:
      return state;
  }
}

const initialState: MeshState = {
  userId: "",
  userPublicKey: "",
  userPrivateKey: "",
  displayName: "",
  meshNetwork: null,
  nearbyUsers: [],
  conversations: new Map(),
};

export function MeshProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(meshReducer, initialState);

  // Initialize user on mount
  useEffect(() => {
    const initializeUser = async () => {
      try {
        // Try to load existing keys
        const savedPublicKey = await AsyncStorage.getItem("userPublicKey");
        const savedPrivateKey = await AsyncStorage.getItem("userPrivateKey");
        const savedDisplayName = await AsyncStorage.getItem("displayName");

        let publicKey = savedPublicKey;
        let privateKey = savedPrivateKey;
        const displayName = savedDisplayName?.trim() ? savedDisplayName : "User";

        if (!publicKey || !privateKey) {
          // Generate new keys
          const keyPair = generateKeyPair();
          publicKey = keyPair.publicKey;
          privateKey = keyPair.privateKey;

          await AsyncStorage.setItem("userPublicKey", publicKey);
          await AsyncStorage.setItem("userPrivateKey", privateKey);
          await AsyncStorage.setItem("displayName", displayName);
        }

        const userId = getUserIdFromPublicKey(publicKey);
        dispatch({
          type: "INIT",
          payload: {
            userId,
            publicKey,
            privateKey,
            displayName,
          },
        });

        // Initialize mesh network
        const meshNetwork = new MeshNetwork(userId, publicKey, displayName);
        dispatch({ type: "SET_MESH_NETWORK", payload: meshNetwork });
      } catch (error) {
        console.error("Failed to initialize user:", error);
      }
    };

    initializeUser();
  }, []);

  const setDisplayName = useCallback(
    async (name: string) => {
      const trimmedName = name.trim();
      if (!trimmedName) return;

      await AsyncStorage.setItem("displayName", trimmedName);
      state.meshNetwork?.setLocalDisplayName(trimmedName);
      dispatch({ type: "SET_DISPLAY_NAME", payload: trimmedName });
    },
    [state.meshNetwork]
  );

  const startConversation = useCallback(
    async (userId: string, userName: string, publicKey: string) => {
      const conversation: Conversation = {
        id: userId,
        userId,
        userName,
        publicKey,
        messages: [],
        unreadCount: 0,
        signalStrength: -70,
      };
      dispatch({ type: "ADD_CONVERSATION", payload: conversation });
    },
    []
  );

  const sendMessage = useCallback(
    async (conversationId: string, content: string) => {
      const conversation = state.conversations.get(conversationId);
      if (!conversation || !state.meshNetwork) return;

      try {
        // Encrypt message
        const encrypted = encryptMessage(content, conversation.publicKey, state.userPrivateKey);

        // Create encrypted message payload for network transport.
        const outboundMessage = state.meshNetwork.prepareMessage(
          conversationId,
          encrypted.ciphertext,
          encrypted.nonce
        );

        // Keep local UI plaintext while network payload stays encrypted.
        const localMessage: MeshMessage = {
          ...outboundMessage,
          content,
        };

        // Add to local conversation
        dispatch({
          type: "ADD_MESSAGE",
          payload: { conversationId, message: localMessage },
        });

        // In a real implementation, this would trigger Bluetooth transmission
        // For now, simulate successful send
        setTimeout(() => {
          dispatch({
            type: "UPDATE_MESSAGE_STATUS",
            payload: { conversationId, messageId: localMessage.id, status: "delivered" },
          });
        }, 1000);
      } catch (error) {
        console.error("Failed to send message:", error);
      }
    },
    [state.conversations, state.meshNetwork, state.userPrivateKey]
  );

  const receiveMessage = useCallback(
    (message: MeshMessage) => {
      const conversation = state.conversations.get(message.senderId);
      const senderNode = state.nearbyUsers.find((user) => user.id === message.senderId);
      const senderPublicKey = conversation?.publicKey || senderNode?.publicKey;

      if (!senderPublicKey) {
        console.error("Cannot decrypt message: sender public key not found", {
          senderId: message.senderId,
        });
        return;
      }

      if (!conversation) {
        dispatch({
          type: "ADD_CONVERSATION",
          payload: {
            id: message.senderId,
            userId: message.senderId,
            userName: senderNode?.displayName || `User ${message.senderId}`,
            publicKey: senderPublicKey,
            messages: [],
            unreadCount: 0,
            signalStrength: senderNode?.signalStrength ?? -100,
          },
        });
      }

      try {
        // Decrypt message
        const decrypted = decryptMessage(
          {
            ciphertext: message.content,
            nonce: message.nonce,
          },
          senderPublicKey,
          state.userPrivateKey
        );

        // Update message content
        message.content = decrypted;

        dispatch({
          type: "ADD_MESSAGE",
          payload: { conversationId: message.senderId, message },
        });
      } catch (error) {
        console.error("Failed to decrypt message:", error);
      }
    },
    [state.conversations, state.nearbyUsers, state.userPrivateKey]
  );

  const updateNearbyUsers = useCallback(
    (users: MeshNode[]) => {
      if (state.meshNetwork) {
        users.forEach((user) => state.meshNetwork?.addNode(user));
        state.meshNetwork.cleanupStaleNodes();
      }
      dispatch({ type: "UPDATE_NEARBY_USERS", payload: users });
    },
    [state.meshNetwork]
  );

  const value: MeshContextType = {
    userId: state.userId,
    userPublicKey: state.userPublicKey,
    userPrivateKey: state.userPrivateKey,
    displayName: state.displayName,
    meshNetwork: state.meshNetwork,
    nearbyUsers: state.nearbyUsers,
    conversations: state.conversations,
    setDisplayName,
    startConversation,
    sendMessage,
    receiveMessage,
    updateNearbyUsers,
  };

  return <MeshContext.Provider value={value}>{children}</MeshContext.Provider>;
}

export function useMesh(): MeshContextType {
  const context = useContext(MeshContext);
  if (!context) {
    throw new Error("useMesh must be used within MeshProvider");
  }
  return context;
}
