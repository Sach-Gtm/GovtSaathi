#!/usr/bin/env node
/**
 * Generates a fresh Ed25519 signing key pair for GovtSathi certificates.
 * Prints two lines suitable for .env — one private seed, one public key.
 */
const crypto = require("node:crypto");

const { publicKey, privateKey } = crypto.generateKeyPairSync("ed25519");

const privDer = privateKey.export({ format: "der", type: "pkcs8" });
// PKCS8 prefix for Ed25519 is 16 bytes; last 32 are the seed.
const seed = privDer.subarray(privDer.length - 32);

const pubDer = publicKey.export({ format: "der", type: "spki" });
// SPKI prefix for Ed25519 is 12 bytes; last 32 are the raw public key.
const pub = pubDer.subarray(pubDer.length - 32);

console.log("GOVT_SIGNING_PRIVATE_KEY=" + seed.toString("base64"));
console.log("GOVT_SIGNING_PUBLIC_KEY=" + pub.toString("base64"));
