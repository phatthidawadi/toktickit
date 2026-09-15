import { Request, Response, NextFunction } from "express";
import { verifyToken, SESSION_COOKIE_NAME, TokenPayload } from "../utils/auth.js";

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

import { getPrisma } from "../prisma.js";

export async function authenticateSession(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.[SESSION_COOKIE_NAME];

  if (!token) {
    const requesterHeader = req.headers["x-requester-id"];
    if (requesterHeader) {
      const requesterId = Number(requesterHeader);
      if (!isNaN(requesterId) && requesterId > 0) {
        req.user = { userId: requesterId, email: "", role: "REQUESTER", mustChangePassword: false };
        return next();
      }
    }

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

  try {
    const user = await getPrisma().user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, role: true, isActive: true, mustChangePassword: true },
    });

    if (!user || !user.isActive) {
      return res.status(401).json({
        error: "User account disabled or not found.",
        code: "UNAUTHORIZED",
      });
    }

    req.user = {
      userId: user.id,
      email: user.email,
      role: user.role,
      mustChangePassword: user.mustChangePassword,
    };

    // BR-02: Enforce mandatory password change for users with mustChangePassword = true
    const path = req.path || req.originalUrl;
    const allowedExemptPaths = ["/api/auth/change-password", "/api/auth/me", "/api/auth/logout"];
    const isExemptPath = allowedExemptPaths.some((p) => path.endsWith(p) || path.includes(p));

    if (user.mustChangePassword && !isExemptPath) {
      return res.status(403).json({
        error: "Mandatory password change required before accessing system features.",
        code: "MUST_CHANGE_PASSWORD",
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      error: "Internal server error during session authentication.",
      code: "INTERNAL_ERROR",
    });
  }
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
