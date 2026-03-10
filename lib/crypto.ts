/**
 * Cryptography module for Mesh Messenger
 * Handles encryption and key exchange using TweetNaCl
 */

import * as nacl from "tweetnacl";
import { encode as encodeBase64, decode as decodeBase64 } from "js-base64";

export interface KeyPair {
  publicKey: string;
  privateKey: string;
}

export interface EncryptedMessage {
  ciphertext: string;
  nonce: string;
  ephemeralPublicKey?: string;
}

/**
 * Generate a new Curve25519 key pair for the user
 * Returns base64-encoded public and private keys
 */
export function generateKeyPair(): KeyPair {
  try {
    const keyPair = nacl.box.keyPair();

    return {
      publicKey: encodeBase64(Buffer.from(keyPair.publicKey).toString("binary")),
      privateKey: encodeBase64(Buffer.from(keyPair.secretKey).toString("binary")),
    };
  } catch (error) {
    console.error("Failed to generate key pair:", error);
    throw new Error("Key pair generation failed");
  }
}

/**
 * Get a short user ID from the public key (first 8 chars)
 */
export function getUserIdFromPublicKey(publicKey: string): string {
  return publicKey.substring(0, 8).toUpperCase();
}

/**
 * Convert base64 string to Uint8Array
 */
function base64ToUint8Array(b64: string): Uint8Array {
  const binaryString = decodeBase64(b64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Encrypt a message using NaCl box (Curve25519 + ChaCha20-Poly1305)
 * Uses the recipient's public key and sender's private key
 */
export function encryptMessage(
  message: string,
  recipientPublicKey: string,
  senderPrivateKey: string
): EncryptedMessage {
  try {
    // Generate random nonce
    const nonce = nacl.randomBytes(nacl.box.nonceLength);

    // Decode keys from base64
    const recipientPubKey = base64ToUint8Array(recipientPublicKey);
    const senderPrivKey = base64ToUint8Array(senderPrivateKey);

    // Encode message
    const messageBytes = new TextEncoder().encode(message);

    // Encrypt
    const ciphertext = nacl.box(messageBytes, nonce, recipientPubKey, senderPrivKey);

    if (!ciphertext) {
      throw new Error("Encryption returned null");
    }

    return {
      ciphertext: encodeBase64(Buffer.from(ciphertext).toString("binary")),
      nonce: encodeBase64(Buffer.from(nonce).toString("binary")),
    };
  } catch (error) {
    console.error("Encryption failed:", error);
    throw new Error("Message encryption failed");
  }
}

/**
 * Decrypt a message using NaCl box
 */
export function decryptMessage(
  encrypted: EncryptedMessage,
  senderPublicKey: string,
  recipientPrivateKey: string
): string {
  try {
    // Decode from base64
    const ciphertext = base64ToUint8Array(encrypted.ciphertext);
    const nonce = base64ToUint8Array(encrypted.nonce);
    const senderPubKey = base64ToUint8Array(senderPublicKey);
    const recipientPrivKey = base64ToUint8Array(recipientPrivateKey);

    // Decrypt
    const plaintext = nacl.box.open(
      ciphertext,
      nonce,
      senderPubKey,
      recipientPrivKey
    );

    if (!plaintext) {
      throw new Error("Decryption failed - authentication tag verification failed");
    }

    // Decode to string
    return new TextDecoder().decode(plaintext);
  } catch (error) {
    console.error("Decryption failed:", error);
    throw new Error("Message decryption failed");
  }
}

/**
 * Hash a value using SHA-512
 */
export function hashValue(value: string): string {
  const bytes = new TextEncoder().encode(value);
  const hash = nacl.hash(bytes);
  return encodeBase64(Buffer.from(hash).toString("binary"));
}

/**
 * Generate a random nonce for one-time use
 */
export function generateNonce(): string {
  const nonce = nacl.randomBytes(nacl.box.nonceLength);
  return encodeBase64(Buffer.from(nonce).toString("binary"));
}
