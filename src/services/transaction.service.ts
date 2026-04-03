import { mockDb, TransactionType } from './mockDb';
import { ApiError } from '../utils/ApiError';
import {
  getPaginationMeta,
  PaginationOptions,
} from '../utils/pagination';

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
  async create(data: {
    amount: number;
    type: TransactionType;
    category: string;
    description?: string;
    date: string;
    userId: string;
  }) {
    return mockDb.createTransaction({
      ...data,
      date: new Date(data.date)
    });
  }

  async findAll(filters: ListFilters) {
    const { page, limit } = filters;
    const { data, total } = await mockDb.queryTransactions(filters);

    return { 
      data, 
      pagination: getPaginationMeta(total, { page, limit }) 
    };
  }

  async findById(id: string, requestingUserId: string, isAdmin: boolean) {
    const tx = await mockDb.findTransactionById(id);

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
    const tx = await mockDb.findTransactionById(id);
    if (!tx) throw ApiError.notFound('Transaction not found');
    if (!isAdmin && tx.userId !== requestingUserId) throw ApiError.forbidden();

    const updateData: any = { ...data };
    if (data.date) updateData.date = new Date(data.date);

    return mockDb.updateTransaction(id, updateData);
  }

  async softDelete(id: string, requestingUserId: string, isAdmin: boolean) {
    const tx = await mockDb.findTransactionById(id);
    if (!tx) throw ApiError.notFound('Transaction not found');
    if (!isAdmin && tx.userId !== requestingUserId) throw ApiError.forbidden();

    return mockDb.deleteTransaction(id);
  }
}

export const transactionService = new TransactionService();
