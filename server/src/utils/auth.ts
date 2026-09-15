import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("FATAL: JWT_SECRET environment variable is missing.");
  }
  return secret;
}

export const SESSION_COOKIE_NAME = "toktickit_session";
export const SESSION_MAX_AGE_SECONDS = 28800; // 8 hours (28,800 seconds)

export interface TokenPayload {
  userId: number;
  email: string;
  role: string;
  mustChangePassword?: boolean;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: "8h" });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, getJwtSecret()) as TokenPayload;
    if (decoded && typeof decoded.userId === "number" && decoded.email && decoded.role) {
      return {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
        mustChangePassword: decoded.mustChangePassword,
      };
    }
    return null;
  } catch (_error) {
    return null;
  }
}

export function validatePasswordStrength(password: string): { valid: boolean; reason?: string } {
  if (!password || typeof password !== "string") {
    return { valid: false, reason: "Password is required" };
  }
  if (password.length < 8) {
    return { valid: false, reason: "Password must be at least 8 characters long" };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, reason: "Password must contain at least one uppercase letter" };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, reason: "Password must contain at least one lowercase letter" };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, reason: "Password must contain at least one number" };
  }
  return { valid: true };
}
