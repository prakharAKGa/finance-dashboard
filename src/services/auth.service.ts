import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { mockDb, Role } from './mockDb';
import { config } from '../config';
import { ApiError } from '../utils/ApiError';

export class AuthService {
  async register(data: {
    name: string;
    email: string;
    password: string;
    role?: Role;
  }) {
    const existing = await mockDb.findUserByEmail(data.email);
    if (existing) throw ApiError.badRequest('Email already in use');

    const hashed = await bcrypt.hash(data.password, 12);
    const user = await mockDb.createUser({ ...data, password: hashed });

    const tokens = this.generateTokens(user.id, user.email, user.role);

    await mockDb.updateUser(user.id, { 
      refreshToken: await bcrypt.hash(tokens.refreshToken, 10) 
    });

    const { password: _, refreshToken: __, ...userData } = user;
    return { user: userData, ...tokens };
  }

  async login(email: string, password: string) {
    const user = await mockDb.findUserByEmail(email);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    if (!user.isActive) {
      throw ApiError.forbidden('Account is deactivated');
    }

    const tokens = this.generateTokens(user.id, user.email, user.role);

    await mockDb.updateUser(user.id, { 
      refreshToken: await bcrypt.hash(tokens.refreshToken, 10) 
    });

    const { password: _, refreshToken: __, ...userData } = user;
    return { user: userData, ...tokens };
  }

  async refreshTokens(token: string) {
    try {
      const decoded = jwt.verify(token, config.jwt.refreshSecret) as any;
      const user = await mockDb.findUserById(decoded.userId);

      if (!user?.refreshToken) throw new Error();

      const valid = await bcrypt.compare(token, user.refreshToken);
      if (!valid) throw new Error();

      const tokens = this.generateTokens(user.id, user.email, user.role);
      await mockDb.updateUser(user.id, { 
        refreshToken: await bcrypt.hash(tokens.refreshToken, 10) 
      });

      return tokens;
    } catch {
      throw ApiError.unauthorized('Invalid refresh token');
    }
  }

  async logout(userId: string) {
    await mockDb.updateUser(userId, { refreshToken: null });
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
