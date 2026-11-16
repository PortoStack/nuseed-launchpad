import crypto from "crypto";

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `scrypt:${salt}:${derivedKey.toString("hex")}`;
}

export function verifyPassword(password: string, combinedHash: string): boolean {
  try {
    const parts = combinedHash.split(":");
    if (parts.length !== 3 || parts[0] !== "scrypt") {
      return false;
    }
    const [, salt, originalHash] = parts;
    if (!salt || !originalHash) {
      return false;
    }
    const derivedKey = crypto.scryptSync(password, salt, 64);
    const originalBuffer = Buffer.from(originalHash, "hex");
    if (derivedKey.length !== originalBuffer.length) {
      return false;
    }
    return crypto.timingSafeEqual(derivedKey, originalBuffer);
  } catch {
    return false;
  }
}
