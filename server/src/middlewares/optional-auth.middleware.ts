import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload, type Secret } from "jsonwebtoken";
import { prisma } from "../lib/prisma";

type AuthJwtPayload = JwtPayload & {
  sub: string;
  email: string;
  role: string;
};

const getJwtSecret = (): Secret | null => process.env.JWT_SECRET ?? null;

export const optionalAuthenticateJwt = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next();
  }

  const token = authHeader.split(" ")[1];
  const jwtSecret = getJwtSecret();

  if (!token || !jwtSecret) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as AuthJwtPayload;

    if (!decoded.sub || !decoded.email || !decoded.role) {
      return next();
    }
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
      select: { id: true, email: true, role: true }
    });
    
    if (user) {
      req.user = {
        id: user.id,
        email: user.email,
        role: user.role as any
      };
    }
  } catch (e) {
    // Token invalid, just proceed as guest
  }

  return next();
};
