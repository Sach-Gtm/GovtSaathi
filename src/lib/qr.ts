import QRCode from "qrcode";

/**
 * QR payload structure — decoded content of the QR that goes on the sticker.
 * Contains the certificate identity plus a signature over a canonical payload,
 * so a scanner can verify authenticity even without a network round-trip.
 */
export interface CertQrPayload {
  v: 1;
  cert: string;             // certificate_no
  instrument: string;       // instrument serial / id
  issued: string;           // YYYY-MM-DD
  valid: string;            // YYYY-MM-DD
  outcome: "pass" | "fail" | "conditional";
  sig: string;              // base64 Ed25519 signature over canonical of everything above minus 'sig'
  url?: string;             // deep link fallback for online scanners
}

export async function renderQrPng(text: string): Promise<Buffer> {
  return await QRCode.toBuffer(text, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 512,
    color: { dark: "#0B1220", light: "#FFFFFF" }
  });
}

export async function renderQrDataUrl(text: string): Promise<string> {
  return await QRCode.toDataURL(text, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 384,
    color: { dark: "#0B1220", light: "#FFFFFF" }
  });
}
