/**
 * Mesh Network module for Mesh Messenger
 * Handles Bluetooth LE discovery, node management, and message routing
 */

import { generateNonce } from "./crypto";

export interface MeshNode {
  id: string;
  publicKey: string;
  displayName: string;
  signalStrength: number; // -1 to -100 dBm
  lastSeen: number; // timestamp
  isDirectConnected: boolean;
  hopsAway: number;
}

export interface RoutingTableEntry {
  destinationId: string;
  nextHopId: string;
  hopsCount: number;
  lastUpdated: number;
}

export interface MeshMessage {
  id: string;
  senderId: string;
  recipientId: string;
  content: string; // encrypted
  nonce: string;
  timestamp: number;
  ttl: number; // time to live (hops)
  relayedBy?: string[];
  deliveryStatus: "pending" | "sent" | "delivered" | "failed";
}

export class MeshNetwork {
  private nodes: Map<string, MeshNode> = new Map();
  private routingTable: Map<string, RoutingTableEntry> = new Map();
  private messageCache: Map<string, MeshMessage> = new Map();
  private localNodeId: string;
  private localPublicKey: string;
  private localDisplayName: string;

  constructor(nodeId: string, publicKey: string, displayName: string) {
    this.localNodeId = nodeId;
    this.localPublicKey = publicKey;
    this.localDisplayName = displayName;
  }

  /**
   * Register a discovered node in the mesh network
   */
  public addNode(node: MeshNode): void {
    this.nodes.set(node.id, {
      ...node,
      lastSeen: Date.now(),
    });
  }

  /**
   * Get all discovered nodes
   */
  public getNodes(): MeshNode[] {
    return Array.from(this.nodes.values());
  }

  /**
   * Get a specific node by ID
   */
  public getNode(nodeId: string): MeshNode | undefined {
    return this.nodes.get(nodeId);
  }

  /**
   * Get directly connected nodes (signal strength > -80 dBm)
   */
  public getDirectNeighbors(): MeshNode[] {
    return Array.from(this.nodes.values()).filter(
      (node) => node.isDirectConnected && node.signalStrength > -80
    );
  }

  /**
   * Update routing table with discovered route
   */
  public updateRoute(
    destinationId: string,
    nextHopId: string,
    hopsCount: number
  ): void {
    this.routingTable.set(destinationId, {
      destinationId,
      nextHopId,
      hopsCount,
      lastUpdated: Date.now(),
    });
  }

  /**
   * Find best route to destination
   */
  public findRoute(destinationId: string): RoutingTableEntry | null {
    const route = this.routingTable.get(destinationId);
    if (!route) return null;

    // Check if route is still fresh (less than 5 minutes old)
    if (Date.now() - route.lastUpdated > 5 * 60 * 1000) {
      this.routingTable.delete(destinationId);
      return null;
    }

    return route;
  }

  /**
   * Cache a message to prevent duplicate processing
   */
  public cacheMessage(message: MeshMessage): void {
    this.messageCache.set(message.id, message);

    // Clean up old messages (older than 10 minutes)
    const cutoffTime = Date.now() - 10 * 60 * 1000;
    for (const [id, msg] of this.messageCache.entries()) {
      if (msg.timestamp < cutoffTime) {
        this.messageCache.delete(id);
      }
    }
  }

  /**
   * Check if message was already processed
   */
  public hasSeenMessage(messageId: string): boolean {
    return this.messageCache.has(messageId);
  }

  /**
   * Prepare message for transmission
   */
  public prepareMessage(
    recipientId: string,
    encryptedContent: string,
    nonce: string
  ): MeshMessage {
    return {
      id: generateNonce(), // Use random nonce as message ID
      senderId: this.localNodeId,
      recipientId,
      content: encryptedContent,
      nonce,
      timestamp: Date.now(),
      ttl: 5, // Default 5 hops
      relayedBy: [],
      deliveryStatus: "pending",
    };
  }

  /**
   * Check if we should relay a message
   */
  public shouldRelayMessage(message: MeshMessage): boolean {
    // Don't relay if TTL is exhausted
    if (message.ttl <= 0) return false;

    // Don't relay if we already relayed it
    if (message.relayedBy?.includes(this.localNodeId)) return false;

    // Don't relay if we're the recipient
    if (message.recipientId === this.localNodeId) return false;

    return true;
  }

  /**
   * Prepare message for relay
   */
  public relayMessage(message: MeshMessage): MeshMessage {
    return {
      ...message,
      ttl: message.ttl - 1,
      relayedBy: [...(message.relayedBy || []), this.localNodeId],
    };
  }

  /**
   * Clean up stale nodes (not seen in 30 minutes)
   */
  public cleanupStaleNodes(): void {
    const cutoffTime = Date.now() - 30 * 60 * 1000;
    for (const [id, node] of this.nodes.entries()) {
      if (node.lastSeen < cutoffTime) {
        this.nodes.delete(id);
        this.routingTable.delete(id);
      }
    }
  }

  /**
   * Get network statistics
   */
  public getNetworkStats() {
    return {
      totalNodes: this.nodes.size,
      directNeighbors: this.getDirectNeighbors().length,
      cachedMessages: this.messageCache.size,
      routingTableSize: this.routingTable.size,
    };
  }
}

/**
 * Simulate Bluetooth LE advertisement beacon
 */
export function createBeacon(
  nodeId: string,
  publicKey: string,
  displayName: string
): string {
  // Format: nodeId|publicKey|displayName|timestamp
  const beacon = `${nodeId}|${publicKey}|${displayName}|${Date.now()}`;
  return Buffer.from(beacon).toString("base64");
}

/**
 * Parse Bluetooth LE advertisement beacon
 */
export function parseBeacon(beacon: string): {
  nodeId: string;
  publicKey: string;
  displayName: string;
  timestamp: number;
} | null {
  try {
    const decoded = Buffer.from(beacon, "base64").toString("utf-8");
    const [nodeId, publicKey, displayName, timestamp] = decoded.split("|");
    return {
      nodeId,
      publicKey,
      displayName,
      timestamp: parseInt(timestamp),
    };
  } catch {
    return null;
  }
}
