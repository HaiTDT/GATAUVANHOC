import type { Role } from "@prisma/client";
import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload, type Secret } from "jsonwebtoken";

type AuthJwtPayload = JwtPayload & {
  sub: string;
  email: string;
  role: Role;
};

const getJwtSecret = (): Secret | null => process.env.JWT_SECRET ?? null;

const getBearerToken = (authorization?: string): string | null => {
  if (!authorization) {
    return null;
  }

  const [scheme, token] = authorization.split(" ");

  if (scheme !== "Bearer" || !token) {
    return null;
  }

  return token;
};

export const authenticateJwt = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = getBearerToken(req.headers.authorization);
  const jwtSecret = getJwtSecret();

  if (!token || !jwtSecret) {
    return res.status(401).json({
      message: "Unauthorized"
    });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as AuthJwtPayload;

    if (!decoded.sub || !decoded.email || !decoded.role) {
      return res.status(401).json({
        message: "Unauthorized"
      });
    }

    req.user = {
      id: decoded.sub,
      email: decoded.email,
      role: decoded.role
    };

    return next();
  } catch {
    return res.status(401).json({
      message: "Unauthorized"
    });
  }
};
