import { Role } from '@prisma/client';
import { ApiError } from '../utils/ApiError';
import { prisma } from './prisma';

export class UserService {
  async findAll() {
    return prisma.user.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: string, data: { name?: string; role?: Role; isActive?: boolean }) {
    const user = await prisma.user.findFirst({
      where: { id, deletedAt: null },
    });
    if (!user) throw ApiError.notFound('User not found');

    return prisma.user.update({
      where: { id },
      data: {
        name: data.name,
        role: data.role,
        isActive: data.isActive,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
      },
    });
  }

  async softDelete(id: string) {
    const user = await prisma.user.findFirst({
      where: { id, deletedAt: null },
    });
    if (!user) throw ApiError.notFound('User not found');

    return prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
      select: {
        id: true,
      },
    });
  }
}

export const userService = new UserService();
