import crypto from "node:crypto";

/**
 * Certificate signing — uses Node's Ed25519 support (Node ≥ 12.16).
 *
 * Environment:
 *   GOVT_SIGNING_PRIVATE_KEY = base64-encoded 32-byte raw seed
 *   GOVT_SIGNING_PUBLIC_KEY  = base64-encoded 32-byte raw public key
 *
 * Generate a fresh pair with scripts/generate-signing-key.js
 */

function decodeSeed(s: string): Buffer {
  return Buffer.from(s, "base64");
}

function loadPrivateKey(): crypto.KeyObject {
  const raw = process.env.GOVT_SIGNING_PRIVATE_KEY;
  if (!raw) throw new Error("GOVT_SIGNING_PRIVATE_KEY is not configured");
  const seed = decodeSeed(raw);
  if (seed.length !== 32) throw new Error("Signing seed must be 32 bytes");
  // Build a PKCS8 DER for an Ed25519 key from the 32-byte seed.
  const der = Buffer.concat([
    Buffer.from("302e020100300506032b657004220420", "hex"),
    seed
  ]);
  return crypto.createPrivateKey({ key: der, format: "der", type: "pkcs8" });
}

function loadPublicKey(): crypto.KeyObject {
  const raw = process.env.GOVT_SIGNING_PUBLIC_KEY;
  if (!raw) throw new Error("GOVT_SIGNING_PUBLIC_KEY is not configured");
  const pub = Buffer.from(raw, "base64");
  if (pub.length !== 32) throw new Error("Public key must be 32 bytes");
  const der = Buffer.concat([Buffer.from("302a300506032b6570032100", "hex"), pub]);
  return crypto.createPublicKey({ key: der, format: "der", type: "spki" });
}

export function canonicalise(payload: Record<string, unknown>): string {
  // Deterministic JSON: sorted keys, no whitespace.
  const sort = (v: unknown): unknown => {
    if (Array.isArray(v)) return v.map(sort);
    if (v && typeof v === "object") {
      const o = v as Record<string, unknown>;
      return Object.keys(o)
        .sort()
        .reduce<Record<string, unknown>>((acc, k) => ((acc[k] = sort(o[k])), acc), {});
    }
    return v;
  };
  return JSON.stringify(sort(payload));
}

export function signPayload(payload: Record<string, unknown>): {
  canonical: string;
  hash: string;
  signatureB64: string;
} {
  const canonical = canonicalise(payload);
  const hash = crypto.createHash("sha256").update(canonical).digest("hex");
  const key = loadPrivateKey();
  const sig = crypto.sign(null, Buffer.from(canonical), key);
  return { canonical, hash, signatureB64: sig.toString("base64") };
}

export function verifyPayload(canonical: string, signatureB64: string): boolean {
  try {
    const key = loadPublicKey();
    return crypto.verify(null, Buffer.from(canonical), key, Buffer.from(signatureB64, "base64"));
  } catch {
    return false;
  }
}
