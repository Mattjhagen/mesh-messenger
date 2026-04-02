import { describe, expect, it } from "vitest";
import {
  decryptMessage,
  encryptMessage,
  generateKeyPair,
  getUserIdFromPublicKey,
} from "../lib/crypto";

describe("crypto", () => {
  it("encrypts and decrypts a message between peers", () => {
    const alice = generateKeyPair();
    const bob = generateKeyPair();
    const plaintext = "hello mesh world";

    const encrypted = encryptMessage(plaintext, bob.publicKey, alice.privateKey);
    const decrypted = decryptMessage(encrypted, alice.publicKey, bob.privateKey);

    expect(decrypted).toBe(plaintext);
  });

  it("derives a stable user id from public key", () => {
    const { publicKey } = generateKeyPair();

    const userIdA = getUserIdFromPublicKey(publicKey);
    const userIdB = getUserIdFromPublicKey(publicKey);

    expect(userIdA).toBe(userIdB);
    expect(userIdA).toHaveLength(8);
    expect(userIdA).toBe(userIdA.toUpperCase());
  });
});
