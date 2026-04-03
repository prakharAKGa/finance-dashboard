import { Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { ApiError } from '../utils/ApiError';
import { prisma } from './prisma';

export class AuthService {
  async register(data: {
    name: string;
    email: string;
    password: string;
    role?: Role;
  }) {
    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existing) throw ApiError.badRequest('Email already in use');

    const hashed = await bcrypt.hash(data.password, 12);
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashed,
        role: data.role ?? Role.VIEWER,
      },
    });

    const tokens = this.generateTokens(user.id, user.email, user.role);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        refreshToken: await bcrypt.hash(tokens.refreshToken, 10),
      },
    });

    const { password: _, refreshToken: __, ...userData } = user;
    return { user: userData, ...tokens };
  }

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    if (!user.isActive) {
      throw ApiError.forbidden('Account is deactivated');
    }

    const tokens = this.generateTokens(user.id, user.email, user.role);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        refreshToken: await bcrypt.hash(tokens.refreshToken, 10),
      },
    });

    const { password: _, refreshToken: __, ...userData } = user;
    return { user: userData, ...tokens };
  }

  async refreshTokens(token: string) {
    try {
      const decoded = jwt.verify(token, config.jwt.refreshSecret) as {
        userId: string;
      };
      const user = await prisma.user.findUnique({ where: { id: decoded.userId } });

      if (!user?.refreshToken) throw new Error();

      const valid = await bcrypt.compare(token, user.refreshToken);
      if (!valid) throw new Error();

      const tokens = this.generateTokens(user.id, user.email, user.role);
      await prisma.user.update({
        where: { id: user.id },
        data: {
          refreshToken: await bcrypt.hash(tokens.refreshToken, 10),
        },
      });

      return tokens;
    } catch {
      throw ApiError.unauthorized('Invalid refresh token');
    }
  }

  async logout(userId: string) {
    await prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
  }

  private generateTokens(userId: string, email: string, role: Role) {
    const accessToken = jwt.sign(
      { userId, email, role },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn as any }
    );
    const refreshToken = jwt.sign(
      { userId },
      config.jwt.refreshSecret,
      { expiresIn: config.jwt.refreshExpiresIn as any }
    );
    return { accessToken, refreshToken };
  }
}

export const authService = new AuthService();
