import type { Request, Response, NextFunction } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { prisma } from "../lib/PrismaClient.js";

const ACCESS_SECRET = process.env.JWT_SECRET!;
const REFRESH_SECRET = process.env.REFRESH_TOKEN!;

export interface AuthRequest extends Request {
  user?: { userId: string; roles: string[] };
}

export const generateTokens = (userId: string, roles: string[]) => {
  const accessToken = jwt.sign({ userId, roles }, ACCESS_SECRET, { expiresIn: "15m" });
  const refreshToken = jwt.sign({ userId, roles }, REFRESH_SECRET, { expiresIn: "1d" });
  return { accessToken, refreshToken };
};

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const rawAuthHeader = req.headers.authorization;
  
  let accessToken: string | undefined;
  if (typeof rawAuthHeader === "string") {
    if (rawAuthHeader.startsWith("Bearer ")) {
      accessToken = rawAuthHeader.slice(7); // Remove "Bearer " prefix
    } else if (rawAuthHeader.trim()) {
      accessToken = rawAuthHeader.trim(); // Raw token without Bearer
    }
  }

  const refreshTokenHeader = req.headers["x-refresh-token"];

 
  if (accessToken) {
    try {
      const payload = jwt.verify(accessToken, ACCESS_SECRET) as { userId: string; roles: string[] };
      req.user = { userId: payload.userId, roles: payload.roles };
      return next();
    } catch (error) {
    }
  }

  if (!refreshTokenHeader || Array.isArray(refreshTokenHeader)) {
    return res.status(401).json({ message: "No valid access or refresh token provided" });
  }

  try {
    console.log("Verifying refresh token with secret:", process.env.REFRESH_TOKEN);
    const decoded = jwt.verify(refreshTokenHeader, REFRESH_SECRET) as JwtPayload;

    const payload = { userId: decoded.userId as string, roles: (decoded.roles as string[]) || [] };
    req.user = payload;

    return next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid refresh token" });
  }
};
