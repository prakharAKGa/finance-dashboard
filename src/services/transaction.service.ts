import { Prisma, TransactionType } from '@prisma/client';
import { ApiError } from '../utils/ApiError';
import {
    getPaginationMeta,
    PaginationOptions,
} from '../utils/pagination';
import { prisma } from './prisma';

interface ListFilters extends PaginationOptions {
  type?: TransactionType;
  category?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  sortBy: string;
  order: 'asc' | 'desc';
  userId?: string; 
}

export class TransactionService {
  private buildWhere(filters: ListFilters): Prisma.TransactionWhereInput {
    const where: Prisma.TransactionWhereInput = {
      deletedAt: null,
    };

    if (filters.userId) {
      where.userId = filters.userId;
    }
    if (filters.type) {
      where.type = filters.type;
    }
    if (filters.category) {
      where.category = { contains: filters.category, mode: 'insensitive' };
    }
    if (filters.search) {
      where.OR = [
        { category: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }
    if (filters.startDate || filters.endDate) {
      where.date = {};
      if (filters.startDate) {
        where.date.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.date.lte = new Date(filters.endDate);
      }
    }

    return where;
  }

  async create(data: {
    amount: number;
    type: TransactionType;
    category: string;
    description?: string;
    date: string;
    userId: string;
  }) {
    return prisma.transaction.create({
      data: {
        amount: data.amount,
        type: data.type,
        category: data.category,
        description: data.description ?? null,
        date: new Date(data.date),
        userId: data.userId,
      },
    });
  }

  async findAll(filters: ListFilters) {
    const { page, limit } = filters;

    const safePage = Number.isFinite(page) && page > 0 ? page : 1;
    const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.min(limit, 100) : 10;
    const where = this.buildWhere(filters);
    const sortBy: Prisma.TransactionOrderByWithRelationInput = {
      [filters.sortBy || 'date']: filters.order || 'desc',
    } as Prisma.TransactionOrderByWithRelationInput;

    const [data, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        orderBy: sortBy,
        skip: (safePage - 1) * safeLimit,
        take: safeLimit,
      }),
      prisma.transaction.count({ where }),
    ]);

    return { 
      data, 
      pagination: getPaginationMeta(total, { page: safePage, limit: safeLimit }) 
    };
  }

  async findById(id: string, requestingUserId: string, isAdmin: boolean) {
    const tx = await prisma.transaction.findFirst({
      where: { id, deletedAt: null },
    });

    if (!tx) throw ApiError.notFound('Transaction not found');
    if (!isAdmin && tx.userId !== requestingUserId) throw ApiError.forbidden();

    return tx;
  }

  async update(
    id: string,
    data: Partial<{ amount: number; type: TransactionType; category: string; description: string; date: string }>,
    requestingUserId: string,
    isAdmin: boolean
  ) {
    const tx = await prisma.transaction.findFirst({
      where: { id, deletedAt: null },
    });
    if (!tx) throw ApiError.notFound('Transaction not found');
    if (!isAdmin && tx.userId !== requestingUserId) throw ApiError.forbidden();

    const updateData: Prisma.TransactionUpdateInput = {
      amount: data.amount,
      type: data.type,
      category: data.category,
      description: data.description,
      ...(data.date ? { date: new Date(data.date) } : {}),
    };

    return prisma.transaction.update({
      where: { id },
      data: updateData,
    });
  }

  async softDelete(id: string, requestingUserId: string, isAdmin: boolean) {
    const tx = await prisma.transaction.findFirst({
      where: { id, deletedAt: null },
    });
    if (!tx) throw ApiError.notFound('Transaction not found');
    if (!isAdmin && tx.userId !== requestingUserId) throw ApiError.forbidden();

    await prisma.transaction.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return true;
  }

  async exportCsv(filters: ListFilters) {
    const where = this.buildWhere(filters);
    const data = await prisma.transaction.findMany({
      where,
      orderBy: { date: 'desc' },
    });

    const header = 'id,amount,type,category,description,date,userId,createdAt,updatedAt';
    const rows = data.map((tx) => {
      const escapedDescription = (tx.description ?? '').replace(/"/g, '""');
      const escapedCategory = tx.category.replace(/"/g, '""');
      return [
        tx.id,
        tx.amount,
        tx.type,
        `"${escapedCategory}"`,
        `"${escapedDescription}"`,
        tx.date.toISOString(),
        tx.userId,
        tx.createdAt.toISOString(),
        tx.updatedAt.toISOString(),
      ].join(',');
    });

    return [header, ...rows].join('\n');
  }

  async importBulk(
    transactions: Array<{
      amount: number;
      type: TransactionType;
      category: string;
      description?: string;
      date: string;
      userId?: string;
    }>,
    requestingUserId: string,
    isAdmin: boolean
  ) {
    const payload = transactions.map((tx) => ({
      amount: tx.amount,
      type: tx.type,
      category: tx.category,
      description: tx.description ?? null,
      date: new Date(tx.date),
      userId: isAdmin && tx.userId ? tx.userId : requestingUserId,
    }));

    const result = await prisma.transaction.createMany({
      data: payload,
    });

    return {
      importedCount: result.count,
    };
  }
}

export const transactionService = new TransactionService();
