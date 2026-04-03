import { mockDb, Role } from './mockDb';
import { ApiError } from '../utils/ApiError';

export class UserService {
  async findAll() {
    return mockDb.getAllUsers();
  }

  async update(id: string, data: { name?: string; role?: Role; isActive?: boolean }) {
    const user = await mockDb.findUserById(id);
    if (!user) throw ApiError.notFound('User not found');

    const updated = await mockDb.updateUser(id, data);
    const { password: _, refreshToken: __, ...userData } = updated!;
    return userData;
  }

  async softDelete(id: string) {
    const user = await mockDb.findUserById(id);
    if (!user) throw ApiError.notFound('User not found');

    return mockDb.updateUser(id, { deletedAt: new Date() });
  }
}

export const userService = new UserService();
