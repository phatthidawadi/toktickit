import { Request, Response, NextFunction } from "express";
import { verifyToken, SESSION_COOKIE_NAME, TokenPayload } from "../utils/auth.js";

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export function authenticateSession(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.[SESSION_COOKIE_NAME];

  if (!token) {
    return res.status(401).json({
      error: "Authentication required. Session cookie missing.",
      code: "UNAUTHORIZED",
    });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({
      error: "Invalid or expired session cookie.",
      code: "UNAUTHORIZED",
    });
  }

  req.user = payload;
  next();
}

export function requireRole(allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: "Authentication required.",
        code: "UNAUTHORIZED",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: "Access denied. Insufficient privileges.",
        code: "FORBIDDEN",
      });
    }

    next();
  };
}
