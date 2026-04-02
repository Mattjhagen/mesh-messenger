import { describe, expect, it } from "vitest";
import { MeshNetwork, createBeacon, parseBeacon } from "../lib/mesh-network";

describe("mesh-network", () => {
  it("encodes and parses beacons safely", () => {
    const beacon = createBeacon("NODE1234", "public-key-abc", "Alice");
    const parsed = parseBeacon(beacon);

    expect(parsed).not.toBeNull();
    expect(parsed?.nodeId).toBe("NODE1234");
    expect(parsed?.publicKey).toBe("public-key-abc");
    expect(parsed?.displayName).toBe("Alice");
    expect(typeof parsed?.timestamp).toBe("number");
    expect(Number.isFinite(parsed?.timestamp)).toBe(true);
  });

  it("rejects malformed beacons", () => {
    expect(parseBeacon("not-base64")).toBeNull();
    expect(parseBeacon("bm9kZXxwdWJsaWMta2V5")).toBeNull();
  });

  it("does not relay messages to self or with exhausted ttl", () => {
    const network = new MeshNetwork("SELF001", "public-key", "Me");

    const toSelf = network.prepareMessage("SELF001", "cipher", "nonce");
    expect(network.shouldRelayMessage(toSelf)).toBe(false);

    const expired = { ...toSelf, recipientId: "OTHER001", ttl: 0 };
    expect(network.shouldRelayMessage(expired)).toBe(false);
  });
});
