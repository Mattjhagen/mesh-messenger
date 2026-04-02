/**
 * Cryptography module for Mesh Messenger
 * Handles encryption and key exchange using TweetNaCl
 */

import * as nacl from "tweetnacl";
import { fromUint8Array, toUint8Array } from "js-base64";

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
      publicKey: fromUint8Array(keyPair.publicKey),
      privateKey: fromUint8Array(keyPair.secretKey),
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
  return toUint8Array(b64);
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
      ciphertext: fromUint8Array(ciphertext),
      nonce: fromUint8Array(nonce),
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
  return fromUint8Array(hash);
}

/**
 * Generate a random nonce for one-time use
 */
export function generateNonce(): string {
  const nonce = nacl.randomBytes(nacl.box.nonceLength);
  return fromUint8Array(nonce);
}
