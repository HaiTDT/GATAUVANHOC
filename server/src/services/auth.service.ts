import { Prisma } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt, { type Secret, type SignOptions } from "jsonwebtoken";
import { prisma } from "../lib/prisma";

const SALT_ROUNDS = 10;

const userSelect = {
  id: true,
  email: true,
  fullName: true,
  phone: true,
  role: true,
  createdAt: true,
  updatedAt: true
} satisfies Prisma.UserSelect;

export type AuthUser = Prisma.UserGetPayload<{ select: typeof userSelect }>;

type AuthResponse = {
  user: AuthUser;
  token: string;
};

type RegisterInput = {
  email: string;
  password: string;
  fullName?: string;
  phone?: string;
};

type LoginInput = {
  email: string;
  password: string;
};

export class AuthError extends Error {
  constructor(
    message: string,
    public readonly statusCode = 400
  ) {
    super(message);
  }
}

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const getJwtSecret = (): Secret => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new AuthError("JWT_SECRET is not configured", 500);
  }

  return secret;
};

const getJwtExpiresIn = (): SignOptions["expiresIn"] =>
  (process.env.JWT_EXPIRES_IN ?? "7d") as SignOptions["expiresIn"];

const createToken = (user: AuthUser, secret = getJwtSecret()): string => {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role
    },
    secret,
    {
      expiresIn: getJwtExpiresIn()
    }
  );
};

export const authService = {
  async register(input: RegisterInput): Promise<AuthResponse> {
    const email = normalizeEmail(input.email);
    const jwtSecret = getJwtSecret();

    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true }
    });

    if (existingUser) {
      throw new AuthError("Email already registered", 409);
    }

    const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        fullName: input.fullName,
        phone: input.phone
      },
      select: userSelect
    });

    return {
      user,
      token: createToken(user, jwtSecret)
    };
  },

  async login(input: LoginInput): Promise<AuthResponse> {
    const email = normalizeEmail(input.email);

    const userWithPassword = await prisma.user.findUnique({
      where: { email }
    });

    if (!userWithPassword) {
      throw new AuthError("Invalid email or password", 401);
    }

    const isPasswordValid = await bcrypt.compare(
      input.password,
      userWithPassword.passwordHash
    );

    if (!isPasswordValid) {
      throw new AuthError("Invalid email or password", 401);
    }

    const { passwordHash: _passwordHash, ...user } = userWithPassword;

    return {
      user,
      token: createToken(user)
    };
  }
};
