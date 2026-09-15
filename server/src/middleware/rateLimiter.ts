import { Request, Response, NextFunction } from "express";

interface RateLimitRecord {
  attempts: number;
  resetTime: number;
}

const loginAttemptsStore = new Map<string, RateLimitRecord>();

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 5; // Max 5 failed attempts per window

export function loginRateLimiter(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip || req.socket.remoteAddress || "unknown-ip";
  const email = (req.body?.email || "").toString().trim().toLowerCase();
  const key = `${ip}:${email}`;
  const now = Date.now();

  const record = loginAttemptsStore.get(key);

  if (record) {
    if (now > record.resetTime) {
      // Window expired, reset counter
      loginAttemptsStore.delete(key);
    } else if (record.attempts >= MAX_ATTEMPTS) {
      const retryAfterSeconds = Math.ceil((record.resetTime - now) / 1000);
      res.setHeader("Retry-After", String(retryAfterSeconds));
      return res.status(429).json({
        error: "Too many failed login attempts. Please try again after 15 minutes.",
        code: "TOO_MANY_REQUESTS",
      });
    }
  }

  // Helper attached to res to record failed attempt if login fails
  const originalJson = res.json.bind(res);
  res.json = function (body: any) {
    if (res.statusCode === 401 && body?.code === "INVALID_CREDENTIALS") {
      const currentRecord = loginAttemptsStore.get(key);
      if (!currentRecord || now > currentRecord.resetTime) {
        loginAttemptsStore.set(key, {
          attempts: 1,
          resetTime: now + WINDOW_MS,
        });
      } else {
        currentRecord.attempts += 1;
      }
    } else if (res.statusCode === 200) {
      // Clear failed attempts on successful login
      loginAttemptsStore.delete(key);
    }
    return originalJson(body);
  };

  next();
}

export function clearRateLimitStore() {
  loginAttemptsStore.clear();
}
