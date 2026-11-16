const JWT_SECRET =
  process.env.JWT_SECRET ||
  process.env.NEXTAUTH_SECRET ||
  "nuseed-launchpad-secret-key-32-chars-min!!";

export interface TokenPayload {
  userId: string;
  username: string;
  email: string;
  role: string;
  roles: string[];
  exp: number;
}

/**
 * Edge-compatible JWT verification using Web Crypto API.
 * Runs in Next.js Middleware (Edge Runtime) without Node.js dependencies.
 */
export async function verifyEdgeJwt(token: string): Promise<TokenPayload | null> {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const [headerB64, payloadB64, signatureB64] = parts;

    // 1. Decode payload
    const base64 = payloadB64.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const payloadJson = atob(padded);
    const payload: TokenPayload = JSON.parse(payloadJson);

    // 2. Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return null;
    }

    // 3. Verify signature with Web Crypto API
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      enc.encode(JWT_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const sigBase64 = signatureB64.replace(/-/g, "+").replace(/_/g, "/");
    const sigPadded = sigBase64.padEnd(sigBase64.length + ((4 - (sigBase64.length % 4)) % 4), "=");
    const sigBinary = atob(sigPadded);
    const sigBytes = new Uint8Array(sigBinary.length);
    for (let i = 0; i < sigBinary.length; i++) {
      sigBytes[i] = sigBinary.charCodeAt(i);
    }

    const data = enc.encode(`${headerB64}.${payloadB64}`);
    const isValid = await crypto.subtle.verify("HMAC", key, sigBytes, data);

    return isValid ? payload : null;
  } catch (err) {
    return null;
  }
}
